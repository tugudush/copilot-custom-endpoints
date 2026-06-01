import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { Readable } from 'node:stream'
import {
  redactHeaders,
  buildForwardHeaders,
  buildResponseHeaders,
  readRequestBody
} from '../lib/shared.mjs'

// ---------------------------------------------------------------------------
// redactHeaders
// ---------------------------------------------------------------------------
describe('redactHeaders', () => {
  it('redacts Authorization header', () => {
    const result = redactHeaders({
      authorization: 'Bearer sk-1234',
      'content-type': 'application/json'
    })
    assert.equal(result.authorization, 'Bearer <redacted>')
    assert.equal(result['content-type'], 'application/json')
  })

  it('redacts x-api-key header (case-insensitive)', () => {
    const mixed = redactHeaders({ 'X-Api-Key': 'secret123' })
    assert.equal(mixed['X-Api-Key'], '<redacted>')

    const lower = redactHeaders({ 'x-api-key': 'secret123' })
    assert.equal(lower['x-api-key'], '<redacted>')
  })

  it('skips undefined values', () => {
    const result = redactHeaders({
      accept: 'application/json',
      authorization: undefined
    })
    assert.equal(Object.hasOwn(result, 'authorization'), false)
    assert.equal(result.accept, 'application/json')
  })

  it('passes through non-sensitive headers unchanged', () => {
    const result = redactHeaders({
      'content-type': 'text/plain',
      accept: '*/*',
      'x-request-id': 'abc-123'
    })
    assert.equal(result['content-type'], 'text/plain')
    assert.equal(result.accept, '*/*')
    assert.equal(result['x-request-id'], 'abc-123')
  })

  it('returns an empty object for empty input', () => {
    assert.deepEqual(redactHeaders({}), {})
  })
})

// ---------------------------------------------------------------------------
// buildForwardHeaders
// ---------------------------------------------------------------------------
describe('buildForwardHeaders', () => {
  it('strips hop-by-hop headers', () => {
    const result = buildForwardHeaders({
      'content-type': 'application/json',
      connection: 'keep-alive',
      'transfer-encoding': 'chunked',
      accept: '*/*'
    })
    assert.equal(result.has('connection'), false)
    assert.equal(result.has('transfer-encoding'), false)
    assert.equal(result.get('accept'), '*/*')
  })

  it('strips host and content-length', () => {
    const result = buildForwardHeaders({
      host: 'localhost:3457',
      'content-length': '42',
      accept: '*/*'
    })
    assert.equal(result.has('host'), false)
    assert.equal(result.has('content-length'), false)
  })

  it('forces content-type to application/json regardless of incoming value', () => {
    const result = buildForwardHeaders({ 'content-type': 'text/plain' })
    assert.equal(result.get('content-type'), 'application/json')
  })

  it('handles array-valued headers', () => {
    const result = buildForwardHeaders({
      'set-cookie': ['a=1', 'b=2'],
      accept: '*/*'
    })
    assert.deepEqual(result.getSetCookie(), ['a=1', 'b=2'])
  })

  it('skips undefined values', () => {
    const result = buildForwardHeaders({
      accept: '*/*',
      'x-undefined': undefined
    })
    assert.equal(result.has('x-undefined'), false)
  })

  it('returns empty Headers for empty input (still sets content-type)', () => {
    const result = buildForwardHeaders({})
    assert.equal(result.get('content-type'), 'application/json')
    assert.equal([...result.keys()].length, 1)
  })
})

// ---------------------------------------------------------------------------
// buildResponseHeaders
// ---------------------------------------------------------------------------
describe('buildResponseHeaders', () => {
  it('strips hop-by-hop headers', () => {
    const headers = new Headers({
      'content-type': 'application/json',
      'transfer-encoding': 'chunked',
      'keep-alive': 'timeout=5',
      'x-request-id': 'abc'
    })
    const result = buildResponseHeaders(headers)
    assert.equal(Object.hasOwn(result, 'transfer-encoding'), false)
    assert.equal(Object.hasOwn(result, 'keep-alive'), false)
    assert.equal(result['content-type'], 'application/json')
    assert.equal(result['x-request-id'], 'abc')
  })

  it('preserves non-hop-by-hop headers', () => {
    const headers = new Headers({
      'x-request-id': 'abc',
      'x-rate-limit': '100'
    })
    const result = buildResponseHeaders(headers)
    assert.equal(result['x-request-id'], 'abc')
    assert.equal(result['x-rate-limit'], '100')
  })

  it('returns empty object for empty Headers', () => {
    assert.deepEqual(buildResponseHeaders(new Headers()), {})
  })
})

// ---------------------------------------------------------------------------
// readRequestBody
// ---------------------------------------------------------------------------
describe('readRequestBody', () => {
  it('reads body from a Readable stream', async () => {
    const stream = Readable.from([Buffer.from('{"hello":"world"}')])
    const result = await readRequestBody(stream)
    assert.equal(result, '{"hello":"world"}')
  })

  it('concatenates multiple chunks', async () => {
    const stream = Readable.from([
      Buffer.from('{"hel'),
      Buffer.from('lo":"wo'),
      Buffer.from('rld"}')
    ])
    const result = await readRequestBody(stream)
    assert.equal(result, '{"hello":"world"}')
  })

  it('handles empty stream', async () => {
    const stream = Readable.from([])
    const result = await readRequestBody(stream)
    assert.equal(result, '')
  })

  it('handles string chunks', async () => {
    // Simulate a scenario where chunk is a string (some HTTP frameworks)
    const stream = Readable.from(['{"hello":"world"}'])
    const result = await readRequestBody(stream)
    assert.equal(result, '{"hello":"world"}')
  })
})
