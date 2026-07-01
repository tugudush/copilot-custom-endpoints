# MiniMax M3 Priority — Research

> **Research date:** 2026-07-02
> **Primary sources:**
>
> - [MiniMax Pay-as-You-Go pricing](https://platform.minimax.io/docs/guides/pricing-paygo)
> - [Chat Completions API (OpenAI-compatible)](https://platform.minimax.io/docs/api-reference/text-chat-openai)
> - [Messages API (Anthropic-compatible)](https://platform.minimax.io/docs/api-reference/text-chat-anthropic)
> - [OpenAI SDK integration](https://platform.minimax.io/docs/api-reference/text-openai-api)
> - [Rate limits](https://platform.minimax.io/docs/guides/rate-limits)
>
> **Why this matters:** Our `chatLanguageModels.json` registers only `MiniMax-M3` at the Standard service tier. The third-party `klarkxy/minimax-vscode` extension surfaces a **separate picker entry** called `MiniMax-M3-Priority` (see [minimax-vscode-extension.md](minimax-vscode-extension.md)) which hits the same model with `service_tier: "priority"`. This doc explains what Priority actually is, what it costs, and whether it should be added to our recommended config.

---

## TL;DR

- **`MiniMax-M3-Priority` is not a separate model.** It is the same `MiniMax-M3` model ID, requested with a different **admission tier**.
- Priority is selected by adding `"service_tier": "priority"` to the request body. Default (and current behavior of our config) is `"standard"`.
- **Priority costs 1.5× Standard.** With the standing 50% off, Priority is **$0.45 / $1.80 / $0.09** (input/output/cached, ≤512K) vs Standard's $0.30 / $1.20 / $0.06.
- **Priority changes admission behavior, not capabilities:** same context window (1M, guaranteed 512K), same vision, same tool calls, same thinking modes. The tradeoff is **lower queueing latency and fewer admission failures** during platform peak hours, at 50% higher per-token cost.
- **Available on both APIs:** OpenAI-compatible (`/v1/chat/completions`) and Anthropic-compatible (`/anthropic/v1/messages`). Both endpoints document `service_tier` in their OpenAPI spec and return `service_tier` in the response.
- **The Anthropic-compatible endpoint returns `service_tier` in the `message_start` SSE event** of every streaming response — confirms whether a request actually got the priority path.
- **Our current config uses Standard.** It is the cheaper default and is appropriate for most Copilot Chat workloads. Priority is worth considering only if you observe Standard-tier 429s or noticeable queueing latency during MiniMax peak hours (the [Token Plan platform-traffic rules](https://platform.minimax.io/docs/token-plan/faq#token-plan-limit-rules) flag 15:00–17:30 weekdays as the typical peak window, and the same admission logic governs PAYG).

---

## 1. What is "Priority"?

From the official OpenAPI spec for `MiniMax-M3`:

> **`service_tier`** — Service tier for request admission. Supported values are `standard` and `priority`. If omitted, the request uses the `standard` tier.
>
> The `priority` [price](/guides/pricing-paygo) is **1.5 times** the `standard` price and ensures **priority admission so the request is processed ahead of other requests, leading to faster responses and fewer failures**.

So Priority is an admission-class routing hint, not a model swap. There is no `MiniMax-M3-Priority` model ID in the OpenAI `model` enum:

```yaml
model:
  type: string
  enum:
    - MiniMax-M3
    - MiniMax-M2.7
    - MiniMax-M2.7-highspeed
    - MiniMax-M2.5
    - MiniMax-M2.5-highspeed
    - MiniMax-M2.1
    - MiniMax-M2.1-highspeed
    - MiniMax-M2
```

The Anthropic Messages API documents the identical enum. **Priority only exists as a request-time admission preference.**

### How the extension surfaces this

The `klarkxy/minimax-vscode` extension registers two separate model entries in the Copilot picker — `MiniMax-M3` (Standard) and `MiniMax-M3-Priority` (Priority). Internally both send `model: "MiniMax-M3"`, but the Priority entry adds `service_tier: "priority"` to the Anthropic-side request body. The picker UX is just a convenience — the model itself is unchanged.

---

## 2. Pricing — official table (effective rates with the permanent 50% off)

| Tier         | Input tier | Input (cache miss) | Output    | Cache read | List (pre-discount) list price |
| ------------ | ---------- | ------------------ | --------- | ---------- | ------------------------------ |
| Standard     | ≤ 512K     | **$0.30 / M**      | $1.20 / M | $0.06 / M  | ~~$0.60 / $2.40 / $0.12~~      |
| Standard     | > 512K     | **$0.60 / M**      | $2.40 / M | $0.12 / M  | ~~$1.20 / $4.80 / $0.24~~      |
| **Priority** | ≤ 512K     | **$0.45 / M**      | $1.80 / M | $0.09 / M  | ~~$0.90 / $3.60 / $0.18~~      |
| **Priority** | > 512K     | **$0.90 / M**      | $3.60 / M | $0.18 / M  | ~~$1.80 / $7.20 / $0.36~~      |

Source: [Pay-as-You-Go pricing page → Priority tab](https://platform.minimax.io/docs/guides/pricing-paygo#llm). The footnote reads verbatim: "Priority provides priority admission for faster response times and improved request reliability. Set `service_tier` to `priority` to enable it. Pricing is 1.5x standard."

### Effective ratio

- Input: 1.5× (e.g. $0.30 → $0.45)
- Output: 1.5× (e.g. $1.20 → $1.80)
- Cache read: 1.5× (e.g. $0.06 → $0.09)
- The **>512K tier doubles** independently of the service tier, so Priority above 512K is 1.5× × 2× = 3× the ≤512K Standard rate.

### Session cost impact

Using the standard session assumption (~10K input + ~2K output tokens/turn, 50 turns, all ≤512K, **no cache hits**):

| Tier         | Input cost | Output cost | Total     | vs Standard |
| ------------ | ---------- | ----------- | --------- | ----------- |
| Standard     | $0.15      | $0.12       | **$0.27** | baseline    |
| **Priority** | $0.23      | $0.18       | **$0.41** | +52%        |

If your workload reuses cached prefixes heavily (a realistic Copilot Chat scenario with multi-turn agent sessions and the `klarkxy` extension's preflight stabilization), cache reads dominate and the gap narrows somewhat, but Priority is still roughly 50% more expensive on a fully-cached session.

### Cost-per-intelligence (Intelligence Index = 44.4)

- Standard: $0.27 / 44.4 ≈ **$0.0061**
- Priority: $0.41 / 44.4 ≈ **$0.0092**

Priority slips from "top-3 cheapest" to "mid-pack" on a cost-per-intelligence basis, but it remains **cheaper than Kimi K2.6 ($0.021), GLM 5.1 ($0.028), and every Claude / GPT-5.x tier**.

---

## 3. How to enable Priority in our `chatLanguageModels.json`

The current `MiniMax-M3` block in [`docs/models/minimax.md`](../../models/minimax.md) does not set `service_tier`, which means it inherits the API default (`standard`). To switch a model entry to Priority, add one line to `requestBody`:

```json
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
    "top_p": 0.95,
    "service_tier": "priority"
  }
}
```

A cleaner approach — **keep Standard as the default and register a second entry for Priority**, so users can pick from the model picker:

```json
{
  "name": "MiniMax",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "MiniMax-M3",
      "name": "MiniMax M3 (Standard)",
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
    },
    {
      "id": "MiniMax-M3-Priority",
      "name": "MiniMax M3 (Priority)",
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
        "top_p": 0.95,
        "service_tier": "priority"
      }
    }
  ]
}
```

> **Note:** the `id` in the model block is purely a VS Code picker identifier — VS Code does not forward it to the upstream API. The actual model name sent to MiniMax is hard-coded by the extension author; with custom endpoints it is whatever the upstream accepts (in this case `MiniMax-M3`). So **the second entry is just a separate picker slot with a different `requestBody`**. Both entries hit the same `MiniMax-M3` model. The "Priority" suffix is a local label.

### Caveats specific to our custom endpoint path

- VS Code forwards `requestBody` as-is on every request — no merge logic — so `service_tier` rides on every turn.
- VS Code's generic custom-endpoint handler does not surface MiniMax's `service_tier` response field; there is no visual confirmation that a request actually used Priority admission. (The Anthropic-compatible endpoint echoes `service_tier` in the SSE `message_start` event, but our config uses the OpenAI-compatible endpoint and that protocol does not echo it.)
- Both entries share the same `${input:chat.lm.secret.<id>}` reference — a single API key covers both Standard and Priority. There is no "Priority API key"; priority is purely a per-request admission preference.

---

## 4. Priority vs Standard — when does it matter?

### Things Priority changes

- **Admission priority** during platform peak hours — your request is processed ahead of Standard requests in the same account/region.
- **Failure rate under load** — fewer 429s and admission rejections.
- **Per-token cost** — 1.5× across the board (input, output, cache read, both tiers).
- **Effective cost-per-intelligence** — drops from $0.0061 to $0.0092, but still beats Kimi, GLM, and the entire Claude / GPT-5.x family.

### Things Priority does NOT change

- **Model identity** — same `MiniMax-M3` weights, same intelligence score (44.4), same capabilities.
- **Context window** — still 1M (guaranteed 512K).
- **Vision** — image + video unchanged.
- **Tool calling** — unchanged.
- **Thinking modes** — `disabled` / `adaptive` behave identically.
- **Rate limits** — the [Rate Limits](https://platform.minimax.io/docs/guides/rate-limits) page lists M3 at **200 RPM / 10,000,000 TPM** regardless of tier. Priority does not unlock a higher per-account quota.
- **Cache eligibility** — same prompt-caching semantics, same cache-read discount (just priced 1.5× higher).
- **Streaming behavior** — same SSE protocol on both endpoints.

### When Standard is fine

- Off-peak usage (outside the 15:00–17:30 weekday peak window flagged by the Token Plan traffic rules).
- Single-agent or light-concurrency workflows.
- Cost-sensitive setups where every dollar matters.

### When Priority earns its 50% premium

- Heavy agent workflows (parallel agents, long sessions, multi-tool runs).
- Sessions during the documented peak window (15:00–17:30 weekdays).
- Users who hit 429s or noticeable queueing delays on Standard.
- Plan-mode / architecture-review sessions where latency matters more than throughput.

---

## 5. Cross-references

- [docs/models/minimax.md](../../models/minimax.md) — current setup (Standard tier only)
- [docs/research/minimax-vscode-extension.md](minimax-vscode-extension.md) — explains how `klarkxy/minimax-vscode` surfaces M3-Priority as a separate picker entry
- [docs/pricing.md](../../pricing.md) — full pricing table (M3 Standard only; update proposed in this PR)
- [README.md](../../../README.md) — top-level pricing table (M3 Standard only; update proposed in this PR)

---

## 6. Recommendation

1. **Keep the current `MiniMax-M3` block at Standard.** Standard remains the right default for the repo's recommended config — cheapest, same model, no admission issue for the vast majority of Copilot Chat workloads.
2. **Add a second `MiniMax-M3-Priority` entry** to the example config for users who want Priority admission without installing the third-party extension. It costs 50% more but stays competitive on cost-per-intelligence and is significantly cheaper than Kimi/GLM/Claude/GPT-5.x.
3. **Update both pricing tables** (`README.md` and `docs/pricing.md`) to add a Priority row alongside Standard M3, with effective rates (post-50%-off) and the 1.5× multiplier noted.
4. **Document the `service_tier` parameter** briefly in `docs/models/minimax.md` so users know how to flip the switch on the existing entry without adding a second model block.

Open question (not blocking this PR): the OpenAI-compatible endpoint does not document a response field for `service_tier`, so it is not possible to confirm from a Copilot Chat response whether a request actually used the priority admission path. If verification matters, users should switch to the Anthropic-compatible endpoint (which surfaces `service_tier` in the `message_start` SSE event) or rely on empirical latency / 429-rate comparison.
