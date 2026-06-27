# Pricing

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

| Model                  | Provider  | Cost per intelligence | Intelligence Score | Input (per 1M)                | Cached input                  | Output (per 1M)               | Est. session | Context window |
| ---------------------- | --------- | --------------------- | ------------------ | ----------------------------- | ----------------------------- | ----------------------------- | ------------ | -------------- |
| **DeepSeek V4 Flash**  | DeepSeek  | **~$0.0025**          | **40.3**           | $0.14                         | $0.0028                       | $0.28                         | ~$0.10       | 1M             |
| **MiMo V2.5**          | Xiaomi    | **~$0.0025**          | **40** ³           | $0.14                         | $0.0028                       | $0.28                         | ~$0.10       | 1M             |
| **MiniMax M3**         | MiniMax   | **~$0.0061**          | **44.4**           | $0.60 (≤512K) / $1.20 (>512K) | $0.12 (≤512K) / $0.24 (>512K) | $2.40 (≤512K) / $4.80 (>512K) | ~$0.27       | 1M             |
| **DeepSeek V4 Pro**    | DeepSeek  | **~$0.0068**          | **44.3**           | $0.435                        | $0.003625                     | $0.87                         | ~$0.30       | 1M             |
| **MiMo V2.5 Pro**      | Xiaomi    | **~$0.0072**          | **42.2**           | $0.435                        | $0.0036                       | $0.87                         | ~$0.30       | 1M             |
| **Qwen 3.7 Plus**      | DashScope | **~$0.0092**          | **39.0**           | $0.40 (≤256K) / $1.20 (>256K) | —                             | $1.60 (≤256K) / $4.80 (>256K) | ~$0.36       | 1M             |
| **Gemini 3 Flash**     | Google    | **~$0.020**           | **27.0** ³         | $0.50                         | $0.05                         | $3.00                         | ~$0.55       | 173K           |
| **Kimi K2.6**          | Moonshot  | **~$0.021**           | **42.8**           | $0.95                         | $0.16                         | $4.00                         | ~$0.88       | 256K           |
| **Kimi K2.7 Code**     | Moonshot  | **~$0.021**           | **42.0**           | $0.95                         | $0.19                         | $4.00                         | ~$0.88       | 262K           |
| **GPT-5.4 mini**       | OpenAI    | **~$0.021**           | **40.0**           | $0.75                         | $0.075                        | $4.50                         | ~$0.83       | 400K           |
| **GLM 5.2** ⁴          | Z.ai      | **~$0.022**           | **51.0**           | $1.40                         | $0.26                         | $4.40                         | ~$1.14       | 1M             |
| **GLM 5.1**            | Z.ai      | **~$0.028**           | **40.2**           | $1.40                         | $0.26                         | $4.40                         | ~$1.14       | 200K           |
| **GLM 5V Turbo**       | Z.ai      | **~$0.029**           | **34.0** ³         | $1.20                         | $0.24                         | $4.00                         | ~$1.00       | 200K           |
| **Gemini 3.5 Flash**   | Google    | **~$0.033**           | **50.2**           | $1.50                         | $0.15                         | $9.00                         | ~$1.65       | 1M             |
| **Qwen 3.7 Max**       | DashScope | **~$0.043**           | **46.0**           | $2.50 (≤1M)                   | —                             | $7.50 (≤1M)                   | ~$2.00       | 1M             |
| **Gemini 3.1 Pro**     | Google    | **~$0.047**           | **46.5**           | $2.00¹                        | $0.20                         | $12.00¹                       | ~$2.20       | 1M             |
| **GPT-5.3-Codex**      | OpenAI    | **~$0.052**           | **44.0** ³         | $1.75                         | $0.175                        | $14.00                        | ~$2.28       | 400K           |
| **GPT-5.4**            | OpenAI    | **~$0.054**           | **51.4**           | $2.50                         | $0.25                         | $15.00                        | ~$2.75       | 1M             |
| **Claude Sonnet 4.6**  | Anthropic | **~$0.064**           | **47.2**           | $3.00                         | $0.30                         | $15.00                        | ~$3.00       | 1M             |
| **Claude Opus 4.8**    | Anthropic | **~$0.090**           | **55.7**           | $5.00                         | $0.50                         | $25.00                        | ~$5.00       | 1M             |
| **Claude Opus 4.7**    | Anthropic | **~$0.093**           | **53.5**           | $5.00                         | $0.50                         | $25.00                        | ~$5.00       | 1M             |
| **GPT-5.5**            | OpenAI    | **~$0.10**            | **54.8**           | $5.00                         | $0.50                         | $30.00                        | ~$5.50       | 1M             |
| **Raptor mini**        | GitHub    | —                     | —                  | $0.25                         | $0.025                        | $2.00                         | ~$0.33       | 264K           |
| **MAI-Code-1-Flash** ² | Microsoft | —                     | —                  | $0.75                         | $0.075                        | $4.50                         | ~$0.83       | —              |
| **Claude Haiku 4.5**   | Anthropic | —                     | —                  | $1.00                         | $0.10                         | $5.00                         | ~$1.00       | 160K           |

¹ Gemini 3.1 Pro pricing applies to prompts ≤200K tokens.

² MAI-Code-1-Flash is a continuously improving model — performance and behavior may evolve over time as new checkpoints are released.

³ Score is an **estimate** from Artificial Analysis (labelled "independent evaluation forthcoming"). Not a confirmed run of the full evaluation suite.

⁴ GLM 5.2 is Z.ai's newly released flagship model (Opus-level intelligence / 1M Solid context). AA Intelligence Index score (**51.0**) and pricing of **$1.40** (input), **$0.26** (cached), and **$4.40** (output) per 1M tokens confirmed on its [model page](https://artificialanalysis.ai/models/glm-5-2). Session cost is identical to GLM 5.1 (~$1.14).

Cost per intelligence = estimated session cost ÷ Intelligence Index score. Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

> **Notes:**
>
> - **DeepSeek V4** input pricing shown is the **cache miss** price. Cache hits are significantly cheaper ($0.0028/M for Flash, $0.003625/M for Pro).
> - **MiMo** input pricing shown is the **cache miss** price. Cache hits are essentially free for V2.5 Pro ($0.0036/M, ~120× cheaper) and V2.5 ($0.0028/M, ~50× cheaper). A Xiaomi price cut took effect on 2026-05-27.
> - **Gemini 3 Flash** is priced at $0.50/MTok input (text/image/video) and $1.00/MTok input for audio.
> - **Anthropic (Claude)** models also have a cache write cost ($6.25/MTok for Opus, $3.75/MTok for Sonnet, $1.25/MTok for Haiku). Opus 4.7+ use a new tokenizer that may use up to 35% more tokens for the same text.
> - **OpenAI** models support cached input at 0.1× base input rate.
> - **Qwen** models use **tiered pricing** — determined by total input tokens per request. Prices above are for non-thinking mode.
> - **Kimi** official tables list **Cache Hit before Cache Miss** (opposite order to our table). The rows below transpose them so "Input" = cache miss and "Cached input" = cache hit.
> - **Kimi K2.6** pricing is from the **Moonshot platform** (direct). Via DashScope: $0.89 input / $3.71 output.
> - **DashScope** offers a **free quota** of 1M input + 1M output tokens per model, valid for 90 days.
> - **MiniMax M3** uses **tiered pricing** — input price doubles above 512K input tokens. Cache hits are priced at 20% of the input rate ($0.12/M ≤512K, $0.24/M >512K). A **permanent 50% off** discount applies to all MiniMax-M3 pay-as-you-go usage (Standard and Priority tiers), making the effective rates half the list prices above.
> - **GLM** models support prompt caching — cache hits are priced at $0.24/M for 5V Turbo and $0.26/M for 5.1.
> - **MiMo** offers a **Token Plan** subscription model with discounted rates and a free cache-writing promotion.
> - **MAI-Code-1-Flash** is a continuously improving model — performance and behavior may evolve over time as new checkpoints are released.
> - For typical Copilot chat usage (short-to-medium prompts), you'll almost always fall in the lowest pricing tier.

> **How long does 7,000 credits last?** A Pro+ subscriber running 50-turn sessions could afford roughly **13 GPT-5.5 sessions**, **23 Opus sessions**, or **212 Raptor mini sessions** per month — or mix and match. (Multiply session cost by 100 to convert to AI credits.)

> Prices last verified: June 27, 2026. Always check the official pages for the latest rates:
>
> - [GitHub Copilot models & pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing)
> - [Microsoft MAI-Code-1-Flash model card](https://docs.github.com/en/copilot/reference/ai-models/model-comparison#task-general-purpose-coding-and-writing)
> - [OpenAI pricing](https://openai.com/api/pricing/)
> - [Anthropic (Claude) pricing](https://platform.claude.com/docs/en/about-claude/pricing)
> - [Google Gemini pricing](https://ai.google.dev/pricing)
> - [DashScope pricing](https://www.alibabacloud.com/help/en/model-studio/billing-for-model-studio)
> - [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing)
> - [MiMo pricing](https://mimo.mi.com/docs/en-US/pricing)
> - [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview)
> - [Z.ai (GLM) pricing](https://docs.z.ai/guides/overview/pricing)
