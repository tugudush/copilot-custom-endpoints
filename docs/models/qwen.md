# Qwen (DashScope) — VS Code Custom Endpoint Setup Guide

> **TL;DR:** `qwen3.8-max` works both direct and via the local proxy. `qwen4-max` (Qwen 4 Max, released November 16, 2026) uses the same proxy path. It was wire-tested on 2026-11-22 (a direct request and a proxy tool-turn rewrite), but a full VS Code session is not yet verified (see [Notes](#notes)). Direct connections leave thinking at DashScope's default, which is on for these models. Both snippets expose a **Thinking Effort** picker (`none` / `low` / `medium` / `xhigh`). The proxy honors that effort on plain-chat turns and disables thinking (dropping the effort field) once it detects tool activity. Whether VS Code displays Qwen 4 Max's reasoning has not been verified. Use the **OpenAI-compatible** endpoint on your **workspace-dedicated** domain ([details](#which-endpoint-to-use)).

## At a Glance

| Field          | Value                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Mode           | **Proxy** (local on `:3458`) or **Direct** (provider-default thinking)                                   |
| Billing        | **Pay-as-You-Go only** — 1M-token free quota for new users                                               |
| Vision         | ✅ Yes (`qwen3.8-max`, `qwen4-max`)                                                                      |
| Tool calling   | ✅ Yes                                                                                                   |
| Context        | 1M                                                                                                       |
| Max output     | 131K                                                                                                     |
| Protocol       | **OpenAI-compatible** (`/compatible-mode/v1`) — not native DashScope (`/api/v1`)                         |
| Endpoint       | `https://<your-workspace-id>.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions`       |
| Proxy endpoint | `http://127.0.0.1:3458/v1/chat/completions`                                                              |
| Auth           | `Authorization: Bearer $DASHSCOPE_API_KEY`                                                               |
| `modelOptions` | `temperature: 1`, `top_p: 0.95` (the only sampling control VS Code forwards)                             |
| Effort picker  | `supportsReasoningEffort: ["none","low","medium","xhigh"]` + `reasoningEffortFormat: "chat-completions"` |
| `requestBody`  | **Not forwarded on VS Code 1.146** — use the proxy to toggle `enable_thinking`                           |
| Harness        | Copilot (default): enable `chat.agentHost.byokModels.enabled`; same config works on Local                |

> **Qwen 3.8 Max live-validated 2026-11-13** (VS Code 1.146, both harnesses): plain chat plus a multi-step tool loop returned HTTP 200 on both turns through the local proxy. Turn 1 carried 128 tools and no `tool_choice` (so thinking stayed at the DashScope default) and still succeeded; the proxy injected `enable_thinking: false` on the tool turn. Copilot sends 128 tools and Local sends 57; vision and long-context compaction were not tested. See [harness research § 9](../research/vscode-1.146-copilot-harness.md#9-phase-3-live-provider-validation-2026-11-13).

> **Qwen 4 Max (`qwen4-max`) is wire-tested, not yet verified in VS Code.** On 2026-11-22 a direct request returned HTTP 200 with `enable_thinking: false`, and a tool-turn request through the proxy returned HTTP 200 with the rewrite logged. Its entries below follow Alibaba's documentation plus those tests. See [Notes](#notes) for the remaining steps and the (now fixed) gzip header issue.

### Models

| Model         | Vision | Context | Max output                                              | Notes                                                                                                         |
| ------------- | ------ | ------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `qwen3.8-max` | ✅ Yes | 1M      | 131K                                                    | Frontier multimodal model; reasoning enabled by default                                                       |
| `qwen4-max`   | ✅ Yes | 1M      | 128K (non-thinking) / 256K (thinking); configs use 131K | Released November 16, 2026; reasoning enabled by default; wire-tested 2026-11-22, not yet verified in VS Code |

> A direct DashScope entry uses the provider's default thinking behavior: on for both models listed above. VS Code 1.146 drops `requestBody`, so `enable_thinking: false` cannot be set there. Direct Qwen 4 Max tool loops and reasoning display in VS Code remain unverified.

## Quick Start

### Harness prerequisite (Copilot harness, the default)

New chats run on the **Copilot harness** by default since VS Code 1.143, and the Local harness is deprecated (removal planned February 2027). For custom endpoints there:

1. **Enable `chat.agentHost.byokModels.enabled`** in Settings (experimental BYOK route) — without it, your Qwen entries never appear in the picker on Copilot-harness sessions.
2. **Open Chat: Manage Language Models once** in the window after adding the provider — until then the picker lists only extension-provided models.
3. **No extra config is needed for the Local harness**, and the same JSON works on both (measured identical request shapes on VS Code 1.146). A new chat always starts on the Copilot harness, so re-pick the session target per chat if you intend Local.

Details: [README § Setup #0](../../README.md#0-know-which-harness-you-are-on) and [harness research § 1](../research/vscode-1.146-copilot-harness.md#1-harness-transition).

### With Proxy (recommended)

1. **Enable the Copilot-harness BYOK setting** above (skip only if you deliberately use the deprecated Local harness).
2. **Set the upstream:** add `QWEN_UPSTREAM_URL=https://<your-workspace-id>.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions` to the git-ignored repo-root `.env` ([why this endpoint](#which-endpoint-to-use)). Without it the proxy falls back to the legacy shared DashScope domain.
3. **Start the proxy:** `npm run proxy:qwen` (or `npx copilot-custom-endpoint qwen`).
4. **Use the proxy-path JSON snippet** below.
5. **Set your DashScope API key** via Command Palette → **Chat: Manage Language Models**. Opening this editor once also makes the provider visible in the picker.
6. **Check the utility models (only needed without Copilot sign-in).** With a Copilot token, VS Code already uses Copilot's built-in utility models. Only for BYOK without GitHub sign-in, set **Chat: Utility Model** / **Chat: Utility Small Model** (or `chat.byokUtilityModelDefault` → _Main Agent Model_) to your fastest model. [Why?](../../README.md#4-utility-models-usually-nothing-to-do)
7. **Restart VS Code** and pick your Qwen model. Use the model picker's **Thinking Effort** control (`none` / `low` / `medium` / `xhigh`) for plain-chat depth; the proxy suppresses thinking (and the effort field) on tool turns regardless. Qwen 4 Max reasoning display in VS Code remains unverified.

### Direct (no proxy)

1. **Enable the Copilot-harness BYOK setting** above (skip only if you deliberately use the deprecated Local harness).
2. **Use the direct-path JSON snippet** below and replace `<your-workspace-id>` in `url` with your workspace ID.
3. **Set your `DASHSCOPE_API_KEY`** via Command Palette → **Chat: Manage Language Models**. Opening this editor once also makes the provider visible in the picker.
4. **Check the utility models (only needed without Copilot sign-in)** — same rule as the proxy path above. [Why?](../../README.md#4-utility-models-usually-nothing-to-do)
5. **Restart VS Code** and pick "Qwen 3.8 Max" or "Qwen 4 Max". The **Thinking Effort** picker (`none` / `low` / `medium` / `xhigh`) controls reasoning depth; `none` disables thinking entirely.

## Setup

### Which endpoint to use

Model Studio's **API Quick Access** dialog (shown once, right after you create a key) lists an **API Host**, an **OpenAI Compatible Endpoint**, and a **DashScope** URL. Two choices matter:

- **Protocol — OpenAI-compatible (`/compatible-mode/v1`).** VS Code's `chat-completions` custom endpoint and `proxy/qwen-proxy.mjs` speak the OpenAI Chat Completions schema. The **DashScope** card (`/api/v1`) is the native DashScope protocol (`input.messages` requests, `output.choices` responses, `{code, message, request_id}` errors) and does not work here.
- **Domain — workspace-dedicated (`<workspace-id>.<region>.maas.aliyuncs.com`).** Alibaba recommends it for production: higher concurrency, network isolation, and a 3600 s request timeout (600 s on the legacy DashScope domains, which Alibaba says stop supporting new features after September 30, 2026). The legacy domains still work, so existing setups keep running.

The chat URL is `https://` + domain + `/compatible-mode/v1/chat/completions`. Copy the domain from the API Quick Access dialog (or the **API Host** column on Workspace Management); the **OpenAI Compatible Endpoint** value plus `/chat/completions` gives the same URL.

| Region        | Workspace-dedicated domain (recommended)               | Legacy DashScope domain       |
| ------------- | ------------------------------------------------------ | ----------------------------- |
| Singapore     | `<your-workspace-id>.ap-southeast-1.maas.aliyuncs.com` | `dashscope-intl.aliyuncs.com` |
| China         | `<your-workspace-id>.cn-beijing.maas.aliyuncs.com`     | `dashscope.aliyuncs.com`      |
| US (Virginia) | `<your-workspace-id>.us-east-1.maas.aliyuncs.com`      | `dashscope-us.aliyuncs.com`   |

API keys are bound to their region (and, on a workspace-dedicated domain, to their workspace); a mismatch returns `401 invalid_api_key`. Source: [Alibaba Cloud Model Studio — Regions and endpoints](https://www.alibabacloud.com/help/en/model-studio/regions).

### 1. VS Code configuration

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

#### Direct path

```json
{
  "name": "Qwen",
  "vendor": "customendpoint",
  "apiKey": "${input:qwenApiKey}",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "qwen3.8-max",
      "name": "Qwen 3.8 Max",
      "url": "https://<your-workspace-id>.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 868928,
      "maxOutputTokens": 131072,
      "supportsReasoningEffort": ["none", "low", "medium", "xhigh"],
      "reasoningEffortFormat": "chat-completions",
      "modelOptions": { "temperature": 1, "top_p": 0.95 }
    },
    {
      "id": "qwen4-max",
      "name": "Qwen 4 Max",
      "url": "https://<your-workspace-id>.ap-southeast-1.maas.aliyuncs.com/compatible-mode/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 868928,
      "maxOutputTokens": 131072,
      "supportsReasoningEffort": ["none", "low", "medium", "xhigh"],
      "reasoningEffortFormat": "chat-completions",
      "modelOptions": { "temperature": 1, "top_p": 0.95 }
    }
  ]
}
```

> **Context budget:** `868928 + 131072 = 1000000`, the window for `qwen3.8-max` and `qwen4-max`. DashScope separately caps input at 991000 tokens, so 868928 leaves room for the output budget. For `qwen4-max`, Alibaba lists up to 256K output tokens in thinking mode, but this budget keeps 131072 for both models. Raise `maxInputTokens` only by lowering `maxOutputTokens`.

> **Direct path caveat:** `enable_thinking` cannot be set from `chatLanguageModels.json` on VS Code 1.146, so reasoning stays on (at the picker's effort level, or DashScope's default) and tool loops may hit `reasoning_content` errors. The effort picker's `none` does disable thinking, but statically — for every turn. Use the proxy for tool-heavy work: it suppresses thinking only when tool activity is detected.

#### Proxy path

1. Start the proxy:

   ```bash
   node proxy/qwen-proxy.mjs
   ```

   Verify:

   ```bash
   curl http://127.0.0.1:3458/healthz
   ```

2. Use this snippet (URLs point at the proxy; thinking is handled dynamically — the effort metadata only adds the **Thinking Effort** picker):

```json
{
  "name": "Qwen",
  "vendor": "customendpoint",
  "apiKey": "${input:qwenApiKey}",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "qwen3.8-max",
      "name": "Qwen 3.8 Max",
      "url": "http://127.0.0.1:3458/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 868928,
      "maxOutputTokens": 131072,
      "supportsReasoningEffort": ["none", "low", "medium", "xhigh"],
      "reasoningEffortFormat": "chat-completions"
    },
    {
      "id": "qwen4-max",
      "name": "Qwen 4 Max",
      "url": "http://127.0.0.1:3458/v1/chat/completions",
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 868928,
      "maxOutputTokens": 131072,
      "supportsReasoningEffort": ["none", "low", "medium", "xhigh"],
      "reasoningEffortFormat": "chat-completions"
    }
  ]
}
```

> **Keep the proxy terminal open** while using Qwen via proxy. Configuration knobs are documented in [Local Proxy](#local-proxy) below.

### 2. API key

DashScope is **Pay-as-You-Go only** — but new Model Studio users get **1M input + 1M output tokens per model free for 90 days**. Prepaid token packages are also available.

1. Open the Command Palette (`Ctrl+Shift+P`).
2. Run **Chat: Manage Language Models**.
3. Find the **Qwen** group → **Update API Key**.
4. Paste your DashScope API key.

> **`apiKey` must be non-empty** — the file's schema enforces `minLength: 1`, so `"apiKey": ""` shows _String is shorter than the minimum length of 1_. Use the `${input:...}` placeholder shown above and set it through the Language Models UI, which rewrites it to a `${input:chat.lm.secret.<id>}` keychain reference. Keys are region-specific.
>
> New keys start with `sk-ws-` and are shown only once, in the **API Quick Access** dialog — copy the key before closing it. Older `sk-` keys keep working.

## Local Proxy

The `proxy/qwen-proxy.mjs` adds dynamic thinking suppression on top of the direct integration. By default, it leaves provider-default thinking in place until it detects tool activity, then sends `enable_thinking: false` and drops any `reasoning_effort` (DashScope rejects that combination). Your **Thinking Effort** picker choice therefore applies to plain-chat turns; tool turns always run with thinking off. The simpler direct path leaves thinking on by default (or honors the picker, including `none`), but does not suppress it during tool loops. Whether VS Code displays Qwen 4 Max's reasoning has not been verified for either path. Both `qwen3.8-max` and `qwen4-max` use the same proxy: it forwards the model ID unchanged and sets `enable_thinking`, which both models accept.

| Setting      | Value                                                 |
| ------------ | ----------------------------------------------------- |
| Script       | `proxy/qwen-proxy.mjs`                                |
| Listen URL   | `http://127.0.0.1:3458/v1/chat/completions`           |
| Health check | `curl http://127.0.0.1:3458/healthz`                  |
| Start        | `npm run proxy:qwen` (or `node proxy/qwen-proxy.mjs`) |
| Help         | `node proxy/qwen-proxy.mjs --help`                    |

### Environment variables

Set in `.env` at the repo root (the proxy `import 'dotenv/config'` automatically).

| Variable                                 | Default                                                                            | Purpose                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `QWEN_PROXY_PORT`                        | `3458`                                                                             | Local listen port                                                                       |
| `QWEN_UPSTREAM_URL`                      | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions` (legacy) | Upstream OpenAI-compatible endpoint — set to your workspace-dedicated URL (recommended) |
| `QWEN_PROXY_LOG`                         | `debug_log/qwen-proxy.ndjson`                                                      | Redacted NDJSON log path                                                                |
| `QWEN_PROXY_DISABLE_THINKING_WITH_TOOLS` | `1`                                                                                | Set to `0` to skip tool-aware thinking suppression                                      |

### What the proxy does

The proxy detects active tool use by examining the conversation state (a `"tool"`-role message in history or a non-default `tool_choice`), not just the presence of a `tools` array. This correctly handles tool-enabled conversations even when the client sends `tools` in an earlier request but omits it from subsequent turns.

| Condition                                                     | Action                                                                                                |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Tool-role message in history **or** non-default `tool_choice` | Inject `enable_thinking: false` and **delete `reasoning_effort`** (DashScope 400s on the combination) |
| Plain chat (no tool activity)                                 | Delete `enable_thinking` (default ON); forward `reasoning_effort` unchanged                           |

### Forwards header & streaming

- Forwards your `Authorization` header upstream unchanged.
- Preserves streaming responses (SSE).
- Writes redacted request summaries to `debug_log/qwen-proxy.ndjson`.

> **Keep the proxy terminal open** while using Qwen via proxy.

## Notes

- **Vision (`qwen3.8-max`, `qwen4-max`)** uses OpenAI-compatible `content` array format. Base64 data URIs work reliably; external image URLs may fail if DashScope can't reach them. If a drag-and-drop image fails to load, providing the absolute file path (e.g. `c:\path\to\image.png`) in the prompt is a reliable workaround. Alibaba and Artificial Analysis list text, image, and video input for `qwen4-max`; this repo has not tested image or video input on it.
- **Qwen 3.8 reasoning:** `qwen3.8-max` enables reasoning by default; Alibaba documents `reasoning_effort` values `low`, `medium`, and `xhigh` (default). **Measured 2026-11-23 against the workspace endpoint: the server is more permissive than the docs** — `high`, `max`, and `minimal` are also accepted (HTTP 200), and `none` disables thinking entirely (no reasoning tokens). Do not treat the undocumented levels as contractual; they may be clamped aliases. On VS Code 1.146 neither `enable_thinking` nor `reasoning_effort` can be set from `requestBody` — effort goes through the `supportsReasoningEffort` metadata (see below), and the proxy toggles thinking per turn: on for plain chat (at the picker's effort), suppressed when tool activity is detected.
- **Qwen 4 Max reasoning:** `qwen4-max` enables thinking by default and accepts `enable_thinking` plus `reasoning_effort` values `low`, `medium`, and `xhigh`. Alibaba's `qwen4-max-preview` docs give `xhigh` as the default, while OpenRouter's listing says `high`, so the documented default is unresolved; the proxy forwards the picker's effort on plain-chat turns and sets none itself, so leaving the picker unset uses the provider default. The 2026-11-23 live probe (see the effort-levels table below) found the same undocumented-but-accepted extras (`high`, `max`, `minimal`, `none`) as `qwen3.8-max`. Alibaba also documents `thinking_display` and `preserve_thinking` for multi-turn reasoning history. Neither the proxy nor VS Code sets them here, and their effect is not measured.
- **Qwen 4 Max wire test (run 2026-11-22):** a direct request with `enable_thinking: false` returned HTTP 200. Repeat it with `curl -X POST <upstream-url> -H "Authorization: Bearer $DASHSCOPE_API_KEY" -H "Content-Type: application/json" -d '{"model":"qwen4-max","messages":[{"role":"user","content":"Hello"}],"enable_thinking":false}'`. A tool-turn request through `proxy/qwen-proxy.mjs` also returned HTTP 200, and `debug_log/qwen-proxy.ndjson` logged `rewrittenEnableThinking: false` with `hasTools: true`.
- **Qwen 4 Max remaining checks:** run a full tool loop from VS Code and record it here.
- **Gzip header issue (fixed 2026-11-23):** the 2026-11-22 wire test saw the proxy's response carry `content-encoding: gzip` on a plain-JSON body, breaking PowerShell and Node clients. Root cause: `fetch` in [lib/create-proxy.mjs](../../lib/create-proxy.mjs) already decodes the upstream body, but `buildResponseHeaders` re-declared the upstream's `content-encoding`/`content-length`. [lib/shared.mjs](../../lib/shared.mjs) now strips both headers (all proxies); live-verified through the Qwen proxy on 2026-11-23 — responses parse cleanly with no `content-encoding`.
- **Effort through the proxy, live-verified 2026-11-23** (`qwen3.8-max`, real tool-history turn): plain chat + `reasoning_effort: "low"` → 200 with reasoning on; tool turn + `"xhigh"` (the combination that previously 400'd) → 200 with thinking off and the effort dropped; plain chat + `"none"` → 200 with zero reasoning tokens. The VS Code picker/UI pass with the new snippet metadata has not been run yet.
- **Thinking trade-off:** With the default proxy settings, plain-chat thinking uses the picker's effort level (or the provider default), and tool-activity turns are disabled regardless of the picker. Direct connections honor the picker on every turn — including `none`, which turns thinking off everywhere — but never switch automatically; Qwen 4 Max's direct tool-loop behavior is unverified.
- **First tool-capable request:** detection is history-based, so an initial request that sends a `tools` array with no `tool_choice` and no tool-role history is treated as plain chat (thinking stays on). Measured on VS Code 1.146: both the Copilot and Local harnesses send their full tool set with **no** `tool_choice`, so the first turn is always plain chat. `tool_choice: "none"` is also treated as plain chat. See [the harness research](../research/vscode-1.146-copilot-harness.md).
- **`tool_choice` only supports `auto`** — don't override it (VS Code's default is `auto`).
- **Effort levels — what is compatible (probed live 2026-11-23, both models, workspace-dedicated endpoint):**

  | `reasoning_effort`         | `qwen3.8-max`                     | `qwen4-max`                       | Status                                                                                                                                                                   |
  | -------------------------- | --------------------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | `low` / `medium` / `xhigh` | ✅ 200                            | ✅ 200                            | Documented by Alibaba (`xhigh` is the documented default)                                                                                                                |
  | `high` / `max` / `minimal` | ✅ 200                            | ✅ 200                            | **Undocumented but accepted** — likely clamped aliases; single-run reasoning-token counts did not cleanly separate them from the documented tiers, so don't rely on them |
  | `none`                     | ✅ 200, **zero reasoning tokens** | ✅ 200, **zero reasoning tokens** | Genuinely disables thinking, like `enable_thinking: false`                                                                                                               |
  | absent                     | ✅ 200, thinking on               | ✅ 200, thinking on               | Provider default                                                                                                                                                         |

  This differs from the always-thinking providers in this repo (Kimi K3.1, GLM 5.3, MiniMax M3.1 Flash), where thinking cannot be turned off and `none` is absent or rejected — Qwen accepts `none`.

- **Effort + thinking-suppression conflict (handled by the proxy since 2026-11-23):** DashScope rejects `enable_thinking: false` combined with any non-`none` effort — HTTP 400 `'reasoning_effort' must be 'none' when 'enable_thinking' is false` (measured 2026-11-23). [lib/qwen-rewrite.mjs](../../lib/qwen-rewrite.mjs) now **deletes `reasoning_effort` on every suppressed (tool-activity) turn**, so the effort picker is safe on the proxy path: your chosen effort applies to plain-chat turns, and tool turns run with thinking off regardless of the picker. On plain-chat turns the effort is forwarded unchanged. Older proxy versions passed the field through and would 400 — update if you see that error.

- **Effort control via VS Code (wired into both snippets):** `supportsReasoningEffort: ["none", "low", "medium", "xhigh"]` + `reasoningEffortFormat: "chat-completions"` adds the **Thinking Effort** picker to the model picker; the chosen level is sent as top-level `reasoning_effort` (the forwarding mechanism was measured on both harnesses — see [harness research § 9](../research/vscode-1.146-copilot-harness.md#9-phase-3-live-provider-validation-2026-11-13)). The declared set is Alibaba's documented `low` / `medium` / `xhigh` plus `none` (probe-verified to disable thinking on both models). **Don't add `high` or `max`** — they work today only as undocumented aliases. `none` genuinely turns thinking off on the direct path; on the proxy path thinking is additionally suppressed on tool turns regardless of the picker. The snippets deliberately omit `thinking: true`: it would forward `maxOutputTokens` as `max_completion_tokens` and enable unverified `reasoning_content` replay; the provider's output default applies without it.

## Troubleshooting

| Symptom                                                                 | Likely cause                                                             | Fix                                                                                                          |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Qwen missing from the picker (Copilot harness)                          | BYOK not enabled, or editor never opened in this window                  | Enable `chat.agentHost.byokModels.enabled`, then open **Chat: Manage Language Models** once                  |
| "Connection refused" (proxy mode)                                       | Proxy not running                                                        | `npm run proxy:qwen`                                                                                         |
| Tool loops fail with `reasoning_content` errors                         | Direct path with thinking on; `requestBody` cannot disable it            | Use the proxy (`npm run proxy:qwen`)                                                                         |
| Tool loops still fail with proxy                                        | Proxy not rewriting                                                      | Check `debug_log/qwen-proxy.ndjson` — verify `hasTools: true` requests have `rewrittenEnableThinking: false` |
| 400 `'reasoning_effort' must be 'none' when 'enable_thinking' is false` | Outdated proxy that forwards `reasoning_effort` on suppressed tool turns | Update the repo and restart `npm run proxy:qwen` — the rewrite now drops the effort field on those turns     |
| Vision fails with external image URL                                    | DashScope couldn't reach the URL                                         | Use a base64 data URI instead                                                                                |
| 401 Unauthorized                                                        | API key region or workspace mismatch                                     | Match your key to the endpoint's region (and workspace, on a workspace-dedicated domain)                     |
| 404 Not Found                                                           | URL uses the native DashScope path (`/api/v1`) or omits the path         | Use `/compatible-mode/v1/chat/completions`                                                                   |
| Want to switch back to direct                                           | Proxy mode active                                                        | Revert `url` to the DashScope endpoint; reasoning stays at the provider default                              |

## Pricing

For the cross-provider comparison, see [docs/pricing.md](../pricing.md). DashScope (international) rates for **non-thinking** mode:

| Model         | Input (≤ 256K tokens) | Input (> 256K tokens) | Output (≤ 256K tokens) | Output (> 256K tokens) |
| ------------- | --------------------- | --------------------- | ---------------------- | ---------------------- |
| `qwen3.8-max` | $2.00                 | —                     | $6.00                  | —                      |
| `qwen4-max`   | $1.50                 | —                     | $4.50                  | —                      |

> **Qwen 4 Max pricing:** Alibaba's console lists a single price set for `qwen4-max`, with implicit cache at $0.075 per 1M input tokens and explicit cache at $1.875 (5-minute) or $3 (1-hour) to write and $0.075 to read.

> **Billing options:** Qwen Cloud now offers a separate Token Plan subscription with access to Qwen3.8 Max and Qwen4 Max. The validated VS Code snippets in this document use the PAYG DashScope-compatible endpoint and API key; do not assume the Token Plan base URL or credentials are interchangeable without following Qwen Cloud's current integration instructions.

> Free quota: 1M input + 1M output tokens per model, valid 90 days after activating Model Studio. Each model has its own quota, so `qwen4-max`'s allocation is on its Model Studio console page.
