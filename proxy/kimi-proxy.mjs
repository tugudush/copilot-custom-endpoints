#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { createProxy } from '../lib/create-proxy.mjs'

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

// ---- Provider-specific rewrite logic ----

function summarizePayload(payload, hasTools, rewriteInfo) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const tools = Array.isArray(payload.tools) ? payload.tools : []

  return {
    model: payload.model,
    stream: payload.stream,
    ...rewriteInfo,
    maxTokens:
      payload.max_tokens ??
      payload.max_completion_tokens ??
      payload.max_output_tokens,
    toolChoice: payload.tool_choice,
    toolCount: tools.length,
    hasTools,
    messageCount: messages.length,
    messageRoles: messages.map((message) => message?.role).slice(0, 16),
    topLevelKeys: Object.keys(payload).sort()
  }
}

function rewriteKimi(payload) {
  const incomingTemperature = payload.temperature
  const incomingTopP = payload.top_p
  const incomingThinkingType = payload?.thinking?.type
  const hasTools = Array.isArray(payload.tools) && payload.tools.length > 0
  const useNonThinkingMode = disableThinkingWithTools && hasTools
  const rewrittenTemperature = useNonThinkingMode
    ? forcedNonThinkingTemperature
    : forcedTemperature

  // Capture incoming state before mutation
  payload.__incomingThinkingType = incomingThinkingType

  // Apply rewrites
  payload.temperature = rewrittenTemperature
  payload.top_p = forcedTopP

  if (useNonThinkingMode) {
    payload.thinking = { type: 'disabled' }
  }

  const rewrittenThinkingType = payload.thinking?.type
  const rewriteInfo = {
    incomingTemperature,
    rewrittenTemperature,
    incomingTopP,
    rewrittenTopP: forcedTopP,
    incomingThinkingType,
    rewrittenThinkingType
  }

  const summary = summarizePayload(payload, hasTools, rewriteInfo)

  const consoleMsg = `temperature ${String(incomingTemperature)} -> ${String(rewrittenTemperature)}, top_p ${String(incomingTopP)} -> ${String(forcedTopP)}, thinking ${String(incomingThinkingType)} -> ${String(rewrittenThinkingType)}`

  // Clean up internal key before forwarding
  delete payload.__incomingThinkingType

  return { summary, consoleMsg }
}

// ---- Create and start ----

const { start } = createProxy({
  upstreamUrl,
  port,
  logPath,
  label: 'kimi-proxy',
  healthCheckExtras: { forcedTemperature, forcedTopP },
  rewriteRequest: rewriteKimi,
  startupMessages: (_port, _upstreamUrl) => [
    `[kimi-proxy] listening on http://127.0.0.1:${_port}/v1/chat/completions`,
    `[kimi-proxy] forwarding to ${_upstreamUrl}`,
    `[kimi-proxy] forcing temperature=${forcedTemperature}, non-thinking temperature=${forcedNonThinkingTemperature}, and top_p=${forcedTopP}`,
    `[kimi-proxy] disable thinking with tools=${disableThinkingWithTools}`,
    `[kimi-proxy] writing redacted request summaries to ${logPath}`
  ]
})

start()
