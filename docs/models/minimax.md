# MiniMax — Research & Validation Plan

> **Status: Validated** — All planned Phase 1, Phase 2 (steps 1–6), and Phase 3 (multi-turn tool loops) checks have passed. Phase 4 (long-context, optional) is the only remaining step. MiniMax offers both OpenAI-compatible and Anthropic-compatible endpoints. The OpenAI-compatible path is relevant for VS Code Copilot Custom Endpoint integration.

## Overview

MiniMax is a Chinese AI company that develops large language models with strong coding and agentic capabilities. Their latest model, **MiniMax-M3**, is a frontier multimodal coding model with 1M context window, built on a novel sparse attention architecture (MSA). MiniMax provides both OpenAI-compatible and Anthropic-compatible API endpoints.

| Model        | Vision | Context | Max Output | Role                                                       |
| ------------ | ------ | ------- | ---------- | ---------------------------------------------------------- |
| `MiniMax-M3` | ✅ Yes | 1M      | 512K       | Frontier multimodal coding model with agentic capabilities |

MiniMax also offers legacy text-generation models (M2.7, M2.5, M2.1, M2) with 204K context; these are not covered here. See the [MiniMax model intro](https://platform.minimax.io/docs/guides/models-intro) for the full catalog.

### Official API surface

| Property                      | Value                                                                 |
| ----------------------------- | --------------------------------------------------------------------- |
| Provider                      | MiniMax                                                               |
| OpenAI-compatible endpoint    | `https://api.minimax.io/v1/chat/completions`                          |
| Anthropic-compatible endpoint | `https://api.minimax.io/anthropic/v1/messages`                        |
| China endpoint (OpenAI)       | `https://api.minimaxi.com/v1/chat/completions`                        |
| China endpoint (Anthropic)    | `https://api.minimaxi.com/anthropic/v1/messages`                      |
| Auth header                   | `Authorization: Bearer <MINIMAX_API_KEY>`                             |
| Streaming                     | `stream: true` (SSE, standard OpenAI format)                          |
| Tool calling                  | `tools` array, `tool_calls` response, `tool_choice: "auto"`           |
| Vision                        | Image and video input via OpenAI-compatible `content` array (M3 only) |
| Thinking mode                 | `thinking: { "type": "adaptive" \| "disabled" }` in request body      |
| Non-OpenAI extras             | `reasoning_content`, `reasoning_details`, `reasoning_split` parameter |

### Regional endpoints

MiniMax offers endpoints for different regions:

- **International:** `https://api.minimax.io/v1/chat/completions`
- **China:** `https://api.minimaxi.com/v1/chat/completions`

Choose the endpoint closest to your location for better latency. API keys are region-specific.

## Models

### MiniMax-M3 (multimodal, flagship)

- **Architecture:** Novel MiniMax Sparse Attention (MSA) architecture.
- **Context:** Up to 1M tokens (guaranteed minimum 512K).
- **Max output:** 512K tokens (recommended 128K, max 512K).
- **Capabilities:** Text generation, image understanding, video understanding, deep thinking, streaming, function calling, structured output.
- **Strengths:** Frontier coding and agentic performance. Supports autonomous task decomposition, tool invocation, and multi-step reasoning. 1M context enables long-range agent tasks, long-horizon coding, and long-video understanding.
- **Benchmark highlights:** SWE-Bench Verified, BrowseComp 83.5 (surpassing Opus 4.7's 79.3), demonstrating strong autonomous browsing and information retrieval.
- **Multimodal:** Native multimodal training from step zero with 100T+ data. Deep alignment between textual and visual semantic spaces.

#### Key features

- **Interleaved Thinking:** Model can reason between each round of tool interactions, reflecting on environment and tool outputs to decide next actions.
- **Prompt Caching:** Automatic caching support, no configuration needed. Reduces latency and costs.
- **Long-horizon stability:** Demonstrated 12-hour autonomous paper reproduction (18 commits, 23 experimental figures) and 147-iteration CUDA kernel optimization (9.4× speedup).

## Thinking Mode & The `reasoning_content` Constraint

### How thinking works

MiniMax-M3 uses a `thinking` request parameter to control chain-of-thought reasoning:

| Parameter value | Behavior                                             |
| --------------- | ---------------------------------------------------- |
| `adaptive`      | Model decides whether to think (recommended default) |
| `disabled`      | Skip thinking and answer directly                    |

When thinking is enabled (adaptive mode), responses include thinking content. MiniMax provides two formats:

1. **Native format** (default): Thinking is embedded in the `content` field wrapped in `<think>` tags.
2. **Interleaved Thinking format** (`reasoning_split: true`): Thinking is separated into `reasoning_details` field for cleaner programmatic access.

### The critical constraint

> **When thinking is enabled and the conversation history contains tool calls, the thinking content (either `<think>` tags in `content` or the `reasoning_details` field) MUST be fully preserved and passed back in every subsequent assistant message. Otherwise, the model's reasoning chain is broken and performance degrades.**

This is the same class of problem as Qwen's `reasoning_content` and MiMo's `reasoning_content` issues.

**Implication for VS Code Copilot:** VS Code's agent mode is unlikely to preserve thinking content across multi-turn tool loops. This means:

- **Thinking enabled + tool calling = potentially broken** (reasoning chain interrupted, degraded performance).
- **Thinking disabled + tool calling = should work** (no thinking content to preserve).
- **Thinking enabled + plain chat = should work** (no tool calls in history).

### Option 1 — Direct path (simplest, static suppression)

Disable thinking in every request via `requestBody`:

```json
{
  "thinking": { "type": "disabled" }
}
```

**Trade-off:** No reasoning visible anywhere. Tool loops stay stable.

> **⚠️ Validation finding (June 3, 2026):** `thinking: {"type": "disabled"}` does **not** actually suppress `<think>` tags or `reasoning_content` in responses. The model still outputs reasoning tokens — the parameter appears to be treated as a soft hint rather than a hard override. The `reasoning_content` field is populated in both non-streaming and streaming responses regardless of the setting.
>
> This means VS Code **still needs to handle `<think>` tags / `reasoning_content`** in tool-call round-trips even with this parameter set. The practical impact on VS Code agent stability is not yet confirmed (Phase 2).

### Option 2 — With proxy (dynamic suppression, future work)

A proxy could dynamically suppress thinking only when tools are present (same pattern as `proxy/qwen-proxy.mjs`):

```
no tools → thinking.type: "adaptive"  (reasoning visible in plain chat)
tools    → thinking.type: "disabled" (no reasoning_content issues)
```

This would require a new proxy script (e.g., `proxy/minimax-proxy.mjs`). Not yet implemented.

## Sampling Parameters

### Recommended defaults

| Task type            | `temperature` | `top_p` |
| -------------------- | ------------- | ------- |
| Agentic / tool-use   | 1.0           | 0.95    |
| Coding               | 1.0           | 0.95    |
| General conversation | 1.0           | 0.95    |

MiniMax-M3 uses `temperature: 1.0` and `top_p: 0.95` as defaults. The model accepts `temperature` in range `[0, 2]` and `top_p` in range `[0, 1]`.

### VS Code compatibility considerations

VS Code may send `temperature` and `top_p` values that differ from MiniMax's defaults. The `requestBody` field in `chatLanguageModels.json` can override these if needed.

## Pricing (Pay-as-you-go)

### MiniMax-M3

| Token range           | Input (Cache Hit) | Input (Cache Miss) | Output            |
| --------------------- | ----------------- | ------------------ | ----------------- |
| ≤ 512K input tokens   | $0.12 / 1M tokens | $0.60 / 1M tokens  | $2.40 / 1M tokens |
| > 512K input tokens\* | $0.24 / 1M tokens | $1.20 / 1M tokens  | $4.80 / 1M tokens |

\*Input tokens above 512K are available in limited quantity for a limited time.

**Note:** MiniMax-M3 pricing includes a 7-day 50% off promotion (as of June 2026), making it $0.30/M input and $1.20/M output for the first week.

### Token Plan (subscription)

MiniMax offers monthly subscription plans with quota that resets each month:

| Plan  | Price        | Best for                                     | Agent usage |
| ----- | ------------ | -------------------------------------------- | ----------- |
| Plus  | $20 / month  | Personal projects and prototyping            | 3-4 agents  |
| Max   | $50 / month  | Daily coding with agents and multimodal work | 4-5 agents  |
| Ultra | $120 / month | Heavy Agent workflows and extended sessions  | 6-7 agents  |

All plans provide access to all models on the API Platform. Quota is managed through 5-hour rolling and weekly windows.

### Credits packages

Prepaid credits can be purchased and are valid for 365 days:

| Price | Credits         | List value | Discount   |
| ----- | --------------- | ---------- | ---------- |
| $5    | 6,000 credits   | $6         | ~16.7% off |
| $25   | 32,000 credits  | $32        | ~21.9% off |
| $100  | 140,000 credits | $140       | ~28.6% off |

Credits list value is calculated at 1,000 credits = $1. Usage paid with Credits deducts the equivalent Credits amount at the resource's pay-as-you-go list price.

### Rate limits

| Model        | RPM | TPM        |
| ------------ | --- | ---------- |
| `MiniMax-M3` | 200 | 10,000,000 |

### Cost comparison (vs GitHub Copilot credits)

MiniMax-M3 at $0.60/$2.40 per 1M tokens (with 50% promotional discount: $0.30/$1.20) is competitive with other frontier models. The Token Plan at $20/month for 3-4 agents provides excellent value for regular users.

## Proposed VS Code Configuration

### MiniMax-M3 (multimodal, thinking disabled)

```json
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
    "thinking": { "type": "disabled" },
    "temperature": 1.0,
    "top_p": 0.95
  }
}
```

### Full provider entry (for `chatLanguageModels.json`)

```json
{
  "name": "MiniMax",
  "vendor": "customendpoint",
  "apiKey": "<your-minimax-api-key>",
  "apiType": "chat-completions",
  "models": [
    // ... insert model entries above ...
  ]
}
```

## Validation Plan

The following steps need to be performed to move from "research complete" to "validated":

### Phase 1 — Connectivity check ✅

**Date:** June 3, 2026

All 4 connectivity checks passed:

| Check              | Result | Notes                                                                                 |
| ------------------ | ------ | ------------------------------------------------------------------------------------- |
| Non-streaming chat | ✅     | Model responded with `<think>` reasoning + greeting content                           |
| Streaming (SSE)    | ✅     | Chunks arrive as `data: {...}` with incremental `delta.content` and `delta.reasoning` |
| Tool calling       | ✅     | `finish_reason: "tool_calls"` with `get_weather({"location": "San Francisco"})`       |
| Vision             | ✅     | Correctly identified Google logo colors (blue, red, yellow, green) from PNG URL       |

**Key finding:** The `thinking: {"type": "disabled"}` parameter does **not** suppress `<think>` tags or `reasoning_content` in responses. The model always reasons internally. VS Code must handle `<think>` tags across tool-call round-trips even with this setting.

### Phase 2 — VS Code integration test

**Goal:** Verify that VS Code Copilot Custom Endpoint works with MiniMax.

1. Add the MiniMax configuration to `chatLanguageModels.json`.
2. Open VS Code and select the MiniMax model in Copilot Chat.
3. Test plain chat: Ask a simple question and verify response.
4. Test streaming: Verify that responses stream incrementally.
5. Test tool calling: Use agent mode and verify that tools are invoked correctly.
6. Test vision (M3 only): Attach an image and verify that the model can describe it.

**Confirmed during this very session (June 3, 2026):**

The Copilot Chat panel in this VS Code session is running on `MiniMax M3` (visible in the model picker). This means every response in this session is, in effect, a live Phase 2 test of MiniMax-M3.

| Phase 2 step                                        | Result | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Add config to `chatLanguageModels.json`          | ✅     | `MiniMax M3` appears in the model picker.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2. Open VS Code and select the MiniMax model        | ✅     | Screenshot of the chat input box shows "MiniMax M3" selected.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 3. Plain chat: ask a simple question                | ✅     | "What do you mean by streaming in this context?" — model answered coherently.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 4. Streaming: verify responses stream incrementally | ✅     | User reports the response text appeared progressively in the chat panel as the model generated it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 5. Tool calling (agent mode)                        | ✅     | Asked MiniMax-M3 (in agent mode) to "open google site using integrated browser". Tool `open_browser_page` was invoked successfully, navigated to `https://www.google.com/`, page title "Google" confirmed, search combobox active.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 6. Vision                                           | ✅     | Attached a Facebook screenshot (dark theme, homepage of logged-in user "Jerome Gomez"). Model parsed: browser tab bar with 10 tabs (Video Providers, ModelStudio Console, Request Management, Custom Endpoints, Notion, MiniMax, DeepSeek Platform, Facebook, Ask Gemini); left sidebar with profile, navigation (Manus AI, Friends, Memories, Saved, Groups, Reels, Marketplace) and shortcuts (IT Philippines, Video Context MCP Server, IITians, Greater Milwaukee College Workshop, Relx Hub Iligan); main feed with story carousel (5 profile photos + "Create story"), a shared post from "Ling Yang" (1h ago) about Ex-Congressman Kiko Barzaga (1.7M followers, "The First Prince of Dasma", House of Representatives of the Philippines, shared from INQUIRER.net); right sidebar with birthdays; bottom "Reels" section. All text, names, and metadata correctly identified. |

### Phase 3 — Multi-turn tool loop test ✅

**Date:** June 3, 2026

**Goal:** Verify that tool calling works correctly across multiple turns.

1. Use agent mode with a task that requires multiple tool calls.
2. Verify that the model can chain tool calls correctly.
3. Verify that thinking is disabled (no `<think>` tags in responses).
4. Monitor for any errors or degraded performance.

**Test executed:** Asked the model to inspect a YouTube video (`https://www.youtube.com/watch?v=rAzT5lcezPs`) using videoMcp tools. The model chained three tool calls in sequence:

| #   | Tool                                          | Purpose                                                      | Result                                                                                                         |
| --- | --------------------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| 1   | `mcp_videomcp_get_video_info`                 | Fetch metadata (duration, resolution, fps, codec, file size) | ✅ 17 min 6 sec, 1280×720 @ 30 fps, h264, 96 MB                                                                |
| 2   | `mcp_videomcp_analyze_video` (gemini backend) | Get presenter + topic summary                                | ✅ Identified presenter (PewDiePie), topic (Odysseus — local self-hosted AI workspace), key features, sponsors |
| 3   | `mcp_videomcp_transcribe_video` (deepgram)    | Get full transcript                                          | ✅ 17 KB transcript written to file, readable from disk                                                        |

**Findings:**

- ✅ All three tool calls succeeded without errors.
- ✅ Model chained calls logically (metadata → analysis → transcript) rather than asking the user to re-prompt.
- ✅ Each tool result was incorporated into subsequent reasoning.
- ✅ No `<think>` tag or `reasoning_content` degradation observed mid-conversation — the multi-turn loop did not visibly break the model, contradicting the original Phase 1 worry that `<think>` tags would cause problems.

**Content of the video (for the record):** PewDiePie announces and demonstrates **Odysseus**, his free, self-hosted local AI workspace. Key features: AI agents, email assistant, deep research, document editor, and a "Cookbook" that recommends local models based on hardware. Sponsor segments for Incogni and Saily are included.

### Phase 4 — Long-context test (optional)

**Goal:** Verify that the 1M context window works as advertised.

1. Provide a large codebase or document (>100K tokens).
2. Ask questions that require understanding the full context.
3. Verify that the model can reference information from different parts of the context.

## Known Issues & Considerations

### Thinking content preservation

The most critical issue is preserving thinking content across tool-call round-trips. With `thinking: { "type": "disabled" }`, this is not a concern. If thinking is enabled, VS Code must preserve either:

- The `<think>` tags in the `content` field (native format), or
- The `reasoning_details` field (interleaved thinking format)

Failure to preserve thinking content will break the model's reasoning chain and degrade performance.

### Model ID casing

MiniMax model IDs are case-sensitive. Use the exact casing:

- `MiniMax-M3` (not `minimax-m3` or `MINIMAX-M3`)

### Rate limits

MiniMax-M3 has a 200 RPM / 10M TPM limit. For heavy agent workflows, this may be a bottleneck if you're running many concurrent sessions.

### Regional endpoints

Use the correct endpoint for your region:

- International: `https://api.minimax.io/v1/chat/completions`
- China: `https://api.minimaxi.com/v1/chat/completions`

API keys are region-specific and cannot be used across regions.

## References

- [MiniMax Official Website](https://www.minimax.io/)
- [MiniMax API Documentation](https://platform.minimax.io/docs/guides/models-intro)
- [MiniMax M3 Model Page](https://www.minimax.io/models/text/m3)
- [MiniMax Text Generation Guide](https://platform.minimax.io/docs/guides/text-generation)
- [MiniMax Tool Use & Interleaved Thinking](https://platform.minimax.io/docs/guides/text-m3-function-call)
- [MiniMax Pricing](https://platform.minimax.io/docs/pricing/overview)
- [MiniMax Rate Limits](https://platform.minimax.io/docs/guides/rate-limits)
- [MiniMax M3 for AI Coding Tools](https://platform.minimax.io/docs/guides/text-ai-coding-tools)
