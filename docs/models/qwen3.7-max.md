# Qwen 3.7 Max Validation Record

> **Status: Validated** — All phases complete. Direct VS Code → DashScope path works without a proxy for plain chat, streaming, and tool calling. Vision is not targeted (text-generation model).

## Summary

- Goal: validate `qwen3.7-max` as a VS Code / GitHub Copilot Custom Endpoint model without a local proxy.
- Provider: Alibaba Cloud DashScope (OpenAI-compatible Chat Completions surface).
- Region under test: Singapore (`https://dashscope-intl.aliyuncs.com/compatible-mode/v1`).
- Path: direct VS Code → DashScope, no proxy shim.
- Capabilities validated: plain chat, streaming, tool calling.
- Final verdict: **acceptable** for plain chat, streaming, and tool-enabled agent use — all without a local proxy. Vision is not supported by this model.

## Compatibility Assessment

### Why Qwen 3.7 Max is a reasonable candidate

Alibaba's official DashScope documentation explicitly lists `qwen3.7-max` on its OpenAI-compatible Chat Completions surface:

- Bearer-token authentication with an Alibaba Cloud API key.
- Standard `model` field in the request body.
- Documented streaming (`stream: true`, Server-Sent Events).
- Standard OpenAI `tools` / `tool_calls` format documented in the function-call examples.
- `temperature` range `[0, 2)` and `top_p` both documented as optional with no fixed-value requirement (unlike Kimi K2.6).

Unlike Kimi K2.6, DashScope does not document mandatory fixed sampling values or mandatory thinking-mode fields, which makes the direct VS Code path plausible on the first attempt.

### Important caveats from research

- `qwen3.7-max` is listed under the **text generation** model family. Image/video understanding is a separate model family (Qwen3.6-VL, Qwen3.5-VL, Qwen2.5-VL). Vision capability is therefore not targeted in this first pass.
- Some DashScope extras (`enable_search`, `enable_thinking`, `thinking_budget`) are non-standard and passed via `extra_body` in the OpenAI SDK. These are out of scope for this validation unless the core path already works.
- Token limits for `qwen3.7-max` were not surfaced in the public model index page at research time. These fields are omitted from the VS Code config rather than guessed.
- DashScope documents a Qwen3 family of hybrid thinking models where `enable_thinking` defaults to `true`; if this applies to `qwen3.7-max`, VS Code tool-loop calls may encounter reasoning-content fields similar to the Kimi K2.6 thinking-mode issue. This will be caught during tool-enabled validation.

### Official API surface

| Property                              | Value                                                                     |
| ------------------------------------- | ------------------------------------------------------------------------- |
| Chat Completions endpoint (Singapore) | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` |
| Auth header                           | `Authorization: Bearer <DASHSCOPE_API_KEY>`                               |
| Model ID                              | `qwen3.7-max`                                                             |
| Streaming                             | `stream: true` (SSE, `data: [DONE]` terminator)                           |
| Tool calling                          | `tools` array, `tool_calls` response                                      |
| Non-OpenAI extras                     | `enable_thinking`, `thinking_budget`, `enable_search` (via `extra_body`)  |

## Final Working Configuration

### VS Code user config

User config file (path is OS-specific):

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

Applied model entry shape:

```json
{
  "name": "Qwen",
  "vendor": "customendpoint",
  "apiKey": "<your-dashscope-api-key>",
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
    }
  ]
}
```

> **Note:** `enable_thinking: false` is injected via `requestBody` to suppress the model's default thinking mode and produce standard OpenAI-compatible responses. `maxInputTokens` / `maxOutputTokens` are omitted until official values are confirmed from the DashScope console or model card.

## Validation Summary

> **Pending.** Results from each phase will be recorded here as they complete.

| Capability                         | Direct (no proxy) | Notes     |
| ---------------------------------- | ----------------- | --------- |
| Non-streaming chat (external curl)                         | ✅ | HTTP 200, valid assistant message; `reasoning_content` present (thinking on by default) |
| Streaming chat (external curl)                             | ✅ | HTTP 200, SSE chunks with `[DONE]`; `reasoning_content` streams alongside `content`     |
| Tool-enabled chat (external curl, thinking on)             | ✅ | HTTP 200, `finish_reason: tool_calls`, correct `tool_calls` — `reasoning_content` present |
| Tool-enabled chat (external curl, `enable_thinking: false`) | ✅ | HTTP 200, clean OpenAI-shape, no `reasoning_content`, 25 tokens vs 170                 |
| Model appears in VS Code picker                            | ✅ | Visible in model picker; "Agent \| Qwen 3.7 Max" confirmed in VS Code chat panel        |
| Plain chat in VS Code                                      | ✅ | Model replied with one-sentence confirmation when asked to confirm availability         |
| Streaming in VS Code                                       | ✅ | Token-by-token streaming output confirmed in chat panel                                 |
| Tool / agent use in VS Code                                | ✅ | Tool calling works — model invoked browser tool successfully                              |

## Validation Details

### Phase 2 — External API checks

All three checks ran against `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` with `model: qwen3.7-max`.

#### Non-streaming chat

Request: standard `messages` array, `stream: false`.

Result: HTTP 200, valid assistant `content`. Observation: `reasoning_content` was present in the response message alongside `content`. Thinking mode is enabled by default for `qwen3.7-max`.

#### Streaming chat

Request: `stream: true`.

Result: HTTP 200, SSE `data:` chunks arrived correctly. The `reasoning_content` key streamed in every chunk (as a separate delta field) before the `content` field started. The `data: [DONE]` terminator was present at the end.

#### Tool-enabled chat

First run (thinking on, default): HTTP 200, `finish_reason: "tool_calls"`, correct `tool_calls` array — but `reasoning_content` was present in the assistant message alongside `tool_calls`. This mirrors the Kimi K2.6 risk pattern: if VS Code does not preserve `reasoning_content` in the follow-up request, the model may reject the tool-loop continuation.

Second run (`enable_thinking: false` added as a top-level request body field): HTTP 200, clean response — **no `reasoning_content`**, standard OpenAI-compatible shape, `finish_reason: "tool_calls"`, 25 tokens vs 170. This confirms that `enable_thinking: false` is a valid top-level JSON field (not just an SDK `extra_body` wrapper) and produces standard OpenAI-compatible output.

#### Key decision from Phase 2

`enable_thinking: false` must be included in the VS Code model config via `requestBody` to avoid the tool-loop `reasoning_content` issue. Unlike the Kimi K2.6 case (where VS Code overwrote a conflicting parameter like `temperature`), `enable_thinking` is not a standard OpenAI field that VS Code would send at all — so a `requestBody`-level injection has a good chance of reaching the upstream model unmodified.

### Phase 4 — VS Code in-editor validation ✅

- Confirmed `qwen3.7-max` appears in the VS Code model picker and is selectable.
- Confirmed plain chat: model replied with a one-sentence confirmation when asked to confirm availability.
- Confirmed streaming: token-by-token output observed in the chat panel during responses.
- Confirmed tool / agent use: model invoked the browser tool successfully.

## Known Limitations

- Vision is not supported; `qwen3.7-max` is a text-generation model. Use `qwen3.6-plus` for vision.
- GitHub Copilot inline completions and semantic-search features remain outside scope.
- `maxInputTokens` / `maxOutputTokens` are not yet confirmed from official DashScope documentation.

## Final Verdict

- acceptable for plain chat: yes
- acceptable for streaming chat: yes
- acceptable for tool-enabled agent use: yes
- acceptable for vision: no (not a vision model)
- acceptable without a proxy: yes

Recommended operating mode:

- keep the model URL pointed at `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions`
- keep `enable_thinking: false` in the `requestBody` to prevent `reasoning_content` issues during tool loops

## Sources

- VS Code custom endpoint docs: `https://code.visualstudio.com/docs/copilot/customization/language-models#_add-a-custom-endpoint-model`
- DashScope OpenAI-compatible Chat Completions overview: `https://help.aliyun.com/zh/model-studio/compatibility-of-openai-with-dashscope`
- DashScope model index: `https://help.aliyun.com/zh/model-studio/getting-started/models`
- DashScope vision model guide (for reference; shows which models support images): `https://help.aliyun.com/zh/model-studio/vision`
