# Kimi — VS Code Custom Endpoint Setup Guide

> **TL;DR:** Kimi K2.6 requires the local proxy. The K2 family locks `temperature: 1` and `top_p: 0.95`, and requires `thinking: { type: "disabled" }` on tool turns. The proxy rewrites sampling values, suppresses thinking on tool turns, and preserves streaming. Direct VS Code → Moonshot integration is not viable in this environment.

## At a Glance

| Field                  | Value                                         |
| ---------------------- | --------------------------------------------- |
| Mode                   | **Proxy required** (local on `:3457`)         |
| Vision                 | ✅ Yes                                        |
| Tool calling           | ✅ Yes (proxy forces `thinking: disabled`)    |
| Context                | 256K                                          |
| Max output             | 32K                                           |
| Required `requestBody` | `temperature: 1`                              |
| Upstream endpoint      | `https://api.moonshot.ai/v1/chat/completions` |
| Proxy endpoint         | `http://127.0.0.1:3457/v1/chat/completions`   |

## Quick Start

1. **Start the proxy** — choose one:
   - `npm run proxy:kimi` (from the repo root)
   - `npx copilot-custom-endpoint kimi` (standalone, no clone needed)
   - `npx copilot-custom-endpoint` (also starts the Qwen proxy concurrently)
2. **Edit `chatLanguageModels.json`** — add the Kimi block from [Setup](#setup) below.
3. **Set your Moonshot API key** via the Command Palette → **Chat: Manage Language Models**.
4. **Restart VS Code** and pick "Kimi K2.6" in the chat picker.

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
  "name": "Kimi",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "kimi-k2.6",
      "name": "Kimi K2.6",
      "url": "http://127.0.0.1:3457/v1/chat/completions",
      "requestBody": {
        "temperature": 1
      },
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 262144,
      "maxOutputTokens": 32768
    }
  ]
}
```

### 2. API key

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **Kimi** group → **Update API Key**.
4. Paste your Moonshot API key.

> After setting via the UI, VS Code replaces `"apiKey": ""` with a `${input:chat.lm.secret.<id>}` reference.

### 3. Local proxy

| Setting      | Value                                                 |
| ------------ | ----------------------------------------------------- |
| Script       | `proxy/kimi-proxy.mjs`                                |
| Listen URL   | `http://127.0.0.1:3457/v1/chat/completions`           |
| Health check | `http://127.0.0.1:3457/healthz`                       |
| Start        | `npm run proxy:kimi` (or `node proxy/kimi-proxy.mjs`) |
| Help         | `node proxy/kimi-proxy.mjs --help`                    |

#### Environment variables

All can be set in a `.env` file at the repo root (both proxies `import 'dotenv/config'` automatically).

| Variable                                    | Default                                               | Purpose                                                 |
| ------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| `KIMI_PROXY_PORT`                           | `3457` (falls back to `PORT`)                         | Local listen port                                       |
| `KIMI_UPSTREAM_URL`                         | `https://api.moonshot.ai/v1/chat/completions`         | Upstream Moonshot endpoint                              |
| `KIMI_PROXY_FORCE_TEMPERATURE`              | `1`                                                   | Temperature for thinking-mode requests                  |
| `KIMI_PROXY_FORCE_NON_THINKING_TEMPERATURE` | `0.6`                                                 | Temperature when thinking is disabled (tool requests)   |
| `KIMI_PROXY_FORCE_TOP_P`                    | `0.95`                                                | `top_p` forced into request body                        |
| `KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS`    | `1`                                                   | Force `thinking={"type":"disabled"}` when tools present |
| `KIMI_PROXY_LOG`                            | `debug_log/kimi-proxy.ndjson` (relative to repo root) | Redacted NDJSON log path                                |

#### Health check response

```json
{
  "ok": true,
  "upstreamUrl": "https://api.moonshot.ai/v1/chat/completions",
  "port": 3457,
  "forcedTemperature": 1,
  "forcedTopP": 0.95
}
```

#### Proxy behavior

- Forwards the existing `Authorization` header upstream.
- Rewrites plain-chat requests to `temperature: 1` and `top_p: 0.95`.
- Rewrites tool-enabled requests to `thinking: {"type": "disabled"}`, `temperature: 0.6`, and `top_p: 0.95`.
- Preserves streaming responses.
- Writes redacted request summaries to `debug_log/kimi-proxy.ndjson`.

## Configuration Reference

### Sampling parameters

| Parameter     | Value                         | Notes                            |
| ------------- | ----------------------------- | -------------------------------- |
| `temperature` | `1` (thinking) / `0.6` (tool) | Locked by model — proxy enforces |
| `top_p`       | `0.95`                        | Locked by model — proxy enforces |

### Thinking mode

| Turn type    | Behavior                                                    |
| ------------ | ----------------------------------------------------------- |
| Plain chat   | Thinking enabled, `temperature: 1`                          |
| Tool-enabled | `thinking: { type: "disabled" }` forced, `temperature: 0.6` |

### Capabilities

- Native multimodal: text, image, video input.
- Tool calling with `tool_choice: "auto"`.
- Streaming (SSE).
- `tools` / `tool_calls` only (deprecated `functions` not supported).
- `tool_choice="required"` is **not** supported by the model.

## Troubleshooting

| Symptom                                                | Likely cause               | Fix                                               |
| ------------------------------------------------------ | -------------------------- | ------------------------------------------------- |
| "Connection refused" on chat                           | Proxy not running          | `npm run proxy:kimi`                              |
| `invalid temperature: only 1 is allowed`               | Direct path without proxy  | Use the proxy                                     |
| `invalid top_p: only 0.95 is allowed`                  | Direct path without proxy  | Use the proxy                                     |
| `thinking is enabled but reasoning_content is missing` | Tool turn with thinking on | Verify `KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS=1` |
| Model not in VS Code picker                            | Config not reloaded        | Restart VS Code                                   |
| `tool_choice=required` rejected                        | Model limitation           | Use `auto` only                                   |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). Kimi K2.6 on the **Moonshot direct platform**:

| Model       | Input      | Output (non-thinking) | Output (thinking) |
| ----------- | ---------- | --------------------- | ----------------- |
| `kimi-k2.6` | $0.16 / 1M | $0.95 / 1M            | $4.00 / 1M        |

> Via DashScope, K2.6 is also available at $0.89 / 1M input and $3.71 / 1M output (same model, regional pricing).

---

## Background & Findings

> This appendix preserves the validation narrative for future reference. It is not required to use the model.

### Why Kimi was a reasonable candidate

Kimi documents an OpenAI-compatible Chat Completions API with Bearer-token auth, `model` selection, streaming, and `tools` / `tool_calls` — making VS Code Custom Endpoint `chat-completions` mode the lowest-risk starting point.

### Why direct integration failed

Direct VS Code requests to Moonshot failed in stages:

1. Initial auth failure while the config still pointed at the older `api.moonshot.cn` endpoint.
2. `invalid temperature: only 1 is allowed for this model`.
3. `invalid top_p: only 0.95 is allowed for this model`.
4. After the first tool-enabled attempt, `thinking is enabled but reasoning_content is missing in assistant tool call message`.

The model-level `requestBody.temperature = 1` override validated locally but was not sufficient in practice, which strongly suggests that VS Code's Custom Endpoint provider ignored or overwrote some model-specific request fields.

### Important caveats from research

- Kimi documents `tools` / `tool_calls`, not deprecated `functions` / `function_call`.
- `tool_choice="required"` is not supported.
- Thinking controls are Kimi-specific through a `thinking` object and `reasoning_content` fields.
- VS Code BYOK/custom endpoint support does not replace GitHub-hosted features such as inline completions or semantic search.
- K2-family models use fixed sampling values, which made request rewriting necessary when VS Code sent incompatible values.

### Validation results

| Check                                                   | Result                                                  |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `GET /v1/models` against Moonshot                       | ✅ HTTP 200                                             |
| Non-streaming chat against Moonshot                     | ✅ HTTP 200                                             |
| Streaming chat against Moonshot                         | ✅ HTTP 200                                             |
| Proxy-backed plain chat in VS Code                      | ✅                                                      |
| Proxy-backed streaming in VS Code                       | ✅                                                      |
| Proxy-backed integrated-browser tool use (post-rewrite) | ✅                                                      |
| Direct VS Code → Moonshot (no proxy)                    | ❌ — fails on temperature / top_p / `reasoning_content` |

### Tool-enabled validation details

**Prompt:** "Please open kimi documentation site using vscode integrated browser"

- First run: browser tool invocation succeeded, but the post-tool follow-up failed because thinking remained enabled and VS Code did not preserve `reasoning_content`.
- Workaround: force `thinking: { "type": "disabled" }` plus `temperature: 0.6` on tool-enabled turns.
- Rerun: both the tool turn and the follow-up model turn returned upstream `200` with `text/event-stream`.

### Proxy validation notes

- Redacted proxy logs confirmed `temperature 0.1 -> 1` and `top_p 1 -> 0.95` for plain-chat requests.
- Redacted proxy logs later confirmed `thinking undefined -> disabled` and `temperature 0.1 -> 0.6` for tool-enabled requests.

### Final verdict

- Acceptable for plain chat: **yes** (proxy)
- Acceptable for streaming chat: **yes** (proxy)
- Acceptable for tool-enabled agent use: **yes**, with the local proxy workaround
- Acceptable without a proxy: **no**

## References

- VS Code custom endpoint docs: `https://code.visualstudio.com/docs/copilot/customization/language-models#_add-a-custom-endpoint-model`
- Kimi docs index: `https://platform.kimi.ai/docs/llms.txt`
- Kimi chat completion docs: `https://platform.kimi.ai/docs/api/chat.md`
- Kimi models list: `https://platform.kimi.ai/docs/api/list-models.md`
- Kimi model parameter reference: `https://platform.kimi.ai/docs/api/models-overview.md`
- Kimi tool use docs: `https://platform.kimi.ai/docs/api/tool-use.md`
- Kimi K2.6 quickstart: `https://platform.kimi.ai/docs/guide/kimi-k2-6-quickstart.md`
- Kimi thinking guide: `https://platform.kimi.ai/docs/guide/use-kimi-k2-thinking-model.md`
- Kimi web search guide: `https://platform.kimi.ai/docs/guide/use-web-search.md`
- Kimi coding tools / agent guide: `https://platform.kimi.ai/docs/guide/agent-support.md`
- Kimi K2.6 pricing: `https://platform.kimi.ai/docs/pricing/chat-k26`
