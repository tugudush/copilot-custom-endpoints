# Pricing

> **Latest refresh (September 23, 2026):** OpenRouter's current metadata uses Artificial Analysis v4.3.2 composites. The September 22 Copilot releases add Claude Opus 5.5 (**57.6**), GPT-6 Sol (**47.5**), and GPT-6 Luna (**37.3**) to the roster. The API list rates are **$4 / $0.20 cache hit / $20** for Opus 5.5, **$2 / $0.20 / $10** for Sol, and **$0.10 / $0.01 / $0.50** for Luna. MiMo V2.6 Pro is **46.3**, Grok 4.7 is **46.4**, and current values for existing rows are refreshed below. Gemini 3.8 Flash is also available as a GitHub Copilot native model. Xiaomi released the V2.6 Pro, Flash, and Pro UltraSpeed models on September 22; the September 23 roster cleanup removes two retired legacy models. xAI released Grok 4.7 on September 21 at the same short-context rates as Grok 4.6: **$2 / $0.50 cache hit / $6**. The table preserves Qwen's 0803 ranking-card value (**53.4**) and 0902 metadata value (**45.4**) as separate records. The current table is authoritative for present comparisons.

> **⏰ June 1, 2026 — GitHub Copilot switched to usage-based billing (AI Credits) today.**
>
> Before this change, Copilot used **premium request-based billing** — each model had its own multiplier, and every request consumed `multiplier × 1` from your monthly premium-request allowance. Now **every interaction burns AI credits** based on actual token consumption. Agent mode and complex multi-file tasks consume significantly more tokens than simple Q&A, which means your 7,000 Pro+ credits can disappear fast if you're using frontier models.
>
> **The practical workaround:** use cheaper alternative models (DeepSeek V4 Flash, MiMo, Qwen) that are still powerful enough for coding — often at **5–55× less cost** than the Copilot defaults. The tables below show the exact comparison.
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

All prices below are in **USD per 1M tokens** (non-cached). To convert to AI credits, multiply by 100 (e.g., $5.00/1M = 500 credits/1M). DeepSeek rows use peak rates for the comparison; its official off-peak rates are half. Provider promotions are shown separately in the notes; OpenRouter's effective, batch, or free-provider prices are excluded.

All models are listed together below, sorted by Cost per intelligence ascending (lower is better). Models without a Cost per intelligence are ordered by estimated session cost ascending. Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

| Model                        | Provider  | Cost per intelligence | Intelligence Score | Input (per 1M)                | Cached input                  | Output (per 1M)               | Est. session | Context window |
| ---------------------------- | --------- | --------------------- | ------------------ | ----------------------------- | ----------------------------- | ----------------------------- | ------------ | -------------- |
| **GPT-6 Luna**               | OpenAI    | **~$0.0027**          | **37.3**           | $0.10                         | $0.01                         | $0.50                         | ~$0.10       | 1M             |
| **GLM 5.3 Flash**            | Z.ai      | **~$0.0030**          | **41.8**           | $0.15                         | $0.03                         | $0.50                         | ~$0.13       | 1M             |
| **GPT-5.6 Luna**             | OpenAI    | **~$0.0059**          | **37.3**           | $0.20                         | $0.02                         | $1.20                         | ~$0.22       | 1M             |
| **MiMo V2.6 Pro**            | Xiaomi    | **~$0.0066**          | **46.3**           | $0.435                        | $0.0036                       | $0.87                         | ~$0.30       | 1M             |
| **DeepSeek V4.1 Flash**      | DeepSeek  | **~$0.0068**          | **39.5**           | $0.30                         | $0.006                        | $1.20                         | ~$0.27       | 1M             |
| **MiniMax M3**               | MiniMax   | **~$0.0093**          | **29.2**           | $0.60 (≤512K) / $1.20 (>512K) | $0.12 (≤512K) / $0.24 (>512K) | $2.40 (≤512K) / $4.80 (>512K) | ~$0.27       | 1M             |
| **MiniMax M3 Priority**      | MiniMax   | **~$0.0139**          | **29.2**           | $0.90 (≤512K) / $1.80 (>512K) | $0.18 (≤512K) / $0.36 (>512K) | $3.60 (≤512K) / $7.20 (>512K) | ~$0.41       | 1M             |
| **Gemini 3.8 Flash**         | Google    | **~$0.0183**          | **40.9**           | $0.75                         | $0.075                        | $3.75                         | ~$0.75       | 1M             |
| **GLM 5.3**                  | Z.ai      | **~$0.0254**          | **44.8**           | $1.40                         | $0.26                         | $4.40                         | ~$1.14       | 1M             |
| **DeepSeek V4 Pro 0813**     | DeepSeek  | **~$0.0294**          | **36.0**           | $1.32                         | $0.044                        | $3.96                         | ~$1.06       | 1M             |
| **Qwen 3.8 Max (0803)**      | DashScope | **~$0.0300**          | **53.4**           | $2.00                         | $0.25                         | $6.00                         | ~$1.60       | 1M             |
| **Grok 4.7**                 | xAI       | **~$0.0345**          | **46.4**           | $2.00                         | $0.50                         | $6.00                         | ~$1.60       | 500K           |
| **Qwen 3.8 Max (0902)**      | DashScope | **~$0.0352**          | **45.4**           | $2.00                         | $0.25                         | $6.00                         | ~$1.60       | 1M             |
| **Grok 4.6**                 | xAI       | **~$0.0361**          | **44.3**           | $2.00                         | $0.50                         | $6.00                         | ~$1.60       | 500K           |
| **GPT-6 Sol**                | OpenAI    | **~$0.0421**          | **47.5**           | $2.00                         | $0.20                         | $10.00                        | ~$2.00       | 1M             |
| **GPT-5.6 Terra**            | OpenAI    | **~$0.0523**          | **42.1**           | $2.00                         | $0.20                         | $12.00                        | ~$2.20       | 1M             |
| **Claude Sonnet 5**          | Anthropic | **~$0.0524**          | **38.2**           | $2.00                         | $0.20                         | $10.00                        | ~$2.00       | 1M             |
| **MiMo V2.6 Pro UltraSpeed** | Xiaomi    | **~$0.0658**          | **46.3**           | $4.35                         | $0.036                        | $8.70                         | ~$3.05       | 1M             |
| **Kimi K3**                  | Moonshot  | **~$0.0688**          | **43.6**           | $3.00                         | $0.30                         | $15.00                        | ~$3.00       | 1M             |
| **Claude Opus 5.5**          | Anthropic | **~$0.0694**          | **57.6**           | $4.00                         | $0.20                         | $20.00                        | ~$4.00       | 1M             |
| **GPT-5.6 Sol**              | OpenAI    | **~$0.0851**          | **47.0**           | $4.00                         | $0.40                         | $20.00                        | ~$4.00       | 1M             |
| **Claude Opus 5**            | Anthropic | **~$0.0984**          | **50.8**           | $5.00                         | $0.50                         | $25.00                        | ~$5.00       | 1M             |
| **Claude Fable 5.1**         | Anthropic | **~$0.1873**          | **53.4**           | $10.00                        | $0.25                         | $50.00                        | ~$10.00      | 1M             |
| **GPT-6 Astra**              | OpenAI    | **~$0.1898**          | **52.7**           | $10.00                        | $1.00                         | $50.00                        | ~$10.00      | 1M             |
| **Claude Fable 5**           | Anthropic | **~$0.2016**          | **49.6**           | $10.00                        | $1.00                         | $50.00                        | ~$10.00      | 1M             |
| **MiMo V2.6 Flash**          | Xiaomi    | —                     | —                  | $0.14                         | $0.0028                       | $0.28                         | ~$0.10       | 1M             |

Cost per intelligence = estimated session cost ÷ Intelligence Index score. Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

> **Notes:**
>
> - **DeepSeek** input pricing shown is the **peak cache miss** price. Peak cache hits are $0.006/M for V4.1 Flash and $0.044/M for Pro; off-peak rates are half. See the [DeepSeek pricing page](https://api-docs.deepseek.com/quick_start/pricing) for the full schedule.
> - **MiMo** input pricing shown is the **cache miss** price. Cache hits are essentially free for V2.6 Pro ($0.0036/M, ~120× cheaper), V2.6 Flash ($0.0028/M, ~50× cheaper), and V2.6 Pro UltraSpeed ($0.036/M, ~120× cheaper). A Xiaomi price cut took effect on 2026-05-27.
> - **Anthropic (Claude)** cache reads and cache writes are billed separately. Claude Opus 5.5 cache reads are $0.20/M; cache writes are $5/M for 5 minutes or $8/M for 1 hour. Fast mode costs $8/M input and $40/M output. Opus 5.5, Opus 5, Sonnet 5, and Fable 5 / 5.1 use a newer tokenizer that produces approximately 30% more tokens for the same text.
> - **OpenAI** models support cached input at 0.1× base input rate. GPT-6 Sol and Luna also bill cache writes separately at 1.25× input. The GPT-6 rows show standard rates through 272K input; for requests >272K, input and cache-read rates double and output is 1.5×.
> - **Qwen** models use **tiered pricing** — determined by total input tokens per request. Prices above are for non-thinking mode.
> - **Kimi** official tables list **Cache Hit before Cache Miss** (opposite order to our table). The rows below transpose them so "Input" = cache miss and "Cached input" = cache hit.
> - **DashScope** offers a **free quota** of 1M input + 1M output tokens per model, valid for 90 days.
> - **MiniMax M3** uses **tiered pricing** — input price doubles above 512K input tokens. Cache hits are priced at 20% of the input rate ($0.12/M ≤512K, $0.24/M >512K). A **permanent 50% off** discount applies to all MiniMax-M3 pay-as-you-go usage (Standard and Priority tiers), making the effective rates half the list prices above.
> - **MiniMax M3 Priority** is not a separate model — it is the same `MiniMax-M3` weights invoked with `"service_tier": "priority"` in the request body. Priority costs **1.5× Standard** across input, output, and cache reads, in exchange for **priority admission** (faster responses, fewer failures during MiniMax peak hours — typically 15:00–17:30 weekdays). Capabilities, context window (1M, guaranteed 512K), vision, tool calling, rate limits (200 RPM / 10M TPM), and thinking modes are identical to Standard. See [docs/research/minimax-m3-priority.md](research/minimax-m3-priority.md) for the full breakdown.
> - **GLM** models support prompt caching — cache hits are priced at $0.26/M for 5.3 and $0.03/M for 5.3 Flash (list; $0.015/M during the launch promo).
> - **MiMo** offers a **Token Plan** subscription model with discounted rates and a free cache-writing promotion.
> - For typical Copilot chat usage (short-to-medium prompts), you'll almost always fall in the lowest pricing tier.

> **How long does 7,000 credits last?** A Pro+ subscriber running 50-turn sessions can estimate monthly capacity by multiplying each modeled session cost by 100 to convert it to AI credits, then mixing models as needed.

> Prices last verified: September 23, 2026. Always check the official pages for the latest rates:
>
> - [GitHub Copilot models & pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing)
> - [OpenAI pricing](https://openai.com/api/pricing/)
> - [OpenAI GPT-5.6 announcement](https://openai.com/index/gpt-5-6/)
> - [OpenAI GPT-5.6 price update](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/)
> - [OpenAI GPT-6 Sol and Luna announcement](https://openai.com/index/introducing-gpt-6-sol-and-luna/)
> - [OpenAI GPT-6 Sol API details](https://developers.openai.com/api/docs/models/gpt-6-sol)
> - [OpenAI GPT-6 Luna API details](https://developers.openai.com/api/docs/models/gpt-6-luna)
> - [Anthropic (Claude) pricing](https://platform.claude.com/docs/en/about-claude/pricing)
> - [Anthropic Claude Opus 5.5 announcement](https://www.anthropic.com/claude-opus-5-5)
> - [Anthropic Opus 5.5 API docs](https://platform.claude.com/docs/en/models/opus-5-5/overview)
> - [GitHub Copilot GPT-6 Sol and Luna release](https://github.blog/changelog/2026-09-22-openais-gpt-6-sol-and-gpt-6-luna-now-available)
> - [GitHub Copilot Claude Opus 5.5 release](https://github.blog/changelog/2026-09-22-claude-opus-5-5-is-now-available-in-github-copilot)
> - [GitHub Copilot supported models](https://docs.github.com/en/copilot/reference/ai-models/supported-models)
> - [Artificial Analysis GPT-6 Sol](https://artificialanalysis.ai/models/gpt-6-sol), [GPT-6 Luna](https://artificialanalysis.ai/models/gpt-6-luna), and [Claude Opus 5.5](https://artificialanalysis.ai/models/claude-opus-5-5)
> - [Google Gemini pricing](https://ai.google.dev/pricing)
> - [DashScope pricing](https://www.alibabacloud.com/help/en/model-studio/billing-for-model-studio)
> - [DeepSeek pricing](https://api-docs.deepseek.com/quick_start/pricing)
> - [MiMo pricing](https://mimo.mi.com/docs/en-US/pricing)
> - [MiniMax pricing](https://platform.minimax.io/docs/pricing/overview)
> - [Z.ai (GLM) pricing](https://docs.z.ai/guides/overview/pricing)
> - [Kimi pricing](https://platform.kimi.ai/docs/pricing)
> - [xAI model pricing](https://docs.x.ai/docs/models)
