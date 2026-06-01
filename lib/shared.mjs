import { appendFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

// ---- Constants ----

export const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade'
])

// ---- Header utilities ----

/**
 * Returns a shallow copy of `headers` with sensitive values redacted.
 * `authorization` → `Bearer <redacted>`
 * `x-api-key`     → `<redacted>`
 * `undefined` values are dropped entirely.
 */
export function redactHeaders(headers) {
  const redacted = {}

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) {
      continue
    }

    if (name.toLowerCase() === 'authorization') {
      redacted[name] = 'Bearer <redacted>'
      continue
    }

    if (name.toLowerCase() === 'x-api-key') {
      redacted[name] = '<redacted>'
      continue
    }

    redacted[name] = value
  }

  return redacted
}

/**
 * Build a Headers object for the upstream request, filtering out
 * hop-by-hop headers, `host`, and `content-length`, then forcing
 * `content-type: application/json`.
 */
export function buildForwardHeaders(headers) {
  const forwardHeaders = new Headers()

  for (const [name, value] of Object.entries(headers)) {
    const lowerName = name.toLowerCase()

    if (
      value === undefined ||
      lowerName === 'host' ||
      lowerName === 'content-length' ||
      hopByHopHeaders.has(lowerName)
    ) {
      continue
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        forwardHeaders.append(name, item)
      }
      continue
    }

    forwardHeaders.set(name, value)
  }

  forwardHeaders.set('content-type', 'application/json')

  return forwardHeaders
}

/**
 * Build a plain object from a Headers instance, filtering out hop-by-hop headers.
 */
export function buildResponseHeaders(headers) {
  const responseHeaders = {}

  for (const [name, value] of headers.entries()) {
    if (hopByHopHeaders.has(name.toLowerCase())) {
      continue
    }

    responseHeaders[name] = value
  }

  return responseHeaders
}

// ---- Request body ----

/**
 * Read the full body from an async-iterable request-like object
 * (e.g. `IncomingMessage` or a `Readable` stream) and return it as a UTF-8 string.
 */
export async function readRequestBody(request) {
  const chunks = []

  for await (const chunk of request) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }

  return Buffer.concat(chunks).toString('utf8')
}

// ---- Logging ----

/**
 * Append an NDJSON entry to `logPath`, creating parent directories as needed.
 */
export async function appendLog(entry, logPath) {
  await mkdir(dirname(logPath), { recursive: true })
  await appendFile(logPath, `${JSON.stringify(entry)}\n`, 'utf8')
}
