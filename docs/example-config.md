# Full example config

Here's a complete, real-world `chatLanguageModels.json` that combines **the `customendpoint` providers from the live `chatLanguageModels.json`**. Copy what you need, leave the rest out.

> **Note:** The `apiKey` fields are left as empty strings — set them via the **Chat: Manage Language Models** UI (Command Palette → right-click provider group → **Update API Key**). After you set a key via the UI, VS Code replaces the empty string with a `${input:chat.lm.secret.<id>}` secret reference.
>
> The live config points Qwen at the local proxy (`:3458`) and MiMo at the local proxy (`:3459`). When using a proxy, align the model `requestBody` overrides with the proxy's behavior: Qwen sends no `requestBody` (the proxy manages `enable_thinking` dynamically); MiMo sends only `temperature` and `top_p` (the proxy injects `thinking: {"type": "disabled"}` on tool turns and leaves it absent on plain chat).

```json
[
  {
    "name": "Qwen",
    "vendor": "customendpoint",
    "apiKey": "",
    "apiType": "chat-completions",
    "models": [
      {
        "id": "qwen3.7-max",
        "name": "Qwen 3.7 Max (text)",
        "url": "http://127.0.0.1:3458/v1/chat/completions",
        "toolCalling": true,
        "vision": false,
        "streaming": true
      },
      {
        "id": "qwen3.7-plus",
        "name": "Qwen 3.7 Plus (vision)",
        "url": "http://127.0.0.1:3458/v1/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true
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
        "id": "kimi-k2.6",
        "name": "Kimi K2.6 (vision)",
        "url": "http://127.0.0.1:3457/v1/chat/completions",
        "requestBody": {
          "temperature": 1
        },
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 262144,
        "maxOutputTokens": 32768
      },
      {
        "id": "kimi-k2.7-code",
        "name": "Kimi K2.7 Code (vision)",
        "url": "http://127.0.0.1:3457/v1/chat/completions",
        "requestBody": {
          "temperature": 1,
          "max_tokens": 4096
        },
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 262144,
        "maxOutputTokens": 4096
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
        "id": "mimo-v2.5-pro",
        "name": "MiMo V2.5 Pro (text)",
        "url": "http://127.0.0.1:3459/v1/chat/completions",
        "toolCalling": true,
        "vision": false,
        "streaming": true,
        "maxInputTokens": 1048576,
        "maxOutputTokens": 131072,
        "requestBody": {
          "temperature": 1,
          "top_p": 0.95
        }
      },
      {
        "id": "mimo-v2.5",
        "name": "MiMo V2.5 (vision)",
        "url": "http://127.0.0.1:3459/v1/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 1048576,
        "maxOutputTokens": 32768,
        "requestBody": {
          "temperature": 1,
          "top_p": 0.95
        }
      },
      {
        "id": "mimo-v2-flash",
        "name": "MiMo V2 Flash (text)",
        "url": "http://127.0.0.1:3459/v1/chat/completions",
        "toolCalling": true,
        "vision": false,
        "streaming": true,
        "maxInputTokens": 262144,
        "maxOutputTokens": 65536,
        "requestBody": {
          "temperature": 0.3,
          "top_p": 0.95
        }
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
  },
  {
    "name": "GLM",
    "vendor": "customendpoint",
    "apiKey": "",
    "apiType": "chat-completions",
    "models": [
      {
        "id": "glm-5.1",
        "name": "GLM 5.1 (text)",
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
        "name": "GLM 5V Turbo (vision)",
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
]
```

## Per-model snippets

If you only need one provider, jump straight to its setup guide:

- [Kimi K2.6 / K2.7 Code](kimi.md)
- [Qwen 3.7 Plus / 3.7 Max](qwen.md)
- [Xiaomi MiMo (V2.5 / V2.5 Pro / V2 Flash)](mimo.md)
- [MiniMax M3](minimax.md)
- [GLM (5.1 / 5V Turbo)](glm.md)

> **DeepSeek V4 Pro / V4 Flash** use the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) extension. They appear in `chatLanguageModels.json` as `vendor: "deepseek"` (not as a `customendpoint` provider) and are configured via the extension's settings block.
