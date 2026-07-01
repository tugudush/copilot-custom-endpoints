# Qwen (DashScope) — VS Code Custom Endpoint Setup Guide

> **TL;DR:** `qwen3.7-plus` (vision) and `qwen3.7-max` (text) work both direct and via the local proxy. The proxy gives you dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tools are invoked. The direct path is simpler if you don't need reasoning in chat.

## At a Glance

| Field                           | Value                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Mode                            | **Proxy** (local on `:3458`) **or** **Direct** (static `enable_thinking: false`) |
| Billing                         | **Pay-as-You-Go only** — 1M-token free quota for new users                       |
| Vision                          | ✅ Yes (`qwen3.7-plus`)                                                          |
| Tool calling                    | ✅ Yes                                                                           |
| Context                         | 1M                                                                               |
| Required `requestBody` (direct) | `enable_thinking: false`                                                         |
| Required `requestBody` (proxy)  | none — proxy injects based on tool activity                                      |
| Endpoint                        | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`        |
| Proxy endpoint                  | `http://127.0.0.1:3458/v1/chat/completions`                                      |

### Models

| Model          | Vision | Role                                   |
| -------------- | ------ | -------------------------------------- |
| `qwen3.7-plus` | ✅ Yes | Primary model with image understanding |
| `qwen3.7-max`  | ❌ No  | Larger text-only model                 |

> The live `chatLanguageModels.json` points Qwen at the local proxy by default; the direct DashScope URL is shown below for users who prefer a static `enable_thinking: false` setup.

## Quick Start — With Proxy (recommended)

1. **Start the proxy:** `npm run proxy:qwen` (or `npx copilot-custom-endpoint qwen`).
2. **Use the proxy-path JSON snippet** below.
3. **Set your DashScope API key** via Command Palette → **Chat: Manage Language Models**.
4. **Restart VS Code.** Reasoning will be visible in plain chat and suppressed on tool turns.

## Quick Start — Direct (no proxy)

1. **Use the direct-path JSON snippet** below.
2. **Set your `DASHSCOPE_API_KEY`** via Command Palette → **Chat: Manage Language Models**.
3. **Restart VS Code** and pick "Qwen 3.7 Plus" or "Qwen 3.7 Max".

## Setup

### Regional endpoints

DashScope is region-specific — your API key only works on the endpoint it was created for:

| Region        | Endpoint                                                                  |
| ------------- | ------------------------------------------------------------------------- |
| Singapore     | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` |
| China         | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`      |
| US (Virginia) | `https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions`   |

### 1. VS Code configuration

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

#### Direct path

```json
{
  "name": "Qwen",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "qwen3.7-max",
      "name": "Qwen 3.7 Max (text)",
      "url": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true,
      "requestBody": { "enable_thinking": false }
    },
    {
      "id": "qwen3.7-plus",
      "name": "Qwen 3.7 Plus (vision)",
      "url": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "requestBody": { "enable_thinking": false }
    }
  ]
}
```

> The live `chatLanguageModels.json` points Qwen at the local proxy with no `requestBody` override; use the snippet above only if you're not running the proxy.

#### Proxy path

1. Start the proxy:

   ```bash
   node proxy/qwen-proxy.mjs
   ```

   Verify:

   ```bash
   curl http://127.0.0.1:3458/healthz
   ```

2. Use this snippet (URLs point at the proxy; no `requestBody` override):

```json
{
  "name": "Qwen",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "qwen3.7-max",
      "name": "Qwen 3.7 Max (text)",
      "url": "http://127.0.0.1:3458/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true
    },
    {
      "id": "qwen3.7-plus",
      "name": "Qwen 3.7 Plus (vision)",
      "url": "http://127.0.0.1:3458/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true
    }
  ]
}
```

> **Keep the proxy terminal open** while using Qwen via proxy.

#### Proxy environment variables

Set in `.env` at the repo root.

| Variable                                 | Default                                                                   | Purpose                                            |
| ---------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| `QWEN_PROXY_PORT`                        | `3458`                                                                    | Local listen port                                  |
| `QWEN_UPSTREAM_URL`                      | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` | Upstream DashScope endpoint                        |
| `QWEN_PROXY_LOG`                         | `debug_log/qwen-proxy.ndjson`                                             | Redacted NDJSON log path                           |
| `QWEN_PROXY_DISABLE_THINKING_WITH_TOOLS` | `1`                                                                       | Set to `0` to skip tool-aware thinking suppression |

#### What the proxy does

The proxy detects active tool use by examining the conversation state (a `"tool"`-role message in history or a non-default `tool_choice`), not just the presence of a `tools` array. This correctly handles tool-enabled conversations even when the client sends `tools` in an earlier request but omits it from subsequent turns.

| Condition                                                     | Action                                |
| ------------------------------------------------------------- | ------------------------------------- |
| Tool-role message in history **or** non-default `tool_choice` | Inject `enable_thinking: false`       |
| Plain chat (no tool activity)                                 | Delete `enable_thinking` (default ON) |

### 2. API key

DashScope is **Pay-as-You-Go only** — but new Model Studio users get **1M input + 1M output tokens per model free for 90 days**. Prepaid token packages are also available.

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **Qwen** group → **Update API Key**.
4. Paste your DashScope API key.

> VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference. Keys are region-specific.

## Notes

- **Vision (`qwen3.7-plus`)** uses OpenAI-compatible `content` array format. Base64 data URIs work reliably; external image URLs may fail if DashScope can't reach them. If a drag-and-drop image fails to load, providing the absolute file path (e.g. `c:\path\to\image.png`) in the prompt is a reliable workaround.
- **Thinking trade-off:** Direct = thinking always off (loops stable, no reasoning visible). Proxy = thinking on in plain chat, off in tool turns.
- **`tool_choice` only supports `auto`** — don't override it (VS Code's default is `auto`).

## Troubleshooting

| Symptom                                         | Likely cause                                 | Fix                                                                                                          |
| ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| "Connection refused" (proxy mode)               | Proxy not running                            | `npm run proxy:qwen`                                                                                         |
| Tool loops fail with `reasoning_content` errors | Direct path missing `enable_thinking: false` | Add `enable_thinking: false` to `requestBody`                                                                |
| Tool loops still fail with proxy                | Proxy not rewriting                          | Check `debug_log/qwen-proxy.ndjson` — verify `hasTools: true` requests have `rewrittenEnableThinking: false` |
| Vision fails with external image URL            | DashScope couldn't reach the URL             | Use a base64 data URI instead                                                                                |
| 401 Unauthorized                                | API key region mismatch                      | Match your key to the regional endpoint                                                                      |
| Want to switch back to direct                   | Proxy mode active                            | Revert `url` to DashScope endpoint and restore `requestBody.enable_thinking: false`                          |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). DashScope (international) rates for **non-thinking** mode:

| Model          | Input (≤ 256K tokens) | Input (> 256K tokens) | Output (≤ 256K tokens) | Output (> 256K tokens) |
| -------------- | --------------------- | --------------------- | ---------------------- | ---------------------- |
| `qwen3.7-plus` | $0.40 / 1M            | $1.20 / 1M            | $1.60 / 1M             | $4.80 / 1M             |
| `qwen3.7-max`  | $2.50 / 1M (≤ 1M)     | —                     | $7.50 / 1M (≤ 1M)      | —                      |

> Free quota: 1M input + 1M output tokens per model, valid 90 days after activating Model Studio.
