# AGENTS.md

## Scope

This repository keeps durable validation records for custom language-model endpoint experiments. The current validated setups are:

- **Kimi K2.6** (Moonshot) — requires the local proxy shim `proxy/kimi-proxy.mjs`.
- **Qwen 3.6 Plus** (DashScope) — works direct with static `enable_thinking: false`, or optionally via `proxy/qwen-proxy.mjs` for dynamic thinking suppression.
- **Qwen 3.7 Max** (DashScope) — works direct with static `enable_thinking: false`, or optionally via `proxy/qwen-proxy.mjs` for dynamic thinking suppression.
- **DeepSeek V4 Pro / V4 Flash** — uses the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) VS Code extension; no custom-endpoint config needed.
- **Xiaomi MiMo V2.5 / V2.5 Pro / V2 Flash** — works direct with static `thinking: {"type": "disabled"}` in `requestBody`; no proxy needed.

Treat the model records under `docs/models/` as the source of truth and this file as the quick-start guidance for agents.

## Project Map

- [README.md](README.md) defines the repo layout and the convention for adding future validation records.
- [docs/models/kimi-k2.6.md](docs/models/kimi-k2.6.md) — full compatibility assessment for Kimi K2.6.
- [docs/models/qwen.md](docs/models/qwen.md) — full compatibility assessment for Qwen 3.6 Plus (vision + text) and Qwen 3.7 Max (text only), plus the optional proxy feature.
- [docs/models/mimo.md](docs/models/mimo.md) — full compatibility assessment for Xiaomi MiMo V2.5 (omnimodal), V2.5 Pro (text, largest), and V2.5 Flash (text, fastest/cheapest).
- [proxy/kimi-proxy.mjs](proxy/kimi-proxy.mjs) is a small Node.js HTTP proxy that rewrites outbound chat-completions requests for Kimi K2-family models, preserves streaming, and writes redacted NDJSON summaries.
- [proxy/qwen-proxy.mjs](proxy/qwen-proxy.mjs) is an optional proxy for Qwen 3.x models that dynamically suppresses thinking only when tools are present (reasoning visible in plain chat, suppressed in tool loops).
- `debug_log/` contains local runtime artifacts. It is git-ignored and should not be treated as canonical documentation.

## Commands

### Both proxies (npm)

- `npm run proxy` starts **both** proxies concurrently (uses `concurrently`).
- `npm run proxy:kimi` starts the Kimi proxy on `http://127.0.0.1:3457/v1/chat/completions`.
- `npm run proxy:qwen` starts the Qwen proxy on `http://127.0.0.1:3458/v1/chat/completions`.
- `npm run clean:logs` removes the `debug_log/` directory.

After publishing to npm, users can also run:

- `npx copilot-custom-endpoint` — starts both proxies concurrently (default).
- `npx copilot-custom-endpoint all` — same, explicit `all` subcommand.
- `npx copilot-custom-endpoint kimi` — starts Kimi proxy only.
- `npx copilot-custom-endpoint qwen` — starts Qwen proxy only.
- `npx copilot-custom-endpoint clean` — removes the `debug_log/` directory.

### Kimi proxy

- `npm run proxy:kimi` (or `node proxy/kimi-proxy.mjs`) starts the local proxy on `http://127.0.0.1:3457/v1/chat/completions`.
- `node proxy/kimi-proxy.mjs --help` prints the supported environment variables and defaults.
- `curl http://127.0.0.1:3457/healthz` checks that the proxy is listening.

### Qwen (direct — no proxy)

No local proxy is needed for Qwen models. Verify connectivity directly:

```bash
curl https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3.6-plus","messages":[{"role":"user","content":"Hello"}]}'
```

### Qwen (with optional proxy)

The `proxy/qwen-proxy.mjs` adds dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tools are invoked.

- `npm run proxy:qwen` (or `node proxy/qwen-proxy.mjs`) starts the local proxy on `http://127.0.0.1:3458/v1/chat/completions`.
- `node proxy/qwen-proxy.mjs --help` prints the supported environment variables and defaults.
- `curl http://127.0.0.1:3458/healthz` checks that the proxy is listening.

When using the proxy, update VS Code config to point Qwen model URLs to `http://127.0.0.1:3458/v1/chat/completions` and remove static `enable_thinking` from `requestBody`. The proxy handles it dynamically.

## Working Rules

- Prefer updating the existing model record under `docs/models/` over creating ad hoc root notes. New validations should use `docs/models/<provider>-<model>.md`.
- Link to existing documentation instead of copying detailed configuration blocks or external source lists into new notes.
- Keep proxy behavior provider-specific. [proxy/kimi-proxy.mjs](proxy/kimi-proxy.mjs) is tuned for Kimi K2-family constraints, not for arbitrary OpenAI-compatible providers.
- Preserve redaction when touching logging code. Auth headers and equivalent secrets must stay out of `debug_log/` artifacts.

## Provider-specific constraints

### Kimi K2

- Assume the direct VS Code to Moonshot path is incompatible unless you revalidate it. The practical working path in this repo is VS Code -> local proxy -> Moonshot.
- Plain-chat requests must be rewritten to Kimi-compatible sampling values. Tool-enabled requests must also disable thinking.
- The full rationale, tested values, and evidence live in [docs/models/kimi-k2.6.md](docs/models/kimi-k2.6.md); do not duplicate that record here.

### Qwen 3.x (DashScope)

- Direct VS Code -> DashScope works without a proxy for both `qwen3.6-plus` and `qwen3.7-max`.
- Static `enable_thinking: false` in `requestBody` prevents `reasoning_content` issues during tool loops but suppresses reasoning in plain chat.
- Optional `proxy/qwen-proxy.mjs` provides dynamic thinking suppression: reasoning visible in plain chat, suppressed only when tools are present.
- `qwen3.6-plus` supports vision; `qwen3.7-max` does not.
- The full rationale, tested values, and evidence live in [docs/models/qwen.md](docs/models/qwen.md); do not duplicate those records here.

### Xiaomi MiMo

- Direct VS Code -> MiMo API works without a proxy for all three models (`mimo-v2.5-pro`, `mimo-v2.5`, `mimo-v2-flash`).
- Static `thinking: {"type": "disabled"}` in `requestBody` is **required** for tool-calling stability. Without it, MiMo returns 400 when conversation history contains tool calls with missing `reasoning_content`.
- `mimo-v2.5` supports native vision via a dedicated ViT encoder; `mimo-v2.5-pro` and `mimo-v2-flash` are text-only.
- `mimo-v2-flash` is the cheapest option ($0.10 input / $0.30 output per 1M tokens) and defaults to thinking off.
- `mimo-v2.5-pro` and `mimo-v2.5` default to thinking on at the API level; the `requestBody` override suppresses it.
- Endpoint: `https://api.xiaomimimo.com/v1/chat/completions` (pay-as-you-go). Token Plan uses `https://token-plan-cn.xiaomimimo.com/v1/chat/completions`.
- Auth: `Authorization: Bearer $MIMO_API_KEY` header (standard).
- The full rationale, tested values, and evidence live in [docs/models/mimo.md](docs/models/mimo.md); do not duplicate those records here.

## Validation Expectations

- `package.json` defines npm scripts for both proxies, the `clean:logs` utility, and `npm test` (29 tests — 18 unit + 11 integration — via `node --test tests/**/*.test.mjs` covering header redaction, header forwarding, response headers, request-body reading, and proxy rewrite logic).
- There is no CI in this repo.
- Validate proxy changes with the smallest relevant manual checks first: `node proxy/kimi-proxy.mjs --help`, `curl http://127.0.0.1:3457/healthz`, and a targeted request or log review that confirms the intended rewrite.
