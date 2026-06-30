# Xiaomi MiMo — VS Code Custom Endpoint Setup Guide

> **TL;DR:** MiMo works direct with static `thinking: { type: "disabled" }` in `requestBody`, or via `proxy/mimo-proxy.mjs` for dynamic thinking suppression (reasoning visible in plain chat, suppressed in tool loops). Static suppression is simpler; the proxy lets you see reasoning in non-agent chats.
>
> **June 2026 provider notice:** Xiaomi says the legacy ids `mimo-v2-pro` and `mimo-v2-omni` have already been auto-switched to V2.5 replacements and billed at V2.5-series pricing. Xiaomi's same notice also retires an older legacy chat alias and the `mimo-v2-tts` alias. Requests that still use retired legacy aliases are scheduled to start failing after **2026-06-30 00:00 Beijing time**. This guide now documents only the current V2.5 chat ids.

## At a Glance

| Field                  | Value                                                                                                          |
| ---------------------- | -------------------------------------------------------------------------------------------------------------- |
| Mode                   | **Direct** (proxy optional)                                                                                    |
| Vision                 | ✅ Yes (`mimo-v2.5` only)                                                                                      |
| Tool calling           | ✅ Yes (with `thinking: disabled`)                                                                             |
| Context                | 1M (V2.5 Pro / V2.5)                                                                                           |
| Max output             | 131072 (V2.5 Pro) / 32768 (V2.5)                                                                               |
| Required `requestBody` | Direct: `thinking: { type: "disabled" }`<br>Proxy: none (proxy handles it)                                     |
| Endpoint               | Direct: `https://api.xiaomimimo.com/v1/chat/completions`<br>Proxy: `http://127.0.0.1:3459/v1/chat/completions` |

### Models at a glance

| Model           | Vision | Context | Role                                       |
| --------------- | ------ | ------- | ------------------------------------------ |
| `mimo-v2.5-pro` | ❌     | 1M      | Flagship text-only — best for agentic work |
| `mimo-v2.5`     | ✅     | 1M      | Omnimodal — text + image + video + audio   |

> Official June 2026 notice: legacy pre-V2.5 chat aliases now auto-route to V2.5 replacements and become invalid after **2026-06-30 00:00 Beijing time**. This guide intentionally omits retired alias names so new configs only show supported ids.

## Quick Start

### Direct (no proxy)

1. **Edit `chatLanguageModels.json`** — add the MiMo block(s) from [Setup](#setup) below.
2. **Set your `MIMO_API_KEY`** via Command Palette → **Chat: Manage Language Models**.
3. **Restart VS Code** and pick "MiMo V2.5 Pro" or "MiMo V2.5".

### With optional proxy (dynamic thinking)

The `proxy/mimo-proxy.mjs` provides dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tools are invoked.

- `npm run proxy:mimo` (from the repo root)
- `npx copilot-custom-endpoint mimo` (standalone, no clone needed)
- `npx copilot-custom-endpoint` (also starts the Kimi and Qwen proxies concurrently)
- `node proxy/mimo-proxy.mjs --help` — prints all supported environment variables and defaults

When using the proxy, update your model URLs to `http://127.0.0.1:3459/v1/chat/completions` and **remove** `thinking` from `requestBody`. The proxy handles it dynamically.

## Setup

### 1. VS Code configuration

Config file location:

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
      "requestBody": {
        "temperature": 1,
        "top_p": 0.95
      }
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
      "requestBody": {
        "temperature": 1,
        "top_p": 0.95
      }
    }
  ]
}
```

### 2. API key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **MiMo** group → **Update API Key**.
4. Paste your MiMo API key.

> After setting via the UI, VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference.

### 3. Token Plan (optional)

Token Plan subscribers use different base URLs and `tp-` prefixed keys from the pay-as-you-go `sk-` keys. The **model id** (`mimo-v2.5-pro`, `mimo-v2.5`) and **`requestBody`** (thinking, temperature, top_p) are the **same** for both billing modes — only the URL and key prefix differ.

| Mode          | Key prefix | Base URL (OpenAI)                         |
| ------------- | ---------- | ----------------------------------------- |
| Pay-as-you-go | `sk-…`     | `https://api.xiaomimimo.com/v1`           |
| Token Plan    | `tp-…`     | `https://token-plan-cn.xiaomimimo.com/v1` |

| Protocol  | Base URL (Token Plan)                            |
| --------- | ------------------------------------------------ |
| OpenAI    | `https://token-plan-cn.xiaomimimo.com/v1`        |
| Anthropic | `https://token-plan-cn.xiaomimimo.com/anthropic` |

> The same `requestBody` block (thinking, temperature, top_p) is shared between both modes. If you switch from PAYG to Token Plan, update the `url` in `chatLanguageModels.json` and swap the key — the rest of the config stays as-is. Note that the Token Plan endpoint is `token-plan-cn.xiaomimimo.com` (China-hosted), which differs from the PAYG endpoint `api.xiaomimimo.com`.

### 4. Legacy id retirement schedule

From Xiaomi's June 2026 deprecation notice:

| Legacy id      | Replacement     | Status on 2026-06-24                         | Final cutoff                  |
| -------------- | --------------- | -------------------------------------------- | ----------------------------- |
| `mimo-v2-pro`  | `mimo-v2.5-pro` | Auto-switched                                | 2026-06-30 00:00 Beijing time |
| `mimo-v2-omni` | `mimo-v2.5`     | Auto-switched                                | 2026-06-30 00:00 Beijing time |
| `mimo-v2-tts`  | `mimo-v2.5-tts` | Auto-switch on 2026-06-25 00:00 Beijing time | 2026-06-30 00:00 Beijing time |

Xiaomi's notice also includes an additional retired legacy chat alias that auto-switches to `mimo-v2.5`; it is intentionally omitted here so the examples only show the ids you should still configure.

For VS Code custom endpoint chat usage, configure the V2.5 ids directly rather than relying on retiring aliases.

## Configuration Reference

### Sampling parameters

| Task type            | `temperature` | `top_p` |
| -------------------- | ------------- | ------- |
| Agentic / tool-use   | `0.3`         | `0.95`  |
| Vibe coding          | `0.3`         | `0.95`  |
| General conversation | `0.8`         | `0.95`  |
| Math reasoning       | `1.0`         | `0.95`  |

> For `mimo-v2.5-pro` and `mimo-v2.5`, MiMo's docs recommend `temperature: 1.0` and `top_p: 0.95` regardless of task. In thinking mode these models also **lock** `temperature` to `1.0` — any custom value is silently overridden. Since we disable thinking, your `requestBody` value is honored.

MiMo accepts `temperature` in `[0, 1.5]` and `top_p` in `[0.01, 1.0]`.

### Thinking mode

| Model                        | API default `thinking.type` | API default `temperature`  |
| ---------------------------- | --------------------------- | -------------------------- |
| `mimo-v2.5-pro`, `mimo-v2.5` | `enabled`                   | `1.0` (locked in thinking) |

When thinking is enabled, responses include a `reasoning_content` field alongside `content` and `tool_calls`.

### Capabilities

- Streaming (SSE, standard OpenAI format).
- Tool calling with `tool_choice: "auto"`.
- Vision (image input via OpenAI `content` array) on `mimo-v2.5` only.
- `tool_choice` other than `"auto"` is **stripped** and treated as `"auto"`.
- `mimo-v2.5` also supports video and audio understanding.

### Rate limits

**100 RPM / 10M TPM** per model per account.

## Troubleshooting

| Symptom                                    | Likely cause                                             | Fix                                                                                            |
| ------------------------------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| HTTP 400 on the second turn of a tool loop | `reasoning_content` missing in history (thinking on)     | Add `thinking: { type: "disabled" }` to `requestBody`, or use the proxy (`npm run proxy:mimo`) |
| Vision request returns an error            | Used `mimo-v2.5-pro` (text-only)                         | Use `mimo-v2.5` for vision                                                                     |
| Custom `tool_choice` ignored               | MiMo only honors `"auto"`                                | Stick to `auto`                                                                                |
| 401 Unauthorized                           | Wrong key, or Token Plan URL used with pay-as-you-go key | Match key prefix (`sk-` vs `tp-`) to the endpoint                                              |
| 429 rate-limited                           | Concurrent sessions exceeded 100 RPM / 10M TPM           | Reduce concurrent agent sessions                                                               |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). Overseas (international) pay-as-you-go rates:

| Model           | Input (Cache Hit) | Input (Cache Miss) | Output     |
| --------------- | ----------------- | ------------------ | ---------- |
| `mimo-v2.5-pro` | $0.20 / 1M        | $1.00 / 1M         | $3.00 / 1M |
| `mimo-v2.5`     | $0.08 / 1M        | $0.40 / 1M         | $2.00 / 1M |

> Cache writing is currently free of charge (limited-time offer). MiMo also offers a Token Plan subscription with discounted rates and a free cache-writing promotion.

---

## Background & Findings

> This appendix preserves the validation narrative for future reference. It is not required to use the model.

### The critical `reasoning_content` constraint

When thinking mode is enabled and the conversation history contains tool calls, the `reasoning_content` field **must** be fully passed back in every subsequent assistant message. Otherwise, the API returns HTTP 400.

This is the same class of problem as Qwen's `reasoning_content` issue, but **stricter**: MiMo's API actively rejects requests with missing historical `reasoning_content`, rather than silently degrading.

**Implication for VS Code Copilot:** VS Code's agent mode is unlikely to preserve `reasoning_content` across multi-turn tool loops. Therefore:

- **Thinking enabled + tool calling = broken** (400 errors after the first tool round-trip).
- **Thinking disabled + tool calling = works** (no `reasoning_content` to preserve).
- **Thinking enabled + plain chat = works** (no tool calls in history).

### Proxy for dynamic thinking suppression

A dynamic proxy (`proxy/mimo-proxy.mjs`) is now available — same pattern as `proxy/qwen-proxy.mjs`. It suppresses thinking only when tools are present, letting plain chat show reasoning while keeping tool loops stable.

- **Plain chat** → `thinking` is removed from the request body, so MiMo uses its API default (enabled for V2.5 Pro / V2.5).
- **Tool-enabled requests** → `thinking: { type: "disabled" }` is injected, preventing `reasoning_content` 400 errors.

Static suppression (direct mode) remains a perfectly valid simpler alternative.

### Benchmark highlights (from official MiMo V2.5 announcement)

| Model           | SWE-Bench Verified | SWE-Bench Pro | Terminal-Bench 2.0 | AIME 2025 |
| --------------- | ------------------ | ------------- | ------------------ | --------- |
| `mimo-v2.5-pro` | —                  | 57.2%         | 68.4%              | —         |
| `mimo-v2.5`     | —                  | 56.1%         | —                  | —         |

> `mimo-v2.5` additionally scores 87.7% on Video-MME and 62.3% on Claw-Eval Text.

### Validation results

| #   | Test                                      | Model           | Result                                                                                |
| --- | ----------------------------------------- | --------------- | ------------------------------------------------------------------------------------- |
| 1   | Add provider to `chatLanguageModels.json` | All             | ✅                                                                                    |
| 2   | Plain chat in VS Code                     | `mimo-v2.5-pro` | ✅ — model self-identified as MiMo 1T-param                                           |
| 3   | Agent mode (tool calling)                 | `mimo-v2.5-pro` | ✅ — file reads, browser automation, terminal, image viewing all worked               |
| 4   | Vision                                    | `mimo-v2.5`     | ✅ — analyzed an attached screenshot (Facebook post, browser tabs, sidebar) in detail |

External API checks (curl):

| Check              | Model           | Result |
| ------------------ | --------------- | ------ |
| Non-streaming chat | `mimo-v2.5-pro` | ✅     |

### Known risks

| Risk                                  | Detail                                                             | Mitigation                                                                 |
| ------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| `reasoning_content` 400 errors        | If thinking is accidentally enabled in tool loops, API returns 400 | Set `thinking.type: "disabled"` in `requestBody` (direct) or use the proxy |
| `tool_choice` only supports `"auto"`  | Non-`auto` values are stripped                                     | Should not affect VS Code, which uses `auto`                               |
| Auth header format                    | Both `api-key:` and `Authorization: Bearer` work                   | VS Code sends `Authorization: Bearer` — works directly                     |
| `temperature` locked in thinking mode | V2.5 Pro / V2.5 force `temperature: 1.0` when thinking is on       | Not an issue when thinking is disabled                                     |
| 1M context window                     | VS Code may not send enough tokens to benefit                      | Set conservatively; adjust after testing                                   |

## References

- API Platform: `https://platform.xiaomimimo.com/`
- OpenAI API Reference: `https://platform.xiaomimimo.com/docs/en-US/api/chat/openai-api`
- First API Call Guide: `https://platform.xiaomimimo.com/docs/en-US/quick-start/first-api-call`
- Model & Rate Limits: `https://platform.xiaomimimo.com/docs/en-US/quick-start/model`
- Model Hyperparameters: `https://platform.xiaomimimo.com/docs/en-US/quick-start/model-hyperparameters`
- Pricing: `https://platform.xiaomimimo.com/docs/en-US/pricing`
- `reasoning_content` Guide: `https://platform.xiaomimimo.com/docs/en-US/usage-guide/passing-back-reasoning_content`
- AI Tools Integration: `https://platform.xiaomimimo.com/docs/en-US/integration/claude-code`
- HuggingFace (MiMo-V2.5): `https://huggingface.co/XiaomiMiMo/MiMo-V2.5`
- HuggingFace (MiMo-V2.5-Pro): `https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro`
- MiMo V2.5 Blog: `https://mimo.xiaomi.com/mimo-v2-5`
- AI Studio (playground): `https://aistudio.xiaomimimo.com/`
