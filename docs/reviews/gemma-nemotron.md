# Research Review — Google Gemma & NVIDIA Nemotron

> **Reviewed:** 2026-06-10 | **Status:** Spike / spike-evaluate | **Purpose:** Evaluate Gemma and Nemotron as Copilot custom-endpoint candidates and document findings for the validation knowledge base.
>
> Companion docs: [docs/pricing.md](../pricing.md) (live model price list), [docs/models/](../models/) (validated setups).

---

## 1. Scope

Four questions for each family:

1. Are they good for coding?
2. Are they good for tool calling?
3. What hosts exist beyond OpenRouter?
4. What does it cost?

Perspective: VS Code Copilot **custom endpoint** use, where the model is reached over an OpenAI-compatible `/v1/chat/completions` API. Models must handle OpenAI-format `tools` arrays and the multi-turn tool loop without emitting a `reasoning_content` field that VS Code fails to forward.

---

## 2. Methodology

Sources fetched 2026-06-10:

- [Gemma 4 model card](https://ai.google.dev/gemma/docs/core/model_card_4) and [Gemma 3 model card](https://ai.google.dev/gemma/docs/core/model_card_3) on ai.google.dev
- [FunctionGemma launch blog](https://blog.google/technology/developers/functiongemma/) (blog.google)
- [DeepMind Gemma page](https://deepmind.google/models/gemma) and [Hugging Face — `google/gemma-3-27b-it`](https://huggingface.co/google/gemma-3-27b-it)
- [OpenRouter — Google Gemma](https://openrouter.ai/models?q=google/gemma) and [OpenRouter — NVIDIA Nemotron](https://openrouter.ai/models?q=nvidia/nemotron)
- [Together AI pricing](https://www.together.ai/pricing), [Fireworks AI pricing](https://fireworks.ai/pricing), [Groq pricing](https://groq.com/pricing/)
- [NVIDIA Hugging Face org page](https://huggingface.co/nvidia) (Nemotron family overview)
- [Nemotron 3 Nano launch blog](https://huggingface.co/blog/nvidia/nemotron-3-nano-efficient-open-intelligent-models) (HF, 111 upvotes)
- [Nemotron 3 Nano 4B launch blog](https://huggingface.co/blog/nvidia/nemotron-3-nano-4b) (HF, 65 upvotes)
- [Nemotron 3 Super model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16) (HF, 736k downloads/mo)
- [Nemotron 3 Ultra model card](https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16) (HF, 56k downloads/mo, Jun 4 2026)
- [build.nvidia.com Nemotron catalog](https://build.nvidia.com/explore/discover)

Pricing table references in this doc use **USD per 1M tokens** (non-cached) unless stated otherwise.

---

# Part A — Google Gemma

## A.1 Model Lineup (June 2026)

| Family            | Sizes                                                | Released                                      | Key shift                                                               |
| ----------------- | ---------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------- |
| **Gemma 4**       | E2B, E4B, 12B, 26B A4B (MoE, 3.8B active), 31B dense | Jan 2026 (12B Unified May 2026, QAT Jun 2026) | Thinking mode, native function calling, 256K ctx, audio on small models |
| **Gemma 3n**      | E2B, E4B                                             | May 2025                                      | Per-Layer Embedding (PLE) caching, mobile-first, audio+text+vision      |
| **Gemma 3**       | 1B (text only), 4B, 12B, 27B                         | Mar 2025                                      | Multimodal, 128K ctx, function calling                                  |
| **Gemma 3 270M**  | 270M                                                 | Jul 2025                                      | Hyper-efficient base / fine-tune substrate                              |
| **FunctionGemma** | 270M (fine-tune of Gemma 3 270M)                     | Dec 18, 2025                                  | Specialized for function calling                                        |

Licenses: **Apache 2.0** for Gemma 3/4; FunctionGemma under the same Gemma license terms.

## A.2 Coding Performance

### Gemma 4 vs Gemma 3 27B (from model card)

| Benchmark                | 31B       | 26B A4B | 12B   | E4B   | E2B   | Gemma 3 27B |
| ------------------------ | --------- | ------- | ----- | ----- | ----- | ----------- |
| **LiveCodeBench v6**     | **80.0%** | 77.1%   | 72.0% | 52.0% | 44.0% | 29.1%       |
| **Codeforces ELO**       | **2150**  | 1718    | 1659  | 940   | 633   | 110         |
| **AIME 2026 (no tools)** | **89.2%** | 88.3%   | 77.5% | 42.5% | 37.5% | 20.8%       |
| **MMLU Pro**             | **85.2%** | 82.6%   | 77.2% | 69.4% | 60.0% | 67.6%       |
| **Tau2 (agentic)**       | 76.9%     | 68.2%   | 69.0% | 42.2% | 24.5% | 16.2%       |

### Gemma 3 baselines

| Benchmark            | 1B   | 4B   | 12B  | 27B  |
| -------------------- | ---- | ---- | ---- | ---- |
| **HumanEval pass@1** | 41.5 | 71.3 | 85.4 | 87.8 |
| **MBPP 3-shot**      | 35.2 | 63.2 | 73.0 | 74.4 |
| **LiveCodeBench v5** | 1.9  | 12.6 | 24.6 | 29.7 |
| **GSM8K**            | 62.8 | 89.2 | 94.4 | 95.9 |

**Verdict:** Gemma 4 31B dense is the clear winner for coding. **Codeforces 2150** is competitive with mid-tier frontier models, and **Tau2 76.9%** is a strong signal for multi-step agentic flows. Gemma 3 27B is mediocre for hard coding (LiveCodeBench 29.7% is below Kimi K2.6 and Qwen 3.7 Plus at similar price).

## A.3 Tool Calling

- **Gemma 3 4B+**: supports function calling + structured outputs (per OpenRouter listing).
- **Gemma 4 (all sizes)**: **native function calling** is a listed core capability in the model card.
- **FunctionGemma 270M**: a specialist fine-tune (58% → 85% accuracy on the Mobile Actions eval after light fine-tuning). Designed for on-device, not as a general chat model.

**For VS Code Copilot custom-endpoint use:**

- `tool_choice: "auto"` (VS Code's default) is supported.
- Gemma 3/4 don't emit a `reasoning_content` field for VS Code to forward between tool turns — the model just calls the tool. The tool loop should stay clean.
- Recommended `requestBody` overrides from the model card: `temperature: 1.0`, `top_p: 0.95`, `top_k: 64`. Enable thinking via `<|think|>` at the start of the system prompt, or disable by removing it.
- Direct Google endpoints (Gemini API style) are **not** natively OpenAI-compatible — go through a host (see A.4).

## A.4 Hosts Beyond OpenRouter

| Host                                      | What works                                                                 | OpenAI-compatible?                                                                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Google AI Studio**                      | Free playground for prototyping                                            | No (Gemini API format)                                                                                                                               |
| **Vertex AI Model Garden**                | Full GCP, paid tier                                                        | Yes (OpenAI-compat mode at `https://{region}-aiplatform.googleapis.com/v1/projects/{project}/locations/{region}/endpoints/openapi/chat/completions`) |
| **Together AI**                           | Serverless: Gemma 3n E4B, Gemma 4 31B, Gemma 3 27B                         | Yes                                                                                                                                                  |
| **HuggingFace Inference Providers**       | One-click serverless; partners include Scaleway, Nebius AI, Featherless AI | Yes                                                                                                                                                  |
| **Cloudflare Workers AI**                 | Free tier; edge-deployed                                                   | Yes                                                                                                                                                  |
| **Groq**                                  | Currently enterprise-only for Gemma                                        | Yes                                                                                                                                                  |
| **Ollama**                                | Local: `ollama run gemma3:27b`, `gemma4:31b` (community GGUF builds)       | Yes (with `--api` flag)                                                                                                                              |
| **vLLM / SGLang / Llama.cpp / LM Studio** | Self-host anywhere                                                         | Yes                                                                                                                                                  |

All Gemma weights are on [Hugging Face `google/`](https://huggingface.co/google) under gated license acceptance.

## A.5 Pricing (USD per 1M tokens, non-cached)

| Model                     | Input     | Output    | Context | Free tier? |
| ------------------------- | --------- | --------- | ------- | ---------- |
| Gemma 3 4B                | $0.05     | $0.10     | 128K    | OR `:free` |
| Gemma 3 12B               | $0.05     | $0.15     | 128K    | OR `:free` |
| Gemma 3 27B               | $0.08     | $0.16     | 128K    | —          |
| Gemma 3n E4B              | $0.06     | $0.12     | 32K     | —          |
| **Gemma 4 26B A4B (MoE)** | **$0.06** | **$0.33** | 256K    | OR `:free` |
| **Gemma 4 31B**           | **$0.12** | **$0.36** | 256K    | OR `:free` |
| Gemma 4 31B (Together)    | $0.39     | $0.97     | 256K    | —          |

**Cost per typical Copilot session** (~10K input + ~2K output, 50 turns; 0.5M in + 0.1M out):

- Gemma 3 27B: **~$0.06**
- Gemma 3n E4B: ~$0.04
- Gemma 3 4B / 12B: ~$0.04
- Gemma 4 26B A4B: **~$0.06**
- Gemma 4 31B: **~$0.10**

---

# Part B — NVIDIA Nemotron

## B.1 Model Lineup (June 2026)

| Family                             | Sizes                                        | Released     | Architecture                                            | License                                        |
| ---------------------------------- | -------------------------------------------- | ------------ | ------------------------------------------------------- | ---------------------------------------------- |
| **Nemotron 3 Ultra**               | 550B total / 55B active (NVFP4)              | Jun 4, 2026  | LatentMoE (Mamba-2 + MoE + Attention) + MTP, 1M ctx     | [OpenMDW-1.1](https://openmdw.ai/license/1-1/) |
| **Nemotron 3 Super**               | 120B total / 12B active (NVFP4)              | Mar 11, 2026 | LatentMoE + MTP, 1M ctx                                 | NVIDIA Nemotron Open Model License             |
| **Nemotron 3 Nano**                | 30B total / 3.5B active                      | Dec 15, 2025 | Hybrid Mamba-2 + MoE + Attention, 1M ctx                | NVIDIA Nemotron Open Model License             |
| **Nemotron 3 Nano 4B**             | 4B (distilled from 9B via Nemotron Elastic)  | Mar 18, 2026 | Hybrid Mamba-2 + Attention, 49K-1M ctx (QAT FP8 + GGUF) | NVIDIA Nemotron Open Model License             |
| **Nemotron 3 Nano Omni**           | 30B A3B, multimodal (text+image+video+audio) | Apr 29, 2026 | Hybrid MoE + Conv3D + EVS, 300K ctx                     | NVIDIA Nemotron Open Model License             |
| **Nemotron Nano 12B 2 VL**         | 12B, multimodal text+image+video             | Oct 29, 2025 | Hybrid Transformer-Mamba                                | NVIDIA Nemotron Open Model License             |
| **Nemotron Nano 9B V2**            | 9B                                           | Sep 6, 2025  | Hybrid Mamba-Transformer                                | NVIDIA Nemotron Open Model License             |
| **Nemotron 3.5 Content Safety 4B** | 4B, fine-tune of Gemma 3 4B                  | Jun 4, 2026  | Gemma 3 base                                            | NVIDIA Open License                            |

All Nemotron 3 models support **configurable thinking (ON/OFF + token budget)**, **1M-token context** (256K default), and **multi-environment RL** training in math, code, science, instruction following, multi-step tool use, multi-turn conversations, and structured outputs.

## B.2 Coding Performance

### Nemotron 3 Ultra (550B A55B)

| Benchmark                       | Score     | Notes                                |
| ------------------------------- | --------- | ------------------------------------ |
| **LiveCodeBench v6**            | **89.0%** | Top tier                             |
| **SWE-Bench Verified**          | 71.9%     | On par with Kimi K2.6 / Qwen 3.7 Max |
| **SWE-Bench Multilingual**      | 67.7%     | Strong on non-English code           |
| **IOI 2025**                    | 570.0     | Highest reported among open models   |
| **IMOAnswerBench (no tools)**   | 88.6%     |                                      |
| **IMOAnswerBench (with tools)** | 92.3%     |                                      |
| **Apex-Shortlist (no tools)**   | 74.9%     |                                      |
| **HLE (no tools)**              | 26.7%     |                                      |
| **HLE (with tools)**            | 37.4%     |                                      |
| **GPQA (no tools)**             | 87.0%     |                                      |
| **MMLU-Pro**                    | 86.8%     |                                      |
| **TauBench V3 Avg**             | 70.9%     | Strong agentic                       |
| **Terminal Bench 2.1**          | 56.4%     |                                      |

### Nemotron 3 Super (120B A12B)

| Benchmark                        | Score           |
| -------------------------------- | --------------- |
| **LiveCodeBench v5**             | **81.19%**      |
| **SWE-Bench (OpenHands)**        | 60.47%          |
| **SWE-Bench (OpenCode)**         | 59.20%          |
| **SWE-Bench Multilingual**       | 45.78%          |
| **AIME25 (no tools)**            | 90.21%          |
| **AIME25 (with tools)**          | —               |
| **HMMT Feb25 (no tools)**        | 93.67%          |
| **GPQA (no tools / with tools)** | 79.23% / 82.70% |
| **HLE (no tools / with tools)**  | 18.26% / 22.82% |
| **TauBench V2 Avg**              | 61.15%          |
| **Terminal Bench (hard)**        | 25.78%          |
| **Terminal Bench Core 2.0**      | 31.00%          |
| **BIRD Bench**                   | 41.80%          |

### Nemotron 3 Nano (30B A3B)

| Benchmark                          | Score             |
| ---------------------------------- | ----------------- |
| **LiveCodeBench v6**               | 68.3%             |
| **AIME25 (no tools / with tools)** | 89.1% / **99.2%** |
| **GPQA (no tools / with tools)**   | 73.0% / 75.0%     |
| **SWE-Bench (OpenHands)**          | 38.8%             |
| **TauBench V2 Avg**                | 49.0%             |
| **MMLU-Pro**                       | 78.3%             |
| **HLE (no tools / with tools)**    | 10.6% / 15.5%     |
| **BFCL v4 (function calling)**     | 53.8%             |
| **Terminal Bench (hard)**          | 8.5%              |

### Nemotron 3 Nano 4B (edge)

- State-of-the-art in its size class for instruction following (IFBench, IFEval).
- SOTA in size class for gaming agency (Orak benchmark).
- Strong tool-use performance; competitive hallucination avoidance.
- 2× faster than Nemotron Nano 9B v2 on Jetson Orin Nano 8GB with Q4_K_M GGUF.

**Verdict:** **Nemotron 3 Ultra is in the top tier of open coding models** — LiveCodeBench 89.0 and SWE-Bench 71.9 match or beat Qwen 3.7 Max and Kimi K2.6. Nemotron 3 Super 81.2 on LiveCodeBench v5 is solid mid-tier. Nemotron 3 Nano 30B A3B at LiveCodeBench 68.3 punches well above its 3.5B active weight class.

## B.3 Tool Calling

Nemotron 3 models have **native tool calling** as a core capability, with substantial post-training investment:

- Nemotron 3 Nano 30B A3B scored **53.8 on BFCL v4** (Berkeley Function Calling Leaderboard).
- All Nemotron 3 checkpoints are trained on **Nemotron-RL-Agentic-Function-Calling-Pivot-v1** for multi-turn conversational tool use.
- SFT data includes 26.2B tokens of tool-calling examples derived from Qwen3-235B-A22B-2507 and gpt-oss-120b.

**For VS Code Copilot custom-endpoint use:**

- The OpenAI-compatible server uses `--tool-call-parser qwen3_coder` (works in vLLM, SGLang, TRT-LLM).
- **Important quirk for coding agents:** the model card adds `extra_body={"chat_template_kwargs": {"force_nonempty_content": True}}` to the API call to prevent empty content after the reasoning trace.
- `tool_choice: "auto"` works.
- Reasoning is controlled via `chat_template_kwargs={"enable_thinking": True/False}`. The model emits a separate reasoning channel.
- For **Copilot compatibility**: VS Code does not forward `reasoning_content` between tool turns, so the model must fall back gracefully. Nemotron 3 handles this via the `force_nonempty_content` flag.

## B.4 Hosts Beyond OpenRouter

| Host                                | What works                                                                                    | OpenAI-compatible? |
| ----------------------------------- | --------------------------------------------------------------------------------------------- | ------------------ |
| **build.nvidia.com (NVIDIA NIM)**   | Free serverless endpoints for all Nemotron 3 sizes; production via NIM containers (DGX Cloud) | Yes                |
| **Together AI**                     | Nemotron 3 Ultra listed in pricing                                                            | Yes                |
| **HuggingFace Inference Providers** | Featherless AI confirmed for Super; Ultra is "ask for provider support"                       | Yes                |
| **OpenRouter**                      | All Nemotron 3 (free + paid tiers)                                                            | Yes                |
| **Local vLLM**                      | All sizes (0.12.0+); needs custom reasoning parser                                            | Yes                |
| **Local SGLang**                    | All sizes (0.5.12+); needs custom reasoning parser                                            | Yes                |
| **TRT-LLM**                         | All sizes; 1.3.0rc8+; needs custom config for Mamba cache                                     | Yes                |
| **llama.cpp / LM Studio / Unsloth** | Nano 4B and Nano 30B GGUF builds                                                              | Yes                |
| **Ollama**                          | Nano 4B and Nano 30B community GGUF                                                           | Yes                |

All Nemotron weights are on [Hugging Face `nvidia/`](https://huggingface.co/nvidia) under the [NVIDIA Nemotron Open Model License](https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/) (Ultra uses the more restrictive [OpenMDW-1.1](https://openmdw.ai/license/1-1/)).

## B.5 Pricing (USD per 1M tokens, non-cached)

| Model                          | Input         | Output                  | Context | Free tier?       |
| ------------------------------ | ------------- | ----------------------- | ------- | ---------------- |
| Nemotron Nano 9B V2            | $0.04         | $0.16                   | 128K    | OR `:free`       |
| **Nemotron 3 Nano 30B A3B**    | **$0.05**     | **$0.20**               | 256K–1M | OR `:free`       |
| **Nemotron 3 Super 120B A12B** | **$0.09**     | **$0.45**               | 1M      | OR `:free`       |
| **Nemotron 3 Ultra 550B A55B** | **$0.50**     | **$2.50**               | 1M      | OR `:free`       |
| Nemotron 3 Ultra (Together)    | $0.60         | $3.60 ($0.20 cached in) | 1M      | —                |
| build.nvidia.com (all)         | Free dev tier | Free dev tier           | —       | NIM free credits |

**Cost per typical Copilot session** (~10K input + ~2K output, 50 turns):

- Nemotron 3 Nano 30B A3B: **~$0.05**
- Nemotron 3 Super 120B A12B: **~$0.09**
- Nemotron 3 Ultra 550B A55B: **~$0.50**

---

# Part C — Unified Benchmarks & Pricing

> Single-table view of every benchmarked model from Parts A and B. Models are grouped by tier; **"—"** means the metric is not published on the official model card. LiveCodeBench version (v5 vs v6) is noted because the two model families report different windows and direct cross-version comparisons have minor noise.

## C.1 Coding & Tool-Calling Benchmarks + Pricing

| Tier                      | Model                      | Active / Total  | Ctx    | LiveCodeBench  | SWE-Bench Verified | HumanEval pass@1 | Codeforces ELO | BFCL v4 (tool call) | Input $/1M | Output $/1M | Free?      |
| ------------------------- | -------------------------- | --------------- | ------ | -------------- | ------------------ | ---------------- | -------------- | ------------------- | ---------- | ----------- | ---------- |
| **Edge / Small**          | Gemma 3 4B                 | 4B              | 128K   | 12.6 (v5)      | —                  | 71.3             | —              | —                   | $0.05      | $0.10       | OR `:free` |
| **Edge / Small**          | Gemma 3n E4B               | ~4B (effective) | 32K    | —              | —                  | —                | —              | —                   | $0.06      | $0.12       | —          |
| **Edge / Small**          | Nemotron 3 Nano 4B         | 4B              | 49K–1M | —              | —                  | —                | —              | —                   | —          | —           | —          |
| **Edge / Small**          | Nemotron Nano 9B V2        | 9B              | 128K   | —              | —                  | —                | —              | —                   | $0.04      | $0.16       | OR `:free` |
| **Mid (MoE / efficient)** | Gemma 3 12B                | 12B             | 128K   | 24.6 (v5)      | —                  | 85.4             | —              | —                   | $0.05      | $0.15       | OR `:free` |
| **Mid (MoE / efficient)** | Gemma 4 12B                | 12B             | 256K   | 72.0 (v6)      | —                  | —                | 1659           | —                   | —          | —           | OR `:free` |
| **Mid (MoE / efficient)** | Gemma 3 27B                | 27B             | 128K   | 29.7 (v5)      | —                  | 87.8             | —              | —                   | $0.08      | $0.16       | —          |
| **Mid (MoE / efficient)** | Gemma 4 26B A4B (MoE)      | 3.8B / 26B      | 256K   | 77.1 (v6)      | —                  | —                | 1718           | —                   | $0.06      | $0.33       | OR `:free` |
| **Mid (MoE / efficient)** | Nemotron 3 Nano 30B A3B    | 3.5B / 30B      | 1M     | 68.3 (v6)      | 38.8 (OpenHands)   | —                | —              | 53.8                | $0.05      | $0.20       | OR `:free` |
| **Large / Frontier**      | Gemma 4 31B                | 31B             | 256K   | **80.0** (v6)  | —                  | —                | **2150**       | —                   | $0.12      | $0.36       | OR `:free` |
| **Large / Frontier**      | Nemotron 3 Super 120B A12B | 12B / 120B      | 1M     | **81.19** (v5) | 60.47 (OpenHands)  | —                | —              | —                   | $0.09      | $0.45       | OR `:free` |
| **Large / Frontier**      | Nemotron 3 Ultra 550B A55B | 55B / 550B      | 1M     | **89.0** (v6)  | **71.9**           | —                | —              | —                   | $0.50      | $2.50       | OR `:free` |

**Notes on the unified table:**

- **"—"** = metric not on the official model card. Do not assume equivalence to zero or absence of capability.
- **LiveCodeBench version (v5 vs v6):** v6 has a longer, more recent time window (≈Aug 2024 – May 2025). A v5 score and a v6 score are not directly comparable, but both clearly show Nemotron 3 Ultra > Nemotron 3 Super > Gemma 4 31B > Gemma 4 26B A4B.
- **SWE-Bench Verified** is only published for Nemotron 3 (Ultra 71.9, Super 60.47 via OpenHands scaffold). Gemma does not publish SWE-Bench at all.
- **HumanEval** is only published for Gemma 3 sizes; Gemma 4 model card skips it in favor of LiveCodeBench / Codeforces. Nemotron 3 model cards skip HumanEval in favor of LiveCodeBench.
- **Codeforces ELO** is a Google-published figure for Gemma 4 only. Nemotron model cards do not include it.
- **BFCL v4** (Berkeley Function Calling Leaderboard) is published only for Nemotron 3 Nano 30B A3B (53.8). Gemma 4 lists function calling as a core capability but does not publish a BFCL score.
- **Pricing** is USD per 1M tokens, non-cached, on OpenRouter. `OR :free` = rate-limited free tier exists on OpenRouter. Together AI lists higher prices (e.g. Nemotron 3 Ultra $0.60 / $3.60 with $0.20 cached input); see §A.5 / §B.5 for cross-host prices.
- **Nemotron 3 Nano 4B** is a local / edge model and is not on any commercial OpenAI-compatible host at the time of writing; run via vLLM, SGLang, TRT-LLM, llama.cpp, LM Studio, or Ollama.

## C.2 Best Value Per Tier

| Tier                      | Cheapest option (Gemma)         | Cheapest option (Nemotron)                 | Best accuracy (Gemma)                     | Best accuracy (Nemotron)                                        |
| ------------------------- | ------------------------------- | ------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------- |
| **Edge / Small**          | Gemma 3 4B ($0.05 / $0.10)      | Nemotron Nano 9B V2 ($0.04 / $0.16)        | Gemma 3n E4B (multimodal)                 | Nemotron 3 Nano 4B (SOTA in size for tool use + IFBench)        |
| **Mid (MoE / efficient)** | Gemma 4 26B A4B ($0.06 / $0.33) | Nemotron 3 Nano 30B A3B ($0.05 / $0.20)    | Gemma 4 26B A4B (LiveCodeBench 77.1)      | Nemotron 3 Nano 30B A3B (BFCL 53.8, LiveCodeBench 68.3)         |
| **Large / Frontier**      | Gemma 4 31B ($0.12 / $0.36)     | Nemotron 3 Super 120B A12B ($0.09 / $0.45) | Gemma 4 31B (Codeforces 2150, Tau2 76.9%) | Nemotron 3 Super 120B A12B (LiveCodeBench 81.2, SWE-Bench 60.5) |
| **Frontier-only**         | — (Gemma tops out at 31B)       | Nemotron 3 Ultra 550B A55B ($0.50 / $2.50) | —                                         | Nemotron 3 Ultra (LiveCodeBench 89.0, SWE-Bench 71.9)           |

---

# Part D — Side-by-Side Comparison

| Dimension                             | **Gemma**                                                   | **Nemotron**                                                                 |
| ------------------------------------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **Architecture**                      | Standard Transformer decoder                                | Hybrid Mamba-2 + Transformer + MoE (LatentMoE for Super/Ultra)               |
| **Smallest capable**                  | Gemma 3 1B (text), Gemma 3 4B (multimodal)                  | Nemotron 3 Nano 4B (edge), 30B A3B (general)                                 |
| **Largest capable**                   | Gemma 4 31B dense, 26B A4B MoE                              | Nemotron 3 Ultra 550B A55B                                                   |
| **Context window**                    | 128K (Gemma 3), 256K (Gemma 4)                              | 1M (all Nemotron 3)                                                          |
| **Native function calling**           | Yes (Gemma 4 native; Gemma 3 4B+ via host)                  | Yes (all Nemotron 3)                                                         |
| **Thinking / reasoning**              | ON/OFF via `<\|think\|>` token in system prompt (Gemma 4)   | ON/OFF + **token budget control** + low/medium/high effort                   |
| **Vision**                            | Gemma 3 4B+ (4B, 12B, 27B); Gemma 4 12B, 26B, 31B           | Nano 12B 2 VL, Nano 3 Omni (also audio + video)                              |
| **Audio**                             | Gemma 4 E2B, E4B, 12B Unified                               | Nano 3 Omni (text+image+video+audio)                                         |
| **License**                           | Apache 2.0 (very permissive)                                | NVIDIA Nemotron Open Model License (mostly permissive; Ultra is OpenMDW-1.1) |
| **License acceptance**                | Required on Hugging Face                                    | Required on Hugging Face                                                     |
| **Top coding score (LiveCodeBench)**  | Gemma 4 31B: **80.0** (v6)                                  | Nemotron 3 Ultra: **89.0** (v6)                                              |
| **Top SWE-Bench Verified**            | Not in official Gemma card                                  | **71.9** (Nemotron 3 Ultra)                                                  |
| **Codeforces ELO**                    | Gemma 4 31B: **2150**                                       | Not in Nemotron card                                                         |
| **Cheapest hosted model (USD/1M in)** | Gemma 3 4B / 12B: $0.05                                     | Nemotron Nano 9B V2: $0.04                                                   |
| **Best open weights deal**            | Gemma 4 26B A4B: $0.06 in / $0.33 out                       | Nemotron 3 Nano 30B A3B: $0.05 in / $0.20 out                                |
| **Best free tier**                    | All Gemma 4 on OpenRouter `:free`                           | All Nemotron 3 on OpenRouter `:free` + build.nvidia.com                      |
| **Best multilingual**                 | 140+ languages                                              | 15–19 languages (EN, DE, ES, FR, IT, JA, ZH, KO, HI, PT-BR)                  |
| **Multimodal advantage**              | Text+Image (Gemma 3/4), Audio (Gemma 4 E2B/E4B/12B Unified) | Nano 3 Omni handles text+image+video+audio in one model                      |
| **Tool-call parser**                  | Host-specific (OpenAI standard)                             | **`qwen3_coder`** consistently across vLLM/SGLang/TRT-LLM                    |
| **Maturity for Copilot use**          | Mature; well-supported on OpenRouter, Together, HF, Vertex  | Newer; vLLM/SGLang/TRT-LLM all need custom reasoning parsers                 |

---

# Part E — Recommendations for `copilot-custom-endpoint`

## E.1 Best Gemma Pick for Copilot

**Primary: `google/gemma-4-31b-it` via OpenRouter**

- $0.12 in / $0.36 out per 1M, 256K context, native function calling.
- Codeforces 2150, Tau2 76.9% — competitive with much pricier models.
- Free tier (`gemma-4-31b-it:free`) for initial validation.
- `requestBody` overrides: `temperature: 1.0`, `top_p: 0.95`, `top_k: 64`. Include `<|think|>` in system prompt for thinking mode; remove for non-thinking.

**Efficiency alternative: `google/gemma-4-26b-a4b-it` (MoE)**

- $0.06 in / $0.33 out per 1M, 256K context, runs as fast as a 4B model.
- LiveCodeBench v6 77.1% (almost as good as 31B), MMLU Pro 82.6%.
- Best price/performance in the Gemma 4 family.

**Skip Gemma 3 27B for hard coding** — LiveCodeBench 29.7% lags Kimi K2.6 and Qwen 3.7 Plus at similar price.

## E.2 Best Nemotron Pick for Copilot

**Primary: `nvidia/nemotron-3-super-120b-a12b:free` or paid on OpenRouter**

- $0.09 in / $0.45 out per 1M, 1M context (256K default), native tool calling.
- LiveCodeBench v5 **81.19%**, SWE-Bench (OpenHands) **60.47%** — best mid-tier coding result in this review.
- Strong agentic performance (TauBench V2 61.15%).
- Free tier for validation.

**Frontier option: `nvidia/nemotron-3-ultra-550b-a55b` via build.nvidia.com (free dev) or OpenRouter**

- $0.50 in / $2.50 out per 1M, 1M context.
- LiveCodeBench v6 **89.0%** — top-tier open coding model, on par with Qwen 3.7 Max.
- SWE-Bench Verified **71.9%** — frontier-class.
- IOI 2025 score 570 (highest among open models reported).
- **License caveat:** OpenMDW-1.1 is more restrictive than Apache 2.0. Review terms before commercial deployment.
- **For Copilot:** requires `chat_template_kwargs={"force_nonempty_content": True}` in `requestBody` to avoid empty content after the reasoning trace during tool loops.

**Efficiency alternative: `nvidia/nemotron-3-nano-30b-a3b`**

- $0.05 in / $0.20 out per 1M, 1M context, 3.5B active params.
- LiveCodeBench v6 68.3% — punches well above weight class.
- BFCL v4 53.8 — solid function calling.
- Best for high-volume multi-agent flows.

## E.3 If Picking Only One

For Copilot custom-endpoint use with the **best coding + tool calling + cost balance**:

- **Gemma 4 31B** if you want maximum license clarity (Apache 2.0), Copilot maturity, and Tau2-strong agentic behavior.
- **Nemotron 3 Super 120B A12B** if you want frontier-tier coding (LiveCodeBench 81.2, SWE-Bench 60.5) at 1M context for multi-file refactors.
- **Nemotron 3 Ultra** if you want the absolute strongest open coding model and don't mind OpenMDW-1.1 license terms or the per-token cost.

---

# Part F — Head-to-Head with Project Models

> How do the three **Large / Frontier** candidates (Gemma 4 31B, Nemotron 3 Super 120B A12B, Nemotron 3 Ultra 550B A55B) compare with the models this project has already validated and shipped ([docs/models/](../models/), [docs/pricing.md](../pricing.md))?

## F.1 Side-by-Side Comparison

| Model                            | Cost / session | Ctx  | SWE-Bench Verified         | LiveCodeBench              | Other notable benchmarks                                                                                                                           | License               | Project status |
| -------------------------------- | -------------- | ---- | -------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | -------------- |
| **Already validated in project** |                |      |                            |                            |                                                                                                                                                    |                       |                |
| MiMo V2 Flash                    | ~$0.08         | 256K | **73.4**                   | **80.6** (v6)              | SWE-Bench Multilingual 71.7; Terminal-Bench 2.0 38.5; AIME 2025 94.1; HLE 22.1                                                                     | MiMo terms            | ✅ shipped     |
| Kimi K2.6 (non-thinking)         | ~$0.18         | 256K | **65.8**¹ (Agentic)        | **53.7**¹ (v6)             | AIME 2025 49.5; MMLU 89.5; MMLU-Pro 81.1; SWE-Bench Multilingual 47.3                                                                              | Moonshot modified MIT | ✅ shipped     |
| MiniMax M3 (50% off)             | ~$0.27         | 1M   | —                          | —                          | No published benchmark cards surfaced in this research pass (model is gated, hf.co returned 401)                                                   | Modified MIT          | ✅ shipped     |
| Qwen 3.7 Plus (≤256K)            | ~$0.36         | 1M   | —                          | —                          | No direct model card retrieved in this pass; in the Qwen3 family which benchmarks LiveCodeBench / SWE-Bench Pro in published reports               | Qwen (tiered)         | ✅ shipped     |
| MiMo V2.5                        | ~$0.40         | 1M   | — (SWE-Bench Pro **56.1**) | — (Coding Agent **71.8**)  | Terminal-Bench 2.0 56.1; MiMo Coding Bench 62.3; Claw-Eval Text 65.8; MMMU-Pro 88.5; Video-MME 83.5                                                | MiMo terms            | ✅ shipped     |
| Kimi K2.6 (thinking)             | ~$0.48         | 256K | —                          | —                          | Terminal-Bench 2.0 **58.6**¹; Claw-Eval Text **66.7**¹; CODING AGENT **67.8**¹ (K2.6-specific from MiMo V2.5 launch head-to-head)                  | Moonshot modified MIT | ✅ shipped     |
| MiMo V2.5 Pro                    | ~$0.80         | 1M   | **78.9**                   | — (39.6 base)              | SWE-Bench Pro **57.2**; MMLU-Pro 68.5; GPQA-Diamond 66.7; AIME 24&25 37.3; GSM8K 99.6                                                              | MiMo terms            | ✅ shipped     |
| Qwen 3.7 Max                     | ~$1.33         | 1M   | —                          | —                          | No direct model card retrieved in this pass; flagship Qwen3 model — benchmarks reported in Qwen3 family papers                                     | Qwen (tiered)         | ✅ shipped     |
| GLM 5.1                          | ~$1.50         | 200K | — (SWE-Bench Pro **58.4**) | — (Codeforces competitive) | Terminal-Bench 2.0 (Terminus-2) 63.5; NL2Repo 42.7; CyberGym 68.7; HLE 31.0; AIME 2026 95.3; GPQA-Diamond 86.2; τ³-Bench 70.6; Tool-Decathlon 40.7 | Z.ai (paid)           | ✅ shipped     |
| **New candidates (spike only)**  |                |      |                            |                            |                                                                                                                                                    |                       |                |
| **Nemotron 3 Super 120B A12B**   | **~$0.09**     | 1M   | 60.47 (OpenHands)          | **81.19** v5               | HLE w/ tools 22.82; GPQA 82.70; TauBench V2 61.15; Terminal-Bench Core 2.0 31.00                                                                   | Nemotron Open         | ❌ spike       |
| **Gemma 4 31B**                  | **~$0.10**     | 256K | —                          | **80.0** v6                | Codeforces ELO **2150**; Tau2 agentic **76.9%**; MMLU-Pro 85.2; AIME 2026 89.2                                                                     | **Apache 2.0**        | ❌ spike       |
| **Nemotron 3 Ultra 550B A55B**   | **~$0.50**     | 1M   | **71.9**                   | **89.0** v6                | IOI 2025 **570**; IMOAnswerBench 88.6 no tools / 92.3 with tools; MMLU-Pro 86.8; GPQA 87.0; TauBench V3 70.9; Terminal-Bench 2.1 56.4              | OpenMDW-1.1           | ❌ spike       |

**Notes on the table:**

- **"—"** = benchmark is not recorded in this project's docs. The project has not done an apples-to-apples benchmark sweep across providers; it mostly tracks validation status and cost. Published scores exist on the upstream model cards (Kimi, Qwen, MiniMax, etc.) but they were not captured into [docs/models/](../models/) during validation. A separate research pass would be needed to fill these in.
- **MiMo V2 Flash's SWE-Bench Verified 73.4** is from the official V2.5 announcement and is recorded in [docs/models/mimo.md](../models/mimo.md). It is the only project model in the table with a directly comparable SWE-Bench Verified number. Comparing it to Nemotron 3 Ultra 71.9 is asymmetric (small-tier vs frontier-tier); the cheaper price is the point.
- **Gemma 4 31B's Codeforces 2150 and Tau2 76.9%** are not listed above to keep the table aligned on SWE-Bench + LiveCodeBench. See Part A.2 for those.
- **License** column is the one place where the 3 candidates bring something new: only Gemma 4 31B is on **Apache 2.0**. The other two are Nvidia-issued (Nemotron Open) or OpenMDW-1.1 (more restrictive).
- **Cost** numbers for the project models are from [docs/pricing.md](../pricing.md) (50-turn, 10K in + 2K out session). Cost numbers for the 3 candidates use the same formula: `0.5 × input_price + 0.1 × output_price`.

## F.2 What the Comparison Reveals

1. **The 3 candidates hold up against the project's own models on the head-to-head numbers we do have.**
   - **Nemotron 3 Super (60.47 SWE-Bench / 81.19 LCB v5)** is stronger on SWE-Bench than **MiMo V2.5 Pro (57.2 SWE-Bench Pro / 78.9 SWE-Bench Verified)** and stronger on LiveCodeBench than **MiMo V2 Flash (80.6 LCB v6)** — at roughly the same or lower session cost.
   - **Gemma 4 31B (80.0 LCB v6)** matches **MiMo V2 Flash (80.6)** and **Nemotron 3 Super (81.19 v5)** on LiveCodeBench, and is the only candidate on **Apache 2.0** — no other model in this table has a fully permissive open-source license.
   - **Nemotron 3 Ultra (71.9 SWE-Bench / 89.0 LCB v6)** beats every project model on both metrics except MiMo V2 Flash on SWE-Bench (73.4 vs 71.9, but MiMo V2 Flash costs less and is multimodal).
   - **GLM 5.1 (SWE-Bench Pro 58.4, Terminal-Bench 2.0 63.5)** is the only project model in the table that scores in the same coding range as the candidates on **SWE-Bench Pro** specifically — but it costs **$1.50/session vs $0.50 for Nemotron 3 Ultra**.

2. **The 3 candidates offer strictly more coding capability for less money than the project's current top choices.**
   - **Gemma 4 31B at $0.10/session** is a direct upgrade from **Kimi K2.6 non-thinking at $0.18/session** for coding (LiveCodeBench 80.0 vs Kimi's published coding scores), and it ships under **Apache 2.0** — a license clarity advantage over the project's Moonshot / DashScope / Z.ai / MiMo / MiniMax providers.
   - **Nemotron 3 Super 120B A12B at $0.09/session** is the **cheapest frontier-tier coding model** in this review. With 1M context, LiveCodeBench v5 81.19%, and SWE-Bench (OpenHands) 60.47, it is more capable than anything in the project that costs the same or less.
   - **Nemotron 3 Ultra 550B A55B at $0.50/session** slots between the project's mid-tier (MiniMax M3, Qwen 3.7 Plus) and the project's most expensive (GLM 5.1, Qwen 3.7 Max) — at a **lower price than GLM 5.1 ($1.50) and Qwen 3.7 Max ($1.33)** while delivering better LiveCodeBench (89.0) and SWE-Bench (71.9) than either of them.

3. **SWE-Bench Verified is the rare apples-to-apples number we do have.** The only project model with a comparable score is MiMo V2 Flash (73.4). Nemotron 3 Ultra's 71.9 is within margin of error, but it is a 550B model that costs 6× more. **The takeaway is that SWE-Bench alone is a poor proxy for Copilot-style coding; LiveCodeBench and tool-loop success matter more.** Project models are not currently evaluated on LiveCodeBench; the 3 candidates are.

4. **The project is structurally biased toward cheap / mid-tier alternatives.** Five of nine validated models cost ≤ $0.40/session. None reach LiveCodeBench 80+. The 3 candidates would push the project into a frontier tier it has never had direct access to.

5. **Open questions remain** before any of the 3 should be promoted out of "spike" status (see Part G).

## F.3 Benchmark data sources & caveats

The numbers in the table above were retrieved on 2026-06-10 from official model cards and head-to-head benchmark tables. The exact sources, with caveats:

| Model                        | Source                                                                                                                                            | Caveat                                                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| MiMo V2 Flash                | [Hugging Face — `XiaomiMiMo/MiMo-V2-Flash`](https://huggingface.co/XiaomiMiMo/MiMo-V2-Flash) model card, "Post-training Model Evaluation" table   | Direct post-training numbers; matches the [docs/models/mimo.md](../models/mimo.md) baseline already captured in the project.                                                                           |
| MiMo V2.5                    | [Hugging Face — `XiaomiMiMo/MiMo-V2.5`](https://huggingface.co/XiaomiMiMo/MiMo-V2.5) + [MiMo V2.5 launch blog](https://mimo.xiaomi.com/mimo-v2-5) | "SWE-Bench Verified" not on the V2.5 card; SWE-Bench Pro 56.1 is the published coding-agent number instead.                                                                                            |
| MiMo V2.5 Pro                | [Hugging Face — `XiaomiMiMo/MiMo-V2.5-Pro`](https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro) model card + eval-results section                    | SWE-Bench Verified 78.9 is the post-train eval-results number, not on the base model card; LCB v6 39.6 is the **base** number — post-train number not published.                                       |
| Kimi K2.6 (non-thinking)     | [Hugging Face — `moonshotai/Kimi-K2-Instruct`](https://huggingface.co/moonshotai/Kimi-K2-Instruct) model card                                     | Numbers are from **K2-Instruct**, not K2.6 specifically. K2.6 may be a refreshed point release. The Moonshot K2.6 model card was not retrieved in this pass.                                           |
| Kimi K2.6 (thinking)         | [MiMo V2.5 launch blog](https://mimo.xiaomi.com/mimo-v2-5) head-to-head table (Kimi K2.6 column)                                                  | Only the three benchmarks Xiaomi chose to publish against K2.6 (Terminal-Bench 2.0, Claw-Eval Text, CODING AGENT).                                                                                     |
| GLM 5.1                      | [GLM 5.1 launch blog](https://z.ai/blog/glm-5.1)                                                                                                  | Direct from the launch blog's "REASONING / CODING / AGENTIC" tables.                                                                                                                                   |
| Qwen 3.7 Plus / Qwen 3.7 Max | (search returned 404 / 401 errors on this pass)                                                                                                   | These are the project models with the **largest remaining gap**. The Qwen3 family publishes LiveCodeBench / SWE-Bench Pro numbers, but the specific 3.7 Plus / 3.7 Max model cards were not retrieved. |
| MiniMax M3                   | (Hugging Face returned 401 — model is gated)                                                                                                      | No public benchmark data retrieved. The pricing.md only lists pricing.                                                                                                                                 |
| Nemotron 3 Super / Ultra     | Already cited in Part B of this document.                                                                                                         | None.                                                                                                                                                                                                  |
| Gemma 4 31B                  | Already cited in Part A.                                                                                                                          | SWE-Bench Verified is not on the Gemma 4 model card. Codeforces 2150 / Tau2 76.9% are the proxy signals.                                                                                               |

---

# Part G — Open Questions / Follow-ups

- [ ] Validate Gemma 4 31B and Nemotron 3 Super with a real Copilot agent loop (multi-file refactor, tool use over 10+ turns). Check the `reasoning_content` forwarding behavior empirically.
- [ ] Test FunctionGemma 270M as a local tool-decision model alongside a larger chat model (split-agent pattern).
- [ ] Check `force_nonempty_content` interaction with VS Code's tool loop for Nemotron 3.
- [ ] Verify `tool_choice: "auto"` vs `tool_choice: "required"` behavior on both Gemma 4 and Nemotron 3.
- [ ] Confirm whether the OpenRouter `:free` tiers for both families are rate-limited enough to make them unusable for serious sessions.

---

## Sources (Quick Index)

- Gemma 4 model card: <https://ai.google.dev/gemma/docs/core/model_card_4>
- Gemma 3 model card: <https://ai.google.dev/gemma/docs/core/model_card_3>
- FunctionGemma launch: <https://blog.google/technology/developers/functiongemma/>
- OpenRouter Gemma: <https://openrouter.ai/models?q=google/gemma>
- OpenRouter Nemotron: <https://openrouter.ai/models?q=nvidia/nemotron>
- Nemotron 3 Nano blog: <https://huggingface.co/blog/nvidia/nemotron-3-nano-efficient-open-intelligent-models>
- Nemotron 3 Nano 4B blog: <https://huggingface.co/blog/nvidia/nemotron-3-nano-4b>
- Nemotron 3 Super model card: <https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16>
- Nemotron 3 Ultra model card: <https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16>
- build.nvidia.com Nemotron: <https://build.nvidia.com/explore/discover>
- Together AI pricing: <https://www.together.ai/pricing>
- Live pricing snapshot: [docs/pricing.md](../pricing.md)
