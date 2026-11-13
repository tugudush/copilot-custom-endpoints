/**
 * Build the NDJSON log summary shared by the provider rewrites.
 * Keep this shape stable — it is the documented debug_log contract.
 */
export function summarizePayload(payload, hasTools, rewriteInfo) {
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

/**
 * A request counts as tool activity when a "tool" role message is present or
 * `tool_choice` is set to anything other than "none"/null. A nonempty `tools`
 * array alone is not enough — see docs/models/qwen.md.
 */
export function hasActiveToolCall(payload) {
  const messages = Array.isArray(payload.messages) ? payload.messages : []
  const hasToolRole = messages.some((message) => message?.role === 'tool')
  const toolChoice = payload.tool_choice

  return (
    hasToolRole ||
    (toolChoice !== undefined && toolChoice !== 'none' && toolChoice !== null)
  )
}
