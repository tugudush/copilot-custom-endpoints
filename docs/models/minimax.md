# MiniMax — VS Code Custom Endpoint Setup Guide

> **TL;DR:** **MiniMax-M3.1-Flash** (released October 19, 2026) is the current M-series Flash model and needs no proxy. Use `thinking: { "type": "adaptive" }` + `reasoning_split: true` + `reasoning_effort` in `requestBody` so the model can reason and the response arrives in a clean OpenAI format (`reasoning_content`, kept separate from `content`). **M3.1 Flash cannot disable thinking** — `thinking: { "type": "disabled" }` and `reasoning_effort: "none"` both return HTTP 400 (`requires adaptive thinking`, code 2013) — so tune depth with `reasoning_effort` (`low` / `medium` / `high` / `xhigh` / `max`, default `max`). `MiniMax-M3` uses the same request shape, still accepts `thinking: { "type": "disabled" }` as a soft hint.
>
> The same `url`, `model id`, and `requestBody` work for **both** Pay-as-You-Go (account-balance billing) and Token Plan (monthly/annual subscription) — only the API key in the secret field changes.
>
> **🆕 Try a MiniMax Copilot extension first** (no JSON editing):
>
> - **Token Plan subscription** (`sk-cp-…`): the [**klarkxy/minimax-vscode**](https://marketplace.visualstudio.com/items?itemName=klarkxy.minimax-vscode-copilot) extension is the most feature-rich — reasoning visibility, usage dashboard, status-bar quota monitoring, one-click region switching, and M3 1M context toggling. Subscription keys required.
> - **Pay-as-You-Go** (Open Platform API Key): the [**tugudush/minimax-copilot**](https://github.com/tugudush/minimax-copilot) extension is a PAYG-native alternative — same Anthropic-compatible API surface, but designed for pay-as-you-go keys. Collapsible reasoning block, region auto-detection, walkthrough for first-time setup. See [docs/research/minimax-vscode-extension.md](../research/minimax-vscode-extension.md) for the full side-by-side comparison.
>
> If you'd rather not install an extension, the manual setup below works with both PAYG and Token Plan keys via the OpenAI-compatible endpoint.

## At a Glance

| Field                    | Value                                                                                                                                                       |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mode                     | **Direct** (no proxy)                                                                                                                                       |
| Billing                  | **Pay-as-You-Go** _or_ **Token Plan subscription** (same config)                                                                                            |
| Vision                   | ✅ Yes (image + video)                                                                                                                                      |
| Tool calling             | ✅ Yes                                                                                                                                                      |
| Context                  | 1M (M3 guarantees 512K)                                                                                                                                     |
| Max output               | 131072 recommended (524288 max)                                                                                                                             |
| Required `requestBody`   | M3.1 Flash: `thinking: { type: "adaptive" }, reasoning_split: true, reasoning_effort: "high"` · M3: `thinking: { type: "adaptive" }, reasoning_split: true` |
| Endpoint (international) | `https://api.minimax.io/v1/chat/completions`                                                                                                                |
| Endpoint (China)         | `https://api.minimaxi.com/v1/chat/completions`                                                                                                              |
| Auth                     | `Authorization: Bearer $MINIMAX_API_KEY` (or Subscription Key, see [Setup](#setup))                                                                         |

### Models

| Model                | Vision | Context | Max output                      | Notes                                                                                                  |
| -------------------- | ------ | ------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `MiniMax-M3.1-Flash` | ✅ Yes | 1M      | 131072 recommended (524288 max) | Announced October 19, 2026; tunable thinking depth via `reasoning_effort`; open weights promised later |
| `MiniMax-M3`         | ✅ Yes | 1M      | 131072                          | Multimodal frontier coding model; adaptive reasoning; PAYG and Token Plan share config                 |

## Quick Start

1. **Edit `chatLanguageModels.json`** — add the MiniMax block below.
2. **Set your `MINIMAX_API_KEY`** via Command Palette → **Chat: Manage Language Models**.
3. **Configure the Utility Small Model** — Open Settings → search **"Chat: Utility Small Model"** → pick your fastest model (e.g., DeepSeek V4.1 Flash or MiMo V2.6 Flash). [Why?](../../README.md#4-configure-the-utility-small-model)
4. **Restart VS Code** and pick "MiniMax M3.1 Flash (vision)" (or "MiniMax M3") in the chat picker.

## Setup

### Regional endpoints

> API keys are region-specific. The same PAYG-vs-Token-Plan distinction applies to the China region (`api.minimaxi.com`); Subscription Keys are issued at `platform.minimaxi.com/user-center/payment/token-plan`.

| Region        | Endpoint                                       |
| ------------- | ---------------------------------------------- |
| International | `https://api.minimax.io/v1/chat/completions`   |
| China         | `https://api.minimaxi.com/v1/chat/completions` |

### 1. VS Code configuration

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
      "id": "MiniMax-M3.1-Flash",
      "name": "MiniMax M3.1 Flash (vision)",
      "url": "https://api.minimax.io/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "adaptive" },
        "reasoning_split": true,
        "reasoning_effort": "high",
        "temperature": 1,
        "top_p": 0.95
      }
    },
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

> **Model IDs are case-sensitive.** Use exactly `MiniMax-M3.1-Flash` and `MiniMax-M3` (capital `M`s, lowercase `i`). Both entries can live in the same provider group — delete whichever one you don't need. Do **not** invent suffixed ids or duplicate an existing one: VS Code forwards each `id` as the upstream `model` parameter, and the API only knows the two ids above.

### 2. Select your billing mode

MiniMax exposes the **same** `https://api.minimax.io/v1/chat/completions` endpoint and the **same** model ids (`MiniMax-M3.1-Flash` / `MiniMax-M3`) to both billing modes. The only field that changes is the API key — the rest of `chatLanguageModels.json` stays identical.

| Billing mode  | Key name in console                     | Where to get it                                                   | How usage is metered                            |
| ------------- | --------------------------------------- | ----------------------------------------------------------------- | ----------------------------------------------- |
| Pay-as-You-Go | **Open Platform API Key**               | `platform.minimax.io/user-center/basic-information/interface-key` | Per-token, deducted from your account balance   |
| Token Plan    | **Subscription Key** (prefix `sk-cp-…`) | `platform.minimax.io/user-center/payment/token-plan`              | Monthly quota (5-hour rolling + weekly windows) |

The two keys are **not interchangeable** — a Subscription Key against a PAYG-only endpoint or a PAYG key against the Token Plan quota will be rejected.

### 3. API key source

#### Option A — Pay-as-You-Go key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **MiniMax** group → **Update API Key**.
4. Paste your **Open Platform API Key** from `platform.minimax.io/user-center/basic-information/interface-key`.

> VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference.

#### Option B — Token Plan Subscription Key

The same `chatLanguageModels.json` block above is reused unchanged. Only the secret stored under `${input:chat.lm.secret.<id>}` is replaced with your Subscription Key.

1. Subscribe to a Token Plan (Plus $20 / Max $50 / Ultra $120) at <https://platform.minimax.io/subscribe/token-plan>.
2. Open `platform.minimax.io/user-center/payment/token-plan` and copy the **Subscription Key** (prefix `sk-cp-…`).
3. In VS Code, run **Chat: Manage Language Models** → **MiniMax** group → **Update API Key** → paste the Subscription Key.

When the Token Plan 5-hour or weekly quota is exhausted, the request fails with a Token Plan quota error (see [Troubleshooting](#troubleshooting)). At that point you can either wait for the quota window to reset, buy a Credits top-up at the same console (Credits use the same Subscription Key), or swap the key back to your Open Platform API Key to fall back to PAYG. The URL and `requestBody` do not change during the swap.

### 4. Thinking depth on M3.1 Flash

M3.1 Flash always thinks — `thinking: { "type": "disabled" }` and `reasoning_effort: "none"` both return HTTP 400. The only knob is **`reasoning_effort`**, which accepts `low` / `medium` / `high` / `xhigh` / `max` and defaults to `max` when omitted. Lower levels produce fewer thinking tokens at lower latency; `high` is a good starting point for agent/coding work in VS Code, and `max` matches the configuration Artificial Analysis benchmarked.

```json
"requestBody": {
  "thinking": { "type": "adaptive" },
  "reasoning_split": true,
  "reasoning_effort": "high",
  "temperature": 1,
  "top_p": 0.95
}
```

`reasoning_split: true` keeps thinking out of `content` and on `reasoning_content`. Setting it to `false` is not supported on M3.1 Flash, and the server already returns thinking separately by default. `temperature` and `top_p` are accepted but ignored on the M3 family (fixed at `1` and `0.95`); they are kept here only so every provider block in this repo has the same shape.

## Notes

- **`thinking: adaptive` + `reasoning_split: true`** is the recommended pair on both models: the server returns thinking on the `reasoning_content` field, which keeps `content` clean for VS Code. On M3.1 Flash the `thinking` field is effectively fixed at `adaptive` (the server rejects `disabled`); on M3, `disabled` is a soft hint — the model may still reason internally and emit `<think>` tags / `reasoning_content`, so the setting changes the response layout more than the model's actual behavior.
- **`reasoning_effort` only does something on M3.1 Flash.** M3 ignores it. Values are `low` / `medium` / `high` / `xhigh` / `max`, default `max`; `none` is rejected.
- **`temperature: 1`, `top_p: 0.95`** are accepted but **ignored** on both models (the M3 family is fixed at those values); `top_p` must still be inside `(0, 1]` if you send it.
- **Interleaved thinking and tool loops:** MiniMax recommends sending the complete assistant message — including `reasoning_content` — back in history so the reasoning chain stays continuous. VS Code does not preserve `reasoning_content` across tool turns, so expect shallower continuity on long agent runs. This is a quality trade-off, not an error: unlike Kimi K2.7, M3.1 Flash does not reject a tool result whose assistant message lacks reasoning content.
- **Max output:** `max_completion_tokens` is recommended at 131072 and accepts up to 524288 on both models; thinking tokens count toward that limit.
- **Rate limits:** 200 RPM / 10M TPM. Input tokens above 512K are available in limited quantity for a limited time.

## Troubleshooting

| Symptom                                      | Likely cause                                                                        | Fix                                                                                                                                                                        |
| -------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Model not in picker                          | Config not reloaded, or wrong casing                                                | Restart VS Code; verify the model ID is exactly `MiniMax-M3.1-Flash` or `MiniMax-M3`                                                                                       |
| Reasoning leaks into `content`               | Missing `reasoning_split`                                                           | Add `reasoning_split: true` to `requestBody`                                                                                                                               |
| 400 `requires adaptive thinking` (2013)      | `thinking: { "type": "disabled" }` or `reasoning_effort: "none"` sent to M3.1 Flash | Remove the override; lower `reasoning_effort` instead. On M3.1 Flash thinking cannot be disabled.                                                                          |
| 400 `reasoning_split` cannot be false        | `reasoning_split: false` sent to M3.1 Flash                                         | Use `reasoning_split: true` (or omit it); split output is mandatory on this model.                                                                                         |
| 400 / 2013 with `service_tier`               | `service_tier` sent to M3.1 Flash                                                   | Remove `service_tier` — only `MiniMax-M3` accepts that field                                                                                                               |
| 401 Unauthorized                             | API key region mismatch                                                             | Use the endpoint that matches your key's region                                                                                                                            |
| 401 `token is unusable` / 1004               | Wrong key type on the endpoint — PAYG key against a Token Plan quota or vice versa  | The two keys are not interchangeable. Switch the secret in **Chat: Manage Language Models** to the correct key for the billing mode you intend to use.                     |
| 402 / 429 after a burst of agent turns       | Token Plan 5-hour or weekly quota exhausted; not a PAYG balance issue               | Wait for the quota window to reset, buy a Credits top-up at `platform.minimax.io/user-center/payment/credits`, upgrade plan, or swap the secret to a PAYG key to continue. |
| 429 rate-limited                             | Concurrent sessions exceeded 200 RPM / 10M TPM                                      | Reduce concurrent agent sessions                                                                                                                                           |
| Vision request returns 400                   | Vision is not supported on the legacy M2.x line                                     | Use `MiniMax-M3.1-Flash` or `MiniMax-M3`                                                                                                                                   |
| Token Plan key works in curl but not VS Code | VS Code is still resolving the old `${input:chat.lm.secret.<id>}` reference         | Re-open **Chat: Manage Language Models**, re-paste the Subscription Key, then restart VS Code                                                                              |
| China account gets 401 on `api.minimax.io`   | Key region is China but the URL points to international (or vice versa)             | Switch the `url` to `https://api.minimaxi.com/v1/chat/completions` for China, and get the Subscription Key from `platform.minimaxi.com`                                    |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). MiniMax-M3.1-Flash pay-as-you-go rates are **flat** — one rate for every prompt length, with a 90% cache discount and no `service_tier` support:

| Token range  | Input (Cache Hit) | Input (Cache Miss) | Output     |
| ------------ | ----------------- | ------------------ | ---------- |
| All requests | $0.015 / 1M       | $0.15 / 1M         | $0.60 / 1M |

The `MiniMax-M3` rates below are **effective** rates — a permanent 50% off discount halves the list prices:

### Standard tier

| Token range           | Input (Cache Hit) | Input (Cache Miss) | Output     |
| --------------------- | ----------------- | ------------------ | ---------- |
| ≤ 512K input tokens   | $0.06 / 1M        | $0.30 / 1M         | $1.20 / 1M |
| > 512K input tokens\* | $0.12 / 1M        | $0.60 / 1M         | $2.40 / 1M |

\* Input tokens above 512K are available in limited quantity for a limited time.

> **Permanent 50% off:** A standing 50% discount applies to all MiniMax-M3 pay-as-you-go usage (verified June 9, 2026). The effective rates above are post-discount. List prices (pre-discount) are 2× higher: $0.12 / $0.60 / $2.40 per 1M at ≤512K input.

### Token Plan (subscription)

The Token Plan is a **monthly or annual** subscription with a shared multimodal usage bar (text + image + audio + video + music share one quota).

| Tier  | Price     | Best for                                     | Quota window            | Typical agent capacity |
| ----- | --------- | -------------------------------------------- | ----------------------- | ---------------------- |
| Plus  | $20 / mo  | Personal projects, prototyping               | 5-hour rolling + weekly | 3–4 agents             |
| Max   | $50 / mo  | Daily coding with agents and multimodal work | 5-hour rolling + weekly | 4–5 agents             |
| Ultra | $120 / mo | Heavy agent workflows and extended sessions  | 5-hour rolling + weekly | 6–7 agents             |

Annual billing is available; unused subscription quota does **not** roll over to the next cycle. Credits are sold separately (`$5` = 5,000 / `$25` = 25,000 / `$100` = 100,000; 365-day validity) and use the same Subscription Key — when the included Token Plan quota is exhausted, purchased Credits automatically cover eligible overflow within Token Plan resource coverage. Subscription quota is consumed first, Credits second.

> The Token Plan is intended for **individual, interactive developer use**, not production. MiniMax recommends PAYG for production workloads. Peak-hour dynamic rate-limiting may apply (typically 15:00–17:30 weekdays, per the [Token Plan platform-traffic rules](https://platform.minimax.io/docs/token-plan/faq#token-plan-limit-rules)). For background, see the [Token Plan overview](https://platform.minimax.io/docs/token-plan/intro) and the [subscription pricing page](https://platform.minimax.io/docs/guides/pricing-token-plan).
