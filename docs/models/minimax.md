# MiniMax — VS Code Custom Endpoint Setup Guide

> **TL;DR:** MiniMax-M3 works directly — no proxy needed. Use `thinking: { type: "adaptive" }` + `reasoning_split: true` in `requestBody` so the model can reason and the response arrives in a clean OpenAI format (`reasoning_details` field, separate from `content`). **Important:** `thinking: { type: "disabled" }` is **not** a hard override — the model still reasons internally and emits `<think>` tags / `reasoning_content` regardless.
>
> The same `url`, `model id`, and `requestBody` work for **both** Pay-as-You-Go (account-balance billing) and Token Plan (monthly/annual subscription) — only the API key in the secret field changes. See [API key source](#3-api-key-source) below.

> **🆕 Try the MiniMax Copilot extension first.** If you have a **Token Plan subscription** (`sk-cp-…` key), use the [**MiniMax Copilot** VS Code extension](https://marketplace.visualstudio.com/items?itemName=klarkxy.minimax-vscode-copilot) instead — it gives you reasoning visibility, a usage dashboard, status-bar quota monitoring, one-click region switching, and M3 1M context toggling. Install → `MiniMax: Add API Key` → done. No JSON editing.
>
> **PAYG users:** the extension targets the Anthropic-compatible endpoint which requires a Token Plan subscription key. If you're on pay-as-you-go, use the manual setup below — it works with both PAYG and Token Plan keys on the OpenAI-compatible endpoint.

## At a Glance

| Field                    | Value                                                                    |
| ------------------------ | ------------------------------------------------------------------------ |
| Mode                     | **Direct** (no proxy)                                                    |
| Billing                  | **Pay-as-You-Go** _or_ **Token Plan subscription** (same config)         |
| Vision                   | ✅ Yes (image + video)                                                   |
| Tool calling             | ✅ Yes                                                                   |
| Context                  | 1M (guaranteed 512K)                                                     |
| Max output               | 131072                                                                   |
| Required `requestBody`   | `thinking: { type: "adaptive" }, reasoning_split: true`                  |
| Endpoint (international) | `https://api.minimax.io/v1/chat/completions`                             |
| Endpoint (China)         | `https://api.minimaxi.com/v1/chat/completions`                           |
| API key (PAYG)           | Open Platform API Key from `user-center/basic-information/interface-key` |
| API key (Token Plan)     | **Subscription Key** (`sk-cp-…`) from `user-center/payment/token-plan`   |

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
      "name": "MiniMax M3 (vision)",
      "url": "https://api.minimax.io/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "adaptive" },
        "reasoning_split": true,
        "temperature": 1,
        "top_p": 0.95
      }
    }
  ]
}
```

### 2. Select your billing mode

MiniMax exposes the **same** `https://api.minimax.io/v1/chat/completions` endpoint and the **same** `MiniMax-M3` model id to both billing modes. The only field that changes is the API key — the rest of `chatLanguageModels.json` stays identical.

| Billing mode  | Key name in console                     | Where to get it                                                   | How usage is metered                            |
| ------------- | --------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| Pay-as-You-Go | **Open Platform API Key**               | `platform.minimax.io/user-center/basic-information/interface-key` | Per-token, deducted from your account balance   |
| Token Plan    | **Subscription Key** (prefix `sk-cp-…`) | `platform.minimax.io/user-center/payment/token-plan`              | Monthly quota (5-hour rolling + weekly windows) |

The two keys are **not interchangeable** — a Subscription Key against a PAYG-only endpoint or a PAYG key against the Token Plan quota will be rejected. The Token Plan docs are explicit: _"Subscription Keys are separate from standard pay-as-you-go API Keys."_ ([FAQ](https://platform.minimax.io/docs/token-plan/faq#api-key-interchangeable))

### 3. API key source

#### Option A — Pay-as-You-Go key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **MiniMax** group → **Update API Key**.
4. Paste your **Open Platform API Key** from `platform.minimax.io/user-center/basic-information/interface-key`.

> After setting via the UI, VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference.

#### Option B — Token Plan Subscription Key

The same `chatLanguageModels.json` block above is reused unchanged. Only the secret stored under `${input:chat.lm.secret.<id>}` is replaced with your Subscription Key.

1. Subscribe to a Token Plan (Plus $20 / Max $50 / Ultra $120) at <https://platform.minimax.io/subscribe/token-plan>. Annual billing is also available.
2. Open `platform.minimax.io/user-center/payment/token-plan` and copy the **Subscription Key** (prefix `sk-cp-…`).
3. In VS Code, run **Chat: Manage Language Models** → **MiniMax** group → **Update API Key** → paste the Subscription Key.

That's it. The endpoint, model id, and `requestBody` stay exactly the same. VS Code's Copilot Chat will now route the same `MiniMax-M3` requests through the Token Plan quota instead of the PAYG balance.

> When the Token Plan 5-hour or weekly quota is exhausted, the request fails with a Token Plan quota error (see [Troubleshooting](#troubleshooting)). At that point you can either (a) wait for the quota window to reset, (b) buy a Credits top-up at the same console (Credits use the same Subscription Key and cover eligible overflow), or (c) swap the key in **Chat: Manage Language Models** back to your Open Platform API Key to fall back to PAYG. The URL and `requestBody` do not change during the swap.

### 4. Regional endpoints

| Region        | Endpoint                                       |
| ------------- | ---------------------------------------------- |
| International | `https://api.minimax.io/v1/chat/completions`   |
| China         | `https://api.minimaxi.com/v1/chat/completions` |

> API keys are region-specific and cannot be used across regions. The same PAYG-vs-Token-Plan distinction applies to the China region (`api.minimaxi.com`); Subscription Keys are issued at `platform.minimaxi.com/user-center/payment/token-plan`.

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

| Symptom                                      | Likely cause                                                                       | Fix                                                                                                                                                                        |
| -------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model not in picker                          | Config not reloaded, or wrong casing                                               | Restart VS Code; verify model ID is exactly `MiniMax-M3`                                                                                                                   |
| Reasoning leaks into `content`               | Missing `reasoning_split`                                                          | Add `reasoning_split: true` to `requestBody`                                                                                                                               |
| 401 Unauthorized                             | API key region mismatch                                                            | Use the endpoint that matches your key's region                                                                                                                            |
| 401 `token is unusable` / 1004               | Wrong key type on the endpoint — PAYG key against a Token Plan quota or vice versa | The two keys are not interchangeable. Switch the secret in **Chat: Manage Language Models** to the correct key for the billing mode you intend to use.                     |
| 402 / 429 after a burst of agent turns       | Token Plan 5-hour or weekly quota exhausted; not a PAYG balance issue              | Wait for the quota window to reset, buy a Credits top-up at `platform.minimax.io/user-center/payment/credits`, upgrade plan, or swap the secret to a PAYG key to continue. |
| 429 rate-limited                             | Concurrent sessions exceeded 200 RPM / 10M TPM                                     | Reduce concurrent agent sessions                                                                                                                                           |
| Vision request returns 400                   | Vision only supported on M3 (not the legacy M2.x line)                             | Use `MiniMax-M3`                                                                                                                                                           |
| Token Plan key works in curl but not VS Code | VS Code is still resolving the old `${input:chat.lm.secret.<id>}` reference        | Re-open **Chat: Manage Language Models**, re-paste the Subscription Key, then restart VS Code                                                                              |
| China account gets 401 on `api.minimax.io`   | Key region is China but the URL points to international (or vice versa)            | Switch the `url` to `https://api.minimaxi.com/v1/chat/completions` for China, and get the Subscription Key from `platform.minimaxi.com`                                    |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). MiniMax-M3 pay-as-you-go rates:

| Token range           | Input (Cache Hit) | Input (Cache Miss) | Output     |
| --------------------- | ----------------- | ------------------ | ---------- |
| ≤ 512K input tokens   | $0.12 / 1M        | $0.60 / 1M         | $2.40 / 1M |
| > 512K input tokens\* | $0.24 / 1M        | $1.20 / 1M         | $4.80 / 1M |

\* Input tokens above 512K are available in limited quantity for a limited time.

> **Permanent 50% off:** A standing 50% discount applies to all MiniMax-M3 pay-as-you-go usage on both the Standard and Priority tiers (verified June 9, 2026). The effective rates are $0.30 / 1M input, $1.20 / 1M output, and $0.06 / 1M cached input (≤ 512K tier).

### Token Plan (subscription)

The Token Plan is a **monthly or annual** subscription with a shared multimodal usage bar (text + image + audio + video + music share one quota). It is the same family of plans the MiniMax integration guide for Cursor, Claude Code, Zed, Kilo Code, and other IDEs targets — and the _same_ `https://api.minimax.io/v1/chat/completions` endpoint with the _same_ `MiniMax-M3` model id is used. The only field that changes between PAYG and Token Plan is the API key in `${input:chat.lm.secret.<id>}`.

| Tier  | Price     | Best for                                     | Quota window            | Typical agent capacity |
| ----- | --------- | -------------------------------------------- | ----------------------- | ---------------------- |
| Plus  | $20 / mo  | Personal projects, prototyping               | 5-hour rolling + weekly | 3–4 agents             |
| Max   | $50 / mo  | Daily coding with agents and multimodal work | 5-hour rolling + weekly | 4–5 agents             |
| Ultra | $120 / mo | Heavy agent workflows and extended sessions  | 5-hour rolling + weekly | 6–7 agents             |

Annual billing is available; unused subscription quota does **not** roll over to the next cycle. Credits are sold separately (`$5` = 5,000 / `$25` = 25,000 / `$100` = 100,000; 365-day validity) and use the same Subscription Key — when the included Token Plan quota is exhausted, purchased Credits automatically cover eligible overflow within Token Plan resource coverage. Subscription quota is consumed first, Credits second.

> The Token Plan is intended for **individual, interactive developer use**, not production. MiniMax recommends PAYG for production workloads. Peak-hour dynamic rate-limiting may apply (typically 15:00–17:30 weekdays, per the [Token Plan platform-traffic rules](https://platform.minimax.io/docs/token-plan/faq#token-plan-limit-rules)). For background, see the [Token Plan overview](https://platform.minimax.io/docs/token-plan/intro) and the [subscription pricing page](https://platform.minimax.io/docs/guides/pricing-token-plan).
>
> **Source for the same-config claim:** the Token Plan docs show `https://api.minimax.io/v1` + model id `MiniMax-M3` for the OpenAI-compatible path and `https://api.minimax.io/anthropic` for the Anthropic-compatible path, with the same request body fields the PAYG path uses — see [Other Tools › Configuration Reference](https://platform.minimax.io/docs/token-plan/other-tools#configuration-reference). The FAQ explicitly says: _"Can the Subscription Key and the standard Open Platform API Key be used interchangeably? No, they cannot."_ — the **keys are not swappable, but the endpoint, model id, and `requestBody` are.**

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
- MiniMax Token Plan Overview: `https://platform.minimax.io/docs/token-plan/intro`
- MiniMax Token Plan Quickstart: `https://platform.minimax.io/docs/token-plan/quickstart`
- MiniMax Token Plan FAQ (key interchangeability, quota windows, platform limits): `https://platform.minimax.io/docs/token-plan/faq`
- MiniMax Token Plan — Other Tools configuration reference (same endpoint + model id for PAYG and Token Plan): `https://platform.minimax.io/docs/token-plan/other-tools#configuration-reference`
- MiniMax Rate Limits: `https://platform.minimax.io/docs/guides/rate-limits`
- MiniMax M3 for AI Coding Tools: `https://platform.minimax.io/docs/guides/text-ai-coding-tools`
