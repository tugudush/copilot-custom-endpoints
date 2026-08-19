# Pricing

> **Updated:** August 19, 2026 — **GLM 5.3** added (footnote ¹⁸): Z.ai's new flagship (August 18, 2026), AA Intelligence Index **59.5**, priced identically to GLM 5.2 ($1.40 / $0.26 / $4.40). August 17: **GLM 5.2** OpenRouter promo refreshed (footnote ⁴): NovitaAI cut to 48% off; Open Sail Research now cheapest at $0.50 / $3.15. August 15: **Claude Fable 5** and **Qwen 3.6 Plus** added (footnotes ¹⁶–¹⁷); **Grok 4.5 / 4.6** and **Claude Fable 5** are now **GitHub Copilot native** (footnotes ¹², ¹⁴, ¹⁶). **Grok 4.6** and **Gemini 3.7 Flash** added August 14 (footnotes ¹⁴–¹⁵). **Gemini 3.6 Flash promotional price cut** to $0.75 / $3.75 (footnote ⁹). **Qwen 3.7 Max / 3.7 Plus price cuts** (see footnote ¹³). OpenRouter is running limited-time promos on GPT-5.6 Terra/Luna (⁸), GLM 5.2 (⁴), GLM 5.1, MiMo V2.5/V2.5 Pro, and MiniMax M3.

> **⏰ June 1, 2026 — GitHub Copilot switched to usage-based billing (AI Credits) today.**
>
> Before this change, Copilot used **premium request-based billing** — each model had its own multiplier (e.g., GPT-5.5 = 7.5×, Claude Sonnet 4.6 = 1×, Haiku 4.5 = 0.33×), and every request consumed `multiplier × 1` from your monthly premium-request allowance. Now **every interaction burns AI credits** based on actual token consumption. Agent mode and complex multi-file tasks consume significantly more tokens than simple Q&A, which means your 7,000 Pro+ credits can disappear fast if you're using frontier models.
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

All models are listed together below, sorted by Cost per intelligence ascending (lower is better). Models without a Cost per intelligence are ordered by estimated session cost ascending. Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

| Model                      | Provider  | Cost per intelligence | Intelligence Score | Input (per 1M)                | Cached input                  | Output (per 1M)               | Est. session | Context window |
| -------------------------- | --------- | --------------------- | ------------------ | ----------------------------- | ----------------------------- | ----------------------------- | ------------ | -------------- |
| **DeepSeek V4 Flash 0731** | DeepSeek  | **~$0.0019**          | **51.8**           | $0.14                         | $0.0028                       | $0.28                         | ~$0.10       | 1M             |
| **MiMo V2.5**              | Xiaomi    | **~$0.0026**          | **38.0**           | $0.14                         | $0.0028                       | $0.28                         | ~$0.10       | 1M             |
| **GPT-5.6 Luna**           | OpenAI    | **~$0.0042**          | **52.3**           | $0.20                         | $0.02                         | $1.20                         | ~$0.22       | 1M             |
| **MiniMax M3**             | MiniMax   | **~$0.0060**          | **45.4**           | $0.60 (≤512K) / $1.20 (>512K) | $0.12 (≤512K) / $0.24 (>512K) | $2.40 (≤512K) / $4.80 (>512K) | ~$0.27       | 1M             |
| **DeepSeek V4 Pro**        | DeepSeek  | **~$0.0066**          | **45.3**           | $0.435                        | $0.003625                     | $0.87                         | ~$0.30       | 1M             |
| **MiMo V2.5 Pro**          | Xiaomi    | **~$0.0070**          | **42.9**           | $0.435                        | $0.0036                       | $0.87                         | ~$0.30       | 1M             |
| **Qwen 3.7 Plus** ¹³       | DashScope | **~$0.0074**          | **39.4**           | $0.32 (≤256K) / $0.40 (>256K) | $0.064                        | $1.28 (≤256K) / $1.60 (>256K) | ~$0.29       | 1M             |
| **MiniMax M3 Priority**⁵   | MiniMax   | **~$0.0090**          | **45.4**           | $0.90 (≤512K) / $1.80 (>512K) | $0.18 (≤512K) / $0.36 (>512K) | $3.60 (≤512K) / $7.20 (>512K) | ~$0.41       | 1M             |
| **Gemini 3.7 Flash** ¹⁵    | Google    | **~$0.013**           | **56**             | $0.75                         | $0.075                        | $3.75                         | ~$0.75       | 1M             |
| **Qwen 3.6 Plus** ¹⁷       | DashScope | **~$0.014**           | **40.0**           | $0.50                         | $0.05                         | $3.00                         | ~$0.55       | 1M             |
| **Gemini 3.6 Flash** ⁹     | Google    | **~$0.015**           | **51.6**           | $0.75                         | $0.075                        | $3.75                         | ~$0.75       | 1M             |
| **GLM 5.3** ¹⁸             | Z.ai      | **~$0.019**           | **59.5**           | $1.40                         | $0.26                         | $4.40                         | ~$1.14       | 1M             |
| **Kimi K2.6**              | Moonshot  | **~$0.020**           | **45.0**           | $0.95                         | $0.16                         | $4.00                         | ~$0.88       | 256K           |
| **GPT-5.4 mini**           | OpenAI    | **~$0.020**           | **40.9**           | $0.75                         | $0.075                        | $4.50                         | ~$0.83       | 400K           |
| **Kimi K2.7 Code**         | Moonshot  | **~$0.020**           | **43.0**           | $0.95                         | $0.19                         | $4.00                         | ~$0.88       | 262K           |
| **GLM 5.2** ⁴              | Z.ai      | **~$0.022**           | **52.6**           | $1.40                         | $0.26                         | $4.40                         | ~$1.14       | 1M             |
| **Qwen 3.7 Max** ¹³        | DashScope | **~$0.025**           | **46.7**           | $1.475 (≤1M)                  | $0.295                        | $4.425 (≤1M)                  | ~$1.18       | 1M             |
| **Grok 4.6** ¹⁴            | xAI       | **~$0.026**           | **61**             | $2.00                         | $0.50                         | $6.00                         | ~$1.60       | 500K           |
| **Qwen 3.8 Max** ¹¹        | DashScope | **~$0.028**           | **58.1**           | $2.00                         | $0.25                         | $6.00                         | ~$1.60       | 1M             |
| **GLM 5.1**                | Z.ai      | **~$0.028**           | **41.0**           | $1.40                         | $0.26                         | $4.40                         | ~$1.14       | 200K           |
| **GLM 5V Turbo**           | Z.ai      | **~$0.029**           | **35.0** ³         | $1.20                         | $0.24                         | $4.00                         | ~$1.00       | 200K           |
| **Grok 4.5** ¹²            | xAI       | **~$0.029**           | **55.8**           | $2.00                         | $0.50                         | $6.00                         | ~$1.60       | 500K           |
| **Gemini 3.5 Flash**       | Google    | **~$0.032**           | **52.0**           | $1.50                         | $0.15                         | $9.00                         | ~$1.65       | 1M             |
| **GPT-5.6 Terra**          | OpenAI    | **~$0.039**           | **56.6**           | $2.00                         | $0.20                         | $12.00                        | ~$2.20       | 1M             |
| **Gemini 3.1 Pro**         | Google    | **~$0.046**           | **47.7**           | $2.00¹                        | $0.20                         | $12.00¹                       | ~$2.20       | 1M             |
| **Kimi K3** ⁷              | Moonshot  | **~$0.050**           | **59.7**           | $3.00                         | $0.30                         | $15.00                        | ~$3.00       | 1M             |
| **GPT-5.4**                | OpenAI    | **~$0.052**           | **53.1**           | $2.50                         | $0.25                         | $15.00                        | ~$2.75       | 1M             |
| **Claude Sonnet 5** ⁶      | Anthropic | **~$0.054**           | **55.3**           | $3.00                         | $0.30                         | $15.00                        | ~$3.00       | 1M             |
| **Claude Sonnet 4.6**      | Anthropic | **~$0.062**           | **48.4**           | $3.00                         | $0.30                         | $15.00                        | ~$3.00       | 1M             |
| **Claude Opus 5** ¹⁰       | Anthropic | **~$0.079**           | **63.1**           | $5.00                         | $0.50                         | $25.00                        | ~$5.00       | 1M             |
| **Claude Opus 4.8**        | Anthropic | **~$0.087**           | **57.3**           | $5.00                         | $0.50                         | $25.00                        | ~$5.00       | 1M             |
| **GPT-5.6 Sol**            | OpenAI    | **~$0.090**           | **60.9**           | $5.00                         | $0.50                         | $30.00                        | ~$5.50       | 1M             |
| **Claude Opus 4.7**        | Anthropic | **~$0.091**           | **55.0**           | $5.00                         | $0.50                         | $25.00                        | ~$5.00       | 1M             |
| **GPT-5.5**                | OpenAI    | **~$0.098**           | **56.3**           | $5.00                         | $0.50                         | $30.00                        | ~$5.50       | 1M             |
| **Claude Fable 5** ¹⁶      | Anthropic | **~$0.161**           | **62.1**           | $10.00                        | $1.00                         | $50.00                        | ~$10.00      | 1M             |

¹ Gemini 3.1 Pro pricing applies to prompts ≤200K tokens.

³ Score is an **estimate** from Artificial Analysis (labelled "independent evaluation forthcoming"). Not a confirmed run of the full evaluation suite. As of August 7, 2026, **GLM 5V Turbo (35.0)** is the only remaining estimate in this table — MiMo V2.5 is now a measured 38.0.

⁴ GLM 5.2 was Z.ai's previous flagship (superseded by **GLM 5.3** on August 18, 2026 — see footnote ¹⁸). AA Intelligence Index score (**52.6**) and pricing of **$1.40** (input), **$0.26** (cached), and **$4.40** (output) per 1M tokens confirmed on its [model page](https://artificialanalysis.ai/models/glm-5-2). Session cost is identical to GLM 5.1 (~$1.14). As of August 17, 2026, OpenRouter's cheapest provider is **Open Sail Research** at **$0.50 / $3.15** per 1M (listed price, no promo); NovitaAI's temporary promo has been reduced from 52% to **48% off** (effective **$0.7238 / $2.275** per 1M, cache reads $0.1344).

⁵ **MiniMax M3 Priority** is not a separate model — it is the same `MiniMax-M3` weights invoked with `"service_tier": "priority"` in the request body. Priority costs **1.5× Standard** across input, output, and cache reads (list prices shown above; effective rates after the standing 50% off are $0.45/$1.80/$0.09 ≤512K and $0.90/$3.60/$0.18 >512K), in exchange for **priority admission** (faster responses, fewer failures during MiniMax peak hours — typically 15:00–17:30 weekdays). Capabilities, context window (1M, guaranteed 512K), vision, tool calling, rate limits (200 RPM / 10M TPM), and thinking modes are identical to Standard. To enable it on the custom-endpoint entry, add `"service_tier": "priority"` to the `requestBody` of the single `MiniMax-M3` block (and remove it to go back to Standard). See [docs/models/minimax.md](models/minimax.md#4-m3-priority-tier-optional) and [docs/research/minimax-m3-priority.md](research/minimax-m3-priority.md) for the full breakdown.

⁶ **Claude Sonnet 5** has introductory pricing of **$2.00 / $0.20 / $10.00** (input / cached / output) through **August 31, 2026**, after which the standard pricing of $3.00 / $0.30 / $15.00 shown above takes effect. See [Anthropic's pricing page](https://claude.com/pricing) for the latest.

⁷ **Kimi K3** was released on **July 16, 2026**. 2.8T parameters (open-source, weights by July 27, 2026). 1M context window. Always-thinking reasoning model — uses `reasoning_effort` (not the K2.x `thinking` parameter). Fixed sampling: `temperature=1`, `top_p=0.95`. Pricing is flat (no tiering by context length). See [Kimi K3 pricing](https://platform.kimi.ai/docs/pricing/chat-k3) and the [Artificial Analysis model page](https://artificialanalysis.ai/models/kimi-k3).

⁸ **GPT-5.6** pricing is **$0.20 / $0.02 / $1.20** for Luna, **$2.00 / $0.20 / $12.00** for Terra, and **$5.00 / $0.50 / $30.00** for Sol (input / cached input / output per 1M tokens). OpenAI reduced Luna by 80% and Terra by 20% on July 30, 2026; Sol is unchanged. OpenAI bills cache writes at 1.25x the uncached input rate for GPT-5.6 and later. The Batch API provides an additional 50% discount for asynchronous jobs. All three tiers have a 1M-token context window and support text + image input. See [OpenAI's GPT-5.6 price update](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/) and [GPT-5.6 announcement](https://openai.com/index/gpt-5-6/). **As of August 7, 2026, OpenRouter is running a limited-time 50% promotional discount on Terra and Luna** (effective **$0.10 / $0.60** per 1M for Luna and **$1.00 / $6.00** per 1M for Terra, input/output) on top of the list prices above — this is a temporary third-party promo, not an OpenAI list-price change.

⁹ **Gemini 3.6 Flash** was released on **July 21, 2026**. AA Intelligence Index score (**51.6**) confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/gemini-3-6-flash). **Promotional pricing** of $0.75 input / $0.075 cached / $3.75 output per MTok applies through **December 31, 2026** (in both Copilot and the Gemini API); from **January 1, 2027** the standard $1.50 / $0.15 / $7.50 rates apply. See [Google's pricing page](https://ai.google.dev/pricing).

¹⁰ **Claude Opus 5** was released on **July 24, 2026**. AA Intelligence Index score (**63.1**) confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-opus-5). Pricing is $5.00 / $0.50 / $25.00 per MTok input/cached/output (same as Opus 4.8). 1M context window, text + image input, adaptive reasoning. Also available in Fast mode ($10/$50 per MTok input/output) and Batch ($2.50/$12.50 per MTok input/output). Uses the newer Claude tokenizer (~30% more tokens than pre-4.7 models). See [Anthropic's Opus 5 announcement](https://www.anthropic.com/news/claude-opus-5).

¹¹ **Qwen 3.8 Max** (`qwen3.8-max`) launched on **August 3, 2026**. Qwen Cloud lists $2.00 input / $6.00 output per 1M tokens, $0.25 implicit-cache input, $2.50 explicit-cache creation, and $0.17 explicit-cache reads. The modeled session cost is ~$1.60 using 10K input + 2K output tokens per turn across 50 turns. It has a 1M context window, 131K maximum output, and text/image/video input. Artificial Analysis has published an Intelligence Index of **58.1** for this model (**#9/185**; listed as a rounded **58** on its [model page](https://artificialanalysis.ai/models/qwen3-8-max)); OpenRouter metadata also reports Coding **71.8** and Agentic **58.4**. Pricing is unchanged as of August 7, 2026. See the [Qwen Cloud model page](https://www.qwencloud.com/models/qwen3.8-max), [AA model page](https://artificialanalysis.ai/models/qwen3-8-max), and [OpenRouter model page](https://openrouter.ai/qwen/qwen3.8-max).

¹² **Grok 4.5** (xAI, released **July 8, 2026**) is now a **GitHub Copilot native** model (GA, Versatile). AA Intelligence Index **55.8** (high), Coding **72.4**, Agentic **48.9**. 500K context window, text + image input. Priced at $2.00 / $0.50 / $6.00 per 1M input/cached/output (75% cache discount; Copilot long-context >200K tier $4.00 / $1.00 / $12.00). See the [GitHub Copilot models & pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

¹³ **Qwen 3.7 price cuts** (verified August 7, 2026): `qwen3.7-max` dropped from $2.50 / $7.50 to **$1.475 / $4.425** per 1M input/output (cached $0.295; >256K input tier $1.844), and `qwen3.7-plus` dropped from $0.40 / $1.60 to **$0.32 / $1.28** per 1M (cached $0.064; >256K tier $0.40 / $1.60).

¹⁴ **Grok 4.6** (xAI/SpaceXAI, released **August 12, 2026**) is now a **GitHub Copilot native** model (GA). AA Intelligence Index **61** (high reasoning preset, #6/188). 500K context window, text + image input, text output. Priced at $2.00 / $0.50 / $6.00 per 1M input/cached/output (75% cache discount). See the [AA model page](https://artificialanalysis.ai/models/grok-4-6), the [xAI announcement](https://x.ai/news/grok-4-6), and the [GitHub Copilot models & pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

¹⁵ **Gemini 3.7 Flash** (Google, released **August 13, 2026**) — GitHub Copilot native (GA, Versatile) at the same promotional rates as 3.6 Flash. AA Intelligence Index **56** (high reasoning preset, #17/188). **Promotional pricing** of $0.75 / $0.075 / $3.75 per 1M input/cached/output through **December 31, 2026**, then $1.50 / $0.15 / $7.50 from January 1, 2027. 1M context window, text + image + speech + video input, and the fastest model on AA's leaderboard (340 t/s). See the [AA model page](https://artificialanalysis.ai/models/gemini-3-7-flash), [Google's Gemini page](https://deepmind.google/models/gemini/), and [GitHub Copilot pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

¹⁶ **Claude Fable 5** (Anthropic, released **June 9, 2026**) is now a **GitHub Copilot native** model (GA, Powerful; Anthropic's new flagship tier, above Opus). AA Intelligence Index **62.1** (**#3/188**; AA page lists a rounded **62** on its [model page](https://artificialanalysis.ai/models/claude-fable-5)). Currently **#1 in Text, Agent, Code, and Overall Arena**. 1M context window, text + image input, adaptive reasoning. Priced at **$10.00 / $1.00 / $50.00** per 1M input/cached/output (90% cache discount; cache write $12.50). Uses the newer Claude tokenizer (~30% more tokens than pre-4.7 models). See the [GitHub Copilot models & pricing page](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing).

¹⁷ **Qwen 3.6 Plus** (DashScope, released **April 2, 2026**) — AA Intelligence Index **40.0**. Priced at **$0.50 / $0.05 / $3.00** per 1M input/cached/output (≤256K input tier; explicit cache read $0.05). 1M context window, text + image + video input, reasoning model. **Deprecated** — superseded by Qwen 3.7 Plus; AA marks it deprecated and no longer refreshes performance benchmarks beyond the default workload. See the [AA model page](https://artificialanalysis.ai/models/qwen3-6-plus).

¹⁸ **GLM 5.3** is Z.ai's newest flagship (released **August 18, 2026**) — same base model as GLM 5.2 with post-training improvements (~50% coding gain over 5.2 on Z.ai Code Bench). AA Intelligence Index **59.5** (OpenRouter's AA-sourced benchmark; AA's [model page](https://artificialanalysis.ai/models/glm-5-3) lists a rounded **60**, **#8/182**), Coding **74.8**, Agentic **59.1**. Pricing is identical to GLM 5.2: **$1.40** input, **$0.26** cached, **$4.40** output per 1M tokens (so the modeled session cost is the same, ~$1.14). 1M context window, 753B params, text-only. Always-thinking: `thinking.type` only supports `enabled` and `reasoning_effort` accepts `low` / `high` / `max` (default `max`). See the [Z.ai model page](https://docs.z.ai/guides/llm/glm-5.3).

Cost per intelligence = estimated session cost ÷ Intelligence Index score. Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

> **Notes:**
>
> - **DeepSeek V4** input pricing shown is the **cache miss** price. Cache hits are significantly cheaper ($0.0028/M for Flash, $0.003625/M for Pro).
> - **MiMo** input pricing shown is the **cache miss** price. Cache hits are essentially free for V2.5 Pro ($0.0036/M, ~120× cheaper) and V2.5 ($0.0028/M, ~50× cheaper). A Xiaomi price cut took effect on 2026-05-27.
> - **Anthropic (Claude)** models also have a cache write cost ($6.25/MTok for Opus, $3.75/MTok for Sonnet, $1.25/MTok for Haiku). Opus 4.7+, Opus 5, Sonnet 5, and Fable 5 use a new tokenizer that produces approximately 30% more tokens for the same text.
> - **OpenAI** models support cached input at 0.1× base input rate.
> - **Qwen** models use **tiered pricing** — determined by total input tokens per request. Prices above are for non-thinking mode.
> - **Kimi** official tables list **Cache Hit before Cache Miss** (opposite order to our table). The rows below transpose them so "Input" = cache miss and "Cached input" = cache hit.
> - **Kimi K2.6** pricing is from the **Moonshot platform** (direct). Via DashScope: $0.89 input / $3.71 output.
> - **DashScope** offers a **free quota** of 1M input + 1M output tokens per model, valid for 90 days.
> - **MiniMax M3** uses **tiered pricing** — input price doubles above 512K input tokens. Cache hits are priced at 20% of the input rate ($0.12/M ≤512K, $0.24/M >512K). A **permanent 50% off** discount applies to all MiniMax-M3 pay-as-you-go usage (Standard and Priority tiers), making the effective rates half the list prices above.
> - **MiniMax M3 Priority** is not a separate model — it is the same `MiniMax-M3` weights invoked with `"service_tier": "priority"` in the request body. Priority costs **1.5× Standard** across input, output, and cache reads, in exchange for **priority admission** (faster responses, fewer failures during MiniMax peak hours — typically 15:00–17:30 weekdays). Capabilities, context window (1M, guaranteed 512K), vision, tool calling, rate limits (200 RPM / 10M TPM), and thinking modes are identical to Standard. See [docs/research/minimax-m3-priority.md](research/minimax-m3-priority.md) for the full breakdown.
> - **GLM** models support prompt caching — cache hits are priced at $0.26/M for 5.3, 5.2, and 5.1; $0.24/M for 5V Turbo.
> - **MiMo** offers a **Token Plan** subscription model with discounted rates and a free cache-writing promotion.
> - For typical Copilot chat usage (short-to-medium prompts), you'll almost always fall in the lowest pricing tier.

> **How long does 7,000 credits last?** A Pro+ subscriber running 50-turn sessions could afford roughly **13 GPT-5.5 sessions** or **23 Opus sessions** per month — or mix and match. (Multiply session cost by 100 to convert to AI credits.)

> Prices last verified: August 19, 2026. Always check the official pages for the latest rates:
>
> - [GitHub Copilot models & pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing)
> - [OpenAI pricing](https://openai.com/api/pricing/)
> - [OpenAI GPT-5.6 announcement](https://openai.com/index/gpt-5-6/)
> - [OpenAI GPT-5.6 price update](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/)
> - [Anthropic (Claude) pricing](https://platform.claude.com/docs/en/about-claude/pricing)
> - [Google Gemini pricing](https://ai.google.dev/pricing)
> - [DashScope pricing](https://www.alibabacloud.com/help/en/model-studio/billing-for-model-studio)
> - [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing)
> - [MiMo pricing](https://mimo.mi.com/docs/en-US/pricing)
> - [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview)
> - [Z.ai (GLM) pricing](https://docs.z.ai/guides/overview/pricing)
