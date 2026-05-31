# AGENTS.md

## Scope

This repository keeps durable validation records for custom language-model endpoint experiments. The current validated setup is Kimi K2.6 behind a local proxy shim; treat the model record as the source of truth and this file as the quick-start guidance for agents.

## Project Map

- [README.md](README.md) defines the repo layout and the convention for adding future validation records.
- [docs/models/kimi-k2.6.md](docs/models/kimi-k2.6.md) contains the full compatibility assessment, working VS Code configuration, validation history, known limitations, and sources.
- [proxy/kimi-proxy.mjs](proxy/kimi-proxy.mjs) is a small Node.js HTTP proxy that rewrites outbound chat-completions requests, preserves streaming, and writes redacted NDJSON summaries.
- `debug_log/` contains local runtime artifacts. It is git-ignored and should not be treated as canonical documentation.

## Commands

- `node proxy/kimi-proxy.mjs` starts the local proxy on `http://127.0.0.1:3457/v1/chat/completions`.
- `node proxy/kimi-proxy.mjs --help` prints the supported environment variables and defaults.
- `curl http://127.0.0.1:3457/healthz` checks that the proxy is listening.

## Working Rules

- Prefer updating the existing model record under `docs/models/` over creating ad hoc root notes. New validations should use `docs/models/<provider>-<model>.md`.
- Link to existing documentation instead of copying detailed configuration blocks or external source lists into new notes.
- Keep proxy behavior provider-specific. [proxy/kimi-proxy.mjs](proxy/kimi-proxy.mjs) is tuned for Kimi K2-family constraints, not for arbitrary OpenAI-compatible providers.
- Preserve redaction when touching logging code. Auth headers and equivalent secrets must stay out of `debug_log/` artifacts.

## Kimi K2 Constraints

- Assume the direct VS Code to Moonshot path is incompatible unless you revalidate it. The practical working path in this repo is VS Code -> local proxy -> Moonshot.
- Plain-chat requests must be rewritten to Kimi-compatible sampling values. Tool-enabled requests must also disable thinking.
- The full rationale, tested values, and evidence live in [docs/models/kimi-k2.6.md](docs/models/kimi-k2.6.md); do not duplicate that record here.

## Validation Expectations

- There is no `package.json`, automated test suite, or CI in this repo.
- Validate proxy changes with the smallest relevant manual checks first: `node proxy/kimi-proxy.mjs --help`, `curl http://127.0.0.1:3457/healthz`, and a targeted request or log review that confirms the intended rewrite.
