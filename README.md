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

| Model                      | Provider   | Needs proxy?            | Vision | Setup guide                                                                                                                                 |
| -------------------------- | ---------- | ----------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Kimi K3**                | Moonshot   | **Yes**                 | ✅     | [Manual setup](docs/models/kimi.md)                                                                                                         |
| **MiMo V2.5**              | Xiaomi     | Optional (recommended)  | ✅     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) ★ / [Manual setup](docs/models/mimo.md) |
| **MiMo V2.5 Pro**          | Xiaomi     | Optional (recommended)  | ❌     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) ★ / [Manual setup](docs/models/mimo.md) |
| **Qwen 3.8 Max (0803)**    | OpenRouter | Optional (experimental) | ✅     | [Snapshot/proxy setup](docs/models/qwen.md#optional-openrouter-snapshot-proxy)                                                              |
| **Qwen 3.8 Max (0902)**    | DashScope  | Optional (recommended)  | ✅     | [Manual setup](docs/models/qwen.md)                                                                                                         |
| **MiniMax M3**             | MiniMax    | No                      | ✅     | [Extension](https://github.com/tugudush/minimax-copilot) ★ / [Manual setup](docs/models/minimax.md)                                         |
| **GLM 5.3 Flash**          | Z.ai       | No                      | ✅     | [Manual setup](docs/models/glm.md)                                                                                                          |
| **GLM 5.3**                | Z.ai       | No                      | ❌     | [Manual setup](docs/models/glm.md)                                                                                                          |
| **GLM 5V Turbo**           | Z.ai       | No                      | ✅     | [Manual setup](docs/models/glm.md)                                                                                                          |
| **DeepSeek V4 Flash 0731** | DeepSeek   | No (uses an extension)  | ❌     | [Extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) / [setup notes](docs/models/deepseek.md)   |
| **DeepSeek V4 Pro 0813**   | DeepSeek   | No (uses an extension)  | ❌     | [Extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) / [setup notes](docs/models/deepseek.md)   |

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

All prices are **USD per 1M tokens** (non-cached). 1 AI credit = $0.01. To convert to AI credits, multiply by 100 (e.g., $5.00/1M = 500 credits/1M). Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns. DeepSeek V4 estimates use peak rates; official off-peak rates are half. The current AA values come from OpenRouter's September 10 model metadata and ranking card; **every pricing cell comes from first-party provider pricing or GitHub Copilot's official billing table, never OpenRouter.** The OpenRouter ranking card places unversioned Qwen3.8 Max at **53.4 (#2)**, while the exact 0902 API metadata row is **40.3**. Qwen Cloud PAYG pricing remains **$2 / $0.25 implicit cache / $6** for Qwen3.8 Max; its separate Token Plan is not the PAYG rate table. Current corrections include OpenAI GPT-5.6 Sol at **$4 / $0.40 / $20** and Anthropic Sonnet 5 at **$2 / $0.20 / $10**.

| Model                      | Provider  | Cost per intelligence | Intelligence Score | Est. session | Vision | Context window |
| -------------------------- | --------- | --------------------- | ------------------ | ------------ | ------ | -------------- |
| **GLM 5.3 Flash**          | Z.ai      | **~$0.0030**          | **41.9**           | ~$0.13       | ✅     | 1M             |
| **MiMo V2.5**              | Xiaomi    | **~$0.0045**          | **22.3**           | ~$0.10       | ✅     | 1M             |
| **GPT-5.6 Luna**           | OpenAI    | **~$0.0059**          | **37.5**           | ~$0.22       | ✅     | 1M             |
| **MiniMax M3**             | MiniMax   | **~$0.0091**          | **29.6**           | ~$0.27       | ✅     | 1M             |
| **DeepSeek V4 Flash 0731** | DeepSeek  | **~$0.0101**          | **34.5**           | ~$0.35       | ❌     | 1M             |
| **MiMo V2.5 Pro**          | Xiaomi    | **~$0.0114**          | **26.4**           | ~$0.30       | ❌     | 1M             |
| **MiniMax M3 Priority**    | MiniMax   | **~$0.0139**          | **29.6**           | ~$0.41       | ✅     | 1M             |
| **Gemini 3.8 Flash**       | Google    | **~$0.0182**          | **41.2**           | ~$0.75       | ✅     | 1M             |
| **GLM 5.3**                | Z.ai      | **~$0.0254**          | **44.9**           | ~$1.14       | ❌     | 1M             |
| **DeepSeek V4 Pro 0813**   | DeepSeek  | **~$0.0292**          | **36.3**           | ~$1.06       | ❌     | 1M             |
| **Qwen 3.8 Max (0803)**    | DashScope | **~$0.0300**          | **53.4**           | ~$1.60       | ✅     | 1M             |
| **Grok 4.6**               | xAI       | **~$0.0360**          | **44.4**           | ~$1.60       | ✅     | 500K           |
| **Qwen 3.8 Max (0902)**    | DashScope | **~$0.0397**          | **40.3**           | ~$1.60       | ✅     | 1M             |
| **GPT-5.6 Terra**          | OpenAI    | **~$0.0520**          | **42.3**           | ~$2.20       | ✅     | 1M             |
| **Claude Sonnet 5**        | Anthropic | **~$0.0521**          | **38.4**           | ~$2.00       | ✅     | 1M             |
| **Kimi K3**                | Moonshot  | **~$0.0685**          | **43.8**           | ~$3.00       | ✅     | 1M             |
| **GPT-5.6 Sol**            | OpenAI    | **~$0.0849**          | **47.1**           | ~$4.00       | ✅     | 1M             |
| **Claude Opus 5**          | Anthropic | **~$0.0986**          | **50.7**           | ~$5.00       | ✅     | 1M             |
| **Claude Opus 4.8**        | Anthropic | **~$0.1190**          | **42.0**           | ~$5.00       | ✅     | 1M             |
| **Claude Fable 5.1**       | Anthropic | **~$0.1873**          | **53.4**           | ~$10.00      | ✅     | 1M             |
| **GPT-6 Astra**            | OpenAI    | **~$0.1894**          | **52.8**           | ~$10.00      | ✅     | 1M             |
| **Claude Fable 5**         | Anthropic | **~$0.2012**          | **49.7**           | ~$10.00      | ✅     | 1M             |
| **GLM 5V Turbo**           | Z.ai      | —                     | —                  | ~$1.00       | ✅     | 200K           |

> Detailed pricing, benchmark provenance, and model-specific notes live in [docs/pricing.md](docs/pricing.md) and [docs/benchmarks.md](docs/benchmarks.md). This page stays focused on setup and model selection. For a copy-paste config containing **all providers at once**, see [docs/example-config.md](docs/example-config.md).

> **👤 Personal picks** —
>
> - **GLM 5.3 Flash** — the lowest cost per intelligence in this table (~$0.0030), at about $0.13/session with vision.
> - **GPT-5.6 Luna** — the lowest cost per intelligence among Copilot-native scored models (~$0.0059), at about $0.22/session with vision.

## Companion tools

> **ℹ️ These are third-party tools — not built into the custom endpoints or proxies in this repo.** Each one must be installed, configured, and (where applicable) billed for **separately**, directly with its own provider. Nothing here is bundled, proxied, or auto-configured by `copilot-custom-endpoint` or the per-model setups above. The entries below are just pointers to tools the author has found useful alongside the model configs.

These work alongside the providers above and fill gaps that VS Code's built-in tool surface doesn't cover natively.

### 🎬 [Video Context MCP](https://www.videocontextmcp.com/) — _video understanding for AI coding assistants_

VS Code's built-in `view_image` tool only accepts **static images** (PNG, JPG, GIF, WebP). That's a hard wall if you want to ask an AI assistant about a screen recording, a screencast, a product demo, or any other video. Several vision-capable models in this repo actually accept video natively — but VS Code's tool pipeline never gets the chance to forward it.

**Video Context MCP** is a small MCP server that bridges that gap. It works with **GitHub Copilot, Cursor, and Claude Code** out of the box, and:

- **Extracts frames** from local files or remote URLs (no `ffmpeg` gymnastics required).
- **Routes them through a multi-provider fallback chain** — `Gemini → GLM 4.6V Flash → Qwen3.8-max → MiMo-V2.5`.
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
