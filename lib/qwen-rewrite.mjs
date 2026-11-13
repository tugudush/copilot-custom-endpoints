import { hasActiveToolCall, summarizePayload } from './rewrite-summary.mjs'

export const QWEN_REWRITE_DEFAULTS = {
  disableThinkingWithTools: true
}

/**
 * Rewrite a DashScope/Qwen chat-completions payload in place.
 *
 * Thinking stays on for plain chat (the field is removed so DashScope uses its
 * default) and is suppressed only for detected tool activity.
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
  const suppressThinking = disableThinkingWithTools && hasTools

  if (suppressThinking) {
    payload.enable_thinking = false
  } else {
    delete payload.enable_thinking
  }

  const rewriteInfo = {
    incomingEnableThinking,
    rewrittenEnableThinking: suppressThinking ? false : undefined
  }

  const modeTag = hasTools ? '[tools]' : '[chat]'
  const consoleMsg = `${modeTag} enable_thinking=${String(incomingEnableThinking)} -> ${
    suppressThinking ? 'false' : '<deleted>'
  }, model=${payload.model ?? '?'}`

  return {
    summary: summarizePayload(payload, hasTools, rewriteInfo),
    consoleMsg
  }
}
