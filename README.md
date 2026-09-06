# GitHub Copilot Custom Endpoints

> **TL;DR** — GitHub Copilot switched to usage-based billing on **June 1, 2026**. Every chat and agent session now burns AI credits — fast. This repo shows you how to plug **cheaper non-GitHub models** (DeepSeek, Kimi, Qwen, MiMo, MiniMax, GLM) into VS Code's Copilot chat — often **5–55× cheaper** than the built-ins — while keeping agent mode, tools, streaming, and vision.

## What is this?

VS Code lets you add your own language-model endpoint via a small JSON config file. Many providers advertise "OpenAI-compatible" APIs but reject the exact request shapes VS Code sends. This repo collects **real, tested setups** — one per provider — plus a tiny local proxy that smooths over the rough edges when needed.

If [OpenRouter](https://openrouter.ai) is blocked by your network or too generic for your model's quirks, this is the workaround.

## How it works (5 steps)

1. **Pick a model** from the table below.
2. **Add it to your VS Code config** — copy the snippet from the model's doc.
3. **Set the API key** through VS Code's UI (it goes to your OS keychain, not the file).
4. **Configure the Utility Small Model** — VS Code now requires a fast fallback model for built-in utility flows. Open Settings → search **"Chat: Utility Small Model"** → pick your fastest custom-endpoint model (or "Default" if you have native Copilot models available). Without this, chat may not function correctly.
5. **Open chat** and pick the model from the model picker.

That's it. No code, no servers to manage (unless the model specifically needs the local proxy — the table tells you).

## Pick a model

| Model                          | Provider  | Needs proxy?           | Vision                 | Setup guide                                                                                                                                 |
| ------------------------------ | --------- | ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kimi K3 / K2.7 Code / K2.6** | Moonshot  | **Yes**                | ✅                     | [Manual setup](docs/models/kimi.md)                                                                                                         |
| **MiMo V2.5**                  | Xiaomi    | Optional (recommended) | ✅                     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) ★ / [Manual setup](docs/models/mimo.md) |
| **MiMo V2.5 Pro**              | Xiaomi    | Optional (recommended) | ❌                     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) ★ / [Manual setup](docs/models/mimo.md) |
| **Qwen 3.7 Plus**              | DashScope | Optional (recommended) | ✅                     | [Manual setup](docs/models/qwen.md)                                                                                                         |
| **Qwen 3.7 Max**               | DashScope | Optional (recommended) | ❌                     | [Manual setup](docs/models/qwen.md)                                                                                                         |
| **Qwen 3.8 Max**               | DashScope | Optional (recommended) | ✅                     | [Manual setup](docs/models/qwen.md)                                                                                                         |
| **MiniMax M3**                 | MiniMax   | No                     | ✅                     | [Extension](https://github.com/tugudush/minimax-copilot) ★ / [Manual setup](docs/models/minimax.md)                                         |
| **GLM 5.3 Flash**              | Z.ai      | No                     | ✅                     | [Manual setup](docs/models/glm.md)                                                                                                          |
| **GLM 5.3 / 5.2 / 5.1**        | Z.ai      | No                     | ✅ via extension proxy | [Manual setup](docs/models/glm.md)                                                                                                          |
| **GLM 5V Turbo**               | Z.ai      | No                     | ✅                     | [Manual setup](docs/models/glm.md)                                                                                                          |
| **DeepSeek V4 Flash 0731**     | DeepSeek  | No (uses an extension) | ❌                     | [Extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) / [setup notes](docs/models/deepseek.md)   |
| **DeepSeek V4 Pro 0813**       | DeepSeek  | No (uses an extension) | ❌                     | [Extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) / [setup notes](docs/models/deepseek.md)   |

## Setup

### 1. Find (or create) your config file

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

If the file doesn't exist yet, create it with `[]` inside.

### 2. Add a model entry

Open the setup guide for the model you picked (links in the table above) and copy its JSON snippet into the file. Each snippet is a single provider object inside the array.

> **⚠️ Leave `apiKey` as `""`** — never paste the key into the JSON file.

### 3. Set the API key

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find your provider in the list, right-click the group name → **Update API Key**.
4. Paste your key. It's stored in your OS keychain.

### 4. Configure the Utility Small Model

> **⚠️ Required for BYOK/custom-endpoint users.** VS Code's latest update mandates that you explicitly set which model handles built-in small/fast utility flows. Without this, custom-endpoint models may not function correctly in chat or agent mode.

1. Open VS Code Settings (`Ctrl+,` / `Cmd+,`).
2. Search for **"Chat: Utility Small Model"** (setting ID: `chat.lm.utilitySmallModel`).
3. Pick the **fastest, cheapest model** available to you from the dropdown. Good choices:
   - **DeepSeek V4 Flash** — if you have the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) extension installed (fastest, ~$0.35/session at peak rates).
   - **MiMo V2.5** — if you already have Xiaomi MiMo configured (cheapest custom-endpoint option, ~$0.10/session).
   - **Default** — if you still have native Copilot model access, this lets VS Code use its built-in fast model.
4. The setting takes effect immediately — no restart needed.

> **Why this matters:** VS Code uses a small utility model for quick background tasks (token counting, prompt truncation, lightweight completions). When you switch to custom-endpoint models, the framework still needs a fast model for these utility flows. If left unset, some features may silently degrade or fail.

### 5. Chat

- Open Copilot chat (`Ctrl+Alt+I` / `Cmd+Ctrl+I`).
- Click the model picker (top-right).
- Pick your model and ask something.

If a model needs a proxy, the setup guide will tell you to run a command first. Keep that terminal open while you chat.

## Common commands

Run from the repo root:

```bash
npm run proxy        # Start all proxies (Kimi + Qwen + MiMo)
npm run proxy:kimi   # Start only the Kimi proxy
npm run proxy:qwen   # Start only the Qwen proxy
npm run proxy:mimo   # Start only the MiMo proxy
npm run clean:logs   # Remove debug_log/
npm test             # Run the test suite
```

Or globally via npx (no clone needed):

```bash
npx copilot-custom-endpoint          # Start all proxies
npx copilot-custom-endpoint kimi     # Kimi only
npx copilot-custom-endpoint qwen     # Qwen only
npx copilot-custom-endpoint mimo     # MiMo only
npx copilot-custom-endpoint clean    # Remove debug_log/
```

## Pricing snapshot

All prices are **USD per 1M tokens** (non-cached). 1 AI credit = $0.01. To convert to AI credits, multiply by 100 (e.g., $5.00/1M = 500 credits/1M). Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns. DeepSeek V4 estimates use peak rates; official off-peak rates are half. The current AA values come from OpenRouter's live model pages; **every pricing cell comes from first-party provider pricing or GitHub Copilot's official billing table, never OpenRouter.** Qwen 3.8 Max now refers to the current 0902 snapshot. Current corrections include OpenAI GPT-5.6 Sol at **$4 / $0.40 / $20**, Anthropic Sonnet 5 at **$2 / $0.20 / $10**, xAI Grok 4.5 cache reads at **$0.30**, and Alibaba's Qwen 3.7 list rates at **$2.50 / $0.25 / $7.50** (Max) and **$0.40 / $0.04 / $1.60** (Plus).

| Model                         | Provider  | Cost per intelligence | Intelligence Score | Est. session | Vision | Context window |
| ----------------------------- | --------- | --------------------- | ------------------ | ------------ | ------ | -------------- |
| **GLM 5.3 Flash**              | Z.ai      | **~$0.0028**          | **46.2**           | ~$0.13       | ✅     | 1M             |
| **GPT-5.6 Luna**               | OpenAI    | **~$0.0051**          | **43.4**           | ~$0.22       | ✅     | 1M             |
| **MiniMax M3**                 | MiniMax   | **~$0.0076**          | **35.7**           | ~$0.27       | ✅     | 1M             |
| **DeepSeek V4 Flash 0731**     | DeepSeek  | **~$0.0086**          | **40.8**           | ~$0.35       | ❌     | 1M             |
| **MiMo V2.5 Pro**              | Xiaomi    | **~$0.0092**          | **32.6**           | ~$0.30       | ❌     | 1M             |
| **MiniMax M3 Priority**        | MiniMax   | **~$0.0115**          | **35.7**           | ~$0.41       | ✅     | 1M             |
| **Gemini 3.8 Flash**           | Google    | **~$0.0159**          | **47.1**           | ~$0.75       | ✅     | 1M             |
| **Gemini 3.7 Flash**           | Google    | **~$0.0166**          | **45.2**           | ~$0.75       | ✅     | 1M             |
| **Gemini 3.6 Flash**           | Google    | **~$0.0186**          | **40.3**           | ~$0.75       | ✅     | 1M             |
| **GLM 5.3**                    | Z.ai      | **~$0.0235**          | **48.6**           | ~$1.14       | ❌     | 1M             |
| **DeepSeek V4 Pro 0813**       | DeepSeek  | **~$0.0252**          | **42.1**           | ~$1.06       | ❌     | 1M             |
| **Grok 4.6**                   | xAI       | **~$0.0316**          | **50.6**           | ~$1.60       | ✅     | 500K           |
| **Qwen 3.8 Max (0902)**        | DashScope | **~$0.0341**          | **46.9**           | ~$1.60       | ✅     | 1M             |
| **Grok 4.5**                   | xAI       | **~$0.0352**          | **45.5**           | ~$1.60       | ✅     | 500K           |
| **Claude Sonnet 5**            | Anthropic | **~$0.0443**          | **45.1**           | ~$2.00       | ✅     | 1M             |
| **GPT-5.6 Terra**              | OpenAI    | **~$0.0470**          | **46.8**           | ~$2.20       | ✅     | 1M             |
| **Kimi K3**                    | Moonshot  | **~$0.0598**          | **50.2**           | ~$3.00       | ✅     | 1M             |
| **Gemini 3.1 Pro**             | Google    | **~$0.0599**          | **36.7**           | ~$2.20       | ✅     | 1M             |
| **GPT-5.6 Sol**                | OpenAI    | **~$0.0780**          | **51.3**           | ~$4.00       | ✅     | 1M             |
| **Claude Opus 5**              | Anthropic | **~$0.0924**          | **54.1**           | ~$5.00       | ✅     | 1M             |
| **Claude Fable 5.1**           | Anthropic | **~$0.1761**          | **56.8**           | ~$10.00      | ✅     | 1M             |
| **GPT-6 Astra**                | OpenAI    | **~$0.1828**          | **54.7**           | ~$10.00      | ✅     | 1M             |
| **Claude Fable 5**              | Anthropic | **~$0.1880**          | **53.2**           | ~$10.00      | ✅     | 1M             |
| **MiMo V2.5**                  | Xiaomi    | —                     | —                  | ~$0.10       | ✅     | 1M             |
| **Qwen 3.7 Plus**              | DashScope | —                     | —                  | ~$0.36       | ✅     | 1M             |
| **Qwen 3.6 Plus**              | DashScope | —                     | —                  | ~$0.55       | ✅     | 1M             |
| **GPT-5.4 mini**               | OpenAI    | —                     | —                  | ~$0.83       | ❌     | 400K           |
| **Kimi K2.6**                  | Moonshot  | —                     | —                  | ~$0.88       | ✅     | 256K           |
| **Kimi K2.7 Code**             | Moonshot  | —                     | —                  | ~$0.88       | ✅     | 262K           |
| **GLM 5V Turbo**               | Z.ai      | —                     | —                  | ~$1.00       | ✅     | 200K           |
| **GLM 5.1**                    | Z.ai      | —                     | —                  | ~$1.14       | ❌     | 200K           |
| **GLM 5.2**                    | Z.ai      | —                     | —                  | ~$1.14       | ❌     | 1M             |
| **Gemini 3.5 Flash**           | Google    | —                     | —                  | ~$1.65       | ✅     | 1M             |
| **Qwen 3.7 Max**               | DashScope | —                     | —                  | ~$2.00       | ❌     | 1M             |
| **GPT-5.4**                    | OpenAI    | —                     | —                  | ~$2.75       | ✅     | 1M             |
| **Claude Sonnet 4.6**          | Anthropic | —                     | —                  | ~$3.00       | ✅     | 1M             |
| **Claude Opus 4.8**            | Anthropic | —                     | —                  | ~$5.00       | ✅     | 1M             |
| **Claude Opus 4.7**            | Anthropic | —                     | —                  | ~$5.00       | ✅     | 1M             |
| **GPT-5.5**                    | OpenAI    | —                     | —                  | ~$5.50       | ✅     | 1M             |
| **Gemini 3.8 Flash Cyber**     | Google    | —                     | —                  | —            | —      | —              |

> **Historical footnotes:** The numbered notes below preserve release and pricing context from the prior September 5 snapshot. They are not the current AA ranking source; use the table above and its OpenRouter refresh note for current scores.

¹ Gemini 3.1 Pro pricing applies to prompts ≤200K tokens.

³ Score is an **estimate** from Artificial Analysis (labelled "independent evaluation forthcoming"). Not a confirmed run of the full evaluation suite. As of August 7, 2026, **GLM 5V Turbo (35.0)** is the only remaining estimate in this table — MiMo V2.5 is now a measured 38.0.

⁴ **MiniMax M3 Priority** is the same `MiniMax-M3` weights invoked with `"service_tier": "priority"` in the request body — **not a separate model**. Costs **1.5× Standard** (effective post-50%-off rates: $0.45 / $1.80 / $0.09 per 1M for input/output/cached ≤512K) in exchange for **priority admission** (faster responses, fewer failures during MiniMax peak hours). Capabilities, context window, vision, tools, rate limits, and thinking modes are identical to Standard. See [docs/research/minimax-m3-priority.md](docs/research/minimax-m3-priority.md).

⁵ **Claude Sonnet 5** has introductory pricing of **$2.00 / $10.00** per MTok (input/output) through **August 31, 2026**. Standard pricing of $3.00 / $15.00 shown above takes effect September 1, 2026. Released June 30, 2026 — Arena rankings pending. AA Intelligence Index score of **55.3** confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-sonnet-5).

⁶ **GPT-5.6** launched July 9, 2026. On July 30, OpenAI reduced Luna pricing by 80% to $0.20/$1.20 and Terra pricing by 20% to $2/$12 per 1M input/output tokens; Sol remains $5/$30. All support image input and 1M context. The Batch API offers an additional 50% discount for asynchronous jobs. OpenRouter is currently running a limited-time 50% promo on Terra and Luna (effective $0.10/$0.60 and $1/$6 per 1M input/output respectively). Benchmark details and cache-write pricing are maintained in [docs/pricing.md](docs/pricing.md).

⁷ **Kimi K3** launched July 16, 2026. 2.8T params (open-source weights by July 27, 2026). Always-thinking reasoning model — uses `reasoning_effort` (not the K2.x `thinking` parameter). AA Intelligence Index score of **59.7** confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/kimi-k3). Priced at $3.00 / $15.00 per MTok input/output. Requires the local Kimi proxy. See [docs/models/kimi.md](docs/models/kimi.md).

⁸ **Gemini 3.6 Flash** launched July 21, 2026. **Promotional pricing** of $0.75 / $3.75 per MTok input/output ($0.075 cached) through **December 31, 2026**; $1.50 / $7.50 from January 1, 2027. AA Intelligence Index score of **51.6** confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/gemini-3-6-flash). 1M context with vision.

⁹ **Claude Opus 5** launched July 24, 2026. AA Intelligence Index score of **63.1** (#1 overall) confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-opus-5). Priced at $5.00 / $25.00 per MTok input/output (same as Opus 4.8). 1M context, text + image input, adaptive reasoning. Also available in Fast mode ($10/$50 per MTok input/output). Uses the newer Claude tokenizer (~30% more tokens than pre-4.7 models). See [Anthropic's Opus 5 announcement](https://www.anthropic.com/news/claude-opus-5).

¹⁰ **Qwen 3.8 Max** (`qwen3.8-max`) has a confirmed Artificial Analysis Intelligence Index of **58.1** (Coding **71.8**, Agentic **58.4**) — see [AA](https://artificialanalysis.ai/models/qwen3-8-max) and [OpenRouter](https://openrouter.ai/qwen/qwen3.8-max). Arena snapshots place it **#5 in Text**, **#2 in Vision**, and **#4 in Code/WebDev**; it is not listed in Agent Arena. See [Arena](https://arena.ai/leaderboard).

¹¹ **Grok 4.5** (xAI, released July 8, 2026) is now a **GitHub Copilot native** model (GA, Versatile). AA Intelligence Index **55.8** (high), Coding **72.4**, Agentic **48.9**. 500K context, text + image input. Priced at $2.00 / $0.50 / $6.00 per 1M input/cached/output (75% cache discount; Copilot long-context >200K tier $4.00 / $1.00 / $12.00). See the [GitHub Copilot models & pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

¹² **Qwen 3.7 price cuts** (verified August 7, 2026): `qwen3.7-max` dropped from $2.50 / $7.50 to **$1.475 / $4.425** per 1M input/output (cached $0.295), and `qwen3.7-plus` dropped from $0.40 / $1.60 to **$0.32 / $1.28** per 1M (cached $0.064).

¹³ **Gemini 3.7 Flash** (Google, released August 13, 2026) is GitHub Copilot native (GA, Versatile). AA Intelligence Index **56** (high preset) confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/gemini-3-7-flash). **Promotional pricing** of $0.75 / $3.75 per MTok input/output ($0.075 cached) through December 31, 2026, then $1.50 / $7.50. 1M context, text + image + speech + video input, and the fastest model on AA's leaderboard (340 t/s).

¹⁴ **Grok 4.6** (xAI, released August 12, 2026) is now a **GitHub Copilot native** model (GA). AA Intelligence Index **61** (high preset, #6/188). 500K context, text + image input. Priced at $2.00 / $0.50 / $6.00 per 1M input/cached/output. See the [AA model page](https://artificialanalysis.ai/models/grok-4-6), the [xAI announcement](https://x.ai/news/grok-4-6), and the [GitHub Copilot models & pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

¹⁵ **Claude Fable 5** (Anthropic, released June 9, 2026) is now a **GitHub Copilot native** model (GA, Powerful). AA Intelligence Index **62.1** (#3/188) confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-fable-5). **#1 in all four Arena leaderboards** (Text, Agent, Code, Overall). 1M context, text + image input, adaptive reasoning. Priced at $10.00 / $50.00 per MTok input/output ($1.00 cached, 90% cache discount). Uses the newer Claude tokenizer (~30% more tokens than pre-4.7 models). **Superseded as Anthropic's flagship by Claude Fable 5.1 (September 2026 — see footnote ²¹)**. See the [GitHub Copilot models & pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

¹⁶ **Qwen 3.6 Plus** (DashScope, released April 2, 2026) — AA Intelligence Index **40.0**. Priced at $0.50 / $3.00 per MTok input/output ($0.05 cached). 1M context, text + image + video input. **Deprecated** in favor of Qwen 3.7 Plus.

¹⁷ **GLM 5.3** (Z.ai, released August 18, 2026) — new flagship. AA Intelligence Index **59.5** (OpenRouter AA-sourced; AA page lists rounded **60**, #8/182). Priced identically to GLM 5.2: $1.40 / $0.26 / $4.40 per 1M input/cached/output. 1M context, text-only, always-thinking with `reasoning_effort` (low/high/max, default max). Released too recently for Arena rankings. See the [AA model page](https://artificialanalysis.ai/models/glm-5-3) and [Z.ai docs](https://docs.z.ai/guides/llm/glm-5.3).

¹⁸ **GLM 5.3 Flash** (Z.ai, released August 26, 2026) — Z.ai's first native multimodal GLM-5 model (text + image input, text output). Hybrid sparse + linear attention architecture, 320B total / 18B active parameters (open weights, MIT), 1M context window. AA Intelligence Index **57.5** (Coding **71.5**, Agentic **58.2**). Priced at **$0.15 / $0.03 / $0.50** per 1M input/cached/output (list; 50% off launch promo through September 9, 2026). Always-thinking with `reasoning_effort` (low/high/max, default max). The cheapest cost-per-intelligence row in this table (~$0.0022, ~$0.13/session). See [docs/models/glm.md](docs/models/glm.md) and the [AA model page](https://artificialanalysis.ai/models/glm-5-3-flash).

¹⁹ **Gemini 3.8 Flash** (`gemini-3.8-flash`, released September 2, 2026) — Google's most intelligent Flash model, built for long-horizon software engineering and autonomous agents. AA Intelligence Index **58.7** (OpenRouter AA-sourced; AA page rounds to **59**, #17/196), Coding **76.3**, Agentic **50.0**. 1M context, text + image + speech + video + PDF input. Configurable thinking (low/medium/high). **Not yet GitHub Copilot native** — priced from the Gemini API at the same promotional rates as 3.7 Flash ($0.75 / $3.75 per MTok input/output, $0.075 cached) through December 31, 2026, then $1.50 / $7.50. Fast (305.5 t/s) but very verbose — budget more output tokens than the score alone suggests. See the [Google announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/) and the [AA model page](https://artificialanalysis.ai/models/gemini-3-8-flash).

²⁰ **Gemini 3.8 Flash Cyber** (released September 2, 2026) — cybersecurity-specialized variant of 3.8 Flash (autonomous vulnerability discovery + automated patching). **Restricted access** via Google's [Fairwind Program](https://deepmind.google/fairwind-program/) — no public API pricing and no AA Intelligence Index run, hence the `—` cells. Vendor-reported CyberGym Pass@1 **86.2** and CWE-Bench Pass@1 **47.2**. See the [Google announcement](https://blog.google/innovation-and-ai/models-and-research/gemini-models/3-8-flash-and-3-8-flash-cyber/).

²¹ **Claude Fable 5.1** (released September 1, 2026) — Anthropic's new flagship; AA Intelligence Index **65.7** (OpenRouter AA-sourced; AA page rounds to **66**, #1/196), Coding **81.6**, Agentic **61.3** — now the top-scoring model in this table. GitHub Copilot native (GA, Powerful). 1M context, text + image input, adaptive reasoning. Priced at $10.00 / $50.00 per MTok input/output ($0.25 cached — down from Fable 5's $1.00; 97.5% cache discount; $12.50 cache write). Uses the newer Claude tokenizer (~30% more tokens than pre-4.7 models). Too new for Arena rankings. See the [GitHub Copilot models & pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing) and the [AA model page](https://artificialanalysis.ai/models/claude-fable-5-1).

²² **GPT-6 Astra** (released September 3, 2026) — OpenAI's frontier model, available as `gpt-6-astra` through the API and as a GitHub Copilot native model (GA, Powerful). AA Intelligence Index **61.2** (launch comparison, methodology v4.1.1); 1M context, text + image input, text output, and reasoning. Standard pricing is $10.00 / $1.00 / $50.00 per 1M input/cached/output tokens, for a modeled ~$10.00 session and ~$0.163 CPI. It is too new for Arena rankings. See the [GPT-6 Astra announcement](https://openai.com/index/gpt-6-astra/), [OpenAI API pricing](https://developers.openai.com/api/docs/pricing), and [OpenAI model documentation](https://developers.openai.com/api/docs/models/gpt-6-astra).

For footnotes, sources, and detailed notes (cache behavior, tiered pricing, free quotas) see [docs/pricing.md](docs/pricing.md). For a copy-paste config containing **all providers at once**, see [docs/example-config.md](docs/example-config.md).

> **👤 Personal picks** —
>
> For current OpenRouter AA scores, **GPT-6 Astra** leads the OpenAI comparison benchmarks, while **Claude Fable 5.1** remains highest on the live AA composite. The two rankings measure different things.
>
> - **GLM 5.3 Flash** — current AA **46.2**, ~$0.13/session, vision-capable, and the best low-cost scored option in this table.
> - **GPT-5.6 Luna** — current AA **43.4**, ~$0.22/session, vision-capable, and the cheapest current OpenAI scored row.
> - **DeepSeek V4 Flash 0731** — current AA **40.8**, ~$0.35/session at peak direct rates, text-only and inexpensive for coding-heavy work.
> - **GPT-6 Astra** — current OpenRouter AA **54.7**, ~$10.00/session, while OpenAI reports leading results on Terminal-Bench 4.0, ARC-AGI-3, FrontierMath Tier 4, and AutomationBench. Use it for the hardest planning and research tasks.
> - **Qwen 3.8 Max (0902)** — current AA **46.9**, ~$1.60/session, 1M context, and vision-capable; a practical multimodal planning choice.
>
> **MiniMax M3** (current AA **35.7**, ~$0.27/session) remains the simplest direct custom-endpoint option: no proxy or extension, vision, 1M context, and tool calling.

## Companion tools

> **ℹ️ These are third-party tools — not built into the custom endpoints or proxies in this repo.** Each one must be installed, configured, and (where applicable) billed for **separately**, directly with its own provider. Nothing here is bundled, proxied, or auto-configured by `copilot-custom-endpoint` or the per-model setups above. The entries below are just pointers to tools the author has found useful alongside the model configs.

These work alongside the providers above and fill gaps that VS Code's built-in tool surface doesn't cover natively.

### 🎬 [Video Context MCP](https://www.videocontextmcp.com/) — _video understanding for AI coding assistants_

VS Code's built-in `view_image` tool only accepts **static images** (PNG, JPG, GIF, WebP). That's a hard wall if you want to ask an AI assistant about a screen recording, a screencast, a product demo, or any other video. Several vision-capable models in this repo actually accept video natively — but VS Code's tool pipeline never gets the chance to forward it.

**Video Context MCP** is a small MCP server that bridges that gap. It works with **GitHub Copilot, Cursor, and Claude Code** out of the box, and:

- **Extracts frames** from local files or remote URLs (no `ffmpeg` gymnastics required).
- **Routes them through a multi-provider fallback chain** — `Gemini → GLM 4.6V Flash → Qwen3.7-plus → Kimi K2.6 → MiMo-V2.5`.
- **Answers natural-language questions** about the video grounded in actual frames: "what does the speaker click in the last 30 seconds?", "summarize the demo", "find the frame where the error appears".
- **Extras:** timestamp search, audio transcription with speaker diarization, and video metadata (resolution, duration, codec).

### 🪣 [Bitbucket MCP](https://bitbucketmcp.tugudush.com/) — _secure, read-only Bitbucket access for VS Code Copilot, Cursor, and Claude Code_

GitHub ships a first-party MCP server (and it's even bundled into Copilot), so asking "what's open in my org's repos / show me PR #123" works seamlessly on github.com. **Bitbucket has no equivalent** — Atlassian hasn't shipped one — which leaves Bitbucket Cloud users copy-pasting PR URLs, diffs, and file contents into chat by hand.

**Bitbucket MCP** is a small MCP server that closes that gap. It works with **VS Code GitHub Copilot, Cursor, and Claude Code** out of the box, and:

- **38 tools across 8 categories** — repositories, pull requests, branches & commits, diffs & comparisons, CI/CD pipelines, issues, code search, and users.
- **Read-only by design** — `makeRequest()` blocks all non-GET requests at runtime, so no write, delete, or modify operation is possible.
- **Token-friendly output** — every tool supports `text`, `json`, and `toon` (Token-Oriented Object Notation) formats; `toon` cuts LLM token consumption by 30–60% on large PR/commit lists.
- **JMESPath filtering** on all 38 tools, so you can trim responses (e.g. only open PRs, or just title + author) before they hit the model.
- **One-call PR context** — `bb_get_context` bundles PR metadata, diffstat, CI statuses, and comments in a single request.
- **Drop-in install** — `npm install -g @tugudush/bitbucket-mcp` plus a short `.vscode/mcp.json` entry, authenticated with a Bitbucket API token + your Atlassian email.

## Need help?

- **Per-model issues:** check the troubleshooting section at the bottom of each model's doc.
- **Repo questions / bugs:** open an issue on GitHub.

## Repo layout

```
.
├── docs/models/<provider>-<model>.md   # Per-model setup guides (the real docs)
├── proxy/                              # Local compatibility shims
├── tests/                              # Test assets
└── debug_log/                          # Runtime logs (git-ignored)
```

## Want to add a new model?

1. Create `docs/models/<provider>-<model>.md` with a clear walkthrough.
2. If the provider needs request rewriting, add a proxy under `proxy/`.
3. Submit a PR.

## Limitations

- **Chat only.** Inline completions, semantic search, and next-edit suggestions still need a GitHub-hosted model.
- Each proxy is tuned for a specific provider family. Don't point the Kimi proxy at an arbitrary OpenAI-compatible endpoint.

## Support

If this helped, consider sponsoring or donating:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/tugudush)

**Solana (SOL)**

```
CWZccD3Ny3XotFZtnkcyzP3hapmu3ExknN1PF4rEvP3u
```
