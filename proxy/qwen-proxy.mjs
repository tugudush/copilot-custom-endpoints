#!/usr/bin/env node
import { fileURLToPath } from 'node:url'
import { createProxy } from '../lib/create-proxy.mjs'

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

function rewriteQwen(payload) {
  const hasTools = Array.isArray(payload.tools) && payload.tools.length > 0
  const incomingEnableThinking = payload.enable_thinking

  if (disableThinkingWithTools && hasTools) {
    // Tool-enabled request: suppress thinking to avoid reasoning_content issues
    payload.enable_thinking = false
  } else {
    // Plain chat: remove enable_thinking so the model uses its default (true)
    delete payload.enable_thinking
  }

  const rewrittenEnableThinking =
    disableThinkingWithTools && hasTools ? false : undefined

  const summary = summarizePayload(payload, hasTools, {
    incomingEnableThinking,
    rewrittenEnableThinking
  })

  const consoleMsg = `tools=${String(hasTools)} enable_thinking=${String(incomingEnableThinking)} -> ${
    hasTools && disableThinkingWithTools ? 'false' : '<deleted>'
  }, model=${payload.model ?? '?'}`

  return { summary, consoleMsg }
}

// ---- Create and start ----

const { start } = createProxy({
  upstreamUrl,
  port,
  logPath,
  label: 'qwen-proxy',
  healthCheckExtras: { disableThinkingWithTools },
  rewriteRequest: rewriteQwen,
  startupMessages: (_port, _upstreamUrl) => [
    `[qwen-proxy] listening on http://127.0.0.1:${_port}/v1/chat/completions`,
    `[qwen-proxy] forwarding to ${_upstreamUrl}`,
    `[qwen-proxy] disable thinking with tools=${disableThinkingWithTools}`,
    `[qwen-proxy] writing redacted request summaries to ${logPath}`
  ]
})

start()
