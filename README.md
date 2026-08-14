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

| Model                            | Provider  | Needs proxy?           | Vision                 | Setup guide                                                                                                                                 |
| -------------------------------- | --------- | ---------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kimi K3 / K2.7 Code / K2.6**   | Moonshot  | **Yes**                | ✅                     | [Manual setup](docs/models/kimi.md)                                                                                                         |
| **MiMo V2.5**                    | Xiaomi    | Optional (recommended) | ✅                     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) ★ / [Manual setup](docs/models/mimo.md) |
| **MiMo V2.5 Pro**                | Xiaomi    | Optional (recommended) | ❌                     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) ★ / [Manual setup](docs/models/mimo.md) |
| **Qwen 3.7 Plus**                | DashScope | Optional (recommended) | ✅                     | [Manual setup](docs/models/qwen.md)                                                                                                         |
| **Qwen 3.7 Max**                 | DashScope | Optional (recommended) | ❌                     | [Manual setup](docs/models/qwen.md)                                                                                                         |
| **Qwen 3.8 Max**                 | DashScope | Optional (recommended) | ✅                     | [Manual setup](docs/models/qwen.md)                                                                                                         |
| **MiniMax M3**                   | MiniMax   | No                     | ✅                     | [Extension](https://github.com/tugudush/minimax-copilot) ★ / [Manual setup](docs/models/minimax.md)                                         |
| **GLM 5.2 / 5.1**                | Z.ai      | No                     | ✅ via extension proxy | [Manual setup](docs/models/glm.md)                                                                                                          |
| **GLM 5V Turbo**                 | Z.ai      | No                     | ✅                     | [Manual setup](docs/models/glm.md)                                                                                                          |
| **DeepSeek V4 Pro / Flash 0731** | DeepSeek  | No (uses an extension) | ❌ (0731)              | [Extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) / [setup notes](docs/models/deepseek.md)   |

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
   - **DeepSeek V4 Flash** — if you have the [DeepSeek V4 for Copilot Chat](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) extension installed (fastest, ~$0.10/session).
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

All prices are **USD per 1M tokens** (non-cached). 1 AI credit = $0.01. To convert to AI credits, multiply by 100 (e.g., $5.00/1M = 500 credits/1M). Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

| Model                      | Provider  | Cost per intelligence | Intelligence Score | Est. session | Vision | Context window |
| -------------------------- | --------- | --------------------- | ------------------ | ------------ | ------ | -------------- |
| **DeepSeek V4 Flash 0731** | DeepSeek  | **~$0.0019**          | **51.8**           | ~$0.10       | ❌     | 1M             |
| **MiMo V2.5**              | Xiaomi    | **~$0.0026**          | **38.0**           | ~$0.10       | ✅     | 1M             |
| **GPT-5.6 Luna**           | OpenAI    | **~$0.0042**          | **52.3**           | ~$0.22       | ✅     | 1M             |
| **MiniMax M3**             | MiniMax   | **~$0.0060**          | **45.4**           | ~$0.27       | ✅     | 1M             |
| **DeepSeek V4 Pro**        | DeepSeek  | **~$0.0066**          | **45.3**           | ~$0.30       | ✅     | 1M             |
| **MiMo V2.5 Pro**          | Xiaomi    | **~$0.0070**          | **42.9**           | ~$0.30       | ❌     | 1M             |
| **Qwen 3.7 Plus** ¹²       | DashScope | **~$0.0074**          | **39.4**           | ~$0.29       | ✅     | 1M             |
| **MiniMax M3 Priority**⁴   | MiniMax   | **~$0.0090**          | **45.4**           | ~$0.41       | ✅     | 1M             |
| **Gemini 3.7 Flash** ¹³    | Google    | **~$0.013**           | **56**             | ~$0.75       | ✅     | 1M             |
| **Qwen 3.6 Plus** ¹⁶       | DashScope | **~$0.014**           | **40.0**           | ~$0.55       | ✅     | 1M             |
| **Gemini 3.6 Flash** ⁸     | Google    | **~$0.015**           | **51.6**           | ~$0.75       | ✅     | 1M             |
| **Kimi K2.6**              | Moonshot  | **~$0.020**           | **45.0**           | ~$0.88       | ✅     | 262K           |
| **GPT-5.4 mini**           | OpenAI    | **~$0.020**           | **40.9**           | ~$0.83       | ❌     | 400K           |
| **Kimi K2.7 Code**         | Moonshot  | **~$0.020**           | **43.0**           | ~$0.88       | ✅     | 262K           |
| **GLM 5.2**                | Z.ai      | **~$0.022**           | **52.6**           | ~$1.14       | ❌     | 1M             |
| **Qwen 3.7 Max** ¹²        | DashScope | **~$0.025**           | **46.7**           | ~$1.18       | ❌     | 1M             |
| **Grok 4.6** ¹⁴            | xAI       | **~$0.026**           | **61**             | ~$1.60       | ✅     | 500K           |
| **Qwen 3.8 Max** ¹⁰        | DashScope | **~$0.028**           | **58.1**           | ~$1.60       | ✅     | 1M             |
| **GLM 5.1**                | Z.ai      | **~$0.028**           | **41.0**           | ~$1.14       | ❌     | 200K           |
| **GLM 5V Turbo**           | Z.ai      | **~$0.029**           | **35.0** ³         | ~$1.00       | ✅     | 200K           |
| **Grok 4.5** ¹¹            | xAI       | **~$0.029**           | **55.8**           | ~$1.60       | ✅     | 500K           |
| **Gemini 3.5 Flash**       | Google    | **~$0.032**           | **52.0**           | ~$1.65       | ✅     | 1M             |
| **GPT-5.6 Terra**          | OpenAI    | **~$0.039**           | **56.6**           | ~$2.20       | ✅     | 1M             |
| **Gemini 3.1 Pro**         | Google    | **~$0.046**           | **47.7**           | ~$2.20       | ✅     | 1M             |
| **Kimi K3** ⁶              | Moonshot  | **~$0.050**           | **59.7**           | ~$3.00       | ✅     | 1M             |
| **GPT-5.4**                | OpenAI    | **~$0.052**           | **53.1**           | ~$2.75       | ✅     | 1M             |
| **Claude Sonnet 5** ⁵      | Anthropic | **~$0.054**           | **55.3**           | ~$3.00       | ✅     | 1M             |
| **Claude Sonnet 4.6**      | Anthropic | **~$0.062**           | **48.4**           | ~$3.00       | ✅     | 1M             |
| **Claude Opus 5** ⁹        | Anthropic | **~$0.079**           | **63.1**           | ~$5.00       | ✅     | 1M             |
| **Claude Opus 4.8**        | Anthropic | **~$0.087**           | **57.3**           | ~$5.00       | ✅     | 1M             |
| **GPT-5.6 Sol**            | OpenAI    | **~$0.090**           | **60.9**           | ~$5.50       | ✅     | 1M             |
| **Claude Opus 4.7**        | Anthropic | **~$0.091**           | **55.0**           | ~$5.00       | ✅     | 1M             |
| **GPT-5.5**                | OpenAI    | **~$0.098**           | **56.3**           | ~$5.50       | ✅     | 1M             |
| **Claude Fable 5** ¹⁵      | Anthropic | **~$0.161**           | **62.1**           | ~$10.00      | ✅     | 1M             |

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

¹⁵ **Claude Fable 5** (Anthropic, released June 9, 2026) is now a **GitHub Copilot native** model (GA, Powerful). AA Intelligence Index **62.1** (#3/188) confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-fable-5). **#1 in all four Arena leaderboards** (Text, Agent, Code, Overall). 1M context, text + image input, adaptive reasoning. Priced at $10.00 / $50.00 per MTok input/output ($1.00 cached, 90% cache discount). Uses the newer Claude tokenizer (~30% more tokens than pre-4.7 models). See the [GitHub Copilot models & pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

¹⁶ **Qwen 3.6 Plus** (DashScope, released April 2, 2026) — AA Intelligence Index **40.0**. Priced at $0.50 / $3.00 per MTok input/output ($0.05 cached). 1M context, text + image + video input. **Deprecated** in favor of Qwen 3.7 Plus.

For footnotes, sources, and detailed notes (cache behavior, tiered pricing, free quotas) see [docs/pricing.md](docs/pricing.md). For a copy-paste config containing **all providers at once**, see [docs/example-config.md](docs/example-config.md).

> **👤 Personal picks** —
>
> For serious coding work, **GPT-5.6 Luna** and **DeepSeek V4 Flash 0731** are now the top value picks:
>
> - **GPT-5.6 Luna** (Copilot native) — scores **52.3**, ~$0.22/session, vision-capable. Higher intelligence than MiniMax M3 (45.4) at a lower modeled cost, with reduced AI-credit consumption after OpenAI's July price cut.
> - **DeepSeek V4 Flash 0731** (extension) — scores **51.8** after the AA v4.1.1 benchmark refresh, ~$0.10/session — the best intelligence-per-dollar in the lineup. Text-only, so pair it with a vision model when you need images.
> - **Gemini 3.7 Flash** (Copilot native, new August 13) — scores **56** at ~$0.75/session under promotional pricing. The best-value Google model in Copilot: it beats Gemini 3.5 Flash (52.0) and Grok 4.5 (55.8) on intelligence at roughly half the session cost, with 1M context, full multimodal input, and AA's fastest output speed. A strong upgrade pick if you use Google models.
>
> **MiniMax M3** (45.4, ~$0.27/session) is still the best **direct** custom-endpoint option — no proxy or extension, vision, 1M context, strong coding — but it no longer leads on value now that DeepSeek V4 Flash scores higher at a third of the cost. Pick M3 when you want a plug-and-play custom endpoint with vision.
>
> For **plan mode / architecture & design thinking**, **Qwen 3.8 Max**, **Kimi K3**, **GLM 5.2**, **GPT-5.6 Luna**, and **DeepSeek V4 Flash 0731** are worth considering:
>
> - **Qwen 3.8 Max** — scores **58.1** (#5 overall, the #2 custom-endpoint model) — the default planning pick. Near-flagship intelligence at ~$1.60/session (roughly half Kimi K3's cost), with 1M context and vision. Strong for whole-codebase planning, architecture, and large spec review.
> - **Kimi K3** — new flagship. Highest intelligence score among custom-endpoint models (**59.7**, #4 overall). Best for complex reasoning, long-horizon planning, and architecture decisions when you want the absolute best — but at ~$3.00/session it's ~2× Qwen 3.8 Max for +1.6 points, so **reserve it for hard problems**.
> - **GLM 5.2** — scores **52.6**, reasoning-heavy planning at a lower price. 1M lossless context, ideal for whole-codebase planning and large spec review. ~$1.14/session is ~4× MiniMax M3, so **not a daily driver for agent mode** — reserve it for planning, then hand implementation off to a cheaper model.
> - **GPT-5.6 Luna** (Copilot native) — scores **52.3** and is now the cheapest 50+ model. OpenAI cut its API price to $0.20/$1.20 per 1M input/output tokens; in Copilot, the equivalent benefit is lower AI-credit consumption, while your subscription price and monthly allowance stay unchanged. Ideal for high-quality planning on a budget.
> - **DeepSeek V4 Flash 0731** (extension) — scores **51.8** at ~$0.10/session — the budget planning pick. Text-only, so pair it with a vision model for design review, but for reasoning-heavy planning it delivers near-premium scores at a fraction of the cost.
>
> Cheaper alternatives for simpler tasks:
>
> - **Qwen 3.7 Plus** — ~$0.29/session after the August 7 price cut, 39.4 score, vision-capable — the best cost-per-intelligence value in the custom-endpoint lineup
> - **MiMo V2.5** — ~$0.10/session, 38.0 score (solid fallback, vision-capable)

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
