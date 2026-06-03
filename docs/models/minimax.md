# MiniMax — VS Code Custom Endpoint Setup Guide

> **TL;DR:** MiniMax-M3 works directly — no proxy needed. Use `thinking: { type: "adaptive" }` + `reasoning_split: true` in `requestBody` so the model can reason and the response arrives in a clean OpenAI format (`reasoning_details` field, separate from `content`). **Important:** `thinking: { type: "disabled" }` is **not** a hard override — the model still reasons internally and emits `<think>` tags / `reasoning_content` regardless.

## At a Glance

| Field                    | Value                                                   |
| ------------------------ | ------------------------------------------------------- |
| Mode                     | **Direct** (no proxy)                                   |
| Vision                   | ✅ Yes (image + video)                                  |
| Tool calling             | ✅ Yes                                                  |
| Context                  | 1M (guaranteed 512K)                                    |
| Max output               | 512K (recommended 128K)                                 |
| Required `requestBody`   | `thinking: { type: "adaptive" }, reasoning_split: true` |
| Endpoint (international) | `https://api.minimax.io/v1/chat/completions`            |
| Endpoint (China)         | `https://api.minimaxi.com/v1/chat/completions`          |

## Quick Start

1. **Edit `chatLanguageModels.json`** — add the MiniMax block from [Setup](#setup) below.
2. **Set your `MINIMAX_API_KEY`** via Command Palette → **Chat: Manage Language Models**.
3. **Restart VS Code** and pick "MiniMax M3" in the chat picker.

## Setup

### 1. VS Code configuration

Config file location:

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

```json
{
  "name": "MiniMax",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "MiniMax-M3",
      "name": "MiniMax M3",
      "url": "https://api.minimax.io/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "adaptive" },
        "reasoning_split": true,
        "temperature": 1.0,
        "top_p": 0.95
      }
    }
  ]
}
```

### 2. API key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **MiniMax** group → **Update API Key**.
4. Paste your MiniMax API key.

> After setting via the UI, VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference.

### 3. Regional endpoints

| Region        | Endpoint                                       |
| ------------- | ---------------------------------------------- |
| International | `https://api.minimax.io/v1/chat/completions`   |
| China         | `https://api.minimaxi.com/v1/chat/completions` |

> API keys are region-specific and cannot be used across regions.

## Configuration Reference

### Sampling parameters

| Task type            | `temperature` | `top_p` |
| -------------------- | ------------- | ------- |
| Agentic / tool-use   | `1.0`         | `0.95`  |
| Coding               | `1.0`         | `0.95`  |
| General conversation | `1.0`         | `0.95`  |

M3 accepts `temperature` in `[0, 2]` and `top_p` in `[0, 1]`.

### Thinking mode

| `thinking.type` | Behavior                                                                                                                                                          |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `adaptive`      | **Recommended.** Model decides whether to think.                                                                                                                  |
| `disabled`      | Soft hint only — the model still reasons internally and emits `<think>` / `reasoning_content` regardless. Use only if you want a different response field layout. |

When thinking is enabled (any mode), the server returns thinking in one of two formats:

1. **Native** (default): thinking is embedded in `content` wrapped in `<think>` tags.
2. **Interleaved Thinking** (`reasoning_split: true`): thinking is separated into a `reasoning_details` field for cleaner programmatic access.

VS Code will most likely **ignore** the extra `reasoning_details` / `reasoning_content` / `delta.reasoning` fields it doesn't recognize, so `reasoning_split: true` is the cleanest way to keep `content` clean.

### Capabilities

- Streaming (SSE, standard OpenAI format).
- Tool calling with `tool_choice: "auto"`.
- Vision: image and video understanding (M3 only).
- Native multimodal training from step zero.
- Interleaved Thinking: model can reason between each round of tool interactions.
- Automatic prompt caching (no configuration needed).
- 1M context enables long-range agent tasks, long-horizon coding, and long-video understanding.

### Rate limits

| Model        | RPM | TPM        |
| ------------ | --- | ---------- |
| `MiniMax-M3` | 200 | 10,000,000 |

> Input tokens above 512K are available in limited quantity for a limited time. Contact sales for access.

### Model ID casing

MiniMax model IDs are **case-sensitive**. Use exactly:

- `MiniMax-M3` (not `minimax-m3` or `MINIMAX-M3`)

## Troubleshooting

| Symptom                        | Likely cause                                           | Fix                                                      |
| ------------------------------ | ------------------------------------------------------ | -------------------------------------------------------- |
| Model not in picker            | Config not reloaded, or wrong casing                   | Restart VS Code; verify model ID is exactly `MiniMax-M3` |
| Reasoning leaks into `content` | Missing `reasoning_split`                              | Add `reasoning_split: true` to `requestBody`             |
| 401 Unauthorized               | API key region mismatch                                | Use the endpoint that matches your key's region          |
| 429 rate-limited               | Concurrent sessions exceeded 200 RPM / 10M TPM         | Reduce concurrent agent sessions                         |
| Vision request returns 400     | Vision only supported on M3 (not the legacy M2.x line) | Use `MiniMax-M3`                                         |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). MiniMax-M3 pay-as-you-go rates:

| Token range           | Input (Cache Hit) | Input (Cache Miss) | Output     |
| --------------------- | ----------------- | ------------------ | ---------- |
| ≤ 512K input tokens   | $0.12 / 1M        | $0.60 / 1M         | $2.40 / 1M |
| > 512K input tokens\* | $0.24 / 1M        | $1.20 / 1M         | $4.80 / 1M |

\* Input tokens above 512K are available in limited quantity for a limited time.

> **Promo:** A 7-day 50% off promotion is available for new accounts, making the ≤ 512K tier effectively $0.30 / 1M input and $1.20 / 1M output for the first week.

### Token Plan (subscription)

MiniMax also offers monthly subscription plans with quota that resets each month (Plus $20/mo, Max $50/mo, Ultra $120/mo). All plans provide access to all models. See the [MiniMax Token Plan page](https://platform.minimax.io/docs/guides/pricing-token-plan) for details.

---

## Background & Findings

> This appendix preserves the validation narrative for future reference. It is not required to use the model.

### The `thinking` parameter is a soft hint

The `thinking: { "type": "disabled" }` parameter does **not** suppress `<think>` tags or `reasoning_content` in responses — the model always reasons internally. The setting is a layout hint, not a behavioral override.

This is the key insight behind the recommended config:

- `thinking: { type: "adaptive" }` lets the model decide when to reason (which is "always" in practice).
- `reasoning_split: true` tells the server to put the reasoning into a structured `reasoning_details` field, keeping `content` clean for VS Code.

If you have an older config that uses `disabled` (e.g., to mirror the MiMo convention), it will still work — the difference vs `adaptive` is purely cosmetic (response field layout). The model remains stable in 3-turn tool loops under both settings.

### Architecture

- **Model:** MiniMax-M3 (multimodal frontier coding model).
- **Architecture:** Novel MiniMax Sparse Attention (MSA) — designed for 1M context with low latency.
- **Training:** Native multimodal training from step zero with 100T+ data, deep alignment between textual and visual semantic spaces.

### Validation results (June 3, 2026)

#### Phase 1 — Connectivity check

| Check              | Result | Notes                                                                                 |
| ------------------ | ------ | ------------------------------------------------------------------------------------- |
| Non-streaming chat | ✅     | Model responded with `<think>` reasoning + greeting content                           |
| Streaming (SSE)    | ✅     | Chunks arrive as `data: {...}` with incremental `delta.content` and `delta.reasoning` |
| Tool calling       | ✅     | `finish_reason: "tool_calls"` with `get_weather({"location": "San Francisco"})`       |
| Vision             | ✅     | Correctly identified Google logo colors (blue, red, yellow, green) from PNG URL       |

**Key Phase 1 finding:** `thinking: {"type": "disabled"}` does not suppress reasoning — the model still emits `<think>` tags and `reasoning_content`. This is why the recommended config uses `adaptive` + `reasoning_split: true`.

#### Phase 2 — VS Code in-editor validation

The Copilot Chat panel in the validation session was running on `MiniMax M3`, making every response a live test.

| Step                                    | Result | Evidence                                                                                                |
| --------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------- |
| Add config to `chatLanguageModels.json` | ✅     | `MiniMax M3` appears in the model picker                                                                |
| Open VS Code and select the model       | ✅     | Screenshot confirms "MiniMax M3" selected                                                               |
| Plain chat                              | ✅     | Coherent answer to "What do you mean by streaming in this context?"                                     |
| Streaming                               | ✅     | Text appeared progressively in the chat panel                                                           |
| Tool calling (agent mode)               | ✅     | `open_browser_page` invoked successfully → "Google" page title confirmed                                |
| Vision                                  | ✅     | Facebook screenshot analyzed in detail (10 tabs, sidebar items, post content, birthdays, Reels section) |

#### Phase 3 — Multi-turn tool loop test

Asked the model to inspect a YouTube video (`https://www.youtube.com/watch?v=rAzT5lcezPs`) using videoMcp tools. The model chained three tool calls:

| #   | Tool                                          | Result                                                                                                         |
| --- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `mcp_videomcp_get_video_info`                 | ✅ 17 min 6 sec, 1280×720 @ 30 fps, h264, 96 MB                                                                |
| 2   | `mcp_videomcp_analyze_video` (Gemini backend) | ✅ Identified presenter (PewDiePie), topic (Odysseus — local self-hosted AI workspace), key features, sponsors |
| 3   | `mcp_videomcp_transcribe_video` (Deepgram)    | ✅ 17 KB transcript written to file                                                                            |

**Findings:**

- ✅ All three tool calls succeeded without errors.
- ✅ Model chained calls logically (metadata → analysis → transcript) rather than asking the user to re-prompt.
- ✅ Each tool result was incorporated into subsequent reasoning.
- ✅ No `<think>` tag or `reasoning_content` degradation observed mid-conversation — the multi-turn loop did not visibly break the model, contradicting the original Phase 1 worry that `<think>` tags would cause problems.

#### Phase 4 — Long-context test

**Skipped.** The 1M context claim is well-supported by MiniMax's published benchmarks, and the curl test in Phase 1 confirmed single-turn support for multi-KB prompts. The long-context pressure-test is deferred until a real workload requires it.

### Final verdict

- Acceptable for plain chat: **yes**
- Acceptable for streaming chat: **yes**
- Acceptable for tool-enabled agent use: **yes**
- Acceptable for vision: **yes**
- Acceptable without a proxy: **yes**

## References

- MiniMax Official Website: `https://www.minimax.io/`
- MiniMax API Documentation: `https://platform.minimax.io/docs/guides/models-intro`
- MiniMax M3 Model Page: `https://www.minimax.io/models/text/m3`
- MiniMax Text Generation Guide: `https://platform.minimax.io/docs/guides/text-generation`
- MiniMax Tool Use & Interleaved Thinking: `https://platform.minimax.io/docs/guides/text-m3-function-call`
- MiniMax Pricing: `https://platform.minimax.io/docs/pricing/overview`
- MiniMax Pay as You Go: `https://platform.minimax.io/docs/guides/pricing-paygo`
- MiniMax Token Plan: `https://platform.minimax.io/docs/guides/pricing-token-plan`
- MiniMax Rate Limits: `https://platform.minimax.io/docs/guides/rate-limits`
- MiniMax M3 for AI Coding Tools: `https://platform.minimax.io/docs/guides/text-ai-coding-tools`
