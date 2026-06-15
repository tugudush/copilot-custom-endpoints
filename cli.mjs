#!/usr/bin/env node
import 'dotenv/config'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { fork } from 'node:child_process'
import { rmSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sub = process.argv[2]

const usage = `Usage: copilot-custom-endpoint [all|kimi|qwen|mimo|clean]

Start a local proxy for VS Code Copilot custom endpoints.

  copilot-custom-endpoint all     Start all proxies concurrently (default)
  copilot-custom-endpoint kimi    Start the Kimi K2 proxy on port 3457
  copilot-custom-endpoint qwen    Start the Qwen 3.x proxy on port 3458
  copilot-custom-endpoint mimo    Start the MiMo V2.5 proxy on port 3459
  copilot-custom-endpoint clean   Remove the debug_log/ directory

Environment variables: see --help for each proxy.
`

if (sub === 'clean') {
  rmSync(resolve(process.cwd(), 'debug_log'), { recursive: true, force: true })
  console.log('debug_log/ removed')
  process.exit(0)
}

if (
  sub &&
  sub !== 'kimi' &&
  sub !== 'qwen' &&
  sub !== 'mimo' &&
  sub !== 'all'
) {
  console.error(usage)
  process.exit(1)
}

const targets = sub === 'all' || !sub ? ['kimi', 'qwen', 'mimo'] : [sub]

// Spawn all target proxies and wait for all to exit.
// This keeps both proxies alive in "all" mode instead of exiting
// when the first one terminates.
const children = targets.map((name) => {
  const proxyFile = resolve(__dirname, 'proxy', `${name}-proxy.mjs`)
  return fork(proxyFile, process.argv.slice(3), { stdio: 'inherit' })
})

const exitCodes = await Promise.all(
  children.map(
    (child) =>
      new Promise((resolve) => {
        child.on('exit', (code) => {
          resolve(code ?? 0)
        })
      })
  )
)

process.exit(exitCodes.some((code) => code !== 0) ? 1 : 0)
