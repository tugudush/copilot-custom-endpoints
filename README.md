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

| Model                        | Provider   | Needs proxy?            | Vision | Setup guide                                                                                                                               |
| ---------------------------- | ---------- | ----------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Kimi K3.1 Pro**            | Moonshot   | **Yes**                 | ✅     | [Manual setup](docs/models/kimi.md)                                                                                                       |
| **Kimi K3**                  | Moonshot   | **Yes**                 | ✅     | [Manual setup](docs/models/kimi.md)                                                                                                       |
| **MiMo V2.6 Pro**            | Xiaomi     | **Yes**                 | ✅     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) / [Manual setup](docs/models/mimo.md) |
| **MiMo V2.6 Flash**          | Xiaomi     | **Yes**                 | ✅     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) / [Manual setup](docs/models/mimo.md) |
| **MiMo V2.6 Pro UltraSpeed** | Xiaomi     | **Yes**                 | ✅     | [Extension](https://marketplace.visualstudio.com/items?itemName=sdmapvstool.xiaomimimo-for-copilot) / [Manual setup](docs/models/mimo.md) |
| **Qwen 3.8 Max (0803)**      | OpenRouter | Optional (experimental) | ✅     | [Snapshot/proxy setup](docs/models/qwen.md#optional-openrouter-snapshot-proxy)                                                            |
| **Qwen 3.8 Max (0902)**      | DashScope  | Optional (recommended)  | ✅     | [Manual setup](docs/models/qwen.md)                                                                                                       |
| **MiniMax M3.1 Flash**       | MiniMax    | No                      | ✅     | [Manual setup](docs/models/minimax.md)                                                                                                    |
| **MiniMax M3**               | MiniMax    | No                      | ✅     | [Extension](https://github.com/tugudush/minimax-copilot) ★ / [Manual setup](docs/models/minimax.md)                                       |
| **GLM 5.3 Flash**            | Z.ai       | No                      | ✅     | [Manual setup](docs/models/glm.md)                                                                                                        |
| **GLM 5.3**                  | Z.ai       | No                      | ❌     | [Manual setup](docs/models/glm.md)                                                                                                        |
| **DeepSeek V4.1 Flash 1017** | DeepSeek   | No (uses an extension)  | ✅     | [Extension](https://marketplace.visualstudio.com/items?itemName=Vizards.deepseek-v4-for-copilot) / [setup notes](docs/models/deepseek.md) |

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
   - **GLM 5.3 Flash** — if you have [GLM configured](docs/models/glm.md) (cheapest custom-endpoint option, ~$0.13/session).
   - **GPT-6 Luna** — if it is available through your native Copilot models (fast, ~$0.10/session).
   - **MiMo V2.6 Flash** — if you already have Xiaomi MiMo configured (low-cost multimodal option, ~$0.10/session).
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

All prices are **USD per 1M tokens** (non-cached). 1 AI credit = $0.01; multiply a dollar amount by 100 to convert it to credits (for example, $5.00/1M = 500 credits/1M).

The table is sorted by **Cost per intelligence**, lowest first. This is a value metric calculated as:

`estimated session cost / Intelligence Score`

It approximates the cost of one point on the AA Intelligence Index under the common workload below. A lower number means more benchmark intelligence per estimated dollar; it is not an overall quality ranking or a provider billing quote.

**Est. session** uses ~10K input + ~2K output tokens per turn over 50 turns: 500K input tokens plus 100K output tokens total. For each model, the estimate is:

`(0.5 × input price) + (0.1 × output price)`

For example, GLM 5.3 Flash is `(0.5 × $0.15) + (0.1 × $0.50) = $0.125`, shown as `~$0.13`. Cached-input discounts are not included. Actual costs vary with context length, output length, caching, pricing tiers, promotions, and provider billing. DeepSeek estimates use peak rates; official off-peak rates are half.

The current AA values are **Artificial Analysis Intelligence Index v5.0** composites taken from OpenRouter’s model metadata; this snapshot was re-based from v4.3.2 on October 31, 2026, so its scores are not comparable with earlier revisions of this table. **Every pricing cell comes from first-party provider pricing or GitHub Copilot’s official billing table, never OpenRouter.** AA’s current leaderboard no longer publishes a v5.0 composite for nine older rows — GPT-5.6 Luna, Qwen 3.8 Max (0803), Grok 4.6, GPT-6 Sol, Claude Sonnet 5, GPT-5.6 Terra, GPT-5.6 Sol, Claude Opus 5, and Claude Fable 5 — so their Cost per intelligence shows `—` and they are listed after the scored rows by estimated session cost. The Qwen ranking-card figure of **53.4 (#3)** is a v4.3.2 result; the exact 0902 metadata row is **33.6** under v5.0, and Qwen Cloud PAYG pricing remains **$2 / $0.25 implicit cache / $6**. This snapshot records Gemini 3.8 Flash, Gemini 4 Argon, Grok 4.7, GPT-6 Sol, GPT-6.1 Sol, GPT-6.1 Terra, GPT-6 Luna, Claude Opus 5.5, Claude Sonnet 5.5, and Claude Haiku 5.5 as **Copilot-native** models. **GPT-6.1 Terra** (released October 2026, in Copilot since October 26) enters at **51** on flat pricing of **$1 / $0.05 cache read / $5** per 1M tokens with vision and a 1M context, which puts it at **~$0.0196** per intelligence point — about half of GPT-6.1 Sol’s **~$0.0367**. Gemini 4 Argon (released October 13, 2026) scores **50.4** on Google’s introductory pricing of **$2 / $0.10 implicit cache / $10** per 1M tokens, which doubles to **$4 / $0.20 / $20** on December 1, 2026. Claude Haiku 5.5 (released October 7, 2026) scores **36.2** and, at **~$0.0028** per intelligence point, is still the lowest cost per intelligence in the table; MiMo V2.6 Flash (**26.7**) is still the cheapest custom-endpoint option at **~$0.0037**. Muse Spark 1.3 (Meta, released September 2, 2026) scores **36.4** on Meta Model API pricing of **$1.25 / $0.15 cached input / $4.25** per 1M tokens; its day-one `muse-spark-1.3-contributor` SKU is excluded from this snapshot because Meta may train future models on those prompts and completions. DeepSeek’s **V4.1-Flash-1017** build (released October 17, 2026) scores **32** at unchanged peak rates ($0.30 / $0.006 / $1.20), or **~$0.0084** per intelligence point. MiniMax’s **MiniMax-M3.1-Flash** (announced October 19, 2026) scores **28.9** on flat pricing of **$0.15 / $0.015 cache read / $0.60** per 1M tokens — no prompt-length tiers and no `service_tier` options — which puts it at **~$0.0047** per intelligence point. Kimi K3.1 Pro (**46**) and GPT-6.1 Sol (**54.5**) remain served at their existing rates.

| Model                        | Provider  | Cost per intelligence | Intelligence Score | Est. session | Vision | Context window |
| ---------------------------- | --------- | --------------------- | ------------------ | ------------ | ------ | -------------- |
| **Claude Haiku 5.5**         | Anthropic | **~$0.0028**          | **36.2**           | ~$0.10       | ✅     | 1M             |
| **GPT-6 Luna**               | OpenAI    | **~$0.0036**          | **27.8**           | ~$0.10       | ✅     | 1M             |
| **MiMo V2.6 Flash**          | Xiaomi    | **~$0.0037**          | **26.7**           | ~$0.10       | ✅     | 1M             |
| **GLM 5.3 Flash**            | Z.ai      | **~$0.0045**          | **27.8**           | ~$0.13       | ✅     | 1M             |
| **MiniMax M3.1 Flash**       | MiniMax   | **~$0.0047**          | **28.9**           | ~$0.14       | ✅     | 1M             |
| **DeepSeek V4.1 Flash 1017** | DeepSeek  | **~$0.0084**          | **32**             | ~$0.27       | ✅     | 1M             |
| **MiMo V2.6 Pro**            | Xiaomi    | **~$0.0102**          | **29.9**           | ~$0.30       | ✅     | 1M             |
| **MiniMax M3**               | MiniMax   | **~$0.0144**          | **18.7**           | ~$0.27       | ✅     | 1M             |
| **GPT-6.1 Terra**            | OpenAI    | **~$0.0196**          | **51**             | ~$1.00       | ✅     | 1M             |
| **Gemini 3.8 Flash**         | Google    | **~$0.0246**          | **30.5**           | ~$0.75       | ✅     | 1M             |
| **Muse Spark 1.3**           | Meta      | **~$0.0288**          | **36.4**           | ~$1.05       | ✅     | 1M             |
| **GLM 5.3**                  | Z.ai      | **~$0.0360**          | **31.7**           | ~$1.14       | ❌     | 1M             |
| **GPT-6.1 Sol**              | OpenAI    | **~$0.0367**          | **54.5**           | ~$2.00       | ✅     | 1M             |
| **Claude Sonnet 5.5**        | Anthropic | **~$0.0369**          | **54.2**           | ~$2.00       | ✅     | 1M             |
| **Gemini 4 Argon**           | Google    | **~$0.0397**          | **50.4**           | ~$2.00       | ✅     | 1M             |
| **Kimi K3.1 Pro**            | Moonshot  | **~$0.0435**          | **46**             | ~$2.00       | ✅     | 1M             |
| **Grok 4.7**                 | xAI       | **~$0.0457**          | **35**             | ~$1.60       | ✅     | 500K           |
| **Qwen 3.8 Max (0902)**      | DashScope | **~$0.0476**          | **33.6**           | ~$1.60       | ✅     | 1M             |
| **Claude Opus 5.5**          | Anthropic | **~$0.0685**          | **58.4**           | ~$4.00       | ✅     | 1M             |
| **MiMo V2.6 Pro UltraSpeed** | Xiaomi    | **~$0.1018**          | **29.9**           | ~$3.05       | ✅     | 1M             |
| **Kimi K3**                  | Moonshot  | **~$0.1724**          | **17.4**           | ~$3.00       | ✅     | 1M             |
| **GPT-6 Astra**              | OpenAI    | **~$0.1757**          | **56.9**           | ~$10.00      | ✅     | 1M             |
| **Claude Fable 5.1**         | Anthropic | **~$0.2012**          | **49.7**           | ~$10.00      | ✅     | 1M             |
| **GPT-5.6 Luna**             | OpenAI    | —                     | —                  | ~$0.22       | ✅     | 1M             |
| **Qwen 3.8 Max (0803)**      | DashScope | —                     | —                  | ~$1.60       | ✅     | 1M             |
| **Grok 4.6**                 | xAI       | —                     | —                  | ~$1.60       | ✅     | 500K           |
| **GPT-6 Sol**                | OpenAI    | —                     | —                  | ~$2.00       | ✅     | 1M             |
| **Claude Sonnet 5**          | Anthropic | —                     | —                  | ~$2.00       | ✅     | 1M             |
| **GPT-5.6 Terra**            | OpenAI    | —                     | —                  | ~$2.20       | ✅     | 1M             |
| **GPT-5.6 Sol**              | OpenAI    | —                     | —                  | ~$4.00       | ✅     | 1M             |
| **Claude Opus 5**            | Anthropic | —                     | —                  | ~$5.00       | ✅     | 1M             |
| **Claude Fable 5**           | Anthropic | —                     | —                  | ~$10.00      | ✅     | 1M             |

> `MiMo V2.6 Pro UltraSpeed` uses the MiMo V2.6 Pro benchmark score because it is the same-quality latency tier; no independent composite is published. `MiniMax M3.1 Flash` is a separate model with its own flat rates; MiniMax's API rejects `service_tier` for it. `Kimi K3.1 Pro` supersedes K3 at a lower price ($2 / $0.20 / $10 vs $3 / $0.30 / $15 per 1M); K3 remains served. `MiMo V2.6 Flash`'s composite (26.7) is OpenRouter's Artificial Analysis v5.0 value; Xiaomi's published launch benchmarks for it are recorded in [docs/benchmarks.md](docs/benchmarks.md).
> GPT-6 Sol, GPT-6.1 Sol, and Luna use standard rates up to 272K input tokens; requests above that threshold have higher input/cache and output rates. GitHub Copilot also bills cache writes separately. Plan access differs: GPT-6 Sol and GPT-6.1 Sol require Pro+ or higher, Luna and Claude Sonnet 5.5 are available from Pro, Claude Opus 5.5 requires Pro+ or higher, and Claude Haiku 5.5 is available on every paid plan (Pro through Enterprise). Gemini 4 Argon is Copilot-native for Pro+, Max, Business, and Enterprise (not Pro); Google's $2 / $0.10 implicit cache / $10 per 1M introductory pricing (output includes thinking tokens, implicit caching only) is guaranteed only through November 30, 2026 and doubles to $4 / $0.20 / $20 on December 1, 2026.
> Claude Haiku 5.5 is the only current Claude model priced by prompt length: $0.10 / $0.01 cache read / $0.50 per 1M for prompts up to 100,000 tokens, and $0.50 / $0.05 / $2.50 above that. The table shows the sub-100K rates, which Anthropic says cover ~90% of Haiku-class requests.
> Muse Spark 1.3 is closed and API-only on the Meta Model API (`muse-spark-1.3`); the 12–21× cheaper `muse-spark-1.3-contributor` SKU is excluded from this snapshot because Meta may use prompts and completions to train future models. Meta reports audio understanding is degraded versus 1.2.

> Detailed pricing, benchmark provenance, and model-specific notes live in [docs/pricing.md](docs/pricing.md) and [docs/benchmarks.md](docs/benchmarks.md). This page stays focused on setup and model selection. For a copy-paste config containing **all providers at once**, see [docs/example-config.md](docs/example-config.md).

> **👤 Personal picks** —
>
> - **Claude Haiku 5.5** — the lowest cost per intelligence in this table (~$0.0028) and the best value among Copilot-native models, at about $0.10/session with vision.
> - **MiMo V2.6 Flash** — the lowest cost per intelligence among custom-endpoint models (~$0.0037), at about $0.10/session with vision.
> - **GLM 5.3 Flash** — the runner-up among custom-endpoint models (~$0.0045), at about $0.13/session with vision.

## Companion tools

> **ℹ️ These are third-party tools — not built into the custom endpoints or proxies in this repo.** Each one must be installed, configured, and (where applicable) billed for **separately**, directly with its own provider. Nothing here is bundled, proxied, or auto-configured by `copilot-custom-endpoint` or the per-model setups above. The entries below are just pointers to tools the author has found useful alongside the model configs.

These work alongside the providers above and fill gaps that VS Code's built-in tool surface doesn't cover natively.

### 🎬 [Video Context MCP](https://www.videocontextmcp.com/) — _video understanding for AI coding assistants_

VS Code's built-in `view_image` tool only accepts **static images** (PNG, JPG, GIF, WebP). That's a hard wall if you want to ask an AI assistant about a screen recording, a screencast, a product demo, or any other video. Several vision-capable models in this repo actually accept video natively — but VS Code's tool pipeline never gets the chance to forward it.

**Video Context MCP** is a small MCP server that bridges that gap. It works with **GitHub Copilot, Cursor, and Claude Code** out of the box, and:

- **Extracts frames** from local files or remote URLs (no `ffmpeg` gymnastics required).
- **Routes them through a multi-provider fallback chain** — `Gemini → GLM 4.6V Flash → Qwen3.8-max`.
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

The current AA values are **Artificial Analysis Intelligence Index v5.0** composites taken from OpenRouter’s model metadata (re-based from v4.3.2 on October 31, 2026); **every pricing cell comes from first-party provider pricing or GitHub Copilot’s official billing table, never OpenRouter.** Nine older rows have no v5.0 composite on AA’s current leaderboard and therefore show `—` for Cost per intelligence. Qwen Cloud PAYG pricing remains **$2 / $0.25 implicit cache / $6** for Qwen3.8 Max; its separate Token Plan is not the PAYG rate table. This snapshot records Gemini 3.8 Flash, Gemini 4 Argon, Grok 4.7, GPT-6 Sol, GPT-6.1 Sol, GPT-6.1 Terra, GPT-6 Luna, Claude Opus 5.5, Claude Sonnet 5.5, and Claude Haiku 5.5 as **Copilot-native** models.

- **Chat only.** Inline completions, semantic search, and next-edit suggestions still need a GitHub-hosted model.
- Each proxy is tuned for a specific provider family. Don't point the Kimi proxy at an arbitrary OpenAI-compatible endpoint.

## Support

If this helped, consider sponsoring or donating:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-GitHub-pink?logo=github)](https://github.com/sponsors/tugudush)

**Solana (SOL)**

```
CWZccD3Ny3XotFZtnkcyzP3hapmu3ExknN1PF4rEvP3u
```
