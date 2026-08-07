# Benchmark Scores

> **Updated:** August 7, 2026 — All AA Intelligence Index scores refreshed to **Index v4.1.1** (most models gained ~1–2.5 pts versus the previous values). Qwen 3.8 Max confirmed at **58.1**; **Grok 4.5** added for comparison. Claude Opus 5 leads at **63.1**.

A comparison of the **Arena top 10** alongside models available through **GitHub Copilot** (native) and the **custom-endpoint models** this repo supports. Rows are ordered by **AA Intelligence Index** score (highest first). Models without an AA score are listed after scored ones, sorted by Arena rank. Cells with `—` have no verified public score available. Footnotes explain missing or approximate ranks. Scores were re-verified on August 7, 2026 against the current Artificial Analysis Intelligence Index (methodology v4.1.1); nearly all models moved up ~1–2.5 points versus the previously recorded values.

## Main table

| #   | Model                      | Provider  | Source          | AA Intelligence Index | Text Arena | Agent Arena | Code Arena | Arena Overall |
| --- | -------------------------- | --------- | --------------- | --------------------- | ---------- | ----------- | ---------- | ------------- |
| 1   | **Claude Opus 5**          | Anthropic | Copilot native  | **63.1**              | —          | —           | —          | —             |
| 2   | **Claude Fable 5**         | Anthropic | N/A             | **62.1**              | #1         | #1          | #1         | #1            |
| 3   | **GPT-5.6 Sol**            | OpenAI    | Copilot native  | **60.9**              | #8 (xhigh) | —           | #2 (xhigh) | #8 (xhigh)    |
| 4   | **Kimi K3**                | Moonshot  | Custom endpoint | **59.7**              | — ¹⁴       | —           | —          | — ¹⁴          |
| 5   | **Qwen 3.8 Max**           | DashScope | Custom endpoint | **58.1** ¹⁵           | #5 ¹⁶      | —           | #4 ¹⁶      | —             |
| 6   | **Claude Opus 4.8**        | Anthropic | Copilot native  | **57.3**              | #12 (#9)   | #11 (#2)    | #7 (#4)    | #12 (#9)      |
| 7   | **GPT-5.6 Terra**          | OpenAI    | Copilot native  | **56.6**              | —          | —           | —          | —             |
| 8   | **GPT-5.5**                | OpenAI    | Copilot native  | **56.3** ¹            | #20 (#12)  | #9 (#3)     | #18 (#17)  | #20 (#12)     |
| 9   | **Grok 4.5**               | xAI       | N/A             | **55.8** ¹⁷           | —          | —           | —          | —             |
| 10  | **Claude Sonnet 5**        | Anthropic | Copilot native  | **55.3**              | — ¹²       | — ¹²        | — ¹²       | — ¹²          |
| 11  | **Claude Opus 4.7**        | Anthropic | Copilot native  | **55.0**              | #5 (#3)    | #4 (#5)     | #5 (#3)    | #5 (#3)       |
| 12  | **GPT-5.4**                | OpenAI    | Copilot native  | **53.1** ¹            | #34 (#13)  | #8 ⁹        | #49 (#28)  | #34 (#13)     |
| 13  | **GLM 5.2**                | Z.ai      | Custom endpoint | **52.6**              | #33        | —           | #3 ¹¹      | #33           |
| 14  | **GPT-5.6 Luna**           | OpenAI    | Copilot native  | **52.3**              | —          | —           | —          | —             |
| 15  | **Gemini 3.5 Flash**       | Google    | Copilot native  | **52.0**              | #13        | #15         | #15        | #13           |
| 16  | **DeepSeek V4 Flash 0731** | DeepSeek  | Custom endpoint | **51.8** ¹⁸           | #67 (#63)  | #18         | —          | #66           |
| 17  | **Gemini 3.6 Flash**       | Google    | Copilot native  | **51.6**              | — ¹³       | — ¹³        | — ¹³       | — ¹³          |
| 18  | **Claude Sonnet 4.6**      | Anthropic | Copilot native  | **48.4**              | #24        | #12         | #11        | #24           |
| 19  | **Gemini 3.1 Pro**         | Google    | Copilot native  | **47.7**              | #7         | #17         | #27        | #7            |
| 20  | **Qwen 3.7 Max**           | DashScope | Custom endpoint | **46.7**              | #17        | —           | #10        | #17           |
| 21  | **MiniMax M3**             | MiniMax   | Custom endpoint | **45.4**              | #49        | #19         | #13        | #42           |
| 22  | **DeepSeek V4 Pro**        | DeepSeek  | Custom endpoint | **45.3**              | #38 (#36)  | #14         | — ¹⁰       | #36           |
| 23  | **Kimi K2.6**              | Moonshot  | Custom endpoint | **45.0**              | #34        | #16         | #12        | #31           |
| 24  | **Kimi K2.7 Code**         | Moonshot  | Custom endpoint | **43.0**              | — ⁷        | —           | #20        | — ⁷           |
| 25  | **MiMo V2.5 Pro**          | Xiaomi    | Custom endpoint | **42.9**              | #29        | —           | #21        | #28           |
| 26  | **GLM 5.1**                | Z.ai      | Custom endpoint | **41.0**              | #15        | #13         | #9         | #15           |
| 27  | **GPT-5.4 mini**           | OpenAI    | Copilot native  | **40.9**              | #50        | —           | #39        | #48           |
| 28  | **Qwen 3.6 Plus**          | DashScope | Custom endpoint | **40.0**              | #55        | #20         | #23        | #55           |
| 29  | **Qwen 3.7 Plus**          | DashScope | Custom endpoint | **39.4**              | —          | —           | —          | —             |
| 30  | **MiMo V2.5**              | Xiaomi    | Custom endpoint | **38.0**              | #69        | —           | #33        | #68           |
| 31  | **GLM 5V Turbo**           | Z.ai      | Custom endpoint | **35.0** ²            | — ⁸        | —           | —          | — ⁸           |

¹ GPT-5.5 (56.3) and GPT-5.4 (53.1) AA scores are from the **xhigh** preset; their high presets score lower.

² Score is an **estimate** from Artificial Analysis (labelled "independent evaluation forthcoming"). Not a confirmed run of the full evaluation suite. As of August 7, 2026, **GLM 5V Turbo (35.0)** is the only remaining estimate in this table — MiMo V2.5 is now a measured **38.0**.

³ Parenthesized ranks indicate the **thinking** variant (Claude) or **-high** preset (GPT-5.5, GPT-5.4) of the same underlying model within each arena. Arena treats these as separate entries because extended reasoning changes response quality in blind votes.

⁴ `kimi-k2.7-code` is not listed on the Arena text leaderboard but ranks **#20 on the Code WebDev arena** (1478 Elo). Kimi K2.6 (#34) is the closest match on the text leaderboard.

⁵ `glm-5v-turbo` is a multimodal variant; the Arena text leaderboard only lists `glm-5.1` (#15) in the GLM 5-series.

⁶ GPT-5.4 (base) is not listed on the Agent Arena; the high preset (GPT-5.4 High) ranks #9.

⁷ DeepSeek V4 Pro (base) is not listed on the Code Arena; the thinking variant (DeepSeek V4 Pro Thinking) ranks #24.

⁸ `glm-5.2` ranks **#25 on the Text/Overall arenas**, **#11 on General Coding**, and **#3 on the Code WebDev / Front-end specific Arena** (as shown in [arena.ai/leaderboard](https://arena.ai/leaderboard/)).

⁹ **Claude Sonnet 5** was released on **June 30, 2026** — too recent for Arena rankings (insufficient votes). AA Intelligence Index score (**55.3**) is confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-sonnet-5). Anthropic's official pricing confirms $3.00 / $15.00 per MTok input/output (standard, from Sep 1, 2026) with introductory pricing of $2.00 / $10.00 through August 31, 2026. Supports text + image input, 1M context window, and adaptive reasoning. Uses a newer tokenizer (~30% more tokens than Sonnet 4.6 and earlier).

¹⁰ **GPT-5.6** was released on **July 9, 2026**. Artificial Analysis reports Intelligence Index scores of **60.9** for Sol, **56.6** for Terra, and **52.3** for Luna; all support text + image input and a 1M-token context window. Arena's July 10 snapshot lists `gpt-5.6-sol-xhigh` at **#8 in Text Arena** and `gpt-5.6-sol-xhigh (codex-harness)` at **#2 in Code/WebDev Arena**; the exact `max` variants and Terra/Luna are not listed. See [OpenAI's GPT-5.6 announcement](https://openai.com/index/gpt-5-6/) and the [Sol](https://artificialanalysis.ai/models/gpt-5-6-sol), [Terra](https://artificialanalysis.ai/models/gpt-5-6-terra), and [Luna](https://artificialanalysis.ai/models/gpt-5-6-luna) model pages.

¹¹ **Kimi K3** was released on **July 16, 2026**. AA Intelligence Index score (**59.7**) is confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/kimi-k3). Too new for Arena rankings. 2.8T parameters (open-source, weights by July 27, 2026). 1M context window, text + image + video input, always-thinking reasoning model. Uses `reasoning_effort` (not the K2.x `thinking` parameter). See [Kimi K3 quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart) and the [technical blog](https://www.kimi.com/blog/kimi-k3).

¹² **Gemini 3.6 Flash** was released on **July 21, 2026**. AA Intelligence Index score (**51.6**) is confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/gemini-3-6-flash). Too new for Arena rankings. 1M context window, text + image + video input, reasoning model. Priced at $1.50 / $7.50 per MTok input/output.

¹³ **Claude Opus 5** was released on **July 24, 2026**. AA Intelligence Index score (**63.1**) is confirmed by [Artificial Analysis](https://artificialanalysis.ai/models/claude-opus-5). Too new for Arena rankings. 1M context window, text + image input, adaptive reasoning model. Priced at $5.00 / $0.50 / $25.00 per MTok input/cached/output (same as Opus 4.8). Uses the newer Claude tokenizer (~30% more tokens than pre-4.7 models). Also available in Fast mode ($10/$50 per MTok input/output). See [Anthropic's Opus 5 announcement](https://www.anthropic.com/news/claude-opus-5) and the [AA model page](https://artificialanalysis.ai/models/claude-opus-5).

¹⁴ **Qwen 3.8 Max** (`qwen3.8-max`) launched on **August 3, 2026**. Qwen's [official release post](https://qwen.ai/blog?id=qwen3.8) reports **86.6** on Terminal-Bench 2.1, **67.7** on SWE-bench Pro, **72.5** on Toolathlon Verified, **43.6** on Humanity's Last Exam, **93.0** on PaperBench, **92.1** on OmniDocBench 1.5, **82.8** on IFBench, and **91.5** on Parametric CAD Bench. These are vendor-reported results, not independent replications.

¹⁵ **Qwen 3.8 Max** now has a confirmed Artificial Analysis run: **Intelligence Index 58.1** (**#9/185**; AA lists a rounded **58** on its [model page](https://artificialanalysis.ai/models/qwen3-8-max)), with OpenRouter metadata additionally reporting **Coding Index 71.8** and **Agentic Index 58.4** for `qwen/qwen3.8-max`.

¹⁶ Arena snapshots: **Text #5, 1496 ±10** (August 1, 2026), **Vision #2, 1305 ±9** (August 1, 2026), and **Code/WebDev #4, 1668 ±18** (August 2, 2026). Qwen 3.8 Max is not listed in the August 4 Agent Arena table. See [Text Arena](https://arena.ai/leaderboard/text), [Vision Arena](https://arena.ai/leaderboard/vision), [Code Arena](https://arena.ai/leaderboard/code/webdev), and [Agent Arena](https://arena.ai/leaderboard/agent).

¹⁷ **Grok 4.5** (xAI, released **July 8, 2026**) is included for comparison — it is neither a GitHub Copilot native model nor a custom-endpoint model in this repo. AA Intelligence Index **55.8** (high preset), Coding **72.4**, Agentic **48.9**. 500K context window, text + image input. Priced at $2.00 / $0.30 / $6.00 per 1M input/cached/output. Arena rankings not verified.

¹⁸ **DeepSeek V4 Flash 0731** — AA Intelligence Index **51.8** ("Reasoning, Max Effort" variant, per OpenRouter/AA). This resolves the repo's earlier inconsistency (README 49.9 vs this table 40.3); the current published value is 51.8.

## Qwen 3.8 evidence matrix

| Evaluation           | Qwen-reported score | Evidence type |
| -------------------- | ------------------- | ------------- |
| Terminal-Bench 2.1   | **86.6**            | Vendor result |
| SWE-bench Pro        | **67.7**            | Vendor result |
| Toolathlon Verified  | **72.5**            | Vendor result |
| Humanity's Last Exam | **43.6**            | Vendor result |
| PaperBench           | **93.0**            | Vendor result |
| OmniDocBench 1.5     | **92.1**            | Vendor result |
| IFBench              | **82.8**            | Vendor result |
| Parametric CAD Bench | **91.5**            | Vendor result |

These scores describe the published Qwen evaluation package and should not be collapsed into a synthetic overall score. Artificial Analysis has now published an independent Intelligence Index run for Qwen 3.8 Max (**58.1**, #9/185) — see footnote ¹⁵ above.

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
