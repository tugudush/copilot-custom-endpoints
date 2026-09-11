# Kimi (Moonshot) — VS Code Custom Endpoint Setup Guide

> **TL;DR:** Kimi K3 requires the local proxy. It is always-thinking and uses `reasoning_effort` (not the `thinking` parameter) while the proxy enforces Kimi's sampling constraints. Direct VS Code → Moonshot is not viable.
>
> **🆕 Kimi K3** (released July 16, 2026) is Kimi's flagship — 2.8T parameters, 1M context, AA Intelligence Index **59.7** (#4 overall, between GPT-5.6 Sol and Qwen 3.8 Max). Open-source weights coming by July 27, 2026.
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

| Model     | Vision | Context | Max output | Notes                                                                                                    |
| --------- | ------ | ------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| `kimi-k3` | ✅ Yes | 1M      | 131072     | **Flagship.** Always-thinking, uses `reasoning_effort` (not `thinking`). 2.8T params. AA Index **59.7**. |

> This guide documents the K3 setup. Deprecated K2 ids (`kimi-k2-0905-preview`, `kimi-k2-turbo-preview`, `kimi-k2-thinking`, etc.) were discontinued May 25, 2026.

## Quick Start

1. **Start the proxy** — `npm run proxy:kimi` (or `npx copilot-custom-endpoint kimi` standalone).
2. **Edit `chatLanguageModels.json`** — add the Kimi block below.
3. **Set your Moonshot API key** via Command Palette → **Chat: Manage Language Models**.
4. **Configure the Utility Small Model** — Open Settings → search **"Chat: Utility Small Model"** → pick your fastest model (e.g., DeepSeek V4 Flash or MiMo V2.5). [Why?](../../README.md#4-configure-the-utility-small-model)
5. **Restart VS Code** and pick "Kimi K3".

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
      "id": "kimi-k3",
      "name": "Kimi K3 (vision)",
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

> **K3 note:** `max_tokens` is set to **8192** as a safe starting point. K3 is always-thinking and very verbose (130M tokens generated on the AA Intelligence Index evaluation). The API default for `max_completion_tokens` is 131072 and can go up to 1048576, but reasoning tokens inflate response size — monitor your usage and adjust upward if needed. Unlike K2.7, K3 uses `reasoning_effort` (not `thinking`); the proxy handles this automatically.

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
- For **K3**: keeps thinking enabled (K3 is always-thinking and uses `reasoning_effort`, not `thinking`); rewrites to `temperature: 1`, `top_p: 0.95`. Does **not** inject a `thinking` block — K3 rejects it.
- Preserves streaming responses (SSE).
- Writes redacted request summaries to `debug_log/kimi-proxy.ndjson`.

## Notes

- **Kimi K3** (released July 16, 2026) is Kimi's new flagship. 2.8T params, 1M context, always-thinking. Uses `reasoning_effort` (currently only `max`) — do **not** send the K2.x `thinking` parameter. `tool_choice` supports `auto`, `required`, and named tools. `max_completion_tokens` defaults to 131072 and can go up to 1048576. Fixed sampling: `temperature=1`, `top_p=0.95`. Vision supports text + image + video (via `ms://<file-id>` URLs). See the [K3 quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart).
- **Kimi Platform rebranding:** the Kimi Platform (formerly Moonshot) rebranded to `platform.kimi.ai` in 2026 — `api.moonshot.ai` still resolves and the proxy targets it unchanged.
- **`tool_choice`:** K3 supports `auto`, `required`, and named tools. The proxy preserves the value and only enforces temperature/top_p.
- **K3 reasoning:** K3 uses `reasoning_effort` (currently only `max`) at the top level of the request body. Do not send the legacy `thinking` parameter — K3 rejects it.

## Troubleshooting

| Symptom                                                | Likely cause                 | Fix                                               |
| ------------------------------------------------------ | ---------------------------- | ------------------------------------------------- |
| "Connection refused" on chat                           | Proxy not running            | `npm run proxy:kimi`                              |
| `invalid temperature: only 1 is allowed`               | Direct path without proxy    | Use the proxy                                     |
| `invalid top_p: only 0.95 is allowed`                  | Direct path without proxy    | Use the proxy                                     |
| `thinking is enabled but reasoning_content is missing` | Tool turn with thinking on   | Verify `KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS=1` |
| `unsupported parameter: thinking` with K3              | K3 doesn't accept `thinking` | Use `reasoning_effort` instead; proxy detects K3  |
| Model not in VS Code picker                            | Config not reloaded          | Restart VS Code                                   |
| `tool_choice=required` rejected (K2.x)                 | Model limitation             | Use `auto` only for K2.x; K3 supports `required`  |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). Moonshot direct platform rates:

| Model     | Input (cache miss) | Cached input | Output      |
| --------- | ------------------ | ------------ | ----------- |
| `kimi-k3` | $3.00 / 1M         | $0.30 / 1M   | $15.00 / 1M |

> K3 pricing is flat (no tiering by context length).
