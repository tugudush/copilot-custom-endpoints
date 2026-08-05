import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createProxy } from '../lib/create-proxy.mjs'
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

// ---- Kimi proxy tests ----

describe('Kimi proxy rewrite logic', () => {
  /** @type {import('node:http').Server} */
  let mockUpstream
  /** @type {import('node:http').Server} */
  let proxyServer
  let proxyPort
  let logDir

  const forcedTemperature = 1
  const forcedNonThinkingTemperature = 0.6
  const forcedTopP = 0.95

  before(async () => {
    mockUpstream = await createMockUpstream()
    const mockAddr = mockUpstream.address()
    const mockUrl = `http://127.0.0.1:${mockAddr.port}/v1/chat/completions`

    const { dir, path: logPath } = tmpLogPath('kimi-test')
    logDir = dir

    const { server } = createProxy({
      upstreamUrl: mockUrl,
      port: 0,
      logPath,
      label: 'kimi-test',
      healthCheckExtras: { forcedTemperature, forcedTopP },
      rewriteRequest(payload) {
        const incomingTemperature = payload.temperature
        const incomingTopP = payload.top_p
        const incomingThinkingType = payload?.thinking?.type
        const model = payload.model ?? ''
        const isK27 = model.startsWith('kimi-k2.7')
        const hasTools =
          Array.isArray(payload.tools) && payload.tools.length > 0
        const useNonThinkingMode = !isK27 && hasTools
        const rewrittenTemperature = useNonThinkingMode
          ? forcedNonThinkingTemperature
          : forcedTemperature

        payload.__incomingThinkingType = incomingThinkingType
        payload.temperature = rewrittenTemperature
        payload.top_p = forcedTopP

        if (useNonThinkingMode) {
          payload.thinking = { type: 'disabled' }
        }

        const rewrittenThinkingType = payload.thinking?.type
        const consoleMsg = `temperature ${incomingTemperature} -> ${rewrittenTemperature}, top_p ${incomingTopP} -> ${forcedTopP}`

        delete payload.__incomingThinkingType

        return {
          summary: {
            model: payload.model,
            isK27,
            hasTools,
            incomingTemperature,
            rewrittenTemperature,
            incomingTopP,
            rewrittenTopP: forcedTopP,
            incomingThinkingType,
            rewrittenThinkingType
          },
          consoleMsg
        }
      },
      startupMessages: () => []
    })

    proxyServer = server
    proxyServer.listen(0, '127.0.0.1', () => {
      proxyPort = proxyServer.address().port
    })

    // Wait for server to be ready
    await new Promise((resolve) => proxyServer.once('listening', resolve))
  })

  after(() => {
    proxyServer?.close()
    mockUpstream?.close()
    // Allow pending log writes to flush before cleanup
    setTimeout(() => {
      try {
        if (logDir) rmSync(logDir, { recursive: true, force: true })
      } catch {
        /* ok */
      }
    }, 200)
  })

  it('health check returns ok', async () => {
    const res = await fetch(`http://127.0.0.1:${proxyPort}/healthz`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.ok, true)
    assert.equal(body.forcedTemperature, forcedTemperature)
  })

  it('rewrites plain chat: forces temperature and top_p', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'kimi-k2.6',
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.1,
      top_p: 0.5,
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    assert.equal(received.temperature, forcedTemperature)
    assert.equal(received.top_p, forcedTopP)
    assert.equal(received.thinking, undefined)
  })

  it('rewrites tool-enabled chat: forces non-thinking temperature and disables thinking', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'kimi-k2.6',
      messages: [{ role: 'user', content: 'Search' }],
      tools: [{ type: 'function', function: { name: 'search' } }],
      temperature: 0.1,
      top_p: 0.5,
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    assert.equal(received.temperature, forcedNonThinkingTemperature)
    assert.equal(received.top_p, forcedTopP)
    assert.deepEqual(received.thinking, { type: 'disabled' })
  })

  it('K2.7 tool-enabled chat: keeps thinking enabled and uses thinking temperature', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'kimi-k2.7-code',
      messages: [{ role: 'user', content: 'Search' }],
      tools: [{ type: 'function', function: { name: 'search' } }],
      temperature: 0.1,
      top_p: 0.5,
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    // K2.7 should NOT have thinking disabled — it rejects it
    assert.equal(received.temperature, forcedTemperature)
    assert.equal(received.top_p, forcedTopP)
    assert.equal(received.thinking, undefined)
  })

  it('returns 404 for non-POST methods', async () => {
    const res = await fetch(
      `http://127.0.0.1:${proxyPort}/v1/chat/completions`,
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
      `http://127.0.0.1:${proxyPort}/v1/chat/completions`,
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
  /** @type {import('node:http').Server} */
  let mockUpstream
  /** @type {import('node:http').Server} */
  let proxyServer
  let proxyPort
  let logDir

  before(async () => {
    mockUpstream = await createMockUpstream()
    const mockAddr = mockUpstream.address()
    const mockUrl = `http://127.0.0.1:${mockAddr.port}/v1/chat/completions`

    const { dir, path: logPath } = tmpLogPath('qwen-test')
    logDir = dir

    const { server } = createProxy({
      upstreamUrl: mockUrl,
      port: 0,
      logPath,
      label: 'qwen-test',
      healthCheckExtras: { disableThinkingWithTools: true },
      rewriteRequest(payload) {
        const hasTools =
          Array.isArray(payload.tools) && payload.tools.length > 0
        const incomingEnableThinking = payload.enable_thinking

        if (hasTools) {
          payload.enable_thinking = false
        } else {
          delete payload.enable_thinking
        }

        const rewrittenEnableThinking = hasTools ? false : undefined

        return {
          summary: {
            model: payload.model,
            hasTools,
            incomingEnableThinking,
            rewrittenEnableThinking
          },
          consoleMsg: `tools=${hasTools} enable_thinking=${incomingEnableThinking} -> ${hasTools ? 'false' : '<deleted>'}`
        }
      },
      startupMessages: () => []
    })

    proxyServer = server
    proxyServer.listen(0, '127.0.0.1', () => {
      proxyPort = proxyServer.address().port
    })

    await new Promise((resolve) => proxyServer.once('listening', resolve))
  })

  after(() => {
    proxyServer?.close()
    mockUpstream?.close()
    // Allow pending log writes to flush before cleanup
    setTimeout(() => {
      try {
        if (logDir) rmSync(logDir, { recursive: true, force: true })
      } catch {
        /* ok */
      }
    }, 200)
  })

  it('health check returns ok', async () => {
    const res = await fetch(`http://127.0.0.1:${proxyPort}/healthz`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.ok, true)
    assert.equal(body.disableThinkingWithTools, true)
  })

  it('plain chat: deletes enable_thinking (model defaults to true)', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'qwen3.8-max',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    assert.equal(Object.hasOwn(received, 'enable_thinking'), false)
  })

  it('tool-enabled chat: sets enable_thinking to false', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'qwen3.8-max',
      messages: [{ role: 'user', content: 'Search' }],
      tools: [{ type: 'function', function: { name: 'search' } }],
      enable_thinking: true,
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    assert.equal(received.enable_thinking, false)
  })

  it('tool-enabled chat: overrides explicit enable_thinking: true', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'qwen3.8-max',
      messages: [{ role: 'user', content: 'Search' }],
      tools: [{ type: 'function', function: { name: 'search' } }],
      enable_thinking: true,
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    assert.equal(received.enable_thinking, false)
  })

  it('returns 404 for non-POST methods', async () => {
    const res = await fetch(
      `http://127.0.0.1:${proxyPort}/v1/chat/completions`,
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
      `http://127.0.0.1:${proxyPort}/v1/chat/completions`,
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
  /** @type {import('node:http').Server} */
  let mockUpstream
  /** @type {import('node:http').Server} */
  let proxyServer
  let proxyPort
  let logDir

  before(async () => {
    mockUpstream = await createMockUpstream()
    const mockAddr = mockUpstream.address()
    const mockUrl = `http://127.0.0.1:${mockAddr.port}/v1/chat/completions`

    const { dir, path: logPath } = tmpLogPath('mimo-test')
    logDir = dir

    const { server } = createProxy({
      upstreamUrl: mockUrl,
      port: 0,
      logPath,
      label: 'mimo-test',
      healthCheckExtras: { disableThinkingWithTools: true },
      rewriteRequest(payload) {
        const hasTools =
          Array.isArray(payload.tools) && payload.tools.length > 0
        const incomingThinkingType = payload?.thinking?.type

        if (hasTools) {
          payload.thinking = { type: 'disabled' }
        } else {
          delete payload.thinking
        }

        const rewrittenThinkingType = hasTools ? 'disabled' : undefined

        return {
          summary: {
            model: payload.model,
            hasTools,
            incomingThinkingType,
            rewrittenThinkingType
          },
          consoleMsg: `tools=${hasTools} thinking.type=${incomingThinkingType} -> ${hasTools ? '"disabled"' : '<deleted>'}`
        }
      },
      startupMessages: () => []
    })

    proxyServer = server
    proxyServer.listen(0, '127.0.0.1', () => {
      proxyPort = proxyServer.address().port
    })

    await new Promise((resolve) => proxyServer.once('listening', resolve))
  })

  after(() => {
    proxyServer?.close()
    mockUpstream?.close()
    // Allow pending log writes to flush before cleanup
    setTimeout(() => {
      try {
        if (logDir) rmSync(logDir, { recursive: true, force: true })
      } catch {
        /* ok */
      }
    }, 200)
  })

  it('health check returns ok', async () => {
    const res = await fetch(`http://127.0.0.1:${proxyPort}/healthz`)
    assert.equal(res.status, 200)
    const body = await res.json()
    assert.equal(body.ok, true)
    assert.equal(body.disableThinkingWithTools, true)
  })

  it('plain chat: deletes thinking (model defaults to enabled)', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'mimo-v2.5-pro',
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    assert.equal(Object.hasOwn(received, 'thinking'), false)
  })

  it('tool-enabled chat: sets thinking.type to disabled', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'mimo-v2.5-pro',
      messages: [{ role: 'user', content: 'Search' }],
      tools: [{ type: 'function', function: { name: 'search' } }],
      thinking: { type: 'enabled' },
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    assert.deepEqual(received.thinking, { type: 'disabled' })
  })

  it('tool-enabled chat: overrides explicit thinking.type: enabled', async () => {
    const res = await proxyRequest(proxyPort, {
      model: 'mimo-v2.5-pro',
      messages: [{ role: 'user', content: 'Search' }],
      tools: [{ type: 'function', function: { name: 'search' } }],
      thinking: { type: 'enabled' },
      stream: false
    })

    assert.equal(res.status, 200)
    const data = await res.json()
    const received = data.receivedBody

    assert.deepEqual(received.thinking, { type: 'disabled' })
  })

  it('returns 404 for non-POST methods', async () => {
    const res = await fetch(
      `http://127.0.0.1:${proxyPort}/v1/chat/completions`,
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
      `http://127.0.0.1:${proxyPort}/v1/chat/completions`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{broken'
      }
    )
    assert.equal(res.status, 400)
  })
})
