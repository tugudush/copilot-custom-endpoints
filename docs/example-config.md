# Full example config

Here's a complete, real-world `chatLanguageModels.json` that combines **the `customendpoint` providers from the live `chatLanguageModels.json`**, plus the additional GLM models (`glm-5.3-flash`, `glm-5.3`, `glm-5.2`, `glm-5.1`) that are validated in [docs/models/glm.md](models/glm.md) but not present in every live config. Copy what you need, leave the rest out.

> **⚠️ Measured on VS Code 1.146 (both harnesses):** `modelOptions` is forwarded to the provider; **`requestBody` is silently dropped**. Provider-specific objects such as `thinking`, `reasoning_split`, `enable_thinking`, and `max_tokens` therefore cannot be set from this file — route those models through their proxy, or accept the provider defaults. See [the harness research](research/vscode-1.146-copilot-harness.md).

> **Harness check:** on the Copilot harness, custom-endpoint BYOK is experimental and requires `chat.agentHost.byokModels.enabled`; the Local harness is deprecated (removal planned February 2027) and needs no extra setting. See [README § Setup #0](../README.md#0-know-which-harness-you-are-on).

> **Utility models:** with a GitHub Copilot token, VS Code already uses its built-in utility models, so no extra setup is required. If you use BYOK without Copilot sign-in, set **Chat: Utility Model** and **Chat: Utility Small Model** (or `chat.byokUtilityModelDefault` → _Main Agent Model_). See the [main README](../README.md#4-configure-the-utility-small-model).

> **Note:** The `apiKey` fields are left as empty strings — set them via the **Chat: Manage Language Models** UI (Command Palette → right-click provider group → **Update API Key**). After you set a key via the UI, VS Code replaces the empty string with a `${input:chat.lm.secret.<id>}` secret reference. A key pasted directly into this file is not used: measured on 1.146, the request went out as `Authorization: Bearer` with an empty token and the provider rejected it.

> **After saving, open the Language Models editor once.** On 1.146 a provider added to this file stays invisible in the model picker until **Chat: Manage Language Models** (or the picker's **Add Models…**) has been opened in that window; the editor itself shows the provider immediately. If your provider's `name` matches an installed extension (for example `GLM` with the Z.ai extension installed), the picker merges them and your models hide behind the extension group — give the provider a distinct name.

> **Note:** The live config points Qwen at the local proxy (`:3458`) and MiMo at the local proxy (`:3459`). The proxies manage thinking dynamically, so no thinking-related configuration belongs in this file.

```json
[
  {
    "name": "Qwen",
    "vendor": "customendpoint",
    "apiKey": "",
    "apiType": "chat-completions",
    "models": [
      {
        "id": "qwen3.8-max",
        "name": "Qwen 3.8 Max (vision)",
        "url": "http://127.0.0.1:3458/v1/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 868928,
        "maxOutputTokens": 131072
      }
    ]
  },
  {
    "name": "Kimi",
    "vendor": "customendpoint",
    "apiKey": "",
    "apiType": "chat-completions",
    "models": [
      {
        "id": "kimi-k3.1-pro",
        "name": "Kimi K3.1 Pro (vision)",
        "url": "http://127.0.0.1:3457/v1/chat/completions",
        "modelOptions": { "temperature": 1 },
        "supportsReasoningEffort": ["low", "high", "max"],
        "reasoningEffortFormat": "chat-completions",
        "thinking": true,
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 917504,
        "maxOutputTokens": 131072
      }
    ]
  },
  {
    "name": "MiMo",
    "vendor": "customendpoint",
    "apiKey": "",
    "apiType": "chat-completions",
    "models": [
      {
        "id": "mimo-v2.6-pro",
        "name": "MiMo V2.6 Pro",
        "url": "http://127.0.0.1:3459/v1/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 917504,
        "maxOutputTokens": 131072,
        "modelOptions": { "temperature": 1, "top_p": 0.95 }
      },
      {
        "id": "mimo-v2.6-flash",
        "name": "MiMo V2.6 Flash",
        "url": "http://127.0.0.1:3459/v1/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 917504,
        "maxOutputTokens": 131072,
        "modelOptions": { "temperature": 1, "top_p": 0.95 }
      },
      {
        "id": "mimo-v2.6-pro-ultraspeed",
        "name": "MiMo V2.6 Pro UltraSpeed",
        "url": "http://127.0.0.1:3459/v1/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 917504,
        "maxOutputTokens": 131072,
        "modelOptions": { "temperature": 1, "top_p": 0.95 }
      }
    ]
  },
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
        "maxInputTokens": 868928,
        "maxOutputTokens": 131072,
        "modelOptions": { "temperature": 1, "top_p": 0.95 },
        "supportsReasoningEffort": ["low", "medium", "high", "xhigh", "max"],
        "reasoningEffortFormat": "chat-completions",
        "thinking": true
      }
    ]
  },
  {
    "name": "GLM",
    "vendor": "customendpoint",
    "apiKey": "",
    "apiType": "chat-completions",
    "models": [
      {
        "id": "glm-5.3-flash",
        "name": "GLM 5.3 Flash (multimodal)",
        "url": "https://api.z.ai/api/paas/v4/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 917504,
        "maxOutputTokens": 131072,
        "modelOptions": { "temperature": 1, "top_p": 0.95 },
        "supportsReasoningEffort": ["low", "high", "max"],
        "reasoningEffortFormat": "chat-completions",
        "thinking": true
      },
      {
        "id": "glm-5.3",
        "name": "GLM 5.3 (text)",
        "url": "https://api.z.ai/api/paas/v4/chat/completions",
        "toolCalling": true,
        "vision": false,
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
]
```

## Per-model snippets

> **Context limits follow one rule:** VS Code treats `maxInputTokens + maxOutputTokens` as the model's total context window, and the sum must not exceed the provider's advertised window. Every entry above therefore declares `maxInputTokens = window − maxOutputTokens`:
>
> | Model                      | Window (provider) | `maxOutputTokens` | `maxInputTokens` |
> | -------------------------- | ----------------- | ----------------- | ---------------- |
> | `qwen3.8-max`              | 1,000,000         | 131,072           | 868,928          |
> | `kimi-k3.1-pro`            | 1,048,576         | 131,072           | 917,504          |
> | `mimo-v2.6-*`              | 1,048,576         | 131,072           | 917,504          |
> | `MiniMax-M3.1-Flash`       | 1,000,000         | 131,072           | 868,928          |
> | `glm-5.3`, `glm-5.3-flash` | 1,048,576         | 131,072           | 917,504          |
>
> Trade-off: a smaller `maxInputTokens` makes VS Code compact the conversation slightly earlier than the provider's raw input cap (for example 868,928 instead of DashScope's 991,000-token input maximum), which is the safe side of the constraint. Alternatively set `contextWindow` to the provider's window and let VS Code derive `maxInputTokens = contextWindow − maxOutputTokens`. Sources and derivation: [harness research § 4](research/vscode-1.146-copilot-harness.md#4-utility-models-and-context-limits).

If you only need one provider, jump straight to its setup guide:

- [Kimi K3.1 Pro / K2.6 / K2.7 Code](models/kimi.md)
- [Qwen 3.8 Max](models/qwen.md)
- [Xiaomi MiMo (V2.6 Pro / Flash / Pro UltraSpeed)](models/mimo.md)
- [MiniMax M3.1 Flash](models/minimax.md)
- [GLM (5.3 Flash / 5.3 / 5.2 / 5.1)](models/glm.md)

> **DeepSeek V4.1 Flash 1017** uses the [DeepSeek for Copilot Chat extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot). It appears in `chatLanguageModels.json` as `vendor: "deepseek"` (not as a `customendpoint` provider) and is configured via the extension's settings block.
