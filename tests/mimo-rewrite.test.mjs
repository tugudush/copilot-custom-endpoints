import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  hasMissingReasoningContent,
  rewriteMiMo
} from '../lib/mimo-rewrite.mjs'

describe('MiMo request rewrite', () => {
  it('detects missing reasoning content on assistant tool calls', () => {
    assert.equal(
      hasMissingReasoningContent([
        {
          role: 'assistant',
          tool_calls: [{ id: 'call-1', type: 'function' }]
        }
      ]),
      true
    )
    assert.equal(
      hasMissingReasoningContent([
        {
          role: 'assistant',
          reasoning_content: 'Planning the tool call.',
          tool_calls: [{ id: 'call-1', type: 'function' }]
        }
      ]),
      false
    )
  })

  it('overrides explicit thinking when reasoning history is missing', () => {
    const payload = {
      model: 'mimo-v2.6-pro',
      messages: [
        { role: 'user', content: 'Search' },
        {
          role: 'assistant',
          tool_calls: [{ id: 'call-1', type: 'function' }]
        }
      ],
      tools: [{ type: 'function', function: { name: 'search' } }],
      thinking: { type: 'enabled' }
    }

    const result = rewriteMiMo(payload)

    assert.deepEqual(payload.thinking, { type: 'disabled' })
    assert.equal(result.summary.missingReasoningContent, true)
  })

  it('preserves V2.6 thinking when tool history includes reasoning content', () => {
    const payload = {
      model: 'mimo-v2.6-pro',
      messages: [
        {
          role: 'assistant',
          reasoning_content: 'Planning the tool call.',
          tool_calls: [{ id: 'call-1', type: 'function' }]
        },
        { role: 'tool', tool_call_id: 'call-1', content: 'result' }
      ],
      tool_choice: 'auto'
    }

    const result = rewriteMiMo(payload)

    assert.equal(Object.hasOwn(payload, 'thinking'), false)
    assert.equal(result.summary.missingReasoningContent, false)
    assert.equal(result.summary.rewrittenThinkingType, undefined)
  })

  it('falls back to disabled thinking for V2.6 when history is incomplete', () => {
    const payload = {
      model: 'mimo-v2.6-flash',
      messages: [
        {
          role: 'assistant',
          tool_calls: [{ id: 'call-1', type: 'function' }]
        },
        { role: 'tool', tool_call_id: 'call-1', content: 'result' }
      ],
      tool_choice: 'auto'
    }

    const result = rewriteMiMo(payload)

    assert.deepEqual(payload.thinking, { type: 'disabled' })
    assert.equal(result.summary.missingReasoningContent, true)
  })

  it('removes explicit thinking from plain V2.6 chat', () => {
    const payload = {
      model: 'mimo-v2.6-pro',
      messages: [{ role: 'user', content: 'Hello' }],
      thinking: { type: 'disabled' }
    }

    rewriteMiMo(payload)

    assert.equal(Object.hasOwn(payload, 'thinking'), false)
  })
})
