# Pricing

> **⏰ June 1, 2026 — GitHub Copilot switched to usage-based billing (AI Credits) today.**
>
> Before this change, Copilot used **premium request-based billing** — each model had its own multiplier, and every request consumed `multiplier × 1` from your monthly premium-request allowance. Now **every interaction burns AI credits** based on actual token consumption. Agent mode and complex multi-file tasks consume significantly more tokens than simple Q&A, which means your 7,000 Pro+ credits can disappear fast if you're using frontier models.
>
> **The practical workaround:** use cheaper alternative models (DeepSeek V4.1 Flash, MiMo, Qwen) that are still powerful enough for coding — often at **5–55× less cost** than the Copilot defaults. The tables below show the exact comparison.
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

All prices below are in **USD per 1M tokens** (non-cached). To convert to AI credits, multiply by 100 (e.g., $5.00/1M = 500 credits/1M). The DeepSeek row uses peak rates for the comparison; its official off-peak rates are half. Provider promotions are shown separately in the notes; OpenRouter's effective, batch, or free-provider prices are excluded.

All models are listed together below, sorted by Cost per intelligence ascending (lower is better). Models without a Cost per intelligence are ordered by estimated session cost ascending. Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

**All AA Intelligence Index values in this table were re-based from v4.3.2 to v5.0 on October 31, 2026.** AA’s v5.0 composite aggregates a different evaluation set than v4.3.2, so scores are not comparable with earlier snapshots of this file.

| Model                        | Provider  | Cost per intelligence | Intelligence Score | Input (per 1M)                | Cached input                  | Output (per 1M)               | Est. session | Context window |
| ---------------------------- | --------- | --------------------- | ------------------ | ----------------------------- | ----------------------------- | ----------------------------- | ------------ | -------------- |
| **Claude Haiku 5.5**         | Anthropic | **~$0.0028**          | **36.2**           | $0.10 (≤100K) / $0.50 (>100K) | $0.01 (≤100K) / $0.05 (>100K) | $0.50 (≤100K) / $2.50 (>100K) | ~$0.10       | 1M             |
| **GPT-6 Luna**               | OpenAI    | **~$0.0036**          | **27.8**           | $0.10                         | $0.01                         | $0.50                         | ~$0.10       | 1M             |
| **MiMo V2.6 Flash**          | Xiaomi    | **~$0.0037**          | **26.7**           | $0.14                         | $0.0028                       | $0.28                         | ~$0.10       | 1M             |
| **GLM 5.3 Flash**            | Z.ai      | **~$0.0045**          | **27.8**           | $0.15                         | $0.03                         | $0.50                         | ~$0.13       | 1M             |
| **MiniMax M3.1 Flash**       | MiniMax   | **~$0.0047**          | **28.9**           | $0.15                         | $0.015                        | $0.60                         | ~$0.14       | 1M             |
| **DeepSeek V4.1 Flash 1017** | DeepSeek  | **~$0.0084**          | **32**             | $0.30                         | $0.006                        | $1.20                         | ~$0.27       | 1M             |
| **MiMo V2.6 Pro**            | Xiaomi    | **~$0.0102**          | **29.9**           | $0.435                        | $0.0036                       | $0.87                         | ~$0.30       | 1M             |
| **GPT-6.1 Terra**            | OpenAI    | **~$0.0196**          | **51**             | $1.00                         | $0.05                         | $5.00                         | ~$1.00       | 1M             |
| **Gemini 3.8 Flash**         | Google    | **~$0.0246**          | **30.5**           | $0.75                         | $0.075                        | $3.75                         | ~$0.75       | 1M             |
| **Muse Spark 1.3**           | Meta      | **~$0.0288**          | **36.4**           | $1.25                         | $0.15                         | $4.25                         | ~$1.05       | 1M             |
| **GLM 5.3**                  | Z.ai      | **~$0.0360**          | **31.7**           | $1.40                         | $0.26                         | $4.40                         | ~$1.14       | 1M             |
| **GPT-6.1 Sol**              | OpenAI    | **~$0.0367**          | **54.5**           | $2.00                         | $0.10                         | $10.00                        | ~$2.00       | 1M             |
| **Claude Sonnet 5.5**        | Anthropic | **~$0.0369**          | **54.2**           | $2.00                         | $0.10                         | $10.00                        | ~$2.00       | 1M             |
| **Gemini 4 Argon**           | Google    | **~$0.0397**          | **50.4**           | $2.00                         | $0.10                         | $10.00                        | ~$2.00       | 1M             |
| **Kimi K3.1 Pro**            | Moonshot  | **~$0.0435**          | **46**             | $2.00                         | $0.20                         | $10.00                        | ~$2.00       | 1M             |
| **GPT-6 Sol**                | OpenAI    | **~$0.0455**          | **44**             | $2.00                         | $0.20                         | $10.00                        | ~$2.00       | 1M             |
| **Grok 4.7**                 | xAI       | **~$0.0457**          | **35**             | $2.00                         | $0.50                         | $6.00                         | ~$1.60       | 500K           |
| **Qwen 3.8 Max**             | DashScope | **~$0.0476**          | **33.6**           | $2.00                         | $0.25                         | $6.00                         | ~$1.60       | 1M             |
| **Claude Opus 5.5**          | Anthropic | **~$0.0685**          | **58.4**           | $4.00                         | $0.20                         | $20.00                        | ~$4.00       | 1M             |
| **MiMo V2.6 Pro UltraSpeed** | Xiaomi    | **~$0.1018**          | **29.9**           | $4.35                         | $0.036                        | $8.70                         | ~$3.05       | 1M             |
| **Claude Fable 5.2**         | Anthropic | **~$0.1231**          | **65**             | $8.00                         | $0.20                         | $40.00                        | ~$8.00       | 1M             |
| **GPT-6 Astra**              | OpenAI    | **~$0.1757**          | **56.9**           | $10.00                        | $1.00                         | $50.00                        | ~$10.00      | 1M             |
| **Claude Fable 5.1**         | Anthropic | **~$0.2012**          | **49.7**           | $10.00                        | $0.25                         | $50.00                        | ~$10.00      | 1M             |

Cost per intelligence = estimated session cost ÷ Intelligence Index score. Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

> **Notes:**
>
> - **DeepSeek:** the table shows peak cache-miss pricing; off-peak rates are half. See the [DeepSeek pricing page](https://api-docs.deepseek.com/quick_start/pricing).
> - **MiMo:** the table shows cache-miss pricing; cache hits are far cheaper (see the Cached input column). A Token Plan subscription with discounted rates is also available.
> - **Anthropic:** cache reads and writes are billed separately. Haiku 5.5 is the only Claude model with prompt-length tiering; the table shows its ≤100K rates. Fast mode is $8 / $40 per 1M.
> - **OpenAI:** GPT-6 Sol, GPT-6.1 Sol, and Luna bill cache writes at 1.25× input. Requests over 272K input cost 2× input and cache rates, with 1.5× output.
> - **Gemini 4 Argon:** the $2 / $10 introductory rates run through November 30, 2026, then rise to $4 / $20. Output includes thinking tokens.
> - **Kimi K3.1 Pro and MiniMax M3.1 Flash:** both always think, so control cost with `reasoning_effort`. See [docs/models/kimi.md](models/kimi.md) and [docs/models/minimax.md](models/minimax.md).
> - **GLM:** cache hits are $0.26/M for 5.3 and $0.03/M for 5.3 Flash at list.
> - **Qwen:** pricing is tiered by input tokens per request; the table shows non-thinking rates. DashScope offers 1M input + 1M output free tokens per model for 90 days.
> - Artificial Analysis measures several models as very verbose, so real sessions can cost more than the modeled token counts.
> - For typical Copilot chat usage (short-to-medium prompts), you'll almost always fall in the lowest pricing tier.

> **How long does 7,000 credits last?** A Pro+ subscriber running 50-turn sessions can estimate monthly capacity by multiplying each modeled session cost by 100 to convert it to AI credits, then mixing models as needed.

> Prices last verified: November 10, 2026. Always check the official pages for the latest rates:
>
> - [GitHub Copilot models & pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing)
> - [OpenAI pricing](https://openai.com/api/pricing/)
> - [OpenAI GPT-6 Sol and Luna announcement](https://openai.com/index/introducing-gpt-6-sol-and-luna/)
> - [OpenAI GPT-6 Sol API details](https://developers.openai.com/api/docs/models/gpt-6-sol)
> - [OpenAI GPT-6 Luna API details](https://developers.openai.com/api/docs/models/gpt-6-luna)
> - [OpenAI GPT-6.1 Sol announcement](https://openai.com/index/introducing-gpt-6-1-sol/)
> - [OpenAI GPT-6.1 Sol API details](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
> - [OpenAI GPT-6.1 Terra announcement](https://openai.com/index/introducing-gpt-6-1-terra/)
> - [OpenAI GPT-6.1 Terra API details](https://developers.openai.com/api/docs/models/gpt-6.1-terra)
> - [GitHub Copilot GPT-6.1 Terra release](https://github.blog/changelog/2026-10-26-gpt-6-1-terra-in-github-copilot)
> - [Anthropic (Claude) pricing](https://platform.claude.com/docs/en/about-claude/pricing)
> - [Anthropic Claude Fable 5.2 announcement](https://www.anthropic.com/claude-fable-and-mythos-5-2)
> - [GitHub Copilot Claude Fable 5.2 release](https://github.blog/changelog/2026-11-09-claude-fable-5-2-in-github-copilot)
> - [Artificial Analysis Claude Fable 5.2](https://artificialanalysis.ai/models/claude-fable-5-2)
> - [Anthropic Claude Opus 5.5 announcement](https://www.anthropic.com/claude-opus-5-5)
> - [Anthropic Opus 5.5 API docs](https://platform.claude.com/docs/en/models/opus-5-5/overview)
> - [Anthropic Claude Sonnet 5.5 announcement](https://www.anthropic.com/claude-sonnet-5-5)
> - [Anthropic Claude Haiku 5.5 announcement](https://www.anthropic.com/claude-haiku-5-5)
> - [Anthropic Claude Haiku 5.5 system card](https://www.anthropic.com/claude-haiku-5-5-system-card)
> - [GitHub Copilot Claude Haiku 5.5 release](https://github.blog/changelog/2026-10-07-claude-haiku-5-5-in-github-copilot)
> - [GitHub Copilot Claude Sonnet 5.5 release](https://github.blog/changelog/2026-09-28-claude-sonnet-5-5-in-github-copilot)
> - [GitHub Copilot GPT-6 Sol and Luna release](https://github.blog/changelog/2026-09-22-openais-gpt-6-sol-and-gpt-6-luna-now-available)
> - [GitHub Copilot GPT-6.1 Sol release](https://github.blog/changelog/2026-09-29-gpt-6-1-sol-in-github-copilot)
> - [GitHub Copilot Claude Opus 5.5 release](https://github.blog/changelog/2026-09-22-claude-opus-5-5-is-now-available-in-github-copilot)
> - [GitHub Copilot supported models](https://docs.github.com/en/copilot/reference/ai-models/supported-models)
> - [Artificial Analysis GPT-6 Sol](https://artificialanalysis.ai/models/gpt-6-sol), [GPT-6 Luna](https://artificialanalysis.ai/models/gpt-6-luna), [GPT-6.1 Sol](https://artificialanalysis.ai/models/gpt-6-1-sol), [GPT-6.1 Terra](https://artificialanalysis.ai/models/gpt-6-1-terra), [Claude Opus 5.5](https://artificialanalysis.ai/models/claude-opus-5-5), [Claude Sonnet 5.5](https://artificialanalysis.ai/models/claude-sonnet-5-5), [Claude Haiku 5.5](https://artificialanalysis.ai/models/claude-haiku-5-5), [MiMo-V2.6-Flash](https://artificialanalysis.ai/models/mimo-v2-6-flash), [Gemini 4 Argon](https://artificialanalysis.ai/models/gemini-4-argon), [Muse Spark 1.3](https://artificialanalysis.ai/models/muse-spark-1-3), [Kimi K3.1 Pro](https://artificialanalysis.ai/models/kimi-k3-1-pro), and [MiniMax-M3.1-Flash](https://artificialanalysis.ai/models/minimax-m3-1-flash)
> - [Google Gemini pricing](https://ai.google.dev/pricing)
> - [Google Gemini 4 Argon (what's new)](https://ai.google.dev/gemini-api/docs/latest-model)
> - [Google Gemini 4 Argon model card](https://ai.google.dev/gemini-api/docs/models/gemini-4-argon)
> - [GitHub Copilot Gemini 4 Argon release](https://github.blog/changelog/2026-10-13-gemini-4-argon-in-github-copilot)
> - [DashScope pricing](https://www.alibabacloud.com/help/en/model-studio/billing-for-model-studio)
> - [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing)
> - [MiMo pricing](https://mimo.mi.com/docs/en-US/pricing)
> - [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview)
> - [MiniMax M3.1 Flash announcement](https://www.minimax.io/blog/minimax-m31f)
> - [MiniMax M3.1 Flash model docs](https://platform.minimax.io/docs/guides/text-generation)
> - [Z.ai (GLM) pricing](https://docs.z.ai/guides/overview/pricing)
> - [Kimi pricing](https://platform.kimi.ai/docs/pricing)
> - [Kimi K3.1 Pro quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart)
> - [xAI model pricing](https://docs.x.ai/docs/models)

- [Meta Model API pricing](https://dev.meta.ai/docs/pricing-rate-limits)
- [Meta Muse Spark model card](https://dev.meta.ai/models/muse-spark)
