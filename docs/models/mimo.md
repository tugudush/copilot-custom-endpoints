# Xiaomi MiMo — VS Code Custom Endpoint Setup Guide

> **TL;DR:** MiMo V2.6 is now the current API family. The proxy-backed custom endpoint keeps V2.6 thinking enabled when `reasoning_content` is present and falls back to disabled thinking when VS Code drops that history field. Direct and proxy configurations are documented below.

## At a Glance

| Field                  | Value                                                                                                                  |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Recommended method** | **`proxy/mimo-proxy.mjs`** for V2.6 custom endpoints; the extension is still useful when its model picker exposes V2.6 |
| Alternative methods    | Direct API (static `thinking: disabled`) or the Xiaomi extension                                                       |
| Mode (custom endpoint) | **Direct** (static `thinking: disabled`) **or** **Proxy** (dynamic, local on `:3459`)                                  |
| Billing                | **Pay-as-You-Go** _or_ **Token Plan subscription** (shared `requestBody`)                                              |
| Vision                 | ✅ Yes (all V2.6 models)                                                                                               |
| Tool calling           | ✅ Yes; V2.6 preserves thinking only when the history includes `reasoning_content`                                     |
| Context                | 1M                                                                                                                     |
| Max output             | 131072                                                                                                                 |
| Endpoint               | `https://api.xiaomimimo.com/v1/chat/completions`                                                                       |
| Proxy endpoint         | `http://127.0.0.1:3459/v1/chat/completions`                                                                            |
| Auth                   | `Authorization: Bearer $MIMO_API_KEY`                                                                                  |

### Models

| Model                      | Vision | Context | Max output | Notes                                                              |
| -------------------------- | ------ | ------- | ---------- | ------------------------------------------------------------------ |
| `mimo-v2.6-pro`            | ✅     | 1M      | 131072     | Flagship full-modality reasoning for complex and long-horizon work |
| `mimo-v2.6-flash`          | ✅     | 1M      | 131072     | Lower-cost full-modality model for frequent calls                  |
| `mimo-v2.6-pro-ultraspeed` | ✅     | 1M      | 131072     | V2.6 Pro quality with the latency-focused UltraSpeed service       |

> Xiaomi's API requires the lowercase IDs above.

## Quick Start

### Recommended: V2.6 custom endpoint with proxy

1. Add the proxy configuration from the setup section below.
2. Start `npm run proxy:mimo` from the repository root.
3. Set your API key through **Chat: Manage Language Models**.
4. Pick **MiMo V2.6 Pro**, **MiMo V2.6 Flash**, or **MiMo V2.6 Pro UltraSpeed** in Copilot Chat.

The [Xiaomi MiMo for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) extension remains the best option when its picker exposes the V2.6 IDs because it can cache reasoning per tool call. The custom endpoint is useful when you need direct control over the model IDs, URL, or proxy behavior.

| Capability                       | Extension                            | Custom Endpoint                         |
| -------------------------------- | ------------------------------------ | --------------------------------------- |
| Thinking + tool calling together | ✅ Yes (reasoning cache)             | ✅ When `reasoning_content` is retained |
| Reasoning visible in agent mode  | ✅ Yes (`LanguageModelThinkingPart`) | ⚠️ Depends on request history           |
| Prompt caching feedback loop     | ✅ 97–99% cache hit rates            | ❌ No cache awareness                   |
| Token usage in context widget    | ✅ Yes                               | ❌ No                                   |
| `mimo-v2.6-pro-ultraspeed` model | Depends on extension version         | ✅ Yes                                  |
| Multi-region endpoint selector   | ✅ Built-in dropdown                 | ❌ Manual JSON edits                    |
| Dependencies                     | ✅ Zero (VS Code + Node built-ins)   | ❌ Requires proxy server                |

> **Prerequisites:** VS Code 1.116+, GitHub Copilot subscription (Free tier works), and a MiMo API key from [platform.xiaomimimo.com](https://platform.xiaomimimo.com/console/api-keys). MIT-licensed. Source: [Sdcb/xiaomimimo-for-copilot](https://github.com/Sdcb/xiaomimimo-for-copilot).

### Alternative: Direct API (static `thinking: disabled`)

Simplest no-proxy approach — but thinking is always off, so you never see model reasoning.

1. **Edit `chatLanguageModels.json`** — add the MiMo block(s) below.
2. **Set your `MIMO_API_KEY`** via Command Palette → **Chat: Manage Language Models**.
3. **Configure the Utility Small Model** — Open Settings → search **"Chat: Utility Small Model"** → pick your fastest model (e.g., DeepSeek V4 Flash or MiMo V2.6 Flash). [Why?](../../README.md#4-configure-the-utility-small-model)
4. **Restart VS Code** and pick one of the V2.6 entries.

### Alternative: With optional proxy (dynamic thinking)

The `proxy/mimo-proxy.mjs` preserves V2.6 thinking when assistant tool-call history contains `reasoning_content`. When VS Code sends a tool loop with missing reasoning history, it injects `thinking: { "type": "disabled" }` to avoid Xiaomi's 400 response.

- `npm run proxy:mimo` (from the repo root)
- `npx copilot-custom-endpoint mimo` (standalone)

When using the proxy, point model URLs to `http://127.0.0.1:3459/v1/chat/completions` and **remove** `thinking` from `requestBody`. The proxy handles it dynamically.

## Setup

### Recommended: VS Code Extension

1. Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot).
2. Run **MiMo: Set API Key** from the Command Palette.
3. (Optional) Run **MiMo: Open Settings** to configure endpoint region, max tokens, or model ID overrides.

**Extension settings:**

| Setting                         | Default                         | Description                                              |
| ------------------------------- | ------------------------------- | -------------------------------------------------------- |
| `mimo-copilot.baseUrl`          | `https://api.xiaomimimo.com/v1` | API endpoint — select a preset or pick 'Custom Endpoint' |
| `mimo-copilot.customBaseUrl`    | _(empty)_                       | Custom endpoint URL when baseUrl is 'Custom Endpoint'    |
| `mimo-copilot.maxTokens`        | `0`                             | Max output tokens (`0` = API default, capped at 131072)  |
| `mimo-copilot.modelIdOverrides` | `{}`                            | Override API model IDs for third-party proxies           |

The extension stores your API key in VS Code's `SecretStorage` (OS keychain).

### Alternative: Custom Endpoint (direct or proxy)

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

#### Direct (static `thinking: disabled`)

```json
{
  "name": "MiMo",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "mimo-v2.6-pro",
      "name": "MiMo V2.6 Pro",
      "url": "https://api.xiaomimimo.com/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "disabled" },
        "temperature": 1,
        "top_p": 0.95
      }
    },
    {
      "id": "mimo-v2.6-flash",
      "name": "MiMo V2.6 Flash",
      "url": "https://api.xiaomimimo.com/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "disabled" },
        "temperature": 1,
        "top_p": 0.95
      }
    },
    {
      "id": "mimo-v2.6-pro-ultraspeed",
      "name": "MiMo V2.6 Pro UltraSpeed",
      "url": "https://api.xiaomimimo.com/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "disabled" },
        "temperature": 1,
        "top_p": 0.95
      }
    }
  ]
}
```

#### With proxy (dynamic thinking, no `requestBody` override)

```json
{
  "name": "MiMo",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "mimo-v2.6-pro",
      "name": "MiMo V2.6 Pro",
      "url": "http://127.0.0.1:3459/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": { "temperature": 1, "top_p": 0.95 }
    },
    {
      "id": "mimo-v2.6-flash",
      "name": "MiMo V2.6 Flash",
      "url": "http://127.0.0.1:3459/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": { "temperature": 1, "top_p": 0.95 }
    },
    {
      "id": "mimo-v2.6-pro-ultraspeed",
      "name": "MiMo V2.6 Pro UltraSpeed",
      "url": "http://127.0.0.1:3459/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": { "temperature": 1, "top_p": 0.95 }
    }
  ]
}
```

### 1. API key (custom endpoint only)

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **MiMo** group → **Update API Key**.
4. Paste your MiMo API key.

> VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference. The extension uses its own **MiMo: Set API Key** command instead — skip this step if using the extension.

### 2. Token Plan (optional, all methods)

Token Plan subscribers use different base URLs and `tp-` prefixed keys from pay-as-you-go `sk-` keys. The **model id** and **`requestBody`** are the **same** for both billing modes — only the URL and key prefix differ.

| Mode          | Key prefix | Base URL (OpenAI)                         |
| ------------- | ---------- | ----------------------------------------- |
| Pay-as-you-go | `sk-…`     | `https://api.xiaomimimo.com/v1`           |
| Token Plan    | `tp-…`     | `https://token-plan-cn.xiaomimimo.com/v1` |

The extension has a built-in multi-region endpoint selector covering all Token Plan regions (China, Singapore, Amsterdam). With the custom endpoint method, update the `url` in `chatLanguageModels.json` and swap the key.

## Local Proxy

The `proxy/mimo-proxy.mjs` (optional) keeps V2.6 reasoning enabled when the conversation history is complete and suppresses it only when a tool loop is missing `reasoning_content`. If you want Xiaomi's full reasoning cache behavior, use an extension version that explicitly supports V2.6.

| Setting      | Value                                                 |
| ------------ | ----------------------------------------------------- |
| Script       | `proxy/mimo-proxy.mjs`                                |
| Listen URL   | `http://127.0.0.1:3459/v1/chat/completions`           |
| Health check | `curl http://127.0.0.1:3459/healthz`                  |
| Start        | `npm run proxy:mimo` (or `node proxy/mimo-proxy.mjs`) |
| Help         | `node proxy/mimo-proxy.mjs --help`                    |

When using the proxy, point model `url`s to `http://127.0.0.1:3459/v1/chat/completions` and **remove** `thinking` from `requestBody`. The proxy handles V2.6 history-aware fallback dynamically.

## Notes

- **Thinking is required for full agent quality.** MiMo V2.6 returns HTTP 400 if `reasoning_content` is missing from history when thinking is on. The proxy preserves thinking when that field is present and disables it as a compatibility fallback when VS Code drops it; an extension with a per-`tool_call_id` reasoning cache can keep thinking enabled throughout.
- **`tool_choice` other than `"auto"` is stripped** and treated as `"auto"`. Don't override it (VS Code's default is `auto`).
- **Rate limits:** 100 RPM / 10M TPM per model per account.
- **Vision and full modality:** V2.6 Pro, Flash, and Pro UltraSpeed accept text, image, video, and audio; VS Code custom endpoints expose image input through `vision: true`.

## Troubleshooting

| Symptom                                    | Likely cause                                             | Fix                                                                                                                                                           |
| ------------------------------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP 400 on the second turn of a tool loop | `reasoning_content` missing in history (thinking on)     | Use the proxy (`npm run proxy:mimo`), or add `thinking: { type: "disabled" }` to `requestBody`; an extension with a reasoning cache can keep thinking enabled |
| Vision request returns an error            | The model entry is missing `vision: true`                | Add `vision: true` to the model entry — every current MiMo model accepts image input                                                                          |
| Custom `tool_choice` ignored               | MiMo only honors `"auto"`                                | Stick to `auto`                                                                                                                                               |
| 401 Unauthorized                           | Wrong key, or Token Plan URL used with pay-as-you-go key | Match key prefix (`sk-` vs `tp-`) to the endpoint                                                                                                             |
| 429 rate-limited                           | Concurrent sessions exceeded 100 RPM / 10M TPM           | Reduce concurrent agent sessions                                                                                                                              |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). Overseas (international) pay-as-you-go rates:

| Model                      | Input (Cache Hit) | Input (Cache Miss) | Output     |
| -------------------------- | ----------------- | ------------------ | ---------- |
| `mimo-v2.6-pro`            | $0.0036 / 1M      | $0.435 / 1M        | $0.87 / 1M |
| `mimo-v2.6-flash`          | $0.0028 / 1M      | $0.14 / 1M         | $0.28 / 1M |
| `mimo-v2.6-pro-ultraspeed` | $0.036 / 1M       | $4.35 / 1M         | $8.70 / 1M |

> Cache writing is currently free of charge (limited-time offer). MiMo also offers a Token Plan subscription with discounted rates and a free cache-writing promotion.
