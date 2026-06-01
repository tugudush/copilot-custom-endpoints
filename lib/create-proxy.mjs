import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import {
  appendLog,
  buildForwardHeaders,
  buildResponseHeaders,
  readRequestBody,
  redactHeaders
} from './shared.mjs'

/**
 * Creates an HTTP proxy server (not yet listening) that forwards chat-completion
 * requests to an upstream provider, applying provider-specific request rewrites.
 *
 * @param {object} options
 * @param {string} options.upstreamUrl - Upstream chat-completions endpoint
 * @param {number} options.port - Local listen port
 * @param {string} options.logPath - Path to NDJSON log file
 * @param {string} options.label - Short label for console messages (e.g. 'kimi-proxy')
 * @param {object} options.healthCheckExtras - Extra fields to include in /healthz response
 * @param {number} [options.fetchTimeoutMs=300_000] - Timeout for upstream fetch calls
 * @param {function} options.rewriteRequest - (payload) => { summary: object, consoleMsg: string }
 *   Called before forwarding. Should mutate `payload` in place. The returned `summary`
 *   is merged into the NDJSON log entry. `consoleMsg` is printed to stdout.
 * @param {function} options.startupMessages - (port, upstreamUrl) => string[] of startup log lines
 * @returns {{ server: import('node:http').Server, start: () => void }}
 */
export function createProxy({
  upstreamUrl,
  port,
  logPath,
  label,
  healthCheckExtras,
  fetchTimeoutMs = 300_000,
  rewriteRequest,
  startupMessages
}) {
  if (!Number.isInteger(port) || port < 0) {
    throw new Error(`Invalid port: ${port}`)
  }

  const server = createServer(async (request, response) => {
    // ---- Health check ----
    if (request.method === 'GET' && request.url === '/healthz') {
      response.writeHead(200, { 'content-type': 'application/json' })
      response.end(
        JSON.stringify({
          ok: true,
          upstreamUrl,
          port,
          ...healthCheckExtras
        })
      )
      return
    }

    // ---- Only POST ----
    if (request.method !== 'POST') {
      response.writeHead(404, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'Not found' }))
      return
    }

    const startedAt = new Date().toISOString()
    let requestBody

    // ---- Read body ----
    try {
      requestBody = await readRequestBody(request)
    } catch (error) {
      response.writeHead(400, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'Unable to read request body' }))

      await appendLog(
        {
          timestamp: startedAt,
          type: 'read-error',
          path: request.url,
          error: error instanceof Error ? error.message : String(error)
        },
        logPath
      )
      return
    }

    // ---- Parse JSON ----
    let payload

    try {
      payload = JSON.parse(requestBody)
    } catch {
      response.writeHead(400, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'Expected JSON request body' }))

      await appendLog(
        {
          timestamp: startedAt,
          type: 'invalid-json',
          path: request.url,
          headers: redactHeaders(request.headers)
        },
        logPath
      )
      return
    }

    // ---- Provider-specific rewrite ----
    const { summary, consoleMsg } = rewriteRequest(payload)

    // ---- Log request ----
    await appendLog(
      {
        timestamp: startedAt,
        type: 'request',
        path: request.url,
        headers: redactHeaders(request.headers),
        summary
      },
      logPath
    )

    console.log(`[${label}] ${request.method} ${request.url} ${consoleMsg}`)

    // ---- Forward to upstream ----
    try {
      const upstreamResponse = await fetch(upstreamUrl, {
        method: 'POST',
        headers: buildForwardHeaders(request.headers),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(fetchTimeoutMs)
      })

      // ---- Log response ----
      await appendLog(
        {
          timestamp: new Date().toISOString(),
          type: 'response',
          path: request.url,
          status: upstreamResponse.status,
          statusText: upstreamResponse.statusText,
          contentType: upstreamResponse.headers.get('content-type'),
          upstreamRequestId:
            upstreamResponse.headers.get('x-request-id') ??
            upstreamResponse.headers.get('request-id')
        },
        logPath
      )

      // ---- Forward response ----
      response.writeHead(
        upstreamResponse.status,
        buildResponseHeaders(upstreamResponse.headers)
      )

      if (!upstreamResponse.body) {
        response.end()
        return
      }

      Readable.fromWeb(upstreamResponse.body).pipe(response)
    } catch (error) {
      response.writeHead(502, { 'content-type': 'application/json' })
      response.end(JSON.stringify({ error: 'Upstream request failed' }))

      await appendLog(
        {
          timestamp: new Date().toISOString(),
          type: 'upstream-error',
          path: request.url,
          error: error instanceof Error ? error.message : String(error)
        },
        logPath
      )
    }
  })

  function start() {
    server.listen(port, '127.0.0.1', () => {
      for (const msg of startupMessages(port, upstreamUrl)) {
        console.log(msg)
      }
    })
  }

  return { server, start }
}
