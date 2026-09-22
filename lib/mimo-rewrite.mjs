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

export function hasMissingReasoningContent(messages) {
  return messages.some((message) => {
    if (
      message?.role !== 'assistant' ||
      !Array.isArray(message.tool_calls) ||
      message.tool_calls.length === 0
    ) {
      return false
    }

    return (
      typeof message.reasoning_content !== 'string' ||
      message.reasoning_content.trim().length === 0
    )
  })
}

export function rewriteMiMo(payload, { disableThinkingWithTools = true } = {}) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const hasToolRole = messages.some((message) => message?.role === 'tool')
  const hasToolsArray = Array.isArray(payload.tools) && payload.tools.length > 0
  const toolChoice = payload.tool_choice
  const hasActiveToolCall =
    hasToolRole ||
    hasToolsArray ||
    (toolChoice !== undefined && toolChoice !== 'none' && toolChoice !== null)
  const hasTools = hasActiveToolCall
  const model = String(payload.model ?? '').toLowerCase()
  const isV26 = model.startsWith('mimo-v2.6')
  const incomingThinkingType = payload?.thinking?.type
  const missingReasoningContent = isV26 && hasMissingReasoningContent(messages)
  const shouldDisableThinking =
    disableThinkingWithTools && hasTools && (!isV26 || missingReasoningContent)

  if (shouldDisableThinking) {
    payload.thinking = { type: 'disabled' }
  } else if (!hasTools) {
    delete payload.thinking
  }

  const rewrittenThinkingType = payload?.thinking?.type
  const thinkingAction = shouldDisableThinking
    ? '"disabled"'
    : hasTools
      ? '<preserved>'
      : '<deleted>'

  return {
    summary: summarizePayload(payload, hasTools, {
      isV26,
      missingReasoningContent,
      incomingThinkingType,
      rewrittenThinkingType
    }),
    consoleMsg: `[${hasTools ? 'tools' : 'chat'}] thinking.type=${String(
      incomingThinkingType
    )} -> ${thinkingAction}, model=${payload.model ?? '?'}`
  }
}
