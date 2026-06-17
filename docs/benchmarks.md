# Benchmark Scores

> **Updated:** June 17, 2026 — scores sourced from official model announcements, the [Arena (Chatbot Arena) leaderboard](https://arena.ai/leaderboard/text), and the [Artificial Analysis Intelligence Index](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index).

A comparison of the **Arena top 10** alongside models available through **GitHub Copilot** (native) and the **custom-endpoint models** this repo supports. Rows are ordered by **AA Intelligence Index** score (highest first). Models without an AA score are listed after scored ones, sorted by Arena rank. Cells with `—` have no verified public score available. Footnotes explain missing or approximate ranks.

## Main table

| #   | Model                 | Provider  | Source          | AA Intelligence Index | Text Arena | Agent Arena | Code Arena | Arena Overall |
| --- | --------------------- | --------- | --------------- | --------------------- | ---------- | ----------- | ---------- | ------------- |
| 1   | **Claude Fable 5**    | Anthropic | N/A             | **59.9**              | #1         | #1          | #1         | #1            |
| 2   | **Claude Opus 4.8**   | Anthropic | Copilot native  | **55.7**              | #12 (#9)   | #11 (#2)    | #7 (#4)    | #12 (#9)      |
| 3   | **GPT-5.5**           | OpenAI    | Copilot native  | **54.8** ¹            | #16 (#10)  | #7 (#3)     | #26 (#16)  | #18 (#10)     |
| 4   | **Claude Opus 4.7**   | Anthropic | Copilot native  | **53.5**              | #5 (#3)    | #4 (#5)     | #5 (#3)    | #5 (#3)       |
| 5   | **GPT-5.4**           | OpenAI    | Copilot native  | **51.4** ¹            | #27 (#11)  | — ⁹         | #40 (#25)  | #27 (#11)     |
| 6   | **Gemini 3.5 Flash**  | Google    | Copilot native  | **50.2**              | #13        | #15         | #15        | #13           |
| 7   | **Claude Sonnet 4.6** | Anthropic | Copilot native  | **47.2**              | #24        | #12         | #11        | #24           |
| 8   | **Gemini 3.1 Pro**    | Google    | Copilot native  | **46.5**              | #7         | #17         | #27        | #7            |
| 9   | **Qwen 3.7 Max**      | DashScope | Custom endpoint | **46.0**              | #17        | —           | #10        | #17           |
| 10  | **MiniMax M3**        | MiniMax   | Custom endpoint | **44.4**              | #49        | #19         | #13        | #42           |
| 11  | **DeepSeek V4 Pro**   | DeepSeek  | Custom endpoint | **44.3**              | #38 (#36)  | #14         | — ¹⁰       | #36           |
| 12  | **GPT-5.3-Codex**     | OpenAI    | Copilot native  | **44.0** ²            | #47 ³      | —           | #37        | #49 ³         |
| 13  | **Kimi K2.6**         | Moonshot  | Custom endpoint | **42.8**              | #34        | #16         | #12        | #31           |
| 14  | **MiMo V2.5 Pro**     | Xiaomi    | Custom endpoint | **42.2**              | #29        | —           | #21        | #28           |
| 15  | **Kimi K2.7 Code**    | Moonshot  | Custom endpoint | **42.0**              | — ⁶        | —           | #20        | — ⁶           |
| 16  | **DeepSeek V4 Flash** | DeepSeek  | Custom endpoint | **40.3**              | #67 (#63)  | #18         | —          | #66           |
| 17  | **GLM 5.1**           | Z.ai      | Custom endpoint | **40.2**              | #15        | #13         | #9         | #15           |
| 18  | **GPT-5.4 mini**      | OpenAI    | Copilot native  | **40.0**              | #50        | —           | #39        | #48           |
| 19  | **Qwen 3.6 Plus**     | DashScope | Custom endpoint | **39.6**              | #55        | #20         | #23        | #55           |
| 20  | **Qwen 3.7 Plus**     | DashScope | Custom endpoint | **39.0**              | —          | —           | —          | —             |
| 21  | **GLM 5V Turbo**      | Z.ai      | Custom endpoint | **34.0** ²            | — ⁷        | —           | —          | — ⁷           |
| 22  | **Gemini 3 Flash**    | Google    | Copilot native  | **27.0** ²            | #20        | #24         | #31        | #20           |
| 23  | **MiMo V2.5**         | Xiaomi    | Custom endpoint | —                     | #69        | —           | #33        | #68           |
| 24  | **MiMo V2 Flash**     | Xiaomi    | Custom endpoint | **23.0** ²            | #129       | —           | #63        | #128          |
| 25  | **Claude Haiku 4.5**  | Anthropic | Copilot native  | —                     | #106       | —           | #68        | #105          |
| 26  | **Raptor mini**       | GitHub    | Copilot native  | —                     | — ⁴        | —           | —          | — ⁴           |
| 27  | **MAI-Code-1-Flash**  | Microsoft | Copilot native  | —                     | — ⁵        | —           | —          | — ⁵           |

¹ GPT-5.5 (54.8) and GPT-5.4 (51.4) AA scores are from the **xhigh** preset; their high presets score lower.

² Score is an **estimate** from Artificial Analysis (labelled "independent evaluation forthcoming"). Not a confirmed run of the full evaluation suite.

³ Parenthesized ranks indicate the **thinking** variant (Claude) or **-high** preset (GPT-5.5, GPT-5.4) of the same underlying model within each arena. Arena treats these as separate entries because extended reasoning changes response quality in blind votes.

⁴ Arena text leaderboard lists `gpt-5.3-chat-latest` at #47; the exact `GPT-5.3-Codex` model name may differ.

⁵ Raptor mini does not appear on any Arena leaderboard under that name.

⁶ `mai-1-preview` appears on the Arena text leaderboard but has insufficient votes for a rank.

⁷ `kimi-k2.7-code` is not listed on the Arena text leaderboard but ranks **#20 on the Code WebDev arena** (1478 Elo). Kimi K2.6 (#34) is the closest match on the text leaderboard.

⁸ `glm-5v-turbo` is a multimodal variant; the Arena text leaderboard only lists `glm-5.1` (#15) in the GLM 5-series.

⁹ GPT-5.4 (base) is not listed on the Agent Arena; the high preset (GPT-5.4 High) ranks #9.

¹⁰ DeepSeek V4 Pro (base) is not listed on the Code Arena; the thinking variant (DeepSeek V4 Pro Thinking) ranks #24.

## Column key: what each benchmark measures

| Benchmark                 | What it measures                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AA Intelligence Index** | Composite score (0–100) aggregating nine independent evaluations: GDPval-AA v2, 𝜏³-Banking, Terminal-Bench v2.1, SciCode, Humanity's Last Exam, GPQA Diamond, CritPt, AA-Omniscience, and AA-LCR. Measures reasoning, coding, knowledge, instruction following, and multi-step tasks. Source: [artificialanalysis.ai](https://artificialanalysis.ai/evaluations/artificial-analysis-intelligence-index). |
| **Text Arena**            | Crowdsourced blind-vote Elo ranking for text-to-text tasks (math, coding, creative writing, open-ended domains). Source: [arena.ai/leaderboard/text](https://arena.ai/leaderboard/text).                                                                                                                                                                                                                 |
| **Agent Arena**           | Crowdsourced blind-vote Elo ranking for agentic tool-orchestration tasks, based on signals like tool reliability, task completion, and steerability. Source: [arena.ai/leaderboard/agent](https://arena.ai/leaderboard/agent).                                                                                                                                                                           |
| **Code Arena (WebDev)**   | Crowdsourced blind-vote Elo ranking for front-end web development tasks, including agentic coding workflows. Source: [arena.ai/leaderboard/code/webdev](https://arena.ai/leaderboard/code/webdev).                                                                                                                                                                                                       |
| **Arena Overall**         | Crowdsourced blind-vote Elo ranking across all categories (text, agent, vision, code). Source: [arena.ai/leaderboard](https://arena.ai/leaderboard).                                                                                                                                                                                                                                                     |

## Adding scores

To add benchmark scores for other models, submit a PR with the source (official announcement, peer-reviewed leaderboard snapshot, or validation run). Prefer linking to the existing model doc under `docs/models/` rather than duplicating scores here.
