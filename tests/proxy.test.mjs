import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createProxy } from '../lib/create-proxy.mjs'
import { rewriteKimi } from '../lib/kimi-rewrite.mjs'
import { rewriteQwen } from '../lib/qwen-rewrite.mjs'
import { rewriteMiMo } from '../lib/mimo-rewrite.mjs'
import { mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'

// ---- Helpers ----

function tmpLogPath(label) {
  const dir = join(
    tmpdir(),
    'copilot-proxy-test',
    randomBytes(4).toString('hex')
  )
  mkdirSync(dir, { recursive: true })
  return { dir, path: join(dir, `${label}.ndjson`) }
}

/**
 * Start a mock upstream server that echoes back the request body and headers
 * so we can inspect what the proxy forwarded.
 */
function createMockUpstream() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      const chunks = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => {
        const body = Buffer.concat(chunks).toString('utf8')
        res.writeHead(200, {
          'content-type': 'application/json',
          'x-mock-request-id': 'mock-123'
        })
        res.end(
          JSON.stringify({
            receivedBody: JSON.parse(body),
            receivedHeaders: req.headers
          })
        )
      })
    })
    server.listen(0, '127.0.0.1', () => {
      resolve(server)
    })
  })
}

function proxyRequest(port, body) {
  return fetch(`http://127.0.0.1:${port}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer test-key-123',
      'x-request-id': 'test-req-1'
    },
    body: JSON.stringify(body)
  })
}

/**
 * Start the real proxy pipeline (createProxy + the production rewrite) against
 * a mock upstream. Tests therefore exercise production code, not a copy.
 */
async function startProxy({ rewriteRequest, healthCheckExtras, label }) {
  const mockUpstream = await createMockUpstream()
  const mockAddr = mockUpstream.address()
  const { dir, path: logPath } = tmpLogPath(label)

  const { server } = createProxy({
    upstreamUrl: `http://127.0.0.1:${mockAddr.port}/v1/chat/completions`,
    port: 0,
    logPath,
    label,
    healthCheckExtras,
    rewriteRequest,
    startupMessages: () => []
  })

  server.listen(0, '127.0.0.1')
  await new Promise((resolve) => server.once('listening', resolve))

  return {
    mockUpstream,
    server,
    logDir: dir,
    port: server.address().port
  }
}

function stopProxy({ mockUpstream, server, logDir }) {
  server?.close()
  mockUpstream?.close()
  // Allow pending log writes to flush before cleanup
  setTimeout(() => {
    try {
      if (logDir) rmSync(logDir, { recursive: true, force: true })
    } catch {
      /* ok */
    }
  }, 200)
}

async function postJson(port, body) {
  const res = await proxyRequest(port, body)
  assert.equal(res.status, 200)
  return (await res.json()).receivedBody
}

const TOOLS = [{ type: 'function', function: { name: 'search' } }]

// ---- Kimi proxy tests ----

describe('Kimi proxy rewrite logic', () => {
  const forcedTemperature = 1
  const forcedNonThinkingTemperature = 0.6
  const forcedTopP = 0.95

  /** @type {ReturnType<typeof startProxy> extends Promise<infer T> ? T : never} */
  let harness

  before(async () => {
    harness = await startProxy({
      label: 'kimi-test',
      healthCheckExtras: { forcedTemperature, forcedTopP },
      rewriteRequest: (payload) =>
        rewriteKimi(payload, {
          forcedTemperature,
          forcedNonThinkingTemperature,
          forcedTopP,
          disableThinkingWithTools: true
        })
    })
  })

  after(() => stopProxy(harness))

  it('health check returns ok', async () => {
    const res = await fetch(`http://127.0.0.1:${harness.port}/healthz`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.ok, true)
    assert.equal(body.forcedTemperature, forcedTemperature)
  })

  it('plain chat: forces temperature and top_p', async () => {
    const received = await postJson(harness.port, {
      model: 'kimi-k2.6',
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.1,
      top_p: 0.5,
      stream: false
    })

    assert.equal(received.temperature, forcedTemperature)
    assert.equal(received.top_p, forcedTopP)
    assert.equal(received.thinking, undefined)
  })

  it('tool_choice auto: forces non-thinking temperature and disables thinking', async () => {
    const received = await postJson(harness.port, {
      model: 'kimi-k2.6',
      messages: [{ role: 'user', content: 'Search' }],
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.1,
      top_p: 0.5,
      stream: false
    })

    assert.equal(received.temperature, forcedNonThinkingTemperature)
    assert.equal(received.top_p, forcedTopP)
    assert.deepEqual(received.thinking, { type: 'disabled' })
  })

  it('tool-role history alone counts as tool activity', async () => {
    const received = await postJson(harness.port, {
      model: 'kimi-k2.6',
      messages: [
        { role: 'assistant', tool_calls: [{ id: 'c1', type: 'function' }] },
        { role: 'tool', tool_call_id: 'c1', content: 'result' }
      ],
      stream: false
    })

    assert.equal(received.temperature, forcedNonThinkingTemperature)
    assert.deepEqual(received.thinking, { type: 'disabled' })
  })

  it('tools array without tool_choice is treated as plain chat', async () => {
    const received = await postJson(harness.port, {
      model: 'kimi-k2.6',
      messages: [{ role: 'user', content: 'Search' }],
      tools: TOOLS,
      temperature: 0.1,
      stream: false
    })

    assert.equal(received.temperature, forcedTemperature)
    assert.equal(received.thinking, undefined)
  })

  it('tool_choice none is treated as plain chat', async () => {
    const received = await postJson(harness.port, {
      model: 'kimi-k2.6',
      messages: [{ role: 'user', content: 'Search' }],
      tools: TOOLS,
      tool_choice: 'none',
      stream: false
    })

    assert.equal(received.temperature, forcedTemperature)
    assert.equal(received.thinking, undefined)
  })

  it('K2.7 tool chat: keeps thinking enabled and uses thinking temperature', async () => {
    const received = await postJson(harness.port, {
      model: 'kimi-k2.7-code',
      messages: [{ role: 'user', content: 'Search' }],
      tools: TOOLS,
      tool_choice: 'auto',
      temperature: 0.1,
      stream: false
    })

    // K2.7 rejects thinking: disabled
    assert.equal(received.temperature, forcedTemperature)
    assert.equal(received.thinking, undefined)
  })

  it('K3 tool chat: removes an incoming thinking block', async () => {
    const received = await postJson(harness.port, {
      model: 'kimi-k3.1-pro',
      messages: [{ role: 'user', content: 'Search' }],
      tools: TOOLS,
      tool_choice: 'auto',
      thinking: { type: 'disabled' },
      stream: false
    })

    assert.equal(received.temperature, forcedTemperature)
    assert.equal(received.top_p, forcedTopP)
    assert.equal(Object.hasOwn(received, 'thinking'), false)
  })

  it('returns 404 for non-POST methods', async () => {
    const res = await fetch(
      `http://127.0.0.1:${harness.port}/v1/chat/completions`,
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: '{}'
      }
    )
    assert.equal(res.status, 404)
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await fetch(
      `http://127.0.0.1:${harness.port}/v1/chat/completions`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not-json'
      }
    )
    assert.equal(res.status, 400)
    const data = await res.json()
    assert.equal(data.error, 'Expected JSON request body')
  })
})

// ---- Qwen proxy tests ----

describe('Qwen proxy rewrite logic', () => {
  let harness

  before(async () => {
    harness = await startProxy({
      label: 'qwen-test',
      healthCheckExtras: { disableThinkingWithTools: true },
      rewriteRequest: (payload) =>
        rewriteQwen(payload, { disableThinkingWithTools: true })
    })
  })

  after(() => stopProxy(harness))

  it('health check returns ok', async () => {
    const res = await fetch(`http://127.0.0.1:${harness.port}/healthz`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.ok, true)
    assert.equal(body.disableThinkingWithTools, true)
  })

  it('plain chat: deletes enable_thinking (model defaults to true)', async () => {
    const received = await postJson(harness.port, {
      model: 'qwen3.8-max',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false
    })

    assert.equal(Object.hasOwn(received, 'enable_thinking'), false)
  })

  it('forwards Qwen snapshot model IDs unchanged', async () => {
    const received = await postJson(harness.port, {
      model: 'qwen/qwen3.8-max-0902',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false
    })

    assert.equal(received.model, 'qwen/qwen3.8-max-0902')
    assert.equal(Object.hasOwn(received, 'enable_thinking'), false)
  })

  it('tools array without tool_choice keeps default thinking (first-turn gap)', async () => {
    const received = await postJson(harness.port, {
      model: 'qwen3.8-max',
      messages: [{ role: 'user', content: 'Search' }],
      tools: TOOLS,
      enable_thinking: true,
      stream: false
    })

    assert.equal(Object.hasOwn(received, 'enable_thinking'), false)
  })

  it('tool_choice auto: sets enable_thinking to false', async () => {
    const received = await postJson(harness.port, {
      model: 'qwen3.8-max',
      messages: [{ role: 'user', content: 'Search' }],
      tools: TOOLS,
      tool_choice: 'auto',
      enable_thinking: true,
      stream: false
    })

    assert.equal(received.enable_thinking, false)
  })

  it('tool_choice none: deletes enable_thinking', async () => {
    const received = await postJson(harness.port, {
      model: 'qwen3.8-max',
      messages: [{ role: 'user', content: 'Hello' }],
      tools: TOOLS,
      tool_choice: 'none',
      enable_thinking: true,
      stream: false
    })

    assert.equal(Object.hasOwn(received, 'enable_thinking'), false)
  })

  it('tool-role history: sets enable_thinking to false', async () => {
    const received = await postJson(harness.port, {
      model: 'qwen3.8-max',
      messages: [
        { role: 'assistant', tool_calls: [{ id: 'c1', type: 'function' }] },
        { role: 'tool', tool_call_id: 'c1', content: 'result' }
      ],
      stream: false
    })

    assert.equal(received.enable_thinking, false)
  })

  it('returns 404 for non-POST methods', async () => {
    const res = await fetch(
      `http://127.0.0.1:${harness.port}/v1/chat/completions`,
      {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: '{}'
      }
    )
    assert.equal(res.status, 404)
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await fetch(
      `http://127.0.0.1:${harness.port}/v1/chat/completions`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{broken'
      }
    )
    assert.equal(res.status, 400)
  })
})

// ---- MiMo proxy tests ----

describe('MiMo proxy rewrite logic', () => {
  let harness

  before(async () => {
    harness = await startProxy({
      label: 'mimo-test',
      healthCheckExtras: { disableThinkingWithTools: true },
      rewriteRequest: (payload) =>
        rewriteMiMo(payload, { disableThinkingWithTools: true })
    })
  })

  after(() => stopProxy(harness))

  it('health check returns ok', async () => {
    const res = await fetch(`http://127.0.0.1:${harness.port}/healthz`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.ok, true)
    assert.equal(body.disableThinkingWithTools, true)
  })

  it('plain chat: deletes thinking', async () => {
    const received = await postJson(harness.port, {
      model: 'mimo-v2.6-pro',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false
    })

    assert.equal(Object.hasOwn(received, 'thinking'), false)
  })

  it('tool chat with incomplete reasoning history: disables thinking', async () => {
    const received = await postJson(harness.port, {
      model: 'mimo-v2.6-pro',
      messages: [
        { role: 'assistant', tool_calls: [{ id: 'c1', type: 'function' }] },
        { role: 'tool', tool_call_id: 'c1', content: 'result' }
      ],
      thinking: { type: 'enabled' },
      stream: false
    })

    assert.deepEqual(received.thinking, { type: 'disabled' })
  })

  it('tools array without tool-call history: preserves thinking', async () => {
    const received = await postJson(harness.port, {
      model: 'mimo-v2.6-pro',
      messages: [{ role: 'user', content: 'Search' }],
      tools: TOOLS,
      thinking: { type: 'enabled' },
      stream: false
    })

    assert.deepEqual(received.thinking, { type: 'enabled' })
  })

  it('tool chat with reasoning history: preserves thinking', async () => {
    const received = await postJson(harness.port, {
      model: 'mimo-v2.6-pro',
      messages: [
        {
          role: 'assistant',
          reasoning_content: 'Planning the tool call.',
          tool_calls: [{ id: 'c1', type: 'function' }]
        },
        { role: 'tool', tool_call_id: 'c1', content: 'result' }
      ],
      tool_choice: 'auto',
      stream: false
    })

    assert.equal(Object.hasOwn(received, 'thinking'), false)
  })

  it('returns 404 for non-POST methods', async () => {
    const res = await fetch(
      `http://127.0.0.1:${harness.port}/v1/chat/completions`,
      {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: '{}'
      }
    )
    assert.equal(res.status, 404)
  })

  it('returns 400 for invalid JSON', async () => {
    const res = await fetch(
      `http://127.0.0.1:${harness.port}/v1/chat/completions`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{broken'
      }
    )
    assert.equal(res.status, 400)
  })
})
