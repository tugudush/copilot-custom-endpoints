#!/usr/bin/env node
import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { createProxy } from '../lib/create-proxy.mjs'

/**
 * Supported model scope for this proxy:
 * - Validated with `mimo-v2.5-pro`, `mimo-v2.5`, and `mimo-v2-flash`.
 * - Expected to work for any MiMo model that supports the `thinking` object
 *   with a `type` field on the OpenAI-compatible surface.
 * - Not intended for non-MiMo providers, because the rewrite assumes
 *   MiMo's `thinking.type` behavior.
 */
const upstreamUrl =
  process.env.MIMO_UPSTREAM_URL ??
  'https://api.xiaomimimo.com/v1/chat/completions'
const port = Number.parseInt(
  process.env.MIMO_PROXY_PORT ?? process.env.PORT ?? '3459',
  10
)
const disableThinkingWithTools =
  (process.env.MIMO_PROXY_DISABLE_THINKING_WITH_TOOLS ?? '1') !== '0'
const defaultLogPath = fileURLToPath(
  new URL('../debug_log/mimo-proxy.ndjson', import.meta.url)
)
const logPath = process.env.MIMO_PROXY_LOG ?? defaultLogPath

if (process.argv.includes('--help')) {
  console.log(`MiMo proxy

Starts a local HTTP proxy that conditionally injects thinking: { type: "disabled" }
when the request includes a tools array, letting MiMo models show reasoning in
plain chat while keeping tool loops stable.

Environment variables:
  MIMO_PROXY_PORT              Local listen port. Default: 3459 (falls back to PORT)
  MIMO_UPSTREAM_URL            Upstream MiMo chat-completions URL.
                               Default: https://api.xiaomimimo.com/v1/chat/completions
  MIMO_PROXY_DISABLE_THINKING_WITH_TOOLS
                               Inject thinking: { type: "disabled" } when tools are present.
                               Default: 1
  MIMO_PROXY_LOG               Path to the redacted NDJSON log file.

Suggested VS Code model URL:
  http://127.0.0.1:3459/v1/chat/completions
`)
  process.exit(0)
}

// ---- Provider-specific rewrite logic ----

function summarizePayload(payload, hasTools, rewriteInfo) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const tools = Array.isArray(payload.tools) ? payload.tools : []

  return {
    model: payload.model,
    stream: payload.stream,
    hasTools,
    toolCount: tools.length,
    toolChoice: payload.tool_choice,
    ...rewriteInfo,
    maxTokens:
      payload.max_tokens ??
      payload.max_completion_tokens ??
      payload.max_output_tokens,
    messageCount: messages.length,
    messageRoles: messages.map((message) => message?.role).slice(0, 16),
    topLevelKeys: Object.keys(payload).sort()
  }
}

function rewriteMiMo(payload) {
  // Determine if a tool is actually being invoked:
  // - tool_choice is set and not "none"
  // - OR there is a "tool" role message in the conversation
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const hasToolRole = messages.some((message) => message?.role === 'tool')
  const toolChoice = payload.tool_choice
  const hasActiveToolCall =
    hasToolRole ||
    (toolChoice !== undefined && toolChoice !== 'none' && toolChoice !== null)
  const hasTools = hasActiveToolCall
  const incomingThinkingType = payload?.thinking?.type

  if (disableThinkingWithTools && hasTools) {
    // Tool-enabled request: suppress thinking to avoid reasoning_content issues
    payload.thinking = { type: 'disabled' }
  } else {
    // Plain chat: remove thinking so the model uses its default (enabled for V2.5 models)
    delete payload.thinking
  }

  const rewrittenThinkingType =
    disableThinkingWithTools && hasTools ? 'disabled' : undefined

  const summary = summarizePayload(payload, hasTools, {
    incomingThinkingType,
    rewrittenThinkingType
  })

  const modeTag = hasTools ? '[tools]' : '[chat]'
  const consoleMsg = `${modeTag} thinking.type=${String(incomingThinkingType)} -> ${
    hasTools && disableThinkingWithTools ? '"disabled"' : '<deleted>'
  }, model=${payload.model ?? '?'}`

  return { summary, consoleMsg }
}

// ---- Create and start ----

const { start } = createProxy({
  upstreamUrl,
  port,
  logPath,
  label: 'mimo-proxy',
  healthCheckExtras: { disableThinkingWithTools },
  rewriteRequest: rewriteMiMo,
  startupMessages: (_port, _upstreamUrl) => [
    `[mimo-proxy] listening on http://127.0.0.1:${_port}/v1/chat/completions`,
    `[mimo-proxy] forwarding to ${_upstreamUrl}`,
    `[mimo-proxy] disable thinking with tools=${disableThinkingWithTools}`,
    `[mimo-proxy] writing redacted request summaries to ${logPath}`
  ]
})

start()
