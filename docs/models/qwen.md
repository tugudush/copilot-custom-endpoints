# Qwen (DashScope) — VS Code Custom Endpoint Setup Guide

> **TL;DR:** The live config points `qwen3.7-plus` (vision) and `qwen3.7-max` (text-only) at `proxy/qwen-proxy.mjs` for dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tools are invoked. A direct DashScope path with static `enable_thinking: false` is also supported if you prefer not to run the proxy.

## At a Glance

| Field                           | Value                                                                            |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Mode                            | **Proxy** (local on `:3458`) **or** **Direct** (static `enable_thinking: false`) |
| Vision                          | ✅ Yes (`qwen3.7-plus`)                                                          |
| Tool calling                    | ✅ Yes                                                                           |
| Context                         | 1M                                                                               |
| Required `requestBody` (direct) | `enable_thinking: false`                                                         |
| Required `requestBody` (proxy)  | none — proxy injects based on tool activity in the conversation                  |
| Endpoint                        | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`        |
| Proxy endpoint                  | `http://127.0.0.1:3458/v1/chat/completions`                                      |

### Models at a glance

| Model          | Vision | Role                                   |
| -------------- | ------ | -------------------------------------- |
| `qwen3.7-plus` | ✅ Yes | Primary model with image understanding |
| `qwen3.7-max`  | ❌ No  | Larger text-only model                 |

> The live `chatLanguageModels.json` points Qwen models at the local proxy by default; the direct DashScope URL is shown for users who prefer a static `enable_thinking: false` setup.

## Quick Start — With Proxy (Recommended)

1. **Start the proxy** — choose one:
   - `npm run proxy:qwen` (from the repo root)
   - `npx copilot-custom-endpoint qwen` (standalone, no clone needed)
   - `npx copilot-custom-endpoint` (also starts the Kimi and MiMo proxies concurrently)
2. **Edit `chatLanguageModels.json`** — use the proxy-path block from [Setup § Proxy](#proxy-path) below.
3. **Set your DashScope API key** via the Language Models UI.
4. **Restart VS Code.** Reasoning will be visible in plain chat and suppressed on tool turns.

## Quick Start — Direct Path (No Proxy)

1. **Edit `chatLanguageModels.json`** — add the Qwen block from [Setup § Direct](#direct-path) below.
2. **Set your `DASHSCOPE_API_KEY`** via Command Palette → **Chat: Manage Language Models**.
3. **Restart VS Code** and pick "Qwen 3.7 Plus" or "Qwen 3.7 Max".

## Setup

### Regional endpoints

DashScope is region-specific — your API key only works on the endpoint it was created for:

| Region                             | Endpoint                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------- |
| **Singapore (used in this guide)** | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` |
| China (Beijing)                    | `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`      |
| US (Virginia)                      | `https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions`   |

### Direct path

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
      "requestBody": {
        "enable_thinking": false
      }
    },
    {
      "id": "qwen3.7-plus",
      "name": "Qwen 3.7 Plus (vision)",
      "url": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "requestBody": {
        "enable_thinking": false
      }
    }
  ]
}
```

> **`enable_thinking: false`** suppresses the Qwen3 family's default thinking mode, which prevents `reasoning_content` issues during tool loops.

> **Live config note:** The checked-in `chatLanguageModels.json` points Qwen at the local proxy (`http://127.0.0.1:3458`) with no `requestBody` override, so the proxy manages `enable_thinking` dynamically. Use the snippet above only if you are not running the proxy.

### Proxy path

#### 1. Start the proxy

```bash
node proxy/qwen-proxy.mjs
```

Expected output:

```
[qwen-proxy] listening on http://127.0.0.1:3458/v1/chat/completions
[qwen-proxy] forwarding to https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions
```

Verify it's alive:

```bash
curl http://127.0.0.1:3458/healthz
```

Expected response:

```json
{
  "ok": true,
  "upstreamUrl": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
  "port": 3458,
  "disableThinkingWithTools": true
}
```

#### 2. Update VS Code config — point URLs to the proxy and remove `requestBody.enable_thinking`

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

All can be set in a `.env` file at the repo root (both proxies `import 'dotenv/config'` automatically).

| Variable                                 | Default                                                                   | Purpose                                            |
| ---------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| `QWEN_PROXY_PORT`                        | `3458` (falls back to `PORT`)                                             | Local listen port                                  |
| `QWEN_UPSTREAM_URL`                      | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` | Upstream DashScope endpoint                        |
| `QWEN_PROXY_LOG`                         | `debug_log/qwen-proxy.ndjson` (relative to proxy script)                  | Redacted NDJSON log path                           |
| `QWEN_PROXY_DISABLE_THINKING_WITH_TOOLS` | `1`                                                                       | Set to `0` to skip tool-aware thinking suppression |

#### Proxy request rewriting rules

The proxy detects active tool use by examining the conversation state, not just the `tools` array:

| Condition                                                                                             | Action                                                      |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| A `"tool"`-role message exists in the conversation **or** `tool_choice` is set to a non-default value | Set `body.enable_thinking = false`                          |
| No tool-role messages and no non-default `tool_choice` (plain chat)                                   | Delete `body.enable_thinking` (let model default to `true`) |

> **Why delete rather than set `true`?** Omitting the key lets Qwen use its built-in default (`true`). Deletion is closer to "don't interfere."
>
> **Why not check `body.tools`?** The proxy checks for tool _activity_ — tool results in the message history or an explicit `tool_choice` directive — rather than the mere presence of a tools array. This correctly handles tool-enabled conversations even when the client sends `tools` in an earlier request but omits it from subsequent turns.
>
> **Proxy vs. direct:** The live config uses the proxy URL with no `requestBody` override so this dynamic behavior is applied to every request. The direct-path snippet above keeps `enable_thinking: false` static in `requestBody` as a no-proxy alternative.

### API key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **Qwen** group → **Update API Key**.
4. Paste your DashScope API key.

> After setting via the UI, VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference.

## Configuration Reference

### Thinking mode

The Qwen3 hybrid-thinking models default to `enable_thinking: true`, producing `reasoning_content` in responses. This is **harmless in plain chat** (you see the model's reasoning) but **breaks agent/tool-calling loops**: VS Code may not preserve `reasoning_content` in follow-up tool-result messages, and the model may reject the continuation.

| Mode                | Plain chat                      | Tool turns                    |
| ------------------- | ------------------------------- | ----------------------------- |
| Direct path         | Thinking OFF (always)           | Thinking OFF                  |
| Proxy path          | Thinking ON (default preserved) | Thinking OFF (auto-injected)  |
| No config (default) | Thinking ON                     | Risk: history may be rejected |

> The live `chatLanguageModels.json` uses the proxy path by default, so plain-chat reasoning is visible and tool turns are stable.

### Vision (`qwen3.7-plus`)

- Image input via OpenAI-compatible `content` array format (base64 data URIs).
- **External image URLs may fail** if DashScope's servers cannot reach them — base64-encoded images work reliably.
- **Image attachment behavior**: Unlike some other models, Qwen may fail to read images that are directly dragged and dropped into the Copilot Chat. If this happens, provide the absolute file path to the image (e.g., `c:\path\to\image.png`) in your prompt as a reliable workaround.
- **Pricing**: **$0.40 / $1.60 per 1M input/output (≤ 256K)** and **$1.20 / $4.80 per 1M (> 256K)**.

### Capabilities

- Streaming (SSE, `data: [DONE]` terminator).
- Tool calling with `tools` array and `tool_calls` response.
- Vision (image input) on `qwen3.7-plus`.
- Non-OpenAI extras: `enable_thinking`, `thinking_budget`, `enable_search` (via `extra_body`).

## Troubleshooting

| Symptom                                         | Likely cause                                 | Fix                                                                                                          |
| ----------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| "Connection refused" (proxy mode)               | Proxy not running                            | `npm run proxy:qwen`                                                                                         |
| Tool loops fail with `reasoning_content` errors | Direct path missing `enable_thinking: false` | Add `enable_thinking: false` to `requestBody`                                                                |
| Tool loops still fail with proxy                | Proxy not rewriting                          | Check `debug_log/qwen-proxy.ndjson` — verify `hasTools: true` requests have `rewrittenEnableThinking: false` |
| Vision fails with external image URL            | DashScope couldn't reach the URL             | Use a base64 data URI instead                                                                                |
| 401 Unauthorized                                | API key region mismatch                      | Match your key to the regional endpoint                                                                      |
| Intermittent `net::ERR_CONNECTION_RESET`        | Transient VS Code / Electron transport       | Retry; not reproducible via `curl` or Node.js                                                                |
| Want to switch back to direct                   | Proxy mode active                            | Revert `url` to DashScope endpoint and restore `requestBody.enable_thinking: false`                          |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). DashScope (international) rates for **non-thinking** mode:

| Model          | Input (≤ 256K tokens) | Input (> 256K tokens) | Output (≤ 256K tokens) | Output (> 256K tokens) |
| -------------- | --------------------- | --------------------- | ---------------------- | ---------------------- |
| `qwen3.7-plus` | $0.40 / 1M            | $1.20 / 1M            | $1.60 / 1M             | $4.80 / 1M             |
| `qwen3.7-max`  | $2.50 / 1M (≤ 1M)     | —                     | $7.50 / 1M (≤ 1M)      | —                      |

> **Free quota:** DashScope offers 1M input + 1M output tokens per model, valid for 90 days after activating Model Studio.

---

## Background & Findings

> This appendix preserves the validation narrative for future reference. It is not required to use the model.

### Why a proxy is useful (and why a static `enable_thinking: false` is enough)

Both work — pick based on your preference:

- **Direct path** is the simplest: static `enable_thinking: false` suppresses reasoning in all requests. Tool loops stay stable. Trade-off: you never see the model's thought process.
- **Proxy path** is dynamic: reasoning stays ON in plain chat (you see it), and the proxy automatically sets `enable_thinking: false` when `tools` is present (loops stay stable). Best of both worlds, at the cost of running a local process.

### Validation results (June 1, 2026)

#### Proxy validation (8 checks, all passed)

| #   | Check                                    | Result                                                                           |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Proxy starts                             | ✅ `--help` prints correct usage and defaults                                    |
| 2   | Health check                             | ✅ Returns `{"ok":true,"port":3458,...}`                                         |
| 3   | Plain chat (no tools) → thinking ON      | ✅ Response contains `reasoning_content`; `enable_thinking` deleted              |
| 4   | Tool chat (tools present) → thinking OFF | ✅ No `reasoning_content`; clean `tool_calls`; `enable_thinking: false` injected |
| 5   | Streaming passthrough                    | ✅ SSE chunks arrive correctly with `text/event-stream`                          |
| 6   | Error passthrough                        | ✅ Invalid JSON returns HTTP 400 with useful error message                       |
| 7   | Auth passthrough                         | ✅ Missing key → 401; valid key → 200                                            |
| 8   | Logging                                  | ✅ All entries redact `Authorization: Bearer <redacted>`                         |

#### Direct-path validation — `qwen3.7-max`

| Capability                                   | Result | Notes                                                                  |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------- |
| Non-streaming chat (curl)                    | ✅     | HTTP 200, valid assistant message; `reasoning_content` present         |
| Streaming chat (curl)                        | ✅     | HTTP 200, SSE chunks; `reasoning_content` streamed alongside `content` |
| Tool-enabled chat (thinking on)              | ✅     | HTTP 200, `finish_reason: tool_calls` — `reasoning_content` present    |
| Tool-enabled chat (`enable_thinking: false`) | ✅     | HTTP 200, clean OpenAI shape, no `reasoning_content`, 25 tokens vs 170 |
| Model appears in VS Code picker              | ✅     | "Agent \| Qwen 3.7 Max" confirmed                                      |
| Plain chat in VS Code                        | ✅     | Streaming output confirmed                                             |
| Streaming in VS Code                         | ✅     | Token-by-token streaming confirmed                                     |
| Tool / agent use in VS Code                  | ✅     | Browser tool invoked successfully                                      |

#### Direct-path validation — `qwen3.7-plus`

| Capability                                   | Result | Notes                                                                        |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------- |
| Non-streaming chat (curl)                    | ✅     | HTTP 200; `reasoning_content` present (727 reasoning tokens)                 |
| Streaming chat (curl)                        | ✅     | SSE chunks with `reasoning_content` deltas streaming correctly               |
| Tool-enabled chat (`enable_thinking: false`) | ✅     | Clean `tool_calls`, no `reasoning_content`, 25 tokens                        |
| Vision: image + text (curl, base64)          | ✅     | Model correctly identified a 10×10 test pattern; `image_tokens: 66`          |
| Vision: image + text (curl, external URL)    | ❌     | `Failed to download multimodal content` — DashScope couldn't reach Wikipedia |
| Model appears in VS Code picker              | ✅     | "Agent \| Qwen 3.7 Plus" confirmed                                           |
| Plain chat in VS Code                        | ✅     | Streaming output confirmed                                                   |
| Streaming in VS Code                         | ✅     | Token-by-token streaming confirmed                                           |
| Tool / agent use in VS Code                  | ✅     | Browser tool invoked to open Qwen docs and Google                            |
| Vision in VS Code                            | ✅     | Image attachment analyzed correctly                                          |

#### Intermittent `ERR_CONNECTION_RESET` investigation

A `net::ERR_CONNECTION_RESET` was observed once during `qwen3.7-plus` validation, but did not reproduce on the same machine outside VS Code:

- Direct `curl` POST to DashScope Singapore → HTTP 200.
- Direct Node.js HTTPS POST → HTTP 200.
- Direct Node.js HTTPS **streaming** POST with full `qwen3.7-plus.md` content embedded → HTTP 200.

Conclusion: not a DashScope or Qwen model incompatibility. Evidence points to an intermittent VS Code / Electron transport issue or transient network interruption local to the editor process.

### Final verdict

| Criterion              | `qwen3.7-max`  | `qwen3.7-plus` |
| ---------------------- | -------------- | -------------- |
| Plain chat             | ✅             | ✅             |
| Streaming chat         | ✅             | ✅             |
| Tool-enabled agent use | ✅             | ✅             |
| Vision                 | ❌ (text-only) | ✅             |
| Without a proxy        | ✅             | ✅             |

### Known limitations

- GitHub Copilot inline completions and semantic-search features remain outside scope.
- One intermittent VS Code-side `net::ERR_CONNECTION_RESET` was observed — not reproducible externally, treated as transient transport issue.
- External image URLs may fail if DashScope's servers cannot reach them; base64-encoded images work reliably.
- Vision is not supported on `qwen3.7-max` (text-generation model).
- `maxInputTokens` / `maxOutputTokens` not yet confirmed from official DashScope documentation.
- API keys are region-specific — a key created for one regional endpoint will not work with another.

## References

- VS Code custom endpoint docs: `https://code.visualstudio.com/docs/copilot/customization/language-models#_add-a-custom-endpoint-model`
- DashScope OpenAI-compatible Chat Completions overview: `https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope`
- DashScope model index: `https://help.aliyun.com/zh/model-studio/getting-started/models`
- DashScope vision model guide: `https://help.aliyun.com/zh/model-studio/vision`
- DashScope pricing: `https://www.alibabacloud.com/help/en/model-studio/billing-for-model-studio`
- Kimi K2.6 validation record (separate provider): [kimi-k2.6.md](kimi-k2.6.md)
