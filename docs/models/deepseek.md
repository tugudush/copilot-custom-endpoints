# DeepSeek V4.1 Flash — VS Code Custom Endpoint Setup Guide

> **TL;DR:** DeepSeek works directly with VS Code's custom-endpoint provider — **no proxy needed**. The API is OpenAI Chat Completions compatible at `https://api.deepseek.com/v1/chat/completions`.
>
> **Wire-validated 2026-11-14** against the live DeepSeek API by replaying the exact request shape VS Code 1.146 sends (the field and role union measured from this repo's own captures — `enable_thinking`, `max_completion_tokens`, `max_tokens`, `messages`, `model`, `n`, `reasoning_effort`, `stream`, `stream_options`, `temperature`, `thinking`, `tool_choice`, `tools`, `top_p`; roles `system` / `user` / `assistant` / `tool`). Every one of those shapes returned HTTP 200, including a streamed 128-tool agent loop with `tool_choice: "auto"` and a replayed `reasoning_content` tool follow-up. The picker/UI pass (SecretStorage key, model-picker refresh) was **not** repeated; see [harness research § 9](../../research/vscode-1.146-copilot-harness.md#9-phase-3-live-provider-validation-2026-11-13) for the setup steps that apply to every provider.
>
> **Billing:** Pay-as-you-go with peak/off-peak rates (see [pricing](#current-api-pricing)). There is also a [DeepSeek for Copilot Chat extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) route, which is the only way to get reasoning visibility and the `activate_*` tool-list preflight — see [the extension route](#alternative-the-deepseek-copilot-chat-extension).

## At a Glance

| Field            | Value                                                                   |
| ---------------- | ----------------------------------------------------------------------- |
| Mode             | **Direct** (no proxy)                                                   |
| Vision           | ✅ Yes on `deepseek-flash`; ❌ on `deepseek-v4-pro` (text-only)         |
| Tool calling     | ✅ Yes — `tool_choice` must be `auto` (or omitted) while thinking is on |
| Context          | 1,048,576                                                               |
| Max output       | 393,216 (API cap); the config below declares 131,072                    |
| Supported config | `modelOptions` sampling + `supportsReasoningEffort` + `thinking: true`  |
| Endpoint         | `https://api.deepseek.com/v1/chat/completions`                          |
| Auth             | `Authorization: Bearer $DEEPSEEK_API_KEY`                               |

### Models

| Model             | Vision | Context   | Max output | Notes                                                                                                                      |
| ----------------- | ------ | --------- | ---------- | -------------------------------------------------------------------------------------------------------------------------- |
| `deepseek-flash`  | ✅     | 1,048,576 | 393,216    | Current Flash build (V4.1-Flash-1017) — always-thinking by default, `reasoning_effort` `low`/`high`/`max` (default `high`) |
| `deepseek-v4-pro` | ❌     | 1,048,576 | 393,216    | Pro tier — **text-only**; accepts the image field but cannot see it, and answers as if no image was sent                   |

> `GET /v1/models` reports `context_window: 1048576`, `max_output_tokens: 393216`, and `effort.supported_levels: ["low","high","max"]` for both models. `deepseek-v4-pro` is not in the default block below; add it in the same shape if you need it.

## Quick Start

1. **Create an API key** at [platform.deepseek.com](https://platform.deepseek.com/api_keys).
2. **Edit `chatLanguageModels.json`** — add the DeepSeek block below.
3. **Set the API key** via Command Palette → **Chat: Manage Language Models** → **DeepSeek API** → **Update API Key**.
4. **Open that editor once** so the provider appears in the picker, then select **DeepSeek V4.1 Flash**.
5. **Re-pick the session target** for each new chat if you are on the Local harness.

## Setup

### 1. VS Code configuration

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

```json
{
  "name": "DeepSeek API",
  "vendor": "customendpoint",
  "apiKey": "${input:deepseekApiKey}",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "deepseek-flash",
      "name": "DeepSeek V4.1 Flash",
      "url": "https://api.deepseek.com/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 917504,
      "maxOutputTokens": 131072,
      "modelOptions": { "temperature": 1, "top_p": 0.95 },
      "supportsReasoningEffort": ["low", "high", "max"],
      "reasoningEffortFormat": "chat-completions",
      "thinking": true
    }
  ]
}
```

> **Name the provider something other than `DeepSeek`.** If the DeepSeek Copilot extension is installed, an identical provider name hides your custom endpoint behind that extension's picker group. `DeepSeek API` avoids the collision.

> **Context budget:** `917504 + 131072 = 1048576`, the DeepSeek window (input and output combined). Only raise `maxInputTokens` by lowering `maxOutputTokens`.

> **`apiKey` must be non-empty** — the file's schema enforces `minLength: 1`, so `"apiKey": ""` shows _String is shorter than the minimum length of 1_. Use the `${input:...}` placeholder shown above and fill it through the UI (below), which rewrites it to a `${input:chat.lm.secret.<id>}` keychain reference.

### 2. API Key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **DeepSeek API** group → **Update API Key**.
4. Paste your DeepSeek API key.

## Notes

- **Model IDs are `deepseek-flash` and `deepseek-v4-pro` only.** Anything else is rejected with an explicit list: `The supported API model names are deepseek-flash, deepseek-v4-pro, but you passed …`. The human-readable build label `DeepSeek-V4.1-Flash-1017` is **not** a valid model ID.
- **`tool_choice` must stay `auto` while thinking is on.** `required` and named-tool `tool_choice` both return **HTTP 400 `Thinking mode does not support this tool_choice`**. VS Code sends `auto` (measured in this repo's captures), so the default works; the constraint only bites if you force a tool choice. Disabling thinking (`thinking: {"type":"disabled"}` or `reasoning_effort: "none"`) makes `required` and named tools return 200.
- **Thinking is on by default and can be turned off.** `GET /v1/models` advertises `low`/`high`/`max`; in practice `reasoning_effort` also accepts `medium`, `minimal`, and `xhigh` (clamped, not advertised), while `none` genuinely disables thinking and returns zero reasoning tokens. `thinking: {"type": "disabled"}` does the same. This differs from Kimi K2.7 (rejects `disabled`) and MiniMax M3.1 Flash (rejects `disabled`).
- **`reasoning_effort` measurably changes depth.** On a multi-step change-counting task, three runs each produced ≈1,463 reasoning tokens at `low`, ≈1,644 at `high`, and ≈3,253 at `max`. `low` also answered **wrong** (4 instead of 24) while `high`/`max` were correct — prefer `high` or `max` for coding and agent work.
- **Sampling is flexible but `n` is not.** `temperature` accepted `0`, `1`, and `1.5` with no server-side cap; `top_p` must be in `(0, 1.0]` (`0` and `1.1` both 400); `n` must be exactly `1` (`n: 2` and `n: 0` both 400). VS Code sends `n: 1`, so this only matters for hand-built requests. `presence_penalty` / `frequency_penalty` are accepted.
- **Output caps:** `max_tokens` valid range is `[1, 393216]`; `max_completion_tokens` is also accepted, and sending both together is fine. On 1.146 `maxOutputTokens` reaches the wire as `max_completion_tokens` only for `thinking: true` entries — which this block is.
- **Reasoning replay is optional, not required.** A tool-loop follow-up returned 200 both with and without `reasoning_content` on the assistant tool-call message (unlike Kimi K2.7, which rejects some shapes). Replaying it preserves reasoning continuity.
- **Streaming includes everything VS Code needs:** `reasoning_content` deltas, `tool_calls` deltas, `finish_reason`, and a usage chunk when `stream_options.include_usage` is set.
- **Vision accepts data URLs only in practice.** A base64 `data:image/png;…` URL was read correctly on `deepseek-flash` ("Red" for a solid red image); a public HTTPS image URL failed with `Failed to download image from …`. `deepseek-v4-pro` accepts the image field but is text-only and answers as if no image was sent.
- **Only four message roles exist:** `system`, `user`, `assistant`, `tool`. A `developer` role returns **HTTP 422** (`unknown variant 'developer'`). VS Code sends exactly the four supported roles, so this is a constraint for non-VS Code clients, not for the picker path.
- **Unknown top-level fields are ignored, not rejected** — the API is lenient about extra keys, which is why a dropped `requestBody` never breaks the request.
- **No proxy is needed for thinking control, including in tool loops.** The [Qwen proxy](../../proxy/qwen-proxy.mjs) exists because DashScope's `enable_thinking` cannot be sent from `chatLanguageModels.json` on 1.146 (`requestBody` is dropped) and thinking must be suppressed once tools appear. DeepSeek has neither problem: it accepts thinking during tool loops (measured 2026-11-14 — a 5-turn read/edit agent loop returned HTTP 200 on every turn with thinking on, and DeepSeek spent 0 reasoning tokens on three of those turns anyway), and the effort level already reaches the wire through `supportsReasoningEffort` + `reasoningEffortFormat: "chat-completions"`. Only _automatic_ per-turn switching would require a proxy, and the measurements show it buys nothing here.
- **Context caching is automatic** — `usage.prompt_cache_hit_tokens` / `prompt_cache_miss_tokens` and `usage.prompt_tokens_details.cached_tokens` report it.

## Current build

The current API model ID and build are:

| API model        | Current version          | Update                              | Context | Modality                   | Parameters                                                      |
| ---------------- | ------------------------ | ----------------------------------- | ------- | -------------------------- | --------------------------------------------------------------- |
| `deepseek-flash` | DeepSeek-V4.1-Flash-1017 | October 17, 2026; current API build | 1M      | Text + image in / text out | Causal Encoder-Decoder sparse MoE; 8B input / 16B output active |

The [DeepSeek API pricing page](https://api-docs.deepseek.com/quick_start/pricing) identifies `deepseek-flash` as the current Flash model and reports its model version as **DeepSeek-V4.1-Flash-1017**. Do not add the version suffix to the API request or the extension override.

DeepSeek's [October 17 release note](https://api-docs.deepseek.com/news/news261017) describes 1017 as a Pareto improvement over the September 10 build: stronger benchmarks, faster task completion, and shorter outputs. The model supports both non-thinking and thinking (default) modes, keeps the 1M context window and vision input, and publishes open weights on [Hugging Face](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017) (552B total / 16B active parameters, MIT license).

## Alternative: the DeepSeek Copilot Chat extension

DeepSeek V4.1 Flash is also available through the extension-only provider. It appears in `chatLanguageModels.json` as `vendor: "deepseek"` (not `customendpoint`) and is configured through the extension's own settings block. The sections below document that route; [benchmarks](#benchmarks) and [pricing](#current-api-pricing) apply to both routes.

### Model ID overrides

The extension's `deepseek-copilot.modelIdOverrides` setting changes the upstream API model ID while keeping the normal DeepSeek entry in the Copilot model picker. The current official DeepSeek Chat Completions API accepts `deepseek-flash`, so map the extension's logical Flash entry to that canonical ID.

> **Warning:** Do **not** use the human-readable version label as a model ID. `DeepSeek-V4.1-Flash-1017` is a version string, not a valid `model` field; use `deepseek-flash`. Sending a version-suffixed ID to `https://api.deepseek.com` returns **HTTP 400** — measured 2026-11-14: `The supported API model names are deepseek-flash, deepseek-v4-pro, but you passed DeepSeek-V4.1-Flash-1017.`

Only add an override when the configured `deepseek-copilot.baseUrl` expects a different model name (e.g., a third-party proxy). The left-hand key is the extension's logical model key; it is not an arbitrary picker label. The right-hand value is sent verbatim as the provider's `model` field.

Select the **DeepSeek V4.1 Flash** entry in Copilot Chat after reloading the window. The picker may still display the family name without the build suffix; that is expected. The override is not a model registration or a way to add a new picker entry.

## Benchmarks

The current Artificial Analysis v4.3.2 composite for **V4.1 Flash 1017** is **45**, up from **39.5** for the superseded September 10 build (whose AA page is now marked deprecated). AA measures 1017 at 216 tokens/s and **$0.26 per Intelligence Index task**, and it generated **210M output tokens** to run the index versus a 140M median (the September build used 250M), so it remains fast but very verbose. Current Coding and Agentic composites were not exposed in the checked metadata. DeepSeek's [release note](https://api-docs.deepseek.com/news/news261017) reports stronger benchmark performance, faster task completion, and shorter outputs than the September build; those vendor results are not directly comparable to the AA composite.

Sources: [DeepSeek pricing and model page](https://api-docs.deepseek.com/quick_start/pricing), [DeepSeek 1017 release note](https://api-docs.deepseek.com/news/news261017), [1017 benchmark snapshot](https://openrouter.ai/deepseek/deepseek-v4.1-flash-1017), and [1017 AA page](https://artificialanalysis.ai/models/deepseek-v4-1-flash-1017).

## Current API pricing

DeepSeek switched to peak/off-peak rates at **16:00 UTC on August 16, 2026**. Prices below are USD per 1M tokens. Peak hours are **01:00-04:00 and 06:00-10:00 UTC**; off-peak rates are half the peak rates.

| API model        | Cache hit                     | Cache miss                  | Output                      |
| ---------------- | ----------------------------- | --------------------------- | --------------------------- |
| `deepseek-flash` | $0.003 off-peak / $0.006 peak | $0.15 off-peak / $0.30 peak | $0.60 off-peak / $1.20 peak |

The 1017 build keeps these rates unchanged. See the [official Models & Pricing page](https://api-docs.deepseek.com/quick_start/pricing) for the live rates and concurrency limits.

## Tool-list stabilization — extension route (`experimental.stabilizeToolList`)

`deepseek-copilot.experimental.stabilizeToolList` (default `false`) gates an `activate_*` tool **preflight pass** that runs only on tool-calling (agent-mode / MCP) requests. Verified against extension `0.6.2` source: the flag is read in `out/provider/index.js` and only branches inside `out/provider/tools/flow.js` (`if (!stabilizeToolList) { … return }`).

- **When on**, the extension runs a tool-list stabilization / `activate_*` preflight that keeps the offered tool schema set stable across turns. This targets **HTTP 400 errors during agent/tool loops**, where a changing tool list confuses the model.
- **When off**, the preflight pass is skipped entirely.
- **Plain chat (no tools) never triggers the flag** — it is inert and has no effect (and no cost) on non-tool requests. It neither causes nor fixes plain-chat 400s such as the invalid model-ID case above.

Recommendation: leave it `true` if you use **agent mode or MCP tools** with DeepSeek V4.1 Flash; it is harmless to keep for plain-chat-only use, and safe to remove if you never invoke tools.

## Troubleshooting

### Custom endpoint

1. **Model missing from the picker** — open **Chat: Manage Language Models** once in the window, then re-check. If the DeepSeek extension is installed, make sure your provider block is not also named `DeepSeek`; rename it (`DeepSeek API`) to escape the extension's picker group.
2. **401 / 403** — set the key through **Chat: Manage Language Models → Update API Key**. A literal `apiKey` in `chatLanguageModels.json` is not sent; VS Code sends an empty `Bearer` token.
3. **400 listing the supported model names** — you used a version label such as `DeepSeek-V4.1-Flash-1017`. Use `deepseek-flash` or `deepseek-v4-pro`.
4. **400 `Thinking mode does not support this tool_choice`** — something is forcing `required` or a named tool. Keep `tool_choice` at `auto`, or disable thinking.
5. **`top_p` / `n` rejected** — `top_p` must be in `(0, 1.0]` and `n` must be exactly `1`.
6. **Image ignored** — use `deepseek-flash` (not the text-only `deepseek-v4-pro`) and attach a base64 data URL; public image URLs fail with `Failed to download image from …`.
7. **422 `unknown variant 'developer'`** — a non-VS Code client sent a `developer` role. Only `system`, `user`, `assistant`, and `tool` are accepted.

### Extension route

1. Confirm the extension is installed and update it if the setting is not recognized. The setting is owned by `Vizards.deepseek-v4-for-copilot`.
2. Use the exact setting name and point the Flash entry at `deepseek-flash`:
   `deepseek-copilot.modelIdOverrides`.
3. Reload VS Code after changing the setting (`Developer: Reload Window`).
4. Verify the extension's `deepseek-copilot.baseUrl` points at the compatible provider or proxy. An override changes only the model ID; it does not change the endpoint, authentication, request format, or model capabilities.
5. For HTTP 400 errors during agent mode or MCP/tool use, enable the extension's tool-list compatibility option:
   `deepseek-copilot.experimental.stabilizeToolList: true` (see **Tool-list stabilization — extension route** above). This does **not** help plain-chat 400s — those are usually an invalid `model` ID (see the override warning above).
6. Enable the extension's diagnostic mode (`deepseek-copilot.debugMode: "verbose"`) or inspect its request dump to confirm the outbound request's `model` field. The canonical current Flash value should read `"model":"deepseek-flash"`. If a 400 persists with a valid model ID, the remaining cause is request-shape compatibility or authorization — capture the full request body via the dump and compare against the [Chat Completions schema](https://api-docs.deepseek.com/api/create-chat-completion).

The extension's published settings documentation is authoritative for these settings. Its default model-ID map may change between releases, so do not copy an old default blindly.
