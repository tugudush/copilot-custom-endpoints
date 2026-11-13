# AGENTS.md

## Scope

This repository keeps durable validation records for custom language-model endpoint experiments. The current validated setups are:

- **Kimi K3.1 Pro** (Moonshot, October 23, 2026) — always-thinking; runs through the local proxy `proxy/kimi-proxy.mjs`. See [docs/models/kimi.md](docs/models/kimi.md).
- **GPT-6 Astra** (OpenAI, September 3, 2026) — native in GitHub Copilot. No custom-endpoint setup maintained here.
- **GPT-6 Sol / GPT-6 Luna** (OpenAI, September 22, 2026) — `gpt-6-sol` and `gpt-6-luna`; GA in Copilot. No custom-endpoint setup maintained here.
- **GPT-6.1 Sol** (OpenAI, September 29, 2026) — `gpt-6.1-sol`; GA in Copilot (not Pro). No custom-endpoint setup maintained here.
- **Claude Opus 5.5** (Anthropic, September 22, 2026) — `claude-opus-5-5`; GA in Copilot; adaptive thinking always on. No custom-endpoint setup validated here.
- **Gemini 4 Argon** (Google, October 13, 2026) — `gemini-4-argon`; GA in Copilot (not Pro). No custom-endpoint setup maintained here.
- **Gemini 4 Carbon** (Google, October 28, 2026; GA November 10, 2026) — `gemini-4-carbon`; GA in Copilot (not Pro); thinking levels `low` / `medium` / `high`. No custom-endpoint setup maintained here.
- **Gemini 4 Hydrogen** (Google, November 12, 2026) — `gemini-4-hydrogen`; API-only (Google AI Studio and the Gemini API, free tier available) and not in Copilot as of November 13, 2026; thinking levels `low` / `medium` / `high` (default) / `xhigh`. No custom-endpoint setup maintained here.
- **Qwen 3.8 Max** (DashScope) — `qwen3.8-max`; optional proxy `proxy/qwen-proxy.mjs`. See [docs/models/qwen.md](docs/models/qwen.md).
- **DeepSeek V4.1 Flash** — via the [DeepSeek for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) extension; no custom-endpoint config. See [docs/models/deepseek.md](docs/models/deepseek.md).
- **Xiaomi MiMo V2.6 Pro / Flash / Pro UltraSpeed** — optional proxy `proxy/mimo-proxy.mjs`. See [docs/models/mimo.md](docs/models/mimo.md).
- **MiniMax M3.1 Flash** (October 19, 2026) — `MiniMax-M3.1-Flash`; always-thinking; direct, no proxy. See [docs/models/minimax.md](docs/models/minimax.md).
- **GLM 5.3** (Z.ai, August 18, 2026) — text-only; always-thinking; direct, no proxy. See [docs/models/glm.md](docs/models/glm.md).
- **GLM 5.3 Flash** (Z.ai, August 26, 2026) — multimodal (text + image input); always-thinking; direct, no proxy. See [docs/models/glm.md](docs/models/glm.md).

**⚠️ Utility models are only a BYOK-without-Copilot concern.** With a Copilot token, VS Code defaults utility flows to Copilot's built-in utility models. Without one, set `chat.utilityModel` / `chat.utilitySmallModel` or `chat.byokUtilityModelDefault` → _Main Agent Model_. See [README.md § Setup #4](README.md#4-configure-the-utility-small-model).

Treat the model records under `docs/models/` as the source of truth and this file as the quick-start guidance for agents. Pricing and benchmark scores live in [docs/pricing.md](docs/pricing.md) and [docs/benchmarks.md](docs/benchmarks.md), not here.

## Project Map

- [README.md](README.md) defines the repo layout and the convention for adding future validation records.
- [docs/models/kimi.md](docs/models/kimi.md) — full compatibility assessment and setup guide for Kimi K3.1 Pro and K3.
- [docs/models/qwen.md](docs/models/qwen.md) — full compatibility assessment for Qwen 3.8 Max, plus the optional proxy feature.
- [docs/models/mimo.md](docs/models/mimo.md) — full compatibility assessment and V2.6 setup guide for Xiaomi MiMo.
- [docs/models/minimax.md](docs/models/minimax.md) — full compatibility assessment for MiniMax M3.1 Flash (multimodal frontier coding model with 1M context).
- [docs/models/glm.md](docs/models/glm.md) — full compatibility assessment for GLM 5.3 and GLM 5.3 Flash (Z.ai / Zhipu AI).
- [docs/models/deepseek.md](docs/models/deepseek.md) — DeepSeek V4.1 Flash extension setup and model-ID override troubleshooting.
- [proxy/kimi-proxy.mjs](proxy/kimi-proxy.mjs) is a small Node.js HTTP proxy that rewrites outbound chat-completions requests for Kimi K2-family models, preserves streaming, and writes redacted NDJSON summaries.
- [proxy/qwen-proxy.mjs](proxy/qwen-proxy.mjs) is an optional proxy for Qwen 3.x models that dynamically suppresses thinking only when tool activity is detected — a `"tool"`-role message or a non-default `tool_choice`, not merely a `tools` array (reasoning visible in plain chat, suppressed in tool loops).
- [lib/kimi-rewrite.mjs](lib/kimi-rewrite.mjs), [lib/qwen-rewrite.mjs](lib/qwen-rewrite.mjs), and [lib/mimo-rewrite.mjs](lib/mimo-rewrite.mjs) hold the provider rewrites that the proxies and their tests import; [lib/rewrite-summary.mjs](lib/rewrite-summary.mjs) holds the shared NDJSON summary shape and tool-activity detection.
- [proxy/mimo-proxy.mjs](proxy/mimo-proxy.mjs) is an optional proxy for MiMo V2.6 models that preserves thinking when reasoning history is complete and suppresses it as a tool-loop fallback when history is incomplete.
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
- `npx copilot-custom-endpoint mimo` — starts MiMo V2.6 proxy only.
- `npx copilot-custom-endpoint clean` — removes the `debug_log/` directory.

### Kimi proxy

- `npm run proxy:kimi` (or `node proxy/kimi-proxy.mjs`) starts the local proxy on `http://127.0.0.1:3457/v1/chat/completions`.
- `node proxy/kimi-proxy.mjs --help` prints the supported environment variables and defaults.
- `curl http://127.0.0.1:3457/healthz` checks that the proxy is listening.

### Qwen (direct — no proxy)

No local proxy is needed for Qwen models. Verify connectivity directly:

```bash
curl https://<your-workspace-id>.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions \
  -H "Authorization: Bearer $DASHSCOPE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"qwen3.8-max","messages":[{"role":"user","content":"Hello"}]}'
```

### Qwen (with optional proxy)

The `proxy/qwen-proxy.mjs` adds dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tool activity is detected (a `"tool"`-role message or a non-default `tool_choice`).

- `npm run proxy:qwen` (or `node proxy/qwen-proxy.mjs`) starts the local proxy on `http://127.0.0.1:3458/v1/chat/completions`.
- `node proxy/qwen-proxy.mjs --help` prints the supported environment variables and defaults.
- `curl http://127.0.0.1:3458/healthz` checks that the proxy is listening.

When using the proxy, update VS Code config to point Qwen model URLs to `http://127.0.0.1:3458/v1/chat/completions` and keep thinking configuration out of the model entry. The proxy handles it dynamically.

### MiMo V2.6 (with optional proxy)

The `proxy/mimo-proxy.mjs` preserves V2.6 reasoning when `reasoning_content` is present in assistant tool-call history and disables thinking only when the history is incomplete.

- `npm run proxy:mimo` (or `node proxy/mimo-proxy.mjs`) starts the local proxy on `http://127.0.0.1:3459/v1/chat/completions`.
- `node proxy/mimo-proxy.mjs --help` prints the supported environment variables and defaults.
- `curl http://127.0.0.1:3459/healthz` checks that the proxy is listening.

When using the proxy, update VS Code config to point all MiMo V2.6 model URLs to `http://127.0.0.1:3459/v1/chat/completions` and keep thinking configuration out of the model entry. The proxy handles the V2.6 history-aware fallback dynamically.

## Working Rules

- Prefer updating the existing model record under `docs/models/` over creating ad hoc root notes. New validations should use `docs/models/<provider>-<model>.md`.
- `requestBody` in `chatLanguageModels.json` is **not forwarded** by VS Code 1.146 on either harness; use `modelOptions` for sampling and `supportsReasoningEffort` for effort, and route provider-specific objects through a proxy. See [docs/research/vscode-1.146-copilot-harness.md](docs/research/vscode-1.146-copilot-harness.md).
- Two harnesses exist: the Copilot harness (default since 1.143, BYOK behind the experimental `chat.agentHost.byokModels.enabled` setting) and the deprecated Local harness (removal planned February 2027). Measured request behavior is identical on both, but a result from one is not evidence for the other. See [README.md § Setup #0](README.md#0-know-which-harness-you-are-on).
- `maxInputTokens + maxOutputTokens` is the window VS Code displays and must not exceed the provider's context window. State snippets therefore use `maxInputTokens = window − maxOutputTokens` (`868928` for the 1,000,000-token windows, `917504` for the 1,048,576-token windows); provider sources live in [harness research § 4](docs/research/vscode-1.146-copilot-harness.md#context-and-output-limits-reconciled-t014-2026-11-13).
- Link to existing documentation instead of copying detailed configuration blocks or external source lists into new notes.
- Keep proxy behavior provider-specific. [proxy/kimi-proxy.mjs](proxy/kimi-proxy.mjs) is tuned for Kimi K2-family constraints, not for arbitrary OpenAI-compatible providers.
- Preserve redaction when touching logging code. Auth headers and equivalent secrets must stay out of `debug_log/` artifacts.

## Provider-specific constraints

### Kimi K3.1 Pro / K2.x

- Assume the direct VS Code to Moonshot path is incompatible unless you revalidate it. The practical working path in this repo is VS Code -> local proxy -> Moonshot.
- **K3.1 Pro** (October 2026) is always-thinking, `reasoning_effort` `low` / `high` / `max` (default `max`; chain-of-thought cannot be disabled — lower the effort instead), `tool_choice` supports `auto`, `required`, and named tools, `max_completion_tokens` defaults to 131072 (max 1048576), sampling is fixed at `temperature=1` / `top_p=0.95` / `n=1` / zero penalties, and vision accepts text + image plus video via `ms://<file-id>` (public image URLs are rejected). The proxy's `kimi-k3` prefix detection covers `kimi-k3.1-pro` and `kimi-k3.1-pro-highspeed`, so no proxy change is needed for new K3.1 slugs.
- **K2.7 Code** (June 2026) is always-thinking and rejects `thinking: disabled`. The proxy detects `kimi-k2.7*` slugs and skips the thinking-disable rewrite while keeping temperature/top_p enforcement. `maxOutputTokens: 4096` was previously recommended for agent mode; on 1.146 the forwarding of `maxOutputTokens` to `max_completion_tokens` was only observed for reasoning-metadata entries, so treat that cap as unverified.
- **K2.6 / K2.5**: Plain-chat requests must be rewritten to Kimi-compatible sampling values. Tool-enabled requests must also disable thinking.
- The full rationale, tested values, and evidence live in [docs/models/kimi.md](docs/models/kimi.md); do not duplicate that record here.

### Qwen 3.x (DashScope)

- The validated DashScope custom endpoint uses `qwen3.8-max`; do not substitute an OpenRouter snapshot slug without changing the endpoint and revalidating the provider mapping.
- Direct VS Code -> DashScope is **not viable for suppressing reasoning**: `requestBody` is dropped on VS Code 1.146, so `enable_thinking: false` never reaches DashScope. Use the proxy.
- Use the OpenAI-compatible path (`/compatible-mode/v1`); never the native DashScope path (`/api/v1`), whose request/response schema VS Code and the proxy do not speak.
- Prefer the workspace-dedicated domain `<workspace-id>.<region>.maas.aliyuncs.com` (Alibaba's recommendation; 3600 s request timeout vs 600 s). The legacy `dashscope-intl.aliyuncs.com` stays the proxy default and still works. Set the user's URL via `QWEN_UPSTREAM_URL` in the git-ignored `.env`; never commit a workspace ID or `sk-ws-` key.
- The live `chatLanguageModels.json` points Qwen models at `proxy/qwen-proxy.mjs` (`http://127.0.0.1:3458`) with no `requestBody` override, providing dynamic thinking suppression: reasoning visible in plain chat, suppressed only when tool activity is detected (a `"tool"`-role message or a non-default `tool_choice`).
- When using the proxy, keep `enable_thinking` out of the model entry entirely — `requestBody` is not forwarded on 1.146, and the proxy sets the field per turn.
- `qwen3.8-max` supports vision.
- The full rationale, tested values, and evidence live in [docs/models/qwen.md](docs/models/qwen.md); do not duplicate those records here.

### Xiaomi MiMo

- Direct VS Code -> MiMo API works for the V2.6 chat models. Xiaomi's current model list exposes `mimo-v2.6-pro`, `mimo-v2.6-flash`, and `mimo-v2.6-pro-ultraspeed`; check [docs/models/mimo.md](docs/models/mimo.md) before copying an older config.
- Works via `proxy/mimo-proxy.mjs` for history-aware thinking preservation. A static `thinking: {"type": "disabled"}` in `requestBody` does **not** work on VS Code 1.146 — that field is dropped — so the proxy is the only way to control MiMo thinking from this repo.
- MiMo V2.6 supports native text, image, video, and audio input with 1M context and 128K maximum output.
- When using the proxy, keep `thinking` out of the model entry so the proxy can delete it on plain-chat turns and set it to `{type: "disabled"}` on incomplete tool history.
- MiMo V2.6 defaults to thinking on at the API level; the proxy preserves it when reasoning history is present and disables it only when that history is incomplete.
- Endpoint: `https://api.xiaomimimo.com/v1/chat/completions` (pay-as-you-go). Token Plan uses `https://token-plan-cn.xiaomimimo.com/v1/chat/completions`.
- Auth: `Authorization: Bearer $MIMO_API_KEY` header (standard).

### MiniMax M3.1 Flash

- Direct VS Code → MiniMax API works without a proxy for `MiniMax-M3.1-Flash`.
- **M3.1 Flash is always-thinking.** `thinking: { "type": "disabled" }` and `reasoning_effort: "none"` return HTTP 400 (`model "MiniMax-M3.1-Flash" requires adaptive thinking`, base_resp code 2013). Reduce latency with a lower `reasoning_effort` instead: `low` / `medium` / `high` / `xhigh` / `max` (server default `max`).
- `reasoning_split` cannot be set to `false` on M3.1 Flash; thinking is always returned on `reasoning_content` and `content` holds only the final answer.
- `temperature` / `top_p` are **ignored** (M3.1 Flash is fixed at `1` and `0.95`); keep the repo's standard `1` / `0.95` values so the JSON stays uniform, and never send `top_p` outside `(0, 1]`.
- `service_tier` (an admission-class field priced at 1.5× Standard) is rejected by M3.1 Flash.
- MiniMax recommends appending the complete assistant message (including `reasoning_content`) to history for interleaved thinking. VS Code does not preserve `reasoning_content` across tool turns, so expect reduced reasoning continuity in agent mode — a quality trade-off, not a hard error (unlike Kimi K2.7).

- Supported config on VS Code 1.146: `modelOptions` for sampling plus `supportsReasoningEffort` (`low` … `max`) with `reasoningEffortFormat: "chat-completions"`. `thinking`, `reasoning_split`, and `reasoning_effort` inside `requestBody` are **dropped** — provider defaults apply.
- Endpoint (international): `https://api.minimax.io/v1/chat/completions`. China: `https://api.minimaxi.com/v1/chat/completions`.
- Auth: `Authorization: Bearer $MINIMAX_API_KEY` header (standard).
- Model IDs are case-sensitive: `MiniMax-M3.1-Flash` (capital M's, lowercase i).
- Rate limits: 200 RPM / 10M TPM.
- The full rationale, tested values, and evidence live in [docs/models/minimax.md](docs/models/minimax.md); do not duplicate that record here.

### GLM (Z.ai / Zhipu AI)

- Direct VS Code → Z.ai PaaS works without a proxy for `glm-5.3-flash`, `glm-5.3`, `glm-5.2`, and `glm-5.1`.
- Supported config on VS Code 1.146: `modelOptions` for `temperature`/`top_p` and `supportsReasoningEffort` + `reasoningEffortFormat: "chat-completions"` for effort. Server-side `temperature` is hard-capped at `1.0` — never send `> 1.0`.
- **GLM 5.3 and GLM 5.3 Flash are always-thinking** — `thinking.type` only supports `enabled` (disabling reasoning is not supported) and `reasoning_effort` accepts `low`/`high`/`max` (default `max`). `requestBody.thinking` is dropped on 1.146, which is harmless here because the provider thinks by default.
- `tool_choice` only supports `auto`; VS Code's default is `auto` so no override needed.
- `clear_thinking` defaults to `true` on Z.ai's server, which **strips historical `reasoning_content`** between turns. This is a near-perfect match for VS Code, which does not preserve `reasoning_content` across tool turns. It cannot be changed from `chatLanguageModels.json` on 1.146 (`requestBody` is dropped), so leave the server default. (Exception note: Z.ai's GLM-5.3-Flash docs recommend `thinking.clear_thinking: false` for clients that preserve `reasoning_content` — e.g. Claude Code / agent SDKs — not for the VS Code custom-endpoint path.)
- Vision is supported on `glm-5.3-flash` (native multimodal). `glm-5.3`, `glm-5.2`, and `glm-5.1` are text-only.
- Endpoint (international): `https://api.z.ai/api/paas/v4/chat/completions`. China: `https://open.bigmodel.cn/api/paas/v4/chat/completions`.
- Auth: `Authorization: Bearer $ZAI_API_KEY` header (standard).
- The **GLM Coding Plan** endpoint is **not** usable from VS Code custom endpoints — it is locked to a curated list of officially supported tools. Use the general PaaS endpoint above.
- The full rationale, tested values, and evidence live in [docs/models/glm.md](docs/models/glm.md); do not duplicate that record here.

## Validation Expectations

- `package.json` defines npm scripts for all proxies, the `clean:logs` utility, and `npm test` (49 tests — 23 unit + 26 integration — via `node --test tests/**/*.test.mjs` covering header redaction, header forwarding, response headers, request-body reading, MiMo thinking rewrite, and the production Kimi/Qwen/MiMo rewrite logic behind the proxies).
- There is no CI in this repo.
- Validate proxy changes with the smallest relevant manual checks first: `node proxy/kimi-proxy.mjs --help`, `curl http://127.0.0.1:3457/healthz`, and a targeted request or log review that confirms the intended rewrite.
