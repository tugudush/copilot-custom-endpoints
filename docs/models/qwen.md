# Qwen (DashScope) — Validation Record & Optional Proxy

> **Status: Validated** — All phases complete. Direct VS Code → DashScope path works without a proxy for both `qwen3.6-plus` (vision) and `qwen3.7-max` (text-only). Optional `proxy/qwen-proxy.mjs` available for dynamic thinking suppression (reasoning visible in plain chat, suppressed in tool loops).

## Overview

This document covers both Qwen models validated on Alibaba Cloud DashScope's OpenAI-compatible Chat Completions surface:

| Model          | Vision | Role                                   |
| -------------- | ------ | -------------------------------------- |
| `qwen3.6-plus` | ✅ Yes | Primary model with image understanding |
| `qwen3.7-max`  | ❌ No  | Larger text-only model                 |

They share the same provider, endpoint, auth, and `enable_thinking` constraints, so they're documented together.

### Official API surface

| Property                              | Value                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------ |
| Provider                              | Alibaba Cloud DashScope                                                        |
| Chat Completions endpoint (Singapore) | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`      |
| Auth header                           | `Authorization: Bearer <DASHSCOPE_API_KEY>`                                    |
| Streaming                             | `stream: true` (SSE, `data: [DONE]` terminator)                                |
| Tool calling                          | `tools` array, `tool_calls` response                                           |
| Vision                                | Image input via OpenAI-compatible `content` array format (`qwen3.6-plus` only) |
| Non-OpenAI extras                     | `enable_thinking`, `thinking_budget`, `enable_search` (via `extra_body`)       |

### Regional endpoints

DashScope offers endpoints for other regions:

- **China (Beijing):** `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- **US (Virginia):** `https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions`
- **Singapore:** `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` (used in this guide)

Choose the endpoint closest to your location for better latency. Note that API keys are region-specific.

## Models

### qwen3.7-max (text only)

- Listed under DashScope's **text generation** model family.
- No image/video understanding.
- Validated capabilities: plain chat, streaming, tool calling.

#### Caveats

- Part of the Qwen3 hybrid thinking model family — `enable_thinking` defaults to `true`, producing `reasoning_content` in responses.
- `maxInputTokens` / `maxOutputTokens` not yet confirmed from official DashScope documentation.

### qwen3.6-plus (vision + text)

- Listed under both **text generation** and **image/video understanding** model families.
- Supports image input via OpenAI-compatible `content` array format (base64 data URIs).
- Validated capabilities: plain chat, streaming, tool calling, **vision**.

#### Caveats

- Same Qwen3 hybrid thinking model family — same `enable_thinking` default behavior.
- External image URLs may fail if DashScope's servers cannot reach them; base64-encoded images work reliably.
- Snapshot version `qwen3.6-plus-2026-04-02` also available; floating `qwen3.6-plus` alias preferred.
- `maxInputTokens` / `maxOutputTokens` not yet confirmed from official DashScope documentation.

## Thinking Mode & The Optional Proxy

### The problem

The Qwen3 hybrid-thinking models default to `enable_thinking: true`, producing `reasoning_content` in responses. This is **harmless in plain chat** (you see the model's reasoning) but **breaks agent/tool-calling loops**: VS Code may not preserve `reasoning_content` in follow-up tool-result messages, and the model may reject the continuation.

### Option 1 — Direct path (simplest, static suppression)

Works without a proxy. Static `enable_thinking: false` is injected via `requestBody` for **every** request:

```
enable_thinking: false  →  always suppressed (both plain chat and tool loops)
```

**Trade-off:** reasoning suppressed in all requests. Tool loops stay stable, but you never see the model's thought process.

### Option 2 — With proxy (dynamic suppression)

The optional `proxy/qwen-proxy.mjs` adds dynamic thinking suppression: reasoning stays ON in plain chat but turns OFF automatically when tools are invoked:

```
no tools → enable_thinking deleted (model defaults to true, reasoning visible)
tools    → enable_thinking: false injected (no reasoning_content issues)
```

This gives you the best of both worlds.

#### Proxy design

| Component            | Value                                                                       |
| -------------------- | --------------------------------------------------------------------------- |
| Local listen         | `http://127.0.0.1:3458/v1/chat/completions`                                 |
| Health check         | `GET http://127.0.0.1:3458/healthz`                                         |
| Upstream             | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`   |
| Auth passthrough     | `Authorization: Bearer <key>` forwarded as-is                               |
| Response passthrough | Streaming (SSE) and non-streaming, headers stripped of hop-by-hop           |
| Logging              | Redacted NDJSON → `debug_log/qwen-proxy.ndjson`                             |
| Pattern              | Follows `proxy/kimi-proxy.mjs` but simpler — no temperature/top_p rewriting |

#### Environment variables

| Variable                                 | Default                                                                   | Purpose                                            |
| ---------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------- |
| `PORT`                                   | `3458`                                                                    | Local listen port                                  |
| `QWEN_UPSTREAM_URL`                      | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` | Upstream DashScope endpoint                        |
| `QWEN_PROXY_LOG`                         | `debug_log/qwen-proxy.ndjson` (relative to repo root)                     | Redacted NDJSON log path                           |
| `QWEN_PROXY_DISABLE_THINKING_WITH_TOOLS` | `1`                                                                       | Set to `0` to skip tool-aware thinking suppression |

#### Request rewriting rules

| Condition                                | Action                                                      |
| ---------------------------------------- | ----------------------------------------------------------- |
| `body.tools` is a non-empty array        | Set `body.enable_thinking = false`                          |
| `body.tools` is missing, empty, or falsy | Delete `body.enable_thinking` (let model default to `true`) |

> **Why delete rather than set `true`?** Omitting the key lets Qwen use its built-in default (`true`). Deletion is closer to "don't interfere."

#### Proxy validation results

All 8 checks passed on June 1, 2026:

| #   | Check                                    | Result                                                                           |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------- |
| 1   | Proxy starts                             | ✅ `--help` prints correct usage and defaults                                    |
| 2   | Health check                             | ✅ Returns `{"ok":true,"port":3458,...}`                                         |
| 3   | Plain chat (no tools) → thinking ON      | ✅ Response contains `reasoning_content`; `enable_thinking` deleted              |
| 4   | Tool chat (tools present) → thinking OFF | ✅ No `reasoning_content`; clean `tool_calls`; `enable_thinking: false` injected |
| 5   | Streaming passthrough                    | ✅ SSE chunks arrive correctly with `text/event-stream` content type             |
| 6   | Error passthrough                        | ✅ Invalid JSON returns HTTP 400 with useful error message                       |
| 7   | Auth passthrough                         | ✅ Missing key forwarded to DashScope → 401; valid key → 200                     |
| 8   | Logging                                  | ✅ All entries redact `Authorization: Bearer <redacted>`                         |

**VS Code integration:** Both models visible in picker, agent/tool use works cleanly, vision requests succeed via proxy. Proxy logs confirmed multiple VS Code Copilot Chat requests with `hasTools: true`, all returning HTTP 200.

## VS Code Configuration

### Direct path (no proxy)

```json
{
  "name": "Qwen",
  "vendor": "customendpoint",
  "apiKey": "<your-dashscope-key>",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "qwen3.7-max",
      "name": "Qwen 3.7 Max",
      "url": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true,
      "requestBody": {
        "enable_thinking": false
      }
    },
    {
      "id": "qwen3.6-plus",
      "name": "Qwen 3.6 Plus",
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

> **Note:** `enable_thinking: false` suppresses the Qwen3 family's default thinking mode, which prevents `reasoning_content` issues during tool loops.

### Proxy path (dynamic thinking suppression)

Start the proxy:

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

Then update VS Code config — change `url` to point to the proxy and **remove** `requestBody.enable_thinking`:

```json
{
  "name": "Qwen",
  "vendor": "customendpoint",
  "apiKey": "<your-dashscope-key>",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "qwen3.7-max",
      "name": "Qwen 3.7 Max",
      "url": "http://127.0.0.1:3458/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true
    },
    {
      "id": "qwen3.6-plus",
      "name": "Qwen 3.6 Plus",
      "url": "http://127.0.0.1:3458/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true
    }
  ]
}
```

> **Keep the proxy terminal open** while using Qwen via proxy.

#### Troubleshooting (proxy)

| Symptom                       | Fix                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------ |
| "Connection refused"          | Make sure `node proxy/qwen-proxy.mjs` is still running                                                       |
| Tool loops fail               | Check `debug_log/qwen-proxy.ndjson` — verify `hasTools: true` requests have `rewrittenEnableThinking: false` |
| Want to switch back to direct | Revert `url` to DashScope endpoint and restore `requestBody.enable_thinking: false`                          |

## Validation Results (Direct Path)

### qwen3.7-max

| Capability                                   | Direct (no proxy) | Notes                                                                               |
| -------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------- |
| Non-streaming chat (external curl)           | ✅                | HTTP 200, valid assistant message; `reasoning_content` present                      |
| Streaming chat (external curl)               | ✅                | HTTP 200, SSE chunks with `[DONE]`; `reasoning_content` streams alongside `content` |
| Tool-enabled chat (thinking on)              | ✅                | HTTP 200, `finish_reason: tool_calls` — `reasoning_content` present                 |
| Tool-enabled chat (`enable_thinking: false`) | ✅                | HTTP 200, clean OpenAI-shape, no `reasoning_content`, 25 tokens vs 170              |
| Model appears in VS Code picker              | ✅                | Visible; "Agent \| Qwen 3.7 Max" confirmed                                          |
| Plain chat in VS Code                        | ✅                | Streaming output confirmed                                                          |
| Streaming in VS Code                         | ✅                | Token-by-token streaming confirmed                                                  |
| Tool / agent use in VS Code                  | ✅                | Browser tool invoked successfully                                                   |

### qwen3.6-plus

| Capability                                   | Direct (no proxy) | Notes                                                                                       |
| -------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------- |
| Non-streaming chat (external curl)           | ✅                | HTTP 200, valid response; `reasoning_content` present (727 reasoning tokens)                |
| Streaming chat (external curl)               | ✅                | SSE chunks with `reasoning_content` deltas streaming correctly                              |
| Tool-enabled chat (`enable_thinking: false`) | ✅                | Clean `tool_calls`, no `reasoning_content`, 25 tokens                                       |
| Vision: image + text (external curl)         | ✅                | Base64 image understood correctly; external URL failed (DashScope couldn't reach Wikipedia) |
| Model appears in VS Code picker              | ✅                | Visible; "Agent \| Qwen 3.6 Plus" confirmed                                                 |
| Plain chat in VS Code                        | ✅                | Streaming output confirmed                                                                  |
| Streaming in VS Code                         | ✅                | Token-by-token streaming confirmed                                                          |
| Tool / agent use in VS Code                  | ✅                | Browser tool invoked to open Qwen docs and Google successfully                              |
| Vision in VS Code                            | ✅                | Image attachment analyzed correctly                                                         |

## Validation Details

### qwen3.7-max — Phase 2: External API checks

Three checks ran against `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` with `model: qwen3.7-max`.

#### Non-streaming chat

Standard `messages` array, `stream: false`. HTTP 200, valid assistant `content`. `reasoning_content` present — thinking mode enabled by default.

#### Streaming chat

`stream: true`. HTTP 200, SSE `data:` chunks arrived correctly. `reasoning_content` streamed in every chunk before `content` started. `data: [DONE]` terminator present.

#### Tool-enabled chat

First run (thinking on, default): HTTP 200, correct `tool_calls` — but `reasoning_content` present alongside `tool_calls`. Mirrors the Kimi K2.6 risk pattern.

Second run (`enable_thinking: false`): HTTP 200, clean response — **no `reasoning_content`**, standard OpenAI-compatible shape, `finish_reason: "tool_calls"`, 25 tokens vs 170. Confirms `enable_thinking: false` is a valid top-level JSON field.

### qwen3.6-plus — Phase 2: External API checks

Four checks ran against the same endpoint with `model: qwen3.6-plus`.

#### Non-streaming chat

HTTP 200, valid assistant `content`. `reasoning_content` present (727 reasoning tokens for a simple greeting).

#### Streaming chat

HTTP 200, SSE chunks with `reasoning_content` deltas before `content`. `data: [DONE]` present.

#### Tool-enabled chat

`enable_thinking: false` added as top-level field. HTTP 200, clean response — **no `reasoning_content`**, standard shape, `finish_reason: "tool_calls"`, 25 tokens.

#### Vision: image + text prompt

First attempt (external image URL): HTTP 400, `Failed to download multimodal content` — Wikipedia URL unreachable from DashScope's servers.

Second attempt (base64-encoded image): HTTP 200, valid response. Model correctly identified a 10×10 test pattern. `usage` included `image_tokens: 66`, confirming vision processing.

**Key finding:** Vision works with base64 data URIs but external image URLs may fail if DashScope cannot reach them. Provider-side limitation, not a model limitation.

### Phase 4 — VS Code in-editor validation (both models)

- Both models appear in VS Code picker and are selectable.
- Plain chat, streaming, and tool/agent use confirmed working for both.
- Vision confirmed working for `qwen3.6-plus` (attached Facebook screenshot identified correctly).
- One intermittent `net::ERR_CONNECTION_RESET` observed during `qwen3.6-plus` Phase 4 — **not reproducible** via direct `curl` or Node.js requests to DashScope. Treated as transient VS Code / Electron transport issue.

#### Intermittent connection reset investigation

The reset did not reproduce on the same machine outside VS Code:

- Direct `curl` POST to DashScope Singapore → HTTP 200.
- Direct Node.js HTTPS POST → HTTP 200.
- Direct Node.js HTTPS **streaming** POST with full `qwen3.6-plus.md` content embedded → HTTP 200.

Conclusion: not a DashScope or Qwen model incompatibility. Evidence points to intermittent VS Code / Electron transport issue or transient network interruption local to the editor process.

## Known Limitations

- GitHub Copilot inline completions and semantic-search features remain outside scope.
- One intermittent VS Code-side `net::ERR_CONNECTION_RESET` was observed — not reproducible externally, treated as transient transport issue.
- External image URLs may fail if DashScope's servers cannot reach them; base64-encoded images work reliably (`qwen3.6-plus`).
- Vision is not supported on `qwen3.7-max` (text-generation model).
- `maxInputTokens` / `maxOutputTokens` not yet confirmed from official DashScope documentation.
- API keys are region-specific — a key created for one regional endpoint will not work with another.

## Final Verdict

| Criterion              | qwen3.7-max    | qwen3.6-plus |
| ---------------------- | -------------- | ------------ |
| Plain chat             | ✅             | ✅           |
| Streaming chat         | ✅             | ✅           |
| Tool-enabled agent use | ✅             | ✅           |
| Vision                 | ❌ (text-only) | ✅           |
| Without a proxy        | ✅             | ✅           |

**Choose your operating mode:**

**Option 1 — Direct path (simplest):** Keep `enable_thinking: false` in `requestBody`. Works fine for all use cases. Reasoning suppressed in all requests.

**Option 2 — With proxy (dynamic thinking):** Start `proxy/qwen-proxy.mjs`, point URLs to `http://127.0.0.1:3458/v1/chat/completions`, remove `enable_thinking`. Reasoning visible in plain chat, suppressed in tool loops.

## Sources

- VS Code custom endpoint docs: `https://code.visualstudio.com/docs/copilot/customization/language-models#_add-a-custom-endpoint-model`
- DashScope OpenAI-compatible Chat Completions overview: `https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope`
- DashScope model index: `https://help.aliyun.com/zh/model-studio/getting-started/models`
- DashScope vision model guide: `https://help.aliyun.com/zh/model-studio/vision`
- Kimi K2.6 validation record (separate provider): [kimi-k2.6.md](kimi-k2.6.md)
