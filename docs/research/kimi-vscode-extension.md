# Kimi — Custom Endpoint vs `kimi-lm-copilot-provider` Extension

> Research record comparing the setup in this repo (`copilot-custom-endpoint` + `proxy/kimi-proxy.mjs`) against the third-party VS Code extension [zelosleone/kimi-lm-copilot-provider](https://github.com/zelosleone/kimi-lm-copilot-provider) (published as `DenizhanDaklr.kimi-lm-provider`, v0.3.0, **June 21, 2026**).
>
> **Current date of this research:** July 1, 2026. Extension last published ~10 days earlier.

---

## TL;DR

- The extension is **legitimately useful** for a different audience: users who want a **zero-proxy** Kimi setup, who are happy with the single `kimi-for-coding` model, and who are on the **Kimi Coding** tier (a separate subscription tier that our proxy does **not** target).
- Our proxy covers a **different SKU surface** (K2.6, K2.7 Code on Pay-as-You-Go `api.moonshot.ai`) and a **different VS Code integration path** (`chatLanguageModels.json` / Custom Endpoints, not the newer `lm.registerLanguageModelChatProvider` API).
- The two approaches are **not interchangeable**. They target overlapping use cases but differ in (1) the API tier they hit, (2) the model IDs exposed, (3) whether a local process is required, and (4) how sampling/thinking parameters are handled.
- For Pay-as-You-Go users on `platform.kimi.ai/console` who want K2.6 or K2.7 Code with the validated `maxOutputTokens` knobs, our setup remains the only validated path — the extension will not accept a PayGo API key (see [§ 2](#2-different-upstream-sku)). The extension is worth listing as an **alternative** for users on the Kimi Coding tier (`kimi.com/code/console`) who want a simpler install.

---

## Side-by-Side At-a-Glance

| Dimension                  | This repo (`copilot-custom-endpoint`)                                                  | `kimi-lm-copilot-provider` extension                                                                                                            |
| -------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Integration API**        | VS Code Custom Endpoints (`chatLanguageModels.json`, `vendor: "customendpoint"`)       | `vscode.lm.registerLanguageModelChatProvider("moonshot", …)` (proposed-API-era native provider)                                                 |
| **Local processes**        | **Yes** — `node proxy/kimi-proxy.mjs` on `:3457`                                       | **No** — pure extension                                                                                                                         |
| **Upstream base URL**      | `https://api.moonshot.ai/v1` (Moonshot Pay-as-You-Go)                                  | `https://api.kimi.com/coding/v1` (Kimi Coding tier) with `.cn` and `.ai` alternates                                                             |
| **Auth**                   | Bearer token via VS Code's `Chat: Manage Language Models` UI                           | Bearer token via `moonshot.apiKey` setting (`secret: true`)                                                                                     |
| **Available models**       | `kimi-k2.6`, `kimi-k2.7-code` (validated); could be extended to K2.5                   | `kimi-for-coding` only (single model)                                                                                                           |
| **Context**                | 262 K input / 32 K output (K2.6), 262 K / 4 K (K2.7)                                   | 229 K input / 32 K output                                                                                                                       |
| **Vision**                 | ✅ (both K2.6 and K2.7 Code)                                                           | ✅ (single model)                                                                                                                               |
| **Tool calling**           | ✅                                                                                     | ✅ (incl. `tool_choice: "required"` — supported by extension, not by our validated model usage)                                                 |
| **Streaming**              | ✅ SSE passthrough                                                                     | ✅ SSE parser w/ strict `[DONE]` for Moonshot, lenient for `kimi.com`                                                                           |
| **`temperature`**          | **Forced** by proxy: `1` (thinking), `0.6` (non-thinking tool turns, K2.6 only)        | **Not sent** — author delegates to the API ("Chinese providers are better at handling these")                                                   |
| **`top_p`**                | **Forced** to `0.95` by proxy                                                          | **Not sent by default** — caller may opt in                                                                                                     |
| **Thinking mode**          | Proxy forces `thinking: {type:"disabled"}` when tools present on K2.6; lets K2.7 think | Sends `thinking: {type:"enabled",keep:"all"}` by default; toggled via `modelOptions.thinkingMode === "disabled"`                                |
| **Special headers**        | None (just forwards `Authorization`)                                                   | Adds 7 CLI-impersonation headers (`User-Agent: KimiCLI/1.47.0`, `X-Msh-Platform: kimi_cli`, `X-Msh-Device-*`, etc.)                             |
| **Prompt caching**         | Not handled                                                                            | Sends `prompt_cache_key` from VS Code `metadata.taskId` — likely unlocks server-side cache                                                      |
| **Reasoning preservation** | Forced off across tool turns (K2.6) to dodge VS Code's missing-`reasoning_content` bug | Maps native `LanguageModelThinkingPart` (proposed API) ↔ `reasoning_content` round-trip across turns                                            |
| **Logging**                | Redacted NDJSON (`debug_log/kimi-proxy.ndjson`)                                        | None visible to user from extension logs                                                                                                        |
| **Tests**                  | 36 unit + integration tests in `tests/`                                                | No test suite in repo                                                                                                                           |
| **VS Code version**        | Compatible with stock VS Code (Custom Endpoints feature)                               | Requires VS Code `^1.120.0` and proposed `languageModelThinkingPart` API enabled                                                                |
| **Install effort**         | Edit JSON, install Node.js npm package, run proxy, set key                             | One-click VSIX install from Marketplace                                                                                                         |
| **License**                | MIT (this repo)                                                                        | MIT                                                                                                                                             |
| **Trust signal**           | Validated in this repo, transparent proxy logs, tests                                  | 4 ⭐, 5 forks, 4,686 installs, 1 open issue (`#5`, May 31, 2026 — "Blank responses in Copilot Chat due to reasoning_content rendering failure") |

---

## What the Extension Actually Does

The extension is a typed TypeScript VS Code extension (~500 LOC across 6 files: `extension.ts`, `api.ts`, `config.ts`, `models.ts`, `provider.ts`, `reasoning.ts`) that registers a VS Code native language-model chat provider.

### Manifest highlights ([`package.json`](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/package.json))

- **`engines.vscode`:** `^1.120.0`
- **`enabledApiProposals`:** `["languageModelThinkingPart"]` — a _proposed_ API used to round-trip reasoning content
- **`contributes.languageModelChatProviders`:** registers vendor `moonshot`, display name **"Moonshot"**, requiring only `apiKey`
- **`contributes.commands`:** five commands:
  - `kimi.testConnection` — direct chat-completions ping
  - `kimi.setBaseUrl.global` (→ `api.kimi.com/coding/v1`)
  - `kimi.setBaseUrl.china` (→ `api.kimi.cn/coding/v1`)
  - `kimi.setBaseUrl.ai` (→ `api.kimi.ai/coding/v1`)
  - `kimi.setBaseUrl.custom` — ask for any base URL ending in `/coding/v1`

### Request shape ([`api.ts`](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/api.ts))

Only when `top_p` is set by the caller:

```json
{
  "model": "kimi-for-coding",
  "messages": [...],
  "stream": true,
  "thinking": { "type": "enabled", "keep": "all" },
  "top_p": 0.95,
  "max_completion_tokens": 32768,
  "tools": [...],
  "tool_choice": "auto",
  "prompt_cache_key": "<metadata.taskId>"
}
```

**`temperature` is deliberately absent.** The author explains (README, verbatim): _"temperature is not sent by this extension. I am letting API handle it by itself. Chinese providers are better at handling these stuff by themselves, and I don't want to mess with it."_

### Required request headers (again from `api.ts`)

```
Content-Type: application/json
Authorization: Bearer <apiKey>
User-Agent: KimiCLI/1.47.0
X-Msh-Platform: kimi_cli
X-Msh-Version: 1.47.0
X-Msh-Device-Name: <hostname>
X-Msh-Device-Model: <OS model>
X-Msh-Device-Id: <generated uuid, no dashes>
X-Msh-Os-Version: <OS version>
```

This is significant: the README states _"Currently, Kimi wouldn't accept ANY clients so we need to send extra headers to larp as an accepted client."_ The extension is faking the Kimi CLI client to gain access to a different SKU surface — almost certainly the **Kimi Coding** enterprise/consumer subscription (`kimi.com/code/console`), not Pay-as-You-Go.

### Model surface ([`models.ts`](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/models.ts))

```ts
;[
  {
    id: 'kimi-for-coding',
    name: 'Kimi for Coding',
    family: 'kimi',
    version: 'for-coding',
    tooltip: 'Moonshot AI',
    maxInputTokens: 229376,
    maxOutputTokens: 32768,
    thinking: true,
    requireSseDoneMarker: false,
    capabilities: { imageInput: true, toolCalling: true }
  }
]
```

Single-model catalog. `requireSseDoneMarker: false` means the extension accepts an SSE stream that closes without an explicit `data: [DONE]` — important because the `kimi.com/coding` endpoint apparently does **not** always emit `[DONE]`, while Moonshot's standard endpoint does.

### Tool-call streaming ([`provider.ts`](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/provider.ts))

Stream-collected deltas with these tricks:

- A `ToolCallBuilder` map keyed by `tool_call.index` reassembles streamed `function.arguments` fragments.
- If a tool call follows reasoning, the `<details>`-collapsed thinking block is **closed before** the tool call is emitted.
- Final `tool_calls` are dispatched to VS Code via `progress.report(new LanguageModelToolCallPart(...))`.
- `provideTokenCount` counts characters / 4 and includes thinking parts.

The reasoning round-trip uses the **proposed `languageModelThinkingPart`** VS Code API (`vscode.proposed.languageModelThinkingPart.d.ts`) — this is why the extension requires the API to be enabled.

---

## How Our Setup Differs Mechanically

### 1. Two different VS Code provider APIs

- **Extension:** VS Code's newer _Language Model Provider API_ — `vscode.lm.registerLanguageModelChatProvider("moonshot", provider)`. This is what real extensions (GitHub Copilot Chat, Continue, etc.) use. Models registered this way participate in VS Code's native language-model UI, including token counting, token-budget tracking, and chat-agent tool registration.
- **Our setup:** the _Custom Endpoint_ feature (`vendor: "customendpoint"` in `chatLanguageModels.json`). It is sufficient for chat, streaming, and tool calling, but **does not** participate in the proposed-API thinking-part round-trip. As a result, our proxy must force `thinking: disabled` on tool turns to avoid the well-known `"thinking is enabled but reasoning_content is missing"` 400 from Moonshot ([kimi.md](../models/kimi.md#troubleshooting)).

### 2. Different upstream SKU

- **Extension:** `https://api.kimi.com/coding/v1` (Kimi Coding tier) — auth key issued by `kimi.com/code/console`.
- **Our setup:** `https://api.moonshot.ai/v1` (Pay-as-You-Go Moonshot) — auth key issued by `platform.kimi.ai/console` (formerly `platform.moonshot.ai`).

The Kimi Coding tier is a separate billing product (the consumer/agent SKU exposed via `kimi.com/code/console`) that **requires the CLI client fingerprint** (`User-Agent: KimiCLI/…`, `X-Msh-Platform: kimi_cli`, etc.). Without those headers, the same extension source code targets the wrong SKU and fails authentication or pricing checks. The SKU has its own rate limits and quotas.

This is also why the extension's single model id is `kimi-for-coding` and not `kimi-k2.6` / `kimi-k2.7-code` — the `for-coding` slug is the SKU's routing key.

**Pay-as-You-Go incompatibility is therefore structural, not incidental.**

- A Pay-as-You-Go API key from `platform.kimi.ai/console` **will not authenticate** against `api.kimi.com/coding/v1` — that endpoint expects a key from `kimi.com/code/console` (the Coding-tier account) and rejects unrelated accounts with HTTP 401/403.
- The CLI-fingerprint headers (`User-Agent: KimiCLI/…`, `X-Msh-*`) are required by the Coding endpoint for access control. Pay-as-You-Go's `api.moonshot.ai/v1` does not require them and ignores them.
- The model id `kimi-for-coding` is a Coding-tier SKU; PayGo's `api.moonshot.ai/v1` exposes `kimi-k2.6` / `kimi-k2.7-code` instead, which the extension's hard-coded [`KIMI_MODELS` array](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/models.ts) does not register.
- Although `kimi.setBaseUrl.custom` lets a user point the extension at any URL, there is no compatible endpoint: replacing the base URL with `api.moonshot.ai/v1` would still send `kimi-for-coding` as the model id and the CLI-impersonation headers that PayGo does not need.

**Net effect:** Pay-as-You-Go users must use this repo's proxy. Coding-tier users can choose either; the extension is the lower-friction option for that tier.

### 3. Sampling-parameter policy

- **Our proxy:** _imperative_. `temperature: 1` and `top_p: 0.95` are force-injected because K2.5/K2.6 models reject other values with `invalid temperature: only 1 is allowed` and `invalid top_p: only 0.95 is allowed` (validated, see [kimi.md](../models/kimi.md)). For K2.7 Code (always-thinking), only `temperature: 1` / `top_p: 0.95` is locked; thinking stays on.
- **Extension:** _delegated_. It never sends `temperature` and only sends `top_p` if the caller sets it. The author trusts the `kimi.com/coding` endpoint to pick sensible defaults.

This works for the extension because it talks to a different SKU where the sampling constraints are softer (or the defaults already match what K2.6/K2.7 require). It would **not** work against `api.moonshot.ai/v1` — our `invalid temperature` 400s are documented in [kimi.md](../models/kimi.md#why-direct-integration-failed).

### 4. Thinking-mode policy

- **Extension:** `thinking: { type: "enabled", keep: "all" }` on by default; can be turned off via VS Code 1.120+ `modelOptions.thinkingMode === "disabled"`. The `keep: "all"` flag preserves reasoning across every turn (server-side), which combined with the proposed-API thinking-part round-trip allows reasoning to survive multi-turn loops.
- **Our setup (K2.6):** force `thinking: { type: "disabled" }` for _any_ request that has a `tool_choice` or any `tool` role message — required to avoid the `reasoning_content` mismatch error on subsequent tool turns.
- **Our setup (K2.7 Code):** K2.7 is always-thinking and rejects `thinking: disabled` with HTTP 400; our proxy detects `kimi-k2.7*` model IDs and skips that rewrite.

### 5. Request-rewriting logic

Our `rewriteKimi` function in [proxy/kimi-proxy.mjs](../../proxy/kimi-proxy.mjs) does the following, which the extension doesn't need to do:

| Rewrite                         | Why                                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `payload.temperature = 1`       | K2 family rejects other values with HTTP 400                                        |
| `payload.top_p = 0.95`          | K2 family rejects other values with HTTP 400                                        |
| `payload.thinking = {disabled}` | K2.6 only — work around VS Code's missing-`reasoning_content` bug across tool turns |
| K2.7 detection (`isK27`)        | Skip the thinking-disable rewrite for `kimi-k2.7*` slugs                            |

None of this is needed for the extension because its endpoint accepts the model defaults natively and uses a newer API that preserves reasoning across turns.

### 6. Prompt caching

- **Extension:** forwards `prompt_cache_key = options.metadata.taskId` — the extension trusts VS Code's task-id metadata to populate Moonshot's prompt-cache key. If the server supports `prompt_cache_key` on `api.kimi.com/coding`, this could meaningfully reduce cost across multi-turn agent loops.
- **Our setup:** no prompt-cache key is sent. Pay-as-You-Go's `api.moonshot.ai/v1` supports a `cached input` pricing tier ($0.16/1M for K2.6, $0.19/1M for K2.7) but our proxy does not generate a stable cache key. Adding `prompt_cache_key` derived from a stable session identifier would be a straightforward improvement.

---

## What Each Is Good For

### Our repo setup wins on…

- **Pay-as-You-Go users** who recharge `platform.kimi.ai/console`.
- **Model selection:** if you want `kimi-k2.6` or `kimi-k2.7-code` specifically (you can pick either from a config block).
- **No extension install:** only `chatLanguageModels.json` and `node` are required; works on locked-down VS Code installs.
- **Transparent behaviour:** redacted NDJSON proxy logs + 36 tests let you see exactly what is being sent to Moonshot.
- **K2.7 Code awareness:** proven safe configuration with `maxOutputTokens: 4096` to avoid VS Code's "Response too long" error in agent mode.
- **Provider-agnostic proxy:** the same Node proxy pattern extends to Qwen 3.x, MiMo V2.5, and any other OpenAI-compatible provider.

### The extension wins on…

- **Kimi Coding subscribers:** people who already have a `kimi.com/code/console` subscription and want to use it from VS Code with one click.
- **No local process:** no Node, no terminal, no extra port — just install the extension and set the key.
- **Reasoning fidelity across turns:** uses proposed `languageModelThinkingPart` to keep `reasoning_content` aligned across tool loops. This is a structural improvement over Custom Endpoints.
- **Prompt-cache support:** passes `prompt_cache_key` so server-side caching can reduce cost on long agent sessions.
- **Self-test command:** `kimi.testConnection` validates the API key from inside VS Code, without needing `curl`.
- **Country-aware base URL preset:** one-click switch between global (`kimi.com`), China (`kimi.cn`), and alternative (`kimi.ai`) endpoints.

---

## Risks / Open Questions for the Extension

1. **Open issue [`#5`](https://github.com/zelosleone/kimi-lm-copilot-provider/issues/5)** (opened May 31, 2026): _"Blank responses in Copilot Chat due to reasoning_content rendering failure."_ This is exactly the failure mode our proxy _avoids_ by forcing `thinking: disabled` on tool turns — but the extension's fix is on a different path (round-tripping `LanguageModelThinkingPart`). Until issue #5 is closed, the extension's preview/thinking display may still produce blank outputs in Copilot Chat.
2. **Low star count (4) and small maintainer base** (one contributor). Updates are infrequent — version `0.3.0` shipped ~10 days before this research and the previous version (`0.2.0`) was 2 months earlier.
3. **Proposed API dependency.** `languageModelThinkingPart` is **proposed**, not stable. A future VS Code release could rename or remove it without a deprecation cycle.
4. **SKU lock-in.** Headers impersonate the Kimi CLI; if Moonshot decides to retire or rebrand the `kimi.com/coding` tier, the extension breaks without code changes.
5. **No automatic sampling rewrites.** If the `kimi.com/coding` endpoint ever tightens its sampling constraints the way `api.moonshot.ai/v1` did, the extension would need to start forcing `temperature` / `top_p`.

---

## Recommendation for This Repo

**Keep the existing proxy setup as the validated, primary path** for Kimi (Pay-as-You-Go, K2.6, K2.7 Code).

**Add the extension as a documented alternative** for users on the Kimi Coding tier. Suggested places:

1. **[README.md](../../README.md)** — add a row next to Kimi in the "Pick a model" table pointing to the Marketplace, mirroring how DeepSeek is currently documented.
2. **[docs/models/kimi.md](../models/kimi.md)** — add a short "Alternative: `kimi-lm-copilot-provider` extension" subsection near the top, summarising:
   - **What it is:** a one-click VSIX extension for the Kimi Coding tier.
   - **When to prefer it:** only if you are on the Kimi Coding subscription (not Pay-as-You-Go) and want to skip the proxy.
   - **When to stay on the proxy:** Pay-as-You-Go, K2.6 / K2.7 Code with the validated `maxOutputTokens` 4 K cap, or you need the transparent logs.
3. **[docs/free.md](../free.md)** — if relevant, note that the extension sits on a different (paid) tier.

**Do not** migrate this repo's setup to the extension. The two target different SKUs and different model IDs; switching would lose our K2.6 / K2.7 Code validation coverage.

---

## References

- **Extension repo:** <https://github.com/zelosleone/kimi-lm-copilot-provider>
- **Marketplace:** <https://marketplace.visualstudio.com/items?itemName=DenizhanDaklr.kimi-lm-provider>
- **Open issue:** <https://github.com/zelosleone/kimi-lm-copilot-provider/issues/5>
- **Source files referenced:**
  - [package.json](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/package.json)
  - [extension.ts](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/extension.ts)
  - [provider.ts](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/provider.ts)
  - [api.ts](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/api.ts)
  - [models.ts](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/models.ts)
  - [config.ts](https://raw.githubusercontent.com/zelosleone/kimi-lm-copilot-provider/main/src/config.ts)
- **Related in-repo docs:**
  - [docs/models/kimi.md](../models/kimi.md) — full Pay-as-You-Go validation record
  - [proxy/kimi-proxy.mjs](../../proxy/kimi-proxy.mjs) — the rewrite logic compared above
  - [lib/create-proxy.mjs](../../lib/create-proxy.mjs) — shared proxy scaffold
