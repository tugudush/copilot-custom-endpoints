# DeepSeek V4 for Copilot Chat

DeepSeek V4 Pro and V4.1 Flash are provided by the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) extension. They do not use this repository's `chatLanguageModels.json` custom-endpoint configuration.

## Current builds

The current API model IDs and builds are:

| API model         | Current version      | Update                                | Context | Modality                   | Parameters                                                      |
| ----------------- | -------------------- | ------------------------------------- | ------- | -------------------------- | --------------------------------------------------------------- |
| `deepseek-flash`  | DeepSeek-V4.1-Flash  | September 10, 2026; current API build | 1M      | Text + image in / text out | Causal Encoder-Decoder sparse MoE; 8B input / 16B output active |
| `deepseek-v4-pro` | DeepSeek-V4-Pro-0813 | August 13, 2026; GA release           | 1M      | Text in / text out         | 1.6T total / 49B active                                         |

The [DeepSeek API pricing page](https://api-docs.deepseek.com/quick_start/pricing) identifies `deepseek-flash` as the current Flash model and says the legacy `deepseek-v4-flash` names remain accepted but are retired. Do not add the version suffix to the API request or the extension override.

## Model ID overrides

The extension's `deepseek-copilot.modelIdOverrides` setting changes the upstream API model IDs while keeping the normal DeepSeek entries in the Copilot model picker. The current official DeepSeek Chat Completions API accepts `deepseek-flash` and `deepseek-v4-pro`, so map the extension's logical Flash entry to the canonical current ID:

```jsonc
{
  "deepseek-copilot.modelIdOverrides": {
    "deepseek-v4-flash": "deepseek-flash",
    "deepseek-v4-pro": "deepseek-v4-pro"
  }
}
```

> **Warning:** Do **not** use the human-readable version labels as model IDs. `DeepSeek-V4.1-Flash` and `DeepSeek-V4-Pro-0813` are version strings, not valid `model` fields. Use `deepseek-flash` for current Flash requests and `deepseek-v4-pro` for Pro. Sending a version-suffixed ID to `https://api.deepseek.com` can return **HTTP 400 "Invalid request body format"**.

Only add an override when the configured `deepseek-copilot.baseUrl` expects a different model name (e.g., a third-party proxy). The left-hand keys are the extension's logical model keys; they are not arbitrary picker labels. The right-hand values are sent verbatim as the provider's `model` field.

For Flash or Pro, select the corresponding **DeepSeek V4** entry in Copilot Chat after reloading the window. The picker may still display the family name without the build suffix; that is expected. The override is not a model registration or a way to add a new picker entry.

## Updated benchmarks

DeepSeek's official August updates report the following agent-focused results for the retired 0731 Flash release and the GA Pro release:

- **Historical Flash 0731:** Terminal-Bench 2.1 **82.7**, NL2Repo **54.2**, Cybergym **76.7**, DeepSWE **54.4**, Toolathlon Verified **70.3**, Agents' Last Exam **25.2**, AutomationBench (Public) **25.1**, DSBench-FullStack **68.7**, and DSBench-Hard **59.6**.
- **Pro 0813:** HLE without/with tools **42.7/60.0**, Terminal-Bench 2.1 **87.9**, NL2Repo **61.5**, Cybergym **83.3**, DeepSWE **62.7**, Toolathlon Verified **74.1**, Agents' Last Exam **25.7**, AutomationBench (Public) **31.8**, DSBench-FullStack **71.1**, and DSBench-Hard **67.2**.

The current OpenRouter metadata reports **V4.1 Flash 39.5 AA Intelligence** and **Pro 36.3 AA Intelligence**. Current Flash Coding and Agentic composites were not exposed in the checked metadata. The older 0731 snapshot reported **51.8 AA Intelligence / 69.1 Coding / 48.4 Agentic**, while Pro's current metadata reports **36.3 AA Intelligence / 68.8 Coding / 49.6 Agentic**. AA values are independent composite scores; DeepSeek's agent results above are vendor-reported and should not be treated as the same metric.

Sources: [DeepSeek pricing and model page](https://api-docs.deepseek.com/quick_start/pricing), [Flash benchmark snapshot](https://openrouter.ai/deepseek/deepseek-v4.1-flash), [Pro benchmark snapshot](https://openrouter.ai/deepseek/deepseek-v4-pro-0813), [Flash AA page](https://artificialanalysis.ai/models/deepseek-v4-1-flash), and [Pro AA page](https://artificialanalysis.ai/models/deepseek-v4-pro).

## Current API pricing

DeepSeek switched V4 pricing to peak/off-peak rates at **16:00 UTC on August 16, 2026**. Prices below are USD per 1M tokens. Peak hours are **01:00-04:00 and 06:00-10:00 UTC**; off-peak rates are half the peak rates.

| API model         | Cache hit                     | Cache miss                  | Output                      |
| ----------------- | ----------------------------- | --------------------------- | --------------------------- |
| `deepseek-flash`  | $0.003 off-peak / $0.006 peak | $0.15 off-peak / $0.30 peak | $0.60 off-peak / $1.20 peak |
| `deepseek-v4-pro` | $0.022 off-peak / $0.044 peak | $0.66 off-peak / $1.32 peak | $1.98 off-peak / $3.96 peak |

The legacy `deepseek-v4-flash` and `deepseek-v4-flash-vision-exp` names remain accepted but are retired aliases for V4.1 Flash. See the [official Models & Pricing page](https://api-docs.deepseek.com/quick_start/pricing) for the live rates and concurrency limits.

## Tool-list stabilization (`experimental.stabilizeToolList`)

`deepseek-copilot.experimental.stabilizeToolList` (default `false`) gates an `activate_*` tool **preflight pass** that runs only on tool-calling (agent-mode / MCP) requests. Verified against extension `0.6.2` source: the flag is read in `out/provider/index.js` and only branches inside `out/provider/tools/flow.js` (`if (!stabilizeToolList) { … return }`).

- **When on**, the extension runs a tool-list stabilization / `activate_*` preflight that keeps the offered tool schema set stable across turns. This targets **HTTP 400 errors during agent/tool loops**, where a changing tool list confuses the model.
- **When off**, the preflight pass is skipped entirely.
- **Plain chat (no tools) never triggers the flag** — it is inert and has no effect (and no cost) on non-tool requests. It neither causes nor fixes plain-chat 400s such as the invalid model-ID case above.

Recommendation: leave it `true` if you use **agent mode or MCP tools** with DeepSeek V4; it is harmless to keep for plain-chat-only use, and safe to remove if you never invoke tools.

## Troubleshooting

1. Confirm the extension is installed and update it if the setting is not recognized. The setting is owned by `Vizards.deepseek-v4-for-copilot`.
2. Use the exact setting name and logical key:
   `deepseek-copilot.modelIdOverrides` → `deepseek-flash`.
3. Reload VS Code after changing the setting (`Developer: Reload Window`).
4. Verify the extension's `deepseek-copilot.baseUrl` points at the compatible provider or proxy. An override changes only the model ID; it does not change the endpoint, authentication, request format, or model capabilities.
5. For HTTP 400 errors during agent mode or MCP/tool use, enable the extension's tool-list compatibility option:
   `deepseek-copilot.experimental.stabilizeToolList: true` (see [Tool-list stabilization](#tool-list-stabilizationexperimentalstabilizetoollist)). This does **not** help plain-chat 400s — those are usually an invalid `model` ID (see the override warning above).
6. Enable the extension's diagnostic mode (`deepseek-copilot.debugMode: "verbose"`) or inspect its request dump to confirm the outbound request's `model` field. The canonical current Flash value should read `"model":"deepseek-flash"`. If a 400 persists with a valid model ID, the remaining cause is request-shape compatibility or authorization — capture the full request body via the dump and compare against the [Chat Completions schema](https://api-docs.deepseek.com/api/create-chat-completion).

The extension's published settings documentation is authoritative for this setting. Its default model-ID map may change between releases, so do not copy an old default blindly.
