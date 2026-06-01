#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, resolve } from 'node:path'
import { fork } from 'node:child_process'
import { rmSync } from 'node:fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const sub = process.argv[2]

const usage = `Usage: copilot-proxy [all|kimi|qwen|clean]

Start a local proxy for VS Code Copilot custom endpoints.

  copilot-proxy all     Start both proxies concurrently (default)
  copilot-proxy kimi    Start the Kimi K2 proxy on port 3457
  copilot-proxy qwen    Start the Qwen 3.x proxy on port 3458
  copilot-proxy clean   Remove the debug_log/ directory

Environment variables: see --help for each proxy.
`

if (sub === 'clean') {
  rmSync(resolve(process.cwd(), 'debug_log'), { recursive: true, force: true })
  console.log('debug_log/ removed')
  process.exit(0)
}

if (sub && sub !== 'kimi' && sub !== 'qwen' && sub !== 'all') {
  console.error(usage)
  process.exit(1)
}

const targets = sub === 'all' || !sub ? ['kimi', 'qwen'] : [sub]

for (const name of targets) {
  const proxyFile = resolve(__dirname, 'proxy', `${name}-proxy.mjs`)
  const child = fork(proxyFile, process.argv.slice(3), { stdio: 'inherit' })
  child.on('exit', (code) => {
    process.exit(code ?? 0)
  })
}
