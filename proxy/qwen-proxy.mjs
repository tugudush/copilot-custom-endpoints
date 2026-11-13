#!/usr/bin/env node
import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { createProxy } from '../lib/create-proxy.mjs'
import { rewriteQwen } from '../lib/qwen-rewrite.mjs'

/**
 * Supported model scope for this proxy:
 * - Validated with `qwen3.8-max`.
 * - The rewrite can also be used with OpenRouter model IDs such as
 *   `qwen/qwen3.8-max-0902`; the proxy forwards model IDs unchanged. That route
 *   is not part of the validated DashScope setup.
 * - Expected to work for any Qwen3 hybrid-thinking model (qwen3-* series)
 *   that supports the `enable_thinking` top-level field on DashScope's
 *   OpenAI-compatible surface.
 * - Not intended for non-Qwen providers, because the rewrite assumes
 *   DashScope's `enable_thinking` behavior (no nested `thinking` object).
 */
const upstreamUrl =
  process.env.QWEN_UPSTREAM_URL ??
  'https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions'
const port = Number.parseInt(
  process.env.QWEN_PROXY_PORT ?? process.env.PORT ?? '3458',
  10
)
const disableThinkingWithTools =
  (process.env.QWEN_PROXY_DISABLE_THINKING_WITH_TOOLS ?? '1') !== '0'
const defaultLogPath = fileURLToPath(
  new URL('../debug_log/qwen-proxy.ndjson', import.meta.url)
)
const logPath = process.env.QWEN_PROXY_LOG ?? defaultLogPath

if (process.argv.includes('--help')) {
  console.log(`Qwen proxy

Starts a local HTTP proxy that conditionally injects enable_thinking: false
when the request shows tool activity (a tool-role message or a non-default
tool_choice), letting Qwen hybrid-thinking models show reasoning in plain
chat while keeping tool loops stable.

The proxy forwards the requested model ID unchanged, including the DashScope
ID qwen3.8-max and OpenRouter ID qwen/qwen3.8-max-0902.

Environment variables:
  QWEN_PROXY_PORT              Local listen port. Default: 3458 (falls back to PORT)
  QWEN_UPSTREAM_URL            Upstream chat-completions URL (OpenAI-compatible path).
                               Recommended: your workspace-dedicated endpoint, e.g.
                               https://<workspace-id>.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions
                               OpenRouter can be selected for snapshot IDs.
                               Default (legacy shared domain): https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions
  QWEN_PROXY_DISABLE_THINKING_WITH_TOOLS
                               Inject enable_thinking: false when tools are present.
                               Default: 1
  QWEN_PROXY_LOG               Path to the redacted NDJSON log file.

Suggested VS Code model URL:
  http://127.0.0.1:3458/v1/chat/completions
`)
  process.exit(0)
}

// ---- Create and start ----

const { start } = createProxy({
  upstreamUrl,
  port,
  logPath,
  label: 'qwen-proxy',
  healthCheckExtras: { disableThinkingWithTools },
  rewriteRequest: (payload) =>
    rewriteQwen(payload, { disableThinkingWithTools }),
  startupMessages: (_port, _upstreamUrl) => [
    `[qwen-proxy] listening on http://127.0.0.1:${_port}/v1/chat/completions`,
    `[qwen-proxy] forwarding to ${_upstreamUrl}`,
    `[qwen-proxy] disable thinking with tools=${disableThinkingWithTools}`,
    `[qwen-proxy] writing redacted request summaries to ${logPath}`
  ]
})

start()
