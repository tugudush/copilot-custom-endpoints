import { hasActiveToolCall, summarizePayload } from './rewrite-summary.mjs'

export const QWEN_REWRITE_DEFAULTS = {
  disableThinkingWithTools: true
}

/**
 * Rewrite a DashScope/Qwen chat-completions payload in place.
 *
 * Thinking stays on for plain chat (the field is removed so DashScope uses its
 * default) and is suppressed only for detected tool activity. When thinking is
 * suppressed, `reasoning_effort` is dropped: DashScope rejects any non-"none"
 * effort alongside `enable_thinking: false` (HTTP 400, measured 2026-11-23),
 * and `enable_thinking: false` alone already disables thinking.
 *
 * @returns {{ summary: object, consoleMsg: string }}
 */
export function rewriteQwen(payload, options = {}) {
  const { disableThinkingWithTools } = {
    ...QWEN_REWRITE_DEFAULTS,
    ...options
  }

  const hasTools = hasActiveToolCall(payload)
  const incomingEnableThinking = payload.enable_thinking
  const incomingReasoningEffort = payload.reasoning_effort
  const suppressThinking = disableThinkingWithTools && hasTools

  if (suppressThinking) {
    payload.enable_thinking = false
    delete payload.reasoning_effort
  } else {
    delete payload.enable_thinking
  }

  const rewriteInfo = {
    incomingEnableThinking,
    rewrittenEnableThinking: suppressThinking ? false : undefined,
    incomingReasoningEffort,
    rewrittenReasoningEffort: suppressThinking
      ? undefined
      : incomingReasoningEffort
  }

  const modeTag = hasTools ? '[tools]' : '[chat]'
  const effortMsg =
    suppressThinking && incomingReasoningEffort !== undefined
      ? `, reasoning_effort=${String(incomingReasoningEffort)} -> <deleted>`
      : ''
  const consoleMsg = `${modeTag} enable_thinking=${String(incomingEnableThinking)} -> ${
    suppressThinking ? 'false' : '<deleted>'
  }${effortMsg}, model=${payload.model ?? '?'}`

  return {
    summary: summarizePayload(payload, hasTools, rewriteInfo),
    consoleMsg
  }
}
