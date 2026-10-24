# Kimi (Moonshot) — VS Code Custom Endpoint Setup Guide

> **TL;DR:** The Kimi K3 family requires the local proxy. These models are always-thinking and use `reasoning_effort` (not the `thinking` parameter) while the proxy enforces Kimi's fixed sampling constraints. Direct VS Code → Moonshot is not viable.
>
> **🆕 Kimi K3.1 Pro** (released October 23, 2026) is the current flagship — a post-trained successor to K3 (3T class, 1M context) with AA Intelligence Index **55.1**, ahead of Claude Fable 5.1 and behind Claude Sonnet 5.5 in our roster. Always-thinking with `reasoning_effort` `low` / `high` / `max` (default `max`). Open weights promised by November 4, 2026.
>
> **Previous:** **Kimi K3** (July 16, 2026) — 2.8T parameters, 1M context, AA Index **43.6**. Still served and still supported by the proxy; use K3.1 Pro unless you specifically need K3.
>
> **🆕 Alternative:** On the **Kimi Coding tier** (`kimi.com/code/console`), the [**Moonshot LM Provider**](https://marketplace.visualstudio.com/items?itemName=DenizhanDaklr.kimi-lm-provider) extension offers zero-proxy setup with reasoning visibility. **Not compatible with Pay-as-You-Go** keys from `platform.kimi.ai`. See [the extension comparison](../research/kimi-vscode-extension.md).

## At a Glance

| Field          | Value                                         |
| -------------- | --------------------------------------------- |
| Mode           | **Proxy required** (local on `:3457`)         |
| Billing        | **Pay-as-You-Go only** — no subscription      |
| Vision         | ✅ Yes                                        |
| Tool calling   | ✅ Yes                                        |
| Context        | _see Models table_                            |
| Max output     | _see Models table_                            |
| Endpoint       | `https://api.moonshot.ai/v1/chat/completions` |
| Proxy endpoint | `http://127.0.0.1:3457/v1/chat/completions`   |
| Auth           | `Authorization: Bearer $KIMI_API_KEY`         |

### Models

| Model                     | Vision | Context | Max output      | Notes                                                                                                                  |
| ------------------------- | ------ | ------- | --------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `kimi-k3.1-pro`           | ✅ Yes | 1M      | 131072 (1M max) | **Flagship.** Post-trained K3, 3T class. Always-thinking, uses `reasoning_effort` (not `thinking`). AA Index **55.1**. |
| `kimi-k3.1-pro-highspeed` | ✅ Yes | 1M      | 131072          | 2–3× faster SKU of K3.1 Pro; same capabilities at a higher per-token price.                                            |
| `kimi-k3`                 | ✅ Yes | 1M      | 131072          | Previous flagship. 2.8T params. AA Index **43.6**.                                                                     |

> This guide documents the K3.1 Pro setup. K3.1 Pro and K3 share the same proxy and request shape, so the snippet below works for both — change only the `id`. Deprecated K2 ids (`kimi-k2-0905-preview`, `kimi-k2-turbo-preview`, `kimi-k2-thinking`, etc.) were discontinued May 25, 2026, and Moonshot plans to retire the remaining K2 series by the end of December 2026.

## Quick Start

1. **Start the proxy** — `npm run proxy:kimi` (or `npx copilot-custom-endpoint kimi` standalone).
2. **Edit `chatLanguageModels.json`** — add the Kimi block below.
3. **Set your Moonshot API key** via Command Palette → **Chat: Manage Language Models**.
4. **Configure the Utility Small Model** — Open Settings → search **"Chat: Utility Small Model"** → pick your fastest model (e.g., DeepSeek V4.1 Flash or MiMo V2.6 Flash). [Why?](../../README.md#4-configure-the-utility-small-model)
5. **Restart VS Code** and pick "Kimi K3.1 Pro".

## Setup

### 1. VS Code configuration

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

```json
{
  "name": "Kimi",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "kimi-k3.1-pro",
      "name": "Kimi K3.1 Pro (Custom Endpoint)",
      "url": "http://127.0.0.1:3457/v1/chat/completions",
      "requestBody": { "temperature": 1, "max_tokens": 8192 },
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1000000,
      "maxOutputTokens": 131072
    },
    {
      "id": "kimi-k3",
      "name": "Kimi K3 (Custom Endpoint)",
      "url": "http://127.0.0.1:3457/v1/chat/completions",
      "requestBody": { "temperature": 1, "max_tokens": 8192 },
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1000000,
      "maxOutputTokens": 131072
    }
  ]
}
```

> **K3.1 Pro note:** `max_tokens` is set to **8192** as a safe starting point. K3.1 Pro is always-thinking and very verbose (150M tokens generated on the AA Intelligence Index evaluation versus an 87M median). The API default for `max_completion_tokens` is 131072 and can go up to 1048576, but reasoning tokens inflate response size — monitor your usage and adjust upward if needed. K3.1 Pro uses `reasoning_effort` (`low` / `high` / `max`, default `max`), not the K2.x `thinking` parameter; add `"reasoning_effort": "low"` to `requestBody` if answers take too long. The proxy forwards the value untouched.
>
> Both models are in the snippet above — delete the entry you don't plan to use. K3 accepts the same `requestBody`; it only supports `reasoning_effort: "max"`.

### 2. API key

Kimi is **Pay-as-You-Go only** — no subscription. A single Open Platform API key covers all models. Recharge at `platform.kimi.ai/console`.

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **Kimi** group → **Update API Key**.
4. Paste your Moonshot / Kimi Platform API key.

> VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference. Kimi Platform (formerly Moonshot) rebranded to `platform.kimi.ai` in 2026 — `api.moonshot.ai` still resolves and the proxy targets it unchanged.

## Local Proxy

The `proxy/kimi-proxy.mjs` is **required** for Kimi — K2/K3-family sampling constraints and tool-turn thinking behaviour cannot be satisfied by VS Code's direct path. See [Quick Start](#quick-start) for the launch command.

| Setting      | Value                                                 |
| ------------ | ----------------------------------------------------- |
| Script       | `proxy/kimi-proxy.mjs`                                |
| Listen URL   | `http://127.0.0.1:3457/v1/chat/completions`           |
| Health check | `curl http://127.0.0.1:3457/healthz`                  |
| Start        | `npm run proxy:kimi` (or `node proxy/kimi-proxy.mjs`) |
| Help         | `node proxy/kimi-proxy.mjs --help`                    |

### Environment variables

Set in `.env` at the repo root (the proxy `import 'dotenv/config'` automatically).

| Variable                                    | Default                                       | Purpose                                                 |
| ------------------------------------------- | --------------------------------------------- | ------------------------------------------------------- |
| `KIMI_PROXY_PORT`                           | `3457`                                        | Local listen port                                       |
| `KIMI_UPSTREAM_URL`                         | `https://api.moonshot.ai/v1/chat/completions` | Upstream Moonshot endpoint                              |
| `KIMI_PROXY_FORCE_TEMPERATURE`              | `1`                                           | Temperature for thinking-mode requests                  |
| `KIMI_PROXY_FORCE_NON_THINKING_TEMPERATURE` | `0.6`                                         | Temperature when thinking is disabled (tool requests)   |
| `KIMI_PROXY_FORCE_TOP_P`                    | `0.95`                                        | `top_p` forced into request body                        |
| `KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS`    | `1`                                           | Force `thinking={"type":"disabled"}` when tools present |
| `KIMI_PROXY_LOG`                            | `debug_log/kimi-proxy.ndjson`                 | Redacted NDJSON log path                                |

### What the proxy does

- Forwards your `Authorization` header upstream.
- Rewrites plain-chat requests to `temperature: 1`, `top_p: 0.95`.
- For **K2.5 / K2.6**: rewrites tool-enabled requests to `thinking: { type: "disabled" }`, `temperature: 0.6`, `top_p: 0.95`.
- For **K3 / K3.1 Pro**: keeps thinking enabled (both are always-thinking and use `reasoning_effort`, not `thinking`); rewrites to `temperature: 1`, `top_p: 0.95`. Does **not** inject a `thinking` block — the K3 family rejects it. Every `kimi-k3*` slug is handled this way, including `kimi-k3.1-pro` and `kimi-k3.1-pro-highspeed`.
- Preserves streaming responses (SSE).
- Writes redacted request summaries to `debug_log/kimi-proxy.ndjson`.

## Notes

- **Kimi K3.1 Pro** (released October 23, 2026) is the current flagship: a post-trained K3 with substantially larger post-training compute, 3T class, 1M context, open weights promised by November 4, 2026. Always-thinking — chain-of-thought **cannot** be disabled; tune depth with `reasoning_effort` (`low` / `high` / `max`, default `max`). Do **not** send the K2.x `thinking` parameter. `tool_choice` supports `auto`, `required`, and named tools. `max_completion_tokens` defaults to 131072 and can go up to 1048576. Sampling is fixed at `temperature=1`, `top_p=0.95`, `n=1`, `presence_penalty=0`, `frequency_penalty=0` — the proxy's enforced `1` / `0.95` are the only accepted values. Vision supports text + image plus video via `ms://<file-id>` URLs; public image URLs are rejected, so pass base64 or an uploaded file id. See the [K3.1 Pro quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart).
- **Kimi K3** (released July 16, 2026) remains served but is superseded by K3.1 Pro: 2.8T params, 1M context, always-thinking with `reasoning_effort` `max` only. It shares K3.1 Pro's request shape, so switching between them needs only a new `id` — no proxy or `requestBody` change. See the [K3 quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart).
- **Kimi Platform rebranding:** the Kimi Platform (formerly Moonshot) rebranded to `platform.kimi.ai` in 2026 — `api.moonshot.ai` still resolves and the proxy targets it unchanged.
- **`tool_choice`:** K3 and K3.1 Pro support `auto`, `required`, and named tools. The proxy preserves the value and only enforces temperature/top_p.
- **Do not send `thinking`:** the K3 family rejects the legacy K2.x `thinking` parameter — use `reasoning_effort` at the top level of the request body instead.

## Troubleshooting

| Symptom                                                | Likely cause                 | Fix                                               |
| ------------------------------------------------------ | ---------------------------- | ------------------------------------------------- |
| "Connection refused" on chat                           | Proxy not running            | `npm run proxy:kimi`                              |
| `invalid temperature: only 1 is allowed`               | Direct path without proxy    | Use the proxy                                     |
| `invalid top_p: only 0.95 is allowed`                  | Direct path without proxy    | Use the proxy                                     |
| `thinking is enabled but reasoning_content is missing` | Tool turn with thinking on   | Verify `KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS=1` |
| `unsupported parameter: thinking` with K3              | K3 doesn't accept `thinking` | Use `reasoning_effort` instead; proxy detects K3  |
| Reasoning can't be turned off                          | K3.1 Pro always thinks       | Set `reasoning_effort` to `low` instead           |
| Model not in VS Code picker                            | Config not reloaded          | Restart VS Code                                   |
| `tool_choice=required` rejected (K2.x)                 | Model limitation             | Use `auto` only for K2.x; K3 supports `required`  |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). Moonshot direct platform rates:

| Model           | Input (cache miss) | Cached input | Output      |
| --------------- | ------------------ | ------------ | ----------- |
| `kimi-k3.1-pro` | $2.00 / 1M         | $0.20 / 1M   | $10.00 / 1M |
| `kimi-k3`       | $3.00 / 1M         | $0.30 / 1M   | $15.00 / 1M |

> K3 and K3.1 Pro pricing is flat (no tiering by context length), and caching is automatic for repeated prefixes — a 90% discount on cached input. Cache writes are billed separately by TTL (5 minutes / 1 hour) on both models: K3's write rates are $3.00/M (5 min) and $6.00/M (1 h). The `kimi-k3.1-pro-highspeed` SKU costs more than K3.1 Pro. Check the [official pricing table](https://platform.kimi.ai/docs/pricing/chat) for current write rates and the Highspeed rate.
