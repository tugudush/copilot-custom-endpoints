# Xiaomi MiMo — VS Code Copilot Chat Setup Guide

> **TL;DR:** The recommended path is the [Xiaomi MiMo for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) VS Code extension — it supports thinking mode WITH tool calling, prompt caching feedback, reasoning visibility in agent mode, and token usage reporting, with zero dependencies. Two alternative methods are documented below for users who prefer direct `chatLanguageModels.json` control.

## At a Glance

| Field                  | Value                                                                                                                                        |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recommended method** | **[Xiaomi MiMo for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot)** VS Code extension |
| Alternative methods    | Direct API (static `thinking: disabled`) or `proxy/mimo-proxy.mjs` (dynamic suppression)                                                     |
| Vision                 | ✅ Yes (`mimo-v2.5` only)                                                                                                                    |
| Tool calling           | ✅ Yes (with thinking disabled, OR thinking enabled via the extension's reasoning cache)                                                     |
| Context                | 917K (extension) / 1M (custom endpoint)                                                                                                      |
| Max output             | 131072 (V2.5 Pro) / 32768 (V2.5)                                                                                                             |
| Dependencies           | Extension: **none**. Proxy method: Node.js + `proxy/mimo-proxy.mjs`                                                                          |

### Models

| Model                      | Vision | Context | Role                                                                  |
| -------------------------- | ------ | ------- | --------------------------------------------------------------------- |
| `mimo-v2.5-pro-ultraspeed` | ❌     | 917K    | Fast Pro reasoning for latency-sensitive agent tasks (extension only) |
| `mimo-v2.5-pro`            | ❌     | 917K    | Flagship text-only — best for deep reasoning                          |
| `mimo-v2.5`                | ✅     | 917K    | Omnimodal — text + image + video + audio                              |

> `mimo-v2.5-pro-ultraspeed` is only available through the VS Code extension. Custom-endpoint methods below cover `mimo-v2.5-pro` and `mimo-v2.5`.

## Quick Start

### Recommended: VS Code Extension

1. **Install** from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot).
2. **Set your API key** — run **MiMo: Set API Key** from the Command Palette (`Ctrl+Shift+P`).
3. **Pick a model** in Copilot Chat's model picker — choose **MiMo-V2.5-Pro-UltraSpeed**, **MiMo V2.5 Pro**, or **MiMo V2.5**.
4. That's it — chat away.

**Why the extension over custom endpoints:**

| Capability                       | Extension                            | Custom Endpoint                        |
| -------------------------------- | ------------------------------------ | -------------------------------------- |
| Thinking + tool calling together | ✅ Yes (reasoning cache)             | ❌ Must disable thinking on tool turns |
| Reasoning visible in agent mode  | ✅ Yes (`LanguageModelThinkingPart`) | ❌ Hidden (suppressed by proxy)        |
| Prompt caching feedback loop     | ✅ 97–99% cache hit rates            | ❌ No cache awareness                  |
| Token usage in context widget    | ✅ Yes                               | ❌ No                                  |
| `mimo-v2.5-pro-ultraspeed` model | ✅ Yes                               | ❌ Not available                       |
| Multi-region endpoint selector   | ✅ Built-in dropdown                 | ❌ Manual JSON edits                   |
| Dependencies                     | ✅ Zero (VS Code + Node built-ins)   | ❌ Requires proxy server               |

> **Prerequisites:** VS Code 1.116+, GitHub Copilot subscription (Free tier works), and a MiMo API key from [platform.xiaomimimo.com](https://platform.xiaomimimo.com/console/api-keys). MIT-licensed. Source: [Sdcb/xiaomimimo-for-copilot](https://github.com/Sdcb/xiaomimimo-for-copilot).

### Alternative: Direct API (static `thinking: disabled`)

Simplest no-proxy approach — but thinking is always off, so you never see model reasoning.

1. **Edit `chatLanguageModels.json`** — add the MiMo block(s) below.
2. **Set your `MIMO_API_KEY`** via Command Palette → **Chat: Manage Language Models**.
3. **Restart VS Code** and pick "MiMo V2.5 Pro" or "MiMo V2.5".

### Alternative: With optional proxy (dynamic thinking)

The `proxy/mimo-proxy.mjs` provides dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tools are invoked. A middle ground — reasoning visible in chat, suppressed in agent mode.

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
      "id": "mimo-v2.5-pro",
      "name": "MiMo V2.5 Pro (text)",
      "url": "https://api.xiaomimimo.com/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
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
      "id": "mimo-v2.5",
      "name": "MiMo V2.5 (vision)",
      "url": "https://api.xiaomimimo.com/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 32768,
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
      "id": "mimo-v2.5-pro",
      "name": "MiMo V2.5 Pro (text)",
      "url": "http://127.0.0.1:3459/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": { "temperature": 1, "top_p": 0.95 }
    },
    {
      "id": "mimo-v2.5",
      "name": "MiMo V2.5 (vision)",
      "url": "http://127.0.0.1:3459/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 32768,
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

## Notes

- **Thinking is required for full agent quality.** MiMo returns HTTP 400 if `reasoning_content` is missing from history when thinking is on. Custom endpoints disable thinking on tool turns to avoid this; the extension solves it natively via a per-`tool_call_id` reasoning cache.
- **`tool_choice` other than `"auto"` is stripped** and treated as `"auto"`. Don't override it (VS Code's default is `auto`).
- **Rate limits:** 100 RPM / 10M TPM per model per account.
- **Vision (image input via OpenAI `content` array) is only on `mimo-v2.5`.** `mimo-v2.5-pro` and `mimo-v2.5-pro-ultraspeed` are text-only.

## Troubleshooting

| Symptom                                    | Likely cause                                             | Fix                                                                                                                                                              |
| ------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| HTTP 400 on the second turn of a tool loop | `reasoning_content` missing in history (thinking on)     | **Use the extension** (it caches reasoning per tool-call ID). Or: add `thinking: { type: "disabled" }` to `requestBody`, or use the proxy (`npm run proxy:mimo`) |
| Vision request returns an error            | Used `mimo-v2.5-pro` (text-only)                         | Use `mimo-v2.5` for vision                                                                                                                                       |
| Custom `tool_choice` ignored               | MiMo only honors `"auto"`                                | Stick to `auto`                                                                                                                                                  |
| 401 Unauthorized                           | Wrong key, or Token Plan URL used with pay-as-you-go key | Match key prefix (`sk-` vs `tp-`) to the endpoint                                                                                                                |
| 429 rate-limited                           | Concurrent sessions exceeded 100 RPM / 10M TPM           | Reduce concurrent agent sessions                                                                                                                                 |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). Overseas (international) pay-as-you-go rates:

| Model           | Input (Cache Hit) | Input (Cache Miss) | Output     |
| --------------- | ----------------- | ------------------ | ---------- |
| `mimo-v2.5-pro` | $0.20 / 1M        | $1.00 / 1M         | $3.00 / 1M |
| `mimo-v2.5`     | $0.08 / 1M        | $0.40 / 1M         | $2.00 / 1M |

> Cache writing is currently free of charge (limited-time offer). MiMo also offers a Token Plan subscription with discounted rates and a free cache-writing promotion.
