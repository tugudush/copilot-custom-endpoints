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

| Model                       | Provider  | Needs proxy?           | Vision           | Setup guide                                                                                                                                      |
| --------------------------- | --------- | ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **MiMo V2.5**               | Xiaomi    | Optional (recommended) | ✅               | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) ★ / [Manual setup](docs/models/mimo.md)      |
| **MiMo V2.5 Pro**           | Xiaomi    | Optional (recommended) | ❌               | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) ★ / [Manual setup](docs/models/mimo.md)      |
| **Kimi K2.7 Code / K2.6**   | Moonshot  | **Yes**                | ✅               | [Manual setup](docs/models/kimi.md)                                                                                                              |
| **Qwen 3.7 Plus**           | DashScope | Optional (recommended) | ✅               | [Manual setup](docs/models/qwen.md)                                                                                                              |
| **Qwen 3.7 Max**            | DashScope | Optional (recommended) | ❌               | [Manual setup](docs/models/qwen.md)                                                                                                              |
| **MiniMax M3**              | MiniMax   | No                     | ✅               | [Extension](https://github.com/tugudush/minimax-copilot) ★ / [Manual setup](docs/models/minimax.md)                                              |
| **MiniMax M3 Priority**     | MiniMax   | No                     | ✅               | [Extension](https://github.com/tugudush/minimax-copilot) ★ / [Manual setup](docs/models/minimax.md#m3-priority-tier)                             |
| **GLM 5.2**                 | Z.ai      | No                     | ✅ via extension | [Extension](https://marketplace.visualstudio.com/items?itemName=ikaros.glm-for-vscode-copilot) ★ / [Manual setup](docs/models/glm.md)            |
| **GLM 5.1**                 | Z.ai      | No                     | ✅ via extension | [Extension](https://marketplace.visualstudio.com/items?itemName=yijiazhen-qi.glm-for-github-copilot-chat) ★ / [Manual setup](docs/models/glm.md) |
| **GLM 5V Turbo**            | Z.ai      | No                     | ✅               | [Manual setup](docs/models/glm.md)                                                                                                               |
| **DeepSeek V4 Pro / Flash** | DeepSeek  | No (uses an extension) | ✅ via proxy     | [Extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot)                                                 |

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

| Model                    | Provider  | Cost per intelligence | Intelligence Score | Est. session | Vision | Context window |
| ------------------------ | --------- | --------------------- | ------------------ | ------------ | ------ | -------------- |
| **DeepSeek V4 Flash**    | DeepSeek  | **~$0.0025**          | **40.3**           | ~$0.10       | ✅     | 1M             |
| **MiMo V2.5**            | Xiaomi    | **~$0.0025**          | **40** ³           | ~$0.10       | ✅     | 1M             |
| **MiniMax M3**           | MiniMax   | **~$0.0061**          | **44.4**           | ~$0.27       | ✅     | 1M             |
| **DeepSeek V4 Pro**      | DeepSeek  | **~$0.0068**          | **44.3**           | ~$0.30       | ✅     | 1M             |
| **MiMo V2.5 Pro**        | Xiaomi    | **~$0.0072**          | **42.2**           | ~$0.30       | ❌     | 1M             |
| **Qwen 3.7 Plus**        | DashScope | **~$0.0092**          | **39.0**           | ~$0.36       | ✅     | 1M             |
| **MiniMax M3 Priority**⁴ | MiniMax   | **~$0.0092**          | **44.4**           | ~$0.41       | ✅     | 1M             |
| **Gemini 3 Flash**       | Google    | **~$0.020**           | **27.0** ³         | ~$0.55       | ✅     | 173K           |
| **Kimi K2.6**            | Moonshot  | **~$0.021**           | **42.8**           | ~$0.88       | ✅     | 262K           |
| **Kimi K2.7 Code**       | Moonshot  | **~$0.021**           | **42.0**           | ~$0.88       | ✅     | 262K           |
| **GPT-5.4 mini**         | OpenAI    | **~$0.021**           | **40.0**           | ~$0.83       | ❌     | 400K           |
| **GPT-5.6 Luna**         | OpenAI    | **~$0.021**           | **51.2**           | ~$1.10       | ✅     | 1M             |
| **GLM 5.2**              | Z.ai      | **~$0.022**           | **51.0**           | ~$1.14       | ❌     | 1M             |
| **GLM 5.1**              | Z.ai      | **~$0.028**           | **40.2**           | ~$1.14       | ❌     | 200K           |
| **GLM 5V Turbo**         | Z.ai      | **~$0.029**           | **34.0** ³         | ~$1.00       | ✅     | 200K           |
| **Gemini 3.5 Flash**     | Google    | **~$0.033**           | **50.2**           | ~$1.65       | ✅     | 1M             |
| **Qwen 3.7 Max**         | DashScope | **~$0.043**           | **46.0**           | ~$2.00       | ❌     | 1M             |
| **Gemini 3.1 Pro**       | Google    | **~$0.047**           | **46.5**           | ~$2.20       | ✅     | 1M             |
| **GPT-5.6 Terra**        | OpenAI    | **~$0.050**           | **55.0**           | ~$2.75       | ✅     | 1M             |
| **GPT-5.4**              | OpenAI    | **~$0.054**           | **51.4**           | ~$2.75       | ✅     | 1M             |
| **Claude Sonnet 5** ⁵    | Anthropic | **~$0.057**           | **53.0**           | ~$3.00       | ✅     | 1M             |
| **Claude Sonnet 4.6**    | Anthropic | **~$0.064**           | **47.2**           | ~$3.00       | ✅     | 1M             |
| **Claude Opus 4.8**      | Anthropic | **~$0.090**           | **55.7**           | ~$5.00       | ✅     | 1M             |
| **Claude Opus 4.7**      | Anthropic | **~$0.093**           | **53.5**           | ~$5.00       | ✅     | 1M             |
| **GPT-5.6 Sol**          | OpenAI    | **~$0.093**           | **58.9**           | ~$5.50       | ✅     | 1M             |
| **GPT-5.5**              | OpenAI    | **~$0.10**            | **54.8**           | ~$5.50       | ✅     | 1M             |
| **Raptor mini**          | GitHub    | —                     | —                  | ~$0.33       | ❌     | 264K           |
| **MAI-Code-1-Flash** ²   | Microsoft | —                     | —                  | ~$0.83       | ❌     | —              |
| **Claude Haiku 4.5**     | Anthropic | —                     | —                  | ~$1.00       | ❌     | 160K           |
| **GPT-5.3-Codex**        | OpenAI    | —                     | —                  | ~$2.28       | ❌     | 400K           |

¹ Gemini 3.1 Pro pricing applies to prompts ≤200K tokens.

² MAI-Code-1-Flash is a continuously improving model — performance and behavior may evolve over time as new checkpoints are released.

³ Score is an **estimate** from Artificial Analysis (labelled "independent evaluation forthcoming"). Not a confirmed run of the full evaluation suite.

⁴ **MiniMax M3 Priority** is the same `MiniMax-M3` weights invoked with `"service_tier": "priority"` in the request body — **not a separate model**. Costs **1.5× Standard** (effective post-50%-off rates: $0.45 / $1.80 / $0.09 per 1M for input/output/cached ≤512K) in exchange for **priority admission** (faster responses, fewer failures during MiniMax peak hours). Capabilities, context window, vision, tools, rate limits, and thinking modes are identical to Standard. See [docs/research/minimax-m3-priority.md](docs/research/minimax-m3-priority.md).

⁵ **Claude Sonnet 5** has introductory pricing of **$2.00 / $10.00** per MTok (input/output) through **August 31, 2026**. Standard pricing of $3.00 / $15.00 shown above takes effect September 1, 2026. Released June 30, 2026 — Arena rankings pending. AA Intelligence Index score of **53.0** confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-sonnet-5).

⁶ **GPT-5.6** launched July 9, 2026. Sol, Terra, and Luna cost $5/$30, $2.50/$15, and $1/$6 per 1M input/output tokens respectively; all support image input and 1M context. Benchmark details and cache-write pricing are maintained in [docs/pricing.md](docs/pricing.md).

For footnotes, sources, and detailed notes (cache behavior, tiered pricing, free quotas) see [docs/pricing.md](docs/pricing.md). For a copy-paste config containing **all providers at once**, see [docs/example-config.md](docs/example-config.md).

> **👤 Personal picks** —
>
> For serious coding work, **MiniMax M3** is my top recommendation:
>
> - Highest intelligence score (44.4) among affordable models
> - Only ~$0.27/session with vision + 1M context
> - No local proxy required — works direct
>   **DeepSeek V4 Pro** is a strong backup — nearly identical intelligence (44.3 vs 44.4) and cost (~$0.0068 vs ~$0.0061 per intelligence point), but noticeably faster in practice.
>
> For **plan mode / architecture & design thinking**, **GLM 5.2** is worth the premium:
>
> - Highest intelligence score in the table (**51.0**) — best for reasoning-heavy planning
> - 1M lossless context, ideal for whole-codebase planning and large spec review
> - ~$1.14/session is ~4× MiniMax M3, so **not a daily driver for agent mode** — reserve it for planning, then hand implementation off to a cheaper model.
>
> Cheaper alternatives for simpler tasks:
>
> - **DeepSeek V4 Flash** — ~$0.10/session, 40.3 score (solid fallback)
> - **MiMo V2.5** — ~$0.10/session, 40 score (solid fallback, vision-capable)

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
