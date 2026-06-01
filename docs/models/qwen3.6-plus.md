# Qwen 3.6 Plus Validation Record

> **Status: Validated** — All phases complete. Direct VS Code → DashScope path works without a proxy.

## Summary

- Goal: validate `qwen3.6-plus` as a VS Code / GitHub Copilot Custom Endpoint model without a local proxy.
- Provider: Alibaba Cloud DashScope (OpenAI-compatible Chat Completions surface).
- Region under test: Singapore (`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`).
- Path: direct VS Code → DashScope, no proxy shim.
- Capabilities validated: plain chat, streaming, tool calling, **vision** (image understanding).
- Final verdict: **acceptable** for plain chat, streaming, tool-enabled agent use, and vision — all without a local proxy.

## Compatibility Assessment

### Why Qwen 3.6 Plus is a reasonable candidate

Alibaba's official DashScope documentation explicitly lists `qwen3.6-plus` on the OpenAI-compatible Chat Completions surface:

- Bearer-token authentication with an Alibaba Cloud API key.
- Standard `model` field in the request body.
- Documented streaming (`stream: true`, Server-Sent Events).
- Standard OpenAI `tools` / `tool_calls` format documented in the function-call examples.
- `temperature` range `[0, 2)` and `top_p` both documented as optional with no fixed-value requirement.

**Key advantage over `qwen3.7-max`:** `qwen3.6-plus` is listed under both **text generation** and **image/video understanding** on the DashScope model index. This means it supports vision (image input), making it the first vision-capable custom endpoint candidate in this repo.

### Relationship to existing Qwen 3.7 Max entry

`qwen3.6-plus` shares the same DashScope provider, endpoint, and API key as `qwen3.7-max`. In the VS Code config, it will be added as a **second model** under the existing `Qwen` provider entry rather than creating a separate provider. This means:

- No new API key or secret reference needed.
- Same `enable_thinking: false` mitigation applies (Qwen3 family hybrid thinking models).
- Same endpoint URL.
- The lessons learned from `qwen3.7-max` Phase 2 carry over directly.

### Important caveats from research

- `qwen3.6-plus` is part of the Qwen3 hybrid thinking model family. `enable_thinking` defaults to `true`, producing `reasoning_content` in responses — the same issue encountered and resolved for `qwen3.7-max`.
- Vision support means the model can accept image URLs or base64-encoded images in the `content` field of messages (OpenAI vision format). This needs explicit validation in Phase 4.
- Token limits for `qwen3.6-plus` were not surfaced in the public model index page at research time. These fields are omitted from the VS Code config rather than guessed.
- The snapshot version `qwen3.6-plus-2026-04-02` is also available but the floating `qwen3.6-plus` alias is preferred for this validation.

### Official API surface

| Property                              | Value                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------- |
| Chat Completions endpoint (Singapore) | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` |
| Auth header                           | `Authorization: Bearer <DASHSCOPE_API_KEY>`                               |
| Model ID                              | `qwen3.6-plus`                                                            |
| Streaming                             | `stream: true` (SSE, `data: [DONE]` terminator)                           |
| Tool calling                          | `tools` array, `tool_calls` response                                      |
| Vision                                | Image input via OpenAI-compatible `content` array format                  |
| Non-OpenAI extras                     | `enable_thinking`, `thinking_budget`, `enable_search` (via `extra_body`)  |

## Final Working Configuration

### VS Code user config

The model is the second entry in the existing `Qwen` provider's `models` array. The provider-level fields (`name`, `vendor`, `apiKey`, `apiType`) are shared with `qwen3.7-max`.

User config file (path is OS-specific):

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

Applied model entry shape:

```json
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
```

> **Note:** `vision: true` is set because `qwen3.6-plus` is listed under DashScope's image/video understanding models. `enable_thinking: false` is injected via `requestBody` to suppress the model's default thinking mode, same as `qwen3.7-max`. `maxInputTokens` / `maxOutputTokens` are omitted until official values are confirmed.

## Validation Plan

### Phase 1 — Research and planning ✅

- Confirmed `qwen3.6-plus` on DashScope OpenAI-compatible model list.
- Confirmed vision support (listed under image/video understanding).
- Confirmed same endpoint, auth, and API surface as `qwen3.7-max`.
- Identified `enable_thinking` default behavior (same mitigation as `qwen3.7-max`).

### Phase 2 — External API checks ✅

| Check                                  | Purpose                                                         |
| -------------------------------------- | --------------------------------------------------------------- |
| Non-streaming chat (curl)              | Confirm basic text generation works                             |
| Streaming chat (curl)                  | Confirm SSE streaming works                                     |
| Tool-enabled chat (curl, thinking off) | Confirm clean tool_calls without `reasoning_content`            |
| Vision: image + text prompt (curl)     | Confirm image understanding via OpenAI-compatible content array |

### Phase 3 — VS Code configuration ✅

- Added `qwen3.6-plus` to the existing `Qwen` provider in `chatLanguageModels.json`.
- Reloaded VS Code and confirmed the model appears in the picker.

### Phase 4 — VS Code in-editor validation ✅

| Check                           | Purpose                                                    |
| ------------------------------- | ---------------------------------------------------------- |
| Model appears in VS Code picker | Confirm the model is visible and selectable                |
| Plain chat                      | Basic text generation in the chat panel                    |
| Streaming                       | Token-by-token streaming output                            |
| Tool / agent use                | Tool calling loop works without `reasoning_content` issues |
| Vision: send an image           | Image understanding works via the chat panel               |

### Phase 5 — Conditional proxy fallback (not needed)

The direct path succeeded; no proxy was required. `enable_thinking: false` is correctly forwarded by VS Code via `requestBody`.

### Phase 6 — Close record ✅

- Validation summary, known limitations, and final verdict finalized below.
- Config promoted to **Final Working Configuration**.
- `README.md` updated to include `qwen3.6-plus` as a validated model.

## Validation Summary

All targeted capabilities validated successfully via the direct VS Code → DashScope path.

| Capability                           | Direct (no proxy) | Notes                                                                                                 |
| ------------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------- |
| Non-streaming chat (external curl)   | ✅                | HTTP 200, valid response; `reasoning_content` present (thinking on by default, 727 reasoning tokens)  |
| Streaming chat (external curl)       | ✅                | HTTP 200, SSE chunks with `reasoning_content` deltas streaming correctly                              |
| Tool-enabled chat (external curl)    | ✅                | HTTP 200, clean `tool_calls` with `enable_thinking: false`, no `reasoning_content`, 25 tokens         |
| Vision: image + text (external curl) | ✅                | HTTP 200, base64 image understood correctly; external URL failed (DashScope couldn't reach Wikipedia) |
| Model appears in VS Code picker      | ✅                | Visible in model picker; "Agent \| Qwen 3.6 Plus" confirmed in VS Code chat panel                     |
| Plain chat in VS Code                | ✅                | Model replied with one-sentence confirmation; streaming output observed                               |
| Streaming in VS Code                 | ✅                | Token-by-token streaming output confirmed in chat panel                                               |
| Tool / agent use in VS Code          | ✅                | Tool calling works — model invoked browser tool to open Qwen docs site and Google successfully        |
| Vision in VS Code                    | ✅                | Image attachment analyzed successfully (Facebook screenshot identified correctly)                     |

## Validation Details

### Phase 2 — External API checks

All four checks ran against `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` with `model: qwen3.6-plus`.

#### Non-streaming chat

Request: standard `messages` array, `stream: false`.

Result: HTTP 200, valid assistant `content`. Observation: `reasoning_content` was present in the response message alongside `content`. Thinking mode is enabled by default for `qwen3.6-plus` (727 reasoning tokens for a simple greeting prompt).

#### Streaming chat

Request: `stream: true`.

Result: HTTP 200, SSE `data:` chunks arrived correctly. The `reasoning_content` key streamed in every chunk (as a separate delta field) before the `content` field started. The `data: [DONE]` terminator was present at the end.

#### Tool-enabled chat

Request: `tools` array with `get_weather` function, `enable_thinking: false` added as a top-level request body field.

Result: HTTP 200, clean response — **no `reasoning_content`**, standard OpenAI-compatible shape, `finish_reason: "tool_calls"`, 25 tokens. This confirms that `enable_thinking: false` works identically for `qwen3.6-plus` as it does for `qwen3.7-max`.

#### Vision: image + text prompt

First attempt (external image URL): HTTP 400, `Failed to download multimodal content`. The Wikipedia PNG URL was unreachable from DashScope's servers.

Second attempt (base64-encoded image): HTTP 200, valid response. The model correctly identified the image as "predominantly white with a soft, horizontal red-to-pink gradient along the top edge" from a 10×10 PNG test pattern. The `usage` object included `image_tokens: 66`, confirming vision processing.

**Key finding:** Vision works with base64 data URIs but external image URLs may fail if DashScope cannot reach them. This is a provider-side limitation, not a model limitation.

#### Key decision from Phase 2

`enable_thinking: false` must be included in the VS Code model config via `requestBody` to avoid the tool-loop `reasoning_content` issue. This is identical to the `qwen3.7-max` mitigation. Vision support is confirmed via base64 data URIs.

### Phase 4 — VS Code in-editor validation

- Confirmed `qwen3.6-plus` appears in the VS Code model picker and is selectable.
- Confirmed plain chat: model replied with a one-sentence confirmation when asked to confirm availability.
- Confirmed streaming: token-by-token output observed in the chat panel during responses.
- Confirmed tool / agent use: model invoked the browser tool to open the Qwen official documentation (`https://qwen.readthedocs.io/`) and Google (`https://www.google.com`) successfully.
- Confirmed vision: attached `tests/image.png` (Facebook screenshot in dark mode) was analyzed correctly — model identified the page layout, ABS-CBN News post content, user name (Jerome Gomez), and sidebar elements.
- Observed one intermittent VS Code chat failure while asking about the attached validation document: `net::ERR_CONNECTION_RESET` from the custom-endpoint request path.

#### Intermittent connection reset investigation

The reset does **not** reproduce on the same machine outside VS Code:

- Direct `curl` POST to DashScope Singapore returned HTTP 200.
- Direct Node.js HTTPS POST returned HTTP 200.
- Direct Node.js HTTPS **streaming** POST with the full `qwen3.6-plus.md` content embedded in the prompt also returned HTTP 200 and streamed the expected answer to the same question (`"phase 2 and 3 are still pending?"`).

Current conclusion: this is **not** evidence that Phase 2 or Phase 3 failed, and it is **not** currently reproducible as a DashScope or Qwen model incompatibility. The evidence points to an intermittent VS Code / Electron transport issue on the direct custom-endpoint path, or a transient network interruption local to the editor process.

## Known Limitations

- GitHub Copilot inline completions and semantic-search features remain outside scope.
- One intermittent VS Code-side `net::ERR_CONNECTION_RESET` was observed during Phase 4; it was not reproducible via direct `curl` or Node.js requests to DashScope and is treated as a transient transport issue rather than a model incompatibility.
- External image URLs may fail if DashScope's servers cannot reach them; base64-encoded images work reliably.
- `maxInputTokens` / `maxOutputTokens` are not yet confirmed from official DashScope documentation.

## Final Verdict

- acceptable for plain chat: yes
- acceptable for streaming chat: yes
- acceptable for tool-enabled agent use: yes
- acceptable for vision: yes
- acceptable without a proxy: yes

Recommended operating mode:

- keep the model URL pointed at `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`
- keep `enable_thinking: false` in the `requestBody` to prevent `reasoning_content` issues during tool loops

## Sources

- VS Code custom endpoint docs: `https://code.visualstudio.com/docs/copilot/customization/language-models#_add-a-custom-endpoint-model`
- DashScope OpenAI-compatible Chat Completions overview: `https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope`
- DashScope model index: `https://help.aliyun.com/zh/model-studio/getting-started/models`
- DashScope vision model guide: `https://help.aliyun.com/zh/model-studio/vision`
- Qwen 3.7 Max validation record (shared provider, shared lessons): [kimi-k2.6.md](kimi-k2.6.md), [qwen3.7-max.md](qwen3.7-max.md)
