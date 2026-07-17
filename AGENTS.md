# AGENTS.md

## Scope

This repository keeps durable validation records for custom language-model endpoint experiments. The current validated setups are:

- **Kimi K3** (Moonshot) — newly validated (July 17, 2026). Requires the local proxy shim `proxy/kimi-proxy.mjs`. K3 is always-thinking and uses `reasoning_effort` (not `thinking`); the proxy detects K3, skips the thinking-disable rewrite, and deletes any stray `thinking` block while keeping temperature/top_p enforcement. 2.8T params, 1M context, AA Intelligence Index **57.0** (#3 overall).
- **Kimi K2.7 Code / K2.6** (Moonshot) — requires the local proxy shim `proxy/kimi-proxy.mjs`. K2.7 is always-thinking and rejects `thinking: disabled`; the proxy detects K2.7 and skips the thinking-disable rewrite while keeping temperature/top_p enforcement. Validated June 14, 2026.
- **Qwen 3.7 Plus** (DashScope) — works via `proxy/qwen-proxy.mjs` for dynamic thinking suppression; can also work direct with static `enable_thinking: false`.
- **Qwen 3.7 Max** (DashScope) — works via `proxy/qwen-proxy.mjs` for dynamic thinking suppression; can also work direct with static `enable_thinking: false`.
- **DeepSeek V4 Pro / V4 Flash** — uses the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) VS Code extension; no custom-endpoint config needed.
- **Xiaomi MiMo V2.5 / V2.5 Pro** — works direct with static `thinking: {"type": "disabled"}` in `requestBody`; or via `proxy/mimo-proxy.mjs` for dynamic thinking suppression. The live `chatLanguageModels.json` points both models at the local proxy (`http://127.0.0.1:3459`) with no `thinking` override in `requestBody` — the proxy injects `thinking: {"type": "disabled"}` on tool turns and leaves it absent on plain chat.
- **MiniMax M3** — works direct with `thinking: { "type": "adaptive" }` and `reasoning_split: true` in `requestBody` (recommended for the cleanest response format). The model still reasons regardless of the `thinking` setting; `disabled` is a soft hint. No proxy needed.
- **GLM 5.1 / GLM 5V Turbo** (Z.ai / Zhipu AI) — works direct with `thinking: { "type": "enabled" }`, `temperature: 1`, `top_p: 0.95` in `requestBody`. No proxy needed. `clear_thinking` defaults to `true` on the server, so VS Code's failure to forward `reasoning_content` between tool turns does not break loops.
- **GLM 5.2** (Z.ai / Zhipu AI) — newly validated (June 21, 2026). Same direct integration pattern as GLM 5.1. Features 1M Solid lossless context and a published AA Intelligence Index score of **51.0**. No proxy needed. See [docs/models/glm.md](docs/models/glm.md).

**⚠️ VS Code now requires `chat.lm.utilitySmallModel` to be set for BYOK/custom-endpoint users.** Open Settings → search "Chat: Utility Small Model" → pick your fastest model (e.g., DeepSeek V4 Flash or MiMo V2.5). Without it, utility flows like token counting and prompt truncation may silently fail. See [README.md § Setup #4](README.md#4-configure-the-utility-small-model).

Treat the model records under `docs/models/` as the source of truth and this file as the quick-start guidance for agents.

## Project Map

- [README.md](README.md) defines the repo layout and the convention for adding future validation records.
- [docs/models/kimi.md](docs/models/kimi.md) — full compatibility assessment for Kimi K2.6 and K2.7 Code.
- [docs/models/qwen.md](docs/models/qwen.md) — full compatibility assessment for Qwen 3.7 Plus (vision) and Qwen 3.7 Max (text only), plus the optional proxy feature.
- [docs/models/mimo.md](docs/models/mimo.md) — full compatibility assessment for Xiaomi MiMo V2.5 (omnimodal) and V2.5 Pro (text, largest).
- [docs/models/minimax.md](docs/models/minimax.md) — full compatibility assessment for MiniMax M3 (multimodal frontier coding model with 1M context).
- [docs/models/glm.md](docs/models/glm.md) — full compatibility assessment for GLM 5.1 and GLM 5V Turbo (Z.ai / Zhipu AI).
- [docs/models/glm.md](docs/models/glm.md) — GLM 5.2 (new flagship, 1M context, AA Intelligence Index **51.0**).
- [proxy/kimi-proxy.mjs](proxy/kimi-proxy.mjs) is a small Node.js HTTP proxy that rewrites outbound chat-completions requests for Kimi K2-family models, preserves streaming, and writes redacted NDJSON summaries.
- [proxy/qwen-proxy.mjs](proxy/qwen-proxy.mjs) is an optional proxy for Qwen 3.x models that dynamically suppresses thinking only when tools are present (reasoning visible in plain chat, suppressed in tool loops).
- [proxy/mimo-proxy.mjs](proxy/mimo-proxy.mjs) is an optional proxy for MiMo V2.5 models that dynamically suppresses thinking only when tools are present (reasoning visible in plain chat, suppressed in tool loops).
- `debug_log/` contains local runtime artifacts. It is git-ignored and should not be treated as canonical documentation.

## Commands

### All proxies (npm)

- `npm run proxy` starts **all** proxies concurrently (uses `concurrently`).
- `npm run proxy:kimi` starts the Kimi proxy on `http://127.0.0.1:3457/v1/chat/completions`.
- `npm run proxy:qwen` starts the Qwen proxy on `http://127.0.0.1:3458/v1/chat/completions`.
- `npm run proxy:mimo` starts the MiMo proxy on `http://127.0.0.1:3459/v1/chat/completions`.
- `npm run clean:logs` removes the `debug_log/` directory.

After publishing to npm, users can also run:

- `npx copilot-custom-endpoint` — starts all proxies concurrently (default).
- `npx copilot-custom-endpoint all` — same, explicit `all` subcommand.
- `npx copilot-custom-endpoint kimi` — starts Kimi proxy only.
- `npx copilot-custom-endpoint qwen` — starts Qwen proxy only.
- `npx copilot-custom-endpoint mimo` — starts MiMo proxy only.
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
  -d '{"model":"qwen3.7-plus","messages":[{"role":"user","content":"Hello"}]}'
```

### Qwen (with optional proxy)

The `proxy/qwen-proxy.mjs` adds dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tools are invoked.

- `npm run proxy:qwen` (or `node proxy/qwen-proxy.mjs`) starts the local proxy on `http://127.0.0.1:3458/v1/chat/completions`.
- `node proxy/qwen-proxy.mjs --help` prints the supported environment variables and defaults.
- `curl http://127.0.0.1:3458/healthz` checks that the proxy is listening.

When using the proxy, update VS Code config to point Qwen model URLs to `http://127.0.0.1:3458/v1/chat/completions` and remove static `enable_thinking` from `requestBody`. The proxy handles it dynamically.

### MiMo (with optional proxy)

The `proxy/mimo-proxy.mjs` adds dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tools are invoked.

- `npm run proxy:mimo` (or `node proxy/mimo-proxy.mjs`) starts the local proxy on `http://127.0.0.1:3459/v1/chat/completions`.
- `node proxy/mimo-proxy.mjs --help` prints the supported environment variables and defaults.
- `curl http://127.0.0.1:3459/healthz` checks that the proxy is listening.

When using the proxy, update VS Code config to point MiMo model URLs to `http://127.0.0.1:3459/v1/chat/completions` and remove static `thinking` from `requestBody`. The proxy handles it dynamically.

## Working Rules

- Prefer updating the existing model record under `docs/models/` over creating ad hoc root notes. New validations should use `docs/models/<provider>-<model>.md`.
- Link to existing documentation instead of copying detailed configuration blocks or external source lists into new notes.
- Keep proxy behavior provider-specific. [proxy/kimi-proxy.mjs](proxy/kimi-proxy.mjs) is tuned for Kimi K2-family constraints, not for arbitrary OpenAI-compatible providers.
- Preserve redaction when touching logging code. Auth headers and equivalent secrets must stay out of `debug_log/` artifacts.

## Provider-specific constraints

### Kimi K2 / K3

- Assume the direct VS Code to Moonshot path is incompatible unless you revalidate it. The practical working path in this repo is VS Code -> local proxy -> Moonshot.
- **K3** (July 2026) is always-thinking and uses `reasoning_effort` (currently only `max`) — NOT the K2.x `thinking` parameter. The proxy detects `kimi-k3` slugs and skips the thinking-disable rewrite, **deletes any stray `thinking` block**, and keeps temperature/top_p enforcement. `tool_choice` supports `auto`, `required`, and named tools. `max_completion_tokens` defaults to 131072. Fixed sampling: `temperature=1`, `top_p=0.95`. 1M context, 2.8T params (open-source weights by July 27, 2026). AA Intelligence Index **57.0**.
- **K2.7 Code** (June 2026) is always-thinking and rejects `thinking: disabled`. The proxy detects `kimi-k2.7*` slugs and skips the thinking-disable rewrite while keeping temperature/top_p enforcement. Use `maxOutputTokens: 4096` for agent mode to avoid VS Code's "Response too long" error.
- **K2.6 / K2.5**: Plain-chat requests must be rewritten to Kimi-compatible sampling values. Tool-enabled requests must also disable thinking.
- The full rationale, tested values, and evidence live in [docs/models/kimi.md](docs/models/kimi.md); do not duplicate that record here.

### Qwen 3.x (DashScope)

- Direct VS Code -> DashScope works without a proxy for both `qwen3.7-plus` and `qwen3.7-max` when `enable_thinking: false` is set in `requestBody`.
- The live `chatLanguageModels.json` points Qwen models at `proxy/qwen-proxy.mjs` (`http://127.0.0.1:3458`) with no `requestBody` override, providing dynamic thinking suppression: reasoning visible in plain chat, suppressed only when tools are present.
- When using the proxy, keep `enable_thinking` out of `requestBody` so the proxy can delete it on plain-chat turns and set it to `false` on tool turns.
- `qwen3.7-plus` supports vision; `qwen3.7-max` does not.
- The full rationale, tested values, and evidence live in [docs/models/qwen.md](docs/models/qwen.md); do not duplicate those records here.

### Xiaomi MiMo

- Direct VS Code -> MiMo API works without a proxy for the V2.5 chat models. Xiaomi's June 2026 notice says legacy pre-V2.5 chat aliases are being retired, so check [docs/models/mimo.md](docs/models/mimo.md) before copying an older config.
- Works via `proxy/mimo-proxy.mjs` for dynamic thinking suppression; can also work direct with static `thinking: {"type": "disabled"}`.
- Static `thinking: {"type": "disabled"}` in `requestBody` is **required** for tool-calling stability. Without it, MiMo returns 400 when conversation history contains tool calls with missing `reasoning_content`.
- When using the proxy, keep `thinking` out of `requestBody` so the proxy can delete it on plain-chat turns and set it to `{type: "disabled"}` on tool turns.
- `mimo-v2.5` supports native vision via a dedicated ViT encoder; `mimo-v2.5-pro` is text-only.
- Xiaomi's June 2026 notice says legacy pre-V2.5 chat aliases auto-switch to V2.5 replacements and become invalid after 2026-06-30 00:00 Beijing time.
- `mimo-v2.5-pro` and `mimo-v2.5` default to thinking on at the API level; the `requestBody` override suppresses it.
- Endpoint: `https://api.xiaomimimo.com/v1/chat/completions` (pay-as-you-go). Token Plan uses `https://token-plan-cn.xiaomimimo.com/v1/chat/completions`.
- Auth: `Authorization: Bearer $MIMO_API_KEY` header (standard).

### MiniMax M3

- Direct VS Code → MiniMax API works without a proxy.
- Recommended config: `thinking: { "type": "adaptive" }` + `reasoning_split: true` in `requestBody`. The model decides when to reason and the server returns reasoning in a structured `reasoning_details` field (clean OpenAI format for VS Code).
- **Important:** `thinking: { "type": "disabled" }` is **not** a hard override — the model still reasons internally and emits `<think>` tags / `reasoning_content` regardless. The setting only changes the response field layout, not actual model behavior.
- `MiniMax-M3` is multimodal (text + image + video). M3 has 1M context window.
- Endpoint (international): `https://api.minimax.io/v1/chat/completions`. China: `https://api.minimaxi.com/v1/chat/completions`.
- Auth: `Authorization: Bearer $MINIMAX_API_KEY` header (standard).
- Model IDs are case-sensitive: `MiniMax-M3` (capital M's, lowercase i).
- Rate limits: 200 RPM / 10M TPM.
- The full rationale, tested values, and evidence live in [docs/models/minimax.md](docs/models/minimax.md); do not duplicate that record here.

### GLM (Z.ai / Zhipu AI)

- Direct VS Code → Z.ai PaaS works without a proxy for `glm-5.1` and `glm-5v-turbo`.
- Recommended `requestBody`: `thinking: { "type": "enabled" }`, `temperature: 1`, `top_p: 0.95`. Server-side `temperature` is hard-capped at `1.0` — never send `> 1.0`.
- `tool_choice` only supports `auto`; VS Code's default is `auto` so no override needed.
- `clear_thinking` defaults to `true` on Z.ai's server, which **strips historical `reasoning_content`** between turns. This is a near-perfect match for VS Code, which does not preserve `reasoning_content` across tool turns. Do **not** set `clear_thinking: false` from `requestBody`.
- Vision is supported only on `glm-5v-turbo`. `glm-5.1` is text-only.
- Endpoint (international): `https://api.z.ai/api/paas/v4/chat/completions`. China: `https://open.bigmodel.cn/api/paas/v4/chat/completions`.
- Auth: `Authorization: Bearer $ZAI_API_KEY` header (standard).
- The **GLM Coding Plan** endpoint is **not** usable from VS Code custom endpoints — it is locked to a curated list of officially supported tools. Use the general PaaS endpoint above.
- The full rationale, tested values, and evidence live in [docs/models/glm.md](docs/models/glm.md); do not duplicate that record here.

## Validation Expectations

- `package.json` defines npm scripts for all proxies, the `clean:logs` utility, and `npm test` (36 tests — 18 unit + 18 integration — via `node --test tests/**/*.test.mjs` covering header redaction, header forwarding, response headers, request-body reading, and proxy rewrite logic).
- There is no CI in this repo.
- Validate proxy changes with the smallest relevant manual checks first: `node proxy/kimi-proxy.mjs --help`, `curl http://127.0.0.1:3457/healthz`, and a targeted request or log review that confirms the intended rewrite.
