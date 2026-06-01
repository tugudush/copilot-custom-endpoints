# Github Copilot Custom Endpoints

> **TL;DR** — As of **June 1, 2026**, GitHub Copilot switched to usage-based billing (AI Credits), making every chat and agent session consume from your monthly allowance. Frontier models like GPT-5.5 and Opus 4.8 burn credits fast. This repo documents a practical workaround: use **cheaper, non-GitHub models** (DeepSeek, Kimi, Qwen) inside VS Code's Copilot chat — often at **5–55× lower cost** while retaining agent mode, tool calling, and streaming. We keep validated, copy-paste-ready configs and a small local proxy that smooths out provider quirks.

## What is this?

VS Code lets you add your own language-model endpoint ("Bring Your Own Key"). In practice, many providers claim "OpenAI-compatible" APIs but reject the exact request shapes that VS Code sends. This repo is a growing collection of **real, tested setups** — not just hopeful `curl` snippets.

Each provider/model gets one durable record under `docs/models/` plus any local proxy code it needs under `proxy/`.

### Why custom endpoints instead of OpenRouter?

[OpenRouter](https://openrouter.ai) is a popular unified gateway, but it is **not always an option**:

- **Corporate firewalls often block OpenRouter** (and many other cloud AI gateways) by default. If your employer's network blocks OpenRouter, you cannot use it — full stop. A custom endpoint lets you talk directly to a provider that _is_ allowed, or run a small local proxy on `localhost` that forwards through an approved egress path.
- **Provider-specific features** (Kimi's thinking mode, vision quirks, etc.) often need request rewriting that a generic aggregator does not support.
- **Cost or contract reasons** may mean your organisation already has a direct relationship with a specific provider and does not want traffic routed through a third party.

This repo is for those situations: validated, copy-paste-ready configs when OpenRouter is blocked, too expensive, or simply the wrong tool for the job.

## Quick start

| Provider                      | Model          | Needs proxy?                  | Plain chat | Streaming | Tool calling | Vision |
| ----------------------------- | -------------- | ----------------------------- | ---------- | --------- | ------------ | ------ |
| **Moonshot (Kimi)**           | `kimi-k2.6`    | Yes — `proxy/kimi-proxy.mjs`  | ✅         | ✅        | ✅           | ✅     |
| **Alibaba Cloud (DashScope)** | `qwen3.6-plus` | No                            | ✅         | ✅        | ✅           | ✅     |
| **Alibaba Cloud (DashScope)** | `qwen3.7-max`  | No                            | ✅         | ✅        | ✅           | ❌     |
| **DeepSeek**                  | `deepseek-v4`  | No — uses a VS Code extension | ✅         | ✅        | ✅           | ✅¹    |

¹ Vision is supported through a proxy model (Claude, GPT-4o) that describes the image before sending to DeepSeek.

Pick the model you want and follow the corresponding section below.

### Config file location

The Kimi and Qwen setups require editing the same VS Code config file:

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

### Kimi K2.6 (Moonshot)

#### 1. Grab a Moonshot API key

Sign up at [platform.moonshot.ai](https://platform.moonshot.ai) and create an API key.

#### 2. Start the local proxy

The proxy rewrites VS Code's requests into shapes Kimi actually accepts (fixed `temperature`, `top_p`, and disabling "thinking" during tool calls).

```bash
node proxy/kimi-proxy.mjs
```

You should see:

```
[kimi-proxy] listening on http://127.0.0.1:3457/v1/chat/completions
```

Check it's alive:

```bash
curl http://127.0.0.1:3457/healthz
```

> **Keep this terminal open** while you use Kimi in VS Code.

#### 3. Register the model in VS Code

Open (or create) your user config file (see [Config file location](#config-file-location) above) and paste this entry (replace `<your-moonshot-key>`):

```json
{
  "name": "Kimi",
  "vendor": "customendpoint",
  "apiKey": "<your-moonshot-key>",
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
}
```

> **Note:** The `requestBody.temperature` here is a hint to VS Code, but the proxy will enforce the exact values Kimi requires regardless.

#### 4. Chat!

- Open the Copilot chat panel (`Ctrl+Alt+I` / `Cmd+Ctrl+I`).
- Click the model picker (top-right of the chat input).
- Choose **Kimi K2.6**.
- Ask something. Streaming, tool use, and vision all work.

#### Troubleshooting (Kimi)

| Symptom                                 | Fix                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Connection refused" or no response     | Make sure `node proxy/kimi-proxy.mjs` is still running.                                                                                                       |
| `invalid temperature` / `invalid top_p` | You're talking directly to Moonshot instead of through the proxy. Double-check the `url` in `chatLanguageModels.json`.                                        |
| Tool calls fail after first turn        | This happens if "thinking" stays enabled during tool loops. The proxy normally disables it automatically; ensure you're on the latest `proxy/kimi-proxy.mjs`. |

---

### Qwen 3.6 Plus or Qwen 3.7 Max (DashScope)

These models work **without a proxy** — VS Code talks directly to DashScope.

#### 1. Grab a DashScope API key

Sign up at [dashscope.aliyun.com](https://dashscope.aliyun.com) and create an API key.

#### 2. Register the models in VS Code

Open (or create) your user config file (see [Config file location](#config-file-location) above) and paste this entry (replace `<your-dashscope-key>`):

```json
{
  "name": "Qwen",
  "vendor": "customendpoint",
  "apiKey": "<your-dashscope-key>",
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
}
```

> **Note:** `enable_thinking: false` suppresses the Qwen3 family's default thinking mode, which prevents `reasoning_content` issues during tool loops.

> **Regional endpoints:** The configuration above uses the **Singapore** region (`dashscope-intl.aliyuncs.com`). DashScope offers endpoints for other regions:
>
> - **China (Beijing):** `https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
> - **US (Virginia):** `https://dashscope-us.aliyuncs.com/compatible-mode/v1/chat/completions`
> - **Singapore:** `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` (used in this guide)
>
> Choose the endpoint closest to your location for better latency. Note that API keys are region-specific.

#### 3. Chat!

- Open the Copilot chat panel (`Ctrl+Alt+I` / `Cmd+Ctrl+I`).
- Click the model picker (top-right of the chat input).
- Choose **Qwen 3.6 Plus** (with vision) or **Qwen 3.7 Max** (text only).
- Ask something. Streaming and tool use work for both. Vision works for Qwen 3.6 Plus.

#### Troubleshooting (Qwen)

| Symptom                                      | Fix                                                                                     |
| -------------------------------------------- | --------------------------------------------------------------------------------------- |
| `reasoning_content` errors during tool loops | Ensure `enable_thinking: false` is present in `requestBody` for every Qwen model.       |
| Vision images fail to upload                 | Use base64-encoded images; external image URLs may fail if DashScope cannot reach them. |

---

### DeepSeek V4 (VS Code Extension)

DeepSeek V4 Pro & Flash are available via a **dedicated VS Code extension** rather than a raw custom endpoint. The extension plugs DeepSeek directly into Copilot Chat's model picker while preserving agent mode, tool calling, skills, and MCP support.

> **How this differs:** Unlike Kimi and Qwen (which use VS Code's built-in `chatLanguageModels.json` custom endpoint mechanism), DeepSeek uses a VS Code extension that registers itself with Copilot. The experience is the same — pick the model in chat — but the setup path goes through the extension.

#### 1. Install the Extension

- VS Code 1.116 or later.
- A [GitHub Copilot subscription](https://github.com/features/copilot) (Free / Pro / Enterprise all work).
- Install **[DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot)** from the VS Code Marketplace ([source](https://github.com/Vizards/deepseek-v4-for-copilot)).

#### 2. Get a DeepSeek API Key

Go to [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) and create an API key (starts with `sk-`).

#### 3. Configure the API Key

Open the Command Palette (`Ctrl+Shift+P`) and run **DeepSeek: Set API Key**, then paste your key. The key is stored in your OS keychain.

#### 4. Select the Model and Start Chatting

- Open Copilot Chat (`Ctrl+Shift+I`).
- Click the model picker (top-right of the chat panel).
- Choose **DeepSeek V4 Pro** or **DeepSeek V4 Flash**.
- Agent mode, tool calling, skills, and MCP all work out of the box.

#### Optional: Configure Thinking Effort

In the model picker, click the gear icon next to a DeepSeek model to choose:

- **None** — fastest, no reasoning.
- **High** — balanced (default).
- **Max** — deep reasoning for complex tasks.

#### Optional: Vision Support

DeepSeek V4 is text-only, but the extension handles images automatically — drop a screenshot into chat and it proxies through another installed Copilot model (Claude, GPT-4o) to describe the image first. Run **DeepSeek: Set Vision Proxy Model** to pick which model handles image descriptions.

> For the full official guide, see: [github.com/deepseek-ai/awesome-deepseek-agent/blob/main/docs/github_copilot.md](https://github.com/deepseek-ai/awesome-deepseek-agent/blob/main/docs/github_copilot.md)

For the full research notes, tested values, and known limitations, see:

- [`docs/models/kimi-k2.6.md`](docs/models/kimi-k2.6.md)
- [`docs/models/qwen3.6-plus.md`](docs/models/qwen3.6-plus.md)
- [`docs/models/qwen3.7-max.md`](docs/models/qwen3.7-max.md)

## Pricing comparison

> **⏰ June 1, 2026 — GitHub Copilot switched to usage-based billing (AI Credits) today.**
>
> Before this change, Copilot was a flat subscription — unlimited chat, unlimited agent sessions. Now **every interaction burns AI credits** from your monthly allowance. Agent mode and complex multi-file tasks consume significantly more tokens than simple Q&A, which means your 7,000 Pro+ credits can disappear fast if you're using frontier models.
>
> **The practical workaround:** use cheaper alternative models (DeepSeek V4 Flash, Kimi K2.6, Qwen) that are still powerful enough for coding — often at **5–55× less cost** than the Copilot defaults. The tables below show the exact comparison.
>
> 1 AI credit = $0.01 USD. All paid plans include a monthly credit allowance:
>
> | Plan | Price/mo | Base credits | Flex allotment | Total monthly |
> | ---- | -------- | ------------ | -------------- | ------------- |
> | Pro  | $10      | 1,000        | 500            | **1,500**     |
> | Pro+ | $39      | 3,900        | 3,100          | **7,000**     |
> | Max  | $100     | 10,000       | 10,000         | **20,000**    |
>
> Code completions remain unlimited and **not** billed. Auto model selection gets a 10% discount.

All prices below are in **USD per 1M tokens** (non-cached). To convert to AI credits, multiply by 100 (e.g., $5.00/1M = 500 credits/1M).

### Default GitHub Copilot models

These are the models available through GitHub Copilot's model roster as of June 1, 2026.

| Model                 | Provider  | Tier        | Input (per 1M) | Cached input | Output (per 1M) | Context |
| --------------------- | --------- | ----------- | -------------- | ------------ | --------------- | ------- |
| **GPT-5.5**           | OpenAI    | Powerful    | $5.00          | $0.50        | $30.00          | —       |
| **Claude Opus 4.8**   | Anthropic | Powerful    | $5.00          | $0.50        | $25.00          | 1M      |
| **Claude Opus 4.7**   | Anthropic | Powerful    | $5.00          | $0.50        | $25.00          | 1M      |
| **GPT-5.4**           | OpenAI    | Versatile   | $2.50          | $0.25        | $15.00          | —       |
| **GPT-5.3-Codex**     | OpenAI    | Powerful    | $1.75          | $0.175       | $14.00          | —       |
| **Claude Sonnet 4.6** | Anthropic | Versatile   | $3.00          | $0.30        | $15.00          | 1M      |
| **Gemini 3.1 Pro**    | Google    | Powerful    | $2.00¹         | $0.20        | $12.00¹         | 1M      |
| **Claude Haiku 4.5**  | Anthropic | Versatile   | $1.00          | $0.10        | $5.00           | 1M      |
| **Gemini 3.5 Flash**  | Google    | Lightweight | $1.50          | $0.15        | $9.00           | 1M      |
| **Gemini 2.5 Pro**    | Google    | Powerful    | $1.25¹         | $0.125       | $10.00¹         | 1M      |
| **GPT-5.4 mini**      | OpenAI    | Lightweight | $0.75          | $0.075       | $4.50           | —       |
| **Gemini 3 Flash**    | Google    | Lightweight | $0.50          | $0.05        | $3.00           | 1M      |
| **Raptor mini**       | GitHub    | Versatile   | $0.25          | $0.025       | $2.00           | —       |

¹ Gemini 3.1 Pro and 2.5 Pro pricing applies to prompts ≤200K tokens.

### Custom-endpoint alternatives

| Model                 | Provider  | Input (per 1M)                | Output (per 1M)                         | Context window |
| --------------------- | --------- | ----------------------------- | --------------------------------------- | -------------- |
| **DeepSeek V4 Flash** | DeepSeek  | $0.14                         | $0.28                                   | 1M             |
| **Kimi K2.6**         | Moonshot  | $0.16                         | $0.95 (non-thinking) / $4.00 (thinking) | 256K           |
| **DeepSeek V4 Pro**   | DeepSeek  | $1.74                         | $3.48                                   | 1M             |
| **Qwen 3.6 Plus**     | DashScope | $0.50 (≤256K) / $2.00 (>256K) | $3.00 (≤256K) / $6.00 (>256K)           | 1M             |
| **Qwen 3.7 Max**      | DashScope | $2.50 (≤1M)                   | $7.50 (≤1M)                             | 1M             |

> **Notes:**
>
> - **DeepSeek V4** input pricing shown is the **cache miss** price. Cache hits are significantly cheaper ($0.0028/M for Flash, $0.0145/M for Pro).
> - **Gemini 3 Flash** is priced at $0.50/MTok input (text/image/video) and $1.00/MTok input for audio.
> - **Anthropic (Claude)** models also have a cache write cost ($6.25/MTok for Opus, $3.75/MTok for Sonnet, $1.25/MTok for Haiku). Opus 4.7+ use a new tokenizer that may use up to 35% more tokens for the same text.
> - **OpenAI** models support cached input at 0.1× base input rate.
> - **Qwen** models use **tiered pricing** — determined by total input tokens per request. Prices above are for non-thinking mode.
> - **Kimi K2.6** pricing is from the **Moonshot platform** (direct). Via DashScope: $0.89 input / $3.71 output.
> - **DashScope** offers a **free quota** of 1M input + 1M output tokens per model, valid for 90 days.
> - For typical Copilot chat usage (short-to-medium prompts), you'll almost always fall in the lowest pricing tier.

**Quick cost comparison for a typical coding session** (~10K input + ~2K output tokens per turn, 50 turns):

| Model                    | Estimated session cost | Copilot Pro+ credits |
| ------------------------ | ---------------------- | -------------------- |
| DeepSeek V4 Flash 🏆     | ~$0.10                 | —                    |
| Kimi K2.6 (non-thinking) | ~$0.18                 | —                    |
| Raptor mini              | ~$0.33                 | ~33                  |
| Kimi K2.6 (thinking)     | ~$0.48                 | —                    |
| Gemini 3 Flash           | ~$0.55                 | ~55                  |
| Qwen 3.6 Plus            | ~$0.55                 | —                    |
| GPT-5.4 mini             | ~$0.83                 | ~83                  |
| Claude Haiku 4.5         | ~$1.00                 | ~100                 |
| DeepSeek V4 Pro          | ~$1.22                 | —                    |
| Qwen 3.7 Max             | ~$1.33                 | —                    |
| Gemini 2.5 Pro           | ~$1.63                 | ~163                 |
| Gemini 3.5 Flash         | ~$1.65                 | ~165                 |
| Gemini 3.1 Pro           | ~$2.20                 | ~220                 |
| GPT-5.3-Codex            | ~$2.28                 | ~228                 |
| GPT-5.4                  | ~$2.75                 | ~275                 |
| Claude Sonnet 4.6        | ~$3.00                 | ~300                 |
| Claude Opus 4.8 / 4.7    | ~$5.00                 | ~500                 |
| GPT-5.5                  | ~$5.50                 | ~550                 |

> **How long does 7,000 credits last?** A Pro+ subscriber running 50-turn sessions could afford roughly **13 GPT-5.5 sessions**, **23 Opus sessions**, or **212 Raptor mini sessions** per month — or mix and match.

> Prices last verified: June 1, 2026. Always check the official pages for the latest rates:
>
> - [GitHub Copilot models & pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing)
> - [OpenAI pricing](https://openai.com/api/pricing/)
> - [Anthropic (Claude) pricing](https://platform.claude.com/docs/en/about-claude/pricing)
> - [Google Gemini pricing](https://ai.google.dev/pricing)
> - [DashScope pricing](https://www.alibabacloud.com/help/en/model-studio/billing-for-model-studio)
> - [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing)

## Repo layout

```
.
├── docs/models/<provider>-<model>.md   # One merged record per model
├── proxy/                              # Local compatibility shims (Kimi only)
├── tests/                              # Test assets (images, etc.)
└── debug_log/                          # Runtime logs (git-ignored)
```

## Adding a new model

Want to validate Qwen, GLM, Mimo, or something else?

1. Create `docs/models/<provider>-<model>.md`.
2. If the provider needs request rewriting, add a proxy script under `proxy/`.
3. Recommended sections for the record:
   1. Summary
   2. Compatibility assessment
   3. Final working configuration
   4. Validation summary
   5. Known limitations
   6. Final verdict
   7. Sources

## Limitations

- This repo covers **chat only**. GitHub Copilot features like inline completions, semantic search, and next-edit suggestions still require a GitHub-hosted model.
- Each proxy is tuned for a specific provider family. Don't point the Kimi proxy at an arbitrary OpenAI-compatible endpoint and expect it to work.

---

## Support

If you find this project helpful, please consider supporting its development:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/tugudush)

**Solana (SOL)**

```
CWZccD3Ny3XotFZtnkcyzP3hapmu3ExknN1PF4rEvP3u
```
