# Full example config

Here's a complete, real-world `chatLanguageModels.json` that combines **all the providers documented in this repo**. Copy what you need, leave the rest out.

> **Note:** The `apiKey` fields are left as empty strings — set them via the **Chat: Manage Language Models** UI (Command Palette → right-click provider group → **Update API Key**). After you set a key via the UI, VS Code replaces the empty string with a `${input:chat.lm.secret.<id>}` secret reference.
>
> This combined config reflects the same provider blocks as the live `chatLanguageModels.json`. Qwen is pointed at the local proxy; remove `requestBody.enable_thinking` when using the proxy.

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
        "url": "https://api.xiaomimimo.com/v1/chat/completions",
        "toolCalling": true,
        "vision": false,
        "streaming": true,
        "maxInputTokens": 1048576,
        "maxOutputTokens": 131072,
        "requestBody": {
          "thinking": { "type": "disabled" },
          "temperature": 1,
          "top_p": 0.95
        }
      },
      {
        "id": "mimo-v2.5",
        "name": "MiMo V2.5 (vision)",
        "url": "https://api.xiaomimimo.com/v1/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 1048576,
        "maxOutputTokens": 32768,
        "requestBody": {
          "thinking": { "type": "disabled" },
          "temperature": 1,
          "top_p": 0.95
        }
      },
      {
        "id": "mimo-v2-flash",
        "name": "MiMo V2 Flash (text)",
        "url": "https://api.xiaomimimo.com/v1/chat/completions",
        "toolCalling": true,
        "vision": false,
        "streaming": true,
        "maxInputTokens": 262144,
        "maxOutputTokens": 65536,
        "requestBody": {
          "thinking": { "type": "disabled" },
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

> **DeepSeek V4 Pro / V4 Flash** use the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) extension — they don't appear in `chatLanguageModels.json`.
