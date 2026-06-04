# Full example config

Here's a complete, real-world `chatLanguageModels.json` that combines **all the providers documented in this repo**. Copy what you need, leave the rest out.

> **Note:** The `apiKey` fields are left as empty strings — set them via the **Chat: Manage Language Models** UI (Command Palette → right-click provider group → **Update API Key**). After you set a key via the UI, VS Code replaces the empty string with a `${input:chat.lm.secret.<id>}` secret reference.

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
        "name": "Qwen 3.7 Max",
        "url": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
        "toolCalling": true,
        "vision": false,
        "streaming": true,
        "requestBody": {
          "enable_thinking": false
        }
      },
      {
        "id": "qwen3.6-plus",
        "name": "Qwen 3.6 Plus",
        "url": "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "requestBody": {
          "enable_thinking": false
        }
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
        "name": "Kimi K2.6",
        "url": "http://127.0.0.1:3457/v1/chat/completions",
        "requestBody": {
          "temperature": 1
        },
        "toolCalling": true,
        "vision": true,
        "streaming": true,
        "maxInputTokens": 262144,
        "maxOutputTokens": 32768
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
        "name": "MiMo V2.5 Pro",
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
        "name": "MiMo V2.5",
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
        "name": "MiMo V2 Flash",
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
        "name": "MiniMax M3",
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
        "id": "glm-4.7-flash",
        "name": "GLM 4.7 Flash (free)",
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
]
```

## Per-model snippets

If you only need one provider, jump straight to its setup guide:

- [Kimi K2.6](kimi.md)
- [Qwen 3.6 Plus / 3.7 Max](qwen.md)
- [Xiaomi MiMo (V2.5 / V2.5 Pro / V2 Flash)](mimo.md)
- [MiniMax M3](minimax.md)
- [GLM (5.1 / 4.7 Flash / 5V Turbo)](glm.md)

> **DeepSeek V4 Pro / V4 Flash** use the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) extension — they don't appear in `chatLanguageModels.json`.
