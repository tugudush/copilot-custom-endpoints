import { hasActiveToolCall, summarizePayload } from './rewrite-summary.mjs'

export const KIMI_REWRITE_DEFAULTS = {
  forcedTemperature: 1,
  forcedNonThinkingTemperature: 0.6,
  forcedTopP: 0.95,
  disableThinkingWithTools: true
}

/**
 * Rewrite a Moonshot/Kimi chat-completions payload in place.
 *
 * K2.7 and K3 are always-thinking and reject `thinking: disabled`, so the
 * thinking-disable rewrite is skipped for them. K3 uses `reasoning_effort`
 * instead of `thinking` and rejects the `thinking` parameter entirely.
 *
 * @returns {{ summary: object, consoleMsg: string }}
 */
export function rewriteKimi(payload, options = {}) {
  const {
    forcedTemperature,
    forcedNonThinkingTemperature,
    forcedTopP,
    disableThinkingWithTools
  } = { ...KIMI_REWRITE_DEFAULTS, ...options }

  const incomingTemperature = payload.temperature
  const incomingTopP = payload.top_p
  const incomingThinkingType = payload?.thinking?.type
  const incomingReasoningEffort = payload?.reasoning_effort
  const model = payload.model ?? ''

  const isK27 = model.startsWith('kimi-k2.7')
  const isK3 = model.startsWith('kimi-k3')
  const isAlwaysThinking = isK27 || isK3

  const hasTools = hasActiveToolCall(payload)
  const useNonThinkingMode =
    !isAlwaysThinking && disableThinkingWithTools && hasTools
  const rewrittenTemperature = useNonThinkingMode
    ? forcedNonThinkingTemperature
    : forcedTemperature

  payload.temperature = rewrittenTemperature
  payload.top_p = forcedTopP

  if (useNonThinkingMode) {
    payload.thinking = { type: 'disabled' }
  }

  // K3 does not accept `thinking` — delete it if present so it doesn't cause a 400
  if (isK3 && payload.thinking) {
    delete payload.thinking
  }

  const rewriteInfo = {
    model,
    isK27,
    isK3,
    incomingTemperature,
    rewrittenTemperature,
    incomingTopP,
    rewrittenTopP: forcedTopP,
    incomingThinkingType,
    rewrittenThinkingType: payload.thinking?.type,
    incomingReasoningEffort
  }

  const modeTag = hasTools ? '[tools]' : '[chat]'
  const k27Tag = isK27 ? '[k2.7]' : ''
  const k3Tag = isK3 ? '[k3]' : ''
  const consoleMsg = `${k27Tag}${k3Tag}${modeTag} temperature ${String(incomingTemperature)} -> ${String(rewrittenTemperature)}, top_p ${String(incomingTopP)} -> ${String(forcedTopP)}, thinking ${String(incomingThinkingType)} -> ${String(payload.thinking?.type)}, reasoning_effort ${String(incomingReasoningEffort)}`

  return {
    summary: summarizePayload(payload, hasTools, rewriteInfo),
    consoleMsg
  }
}
