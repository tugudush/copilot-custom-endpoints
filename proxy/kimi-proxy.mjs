import { createServer } from 'node:http'
import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

/**
 * Supported model scope for this proxy:
 * - Validated in this repo with `kimi-k2.6`.
 * - Expected to work for `kimi-k2.5`, because Kimi documents the same fixed
 *   sampling and thinking behavior for `kimi-k2.6` / `kimi-k2.5`.
 * - Not intended for `moonshot-v1` models or non-Kimi providers, because this
 *   proxy rewrites requests to K2-family-specific values:
 *   - thinking mode temperature = 1.0
 *   - non-thinking mode temperature = 0.6
 *   - top_p = 0.95
 *   - tool-enabled requests force `thinking: { type: 'disabled' }`
 */
const upstreamUrl =
  process.env.KIMI_UPSTREAM_URL ?? 'https://api.moonshot.ai/v1/chat/completions'
const port = Number.parseInt(process.env.PORT ?? '3457', 10)
const forcedTemperature = Number(
  process.env.KIMI_PROXY_FORCE_TEMPERATURE ?? '1'
)
const forcedNonThinkingTemperature = Number(
  process.env.KIMI_PROXY_FORCE_NON_THINKING_TEMPERATURE ?? '0.6'
)
const forcedTopP = Number(process.env.KIMI_PROXY_FORCE_TOP_P ?? '0.95')
const disableThinkingWithTools =
  (process.env.KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS ?? '1') !== '0'
const defaultLogPath = fileURLToPath(
  new URL('../debug_log/kimi-proxy.ndjson', import.meta.url)
)
const logPath = process.env.KIMI_PROXY_LOG ?? defaultLogPath

if (process.argv.includes('--help')) {
  console.log(`Kimi proxy

Starts a local HTTP proxy that rewrites the outbound chat-completions request body to use Kimi-compatible sampling values.

Environment variables:
  PORT                         Local listen port. Default: 3457
  KIMI_UPSTREAM_URL            Upstream Moonshot chat-completions URL.
                               Default: https://api.moonshot.ai/v1/chat/completions
  KIMI_PROXY_FORCE_TEMPERATURE Temperature to force into the request body. Default: 1
  KIMI_PROXY_FORCE_NON_THINKING_TEMPERATURE
                               Temperature to force when thinking is disabled. Default: 0.6
  KIMI_PROXY_FORCE_TOP_P       top_p to force into the request body. Default: 0.95
  KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS
                               Force thinking={"type":"disabled"} when tools are present.
                               Default: 1
  KIMI_PROXY_LOG               Path to the redacted NDJSON log file.

Suggested VS Code model URL:
  http://127.0.0.1:3457/v1/chat/completions
`)
  process.exit(0)
}

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${process.env.PORT ?? ''}`)
}

if (!Number.isFinite(forcedTemperature)) {
  throw new Error(
    `Invalid KIMI_PROXY_FORCE_TEMPERATURE: ${process.env.KIMI_PROXY_FORCE_TEMPERATURE ?? ''}`
  )
}

if (!Number.isFinite(forcedNonThinkingTemperature)) {
  throw new Error(
    `Invalid KIMI_PROXY_FORCE_NON_THINKING_TEMPERATURE: ${process.env.KIMI_PROXY_FORCE_NON_THINKING_TEMPERATURE ?? ''}`
  )
}

if (!Number.isFinite(forcedTopP)) {
  throw new Error(
    `Invalid KIMI_PROXY_FORCE_TOP_P: ${process.env.KIMI_PROXY_FORCE_TOP_P ?? ''}`
  )
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

function summarizePayload(
  payload,
  incomingTemperature,
  incomingTopP,
  rewrittenTemperature
) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const tools = Array.isArray(payload.tools) ? payload.tools : []
  const incomingThinkingType = payload.__incomingThinkingType
  const rewrittenThinkingType = payload.thinking?.type

  return {
    model: payload.model,
    stream: payload.stream,
    incomingTemperature,
    rewrittenTemperature,
    incomingTopP,
    rewrittenTopP: forcedTopP,
    incomingThinkingType,
    rewrittenThinkingType,
    maxTokens:
      payload.max_tokens ??
      payload.max_completion_tokens ??
      payload.max_output_tokens,
    toolChoice: payload.tool_choice,
    toolCount: tools.length,
    hasTools: tools.length > 0,
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
        forcedTemperature,
        forcedTopP
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

  const incomingTemperature = payload.temperature
  const incomingTopP = payload.top_p
  const incomingThinkingType = payload?.thinking?.type
  const hasTools = Array.isArray(payload.tools) && payload.tools.length > 0
  const useNonThinkingMode = disableThinkingWithTools && hasTools
  const rewrittenTemperature = useNonThinkingMode
    ? forcedNonThinkingTemperature
    : forcedTemperature

  payload.__incomingThinkingType = incomingThinkingType
  payload.temperature = rewrittenTemperature
  payload.top_p = forcedTopP

  if (useNonThinkingMode) {
    payload.thinking = { type: 'disabled' }
  }

  await appendLog({
    timestamp: startedAt,
    type: 'request',
    path: request.url,
    headers: redactHeaders(request.headers),
    summary: summarizePayload(
      payload,
      incomingTemperature,
      incomingTopP,
      rewrittenTemperature
    ),
    originalTemperature: incomingTemperature,
    originalTopP: incomingTopP
  })

  console.log(
    `[kimi-proxy] ${request.method} ${request.url} temperature ${String(incomingTemperature)} -> ${String(rewrittenTemperature)}, top_p ${String(incomingTopP)} -> ${String(forcedTopP)}, thinking ${String(incomingThinkingType)} -> ${String(payload.thinking?.type)}`
  )

  delete payload.__incomingThinkingType

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
    `[kimi-proxy] listening on http://127.0.0.1:${port}/v1/chat/completions`
  )
  console.log(`[kimi-proxy] forwarding to ${upstreamUrl}`)
  console.log(
    `[kimi-proxy] forcing temperature=${forcedTemperature}, non-thinking temperature=${forcedNonThinkingTemperature}, and top_p=${forcedTopP}`
  )
  console.log(
    `[kimi-proxy] disable thinking with tools=${disableThinkingWithTools}`
  )
  console.log(`[kimi-proxy] writing redacted request summaries to ${logPath}`)
})
