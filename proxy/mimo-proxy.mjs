#!/usr/bin/env node
import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { createProxy } from '../lib/create-proxy.mjs'
import { rewriteMiMo } from '../lib/mimo-rewrite.mjs'

/**
 * Supported model scope for this proxy:
 * - Validated with the MiMo V2.6 chat model IDs.
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

Starts a local HTTP proxy that preserves MiMo V2.6 thinking when the request
history includes reasoning_content, and falls back to thinking: { type: "disabled" }
when a tool loop has missing reasoning history.

Environment variables:
  MIMO_PROXY_PORT              Local listen port. Default: 3459 (falls back to PORT)
  MIMO_UPSTREAM_URL            Upstream MiMo chat-completions URL.
                               Default: https://api.xiaomimimo.com/v1/chat/completions
  MIMO_PROXY_DISABLE_THINKING_WITH_TOOLS
                               Enable the tool-loop fallback that injects thinking:
                               { type: "disabled" } for incomplete reasoning history.
                               Default: 1
  MIMO_PROXY_LOG               Path to the redacted NDJSON log file.

Suggested VS Code model URL:
  http://127.0.0.1:3459/v1/chat/completions
`)
  process.exit(0)
}

// ---- Create and start ----

const { start } = createProxy({
  upstreamUrl,
  port,
  logPath,
  label: 'mimo-proxy',
  healthCheckExtras: {
    disableThinkingWithTools,
    preserveV26ThinkingWithReasoningContent: true
  },
  rewriteRequest: (payload) =>
    rewriteMiMo(payload, { disableThinkingWithTools }),
  startupMessages: (_port, _upstreamUrl) => [
    `[mimo-proxy] listening on http://127.0.0.1:${_port}/v1/chat/completions`,
    `[mimo-proxy] forwarding to ${_upstreamUrl}`,
    `[mimo-proxy] disable thinking with tools=${disableThinkingWithTools}`,
    `[mimo-proxy] writing redacted request summaries to ${logPath}`
  ]
})

start()
