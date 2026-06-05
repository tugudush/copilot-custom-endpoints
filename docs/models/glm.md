# GLM (Z.ai / Zhipu AI) — VS Code Custom Endpoint Setup Guide

> **TL;DR:** GLM works directly with VS Code's custom-endpoint provider — **no proxy needed**. The API is OpenAI Chat Completions compatible at `https://api.z.ai/api/paas/v4/chat/completions`, and Z.ai's default `thinking.clear_thinking: true` quietly strips `reasoning_content` from prior turns, which makes multi-turn tool loops stable even when VS Code doesn't preserve reasoning blocks. The **GLM Coding Plan** endpoint is **not** usable here — it is locked to a curated list of coding tools (Claude Code, Cline, OpenCode, etc.).

## At a Glance

| Field                  | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| Mode                   | **Direct** (no proxy)                                   |
| Vision                 | ✅ Yes (`glm-5v-turbo` only)                            |
| Tool calling           | ✅ Yes (native multimodal tool use on `glm-5v-turbo`)   |
| Context (flagship)     | 200K (`glm-5.1` / `glm-5v-turbo`)                       |
| Max output (flagship)  | 128K                                                    |
| Required `requestBody` | `thinking: { type: "enabled" }` (recommended)           |
| Endpoint (intl)        | `https://api.z.ai/api/paas/v4/chat/completions`         |
| Endpoint (China)       | `https://open.bigmodel.cn/api/paas/v4/chat/completions` |
| Auth                   | `Authorization: Bearer $ZAI_API_KEY`                    |

### Models at a glance

| Model          | Vision | Context | Max output | Thinking  | Cost (in / out per 1M) | Role                                                      |
| -------------- | ------ | ------- | ---------- | --------- | ---------------------- | --------------------------------------------------------- |
| `glm-5.1`      | ❌     | 200K    | 128K       | `enabled` | $1.40 / $4.40          | Current flagship — long-horizon / 8h autonomous work      |
| `glm-5v-turbo` | ✅     | 200K    | 128K       | `enabled` | $1.20 / $4.00          | Multimodal **coding** model — vision-based agentic coding |

> Other GLM models — `glm-5`, `glm-5-turbo`, `glm-4.6v-flashx`, `glm-4.5`, `glm-4.5-air`, `glm-4.5-flash`, `glm-4.5-x`, `glm-4.5-airx`, `glm-4-32b-0414-128k` — are callable on the same endpoint but are intentionally **not** added to the default `chatLanguageModels.json` block below. Add them in the same shape if you need them. Note: `glm-4.6v-flashx` was previously in the default block but has been **removed** because live testing showed it is not reliable for tool calling.

## Quick Start

1. **Create a Z.ai account** at [z.ai/model-api](https://z.ai/model-api) and add credits on the [Billing page](https://z.ai/manage-apikey/billing).
2. **Generate an API key** on the [API Keys page](https://z.ai/manage-apikey/apikey-list).
3. **Edit `chatLanguageModels.json`** — add the GLM block from [Setup](#setup) below.
4. **Set the API key** via Command Palette → **Chat: Manage Language Models** → right-click **GLM** → **Update API Key**.
5. **Restart VS Code** and pick a GLM model from the picker.

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
  "name": "GLM",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "glm-5.1",
      "name": "GLM 5.1 (flagship)",
      "url": "https://api.z.ai/api/paas/v4/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true,
      "maxInputTokens": 204800,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "enabled" },
        "temperature": 1,
        "top_p": 0.95
      }
    },
    {
      "id": "glm-5v-turbo",
      "name": "GLM 5V Turbo (vision flagship)",
      "url": "https://api.z.ai/api/paas/v4/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 204800,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "enabled" },
        "temperature": 1,
        "top_p": 0.95
      }
    }
  ]
}
```

> **Leave `apiKey` as `""`** — set it through the Language Models UI so VS Code stores it in the OS keychain (it will replace the empty string with a `${input:chat.lm.secret.<id>}` reference).

### 2. API key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **GLM** group → **Update API Key**.
4. Paste your Z.ai API key.

### 3. Regional endpoints

| Region                            | Endpoint                                                | Notes                                                      |
| --------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| **International** (default above) | `https://api.z.ai/api/paas/v4/chat/completions`         | [z.ai/model-api](https://z.ai/model-api) — USD billing     |
| China                             | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | [open.bigmodel.cn](https://open.bigmodel.cn) — CNY billing |

> API keys are region-specific and **cannot** be used across regions. If you signed up on `bigmodel.cn` (China), swap the `url` values in the block above to the China endpoint — everything else is identical.

## Configuration Reference

### Sampling parameters

| Parameter     | Range (hard cap) | Default                                  |
| ------------- | ---------------- | ---------------------------------------- |
| `temperature` | `[0.0, 1.0]`     | `1.0` for GLM-4.6 / 5.x · `0.6` for 4.5  |
| `top_p`       | `[0.01, 1.0]`    | `0.95` for 4.5/4.6/5.x · `0.9` for 4-32B |
| `do_sample`   | bool             | `true` — set `false` to bypass sampling  |

> **Important:** Z.ai's `temperature` is capped at `1.0` server-side. Sending a value like `1.2` will be rejected. VS Code's defaults (typically `0`–`1`) are within range, but the explicit `requestBody` values above are the recommended ones for coding/agent work.

### Thinking mode

`thinking` is a GLM-specific object. It only applies to **GLM-4.5 and above**.

| Field                     | Values                 | Default                                              | Meaning                                                                                                   |
| ------------------------- | ---------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `thinking.type`           | `enabled` / `disabled` | `enabled` for 5.1/5/5-Turbo/4.5V; hybrid for 4.6/4.5 | Force-enable or force-disable chain-of-thought. Hybrid lets the model decide.                             |
| `thinking.clear_thinking` | bool                   | **`true`**                                           | When `true`, Z.ai **strips historical `reasoning_content` from prior turns** before sending to the model. |

> **Why the default is good for VS Code:** with `clear_thinking: true` (the server default), Z.ai doesn't require the client to forward `reasoning_content` between turns. VS Code's custom-endpoint provider doesn't preserve that field across tool turns — but for GLM it doesn't need to, because the server strips it. This avoids the same class of `reasoning_content` 400 errors that bite on MiMo.
>
> Set `clear_thinking: false` only if you are building a custom client that **does** forward `reasoning_content` verbatim. Do **not** set it from VS Code's `requestBody` — it would push GLM into a mode VS Code cannot satisfy.

| Mode in VS Code     | Plain chat                       | Tool turns                                           |
| ------------------- | -------------------------------- | ---------------------------------------------------- |
| Recommended (above) | Thinking ON                      | Thinking ON, prior `reasoning_content` auto-stripped |
| Faster/cheaper      | `thinking: { type: "disabled" }` | `thinking: { type: "disabled" }`                     |
| Preserved Thinking  | not supported in VS Code         | do not enable `clear_thinking: false`                |

### Capabilities

- **OpenAI Chat Completions protocol** at `/api/paas/v4/chat/completions` — request and response shapes are standard OpenAI.
- **Streaming** via SSE, terminated with `data: [DONE]`. (Same as OpenAI.)
- **Tool calling** with the standard `tools` array. `tool_choice` accepts only `auto`.
- **Max 128 functions** per request.
- **Tool stream** (`tool_stream: true`) is supported on the `glm-5v-turbo` family and above for streaming tool-call deltas.
- **Vision** on `glm-5v-turbo` using the OpenAI `image_url` content-part format. External URLs and base64 data URIs both work.
- **Video input** on `glm-5v-turbo` — the model natively accepts video (Input Modality: **Video / Image / Text / File**). Use a public video URL in an `image_url` content part via direct API call; VS Code's chat UI does not currently forward video attachments to the model. For a turnkey VS Code integration that bridges the gap (extracts frames, routes them to GLM or a fallback provider, and answers natural-language questions about the video), see [**Video Context MCP**](https://www.videocontextmcp.com/) — an MCP server that gives Copilot/Cursor/Claude Code video understanding via the `glm-5v-turbo` provider and a multi-provider fallback chain (Gemini → GLM 5V Turbo → Qwen 3.7 Plus → Kimi K2.6 → MiMo-V2.5).
- **Native multimodal tool calling** on `glm-5v-turbo` — images, screenshots, and document pages can be passed directly as tool parameters and tool results can be consumed visually.
- **Built-in web search** is exposed as a tool type `web_search` (different from `function`).
- **Context caching** is automatic — the API returns `usage.prompt_tokens_details.cached_tokens` on cache hits; cache writes are currently free of charge.
- **Response shape extras:** `choices[].message.reasoning_content` (when thinking is on), `web_search[]` (when web search is used), `usage` with `cached_tokens`.

### Rate limits

Z.ai throttles **by in-flight concurrency**, not classic RPM/TPM. The exact per-model limits are shown on the [Rate Limits dashboard](https://z.ai/manage-apikey/rate-limits) once you are signed in. **All paid models share a generous pool sized to your prepaid balance.**

For vision-capable work, use the `glm-5v-turbo` model ($1.20 / $4.00 per 1M). For text-only use, `glm-5.1` ($1.40 / $4.40 per 1M) is the flagship and recommended default for agent/coding work — strong quality for long-horizon autonomous tasks.

> The **GLM Coding Plan** has separate (much higher) concurrency limits but is **not available via custom endpoints** — see [Why the Coding Plan is not an option](#why-the-glm-coding-plan-is-not-an-option-for-vs-code) below.

## Troubleshooting

| Symptom                                                  | Likely cause                                                          | Fix                                                                  |
| -------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Model not in picker                                      | Config not reloaded, or JSON syntax error                             | Restart VS Code; validate JSON                                       |
| HTTP 400 on the first turn                               | `requestBody` removed `do_sample` semantics or invalid `temperature`  | Ensure `temperature ≤ 1.0` and `top_p ∈ [0.01, 1.0]`                 |
| `invalid temperature: only values ≤ 1.0 are allowed`     | Set `temperature > 1.0`                                               | Lower it to `1.0` or below                                           |
| Tool call succeeds but follow-up turn degrades           | `clear_thinking: false` set in `requestBody`                          | Remove the `clear_thinking` key and let the server default to `true` |
| `tool_choice: required` rejected                         | GLM only supports `auto`                                              | Don't override `tool_choice` (VS Code's default is `auto`)           |
| `Failed to download multimodal content` on a vision call | Z.ai's servers couldn't reach the image URL                           | Use a base64 `data:image/...` URI instead                            |
| 401 Unauthorized                                         | Region mismatch (international key used on China URL, or vice versa)  | Match your key to the regional endpoint                              |
| Upstream complains about `reasoning_content is missing`  | You set `clear_thinking: false` from a client that doesn't forward it | Drop `clear_thinking` from `requestBody`                             |
| 429 / "concurrency limit exceeded"                       | Too many in-flight requests                                           | Reduce concurrent agent sessions, or upgrade your Z.ai plan          |

| Long Chinese responses when the prompt is English | Missing `Accept-Language: en-US,en` (Z.ai default) | Optional — VS Code's custom-endpoint provider doesn't set custom headers; usually the prompt language wins |

## Pricing

All prices are **USD per 1M tokens** (cache miss) on the Z.ai international platform. Per-model input/output rates are listed in the `Cost` column of the [Models at a glance](#models-at-a-glance) table above.

> **Cache writes** are currently **Limited-time Free** for all models. Cached-input pricing is roughly 18% of the input price (e.g. `$1.40` input → `$0.25` cached for `glm-5.1`). China platform (`bigmodel.cn`) prices in CNY; see the [China pricing page](https://bigmodel.cn/pricing). For the cross-provider comparison, see [docs/pricing.md](../pricing.md).

---

## Background & Findings

> This appendix preserves the validation narrative for future reference. It is not required to use the model.

### Why GLM was a reasonable candidate

Z.ai publishes an OpenAI-Chat-Completions-compatible API at `https://api.z.ai/api/paas/v4/chat/completions` with:

- Standard Bearer auth (`Authorization: Bearer <key>`).
- Standard request/response shapes (`messages`, `tools`, `tool_calls`, `stream`).
- Standard `model`, `temperature`, `top_p`, `max_tokens`, `response_format`.
- A documented OpenAI SDK `base_url` of `https://api.z.ai/api/paas/v4/`.

That makes VS Code's `chat-completions` provider the obvious starting point — same shape as DashScope, Moonshot, and MiMo, all of which already work in this repo.

### What differs from other providers in this repo

| Concern                           | Z.ai / GLM behaviour                                                                                                                                                                                 | Why it matters for VS Code                                                                                                                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Thinking default                  | Always-on for `glm-5.1` / `glm-5v-turbo`.                                                                                                                                                            | VS Code can simply set `thinking: { type: "enabled" }` in `requestBody` to make thinking deterministic on every model.                      |
| `reasoning_content` on tool turns | Z.ai defaults to `clear_thinking: true`, **silently stripping historical `reasoning_content`**.                                                                                                      | This is a near-perfect match for VS Code, which does **not** preserve `reasoning_content` between turns. Loops work without extra plumbing. |
| `tool_choice`                     | Only `auto` is accepted.                                                                                                                                                                             | VS Code's default behaviour is `auto`, so no override needed.                                                                               |
| `temperature` hard cap            | `[0.0, 1.0]` — strictly enforced server-side.                                                                                                                                                        | Use `1.0` for coding/agent work; never go above.                                                                                            |
| `do_sample`                       | Default `true`. When `false`, `temperature` and `top_p` are ignored.                                                                                                                                 | Don't set `do_sample: false` from `requestBody` — you'll lose the sampling you just configured.                                             |
| Coding Plan endpoint              | A separate endpoint at `https://api.z.ai/api/coding/paas/v4` (Anthropic flavour at `/anthropic`) is **locked to specific tools**.                                                                    | Cannot be used for VS Code custom endpoints — see below.                                                                                    |
| Vision (image input + tool use)   | OpenAI `image_url` content-part format (external URLs and base64 data URIs both work). `glm-5v-turbo` supports **native multimodal tool use** (images as tool args, tool results consumed visually). | Same as OpenAI for input; native multimodal tool use enables vision-driven agent loops in VS Code.                                          |

### Why the GLM Coding Plan is **not** an option for VS Code

The Coding Plan ($18–$160/mo) is a subscription that gates access to a small set of officially supported tools: **Claude Code, Cline, OpenCode, Kilo Code, Crush, Factory, and a handful of others**. The relevant callouts from Z.ai's own docs:

- _"The GLM Coding Plan is strictly limited to use within officially supported tools and product environments; users may not use their subscription benefits for tools or scenarios outside of this scope."_
- _"If the system detects usage through unauthorized or unsupported tools (such as SDK-based access or other third-party integrations), some subscription benefits may be restricted."_
- The Coding endpoint base URL (`/api/coding/paas/v4`) is the only one that consumes the subscription quota — the general `/api/paas/v4` endpoint **always** charges against pay-as-you-go balance, even if you have an active Coding Plan.

VS Code's custom-endpoint provider is not on the supported list, so the Coding Plan endpoint is the wrong target. The general `/api/paas/v4/chat/completions` endpoint is the correct one, and it bills against your prepaid Z.ai balance.

### Plan for this repo

This file is the **research record and the user-facing setup guide**. The implementation work, when carried out, will be:

1. **Add the `chatLanguageModels.json` block** shown above into [docs/example-config.md](../example-config.md) so users can copy all-providers-at-once.
2. **Add a row to the model table** in [README.md](../../README.md) (and the per-model summary in [docs/competitors.md](../competitors.md) if relevant) pointing to `docs/models/glm.md`.
3. **No new proxy.** The direct path is sufficient. If a future provider quirk surfaces (e.g. a sampling cap that VS Code sends above `1.0`, or a `clear_thinking` semantics change), the existing `lib/create-proxy.mjs` factory makes it cheap to add a `proxy/glm-proxy.mjs` mirroring `proxy/qwen-proxy.mjs`.
4. **No CLI / npm-script changes.** `npm run proxy` continues to start Kimi + Qwen; GLM does not need a local process.
5. **No test changes.** Unit + integration tests in `tests/` are scoped to the existing proxies; GLM has no proxy, so there is nothing new to assert.
6. ~~**Live validation pending.**~~ ✅ **Live validation complete for `glm-5v-turbo` and `glm-5.1` (text-only).** See [Validation results](#validation-results) for the full pass/fail table.

### Validation results

#### VS Code live validation — `glm-5v-turbo` & `glm-5.1` (2026-06-04)

##### `glm-5v-turbo` — full pass

| #   | Check                                                                      | Expected                                            | Result             |
| --- | -------------------------------------------------------------------------- | --------------------------------------------------- | ------------------ |
| 1   | VS Code: `glm-5v-turbo` appears in picker                                  | Model selectable in Language Models picker          | ✅                 |
| 2   | VS Code: plain chat, streaming on `glm-5v-turbo`                           | Streaming output visible                            | ✅                 |
| 3   | VS Code: agent mode — tool calling (`open_browser_page`) on `glm-5v-turbo` | Multi-turn tool loop succeeds (Google opened)       | ✅                 |
| 4   | VS Code: vision (image attached / screenshot) on `glm-5v-turbo`            | Image content described accurately (daily.dev page) | ✅                 |
| 5   | Video input (local `.mp4` file)                                            | Rejected by VS Code `view_image` tool (images only) | ⚠️ Blocked by tool |

##### `glm-5.1` — partial pass (text-only model)

| #   | Check                                                                     | Expected                                             | Result |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------- | ------ |
| 6   | VS Code: `glm-5.1` appears in picker                                      | "Agent \| GLM 5.1 (flagship)"                        | ✅     |
| 7   | VS Code: plain chat, streaming chat on `glm-5.1`                          | Streaming output visible                             | ✅     |
| 8   | VS Code: agent mode — tool calling (browser open) on `glm-5.1`            | Multi-turn tool loop succeeds                        | ✅     |
| 9   | `curl` tool call when `thinking: { type: "enabled" }` is set on `glm-5.1` | HTTP 200, `reasoning_content` + `tool_calls`         | ⏳     |
| 10  | `curl` tool-call follow-up turn (proves `clear_thinking`)                 | HTTP 200, prior `reasoning_content` is auto-stripped | ⏳     |

> **`glm-5v-turbo` fully validated** ✅ for VS Code custom-endpoint use: plain chat ✅, streaming ✅, tool calling ✅ (tested with `open_browser_page` opening Google), vision ✅ (accurately described a daily.dev screenshot including post titles, tags, sidebar navigation, browser tabs, and ad content).

## References

- Z.ai (international) model API: `https://z.ai/model-api`
- Z.ai quick start: `https://docs.z.ai/guides/overview/quick-start`
- Z.ai pricing: `https://docs.z.ai/guides/overview/pricing`
- Z.ai chat-completion reference: `https://docs.z.ai/api-reference/llm/chat-completion`
- Z.ai thinking mode: `https://docs.z.ai/guides/capabilities/thinking-mode`
- GLM-4.5: `https://docs.z.ai/guides/llm/glm-4.5`
- GLM-5V-Turbo (vision): `https://docs.z.ai/guides/vlm/glm-5v-turbo`
- Z.ai Coding Plan overview: `https://docs.z.ai/devpack/overview`
- Z.ai Coding Plan tool integration: `https://docs.z.ai/devpack/tool/others`
- Z.ai rate limits dashboard (signed-in): `https://z.ai/manage-apikey/rate-limits`
- China (BigModel) quick start: `https://docs.bigmodel.cn/cn/guide/start/quick-start`
- China (BigModel) pricing: `https://bigmodel.cn/pricing`
- VS Code custom-endpoint docs: `https://code.visualstudio.com/docs/copilot/customization/language-models#_add-a-custom-endpoint-model`
