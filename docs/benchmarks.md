# Benchmark Scores

> **Updated:** June 17, 2026 — scores sourced from official model announcements, the [Arena (Chatbot Arena) leaderboard](https://arena.ai/leaderboard/text), and the [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index).

A comparison of the **Arena top 10** alongside models available through **GitHub Copilot** (native) and the **custom-endpoint models** this repo supports. Rows are ordered by **AA Intelligence Index** score (highest first). Models without an AA score are listed after scored ones, sorted by Arena rank. Cells with `—` have no verified public score available. Footnotes explain missing or approximate ranks.

## Main table

| #   | Model                 | Provider  | Source          | AA Intelligence Index | Arena Overall |
| --- | --------------------- | --------- | --------------- | --------------------- | ------------- |
| 1   | **Claude Fable 5**    | Anthropic | N/A             | **59.9**              | #1            |
| 2   | **Claude Opus 4.8**   | Anthropic | Copilot native  | **55.7**              | #12 (#9)      |
| 3   | **GPT-5.5**           | OpenAI    | Copilot native  | **54.8** ¹            | #18 (#10)     |
| 4   | **Claude Opus 4.7**   | Anthropic | Copilot native  | **53.5**              | #5 (#3)       |
| 5   | **GPT-5.4**           | OpenAI    | Copilot native  | **51.4** ¹            | #27 (#11)     |
| 6   | **Gemini 3.5 Flash**  | Google    | Copilot native  | **50.2**              | #13           |
| 7   | **Claude Sonnet 4.6** | Anthropic | Copilot native  | **47.2**              | #24           |
| 8   | **Gemini 3.1 Pro**    | Google    | Copilot native  | **46.5**              | #7            |
| 9   | **Qwen 3.7 Max**      | DashScope | Custom endpoint | **46.0**              | #16           |
| 10  | **MiniMax M3**        | MiniMax   | Custom endpoint | **44.4**              | #42           |
| 11  | **DeepSeek V4 Pro**   | DeepSeek  | Custom endpoint | **44.3**              | #36           |
| 12  | **Muse Spark**        | Meta      | N/A             | **43.1**              | #6            |
| 13  | **Kimi K2.7 Code**    | Moonshot  | Custom endpoint | —                     | — ⁶           |
| 14  | **Kimi K2.6**         | Moonshot  | Custom endpoint | **42.8**              | #31           |
| 15  | **MiMo V2.5 Pro**     | Xiaomi    | Custom endpoint | **42.2**              | #28           |
| 16  | **DeepSeek V4 Flash** | DeepSeek  | Custom endpoint | **40.3**              | #66           |
| 17  | **GLM 5.1**           | Z.ai      | Custom endpoint | **40.2**              | #15           |
| 18  | **GPT-5.4 mini**      | OpenAI    | Copilot native  | **40.0**              | #48           |
| 19  | **Qwen 3.6 Plus**     | DashScope | Custom endpoint | **39.6**              | #55           |
| 20  | **Qwen 3.7 Plus**     | DashScope | Custom endpoint | **39.0**              | —             |
| 21  | **Claude Opus 4.6**   | Anthropic | N/A             | —                     | #4 (#2)       |
| 22  | **Gemini 3 Pro**      | Google    | N/A             | —                     | #8            |
| 23  | **Gemini 3 Flash**    | Google    | Copilot native  | —                     | #20           |
| 24  | **GPT-5.3-Codex**     | OpenAI    | Copilot native  | —                     | #49 ³         |
| 25  | **MiMo V2.5**         | Xiaomi    | Custom endpoint | —                     | #68           |
| 26  | **Claude Haiku 4.5**  | Anthropic | Copilot native  | —                     | #105          |
| 27  | **MiMo V2 Flash**     | Xiaomi    | Custom endpoint | —                     | #128          |
| 28  | **Raptor mini**       | GitHub    | Copilot native  | —                     | — ⁴           |
| 29  | **MAI-Code-1-Flash**  | Microsoft | Copilot native  | —                     | — ⁵           |
| 30  | **GLM 5V Turbo**      | Z.ai      | Custom endpoint | —                     | — ⁷           |

¹ GPT-5.5 (54.8) and GPT-5.4 (51.4) AA scores are from the **xhigh** preset; their high presets score lower.
² Parenthesized Arena ranks indicate the **thinking** variant (Claude) or **-high** preset (GPT-5.5, GPT-5.4) of the same underlying model. Arena treats these as separate entries because extended reasoning changes response quality in blind votes.
³ Arena lists `gpt-5.3-chat-latest` at #49; the exact `GPT-5.3-Codex` model name may differ.
⁴ Raptor mini does not appear on the Arena leaderboard under that name.
⁵ `mai-1-preview` appears on the Arena leaderboard but has insufficient votes for a rank.
⁶ `kimi-k2.7-code` is not listed under that exact model ID on Arena. Kimi K2.6 (#31) is the closest match.
⁷ `glm-5v-turbo` is a multimodal variant; the Arena text leaderboard only lists `glm-5.1` (#15) in the GLM 5-series.

## Column key: what each benchmark measures

| Benchmark                 | What it measures                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AA Intelligence Index** | Composite score (0–100) aggregating nine independent evaluations: GDPval-AA v2, 𝜏³-Banking, Terminal-Bench v2.1, SciCode, Humanity's Last Exam, GPQA Diamond, CritPt, AA-Omniscience, and AA-LCR. Measures reasoning, coding, knowledge, instruction following, and multi-step tasks. Source: [artificialanalysis.ai](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index). |
| **Arena Overall**         | Crowdsourced blind-vote Elo ranking across all categories (text, agent, vision, code). Source: [arena.ai/leaderboard](https://arena.ai/leaderboard).                                                                                                                                                                                                                                                     |

## Adding scores

To add benchmark scores for other models, submit a PR with the source (official announcement, peer-reviewed leaderboard snapshot, or validation run). Prefer linking to the existing model doc under `docs/models/` rather than duplicating scores here.
