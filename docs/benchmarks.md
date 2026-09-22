# Benchmark Scores

> **Updated:** September 23, 2026 — the refresh incorporates Xiaomi MiMo V2.6, xAI Grok 4.7, Gemini 3.8 Flash's Copilot availability, and current OpenRouter Artificial Analysis v4.3.2 metadata; the September 23 roster cleanup removes two retired legacy rows. It retains **Terminal-Bench 4.0**, **ARC-AGI-3**, **FrontierMath Tier 4 (v2)**, and **AutomationBench** as the official OpenAI comparison columns. Current OpenRouter AA values are not mixed with launch-era scores quoted by model vendors.

A comparison of models available through **GitHub Copilot** (native or extension), custom endpoints, and comparison-only API rows. Rows are ordered by the **current OpenRouter AA Intelligence Index** score (highest first); models without a current composite are listed after scored rows. Cells with `—` mean that no directly comparable public result was verified. The four task columns are **official OpenAI comparison results**, not Arena scores and not independent AA composite scores. Values were checked against live sources on September 15, 2026.

`MiniMax M3 Priority` is intentionally omitted because it is the same M3 model invoked with a priority service tier, not a separate model or benchmark subject. MiMo V2.6 Flash has no OpenRouter composite score. Pro UltraSpeed is the latency-focused service tier of Pro, so it shares Pro's score while remaining a separate priced API entry.

The live OpenRouter rankings card lists unversioned **Qwen3.8 Max** at **#2 with 53.4**. OpenRouter no longer exposes an exact `qwen/qwen3.8-max` entry in its public model API; its model-page documentation canonicalizes that link to `qwen/qwen3.8-max-0902`, whose current API metadata reports **45.4**. The table keeps the 53.4 ranking-card result attached to the historical 0803 comparison record and records 0902's API value separately. Do not treat those two values as interchangeable.

## Main table

| #   | Model                        | Provider  | Source            | AA Intelligence Index (OpenRouter) | Terminal-Bench 4.0 | ARC-AGI-3 | FrontierMath Tier 4 (v2) | AutomationBench |
| --- | ---------------------------- | --------- | ----------------- | ---------------------------------- | ------------------ | --------- | ------------------------ | --------------- |
| 1   | **Claude Fable 5.1**         | Anthropic | Copilot native    | **53.4**                           | 55.8%              | —         | 87.8%                    | 31.4%           |
| 2   | **Qwen 3.8 Max (0803)³⁰**    | DashScope | Comparison only   | **53.4**                           | —                  | —         | —                        | —               |
| 3   | **GPT-6 Astra**              | OpenAI    | Copilot native    | **52.7**                           | **57.9%**          | **99.9%** | **97.6%**                | **41.4%**       |
| 4   | **Claude Opus 5**            | Anthropic | Copilot native    | **50.8**                           | 52.6%              | 30.2%     | 73.2%                    | 26.9%           |
| 5   | **Claude Fable 5**           | Anthropic | Copilot native    | **49.6**                           | 44.5%              | —         | 90.2%                    | 17.4%           |
| 6   | **GPT-5.6 Sol**              | OpenAI    | Copilot native    | **47.0**                           | 37.3%              | 7.8%      | 83.0%                    | 18.1%           |
| 7   | **Grok 4.7**                 | xAI       | Copilot native    | **46.4**                           | —                  | —         | —                        | —               |
| 8   | **MiMo V2.6 Pro**            | Xiaomi    | Custom endpoint   | **46.3**                           | —                  | —         | —                        | —               |
| 9   | **MiMo V2.6 Pro UltraSpeed** | Xiaomi    | Custom endpoint   | **46.3**                           | —                  | —         | —                        | —               |
| 10  | **Qwen 3.8 Max (0902)**      | DashScope | Custom endpoint   | **45.4**                           | —                  | —         | —                        | —               |
| 11  | **GLM 5.3**                  | Z.ai      | Custom endpoint   | **44.8**                           | —                  | —         | —                        | —               |
| 12  | **Grok 4.6**                 | xAI       | Copilot native    | **44.3**                           | —                  | —         | —                        | —               |
| 13  | **Kimi K3**                  | Moonshot  | Custom endpoint   | **43.6**                           | —                  | —         | —                        | —               |
| 14  | **GPT-5.6 Terra**            | OpenAI    | Copilot native    | **42.1**                           | —                  | —         | —                        | —               |
| 15  | **GLM 5.3 Flash**            | Z.ai      | Custom endpoint   | **41.8**                           | —                  | —         | —                        | —               |
| 16  | **Gemini 3.8 Flash**         | Google    | Copilot native    | **40.9**                           | —                  | —         | —                        | —               |
| 17  | **DeepSeek V4.1 Flash**      | DeepSeek  | Copilot extension | **39.5**                           | —                  | —         | —                        | —               |
| 18  | **Claude Sonnet 5**          | Anthropic | Copilot native    | **38.2**                           | —                  | —         | —                        | —               |
| 19  | **GPT-5.6 Luna**             | OpenAI    | Copilot native    | **37.3**                           | —                  | —         | —                        | —               |
| 20  | **DeepSeek V4 Pro 0813**     | DeepSeek  | Copilot extension | **36.0**                           | —                  | —         | —                        | —               |
| 21  | **MiniMax M3**               | MiniMax   | Custom endpoint   | **29.2**                           | —                  | —         | —                        | —               |
| 22  | **MiMo V2.6 Flash**          | Xiaomi    | Custom endpoint   | —                                  | —                  | —         | —                        | —               |

## Column key: what each benchmark measures

| Benchmark                    | What it measures                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AA Intelligence Index**    | Composite score (0–100) aggregating nine independent evaluations: GDPval-AA v2, 𝜏³-Banking, Terminal-Bench v2.1, SciCode, Humanity's Last Exam, GPQA Diamond, CritPt, AA-Omniscience, and AA-LCR. Measures reasoning, coding, knowledge, instruction following, and multi-step tasks. Source: [artificialanalysis.ai](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index). |
| **Terminal-Bench 4.0**       | Agentic terminal benchmark covering software engineering, system configuration, and data-analysis tasks. Values in the main table are from OpenAI's GPT-6 Astra comparison. Source: [OpenAI](https://openai.com/index/gpt-6-astra/).                                                                                                                                                                     |
| **ARC-AGI-3**                | Abstract reasoning benchmark measuring adaptation to novel interactive environments. Values in the main table are from OpenAI's reported comparison. Source: [OpenAI](https://openai.com/index/gpt-6-astra/).                                                                                                                                                                                            |
| **FrontierMath Tier 4 (v2)** | Advanced mathematical problem-solving evaluation at the highest reported tier. Values in the main table are from OpenAI's reported comparison. Source: [OpenAI](https://openai.com/index/gpt-6-astra/).                                                                                                                                                                                                  |
| **AutomationBench**          | Professional-work automation benchmark covering multi-step knowledge-work tasks. Values in the main table are from OpenAI's reported comparison. Source: [OpenAI](https://openai.com/index/gpt-6-astra/).                                                                                                                                                                                                |

## Adding scores

To add benchmark scores for other models, submit a PR with the exact benchmark version, effort/configuration, and source. Do not combine vendor-reported scores from different benchmark versions into the main comparison. Prefer linking to the existing model doc under `docs/models/` rather than duplicating setup details here.
