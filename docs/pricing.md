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

| Model                        | Provider  | Cost per intelligence | Intelligence Score | Input (per 1M)                | Cached input                  | Output (per 1M)               | Est. session | Context window |
| ---------------------------- | --------- | --------------------- | ------------------ | ----------------------------- | ----------------------------- | ----------------------------- | ------------ | -------------- |
| **Claude Haiku 5.5**         | Anthropic | **~$0.0023**          | **43**             | $0.10 (≤100K) / $0.50 (>100K) | $0.01 (≤100K) / $0.05 (>100K) | $0.50 (≤100K) / $2.50 (>100K) | ~$0.10       | 1M             |
| **MiMo V2.6 Flash**          | Xiaomi    | **~$0.0026**          | **37.9**           | $0.14                         | $0.0028                       | $0.28                         | ~$0.10       | 1M             |
| **GPT-6 Luna**               | OpenAI    | **~$0.0027**          | **37.3**           | $0.10                         | $0.01                         | $0.50                         | ~$0.10       | 1M             |
| **GLM 5.3 Flash**            | Z.ai      | **~$0.0030**          | **41.8**           | $0.15                         | $0.03                         | $0.50                         | ~$0.13       | 1M             |
| **MiniMax M3.1 Flash**       | MiniMax   | **~$0.0031**          | **43**             | $0.15                         | $0.015                        | $0.60                         | ~$0.14       | 1M             |
| **GPT-5.6 Luna**             | OpenAI    | **~$0.0059**          | **37.3**           | $0.20                         | $0.02                         | $1.20                         | ~$0.22       | 1M             |
| **DeepSeek V4.1 Flash 1017** | DeepSeek  | **~$0.0060**          | **45**             | $0.30                         | $0.006                        | $1.20                         | ~$0.27       | 1M             |
| **MiMo V2.6 Pro**            | Xiaomi    | **~$0.0066**          | **46.3**           | $0.435                        | $0.0036                       | $0.87                         | ~$0.30       | 1M             |
| **MiniMax M3**               | MiniMax   | **~$0.0093**          | **29.2**           | $0.60 (≤512K) / $1.20 (>512K) | $0.12 (≤512K) / $0.24 (>512K) | $2.40 (≤512K) / $4.80 (>512K) | ~$0.27       | 1M             |
| **Gemini 3.8 Flash**         | Google    | **~$0.0183**          | **40.9**           | $0.75                         | $0.075                        | $3.75                         | ~$0.75       | 1M             |
| **Muse Spark 1.3**           | Meta      | **~$0.0219**          | **48**             | $1.25                         | $0.15                         | $4.25                         | ~$1.05       | 1M             |
| **GLM 5.3**                  | Z.ai      | **~$0.0254**          | **44.8**           | $1.40                         | $0.26                         | $4.40                         | ~$1.14       | 1M             |
| **Qwen 3.8 Max (0803)**      | DashScope | **~$0.0300**          | **53.4**           | $2.00                         | $0.25                         | $6.00                         | ~$1.60       | 1M             |
| **Grok 4.7**                 | xAI       | **~$0.0345**          | **46.4**           | $2.00                         | $0.50                         | $6.00                         | ~$1.60       | 500K           |
| **Qwen 3.8 Max (0902)**      | DashScope | **~$0.0352**          | **45.4**           | $2.00                         | $0.25                         | $6.00                         | ~$1.60       | 1M             |
| **Claude Sonnet 5.5**        | Anthropic | **~$0.0357**          | **56.0**           | $2.00                         | $0.10                         | $10.00                        | ~$2.00       | 1M             |
| **Grok 4.6**                 | xAI       | **~$0.0361**          | **44.3**           | $2.00                         | $0.50                         | $6.00                         | ~$1.60       | 500K           |
| **Kimi K3.1 Pro**            | Moonshot  | **~$0.0363**          | **55.1**           | $2.00                         | $0.20                         | $10.00                        | ~$2.00       | 1M             |
| **Gemini 4 Argon**           | Google    | **~$0.0377**          | **53**             | $2.00                         | $0.10                         | $10.00                        | ~$2.00       | 1M             |
| **GPT-6.1 Sol**              | OpenAI    | **~$0.0386**          | **51.8**           | $2.00                         | $0.10                         | $10.00                        | ~$2.00       | 1M             |
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

Cost per intelligence = estimated session cost ÷ Intelligence Index score. Session cost assumes ~10K input + ~2K output tokens per turn, 50 turns.

> **Notes:**
>
> - **DeepSeek** input pricing shown is the **peak cache miss** price. Peak cache hits are $0.006/M for V4.1 Flash; off-peak rates are half. The October 17, 2026 **V4.1-Flash-1017** build keeps those rates unchanged, is served under the same `deepseek-flash` ID, and supports both thinking (default) and non-thinking modes. AA measures it at 216 tokens/s and very verbose (210M output tokens to run the Intelligence Index versus a 140M median), so real sessions can cost more than this table's modeled token counts. See the [DeepSeek pricing page](https://api-docs.deepseek.com/quick_start/pricing) for the full schedule.
> - **MiMo** input pricing shown is the **cache miss** price. Cache hits are essentially free for V2.6 Pro ($0.0036/M, ~120× cheaper), V2.6 Flash ($0.0028/M, ~50× cheaper), and V2.6 Pro UltraSpeed ($0.036/M, ~120× cheaper). A Xiaomi price cut took effect on 2026-05-27.
> - **Anthropic (Claude)** cache reads and cache writes are billed separately. Claude Opus 5.5 cache reads are $0.20/M and Sonnet 5.5 cache reads are $0.10/M (both 0.05× base input); cache writes are $5/M for 5 minutes or $8/M for 1 hour on Opus 5.5 and $2.50/M or $4/M on Sonnet 5.5. Fast mode costs $8/M input and $40/M output. Opus 5.5, Opus 5, Sonnet 5 / 5.5, Haiku 5.5, and Fable 5 / 5.1 use a newer tokenizer that produces approximately 30% more tokens for the same text. **Claude Haiku 5.5 is the only current Claude model with prompt-length tiering**: prompts up to 100,000 tokens cost $0.10 / $0.01 cache read / $0.50 per 1M, prompts over 100,000 tokens cost $0.50 / $0.05 / $2.50, cache writes are $0.125/M (5 min) and $0.20/M (1 h) below the threshold, and batch pricing is $0.05 / $0.25 (≤100K) and $0.25 / $1.25 (>100K); the table above shows the sub-100K rates that Anthropic says cover ~90% of Haiku-class requests. Anthropic states Haiku 5.5 costs about 75% less on average to run than Haiku 4.5. Claude Sonnet 5.5 keeps Sonnet 5's $2 / $10 rates, and Anthropic made them permanent: the Sonnet 5 increase to $3 / $15 scheduled for September 1 was cancelled — and as of October 7, 2026 its cache reads were halved to $0.10/M (batch $1 / $5). Artificial Analysis measured Sonnet 5.5 at 138.7 tokens/s but very verbose (410M output tokens to run the Intelligence Index vs an 88M median), and Haiku 5.5 at 244 tokens/s but also very verbose (440M vs a 100M median), so real sessions can cost more than this table's modeled token counts; Anthropic reports up to 30% fewer tokens per task than Sonnet 5.
> - **OpenAI** models support cached input at 0.1× base input rate — except **GPT-6.1 Sol**, whose cache hits are 0.05× ($0.10/M, half of GPT-6 Sol's $0.20/M). GPT-6 Sol, GPT-6.1 Sol, and Luna also bill cache writes separately at 1.25× input. The GPT-6 and GPT-6.1 rows show standard rates through 272K input; for requests >272K, input and cache-read rates double and output is 1.5×.
> - **Google (Gemini)** — **Gemini 4 Argon** is priced at Google's introductory rates: $2 / $0.10 implicit cache / $10 per 1M tokens through November 30, 2026, then $4 / $0.20 / $20. Output prices include thinking tokens. Only implicit caching is supported — a flat 95% discount on cached input for prompts of at least 4,096 tokens (explicit caching is not available). Gemini 4 Argon is not offered on the free tier or the Google AI Pro plan, and GitHub Copilot bills it at provider list pricing (Pro+, Max, Business, and Enterprise; not Pro).
> - **Qwen** models use **tiered pricing** — determined by total input tokens per request. Prices above are for non-thinking mode.
> - **Kimi** official tables list **Cache Hit before Cache Miss** (opposite order to our table; Kimi K3 and K3.1 Pro also bill cache writes separately by TTL — K3 writes are $3.00/M for a 5-minute TTL and $6.00/M for 1 hour). The rows transpose them so "Input" = cache miss and "Cached input" = cache hit. **Kimi K3.1 Pro** (October 23, 2026) is **$2.00 / $0.20 cached / $10.00** per 1M with flat rates and automatic prefix caching (90% cache discount). It is always-thinking: `reasoning_effort` accepts `low` / `high` / `max` (default `max`) and chain-of-thought cannot be disabled. Artificial Analysis measures it at ~81 tokens/s and very verbose (150M output tokens to run the Intelligence Index versus an 87M median), at $2.11 per index task, so real sessions can cost more than the modeled ~$2.00. See [docs/models/kimi.md](models/kimi.md). **Kimi K3** (July 2026) is the previous flagship — superseded by K3.1 Pro but still served at $3.00 / $0.30 cached / $15.00.
> - **DashScope** offers a **free quota** of 1M input + 1M output tokens per model, valid for 90 days.
> - **MiniMax M3** uses **tiered pricing** — input price doubles above 512K input tokens. Cache hits are priced at 20% of the input rate ($0.12/M ≤512K, $0.24/M >512K). A **permanent 50% off** discount applies to all MiniMax-M3 pay-as-you-go usage, making the effective rates half the list prices above.
> - **MiniMax M3.1 Flash** is priced **flat** at $0.15 / $0.015 cache read / $0.60 per 1M tokens — one rate for all prompt lengths, a 90% cache discount, and **no `service_tier` support** (the API rejects that field for this model). Thinking cannot be disabled: `thinking: { "type": "disabled" }` or `reasoning_effort: "none"` returns HTTP 400, and depth is tuned with `reasoning_effort` (`low` / `medium` / `high` / `xhigh` / `max`, default `max`). Artificial Analysis measures it at 96 tokens/s and very verbose (180M output tokens to run the Intelligence Index vs a 100M median), so real sessions can cost more than the modeled ~$0.14. See [docs/models/minimax.md](models/minimax.md).
> - **GLM** models support prompt caching — cache hits are priced at $0.26/M for 5.3 and $0.03/M for 5.3 Flash (list; $0.015/M during the launch promo).
> - **MiMo** offers a **Token Plan** subscription model with discounted rates and a free cache-writing promotion. MiMo V2.6 Flash's **37.9** composite comes from OpenRouter's Artificial Analysis v4.3.2 metadata (AA also measures it at 55.4 tokens/s and very verbose); Xiaomi's published launch benchmarks for it are recorded in [docs/benchmarks.md](benchmarks.md).
> - **Meta (Muse Spark)** — the table shows the **Standard** tier of the Meta Model API (`muse-spark-1.3`): $1.25 / $0.15 cached input / $4.25 per 1M tokens, with automatic prefix caching and no long-context surcharge. Meta's day-one **Contributor** SKU (`muse-spark-1.3-contributor`) is $0.10 / $0.002 / $0.20 per 1M — about 12× cheaper on input and 21× on output — but Meta may use those prompts and completions to train future models, so it is excluded from this comparison the way promotions are. Integrated web-search grounding is billed separately at $2.50 per 1,000 queries on both tiers, and rate limits are 3,000 RPM / 4M TPM (Standard) versus 100 RPM / 3M TPM (Contributor). Muse Spark 1.3 is closed and API-only (Meta has announced future open weights without a date), and its audio understanding is degraded versus Muse Spark 1.2 — Meta recommends 1.2 or Muse Voice Transcribe for audio.
> - For typical Copilot chat usage (short-to-medium prompts), you'll almost always fall in the lowest pricing tier.

> **How long does 7,000 credits last?** A Pro+ subscriber running 50-turn sessions can estimate monthly capacity by multiplying each modeled session cost by 100 to convert it to AI credits, then mixing models as needed.

> Prices last verified: October 24, 2026. Always check the official pages for the latest rates:
>
> - [GitHub Copilot models & pricing](https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing)
> - [OpenAI pricing](https://openai.com/api/pricing/)
> - [OpenAI GPT-5.6 announcement](https://openai.com/index/gpt-5-6/)
> - [OpenAI GPT-5.6 price update](https://openai.com/index/advancing-the-price-performance-frontier-with-gpt-5-6/)
> - [OpenAI GPT-6 Sol and Luna announcement](https://openai.com/index/introducing-gpt-6-sol-and-luna/)
> - [OpenAI GPT-6 Sol API details](https://developers.openai.com/api/docs/models/gpt-6-sol)
> - [OpenAI GPT-6 Luna API details](https://developers.openai.com/api/docs/models/gpt-6-luna)
> - [OpenAI GPT-6.1 Sol announcement](https://openai.com/index/introducing-gpt-6-1-sol/)
> - [OpenAI GPT-6.1 Sol API details](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
> - [Anthropic (Claude) pricing](https://platform.claude.com/docs/en/about-claude/pricing)
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
> - [Artificial Analysis GPT-6 Sol](https://artificialanalysis.ai/models/gpt-6-sol), [GPT-6 Luna](https://artificialanalysis.ai/models/gpt-6-luna), [GPT-6.1 Sol](https://artificialanalysis.ai/models/gpt-6-1-sol), [Claude Opus 5.5](https://artificialanalysis.ai/models/claude-opus-5-5), [Claude Sonnet 5.5](https://artificialanalysis.ai/models/claude-sonnet-5-5), [Claude Haiku 5.5](https://artificialanalysis.ai/models/claude-haiku-5-5), [MiMo-V2.6-Flash](https://artificialanalysis.ai/models/mimo-v2-6-flash), [Gemini 4 Argon](https://artificialanalysis.ai/models/gemini-4-argon), [Muse Spark 1.3](https://artificialanalysis.ai/models/muse-spark-1-3), [Kimi K3.1 Pro](https://artificialanalysis.ai/models/kimi-k3-1-pro), and [MiniMax-M3.1-Flash](https://artificialanalysis.ai/models/minimax-m3-1-flash)
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
