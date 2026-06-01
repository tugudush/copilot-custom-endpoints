#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { rmSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sub = process.argv[2]

const usage = `Usage: copilot-proxy <kimi|qwen|clean>

Start a local proxy for VS Code Copilot custom endpoints.

  copilot-proxy kimi    Start the Kimi K2 proxy on port 3457
  copilot-proxy qwen    Start the Qwen 3.x proxy on port 3458
  copilot-proxy clean   Remove the debug_log/ directory

Environment variables: see --help for each proxy.
`

if (!sub || (sub !== 'kimi' && sub !== 'qwen' && sub !== 'clean')) {
  console.error(usage)
  process.exit(1)
}

if (sub === 'clean') {
  rmSync(resolve(process.cwd(), 'debug_log'), { recursive: true, force: true })
  console.log('debug_log/ removed')
  process.exit(0)
}

// Remove the subcommand from argv so the proxy sees its original argv
process.argv.splice(2, 1)

const proxyPath = pathToFileURL(
  resolve(
    __dirname,
    'proxy',
    sub === 'kimi' ? 'kimi-proxy.mjs' : 'qwen-proxy.mjs'
  )
).href

await import(proxyPath)
