# GLM (Z.ai / Zhipu AI) — VS Code Custom Endpoint Setup Guide

> **TL;DR:** GLM works directly with VS Code's custom-endpoint provider — **no proxy needed**. The API is OpenAI Chat Completions compatible at `https://api.z.ai/api/paas/v4/chat/completions`, and Z.ai's default `thinking.clear_thinking: true` quietly strips `reasoning_content` from prior turns, which makes multi-turn tool loops stable even when VS Code doesn't preserve reasoning blocks.
>
> **Billing:** The PaaS API is **Pay-as-You-Go** (per-token). Z.ai also offers a **Coding Plan** subscription (Lite/Pro/Max, $18–$160/mo), but it uses a **different endpoint** (`/api/coding/paas/v4`) that is **locked to a curated list of coding tools** (Claude Code, Cursor, Cline, etc.) — it **cannot** be used from VS Code custom endpoints.
>
> **🆕 GLM VS Code extensions are available.** Three community extensions add reasoning visibility (collapsible thinking blocks), per-model thinking toggles, usage dashboards, and more — all impossible with custom endpoints. See [the full comparison](../research/glm-vscode-extension.md):

| Extension                             | Marketplace ID                                                                                                                             | Standard API | Coding Plan | Key feature                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | :----------: | :---------: | ----------------------------------- |
| **GLM for Copilot** (umbrella22)      | [`ikaros.glm-for-vscode-copilot`](https://marketplace.visualstudio.com/items?itemName=ikaros.glm-for-vscode-copilot)                       |      ✅      |     ✅      | Vision proxy, cost est., team mode  |
| **GLM Models for Copilot** (KiwiGaze) | [`yijiazhen-qi.glm-for-github-copilot-chat`](https://marketplace.visualstudio.com/items?itemName=yijiazhen-qi.glm-for-github-copilot-chat) |      ✅      |     ✅      | Quota dashboard, dual API           |
| **GLM Chat Provider** (zelosleone)    | _(pending)_                                                                                                                                |      ❌      |     ✅      | 14 models, per-model thinking tiers |

## At a Glance

| Field                  | Value                                                                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Mode                   | **Direct** (no proxy)                                                                                              |
| Billing                | **Pay-as-You-Go** (PaaS API) — Coding Plan subscription exists but is **not usable** from VS Code custom endpoints |
| Vision                 | ✅ Yes (`glm-5v-turbo` only)                                                                                       |
| Tool calling           | ✅ Yes (native multimodal tool use on `glm-5v-turbo`)                                                              |
| Context (flagship)     | 1M (`glm-5.2` Solid Lossless Context)                                                                              |
| Max output (flagship)  | 131072                                                                                                             |
| Required `requestBody` | `thinking: { type: "enabled" }` (recommended)                                                                      |
| Endpoint (intl)        | `https://api.z.ai/api/paas/v4/chat/completions`                                                                    |
| Endpoint (China)       | `https://open.bigmodel.cn/api/paas/v4/chat/completions`                                                            |
| Auth                   | `Authorization: Bearer $ZAI_API_KEY`                                                                               |

### Models

| Model          | Vision | Context | Max output | Thinking  | Cost (in / out per 1M) | Role                                                                                     |
| -------------- | ------ | ------- | ---------- | --------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| `glm-5.2`      | ❌     | 1M      | 131072     | `enabled` | $1.40 / $4.40          | New Flagship — "Opus-level" long-context engineering, agentic coding, and deep reasoning |
| `glm-5.1`      | ❌     | 200K    | 131072     | `enabled` | $1.40 / $4.40          | Previous flagship — long-horizon / 8h autonomous work                                    |
| `glm-5v-turbo` | ✅     | 200K    | 131072     | `enabled` | $1.20 / $4.00          | Multimodal **coding** model — vision-based agentic coding                                |

> Other GLM models (`glm-5`, `glm-5-turbo`, `glm-4.5-air`, etc.) are callable on the same endpoint but are intentionally **not** added to the default `chatLanguageModels.json` block below. Add them in the same shape if you need them. Note: `glm-4.6v-flashx` was previously in the default block but has been **removed** because live testing showed it is not reliable for tool calling.

## Quick Start

1. **Verify your account** at [z.ai/model-api](https://z.ai/model-api) or [open.bigmodel.cn](https://open.bigmodel.cn) to ensure the flagship models are active under your plan.
2. **Generate an API key** on the API Keys page of the platform.
3. **Edit `chatLanguageModels.json`** — add the GLM block below.
4. **Set the API key** via Command Palette → **Chat: Manage Language Models** → right-click **GLM** → **Update API Key**.
5. **Restart VS Code** and select a GLM model from the picker.

## Setup

### 1. VS Code configuration

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
      "id": "glm-5.2",
      "name": "GLM 5.2 (text)",
      "url": "https://api.z.ai/api/paas/v4/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 131072,
      "requestBody": {
        "thinking": { "type": "enabled" },
        "temperature": 1.0,
        "top_p": 0.95
      }
    },
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
```

> **Leave `apiKey` as `""`** — set it through the Language Models UI so VS Code stores it in the OS keychain (it will replace the empty string with a `${input:chat.lm.secret.<id>}` reference).
> If you signed up on `bigmodel.cn` (China), swap the `url` values in the block above to the regional endpoint `https://open.bigmodel.cn/api/paas/v4/chat/completions`.

### 2. API Key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **GLM** group → **Update API Key**.
4. Paste your Z.ai API key.

### 3. Regional endpoints

| Region                            | Endpoint                                                | Notes                                                      |
| --------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| **International** (default above) | `https://api.z.ai/api/paas/v4/chat/completions`         | [z.ai/model-api](https://z.ai/model-api) — USD billing     |
| China                             | `https://open.bigmodel.cn/api/paas/v4/chat/completions` | [open.bigmodel.cn](https://open.bigmodel.cn) — CNY billing |

## Notes

- **Sampling:** recommended `temperature: 1`, `top_p: 0.95`. Z.ai's `temperature` is **hard-capped at `1.0` server-side** — sending `> 1.0` will reject with a 400. Don't set `do_sample: false` from `requestBody` (it would make `temperature`/`top_p` be ignored).
- **`tool_choice` only supports `auto`** — don't override it (VS Code's default is `auto`).
- **`clear_thinking` defaults to `true` server-side**, which strips historical `reasoning_content` from prior turns before sending to the model. This is what makes multi-turn tool loops stable. **Do not** set `clear_thinking: false` from `requestBody` — VS Code can't forward `reasoning_content` and the request will fail.
- **Vision** is supported only on `glm-5v-turbo` (OpenAI `image_url` content-part format — external URLs and base64 data URIs both work). `glm-5.2` and `glm-5.1` are text-only. For turnkey VS Code video understanding via `glm-5v-turbo`, see [**Video Context MCP**](https://www.videocontextmcp.com/).
- **Context caching** is automatic — `usage.prompt_tokens_details.cached_tokens` reports cache hits; cache writes are currently free.

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

## Pricing

All prices are **USD per 1M tokens** (cache miss) on the Z.ai international platform. Per-model input/output rates are listed in the `Cost` column of the [Models](#models) table above.

> **Cache writes** are currently **Limited-time Free** for all models. Cached-input pricing is roughly 18% of the input price (e.g. `$1.40` input → `$0.25` cached for `glm-5.1` / `glm-5.2`). China platform (`bigmodel.cn`) prices in CNY; see the [China pricing page](https://bigmodel.cn/pricing). For the cross-provider comparison, see [docs/pricing.md](../pricing.md).
