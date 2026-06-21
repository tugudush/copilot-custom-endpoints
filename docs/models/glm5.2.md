# GLM 5.2 (Z.ai / Zhipu AI) — VS Code Custom Endpoint Setup Guide

> **TL;DR:** GLM 5.2 is Z.ai's new flagship model, newly released and fully available to integrate directly with VS Code's custom-endpoint provider — **no proxy needed**. Supporting a massive **Solid 1M lossless context window**, the model is deeply optimized via reinforcement learning for long-horizon agentic coding, project-level engineering, and complex multi-turn reasoning.

## At a Glance

| Field                  | Value                                                   |
| ---------------------- | ------------------------------------------------------- |
| Mode                   | **Direct** (no proxy)                                   |
| Vision                 | ✅ Yes (via native multimodal capabilities)             |
| Tool calling           | ✅ Yes (multimodal tool calling)                        |
| Context (flagship)     | 1M (`glm-5.2` Solid Lossless Context)                   |
| Max output             | 131072 tokens                                           |
| Required `requestBody` | `thinking: { type: "enabled" }` (recommended)           |
| Endpoint (intl)        | `https://api.z.ai/api/paas/v4/chat/completions`         |
| Endpoint (China)       | `https://open.bigmodel.cn/api/paas/v4/chat/completions` |
| Auth                   | `Authorization: Bearer $ZAI_API_KEY`                    |

### Models at a glance

| Model     | Vision | Context | Max output | Thinking  | Role                                                                                        |
| --------- | ------ | ------- | ---------- | --------- | ------------------------------------------------------------------------------------------- |
| `glm-5.2` | ✅     | 1M      | 131072     | `enabled` | New Flagship — "Opus-level" long-context engineering, agentic coding, and complex reasoning |

## Quick Start

1. **Verify your account** at [z.ai/model-api](https://z.ai/model-api) or [open.bigmodel.cn](https://open.bigmodel.cn) to ensure the flagship models are active under your plan.
2. **Generate an API key** on the API Keys page of the platform.
3. **Edit `chatLanguageModels.json`** — add the GLM 5.2 block from [Setup](#setup) below.
4. **Set the API key** via Command Palette → **Chat: Manage Language Models** → right-click **GLM** (or your GLM 5.2 entry) → **Update API Key**.
5. **Restart VS Code** and select **GLM 5.2 (1M)** from the model picker.

## Setup

### 1. VS Code configuration

Modify your settings in:

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

Add the following model configuration:

```json
{
  "name": "GLM 5.2",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "glm-5.2",
      "name": "GLM 5.2 (1M Context)",
      "url": "https://api.z.ai/api/paas/v4/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "enabled" },
        "temperature": 1.0,
        "top_p": 0.95
      }
    }
  ]
}
```

> **Leave `apiKey` as `""`** — setting it through the Language Models UI will securely store it in your OS keychain.
> If you signed up on `bigmodel.cn` (CNY billing), replace the `url` with `https://open.bigmodel.cn/api/paas/v4/chat/completions`.

## Parameter & Integration Reference

### Sampling Parameters

As detailed in the official GLM 5.2 migration guides, the parameter defaults are:

| Parameter     | Default / Recommended | Range         | Notes                                                                                           |
| ------------- | --------------------- | ------------- | ----------------------------------------------------------------------------------------------- |
| `temperature` | `1.0`                 | `[0.0, 1.0]`  | Capped at `1.0` server-side. Sending any value `> 1.0` will immediately reject with a 400.      |
| `top_p`       | `0.95`                | `[0.01, 1.0]` | It is recommended to adjust only _one_ of `temperature` or `top_p` when customizing parameters. |

### Deep Thinking & Multi-turn Session Stability

Z.ai provides a model-specific parameter `thinking` which controls deep chain-of-thought:

- `"thinking": { "type": "enabled" }` force-enables deep chain-of-thought, returning reasoning contents in a structured `choices[].message.reasoning_content` field.
- **Why GLM 5.2 is uniquely stable in VS Code:** By default, Z.ai acts with `thinking.clear_thinking: true` server-side. This option automatically strips prior turns' `reasoning_content` from the prompt payload before it reaches the model in a multi-turn tool calling sequence. Because VS Code's custom-endpoint client _does not_ preserve and send assistant `reasoning_content` back in subsequent tool turns, this server-side behavior prevents the `400 Bad Request` failures commonly experienced with models like MiMo.
- **Do NOT set `clear_thinking: false`** in `requestBody` as it forces the client to feed `reasoning_content` back, which VS Code cannot satisfy.

---

## Background & Verification Findings

### 1. Release Discovery

On June 21, 2026, the Z.ai web presence was analyzed for direct GLM 5.2 indications.

- Scanning `z.ai/pricing` and `z.ai/models` revealed that the site metadata has been updated to reflect the new flagship release:
  ```html
  <title>Z.ai API Platform — Start building with GLM-5.2</title>
  <meta
    name="description"
    content="At Z.ai, we are developing safe and beneficial Artificial General Intelligence to help solve humanity's most complex challenges. GLM-5.2 is our new flagship model designed to unify frontier reasoning, coding, and agentic capabilities."
  />
  ```
- Public developer documentation at `docs.bigmodel.cn/cn/guide/models/text/glm-5.2` officially catalogs `glm-5.2` as the active production model identifier.

### 2. Outstanding Capabilities

Official documentation details several critical leaps over `glm-5.1`:

- **Solid 1M Lossless Context:** Unlike simple context-extension solutions that suffer from attention-drift, GLM 5.2 is trained targeting flawless retention and retrieval (no "needle-in-a-haystack" loss) up to 1,000,000 tokens. This lets it easily context-load whole file trees.
- **Agentic coding reinforcement:** Deeply optimized through several months of focused reinforcement learning to execute long-horizon Coding Agent tasks (such as ZCode 3.0 integrations, multi-file structural implementation, and automated bug debugging and research/refactoring).
- **Opus-Level Tiering:** Positioned as an "Opus-level" flagship of the suite, with GLM-4.7/5.1 continuing as the "Sonnet-level" options. Users are recommended to delegate high-complexity or massive project-wide initiatives directly to GLM 5.2 for superior adherence to structural specifications and coding standards.

## Plan & Integration Steps

### Phase 1: Local Verification

- [ ] Incorporate the new `glm-5.2` ID into `chatLanguageModels.json` as described in [Setup](#setup).
- [ ] Connect with standard Z.ai credentials and complete a basic sanity-check prompt.
- [ ] Run a code refactoring test on a complex multi-file prompt to observe reasoning-depth performance.

### Phase 2: Tool & Agent Loop Test

- [ ] Initiate a Copilot Agent session with several custom tools.
- [ ] Verify that the `clear_thinking: true` server routine continues to guarantee error-free multi-turn tool execution.
- [ ] Document average task completion time and context window caching performance.
