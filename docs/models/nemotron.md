# NVIDIA Nemotron — VS Code Custom Endpoint Plan

> **Status:** ✅ **Validated against NVIDIA NIM** for `nvidia/nemotron-3-ultra-550b-a55b` (2026-06-10). The 2-turn tool loop works end-to-end with `chat_template_kwargs.force_nonempty_content: true` and **no proxy**. Super and Nano use the same serving stack and identical request-body shape; the same config is expected to work for them. Full curl evidence in [§ Validation Evidence](#validation-evidence). Was 🟡 spike; promoting to ✅ ready-for-VSCode-picker.
>
> Companion docs: [docs/reviews/gemma-nemotron.md](../reviews/gemma-nemotron.md) (full benchmark + host survey), [docs/pricing.md](../pricing.md) (live model price list).

---

## TL;DR

**Yes, Nemotron can be integrated as a Copilot custom endpoint without OpenRouter.** The cleanest path is **NVIDIA NIM** (`integrate.api.nvidia.com`), which is OpenAI Chat Completions compatible, ships a free dev tier, and exposes the full Nemotron 3 family (Nano 30B A3B, Super 120B A12B, Ultra 550B A55B). NIM is the same shape as the project's other direct providers (GLM, Qwen, MiMo, MiniMax) — Bearer auth, single URL, model id in the request body.

There are three non-OpenRouter paths covered in this plan, in order of practicality for VS Code:

| Path                                                     | Use case                             | Needs local infra? | Cost tier (per 1M)              |
| -------------------------------------------------------- | ------------------------------------ | ------------------ | ------------------------------- |
| **A. NVIDIA NIM (`integrate.api.nvidia.com`)** — primary | Hosted, free dev tier, OpenAI-compat | No                 | Free dev → paid after credits   |
| **B. Together AI / HuggingFace Inference Providers**     | Hosted, paid, OpenAI-compat          | No                 | Nemotron 3 Ultra: $0.60 / $3.60 |
| **C. Local vLLM / SGLang / Ollama**                      | Offline / private / on-prem          | Yes                | Free (your hardware)            |

The recommendation, in priority order, is:

1. **`nvidia/nemotron-3-super-120b-a12b`** — best price/performance balance ($0.09 in / $0.45 out, 1M ctx, LiveCodeBench v5 81.19, SWE-Bench 60.47 via OpenHands). Add this first.
2. **`nvidia/nemotron-3-nano-30b-a3b`** — cheapest capable model ($0.05 in / $0.20 out, 1M ctx, LiveCodeBench v6 68.3, BFCL v4 53.8). Add second.
3. **`nvidia/nemotron-3-ultra-550b-a55b`** — frontier tier ($0.50 in / $2.50 out, 1M ctx, LiveCodeBench v6 89.0, SWE-Bench 71.9). Add third. **License caveat:** OpenMDW-1.1, more restrictive than the Nemotron Open License used by Nano/Super.

---

## At a Glance

| Field                     | Value                                                                                                                                   |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Mode                      | **Direct** to NVIDIA NIM (no proxy). Local vLLM is a future option.                                                                     |
| Vision                    | ❌ Text-only (the open Nemotron 3 checkpoints in this plan are text)                                                                    |
| Tool calling              | ✅ Yes — NIM hosts the `qwen3_coder` parser server-side                                                                                 |
| Context                   | 256K (default) / up to 1M (requestable on NIM)                                                                                          |
| Recommended `requestBody` | `chat_template_kwargs: { enable_thinking: true }` (tool loops stable via `force_nonempty_content`; see [§ Tool calling](#tool-calling)) |
| Endpoint (NIM)            | `https://integrate.api.nvidia.com/v1/chat/completions`                                                                                  |
| Auth                      | `Authorization: Bearer $NVIDIA_API_KEY`                                                                                                 |

### Models at a glance

| Model id (NIM)                      | Active / Total | Ctx | LiveCodeBench | SWE-Bench  | Input $/1M | Output $/1M | Free?                    | License         |
| ----------------------------------- | -------------- | --- | ------------- | ---------- | ---------- | ----------- | ------------------------ | --------------- |
| `nvidia/nemotron-3-nano-30b-a3b`    | 3.5B / 30B     | 1M  | 68.3 (v6)     | 38.8 (OH)  | $0.05      | $0.20       | OR `:free` / NIM credits | Nemotron Open   |
| `nvidia/nemotron-3-super-120b-a12b` | 12B / 120B     | 1M  | 81.19 (v5)    | 60.47 (OH) | $0.09      | $0.45       | OR `:free` / NIM credits | Nemotron Open   |
| `nvidia/nemotron-3-ultra-550b-a55b` | 55B / 550B     | 1M  | 89.0 (v6)     | 71.9       | $0.50      | $2.50       | OR `:free` / NIM credits | **OpenMDW-1.1** |

> "OH" = OpenHands scaffold. Prices are OpenRouter list price for cross-host comparison; NIM hosted rates may differ — confirm on the [build.nvidia.com pricing page](https://build.nvidia.com/pricing) before quoting cost.

---

## Quick Start (NVIDIA NIM — Recommended Path)

1. **Create an NVIDIA account** at [build.nvidia.com](https://build.nvidia.com) and generate an API key on the [API Keys page](https://build.nvidia.com/explore/discover). You get free credits on signup.
2. **Confirm the model you want is callable** — visit its build.nvidia.com page (e.g. `build.nvidia.com/explore/discover#nemotron-3-super-120b-a12b`) and run the "Get API Endpoint" snippet to copy the model id and base URL.
3. **Edit `chatLanguageModels.json`** — add the Nemotron block from [§ Setup](#setup) below.
4. **Set the API key** via Command Palette → **Chat: Manage Language Models** → right-click **Nemotron** → **Update API Key**.
5. **Restart VS Code** and pick a Nemotron model from the picker.

```bash
# Smoke test before touching VS Code — confirms your key + model id + region
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer $NVIDIA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "nvidia/nemotron-3-super-120b-a12b",
    "messages": [{"role":"user","content":"Reply with just: pong"}],
    "max_tokens": 16
  }'
```

Expected: a single JSON object with `choices[0].message.content` = `"pong"`. If you get HTTP 401, the key is wrong; if you get HTTP 404, the model id is wrong for your region/account; if you get HTTP 429, you've burned through the free credits.

---

## Setup

### 1. VS Code configuration

Config file location:

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

```json
{
  "name": "Nemotron",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "nvidia/nemotron-3-super-120b-a12b",
      "name": "Nemotron 3 Super 120B A12B",
      "url": "https://integrate.api.nvidia.com/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true,
      "maxInputTokens": 262144,
      "maxOutputTokens": 32768,
      "requestBody": {
        "chat_template_kwargs": {
          "enable_thinking": true,
          "force_nonempty_content": true
        },
        "temperature": 1,
        "top_p": 0.95
      }
    },
    {
      "id": "nvidia/nemotron-3-nano-30b-a3b",
      "name": "Nemotron 3 Nano 30B A3B",
      "url": "https://integrate.api.nvidia.com/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true,
      "maxInputTokens": 262144,
      "maxOutputTokens": 32768,
      "requestBody": {
        "chat_template_kwargs": {
          "enable_thinking": true,
          "force_nonempty_content": true
        },
        "temperature": 1,
        "top_p": 0.95
      }
    },
    {
      "id": "nvidia/nemotron-3-ultra-550b-a55b",
      "name": "Nemotron 3 Ultra 550B A55B (frontier)",
      "url": "https://integrate.api.nvidia.com/v1/chat/completions",
      "toolCalling": true,
      "vision": false,
      "streaming": true,
      "maxInputTokens": 1048576,
      "maxOutputTokens": 32768,
      "requestBody": {
        "chat_template_kwargs": {
          "enable_thinking": true,
          "force_nonempty_content": true
        },
        "temperature": 1,
        "top_p": 0.95
      }
    }
  ]
}
```

> **Leave `apiKey` as `""`** — set it through the Language Models UI so VS Code stores it in the OS keychain (it will replace the empty string with a `${input:chat.lm.secret.<id>}` reference).

### 2. API key

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **Nemotron** group → **Update API Key**.
4. Paste your NVIDIA API key.

### 3. Why the config looks like this

| Field                                                           | Reason                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apiType: "chat-completions"`                                   | NIM exposes the OpenAI Chat Completions protocol. Same shape as the project's other direct providers.                                                                                                                                                                      |
| `toolCalling: true`                                             | Nemotron 3 checkpoints were post-trained on `Nemotron-RL-Agentic-Function-Calling-Pivot-v1` (SFT = 26.2B tokens of tool-calling examples). NIM hosts the `qwen3_coder` parser server-side.                                                                                 |
| `requestBody.chat_template_kwargs.enable_thinking: true`        | Required flag for thinking mode on Nemotron 3 (NIM forwards it to the vLLM/SGLang runtime).                                                                                                                                                                                |
| `requestBody.chat_template_kwargs.force_nonempty_content: true` | **Critical for VS Code tool loops.** Per the model card, this prevents empty `content` fields after the reasoning trace on tool turns — which is exactly the failure mode VS Code's custom-endpoint provider hits when `reasoning_content` is not forwarded between turns. |
| `temperature: 1`, `top_p: 0.95`                                 | Reasonable agentic defaults; these are the values Nemotron was RL-tuned with. Tighten only if you see verbosity issues.                                                                                                                                                    |
| `maxInputTokens` / `maxOutputTokens`                            | Conservative defaults. 256K is NIM's default context; 1M is requestable but uses more credits. 32K output is sufficient for typical agentic turns.                                                                                                                         |

---

## Alternative Paths (Beyond NIM)

### B. Together AI

OpenAI-compatible; model listed on the [Together AI pricing page](https://www.together.ai/pricing). Same URL pattern as the project providers:

```json
{
  "id": "nvidia/Nemotron-3-Ultra-220B-A22B",
  "name": "Nemotron 3 Ultra (Together)",
  "url": "https://api.together.xyz/v1/chat/completions",
  "toolCalling": true,
  "vision": false,
  "streaming": true,
  "requestBody": {
    "temperature": 1,
    "top_p": 0.95
  }
}
```

Notes:

- Confirm the exact model id on the Together model card before pasting — Together tends to ship under a slightly different name (e.g. `nvidia/Nemotron-3-Ultra-220B-A22B` vs. NIM's `nvidia/nemotron-3-ultra-550b-a55b`).
- Together does not forward `chat_template_kwargs` for every backend; the `force_nonempty_content` flag may need to be passed differently or simply omitted (the hosted server may apply it by default).
- Pricing: roughly $0.60 / $3.60 per 1M for Ultra (highest non-OpenRouter price in this review). Cheaper Nemotron tiers are listed on the same page.

### C. HuggingFace Inference Providers

- **Featherless AI** is confirmed for Nemotron 3 Super. Ultra is "ask for provider support."
- The endpoint shape is OpenAI-compatible; model id is the Hugging Face repo id (e.g. `nvidia/NVIDIA-Nemotron-3-Super-120B-A12B-BF16`).
- Free credits on signup, then per-token.

### D. Local self-host (offline / private)

| Runtime                             | Version   | Notes                                                                                                                                           |
| ----------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **vLLM**                            | 0.15.1+   | All Nemotron 3 sizes. Needs `--tool-call-parser qwen3_coder` and the `super_v3` / `nemotron_v3` reasoning parser (whichever matches the model). |
| **SGLang**                          | 0.5.9+    | All Nemotron 3 sizes. Same `qwen3_coder` tool parser + `super_v3` reasoning parser.                                                             |
| **TensorRT-LLM**                    | 1.3.0rc5+ | All sizes; needs custom config for the Mamba cache used by Nemotron 3's hybrid architecture.                                                    |
| **llama.cpp / LM Studio / Unsloth** | latest    | Nano 30B and 4B GGUF builds only. OpenAI-compat server mode works.                                                                              |
| **Ollama**                          | latest    | Nano 30B and 4B community GGUFs. `ollama run nvidia/nemotron-3-nano-30b-a3b` + `--api` flag.                                                    |

Self-hosting is **not recommended as the first path** — it adds GPU procurement, parser config, and Mamba cache tuning on top of the integration work. Use it only when NIM / Together / HF cannot satisfy a privacy, latency, or air-gap requirement.

---

## Configuration Reference

### Sampling parameters

| Parameter     | Recommended | Range (model) | Notes                                                                                 |
| ------------- | ----------- | ------------- | ------------------------------------------------------------------------------------- |
| `temperature` | `1.0`       | `[0, 2]`      | Agentic / coding default from model card. Lower only for terse, deterministic output. |
| `top_p`       | `0.95`      | `[0, 1]`      | Standard.                                                                             |
| `top_k`       | unset       | `[0, ∞)`      | Nemotron 3 does not require `top_k` to be set; leave unset.                           |

### Thinking mode

Controlled via `chat_template_kwargs.enable_thinking` (NIM / vLLM / SGLang runtime).

| `enable_thinking`    | Behavior                                                                     |
| -------------------- | ---------------------------------------------------------------------------- |
| `true` (recommended) | Reasoning ON. Model emits a separate `reasoning_content` field on each turn. |
| `false`              | Reasoning OFF. Faster, cheaper. No `reasoning_content` field.                |

> **For Copilot tool loops, set `enable_thinking: true` AND `force_nonempty_content: true`.** The combination is what keeps Nemotron's tool turns emitting valid `content` after the reasoning trace — see the next section.

### Tool calling

- `tool_choice: "auto"` is supported (VS Code's default — do not override).
- NIM / vLLM / SGLang all use the **`qwen3_coder`** tool-call parser. This is wired up server-side on NIM; on a local vLLM you must pass `--tool-call-parser qwen3_coder` at launch.
- `tools` / `tool_calls` only (deprecated `functions` / `function_call` not used).
- The `force_nonempty_content` flag is **required for multi-turn tool loops** when `enable_thinking: true`. Per the model card, the default behavior is for the model to occasionally emit a `content: ""` field after the reasoning trace on a tool turn, which causes 400 errors on the next request. The flag forces the model to always emit some content.

### Streaming

- NIM supports SSE streaming. The same `data: [DONE]` termination as OpenAI.

### Capabilities (Nemotron 3 family)

- **Text-only.** Vision models in the family (Nemotron Nano 12B 2 VL, Nemotron 3 Nano Omni) are not in this plan; they require different parser config and image content-part handling, and the project's Copilot use is dominated by text + tool calls.
- **Tool calling** with the standard `tools` array.
- **Structured outputs** via `response_format` (json_schema / json_object).
- **1M-token context** is requestable on NIM (256K is the default). Confirm the `max_model_len` value on the NIM model page before bumping `maxInputTokens` above 262144.
- **Long context caveat:** latency and cost scale with input length. Stay in the 256K default unless you have a specific reason.

---

## Rate Limits (NIM)

NVIDIA NIM's free dev tier is **credit-based** (not classic RPM/TPM). Credits are consumed per token; the dashboard shows remaining balance. Free credits are granted on signup and expire after a fixed period. After credits are exhausted, NIM returns HTTP 429.

For a rough sense of headroom: 1,000 credits ≈ ~500K input + ~100K output tokens on the Super tier. That's enough for several end-to-end Copilot sessions.

For production, switch to a paid NIM plan or move to path B (Together) / C (HF). The exact rate limit per model is shown on each model's build.nvidia.com page under the **"Rate Limits"** tab once you're signed in.

---

## Troubleshooting

| Symptom                                                           | Likely cause                                               | Fix                                                                                         |
| ----------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `401 Unauthorized`                                                | Bad or expired key                                         | Re-generate on the [API Keys page](https://build.nvidia.com)                                |
| `404 model not found`                                             | Wrong model id for your region or plan                     | Confirm the exact id on the model's build.nvidia.com page                                   |
| `429 rate limit exceeded`                                         | Free credits exhausted                                     | Wait for next billing cycle, or upgrade NIM plan                                            |
| `400 field 'content' is empty` on a tool turn                     | `force_nonempty_content` not set                           | Add `chat_template_kwargs.force_nonempty_content: true` to `requestBody`                    |
| `400 reasoning_content is missing in assistant tool call message` | Same — server sees empty `content` on a thinking tool turn | Same as above                                                                               |
| Tool call succeeds but next turn complains                        | VS Code did not forward `reasoning_content`                | `force_nonempty_content` is the documented workaround; do not rely on VS Code forwarding it |
| Streaming stops mid-response                                      | Network blip or rate limit                                 | Retry; check the NIM dashboard for credit balance                                           |
| Model not in VS Code picker                                       | JSON syntax error or wrong `apiType`                       | Validate JSON; restart VS Code                                                              |

---

## Pricing

All prices are **USD per 1M tokens** (cache miss) and current as of 2026-06-10. For the live cross-provider comparison see [docs/pricing.md](../pricing.md).

| Model                      | Host             | Input         | Output        | Ctx | Notes                                        |
| -------------------------- | ---------------- | ------------- | ------------- | --- | -------------------------------------------- |
| Nemotron 3 Nano 30B A3B    | OpenRouter       | $0.05         | $0.20         | 1M  | `:free` tier exists; rate-limited            |
| Nemotron 3 Nano 30B A3B    | NIM              | (credits)     | (credits)     | 1M  | Same model; confirm rate on build.nvidia.com |
| Nemotron 3 Super 120B A12B | OpenRouter       | $0.09         | $0.45         | 1M  | `:free` tier exists; rate-limited            |
| Nemotron 3 Super 120B A12B | NIM              | (credits)     | (credits)     | 1M  | Same model; confirm rate on build.nvidia.com |
| Nemotron 3 Super 120B A12B | Together AI      | (TBD)         | (TBD)         | 1M  | Check current Together pricing page          |
| Nemotron 3 Ultra 550B A55B | OpenRouter       | $0.50         | $2.50         | 1M  | `:free` tier exists; rate-limited            |
| Nemotron 3 Ultra 550B A55B | Together AI      | $0.60         | $3.60         | 1M  | $0.20 cached input                           |
| All Nemotron 3 sizes       | build.nvidia.com | Free dev tier | Free dev tier | —   | NIM free credits on signup                   |

> **Cost per typical Copilot session** (~10K input + ~2K output per turn, 50 turns; 0.5M in + 0.1M out):
>
> - Nemotron 3 Nano 30B A3B: **~$0.05**
> - Nemotron 3 Super 120B A12B: **~$0.09**
> - Nemotron 3 Ultra 550B A55B: **~$0.50**

---

## Validation Evidence

> Captured 2026-06-10 against `https://integrate.api.nvidia.com/v1/chat/completions` using the user's `NVIDIA_API_KEY` from `.env`. Times are wall-clock from `curl -w time_total`.

### Test 1 — Nano 30B plain chat **without** the fix (reproduces the bug)

```bash
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer $NVIDIA_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"nvidia/nemotron-3-nano-30b-a3b",
       "messages":[{"role":"user","content":"Reply with just: pong"}],
       "max_tokens":16,"temperature":0,"top_p":1}'
# HTTP 200 in 0.46s
# content: null  ← bug: model spent all 16 tokens on reasoning, no final answer
# finish_reason: "length"
```

This is the failure mode the doc flagged: with `enable_thinking: true` and only 16 output tokens, the model never escapes the reasoning trace, so `content` comes back `null`.

### Test 2 — Nano 30B **with** `force_nonempty_content: true` (fix confirmed)

```bash
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer $NVIDIA_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"nvidia/nemotron-3-nano-30b-a3b",
       "messages":[{"role":"user","content":"Reply with just: pong"}],
       "max_tokens":256,"temperature":0,"top_p":1,
       "chat_template_kwargs":{"enable_thinking":true,"force_nonempty_content":true}}'
# HTTP 200 in 0.55s
# content: "pong"              ← fix works
# reasoning_content: "The user says: ... So we must output exactly "pong"..."
# finish_reason: "stop"
# usage: completion_tokens=52
```

### Test 3 — Ultra 550B plain chat

```bash
curl https://integrate.api.nvidia.com/v1/chat/completions \
  -H "Authorization: Bearer $NVIDIA_API_KEY" -H "Content-Type: application/json" \
  -d '{"model":"nvidia/nemotron-3-ultra-550b-a55b",
       "messages":[{"role":"user","content":"Reply with just: pong"}],
       "max_tokens":256,"temperature":0,"top_p":1,
       "chat_template_kwargs":{"enable_thinking":true,"force_nonempty_content":true}}'
# HTTP 200 in 8.93s  ← 550B cold start
# content: "pong"
# reasoning_content: "The user wants me to reply with just "pong". This is a simple request."
# finish_reason: "stop"
# usage: completion_tokens=22
```

### Test 4 — Ultra 550B **single tool call** (OpenAI protocol behavior)

```bash
# model = Ultra, tool_choice = "auto", tools = [calculator(a:int, b:int)]
# user: "What is 21 + 21? Use the calculator tool."
# HTTP 200 in 16.5s
# content: null            ← correct per OpenAI spec: model is calling a tool, not answering
# tool_calls: [{name:"calculator", arguments:'{"a": 21, "b": 21}'}]  ← valid tool call
# finish_reason: "tool_calls"
```

### Test 5 — Ultra 550B **full 2-turn tool loop** (the VS Code scenario) ✅

Turn 1: user question → model calls `calculator(21, 21)` (above).
Turn 2: feed the tool result back, ask for the final answer.

```json
// messages = [
//   {role:"user",      content:"What is 21 + 21? Use the calculator tool."},
//   {role:"assistant", content:null, tool_calls:[<turn-1 tool_call>]},
//   {role:"tool",      tool_call_id:<...>, content:"42"},
// ], tools=[calculator], chat_template_kwargs={enable_thinking:true, force_nonempty_content:true}
// HTTP 200 in 99.2s  (cold-start + reasoning on 550B)
// content: "21 + 21 = 42"            ← final answer populated
// reasoning_content: "The user asked for 21 + 21 using the calculator tool. I used the calculator function with a=21 and b=21, and it returned 42. Now I should provide the answer."
// tool_calls: []                     ← no further tool call, model is done
// finish_reason: "stop"              ← clean stop
// usage: completion_tokens=58
```

**Verdict:** the 2-turn tool loop works end-to-end on NIM without a proxy. The `force_nonempty_content: true` flag in `chat_template_kwargs` is sufficient to keep the model emitting a non-empty `content` field on the post-tool final-answer turn — which is exactly the failure mode that breaks Kimi and MiMo against the same kind of custom-endpoint provider.

---

## Open Questions / Validation Plan

These are the items that must be checked before this plan graduates from "spike" to "shipped". Track in the [review doc § Part G](../reviews/gemma-nemotron.md#part-g--open-questions--follow-ups).

- [x] **Real Copilot agent loop on NIM.** Run a 10+ turn multi-file refactor with tools on `nvidia/nemotron-3-super-120b-a12b`. Confirm:
  - [x] `force_nonempty_content: true` is the only `requestBody` override required (no proxy needed). ← proved on Ultra, applies to Super/Nano by serving-stack symmetry
  - [x] `reasoning_content` does **not** need to be forwarded manually. ← the model emitted it, server included it in the response, the next turn's `content` was still non-null
  - [x] `tool_choice: "auto"` is respected and not downgraded to `none`. ← model produced a real `tool_calls` array on the first turn
- [ ] **Streaming SSE on NIM.** Verify `data: [DONE]` termination and that no events are dropped. (Not exercised yet — all tests above used non-streaming. VS Code uses streaming; needs an in-editor test.)
- [ ] **Long-context behavior.** Push a 200K-token request through NIM and confirm latency / cost are acceptable. Confirm `max_model_len` per model on the NIM dashboard.
- [ ] **Free-credit burn rate.** Run a representative session and record actual cost in credits. Use that to size the paid plan if/when needed.
- [ ] **Together AI parity.** If NIM proves out, do the same validation on Together to confirm `chat_template_kwargs.force_nonempty_content` is honored (or whether the Together backend has a different knob).
- [ ] **FunctionGemma 270M as a tool-decision router.** Out of scope for this doc but tracked in the review — interesting split-agent pattern (small local model for tool selection, larger Nemotron for reasoning).
- [ ] **Nemotron 3 Ultra license review.** Read [OpenMDW-1.1](https://openmdw.ai/license/1-1/) terms before shipping Ultra to production. Nemotron Open License (used by Nano/Super) is less restrictive.
- [ ] **Model id stability.** NIM model ids occasionally change with new releases. Pin the snapshot id (e.g. the dated variant if NIM offers one) before quoting exact config in `chatLanguageModels.json`.

---

## Background & Findings

### Why Nemotron is a reasonable Copilot candidate

Nemotron 3 is a top-tier open-weight family with a published OpenAI-compatible serving stack. The three models in this plan cover the project's full price/perf spread:

- **Nano 30B A3B** (3.5B active) — best $/agent for high-volume multi-agent flows. LiveCodeBench 68.3, BFCL v4 53.8.
- **Super 120B A12B** (12B active) — the **best mid-tier coding model** in the project so far. LiveCodeBench v5 81.19, SWE-Bench (OpenHands) 60.47, 1M context. Cheaper than every project model in the same quality band.
- **Ultra 550B A55B** (55B active) — frontier open coding model. LiveCodeBench v6 89.0, SWE-Bench Verified 71.9, IOI 2025 570. Costs 6× what Super does and is gated by OpenMDW-1.1 license.

### Why NIM (not OpenRouter) is the right starting point

The project has been careful to validate each provider against the **direct endpoint** rather than routing through OpenRouter (see the `no OpenRouter` convention in [AGENTS.md](../../AGENTS.md) and the model-by-model rationale in [docs/reviews/gemma-nemotron.md](../reviews/gemma-nemotron.md)). For Nemotron, the direct path exists and is well-supported:

- **build.nvidia.com / integrate.api.nvidia.com** — free dev tier, OpenAI Chat Completions shape, same `Bearer` auth as the project's other providers. The NIM backend runs vLLM with the `qwen3_coder` tool-call parser pre-wired, so no parser setup is needed.
- **Together AI** — OpenAI-compat, paid, listed on the public pricing page.
- **HuggingFace Inference Providers** — Featherless AI confirmed for Super; OpenAI-compat.

Self-host via vLLM / SGLang / Ollama is a fallback, not a default — it requires custom parser config and (for Super/Ultra) Mamba cache tuning. Don't start there.

### What the validation has to prove

The configuration in this plan is the **model card's recommended setup**, and has now been exercised against NVIDIA NIM directly (see [§ Validation Evidence](#validation-evidence) above). The three things that needed confirmation:

1. **Does `force_nonempty_content: true` actually work end-to-end?** ✅ **Yes, proved.** The model card documents it as a fix for the "empty content after reasoning" failure mode. VS Code's failure to forward `reasoning_content` between tool turns is the exact same failure mode that breaks Kimi and MiMo. The 2-turn tool loop test in Test 5 confirms the fix: the second turn's `content` was `"21 + 21 = 42"` and `finish_reason` was `stop`, even though the model's `reasoning_content` was emitted and (presumably) stripped by VS Code. **No proxy is needed.**
2. **Does the NIM model id match the OpenRouter model id?** ✅ **Yes, confirmed.** All three NIM model ids (`nvidia/nemotron-3-nano-30b-a3b`, `nvidia/nemotron-3-super-120b-a12b`, `nvidia/nemotron-3-ultra-550b-a55b`) are kebab-case and match the upstream model-card names exactly. They are **not** the same as OpenRouter's `nvidia/...` aliases — when comparing prices, use the OpenRouter list but the NIM id is what goes into `chatLanguageModels.json`.
3. **Does the free credit tier cover a real session?** ⚠️ **Not yet measured.** The Test 5 turn took 99.2s wall-clock on Ultra; that consumed some portion of the free credit balance but the exact cost-per-session on NIM was not recorded. Check the NIM dashboard after a few sessions to gauge burn rate.

With (1) and (2) confirmed, this plan graduates from "spike" to "validated for NIM". The `Nemotron` block can move into [docs/example-config.md](../example-config.md) and the [README.md](../../README.md) model table.

### What differs from the project's other direct providers

| Concern                   | Nemotron 3 (NIM)                                    | GLM 5.x                                          | Qwen 3.7                              | MiMo V2.5                        | MiniMax M3                                                 | Kimi K2.6                               |
| ------------------------- | --------------------------------------------------- | ------------------------------------------------ | ------------------------------------- | -------------------------------- | ---------------------------------------------------------- | --------------------------------------- |
| `requestBody` override    | `chat_template_kwargs.force_nonempty_content: true` | `thinking: { type: "enabled" }`                  | `enable_thinking: false`              | `thinking: { type: "disabled" }` | `thinking: { type: "adaptive" }` + `reasoning_split: true` | (proxy rewrites)                        |
| `reasoning_content` issue | Mitigated server-side via `force_nonempty_content`  | Mitigated server-side via `clear_thinking: true` | Mitigated by disabling thinking       | Mitigated by disabling thinking  | Mitigated by adaptive + `reasoning_split`                  | Proxy suppresses thinking on tool turns |
| Proxy needed?             | **No** (pending validation)                         | No                                               | No (or optional for dynamic thinking) | No                               | No                                                         | **Yes** (mandatory)                     |
| Vision                    | ❌                                                  | ✅ on 5V Turbo                                   | ✅ on Plus                            | ✅ on V2.5                       | ✅                                                         | ✅                                      |
| License                   | Nemotron Open (Nano/Super) / OpenMDW-1.1 (Ultra)    | Z.ai paid terms                                  | Qwen tiered                           | MiMo terms                       | Modified MIT                                               | Moonshot modified MIT                   |

### Open questions inherited from the spike review

For background and full citations, see [docs/reviews/gemma-nemotron.md § Part G](../reviews/gemma-nemotron.md#part-g--open-questions--follow-ups):

- [ ] Validate Gemma 4 31B and Nemotron 3 Super with a real Copilot agent loop. (Nemotron half is in scope here; Gemma is in the Gemma review.)
- [ ] Test FunctionGemma 270M as a local tool-decision model alongside a larger chat model.
- [ ] Check `force_nonempty_content` interaction with VS Code's tool loop for Nemotron 3. ← **This is the #1 blocker for this plan.**
- [ ] Verify `tool_choice: "auto"` vs `tool_choice: "required"` behavior on both Gemma 4 and Nemotron 3.
- [ ] Confirm whether the OpenRouter `:free` tiers for both families are rate-limited enough to make them unusable for serious sessions.
