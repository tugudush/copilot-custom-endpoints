# Benchmark Scores

> **Updated:** September 23, 2026 — the refresh adds the September 22 Copilot releases Claude Opus 5.5, GPT-6 Sol, and GPT-6 Luna; it also incorporates Xiaomi MiMo V2.6, xAI Grok 4.7, Gemini 3.8 Flash, and current OpenRouter Artificial Analysis v4.3.2 metadata. It retains **Terminal-Bench 4.0**, **ARC-AGI-3**, **FrontierMath Tier 4 (v2)**, and **AutomationBench** as the comparable OpenAI release-comparison columns. New vendor-reported results for Opus 5.5, Sol, and Luna are listed separately below so their versions and effort settings remain explicit. Current OpenRouter AA values are not mixed with launch-era scores quoted by model vendors.

A comparison of models available through **GitHub Copilot** (native or extension), custom endpoints, and comparison-only API rows. Rows are ordered by the **current OpenRouter AA Intelligence Index** score (highest first); models without a current composite are listed after scored rows. Cells with `—` mean that no directly comparable public result was verified. The four task columns retain the **OpenAI GPT-6 Astra release comparison**; they are not Arena scores or independent AA composites. New vendor-reported results are summarized separately below. Values were checked against live sources on September 23, 2026.

`MiniMax M3 Priority` is intentionally omitted because it is the same M3 model invoked with a priority service tier, not a separate model or benchmark subject. MiMo V2.6 Flash has no OpenRouter composite score. Pro UltraSpeed is the latency-focused service tier of Pro, so it shares Pro's score while remaining a separate priced API entry.

The live OpenRouter rankings card lists unversioned **Qwen3.8 Max** at **#2 with 53.4**. OpenRouter no longer exposes an exact `qwen/qwen3.8-max` entry in its public model API; its model-page documentation canonicalizes that link to `qwen/qwen3.8-max-0902`, whose current API metadata reports **45.4**. The table keeps the 53.4 ranking-card result attached to the historical 0803 comparison record and records 0902's API value separately. Do not treat those two values as interchangeable.

## Main table

| #   | Model                        | Provider  | Source            | AA Intelligence Index (OpenRouter) | Terminal-Bench 4.0 | ARC-AGI-3 | FrontierMath Tier 4 (v2) | AutomationBench |
| --- | ---------------------------- | --------- | ----------------- | ---------------------------------- | ------------------ | --------- | ------------------------ | --------------- |
| 1   | **Claude Opus 5.5**          | Anthropic | Copilot native    | **57.6**                           | —                  | —         | —                        | —               |
| 2   | **Claude Fable 5.1**         | Anthropic | Copilot native    | **53.4**                           | 55.8%              | —         | 87.8%                    | 31.4%           |
| 3   | **Qwen 3.8 Max (0803)³⁰**    | DashScope | Comparison only   | **53.4**                           | —                  | —         | —                        | —               |
| 4   | **GPT-6 Astra**              | OpenAI    | Copilot native    | **52.7**                           | **57.9%**          | **99.9%** | **97.6%**                | **41.4%**       |
| 5   | **Claude Opus 5**            | Anthropic | Copilot native    | **50.8**                           | 52.6%              | 30.2%     | 73.2%                    | 26.9%           |
| 6   | **Claude Fable 5**           | Anthropic | Copilot native    | **49.6**                           | 44.5%              | —         | 90.2%                    | 17.4%           |
| 7   | **GPT-6 Sol**                | OpenAI    | Copilot native    | **47.5**                           | —                  | —         | —                        | —               |
| 8   | **GPT-5.6 Sol**              | OpenAI    | Copilot native    | **47.0**                           | 37.3%              | 7.8%      | 83.0%                    | 18.1%           |
| 9   | **Grok 4.7**                 | xAI       | Copilot native    | **46.4**                           | —                  | —         | —                        | —               |
| 10  | **MiMo V2.6 Pro**            | Xiaomi    | Custom endpoint   | **46.3**                           | —                  | —         | —                        | —               |
| 11  | **MiMo V2.6 Pro UltraSpeed** | Xiaomi    | Custom endpoint   | **46.3**                           | —                  | —         | —                        | —               |
| 12  | **Qwen 3.8 Max (0902)**      | DashScope | Custom endpoint   | **45.4**                           | —                  | —         | —                        | —               |
| 13  | **GLM 5.3**                  | Z.ai      | Custom endpoint   | **44.8**                           | —                  | —         | —                        | —               |
| 14  | **Grok 4.6**                 | xAI       | Copilot native    | **44.3**                           | —                  | —         | —                        | —               |
| 15  | **Kimi K3**                  | Moonshot  | Custom endpoint   | **43.6**                           | —                  | —         | —                        | —               |
| 16  | **GPT-5.6 Terra**            | OpenAI    | Copilot native    | **42.1**                           | —                  | —         | —                        | —               |
| 17  | **GLM 5.3 Flash**            | Z.ai      | Custom endpoint   | **41.8**                           | —                  | —         | —                        | —               |
| 18  | **Gemini 3.8 Flash**         | Google    | Copilot native    | **40.9**                           | —                  | —         | —                        | —               |
| 19  | **DeepSeek V4.1 Flash**      | DeepSeek  | Copilot extension | **39.5**                           | —                  | —         | —                        | —               |
| 20  | **Claude Sonnet 5**          | Anthropic | Copilot native    | **38.2**                           | —                  | —         | —                        | —               |
| 21  | **GPT-6 Luna**               | OpenAI    | Copilot native    | **37.3**                           | —                  | —         | —                        | —               |
| 22  | **GPT-5.6 Luna**             | OpenAI    | Copilot native    | **37.3**                           | —                  | —         | —                        | —               |
| 23  | **DeepSeek V4 Pro 0813**     | DeepSeek  | Copilot extension | **36.0**                           | —                  | —         | —                        | —               |
| 24  | **MiniMax M3**               | MiniMax   | Custom endpoint   | **29.2**                           | —                  | —         | —                        | —               |
| 25  | **MiMo V2.6 Flash**          | Xiaomi    | Custom endpoint   | —                                  | —                  | —         | —                        | —               |

## September 22 Release Results

These are publisher-reported results from separate launch evaluations. Their effort settings, harnesses, and fallback policies differ from the main table, so they are not merged into its four cross-model task columns.

| Model           | Benchmark                        | Result   | Setting or caveat                           | Source                                                             |
| --------------- | -------------------------------- | -------- | ------------------------------------------- | ------------------------------------------------------------------ |
| Claude Opus 5.5 | Terminal-Bench 4.0               | 66.4%    | xhigh; standard error ±2.6 points           | [Anthropic](https://www.anthropic.com/claude-opus-5-5)             |
| Claude Opus 5.5 | FrontierCode 1.1 Main            | 54.4%    | Adaptive thinking, max effort               | [Anthropic](https://www.anthropic.com/claude-opus-5-5)             |
| Claude Opus 5.5 | GDPval-AA v2.1                   | 1846 Elo | Adaptive thinking, max effort               | [Anthropic](https://www.anthropic.com/claude-opus-5-5)             |
| Claude Opus 5.5 | AutomationBench 1.0.6            | 40.0%    | Zapier early-access run; no fallback models | [Anthropic](https://www.anthropic.com/claude-opus-5-5)             |
| GPT-6 Sol       | AutomationBench 1.0.6            | 33.2%    | xhigh effort; $0.27 per task                | [OpenAI](https://openai.com/index/introducing-gpt-6-sol-and-luna/) |
| GPT-6 Sol       | Agents' Last Exam V1             | 56.4%    | Maximum effort                              | [OpenAI](https://openai.com/index/introducing-gpt-6-sol-and-luna/) |
| GPT-6 Sol       | DeepSWE v1.1                     | 68.8%    | Maximum effort                              | [OpenAI](https://openai.com/index/introducing-gpt-6-sol-and-luna/) |
| GPT-6 Sol       | OSWorld 2.0 offline, v2026.08.08 | 60.5%    | xhigh effort; partial reward                | [OpenAI](https://openai.com/index/introducing-gpt-6-sol-and-luna/) |
| GPT-6 Luna      | DeepSWE v1.1                     | 66.6%    | Maximum effort                              | [OpenAI](https://openai.com/index/introducing-gpt-6-sol-and-luna/) |

OpenAI also reports GPT-6 Luna high-effort AutomationBench improving by 5.4 percentage points over GPT-5.6 Luna at 58% lower cost per task; its release page does not give the absolute score. On OSWorld 2.0, Luna at maximum effort exceeds GPT-5.6 Sol at medium effort for one tenth the cost, again without a directly stated score.

## Column key: what each benchmark measures

| Benchmark                    | What it measures                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AA Intelligence Index**    | Current v4.3.2 composite score (0–100) aggregating ten evaluations: AA-Briefcase v1.1, GDPval-AA v2.1, AutomationBench-AA, Terminal-Bench 4.0, SciCode, Humanity's Last Exam, GDP.pdf, CritPt, AA-Omniscience, and AA-LCR v1.1. Measures agentic work, coding, reasoning, knowledge, and long-context performance. Source: [Artificial Analysis](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index). |
| **Terminal-Bench 4.0**       | Agentic terminal benchmark covering software engineering, system configuration, and data-analysis tasks. Values in the main table are from OpenAI's GPT-6 Astra comparison. Source: [OpenAI](https://openai.com/index/gpt-6-astra/).                                                                                                                                                                                                |
| **ARC-AGI-3**                | Abstract reasoning benchmark measuring adaptation to novel interactive environments. Values in the main table are from OpenAI's reported comparison. Source: [OpenAI](https://openai.com/index/gpt-6-astra/).                                                                                                                                                                                                                       |
| **FrontierMath Tier 4 (v2)** | Advanced mathematical problem-solving evaluation at the highest reported tier. Values in the main table are from OpenAI's reported comparison. Source: [OpenAI](https://openai.com/index/gpt-6-astra/).                                                                                                                                                                                                                             |
| **AutomationBench**          | Professional-work automation benchmark covering multi-step knowledge-work tasks. Values in the main table are from OpenAI's reported comparison. Source: [OpenAI](https://openai.com/index/gpt-6-astra/).                                                                                                                                                                                                                           |

## Adding scores

To add benchmark scores for other models, submit a PR with the exact benchmark version, effort/configuration, and source. Do not combine vendor-reported scores from different benchmark versions into the main comparison. Prefer linking to the existing model doc under `docs/models/` rather than duplicating setup details here.
