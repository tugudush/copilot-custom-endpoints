# DeepSeek V4.1 Flash for Copilot Chat

DeepSeek V4.1 Flash is provided by the [DeepSeek for Copilot Chat extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot). It does not use this repository's `chatLanguageModels.json` custom-endpoint configuration.

## Current build

The current API model ID and build are:

| API model        | Current version          | Update                              | Context | Modality                   | Parameters                                                      |
| ---------------- | ------------------------ | ----------------------------------- | ------- | -------------------------- | --------------------------------------------------------------- |
| `deepseek-flash` | DeepSeek-V4.1-Flash-1017 | October 17, 2026; current API build | 1M      | Text + image in / text out | Causal Encoder-Decoder sparse MoE; 8B input / 16B output active |

The [DeepSeek API pricing page](https://api-docs.deepseek.com/quick_start/pricing) identifies `deepseek-flash` as the current Flash model and reports its model version as **DeepSeek-V4.1-Flash-1017**. Do not add the version suffix to the API request or the extension override.

DeepSeek's [October 17 release note](https://api-docs.deepseek.com/news/news261017) describes 1017 as a Pareto improvement over the September 10 build: stronger benchmarks, faster task completion, and shorter outputs. The model supports both non-thinking and thinking (default) modes, keeps the 1M context window and vision input, and publishes open weights on [Hugging Face](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017) (552B total / 16B active parameters, MIT license).

## Model ID overrides

The extension's `deepseek-copilot.modelIdOverrides` setting changes the upstream API model ID while keeping the normal DeepSeek entry in the Copilot model picker. The current official DeepSeek Chat Completions API accepts `deepseek-flash`, so map the extension's logical Flash entry to that canonical ID.

> **Warning:** Do **not** use the human-readable version label as a model ID. `DeepSeek-V4.1-Flash-1017` is a version string, not a valid `model` field; use `deepseek-flash`. Sending a version-suffixed ID to `https://api.deepseek.com` can return **HTTP 400 "Invalid request body format"**.

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

## Tool-list stabilization (`experimental.stabilizeToolList`)

`deepseek-copilot.experimental.stabilizeToolList` (default `false`) gates an `activate_*` tool **preflight pass** that runs only on tool-calling (agent-mode / MCP) requests. Verified against extension `0.6.2` source: the flag is read in `out/provider/index.js` and only branches inside `out/provider/tools/flow.js` (`if (!stabilizeToolList) { … return }`).

- **When on**, the extension runs a tool-list stabilization / `activate_*` preflight that keeps the offered tool schema set stable across turns. This targets **HTTP 400 errors during agent/tool loops**, where a changing tool list confuses the model.
- **When off**, the preflight pass is skipped entirely.
- **Plain chat (no tools) never triggers the flag** — it is inert and has no effect (and no cost) on non-tool requests. It neither causes nor fixes plain-chat 400s such as the invalid model-ID case above.

Recommendation: leave it `true` if you use **agent mode or MCP tools** with DeepSeek V4.1 Flash; it is harmless to keep for plain-chat-only use, and safe to remove if you never invoke tools.

## Troubleshooting

1. Confirm the extension is installed and update it if the setting is not recognized. The setting is owned by `Vizards.deepseek-v4-for-copilot`.
2. Use the exact setting name and point the Flash entry at `deepseek-flash`:
   `deepseek-copilot.modelIdOverrides`.
3. Reload VS Code after changing the setting (`Developer: Reload Window`).
4. Verify the extension's `deepseek-copilot.baseUrl` points at the compatible provider or proxy. An override changes only the model ID; it does not change the endpoint, authentication, request format, or model capabilities.
5. For HTTP 400 errors during agent mode or MCP/tool use, enable the extension's tool-list compatibility option:
   `deepseek-copilot.experimental.stabilizeToolList: true` (see [Tool-list stabilization](#tool-list-stabilizationexperimentalstabilizetoollist)). This does **not** help plain-chat 400s — those are usually an invalid `model` ID (see the override warning above).
6. Enable the extension's diagnostic mode (`deepseek-copilot.debugMode: "verbose"`) or inspect its request dump to confirm the outbound request's `model` field. The canonical current Flash value should read `"model":"deepseek-flash"`. If a 400 persists with a valid model ID, the remaining cause is request-shape compatibility or authorization — capture the full request body via the dump and compare against the [Chat Completions schema](https://api-docs.deepseek.com/api/create-chat-completion).

The extension's published settings documentation is authoritative for this setting. Its default model-ID map may change between releases, so do not copy an old default blindly.
