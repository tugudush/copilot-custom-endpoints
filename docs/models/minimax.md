# MiniMax — VS Code Custom Endpoint Setup Guide

> **TL;DR:** MiniMax-M3 works directly — no proxy needed. Use `thinking: { type: "adaptive" }` + `reasoning_split: true` in `requestBody` so the model can reason and the response arrives in a clean OpenAI format (`reasoning_details` field, separate from `content`). **Important:** `thinking: { type: "disabled" }` is **not** a hard override — the model still reasons internally and emits `<think>` tags / `reasoning_content` regardless.
>
> The same `url`, `model id`, and `requestBody` work for **both** Pay-as-You-Go (account-balance billing) and Token Plan (monthly/annual subscription) — only the API key in the secret field changes.
>
> **🆕 Try the MiniMax Copilot extension first.** If you have a **Token Plan subscription** (`sk-cp-…` key), the [**MiniMax Copilot** VS Code extension](https://marketplace.visualstudio.com/items?itemName=klarkxy.minimax-vscode-copilot) gives you reasoning visibility, a usage dashboard, status-bar quota monitoring, one-click region switching, and M3 1M context toggling — no JSON editing.
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

1. **Edit `chatLanguageModels.json`** — add the MiniMax block below.
2. **Set your `MINIMAX_API_KEY`** via Command Palette → **Chat: Manage Language Models**.
3. **Restart VS Code** and pick "MiniMax M3" in the chat picker.

## Setup

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

> **Model IDs are case-sensitive.** Use exactly `MiniMax-M3` (not `minimax-m3` or `MINIMAX-M3`).

### 2. Select your billing mode

MiniMax exposes the **same** `https://api.minimax.io/v1/chat/completions` endpoint and the **same** `MiniMax-M3` model id to both billing modes. The only field that changes is the API key — the rest of `chatLanguageModels.json` stays identical.

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

### 4. Regional endpoints

| Region        | Endpoint                                       |
| ------------- | ---------------------------------------------- |
| International | `https://api.minimax.io/v1/chat/completions`   |
| China         | `https://api.minimaxi.com/v1/chat/completions` |

> API keys are region-specific. The same PAYG-vs-Token-Plan distinction applies to the China region (`api.minimaxi.com`); Subscription Keys are issued at `platform.minimaxi.com/user-center/payment/token-plan`.

## Notes

- **`thinking: adaptive` + `reasoning_split: true`** is the recommended pair: the model decides when to reason, and the server returns reasoning in a structured `reasoning_details` field that keeps `content` clean for VS Code. The model still reasons regardless of `thinking.type` — the setting only changes the response field layout.
- **`temperature: 1`, `top_p: 0.95`** are the recommended sampling values for agent/coding work. M3 accepts `temperature` in `[0, 2]` and `top_p` in `[0, 1]`.
- **Vision is image + video on M3 only.**
- **Rate limits:** 200 RPM / 10M TPM. Input tokens above 512K are available in limited quantity for a limited time.

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

The Token Plan is a **monthly or annual** subscription with a shared multimodal usage bar (text + image + audio + video + music share one quota).

| Tier  | Price     | Best for                                     | Quota window            | Typical agent capacity |
| ----- | --------- | -------------------------------------------- | ----------------------- | ---------------------- |
| Plus  | $20 / mo  | Personal projects, prototyping               | 5-hour rolling + weekly | 3–4 agents             |
| Max   | $50 / mo  | Daily coding with agents and multimodal work | 5-hour rolling + weekly | 4–5 agents             |
| Ultra | $120 / mo | Heavy agent workflows and extended sessions  | 5-hour rolling + weekly | 6–7 agents             |

Annual billing is available; unused subscription quota does **not** roll over to the next cycle. Credits are sold separately (`$5` = 5,000 / `$25` = 25,000 / `$100` = 100,000; 365-day validity) and use the same Subscription Key — when the included Token Plan quota is exhausted, purchased Credits automatically cover eligible overflow within Token Plan resource coverage. Subscription quota is consumed first, Credits second.

> The Token Plan is intended for **individual, interactive developer use**, not production. MiniMax recommends PAYG for production workloads. Peak-hour dynamic rate-limiting may apply (typically 15:00–17:30 weekdays, per the [Token Plan platform-traffic rules](https://platform.minimax.io/docs/token-plan/faq#token-plan-limit-rules)). For background, see the [Token Plan overview](https://platform.minimax.io/docs/token-plan/intro) and the [subscription pricing page](https://platform.minimax.io/docs/guides/pricing-token-plan).
