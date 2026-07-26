# Benchmark Scores

> **Updated:** July 26, 2026 — Claude Opus 5 added (released July 24, 2026). AA Intelligence Index **61.0** (#1 overall).

A comparison of the **Arena top 10** alongside models available through **GitHub Copilot** (native) and the **custom-endpoint models** this repo supports. Rows are ordered by **AA Intelligence Index** score (highest first). Models without an AA score are listed after scored ones, sorted by Arena rank. Cells with `—` have no verified public score available. Footnotes explain missing or approximate ranks.

## Main table

| #   | Model                 | Provider  | Source          | AA Intelligence Index | Text Arena | Agent Arena | Code Arena | Arena Overall |
| --- | --------------------- | --------- | --------------- | --------------------- | ---------- | ----------- | ---------- | ------------- |
| 1   | **Claude Opus 5**     | Anthropic | Copilot native  | **61.0**              | — ¹⁶       | — ¹⁶        | — ¹⁶       | — ¹⁶          |
| 2   | **Claude Fable 5**    | Anthropic | N/A             | **59.9**              | #1         | #1          | #1         | #1            |
| 3   | **GPT-5.6 Sol**       | OpenAI    | Copilot native  | **58.9**              | #8 (xhigh) | —           | #2 (xhigh) | #8 (xhigh)    |
| 4   | **Kimi K3**           | Moonshot  | Custom endpoint | **57.0**              | — ¹⁴       | —           | —          | — ¹⁴          |
| 5   | **Claude Opus 4.8**   | Anthropic | Copilot native  | **55.7**              | #12 (#9)   | #11 (#2)    | #7 (#4)    | #12 (#9)      |
| 6   | **GPT-5.6 Terra**     | OpenAI    | Copilot native  | **55.0**              | —          | —           | —          | —             |
| 7   | **GPT-5.5**           | OpenAI    | Copilot native  | **54.8** ¹            | #20 (#12)  | #9 (#3)     | #18 (#17)  | #20 (#12)     |
| 8   | **Claude Opus 4.7**   | Anthropic | Copilot native  | **53.5**              | #5 (#3)    | #4 (#5)     | #5 (#3)    | #5 (#3)       |
| 9   | **Claude Sonnet 5**   | Anthropic | Copilot native  | **53.0**              | — ¹²       | — ¹²        | — ¹²       | — ¹²          |
| 10  | **GPT-5.4**           | OpenAI    | Copilot native  | **51.4** ¹            | #34 (#13)  | #8 ⁹        | #49 (#28)  | #34 (#13)     |
| 11  | **GPT-5.6 Luna**      | OpenAI    | Copilot native  | **51.2**              | —          | —           | —          | —             |
| 12  | **GLM 5.2**           | Z.ai      | Custom endpoint | **51.0**              | #33        | —           | #3 ¹¹      | #33           |
| 13  | **Gemini 3.5 Flash**  | Google    | Copilot native  | **50.2**              | #13        | #15         | #15        | #13           |
| 14  | **Gemini 3.6 Flash**  | Google    | Copilot native  | **50.0**              | — ¹⁵       | — ¹⁵        | — ¹⁵       | — ¹⁵          |
| 15  | **Claude Sonnet 4.6** | Anthropic | Copilot native  | **47.2**              | #24        | #12         | #11        | #24           |
| 16  | **Gemini 3.1 Pro**    | Google    | Copilot native  | **46.5**              | #7         | #17         | #27        | #7            |
| 17  | **Qwen 3.7 Max**      | DashScope | Custom endpoint | **46.0**              | #17        | —           | #10        | #17           |
| 18  | **MiniMax M3**        | MiniMax   | Custom endpoint | **44.4**              | #49        | #19         | #13        | #42           |
| 19  | **DeepSeek V4 Pro**   | DeepSeek  | Custom endpoint | **44.3**              | #38 (#36)  | #14         | — ¹⁰       | #36           |
| 20  | **GPT-5.3-Codex**     | OpenAI    | Copilot native  | **44.0** ²            | #47 ³,⁴    | —           | #37        | #49 ³,⁴       |
| 21  | **Kimi K2.6**         | Moonshot  | Custom endpoint | **42.8**              | #34        | #16         | #12        | #31           |
| 22  | **MiMo V2.5 Pro**     | Xiaomi    | Custom endpoint | **42.2**              | #29        | —           | #21        | #28           |
| 23  | **Kimi K2.7 Code**    | Moonshot  | Custom endpoint | **42.0**              | — ⁷        | —           | #20        | — ⁷           |
| 24  | **DeepSeek V4 Flash** | DeepSeek  | Custom endpoint | **40.3**              | #67 (#63)  | #18         | —          | #66           |
| 25  | **GLM 5.1**           | Z.ai      | Custom endpoint | **40.2**              | #15        | #13         | #9         | #15           |
| 26  | **GPT-5.4 mini**      | OpenAI    | Copilot native  | **40.0**              | #50        | —           | #39        | #48           |
| 27  | **MiMo V2.5**         | Xiaomi    | Custom endpoint | **40** ²              | #69        | —           | #33        | #68           |
| 28  | **Qwen 3.6 Plus**     | DashScope | Custom endpoint | **39.6**              | #55        | #20         | #23        | #55           |
| 29  | **Qwen 3.7 Plus**     | DashScope | Custom endpoint | **39.0**              | —          | —           | —          | —             |
| 30  | **GLM 5V Turbo**      | Z.ai      | Custom endpoint | **34.0** ²            | — ⁸        | —           | —          | — ⁸           |
| 31  | **Claude Haiku 4.5**  | Anthropic | Copilot native  | —                     | #106       | —           | #68        | #105          |
| 32  | **Raptor mini**       | GitHub    | Copilot native  | —                     | — ⁵        | —           | —          | — ⁵           |
| 33  | **MAI-Code-1-Flash**  | Microsoft | Copilot native  | —                     | — ⁶        | —           | —          | — ⁶           |

¹ GPT-5.5 (54.8) and GPT-5.4 (51.4) AA scores are from the **xhigh** preset; their high presets score lower.

² Score is an **estimate** from Artificial Analysis (labelled "independent evaluation forthcoming"). Not a confirmed run of the full evaluation suite. Exception: **GLM 5.2 (51.0)** has a confirmed published Intelligence Index score on its [dedicated model page](https://artificialanalysis.ai/models/glm-5-2).

³ Parenthesized ranks indicate the **thinking** variant (Claude) or **-high** preset (GPT-5.5, GPT-5.4) of the same underlying model within each arena. Arena treats these as separate entries because extended reasoning changes response quality in blind votes.

⁴ Arena text leaderboard lists `gpt-5.3-chat-latest` at #47; the exact `GPT-5.3-Codex` model name may differ.

⁵ Raptor mini does not appear on any Arena leaderboard under that name.

⁶ `mai-1-preview` appears on the Arena text leaderboard but has insufficient votes for a rank.

⁷ `kimi-k2.7-code` is not listed on the Arena text leaderboard but ranks **#20 on the Code WebDev arena** (1478 Elo). Kimi K2.6 (#34) is the closest match on the text leaderboard.

⁸ `glm-5v-turbo` is a multimodal variant; the Arena text leaderboard only lists `glm-5.1` (#15) in the GLM 5-series.

⁹ GPT-5.4 (base) is not listed on the Agent Arena; the high preset (GPT-5.4 High) ranks #9.

¹⁰ DeepSeek V4 Pro (base) is not listed on the Code Arena; the thinking variant (DeepSeek V4 Pro Thinking) ranks #24.

¹¹ `glm-5.2` ranks **#25 on the Text/Overall arenas**, **#11 on General Coding**, and **#3 on the Code WebDev / Front-end specific Arena** (as shown in [arena.ai/leaderboard](https://arena.ai/leaderboard/)).

¹² **Claude Sonnet 5** was released on **June 30, 2026** — too recent for Arena rankings (insufficient votes). AA Intelligence Index score (**53.0**) is confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-sonnet-5). Anthropic's official pricing confirms $3.00 / $15.00 per MTok input/output (standard, from Sep 1, 2026) with introductory pricing of $2.00 / $10.00 through August 31, 2026. Supports text + image input, 1M context window, and adaptive reasoning. Uses a newer tokenizer (~30% more tokens than Sonnet 4.6 and earlier).

¹³ **GPT-5.6** was released on **July 9, 2026**. Artificial Analysis reports Intelligence Index scores of **58.9** for Sol, **55.0** for Terra, and **51.2** for Luna; all support text + image input and a 1M-token context window. Arena's July 10 snapshot lists `gpt-5.6-sol-xhigh` at **#8 in Text Arena** and `gpt-5.6-sol-xhigh (codex-harness)` at **#2 in Code/WebDev Arena**; the exact `max` variants and Terra/Luna are not listed. See [OpenAI's GPT-5.6 announcement](https://openai.com/index/gpt-5-6/) and the [Sol](https://artificialanalysis.ai/models/gpt-5-6-sol), [Terra](https://artificialanalysis.ai/models/gpt-5-6-terra), and [Luna](https://artificialanalysis.ai/models/gpt-5-6-luna) model pages.

¹⁴ **Kimi K3** was released on **July 16, 2026**. AA Intelligence Index score (**57.0**) is confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/kimi-k3). Too new for Arena rankings. 2.8T parameters (open-source, weights by July 27, 2026). 1M context window, text + image + video input, always-thinking reasoning model. Uses `reasoning_effort` (not the K2.x `thinking` parameter). See [Kimi K3 quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart) and the [technical blog](https://www.kimi.com/blog/kimi-k3).

¹⁵ **Gemini 3.6 Flash** was released on **July 21, 2026**. AA Intelligence Index score (**50.0**) is confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/gemini-3-6-flash). Too new for Arena rankings. 1M context window, text + image + video input, reasoning model. Priced at $1.50 / $7.50 per MTok input/output.

¹⁶ **Claude Opus 5** was released on **July 24, 2026**. AA Intelligence Index score (**61.0**) is confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-opus-5). Too new for Arena rankings (2 days old). 1M context window, text + image input, adaptive reasoning model. Priced at $5.00 / $0.50 / $25.00 per MTok input/cached/output (same as Opus 4.8). Uses the newer Claude tokenizer (~30% more tokens than pre-4.7 models). Also available in Fast mode ($10/$50 per MTok input/output). See [Anthropic's Opus 5 announcement](https://www.anthropic.com/news/claude-opus-5) and the [AA model page](https://artificialanalysis.ai/models/claude-opus-5).

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
