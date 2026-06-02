# Xiaomi MiMo — Research & Validation Plan

> **Status: Validated.** All phases complete. MiMo works directly through VS Code — plain chat, streaming, tool calling, and vision (`mimo-v2.5`). No proxy needed.

## Overview

Xiaomi MiMo is a family of large language models developed by Xiaomi's LLM-Core team. The models are available through the **Xiaomi MiMo API Open Platform** (`platform.xiaomimimo.com`) with an OpenAI-compatible Chat Completions endpoint. Three text-generation models are relevant for VS Code Copilot Custom Endpoint use:

| Model           | Params (Total / Active) | Vision | Context | Max Output | Role                                            |
| --------------- | ----------------------- | ------ | ------- | ---------- | ----------------------------------------------- |
| `mimo-v2.5-pro` | 1.02T / 42B             | ❌ No  | 1M      | 128K       | Most capable text-only model for agentic work   |
| `mimo-v2.5`     | 310B / 15B              | ✅ Yes | 1M      | 128K       | Native omnimodal (text + image + video + audio) |
| `mimo-v2-flash` | 310B / 15B              | ❌ No  | 256K    | 64K        | Fastest and cheapest, strong reasoning          |

### Deprecation notice

Legacy models `mimo-v2-pro` and `mimo-v2-omni` auto-route to V2.5 (with V2.5 pricing) as of June 1, 2026, and will be fully deprecated by June 30, 2026. Use the V2.5 series.

### Official API surface

| Property                      | Value                                                                |
| ----------------------------- | -------------------------------------------------------------------- |
| Provider                      | Xiaomi MiMo API Open Platform                                        |
| OpenAI-compatible endpoint    | `https://api.xiaomimimo.com/v1/chat/completions`                     |
| Anthropic-compatible endpoint | `https://api.xiaomimimo.com/anthropic/v1/messages`                   |
| Auth (method 1)               | `api-key: <MIMO_API_KEY>` header                                     |
| Auth (method 2)               | `Authorization: Bearer <MIMO_API_KEY>` header                        |
| Streaming                     | `stream: true` (SSE, standard OpenAI format)                         |
| Tool calling                  | `tools` array, `tool_calls` response, `tool_choice: "auto"`          |
| Vision                        | Image input via OpenAI-compatible `content` array (`mimo-v2.5` only) |
| Thinking mode                 | `thinking: { "type": "enabled" \| "disabled" }` in request body      |
| Non-OpenAI extras             | `reasoning_content` in responses, `thinking` object, web search tool |

### Token Plan endpoints (subscription)

Token Plan subscribers use different base URLs:

| Protocol  | Base URL                                         |
| --------- | ------------------------------------------------ |
| OpenAI    | `https://token-plan-cn.xiaomimimo.com/v1`        |
| Anthropic | `https://token-plan-cn.xiaomimimo.com/anthropic` |

Token Plan API keys use the `tp-xxxxx` format (vs `sk-xxxxx` for pay-as-you-go).

## Models

### mimo-v2.5-pro (text only, flagship)

- **Architecture:** Sparse MoE, 1.02T total / 42B activated parameters.
- **Context:** Up to 1M tokens.
- **Max output:** 128K tokens (default `max_completion_tokens: 131072`).
- **Capabilities:** Text generation, deep thinking, streaming, function call, structured output, web search.
- **Strengths:** Best-in-class agentic performance. Sustains complex trajectories spanning thousands of tool calls with strong instruction following over 1M context.
- **Benchmark highlights:** SWE-Bench Verified 78.9%, SWE-Bench Pro 57.2%, Terminal-Bench 2.0 68.4%.

### mimo-v2.5 (omnimodal)

- **Architecture:** Sparse MoE, 310B total / 15B activated parameters. Inherits MiMo-V2-Flash backbone + dedicated vision (729M-param ViT) and audio (261M-param) encoders.
- **Context:** Up to 1M tokens.
- **Max output:** 128K tokens (default `max_completion_tokens: 32768`).
- **Modalities:** Text, Image, Video, Audio understanding.
- **Capabilities:** Full-modal understanding, deep thinking, streaming, function call, structured output, web search.
- **Benchmark highlights:** SWE-Bench Pro 56.1%, Claw-Eval Text 62.3%, Video-MME 87.7%.

### mimo-v2-flash (text only, fast & cheap)

- **Architecture:** Sparse MoE, 310B total / 15B activated parameters.
- **Context:** Up to 256K tokens.
- **Max output:** 64K tokens (default `max_completion_tokens: 65536`).
- **Capabilities:** Text generation, deep thinking, streaming, function call, structured output, web search.
- **Strengths:** Lowest cost, fastest inference. Strong reasoning for the price.
- **Benchmark highlights:** SWE-Bench Verified 73.4%, AIME 2025 94.1%.

## Thinking Mode & The `reasoning_content` Constraint

### How thinking works

MiMo uses a `thinking` request parameter to control chain-of-thought reasoning:

| Model                        | Default `thinking.type` | Default `temperature`         |
| ---------------------------- | ----------------------- | ----------------------------- |
| `mimo-v2.5-pro`, `mimo-v2.5` | `enabled`               | 1.0 (locked in thinking mode) |
| `mimo-v2-flash`              | `disabled`              | 0.3 (customizable)            |

When thinking is enabled, responses include a `reasoning_content` field alongside `content` and `tool_calls`.

### The critical constraint

> **When thinking mode is enabled and the conversation history contains tool calls, the `reasoning_content` field MUST be fully passed back in every subsequent assistant message. Otherwise, the API returns a 400 error.**

This is the same class of problem as Qwen's `reasoning_content` issue, but **stricter**: MiMo's API actively rejects requests with missing historical `reasoning_content` (HTTP 400), rather than silently degrading.

**Implication for VS Code Copilot:** VS Code's agent mode is unlikely to preserve `reasoning_content` across multi-turn tool loops. This means:

- **Thinking enabled + tool calling = broken** (400 errors after the first tool round-trip).
- **Thinking disabled + tool calling = should work** (no `reasoning_content` to preserve).
- **Thinking enabled + plain chat = should work** (no tool calls in history).

### Option 1 — Direct path (simplest, static suppression)

Disable thinking in every request via `requestBody`:

```json
{
  "thinking": { "type": "disabled" }
}
```

**Trade-off:** No reasoning visible anywhere. Tool loops stay stable.

### Option 2 — With proxy (dynamic suppression, future work)

A proxy could dynamically suppress thinking only when tools are present (same pattern as `proxy/qwen-proxy.mjs`):

```
no tools → thinking.type: "enabled"  (reasoning visible in plain chat)
tools    → thinking.type: "disabled" (no reasoning_content issues)
```

This would require a new proxy script (e.g., `proxy/mimo-proxy.mjs`). Not yet implemented.

## Sampling Parameters

### Recommended defaults

| Task type            | `temperature` | `top_p` |
| -------------------- | ------------- | ------- |
| Agentic / tool-use   | 0.3           | 0.95    |
| Vibe coding          | 0.3           | 0.95    |
| General conversation | 0.8           | 0.95    |
| Math reasoning       | 1.0           | 0.95    |

For `mimo-v2.5-pro` and `mimo-v2.5`, the recommended values are always `temperature: 1.0` and `top_p: 0.95` regardless of task (per official docs).

**Note:** In thinking mode, `mimo-v2.5-pro` and `mimo-v2.5` lock `temperature` to 1.0 — any custom value is silently overridden.

### VS Code compatibility considerations

VS Code may send `temperature` and `top_p` values that differ from MiMo's defaults. The `requestBody` field in `chatLanguageModels.json` can override these. MiMo accepts `temperature` in range `[0, 1.5]` and `top_p` in range `[0.01, 1.0]`.

## Pricing (Overseas, pay-as-you-go)

| Model           | Input (Cache Hit) | Input (Cache Miss) | Output            |
| --------------- | ----------------- | ------------------ | ----------------- |
| `mimo-v2.5-pro` | $0.20 / 1M tokens | $1.00 / 1M tokens  | $3.00 / 1M tokens |
| `mimo-v2.5`     | $0.08 / 1M tokens | $0.40 / 1M tokens  | $2.00 / 1M tokens |
| `mimo-v2-flash` | $0.01 / 1M tokens | $0.10 / 1M tokens  | $0.30 / 1M tokens |

Rate limits: **100 RPM**, **10M TPM** per model per account.

Cache writing is currently free of charge (limited-time offer).

### Cost comparison (vs GitHub Copilot credits)

`mimo-v2-flash` at $0.10/$0.30 per 1M tokens is extremely competitive — roughly **10–50× cheaper** than typical Copilot credit burn rates for equivalent token throughput.

## Proposed VS Code Configuration

### mimo-v2.5-pro (text only, thinking disabled)

```json
{
  "id": "mimo-v2.5-pro",
  "name": "MiMo V2.5 Pro",
  "url": "https://api.xiaomimimo.com/v1/chat/completions",
  "toolCalling": true,
  "vision": false,
  "streaming": true,
  "maxInputTokens": 1048576,
  "maxOutputTokens": 131072,
  "requestBody": {
    "thinking": { "type": "disabled" },
    "temperature": 1,
    "top_p": 0.95
  }
}
```

### mimo-v2.5 (omnimodal, thinking disabled)

```json
{
  "id": "mimo-v2.5",
  "name": "MiMo V2.5",
  "url": "https://api.xiaomimimo.com/v1/chat/completions",
  "toolCalling": true,
  "vision": true,
  "streaming": true,
  "maxInputTokens": 1048576,
  "maxOutputTokens": 32768,
  "requestBody": {
    "thinking": { "type": "disabled" },
    "temperature": 1,
    "top_p": 0.95
  }
}
```

### mimo-v2-flash (fast & cheap, thinking disabled by default)

```json
{
  "id": "mimo-v2-flash",
  "name": "MiMo V2 Flash",
  "url": "https://api.xiaomimimo.com/v1/chat/completions",
  "toolCalling": true,
  "vision": false,
  "streaming": true,
  "maxInputTokens": 262144,
  "maxOutputTokens": 65536,
  "requestBody": {
    "thinking": { "type": "disabled" },
    "temperature": 0.3,
    "top_p": 0.95
  }
}
```

### Full provider entry (for `chatLanguageModels.json`)

Leave `apiKey` as an empty string — you'll set it via the Language Models UI:

```json
{
  "name": "MiMo",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    // ... insert model entries above ...
  ]
}
```

To set your MiMo API key:

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **MiMo** group, right-click it → **Update API Key**.
4. Paste your MiMo API key.

> After setting via the UI, VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference.

## Validation Plan

The following steps need to be performed to move from "research complete" to "validated":

### Phase 1 — Connectivity check ✅

**Date:** June 2, 2026

All checks passed:

| Check              | Model           | Result                                                          |
| ------------------ | --------------- | --------------------------------------------------------------- |
| Non-streaming chat | `mimo-v2-flash` | ✅ Responded correctly                                          |
| Streaming (SSE)    | `mimo-v2-flash` | ✅ SSE chunks received correctly                                |
| Non-streaming chat | `mimo-v2.5-pro` | ✅ Responded correctly (self-identified as MiMo 1T-param model) |
| Tool calling       | `mimo-v2-flash` | ✅ `finish_reason: "tool_calls"` with valid JSON arguments      |

Commands used for verification:

```bash
# Basic chat (mimo-v2-flash)
curl https://api.xiaomimimo.com/v1/chat/completions \
  -H "Authorization: Bearer $MIMO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mimo-v2-flash","messages":[{"role":"user","content":"Hello"}],"thinking":{"type":"disabled"}}'

# Streaming (mimo-v2-flash)
curl -s https://api.xiaomimimo.com/v1/chat/completions \
  -H "Authorization: Bearer $MIMO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mimo-v2-flash","messages":[{"role":"user","content":"Count to 3"}],"thinking":{"type":"disabled"},"stream":true}'

# Tool calling (mimo-v2-flash)
curl -s https://api.xiaomimimo.com/v1/chat/completions \
  -H "Authorization: Bearer $MIMO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"mimo-v2-flash","messages":[{"role":"user","content":"What is the weather in Beijing?"}],"thinking":{"type":"disabled"},"tools":[{"type":"function","function":{"name":"get_weather","description":"Get weather","parameters":{"type":"object","properties":{"location":{"type":"string"}},"required":["location"]}}}],"tool_choice":"auto"}'
```

### Phase 2 — Direct VS Code path (no proxy) ✅

**Date:** June 2, 2026

| #   | Test                                      | Model           | Result | Notes                                                                                            |
| --- | ----------------------------------------- | --------------- | ------ | ------------------------------------------------------------------------------------------------ |
| 1   | Add provider to `chatLanguageModels.json` | All             | ✅     | `thinking: { "type": "disabled" }` in `requestBody` for all models                               |
| 2   | Plain chat                                | `mimo-v2.5-pro` | ✅     | Streaming responses rendered correctly, model self-identified as MiMo 1T-param                   |
| 3   | Agent mode (tool calling)                 | `mimo-v2.5-pro` | ✅     | All tools executed without 400 errors: file reads, browser automation, terminal, image viewing   |
| 4   | Vision                                    | `mimo-v2.5`     | ✅     | Native vision — analyzed an attached screenshot in detail (Facebook post, browser tabs, sidebar) |

**Verdict: No proxy needed.** The direct VS Code → MiMo API path works for all tested scenarios. This is the simplest and cheapest setup — identical to how Qwen works without a proxy.

### Phase 3 — Proxy (optional, if needed)

**Not needed.** The direct VS Code → MiMo API path works for all scenarios tested. No request rewriting or dynamic suppression is required since `thinking: { "type": "disabled" }` is correctly passed through `requestBody`.

### Phase 4 — Update project files ✅

After validation: update this document's status to "Validated", add MiMo rows to the Quick Start table in `README.md`, and add MiMo to `AGENTS.md` scope and provider-specific constraints. If a proxy had been built, add `proxy:mimo` npm script, update `cli.mjs`, and add tests — but no proxy is needed here.

## Known Risks & Open Questions

| Risk / Question                       | Detail                                                                                            | Mitigation                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `reasoning_content` 400 errors        | If thinking is accidentally enabled in tool loops, API returns 400                                | Always set `thinking.type: "disabled"` in `requestBody` |
| `tool_choice` only supports `"auto"`  | MiMo docs say non-`auto` values are stripped and treated as `auto`                                | Should not affect VS Code, which uses `auto`            |
| Auth header format                    | MiMo supports both `api-key:` and `Authorization: Bearer` — VS Code sends `Authorization: Bearer` | Should work directly; verify in Phase 2                 |
| `temperature` locked in thinking mode | `mimo-v2.5-pro` and `mimo-v2.5` force `temperature: 1.0` when thinking is on                      | Not an issue when thinking is disabled                  |
| 1M context window                     | VS Code may not send enough tokens to benefit; `maxInputTokens` is a hint, not a guarantee        | Set conservatively; adjust after testing                |
| `mimo-v2-flash` thinking default      | Defaults to `disabled` on the API side, but we set it explicitly for safety                       | No risk — explicit is better                            |

## Official Documentation Links

| Resource                    | URL                                                                                     |
| --------------------------- | --------------------------------------------------------------------------------------- |
| API Platform                | <https://platform.xiaomimimo.com/>                                                      |
| OpenAI API Reference        | <https://platform.xiaomimimo.com/docs/en-US/api/chat/openai-api>                        |
| First API Call Guide        | <https://platform.xiaomimimo.com/docs/en-US/quick-start/first-api-call>                 |
| Model & Rate Limits         | <https://platform.xiaomimimo.com/docs/en-US/quick-start/model>                          |
| Model Hyperparameters       | <https://platform.xiaomimimo.com/docs/en-US/quick-start/model-hyperparameters>          |
| Pricing                     | <https://platform.xiaomimimo.com/docs/en-US/pricing>                                    |
| reasoning_content Guide     | <https://platform.xiaomimimo.com/docs/en-US/usage-guide/passing-back-reasoning_content> |
| AI Tools Integration        | <https://platform.xiaomimimo.com/docs/en-US/integration/claude-code>                    |
| HuggingFace (MiMo-V2.5)     | <https://huggingface.co/XiaomiMiMo/MiMo-V2.5>                                           |
| HuggingFace (MiMo-V2.5-Pro) | <https://huggingface.co/XiaomiMiMo/MiMo-V2.5-Pro>                                       |
| HuggingFace (MiMo-V2-Flash) | <https://huggingface.co/XiaomiMiMo/MiMo-V2-Flash>                                       |
| MiMo V2.5 Blog              | <https://mimo.xiaomi.com/mimo-v2-5>                                                     |
| AI Studio (playground)      | <https://aistudio.xiaomimimo.com/>                                                      |
