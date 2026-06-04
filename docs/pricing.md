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

## Default GitHub Copilot models

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

## Custom-endpoint alternatives

| Model                 | Provider  | Input (per 1M)                | Output (per 1M)                         | Context window |
| --------------------- | --------- | ----------------------------- | --------------------------------------- | -------------- |
| **DeepSeek V4 Flash** | DeepSeek  | $0.14                         | $0.28                                   | 1M             |
| **MiMo V2 Flash** 🏆  | Xiaomi    | $0.10                         | $0.30                                   | 256K           |
| **Kimi K2.6**         | Moonshot  | $0.16                         | $0.95 (non-thinking) / $4.00 (thinking) | 256K           |
| **DeepSeek V4 Pro**   | DeepSeek  | $1.74                         | $3.48                                   | 1M             |
| **MiMo V2.5**         | Xiaomi    | $0.40                         | $2.00                                   | 1M             |
| **MiMo V2.5 Pro**     | Xiaomi    | $1.00                         | $3.00                                   | 1M             |
| **Qwen 3.7 Plus**     | DashScope | $0.40 (≤256K) / $1.20 (>256K) | $1.60 (≤256K) / $4.80 (>256K)           | 1M             |
| **Qwen 3.7 Max**      | DashScope | $2.50 (≤1M)                   | $7.50 (≤1M)                             | 1M             |
| **MiniMax M3**        | MiniMax   | $0.60 (≤512K) / $1.20 (>512K) | $2.40 (≤512K) / $4.80 (>512K)           | 1M             |
| **GLM 4.7 Flash**     | Z.ai      | Free (rate-limited ¹)         | Free (rate-limited ¹)                   | 200K           |
| **GLM 5V Turbo**      | Z.ai      | $1.20                         | $4.00                                   | 200K           |
| **GLM 5.1**           | Z.ai      | $1.40                         | $4.40                                   | 200K           |

> **Notes:**
>
> - **DeepSeek V4** input pricing shown is the **cache miss** price. Cache hits are significantly cheaper ($0.0028/M for Flash, $0.0145/M for Pro).
> - **MiMo** input pricing shown is the **cache miss** price. Cache hits are 5× cheaper for V2.5 Pro ($0.20/M) and V2.5 ($0.08/M), and 10× cheaper for V2 Flash ($0.01/M).
> - **Gemini 3 Flash** is priced at $0.50/MTok input (text/image/video) and $1.00/MTok input for audio.
> - **Anthropic (Claude)** models also have a cache write cost ($6.25/MTok for Opus, $3.75/MTok for Sonnet, $1.25/MTok for Haiku). Opus 4.7+ use a new tokenizer that may use up to 35% more tokens for the same text.
> - **OpenAI** models support cached input at 0.1× base input rate.
> - **Qwen** models use **tiered pricing** — determined by total input tokens per request. Prices above are for non-thinking mode.
> - **Kimi K2.6** pricing is from the **Moonshot platform** (direct). Via DashScope: $0.89 input / $3.71 output.
> - **DashScope** offers a **free quota** of 1M input + 1M output tokens per model, valid for 90 days.
> - **MiniMax M3** uses **tiered pricing** — input price doubles above 512K input tokens. A 7-day 50% off promotion is available for new accounts.
> - **GLM** free-tier models (`glm-4.7-flash`) are aggressively rate-limited (HTTP `1302 / ChatRateLimited`), especially on context > 8K or with thinking enabled. Paid GLM models share a much larger concurrency pool.
> - **MiMo** offers a **Token Plan** subscription model with discounted rates and a free cache-writing promotion.
> - For typical Copilot chat usage (short-to-medium prompts), you'll almost always fall in the lowest pricing tier.

## Quick cost comparison

For a typical coding session (~10K input + ~2K output tokens per turn, 50 turns):

| Model                    | Estimated session cost | Copilot Pro+ credits |
| ------------------------ | ---------------------- | -------------------- |
| MiMo V2 Flash 🏆         | ~$0.08                 | —                    |
| DeepSeek V4 Flash 🏆     | ~$0.10                 | —                    |
| Kimi K2.6 (non-thinking) | ~$0.18                 | —                    |
| MiMo V2.5                | ~$0.40                 | —                    |
| Kimi K2.6 (thinking)     | ~$0.48                 | —                    |
| Qwen 3.7 Plus            | ~$0.36                 | —                    |
| Gemini 3 Flash           | ~$0.55                 | ~55                  |
| MiniMax M3               | ~$0.54                 | —                    |
| MiMo V2.5 Pro            | ~$0.80                 | —                    |
| GLM 4.7 Flash (free)     | ~$0.00 ¹               | —                    |
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
> - [MiMo pricing](https://platform.xiaomimimo.com/docs/en-US/pricing)
> - [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview)
> - [Z.ai (GLM) pricing](https://docs.z.ai/guides/overview/pricing)
