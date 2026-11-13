#!/usr/bin/env node
import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { createProxy } from '../lib/create-proxy.mjs'
import { rewriteKimi } from '../lib/kimi-rewrite.mjs'

/**
 * Supported model scope for this proxy:
 * - Validated in this repo with `kimi-k2.6`.
 * - Expected to work for `kimi-k2.5`, because Kimi documents the same fixed
 *   sampling and thinking behavior for `kimi-k2.6` / `kimi-k2.5`.
 * - Validated in this repo with `kimi-k2.7-code` (June 14, 2026). K2.7 is
 *   always-thinking and rejects `thinking: { type: 'disabled' }`. The proxy
 *   detects K2.7 and skips the thinking-disable rewrite while keeping
 *   temperature/top_p enforcement.
 * - Validated in this repo with `kimi-k3` (July 17, 2026). K3 is always-thinking
 *   and uses `reasoning_effort` (NOT the K2.x `thinking` parameter). The proxy
 *   detects K3 and skips the thinking-disable rewrite while keeping
 *   temperature/top_p enforcement. It does NOT inject a `thinking` block —
 *   K3 rejects it.
 * - Not intended for `moonshot-v1` models or non-Kimi providers, because this
 *   proxy rewrites requests to K2/K3-family-specific values:
 *   - thinking mode temperature = 1.0
 *   - non-thinking mode temperature = 0.6 (K2.5/K2.6 only)
 *   - top_p = 0.95
 *   - tool-enabled requests force `thinking: { type: 'disabled' }` (K2.5/K2.6 only)
 */
const upstreamUrl =
  process.env.KIMI_UPSTREAM_URL ?? 'https://api.moonshot.ai/v1/chat/completions'
const port = Number.parseInt(
  process.env.KIMI_PROXY_PORT ?? process.env.PORT ?? '3457',
  10
)
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
  KIMI_PROXY_PORT              Local listen port. Default: 3457 (falls back to PORT)
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

// ---- Create and start ----

const { start } = createProxy({
  upstreamUrl,
  port,
  logPath,
  label: 'kimi-proxy',
  healthCheckExtras: { forcedTemperature, forcedTopP },
  rewriteRequest: (payload) =>
    rewriteKimi(payload, {
      forcedTemperature,
      forcedNonThinkingTemperature,
      forcedTopP,
      disableThinkingWithTools
    }),
  startupMessages: (_port, _upstreamUrl) => [
    `[kimi-proxy] listening on http://127.0.0.1:${_port}/v1/chat/completions`,
    `[kimi-proxy] forwarding to ${_upstreamUrl}`,
    `[kimi-proxy] forcing temperature=${forcedTemperature}, non-thinking temperature=${forcedNonThinkingTemperature}, and top_p=${forcedTopP}`,
    `[kimi-proxy] disable thinking with tools=${disableThinkingWithTools}`,
    `[kimi-proxy] writing redacted request summaries to ${logPath}`
  ]
})

start()
