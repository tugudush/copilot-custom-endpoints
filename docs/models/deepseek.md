# DeepSeek V4 for Copilot Chat

DeepSeek V4 Pro and Flash are provided by the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) extension. They do not use this repository's `chatLanguageModels.json` custom-endpoint configuration.

## Model ID overrides

The extension's `deepseek-copilot.modelIdOverrides` setting changes the upstream API model IDs while keeping the normal DeepSeek entries in the Copilot model picker. The official DeepSeek Chat Completions API only accepts two `model` values — `deepseek-v4-flash` and `deepseek-v4-pro` — so the correct map for the official endpoint is just the defaults:

```jsonc
{
  "deepseek-copilot.modelIdOverrides": {
    "deepseek-v4-flash": "deepseek-v4-flash",
    "deepseek-v4-pro": "deepseek-v4-pro"
  }
}
```

> **Warning:** Do **not** use the human-readable version label as a model ID. `DeepSeek-V4-Flash-0731` is only the version string shown on the pricing page, not a valid `model` field. Sending `deepseek-v4-flash-0731` to the official `https://api.deepseek.com` endpoint returns **HTTP 400 "Invalid request body format"**. The official endpoint already serves the latest (0731) build under the plain `deepseek-v4-flash` ID, so no override is needed there.

Only add an override when the configured `deepseek-copilot.baseUrl` expects a different model name (e.g., a third-party proxy). The left-hand keys are the extension's logical model keys; they are not arbitrary picker labels. The right-hand values are sent verbatim as the provider's `model` field.

For Flash, select **DeepSeek V4 Flash** in Copilot Chat after reloading the window. The picker may still display “DeepSeek V4 Flash”; that is expected. The override is not a model registration or a way to add a new picker entry.

## Tool-list stabilization (`experimental.stabilizeToolList`)

`deepseek-copilot.experimental.stabilizeToolList` (default `false`) gates an `activate_*` tool **preflight pass** that runs only on tool-calling (agent-mode / MCP) requests. Verified against extension `0.6.2` source: the flag is read in `out/provider/index.js` and only branches inside `out/provider/tools/flow.js` (`if (!stabilizeToolList) { … return }`).

- **When on**, the extension runs a tool-list stabilization / `activate_*` preflight that keeps the offered tool schema set stable across turns. This targets **HTTP 400 errors during agent/tool loops**, where a changing tool list confuses the model.
- **When off**, the preflight pass is skipped entirely.
- **Plain chat (no tools) never triggers the flag** — it is inert and has no effect (and no cost) on non-tool requests. It neither causes nor fixes plain-chat 400s such as the invalid model-ID case above.

Recommendation: leave it `true` if you use **agent mode or MCP tools** with DeepSeek V4; it is harmless to keep for plain-chat-only use, and safe to remove if you never invoke tools.

## Troubleshooting

1. Confirm the extension is installed and update it if the setting is not recognized. The setting is owned by `Vizards.deepseek-v4-for-copilot`.
2. Use the exact setting name and logical key:
   `deepseek-copilot.modelIdOverrides` → `deepseek-v4-flash`.
3. Reload VS Code after changing the setting (`Developer: Reload Window`).
4. Verify the extension's `deepseek-copilot.baseUrl` points at the compatible provider or proxy. An override changes only the model ID; it does not change the endpoint, authentication, request format, or model capabilities.
5. For HTTP 400 errors during agent mode or MCP/tool use, enable the extension's tool-list compatibility option:
   `deepseek-copilot.experimental.stabilizeToolList: true` (see [Tool-list stabilization](#tool-list-stabilizationexperimentalstabilizetoollist)). This does **not** help plain-chat 400s — those are usually an invalid `model` ID (see the override warning above).
6. Enable the extension's diagnostic mode (`deepseek-copilot.debugMode: "verbose"`) or inspect its request dump to confirm the outbound request's `model` field. If the override is removed, it should read `"model":"deepseek-v4-flash"`. If a 400 persists with a valid model ID, the remaining cause is request-shape compatibility or authorization — capture the full request body via the dump and compare against the [Chat Completions schema](https://api-docs.deepseek.com/api/create-chat-completion).

The extension's published settings documentation is authoritative for this setting. Its default model-ID map may change between releases, so do not copy an old default blindly.
