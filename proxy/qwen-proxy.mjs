import { createServer } from 'node:http'
import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

/**
 * Supported model scope for this proxy:
 * - Validated with `qwen3.6-plus` and `qwen3.7-max`.
 * - Expected to work for any Qwen3 hybrid-thinking model (qwen3-* series)
 *   that supports the `enable_thinking` top-level field on DashScope's
 *   OpenAI-compatible surface.
 * - Not intended for non-Qwen providers, because the rewrite assumes
 *   DashScope's `enable_thinking` behavior (no nested `thinking` object).
 */
const upstreamUrl =
  process.env.QWEN_UPSTREAM_URL ??
  'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
const port = Number.parseInt(process.env.PORT ?? '3458', 10)
const disableThinkingWithTools =
  (process.env.QWEN_PROXY_DISABLE_THINKING_WITH_TOOLS ?? '1') !== '0'
const defaultLogPath = fileURLToPath(
  new URL('../debug_log/qwen-proxy.ndjson', import.meta.url)
)
const logPath = process.env.QWEN_PROXY_LOG ?? defaultLogPath

if (process.argv.includes('--help')) {
  console.log(`Qwen proxy

Starts a local HTTP proxy that conditionally injects enable_thinking: false
when the request includes a tools array, letting Qwen hybrid-thinking models
show reasoning in plain chat while keeping tool loops stable.

Environment variables:
  PORT                         Local listen port. Default: 3458
  QWEN_UPSTREAM_URL            Upstream DashScope chat-completions URL.
                               Default: https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions
  QWEN_PROXY_DISABLE_THINKING_WITH_TOOLS
                               Inject enable_thinking: false when tools are present.
                               Default: 1
  QWEN_PROXY_LOG               Path to the redacted NDJSON log file.

Suggested VS Code model URL:
  http://127.0.0.1:3458/v1/chat/completions
`)
  process.exit(0)
}

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${process.env.PORT ?? ''}`)
}

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
])

function redactHeaders(headers) {
  const redacted = {}

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue
    }

    if (name.toLowerCase() === 'authorization') {
      redacted[name] = 'Bearer <redacted>'
      continue
    }

    if (name.toLowerCase() === 'x-api-key') {
      redacted[name] = '<redacted>'
      continue
    }

    redacted[name] = value
  }

  return redacted
}

function summarizePayload(payload, preRewriteEnableThinking) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const tools = Array.isArray(payload.tools) ? payload.tools : []

  return {
    model: payload.model,
    stream: payload.stream,
    hasTools: tools.length > 0,
    toolCount: tools.length,
    toolChoice: payload.tool_choice,
    incomingEnableThinking: preRewriteEnableThinking,
    rewrittenEnableThinking:
      disableThinkingWithTools && tools.length > 0
        ? false
        : undefined, // deleted
    maxTokens:
      payload.max_tokens ??
      payload.max_completion_tokens ??
      payload.max_output_tokens,
    messageCount: messages.length,
    messageRoles: messages.map((message) => message?.role).slice(0, 16),
    topLevelKeys: Object.keys(payload).sort()
  }
}

async function appendLog(entry) {
  await mkdir(dirname(logPath), { recursive: true })
  await appendFile(logPath, `${JSON.stringify(entry)}\n`, 'utf8')
}

async function readRequestBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks).toString('utf8')
}

function buildForwardHeaders(headers) {
  const forwardHeaders = new Headers()

  for (const [name, value] of Object.entries(headers)) {
    const lowerName = name.toLowerCase()

    if (
      value === undefined ||
      lowerName === 'host' ||
      lowerName === 'content-length' ||
      hopByHopHeaders.has(lowerName)
    ) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        forwardHeaders.append(name, item)
      }
      continue
    }

    forwardHeaders.set(name, value)
  }

  forwardHeaders.set('content-type', 'application/json')

  return forwardHeaders
}

function buildResponseHeaders(headers) {
  const responseHeaders = {}

  for (const [name, value] of headers.entries()) {
    if (hopByHopHeaders.has(name.toLowerCase())) {
      continue
    }

    responseHeaders[name] = value
  }

  return responseHeaders
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(
      JSON.stringify({
        ok: true,
        upstreamUrl,
        port,
        disableThinkingWithTools
      })
    )
    return
  }

  if (request.method !== 'POST') {
    response.writeHead(404, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  const startedAt = new Date().toISOString()
  let requestBody

  try {
    requestBody = await readRequestBody(request)
  } catch (error) {
    response.writeHead(400, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Unable to read request body' }))

    await appendLog({
      timestamp: startedAt,
      type: 'read-error',
      path: request.url,
      error: error instanceof Error ? error.message : String(error)
    })
    return
  }

  let payload

  try {
    payload = JSON.parse(requestBody)
  } catch {
    response.writeHead(400, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Expected JSON request body' }))

    await appendLog({
      timestamp: startedAt,
      type: 'invalid-json',
      path: request.url,
      headers: redactHeaders(request.headers)
    })
    return
  }

  // ---- Rewrite logic ----
  const hasTools = Array.isArray(payload.tools) && payload.tools.length > 0
  const incomingEnableThinking = payload.enable_thinking

  if (disableThinkingWithTools && hasTools) {
    // Tool-enabled request: suppress thinking to avoid reasoning_content issues
    payload.enable_thinking = false
  } else {
    // Plain chat: remove enable_thinking so the model uses its default (true)
    delete payload.enable_thinking
  }

  await appendLog({
    timestamp: startedAt,
    type: 'request',
    path: request.url,
    headers: redactHeaders(request.headers),
    summary: summarizePayload(payload, incomingEnableThinking),
    incomingEnableThinking
  })

  console.log(
    `[qwen-proxy] ${request.method} ${request.url} tools=${String(hasTools)} enable_thinking=${String(incomingEnableThinking)} -> ${
      hasTools && disableThinkingWithTools ? 'false' : '<deleted>'
    }, model=${payload.model ?? '?'}`
  )

  try {
    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: buildForwardHeaders(request.headers),
      body: JSON.stringify(payload)
    })

    await appendLog({
      timestamp: new Date().toISOString(),
      type: 'response',
      path: request.url,
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      contentType: upstreamResponse.headers.get('content-type'),
      upstreamRequestId:
        upstreamResponse.headers.get('x-request-id') ??
        upstreamResponse.headers.get('request-id')
    })

    response.writeHead(
      upstreamResponse.status,
      buildResponseHeaders(upstreamResponse.headers)
    )

    if (!upstreamResponse.body) {
      response.end()
      return
    }

    Readable.fromWeb(upstreamResponse.body).pipe(response)
  } catch (error) {
    response.writeHead(502, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Upstream request failed' }))

    await appendLog({
      timestamp: new Date().toISOString(),
      type: 'upstream-error',
      path: request.url,
      error: error instanceof Error ? error.message : String(error)
    })
  }
})

server.listen(port, '127.0.0.1', () => {
  console.log(
    `[qwen-proxy] listening on http://127.0.0.1:${port}/v1/chat/completions`
  )
  console.log(`[qwen-proxy] forwarding to ${upstreamUrl}`)
  console.log(
    `[qwen-proxy] disable thinking with tools=${disableThinkingWithTools}`
  )
  console.log(`[qwen-proxy] writing redacted request summaries to ${logPath}`)
})
