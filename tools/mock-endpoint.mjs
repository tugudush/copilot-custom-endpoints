#!/usr/bin/env node
import 'dotenv/config'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { appendLog, readRequestBody } from '../lib/shared.mjs'

/**
 * Loopback Chat Completions endpoint used to observe what VS Code actually
 * sends. It never forwards traffic to a provider and never records message
 * content, reasoning text, or headers — only the sanitized summary produced
 * by summarizeRequest().
 *
 * Usage:
 *   node tools/mock-endpoint.mjs
 *   MOCK_PORT=3490 MOCK_LOG=debug_log/mock-endpoint.ndjson node tools/mock-endpoint.mjs
 */

const port = Number.parseInt(process.env.MOCK_PORT ?? '3490', 10)
const logPath =
  process.env.MOCK_LOG ??
  fileURLToPath(new URL('../debug_log/mock-endpoint.ndjson', import.meta.url))

if (process.argv.includes('--help')) {
  console.log(`Mock chat-completions endpoint

Starts a local OpenAI-compatible server that answers with synthetic streaming
responses and records a sanitized summary of each request.

Environment variables:
  MOCK_PORT   Local listen port. Default: 3490
  MOCK_LOG    Sanitized NDJSON capture path. Default: debug_log/mock-endpoint.ndjson

Endpoints:
  POST /v1/chat/completions   Synthetic chat/tool-call responses
  GET  /captured              Sanitized summaries captured so far (max 100)
  GET  /healthz               Readiness probe
`)
  process.exit(0)
}

if (!Number.isInteger(port) || port < 0) {
  throw new Error(`Invalid MOCK_PORT: ${process.env.MOCK_PORT ?? ''}`)
}

const captured = []

const ALLOWED_FIELDS = [
  'temperature',
  'top_p',
  'top_k',
  'max_tokens',
  'max_completion_tokens',
  'max_output_tokens',
  'tool_choice',
  'reasoning_effort',
  'enable_thinking',
  'reasoning_split',
  'preserve_thinking',
  'parallel_tool_calls'
]

function summarizeRequest(payload) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const fields = {}

  for (const name of ALLOWED_FIELDS) {
    if (Object.hasOwn(payload, name)) {
      fields[name] = payload[name]
    }
  }

  return {
    timestamp: new Date().toISOString(),
    model: payload.model,
    stream: payload.stream === true,
    fields,
    thinkingType: payload?.thinking?.type ?? null,
    toolCount: Array.isArray(payload.tools) ? payload.tools.length : 0,
    toolNames: (Array.isArray(payload.tools) ? payload.tools : [])
      .map((tool) => tool?.function?.name ?? tool?.name)
      .slice(0, 5),
    messageRoles: messages.map((message) => message?.role),
    assistantToolCallMessages: messages.filter(
      (message) =>
        message?.role === 'assistant' &&
        Array.isArray(message.tool_calls) &&
        message.tool_calls.length > 0
    ).length,
    assistantReasoningContentMessages: messages.filter(
      (message) =>
        typeof message?.reasoning_content === 'string' &&
        message.reasoning_content.trim().length > 0
    ).length,
    assistantReasoningMessages: messages.filter(
      (message) =>
        typeof message?.reasoning === 'string' &&
        message.reasoning.trim().length > 0
    ).length,
    topLevelKeys: Object.keys(payload).sort()
  }
}

function wantsToolCall(payload) {
  const tools = Array.isArray(payload.tools) ? payload.tools : []
  if (tools.length === 0) {
    return false
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : []
  return !messages.some((message) => message?.role === 'tool')
}

function firstToolName(payload) {
  const tools = Array.isArray(payload.tools) ? payload.tools : []
  const tool = tools[0]
  return tool?.function?.name ?? tool?.name ?? 'mock_tool'
}

function sseChunk(body) {
  return `data: ${JSON.stringify(body)}\n\n`
}

function streamReply(response, payload) {
  response.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive'
  })

  const base = {
    id: 'chatcmpl-mock',
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: payload.model ?? 'mock'
  }

  response.write(
    sseChunk({
      ...base,
      choices: [{ index: 0, delta: { role: 'assistant' }, finish_reason: null }]
    })
  )

  if (wantsToolCall(payload)) {
    response.write(
      sseChunk({
        ...base,
        choices: [
          {
            index: 0,
            delta: {
              tool_calls: [
                {
                  index: 0,
                  id: 'call_mock_1',
                  type: 'function',
                  function: { name: firstToolName(payload), arguments: '{}' }
                }
              ]
            },
            finish_reason: null
          }
        ]
      })
    )
    response.write(
      sseChunk({
        ...base,
        choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }]
      })
    )
  } else {
    response.write(
      sseChunk({
        ...base,
        choices: [
          { index: 0, delta: { content: 'Mock reply.' }, finish_reason: null }
        ]
      })
    )
    response.write(
      sseChunk({
        ...base,
        choices: [{ index: 0, delta: {}, finish_reason: 'stop' }]
      })
    )
  }

  response.end('data: [DONE]\n\n')
}

function jsonReply(response, payload) {
  const toolCall = wantsToolCall(payload)
  const message = toolCall
    ? {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'call_mock_1',
            type: 'function',
            function: { name: firstToolName(payload), arguments: '{}' }
          }
        ]
      }
    : { role: 'assistant', content: 'Mock reply.' }

  response.writeHead(200, { 'content-type': 'application/json' })
  response.end(
    JSON.stringify({
      id: 'chatcmpl-mock',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: payload.model ?? 'mock',
      choices: [
        { index: 0, message, finish_reason: toolCall ? 'tool_calls' : 'stop' }
      ]
    })
  )
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/healthz') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ ok: true, port, captured: captured.length }))
    return
  }

  if (request.method === 'GET' && request.url === '/captured') {
    response.writeHead(200, { 'content-type': 'application/json' })
    response.end(JSON.stringify(captured))
    return
  }

  if (request.method !== 'POST') {
    response.writeHead(404, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Not found' }))
    return
  }

  let payload

  try {
    payload = JSON.parse(await readRequestBody(request))
  } catch {
    response.writeHead(400, { 'content-type': 'application/json' })
    response.end(JSON.stringify({ error: 'Expected JSON request body' }))
    return
  }

  const summary = summarizeRequest(payload)
  captured.push(summary)
  if (captured.length > 100) {
    captured.shift()
  }

  await appendLog({ type: 'request', ...summary }, logPath)
  console.log(
    `[mock-endpoint] ${payload.model ?? '?'} stream=${summary.stream} tools=${summary.toolCount} toolChoice=${String(summary.fields.tool_choice)} roles=${summary.messageRoles.join(',')}`
  )

  if (payload.stream === true) {
    streamReply(response, payload)
    return
  }

  jsonReply(response, payload)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`[mock-endpoint] listening on http://127.0.0.1:${port}`)
  console.log(`[mock-endpoint] sanitized captures -> ${logPath}`)
  console.log(
    `[mock-endpoint] inspect with: curl http://127.0.0.1:${port}/captured`
  )
})
