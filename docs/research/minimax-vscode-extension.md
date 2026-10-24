# MiniMax: Custom Endpoint vs VS Code Extensions Comparison

> **Date:** 2026-10-24 (updated for tugudush/minimax-copilot v0.2.0)  
> **Original:** 2026-07-01 (klarkxy/minimax-vscode analysis); tugudush review added 2026-07-02
>
> **Extensions evaluated:**
>
> - [klarkxy/minimax-vscode](https://github.com/klarkxy/minimax-vscode) (v2.5.3, MIT) — **Token Plan subscription** focused. Marketplace: [`klarkxy.minimax-vscode-copilot`](https://marketplace.visualstudio.com/items?itemName=klarkxy.minimax-vscode-copilot).
> - [tugudush/minimax-copilot](https://github.com/tugudush/minimax-copilot) (v0.2.0, MIT, 2026-10-24) — **Pay-as-You-Go** focused. M3.1 Flash / M3 / M3 Priority native provider with tunable M3.1 Flash thinking depth. Distributed via `.vsix` (build from source); Marketplace publishing is currently blocked by the `languageModelThinkingPart` proposed API.
> - **Previously evaluated:** [zelosleone/minimax-vscode](https://github.com/zelosleone/minimax-vscode) — **broken** due to bootstrapping deadlock (see [Appendix A](#appendix-a-zelosleone-version--bootstrapping-deadlock))

## Overview

We currently use MiniMax-M3 via VS Code's built-in **custom endpoint** mechanism (`chatLanguageModels.json`), targeting the OpenAI-compatible `https://api.minimax.io/v1/chat/completions` endpoint.

Two third-party extensions exist that target MiniMax's **Anthropic-compatible** endpoint (`https://api.minimax.io/anthropic`) instead:

- **klarkxy/minimax-vscode** ("MiniMax Copilot") is a mature, actively maintained native `LanguageModelChatProvider` with a rich feature set (usage dashboard, status-bar quota, Claude Code ingest, MCP web search). It is **Token Plan-only** — PAYG Open Platform API Keys return 404 against the Anthropic endpoint. See [Appendix B](#appendix-b-why-klarkxy-cannot-do-payg) for the technical reason.
- **tugudush/minimax-copilot** ("MiniMax Copilot PAYG") is a focused, PAYG-native extension built by the same author as this repo. Same Anthropic-compatible API surface, but designed around a single PAYG API key, adaptive thinking (always-on with tunable depth on M3.1 Flash), collapsible reasoning blocks, and a four-step walkthrough. v0.2.0 (2026-10-24) adds **MiniMax M3.1 Flash**, per-model output caps, and `minimax.thinkingEffort`; M2.7/M2.7 Highspeed were dropped. Feature-set is deliberately smaller than klarkxy (no dashboard, no quota bar) in exchange for PAYG support and a much smaller, more focused codebase.

Both extensions are functionally different products from the zelosleone fork — different API surface, different features, and critically, **no bootstrapping deadlock** in either of them.

## Quick Comparison

| Aspect                        | Custom Endpoint (current)                                          | `klarkxy/minimax-vscode` Extension                                                                                                                                    | `tugudush/minimax-copilot` Extension                                                                                                                                                                                                              |
| ----------------------------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API protocol**              | OpenAI-compatible (`/v1/chat/completions`)                         | Anthropic-compatible (`/anthropic`)                                                                                                                                   | Anthropic-compatible (`/anthropic`)                                                                                                                                                                                                               |
| **Billing mode**              | PAYG **or** Token Plan (same config)                               | **Token Plan only** — PAYG keys return 404                                                                                                                            | **PAYG-native** — Open Platform API Key works; Token Plan also accepted                                                                                                                                                                           |
| **Integration**               | `chatLanguageModels.json` — generic custom endpoint                | Native `LanguageModelChatProvider` — first-class VS Code LM integration                                                                                               | Native `LanguageModelChatProvider` — first-class VS Code LM integration                                                                                                                                                                           |
| **Models**                    | 1: `MiniMax-M3` (manually configured)                              | 4 default: M3, M3-Priority, M2.7, M2.7‑highspeed (+6 legacy via manual override)                                                                                      | 3: `MiniMax-M3.1-Flash`, `minimax-m3`, `minimax-m3-priority` (M2.x dropped in 0.2.0; no override path)                                                                                                                                            |
| **Thinking handling**         | `reasoning_split: true` — `reasoning_details` discarded by VS Code | Binary `disabled`/`adaptive` toggle in model picker dropdown; thinking blocks via `LanguageModelThinkingPart` (proposal enabled) or `[thinking]…[/thinking]` fallback | `minimax.thinking` boolean (default `true`) for M3; M3.1 Flash always thinks (API rejects `disabled`) and tunes depth via `minimax.thinkingEffort` → `output_config.effort`; thinking deltas dropped when `languageModelThinkingPart` is inactive |
| **API key**                   | `${input:chat.lm.secret.<id>}` via "Chat: Manage Language Models"  | VS Code Secret Storage + named **KeyManager pool**; `MiniMax: Add API Key` / `MiniMax: Manage API Keys` / auto-detect region                                          | VS Code Secret Storage (single key); `MiniMax: Set API Key` / `MiniMax: Clear API Key`                                                                                                                                                            |
| **Shows models without key?** | ✅ Yes (custom endpoint always shows)                              | ✅ **Yes** — `provideLanguageModelChatInformation` does NOT gate on key presence; returns models regardless                                                           | ✅ **Yes** — returns models unconditionally; tooltip says "Set API Key" when missing                                                                                                                                                              |
| **Configuration**             | Manual JSON editing (`chatLanguageModels.json`)                    | Settings UI: `minimax.apiBaseUrl`, `minimax.visibleModels`, `minimax.maxOutputTokens`, `minimax.enableM31MContext`, per-model sampling, debug modes                   | Settings UI: `minimax.apiBaseUrl`, `minimax.thinking`, `minimax.thinkingEffort`, `minimax.visibleModels`, `minimax.maxOutputTokens`, `minimax.debugMode`                                                                                          |
| **Region switching**          | Manually edit `url` in JSON                                        | Commands: `MiniMax: Switch to Global API` / `MiniMax: Switch to Chinese API`; auto-detect on first activation                                                         | Commands: `MiniMax: Switch to Global API` / `MiniMax: Switch to Chinese API`; auto-detect from `vscode.env.language`                                                                                                                              |
| **Thinking toggle**           | Not available (static `requestBody`)                               | Per-model `configurationSchema` dropdown in picker — binary `disabled`/`adaptive` on M3                                                                               | Global `minimax.thinking` boolean for M3 only; `MiniMax: Set Thinking Effort` (`low`–`max`) drives M3.1 Flash depth                                                                                                                               |
| **Usage dashboard**           | None                                                               | Rich webview: today / 7-day / 30-day cards, 30-day bar chart, per-model breakdown, Token Plan quota (5h + weekly), Claude Code JSONL ingest                           | None                                                                                                                                                                                                                                              |
| **Status bar**                | None                                                               | Live Token Plan quota bar (5h % / weekly %)                                                                                                                           | None                                                                                                                                                                                                                                              |
| **M3 1M context**             | Not available (static 512K in model def)                           | `MiniMax: Toggle M3 1M Context` command with billing warning modal                                                                                                    | Always 1M (1,048,576) on M3 and M3.1 Flash — no toggle                                                                                                                                                                                            |
| **Web Search MCP**            | None (manual MCP config needed)                                    | Auto-registers `minimax-web-search` MCP server definition provider for Agent Mode                                                                                     | None                                                                                                                                                                                                                                              |
| **mmx-cli detection**         | None                                                               | Dashboard shows CLI/auth/SKILL status; one-click copy install prompt                                                                                                  | None                                                                                                                                                                                                                                              |
| **Walkthrough**               | None                                                               | None                                                                                                                                                                  | Four-step walkthrough on first install (Welcome → Set API Key → Choose Region → Adaptive Thinking; copy updated for M3.1 Flash)                                                                                                                   |
| **Error handling**            | Generic (HTTP status + raw body)                                   | MiniMax-specific error codes (1000/1002/1004/1008/1024/1026/1027/1033/1039/1041/1042) with i18n messages (en/zh-cn); action buttons (Set API Key, Show Logs)          | HTTP-status toasts (401/402/403/429/5xx) with i18n (en/zh) and a "Top Up" deep-link action on 402; no MiniMax-specific error-code mapping                                                                                                         |
| **Per-model sampling**        | Static `temperature`/`top_p` in `requestBody`                      | Dynamic: `minimax.sampling` overrides per model + respects VS Code `modelOptions`                                                                                     | Static (defaults in `src/consts.ts`); no per-model sampling override                                                                                                                                                                              |
| **Debug/diagnostics**         | None                                                               | `minimax.debugMode` (`minimal`/`metadata`/`verbose`); per-request classifier; cache-hit stats; request dumps to disk                                                  | `minimax.debugMode` (`minimal`/`metadata`/`verbose`); verbose mode dumps full request bodies to `os.tmpdir()`                                                                                                                                     |
| **Commit messages**           | N/A                                                                | Route Copilot's Source Control ✨ commit button through MiniMax via `chat.utilitySmallModel`                                                                          | N/A                                                                                                                                                                                                                                               |
| **Vision**                    | ✅ M3 (image + video, via `vision: true`)                          | ✅ M3 (image + **native video** `type: "video"` parts, 64 MB cap)                                                                                                     | ✅ M3.1 Flash and M3 (images); video still not implemented in 0.2.0 (`convert.ts` drops `video/*`)                                                                                                                                                |
| **Video input**               | ❌ Not exposed                                                     | ✅ M3 native video (`type: "video"` Anthropic content block)                                                                                                          | ❌ Not exposed in 0.2.0 — M3.1 Flash advertises video input, but `convert.ts` maps only `image/*` data parts                                                                                                                                      |
| **i18n**                      | N/A                                                                | Full en/zh-cn (README, commands, settings, dashboard, error messages)                                                                                                 | UI strings en/zh (`src/i18n.ts`); README and walkthrough English-only in 0.2.0; model display names now resolved lazily so the picker respects the locale                                                                                         |
| **Dependencies**              | None (VS Code built-in)                                            | Requires installing the extension; bundles Anthropic SDK                                                                                                              | Requires installing the `.vsix`; bundles Anthropic SDK                                                                                                                                                                                            |
| **VS Code requirement**       | Any with Copilot Chat                                              | 1.111.0+; proposal-enabled build (Insiders + `enable-proposed-api`) for native thinking blocks                                                                        | 1.111.0+; native thinking blocks require `languageModelThinkingPart` — add the extension ID to `enable-proposed-api` in `argv.json` (Insiders alone is not enough)                                                                                |
| **Maintenance**               | We own the config                                                  | Active — v2.5.3 (2026-07-01), rigorous changelog, marketplace distribution                                                                                            | v0.2.0 (2026-10-24) — active; `.vsix` distribution; Marketplace publishing blocked by the `languageModelThinkingPart` proposed API                                                                                                                |
| **License**                   | N/A (our config)                                                   | MIT                                                                                                                                                                   | MIT                                                                                                                                                                                                                                               |

## Architecture Deep Dive

### Current Setup: Custom Endpoint (OpenAI-compatible)

```
VS Code Copilot Chat
  → chatLanguageModels.json (static config)
    → Direct HTTPS to api.minimax.io/v1/chat/completions
```

- VS Code handles all message construction, tool-call lifecycle, and streaming.
- `requestBody` is merged statically into every request — no dynamic adjustment.
- Reasoning content (`reasoning_details`) arrives in the SSE stream but VS Code ignores the field.
- OpenAI-compatible protocol: `tools[]`, `tool_choice`, `stream: true`, `reasoning_split` via `extra_body`.

### Extension: Native LM Provider (Anthropic-compatible)

```
VS Code Copilot Chat
  → vscode.lm.registerLanguageModelChatProvider("minimax", provider)
    → MiniMaxChatProvider.provideLanguageModelChatResponse()
      → Anthropic-compatible request to api.minimax.io/anthropic
```

- Uses the **Anthropic Messages API** surface (not OpenAI chat completions).
- Thinking is controlled via the Anthropic `thinking` block (`disabled` / `adaptive` binary toggle).
- `provideLanguageModelChatInformation` returns models **regardless of API key presence** — the `hasKey` flag affects tooltip display only, not visibility.
- API key management uses a **named key pool** (`KeyManager`): multiple keys with names, auto-detect China/Global region, active-key switching.
- Extension activation: `setCommandContext` → `registerCommands` → `setClaudeCodeIngest` → `registerActionUrls` → MCP provider → endpoint auto-select → `registerProvider` → welcome walkthrough.
- Message conversion handles Anthropic content blocks: `text`, `image`, `video` (M3 only), `tool_use`, `tool_result`.

### PAYG-native Extension: `tugudush/minimax-copilot` (Anthropic-compatible)

```
VS Code Copilot Chat
  → vscode.lm.registerLanguageModelChatProvider("minimax", provider)
    → MiniMaxChatProvider.provideLanguageModelChatResponse()
      → Anthropic-compatible request to api.minimax.io/anthropic
        (PAYG Open Platform API Key in x-api-key header)
```

- Same **Anthropic Messages API** surface as klarkxy — uses `@anthropic-ai/sdk@^0.39.0` directly.
- Thinking: M3.1 Flash **always** sends `thinking: { type: "adaptive" }` (the API rejects `disabled` with a 400) and tunes depth via `output_config.effort` from `minimax.thinkingEffort` (`low`/`medium`/`high`/`xhigh`/`max`, default `max`; `none` is rejected upstream). M3 sends the field only when `minimax.thinking` is on (default `true`); when off the field is **omitted entirely** (never `disabled` — same caveat as our custom-endpoint docs: MiniMax's model reasons either way; the setting only changes response layout). The request builder gates on registry metadata (`thinkingAlwaysOn` / `thinking` / `effortTunable`) instead of string-matching model IDs.
- `provideLanguageModelChatInformation` returns all 3 models unconditionally; tooltip flips between `PAYG • <pricing>` and a "no API key set" string.
- API key management is intentionally minimal: a single PAYG API key in `context.secrets` under `minimax-paygo.apiKey`. No key pool, no per-key region, no naming.
- Region switching: `resolveBaseUrl()` checks `minimax.apiBaseUrl` first, then falls back to `vscode.env.language.startsWith('zh') ? api.minimaxi.com : api.minimax.io`. The two `Switch to Global/Chinese API` commands just write the URL into settings.
- Error handling is HTTP-status based (401/402/403/429/5xx) with a `Top Up` deep-link action on 402 pointing to `platform.minimax.io/user-center/basic-information/account-manage` (or `minimaxi.com` for China). No per-error-code i18n dictionary for MiniMax's specific 1000–1042 codes — just the canonical HTTP statuses.
- Extension activation (`src/activate.ts`): `initI18n()` → `logger.info()` → eagerly activate `github.copilot-chat` → construct `MiniMaxChatProvider(context)` → `vscode.lm.registerLanguageModelChatProvider('minimax', provider)` → `registerCommands()`. Notably **no** MCP, dashboard, Claude Code, mmx-cli, or chat-turn-notifier subsystems — those are out of scope.
- Message conversion (`src/client/convert.ts`) handles `LanguageModelTextPart`, `LanguageModelThinkingPart` (via `runtime/thinkingPartGuard.ts` runtime check), `LanguageModelToolCallPart`, `LanguageModelToolResultPart`, `LanguageModelDataPart`, `LanguageModelPromptTsxPart`, and the synthetic `cache_control` data part that Copilot Chat injects as a prompt-cache breakpoint hint. Role mapping uses `ROLE_SYSTEM = 0`, `ROLE_USER = 1`, `ROLE_ASSISTANT = 2`. Attached images arrive as `LanguageModelDataPart` with an `image/*` mime and are emitted as Anthropic `image` blocks; `video/*` and audio data parts have no `.value` and are dropped — M3.1 Flash advertises video input, but the extension does not forward it.
- Test coverage: 33 unit tests across `test/convert.test.ts` (20 — conversion, thinking-block replay with signatures, vision/image input, and the four-stack loop-repeat fixes) and `test/registry.test.ts` (13 — model metadata and pricing). No live integration tests against the MiniMax API.
- The README explicitly credits `klarkxy/minimax-vscode` as inspiration; "no source code is copied" — it is a clean, focused reimplementation.

## Thinking/Reasoning: The Key Differentiator

### Current behavior (OpenAI-compatible custom endpoint)

We set `reasoning_split: true` so the server separates reasoning into `reasoning_details`. VS Code's generic custom-endpoint handler **does not recognize** `reasoning_details`. Reasoning is silently discarded.

**Net result: MiniMax reasoning is invisible to the user.**

### Extension behavior (Anthropic-compatible)

The Anthropic-compatible endpoint surfaces thinking through Anthropic's `thinking` block semantics:

| Scenario                 | Proposal active (`enable-proposed-api`)         | Proposal unavailable (default install) |
| ------------------------ | ----------------------------------------------- | -------------------------------------- |
| Thinking `enabled` (M3)  | Reasoning as native `LanguageModelThinkingPart` | Thinking deltas dropped silently       |
| Thinking `disabled` (M3) | No thinking block emitted                       | No thinking block emitted              |

- **klarkxy** surfaces a per-model `configurationSchema` dropdown in the picker (binary `disabled`/`adaptive`), the same UX pattern `deepseek-v4-for-copilot` uses for `reasoningEffort`; the choice rides on `options.modelConfiguration.thinkingEnabled`. On stable VS Code without the proposal, klarkxy falls back to `[thinking]…[/thinking]` text markers.
- **tugudush** exposes a global `minimax.thinking` boolean for M3 and a global `minimax.thinkingEffort` (`low`–`max`) for M3.1 Flash, sent upstream as `output_config.effort`. M3.1 Flash always thinks; `disabled`/`none` is rejected with a 400, so there is nothing to toggle there. Without the proposal, thinking deltas are dropped (no text-marker fallback).

On the Anthropic surface, MiniMax exposes reasoning depth only for M3.1 Flash (`output_config.effort`); M3 has no `budget_tokens`, `reasoning_effort`, or `reasoning_split` knob. The 0.2.0 README says reasoning arrives as inline text when the proposal is unavailable, but `src/client/client.ts` drops `thinking_delta` events in that case — the reasoning block (and any reasoning text) is lost while chat itself keeps working.

**Net result: reasoning is visible only when the proposed API is enabled, and both extensions make the setting user-controllable without editing JSON.**

### Verdict

The extensions' thinking handling is **substantially better** than the custom endpoint, which discards reasoning entirely. klarkxy surfaces reasoning even without the proposal via text markers; tugudush requires the proposed API but adds the M3.1 Flash effort knob that no other MiniMax path exposes.

## Model Support

| Model                                      | Custom Endpoint | klarkxy Extension (default) | klarkxy Extension (via override)      | tugudush Extension  |
| ------------------------------------------ | --------------- | --------------------------- | ------------------------------------- | ------------------- |
| `MiniMax-M3.1-Flash` (image, 1M ctx)       | ✅ Configurable | —                           | —                                     | ✅                  |
| `MiniMax-M3` (vision + video, 512K/1M ctx) | ✅ Configured   | ✅                          | —                                     | ✅                  |
| `MiniMax-M3-Priority`                      | ❌              | ✅                          | —                                     | ✅                  |
| `MiniMax-M2.7`                             | ❌              | ✅                          | —                                     | ❌ (removed)        |
| `MiniMax-M2.7-highspeed`                   | ❌              | ✅                          | —                                     | ❌ (removed)        |
| `MiniMax-M2.5`                             | ❌              | —                           | ✅ (`minimax.visibleModels` override) | ❌ (not registered) |
| `MiniMax-M2.5-highspeed`                   | ❌              | —                           | ✅                                    | ❌                  |
| `MiniMax-M2.1`                             | ❌              | —                           | ✅                                    | ❌                  |
| `MiniMax-M2.1-highspeed`                   | ❌              | —                           | ✅                                    | ❌                  |
| `MiniMax-M2`                               | ❌              | —                           | ✅                                    | ❌                  |

klarkxy v2.5.3 ships 4 default models (M3, M3-Priority, M2.7, M2.7‑HS) and still registers the legacy M2.5/M2.1/M2 line (hidden); tugudush v0.2.0 ships **3** — M3.1 Flash, M3, and M3-Priority — and dropped M2.x entirely. The 0.2.0 changelog states MiniMax retired the M2.5/M2.7 families (it cites 2026-11-18) and that the Anthropic-compatible endpoint now serves only M3.1 Flash and M3, so klarkxy's legacy rows target retired models. M3.1 Flash is also available through the custom endpoint (model ID `MiniMax-M3.1-Flash`).

M3-Priority is a separate picker entry on both extensions for the higher-priority M3 tier (same model, different API quota pool). tugudush hard-codes the mapping in `src/models/registry.ts`: the picker entry sends the API model ID `minimax-m3-priority`, and `tier: 'priority'` only drives the 1.5× PAYG rate shown in the tooltip — **no `service_tier` field is sent** (priority is inferred from the model ID server-side).

## Configuration & DX

### Current approach

- Edit `%APPDATA%\Code\User\chatLanguageModels.json` by hand.
- API key managed via **Chat: Manage Language Models** command palette flow.
- Changing region requires editing the `url` field in JSON and restarting.
- Changing sampling parameters requires editing `requestBody` in JSON.
- Adding a model means copying the full model block.

### klarkxy Extension approach

- Install from marketplace; run `MiniMax: Add API Key` → name it → paste key. Extension auto-detects China vs Global region.
- **KeyManager pool**: add multiple named keys, switch active key, rename, delete — all via `MiniMax: Manage API Keys` sub-menu.
- **Settings UI** for all configuration (`minimax.*` namespace):
  - `minimax.apiBaseUrl` — Anthropic-compatible base URL (auto-picked on first activation)
  - `minimax.visibleModels` — restrict picker models
  - `minimax.maxOutputTokens` — output cap (0 = model decides)
  - `minimax.enableM31MContext` — M3 1M context toggle
  - `minimax.sampling` — per-model `temperature`/`topP`/`topK`/`frequencyPenalty`
  - `minimax.debugMode` — `minimal`/`metadata`/`verbose`
  - `minimax.modelIdOverrides` — picker ID → API ID mapping (proxy scenarios)
  - `minimax.dashboard.includeClaudeCode` — Claude Code JSONL ingest toggle
  - `minimax.claudeCode.logPath` / `pollIntervalMs` / `allowedModels`
- API key stored in VS Code Secret Storage (OS-level credential store).
- Endpoint auto-selection on first activation based on VS Code display language.

### tugudush Extension approach

- Build `.vsix` from source (`git clone` → `npm install` → `npm run package`, producing `minimax-copilot-0.2.0.vsix`) and **Install from VSIX**. Marketplace publishing is blocked by the `languageModelThinkingPart` proposed API — see [docs/publishing.md](https://github.com/tugudush/minimax-copilot/blob/main/docs/publishing.md).
- Run `MiniMax: Set API Key` → paste key → Enter. Stored in VS Code Secret Storage under `minimax-paygo.apiKey`.
- **Settings UI** for the 6 configuration knobs (`minimax.*` namespace):
  - `minimax.apiBaseUrl` — Anthropic-compatible base URL (overrides locale auto-detect)
  - `minimax.thinking` — global boolean for M3 (default `true`); no effect on M3.1 Flash, which always thinks
  - `minimax.thinkingEffort` — M3.1 Flash depth: `low` / `medium` / `high` / `xhigh` / `max` (default `max`), sent as `output_config.effort`
  - `minimax.visibleModels` — restrict picker models
  - `minimax.maxOutputTokens` — output cap; `0` uses the per-model default (M3.1 Flash 32,768; M3/Priority 8,192)
  - `minimax.debugMode` — `minimal` / `metadata` / `verbose` (verbose dumps request bodies to `os.tmpdir()`)
- **Commands** (7): Set/Clear API Key, Switch to Global/Chinese API, Toggle Thinking, **Set Thinking Effort**, Show Logs.
- **Walkthrough** auto-opens on first install with four steps (Welcome → Set API Key → Choose Region → Adaptive Thinking), updated for M3.1 Flash and its thinking-effort setup; each step declares a `completionEvents` hook so it advances when the corresponding command runs.
- API key stored in VS Code Secret Storage (OS-level credential store).
- Endpoint auto-selection based on `vscode.env.language` (zh\* → China, else Global); switchable via command and persisted to `minimax.apiBaseUrl`.

### Verdict

Both extensions offer **dramatically better DX** than the hand-edited JSON approach — no JSON editing, settings UI, region auto-detection, one-click switching, and secure credential storage. The klarkxy extension wins on feature breadth (token pool, sampling overrides, dashboard); the tugudush extension wins on simplicity (single key, single global thinking toggle, walkthrough) and PAYG-native focus.

## Features Exclusive to the Extensions

### klarkxy Extension

| Feature                          | Description                                                                                                                                        |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Usage Dashboard**              | Webview with today/7-day/30-day token cards, 30-day bar chart, per-model breakdown; tab bar for `总 / copilot / claude / codex / opencode` sources |
| **Status Bar**                   | Live Token Plan quota display (5h % + weekly %), clickable to open dashboard                                                                       |
| **Token Plan API**               | Polls `coding_plan/remains` endpoint; shows quota resets, subscription expiry                                                                      |
| **Claude Code JSONL Ingest**     | Background poller reads `~/.claude/projects/**/*.jsonl`; UUID-based dedup; independent of Copilot Chat usage                                       |
| **MiniMax Web Search MCP**       | Registers `minimax-web-search` MCP server; auto-injects API key + host as env; usable from Agent Mode                                              |
| **mmx-cli Status**               | Detects official CLI/auth/SKILL installation; copy install prompt to clipboard                                                                     |
| **Commit Message Integration**   | Route Source Control ✨ button through MiniMax via `chat.utilitySmallModel`                                                                        |
| **M3 1M Context Toggle**         | Command with billing warning modal; picker immediately reflects 1M vs 512K                                                                         |
| **M3 Native Video**              | `type: "video"` Anthropic content blocks; MP4/AVI/MOV/MKV; 64 MB request body cap                                                                  |
| **Preflight Tool Stabilization** | Synthesizes `activate_*` preflight tool calls to keep upstream prompt cache warm (experimental)                                                    |
| **Per-Request Diagnostics**      | Classifier tags every request; cache-hit stats; verbose mode dumps full requests to disk                                                           |

### tugudush Extension

| Feature                                          | Description                                                                                                                                                                                                            |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MiniMax M3.1 Flash support**                   | First-class picker entry with 1M context, always-on thinking, images, and the lowest PAYG rate in the extension (**$0.15 / $0.60 / $0.015** per M tokens)                                                              |
| **Tunable thinking depth**                       | `minimax.thinkingEffort` (`low`–`max`) + `MiniMax: Set Thinking Effort`; sent as `output_config.effort` (M3.1 Flash only)                                                                                              |
| **Per-model output caps**                        | `max_tokens` defaults to 32,768 (M3.1 Flash) or 8,192 (M3/Priority) instead of a flat 4,096; `minimax.maxOutputTokens` still overrides                                                                                 |
| **First-install Walkthrough**                    | Four-step walkthrough (Welcome → Set API Key → Choose Region → Adaptive Thinking) with command-completion hooks; auto-opens on first activation                                                                        |
| **Bilingual UI strings (en + zh)**               | In-extension user-visible strings localised from `vscode.env.language`; README English-only in 0.2.0; model display names resolve lazily so the picker follows the locale (0.2.0 fix)                                  |
| **Region auto-detect from VS Code language**     | `vscode.env.language.startsWith('zh') ? China : Global`; explicit commands override and persist                                                                                                                        |
| **Synthetic `cache_control` data-part handling** | `extractPartText` recognises `mimeType: 'cache_control'` `DataPart` from Copilot Chat as a prompt-cache breakpoint hint and drops it silently, preventing literal `[binary cache_control]` from polluting tool results |
| **Loop-repeat fixes for `convert.ts`**           | Four stacked bugfixes for the "model re-proposes an answered tool" failure mode (see CHANGELOG and `docs/bugs/loop-repeat/findings-and-plan.md`)                                                                       |
| **Single-key PAYG focus**                        | No key pool, no Token Plan plumbing — one PAYG key and one region, kept simple by design                                                                                                                               |
| **Verbose-mode request dumps**                   | `minimax.debugMode: verbose` writes full Anthropic request bodies to `os.tmpdir() / minimax-request-*.json` for debugging                                                                                              |

## Error Handling

### Current

Generic HTTP status + raw JSON body. No actionable guidance.

### klarkxy Extension

MiniMax-specific error codes mapped to i18n messages (en/zh-cn), plus embedded action buttons:

| Code      | Message                        |
| --------- | ------------------------------ |
| 1000      | Unknown error                  |
| 1001      | Request timed out              |
| 1002      | Rate limit exceeded            |
| 1004      | Invalid API key / unauthorized |
| 1008      | Insufficient balance           |
| 1024      | Internal server error          |
| 1026/1027 | Content safety flag            |
| 1033      | Internal system error          |
| 1039      | Token limit exceeded           |
| 1041      | Connection limit reached       |
| 1042      | Excessive invisible characters |

Error toasts include deep-link action buttons (`minimax:///setApiKey`, `minimax:///showLogs`) that dispatch the corresponding commands.

### tugudush Extension

Canonical HTTP-status toasts (i18n en/zh) with one deep-link action (402 → `Top Up` button that opens `platform.{minimax.io,minimaxi.com}/user-center/basic-information/account-manage` based on the active region):

| Status      | Behaviour                                              |
| ----------- | ------------------------------------------------------ |
| `401`/`403` | Error toast: "Invalid API key / unauthorized"          |
| `402`       | Error toast with `Top Up` action button → billing page |
| `429`       | Warning toast: rate-limited                            |
| `5xx`       | Error toast: server error                              |
| Network     | Error toast: connection / timeout                      |

There is **no** MiniMax-specific error-code (1000–1042) mapping in v0.2.0 — the extension surfaces the HTTP status it sees from the Anthropic SDK. If MiniMax returns a non-2xx with body `{"code": 1004, ...}`, the user sees the generic "MiniMax API error (401)" string rather than the dedicated "Invalid API key" message. The extension never sends `thinking: { type: "disabled" }` (M3 omits the field when off; M3.1 Flash always sends `adaptive`), so MiniMax's HTTP 400 for a disabled thinking block or `output_config.effort: "none"` is unreachable through the current UI.

## API Protocol: OpenAI vs Anthropic

This is a fundamental architectural difference between our setup and the extensions:

|                      | Custom Endpoint                                           | klarkxy Extension                                                                   | tugudush Extension                                                                                                      |
| -------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Endpoint**         | `api.minimax.io/v1/chat/completions`                      | `api.minimax.io/anthropic`                                                          | `api.minimax.io/anthropic`                                                                                              |
| **Protocol**         | OpenAI chat completions                                   | Anthropic Messages                                                                  | Anthropic Messages                                                                                                      |
| **SDK**              | VS Code built-in                                          | Bundles `@anthropic-ai/sdk`                                                         | Bundles `@anthropic-ai/sdk@^0.39.0`                                                                                     |
| **Thinking field**   | `reasoning_split: true` + `reasoning_details` in response | Anthropic `thinking` block (`disabled`/`adaptive`)                                  | Anthropic `thinking: { type: "adaptive" }` (M3 toggle; always on M3.1 Flash) + `output_config.effort` (M3.1 Flash only) |
| **Tool definitions** | OpenAI `tools[]` / `tool_choice`                          | Anthropic `tools[]`                                                                 | Anthropic `tools[]`                                                                                                     |
| **Content blocks**   | OpenAI `content` string                                   | Anthropic content block array (`text`, `image`, `video`, `tool_use`, `tool_result`) | Anthropic content block array (`text`, `thinking`, `image`, `tool_use`, `tool_result`); `video/*` data parts dropped    |
| **Streaming**        | SSE (`data: {...}`)                                       | SSE (Anthropic event types)                                                         | SSE (Anthropic event types via `@anthropic-ai/sdk`)                                                                     |
| **System prompt**    | `messages[0].role: "system"`                              | `system` top-level field                                                            | `system` top-level field                                                                                                |
| **Stop reasons**     | `finish_reason`                                           | `stop_reason`                                                                       | `stop_reason`                                                                                                           |

Our custom endpoint docs target the OpenAI-compatible surface. Both extensions target the Anthropic-compatible surface. The model sets differ (custom endpoint: M3, with M3.1 Flash configurable; klarkxy: M3/M3-Priority/M2.7/M2.7-HS plus hidden M2.x; tugudush: M3.1 Flash/M3/M3-Priority). The Anthropic surface has better thinking ergonomics (native `thinking` block vs `reasoning_split` extra_body hack) and exposes M3.1 Flash's depth as `output_config.effort` — the OpenAI-compatible surface uses `reasoning_effort` for the same knob.

## Limitations

### Custom Endpoint Limitations

1. **Reasoning is invisible.** `reasoning_details` discarded by VS Code.
2. **Static configuration.** Temperature, top_p, max_tokens fixed in `requestBody`.
3. **Manual multi-model setup.** Each model variant requires separate JSON block.
4. **No region-switching convenience.** URL must be edited manually.
5. **Generic errors.** No MiniMax-specific guidance.
6. **No usage tracking, dashboard, or quota visibility.**
7. **No MCP integration** (must configure manually).
8. **OpenAI-compatible only** — can't leverage Anthropic-native thinking blocks.

### klarkxy Extension Limitations

1. **Third-party dependency.** Maintenance depends on extension author (though active: v2.5.3 as of today).
2. **Native thinking blocks need the proposed API enabled.** Without it, klarkxy shows `[thinking]…[/thinking]` text markers.
3. **Anthropic-compatible only.** Cannot use the OpenAI-compatible endpoint (different protocol entirely).
4. **Token counting is character-based** (not actual tokenization).
5. **M3 1M context requires explicit opt-in** with billing warning (prudent, but adds a step).
6. **M2.5/M2.1/M2 hidden by default** — power users must manually override `minimax.visibleModels`.
7. **Token Plan-only.** The Anthropic-compatible endpoint requires a Token Plan subscription key (`sk-cp-…`). PAYG Open Platform API Keys return **HTTP 404**. See [Appendix B](#appendix-b-why-klarkxy-cannot-do-payg) for the technical reason and [Appendix C](#appendix-c-why-tugudush-can-do-payg) for why tugudush closes that gap.
8. **Bundles Anthropic SDK** — adds extension footprint (~1 MB, minor).

### tugudush Extension Limitations

1. **Young extension with a single known-loop postmortem.** v0.2.0 (2026-10-24) is the second release; the v0.1.0 "loop-repeat" bug (Copilot re-proposing an answered tool) was fixed with four stacked changes and regression tests. Watch the [CHANGELOG](https://github.com/tugudush/minimax-copilot/blob/main/CHANGELOG.md) for regressions; the integration surface (Copilot Chat → Anthropic SDK → MiniMax) is larger than the custom-endpoint docs codebase, so ongoing verification is needed.
2. **Marketplace publishing is blocked.** The `languageModelThinkingPart` proposed API makes `vsce publish` fail ("Extensions using unallowed proposed API"); passing `--allow-proposed-apis` uploads, but VS Code strips the proposal at runtime for non-allowlisted extensions. `docs/publishing.md` documents the two paths (publish without the proposal, or obtain VS Code team approval). Distribution is `.vsix`-only.
3. **Anthropic-compatible only.** Same restriction as klarkxy.
4. **Token counting is character-based** (`Math.ceil(text.length / 3.5)`).
5. **M3 and M3.1 Flash are always 1M context.** There is **no** opt-out toggle (klarkxy has `minimax.enableM31MContext`). If a user wants the M3 512K behaviour, they must install klarkxy.
6. **No M2.x models at all.** v0.2.0 removed M2.7/M2.7 Highspeed along with M2.5/M2.1/M2, and there is no `visibleModels` override path (klarkxy still surfaces the retired models).
7. **No key pool.** A single PAYG API key in Secret Storage. Active-key switching and named keys (klarkxy's `KeyManager`) are not implemented.
8. **No per-model sampling overrides.** `temperature`, `top_p`, `top_k`, `frequency_penalty` are not surfaced as settings — they live as hard-coded constants.
9. **No feature parity with klarkxy's feature surface.** No usage dashboard, no status-bar quota, no Claude Code JSONL ingest, no `minimax-web-search` MCP server, no mmx-cli detection, no commit-message routing.
10. **Locale-based region auto-detection only.** `vscode.env.language.startsWith('zh')` → China; all other locales → Global. If a Chinese user sets VS Code to `en-US`, they get the wrong default until they run `MiniMax: Switch to Chinese API`.
11. **The proposed API must be enabled manually.** VS Code strips `languageModelThinkingPart` from every installed extension that is not on its built-in allowlist — Insiders alone is not enough. Add `minimax-copilot-paygo.minimax-copilot` to `enable-proposed-api` in `argv.json` (Preferences: Configure Runtime Arguments) or launch with `--enable-proposed-api=...`; without it, thinking deltas are dropped silently.
12. **Video input is not implemented.** M3.1 Flash advertises video input, but `src/client/convert.ts` maps only `image/*` data parts; `video/*` parts fall through and are dropped.
13. **One global thinking configuration.** No per-model overrides: one boolean for M3 and one effort level for M3.1 Flash, applied to every chat.

## Recommendation

### Decision matrix

| If you value…                                      | Choose…                                                                                   |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Token Plan subscription** (`sk-cp-…` key)        | **klarkxy extension** (made for this)                                                     |
| **PAYG billing** (Open Platform API Key)           | **tugudush extension** (PAYG-native) or **custom endpoint**                               |
| **Reasoning visibility**                           | Either extension (decisive advantage over custom endpoint)                                |
| **Usage tracking & quota visibility**              | **klarkxy extension** (dashboard + status bar; tugudush has neither)                      |
| **Zero dependencies, full control**                | Custom endpoint                                                                           |
| **Multiple models + M3-Priority**                  | Either extension                                                                          |
| **Quick regional switching**                       | Either extension (same commands and locale auto-detect)                                   |
| **Agent Mode MCP (web search)**                    | **klarkxy extension** (auto-registered)                                                   |
| **Commit message integration**                     | **klarkxy extension**                                                                     |
| **Auditability / no third-party code**             | Custom endpoint                                                                           |
| **Native thinking UI (proposal enabled)**          | Either extension                                                                          |
| **Cheapest PAYG model (M3.1 Flash)**               | **tugudush extension** or custom endpoint                                                 |
| **Tunable reasoning depth**                        | **tugudush extension** (`output_config.effort` on M3.1 Flash)                             |
| **Simplicity / minimal moving parts**              | Custom endpoint or **tugudush extension** (smaller scope)                                 |
| **OpenAI-compatible protocol**                     | Custom endpoint (both extensions use Anthropic)                                           |
| **Marketplace distribution + auto-update**         | **klarkxy extension** (tugudush is `.vsix`-only; Marketplace blocked by the proposed API) |
| **M2.5/M2.1/M2 picker entries**                    | **klarkxy extension** (tugudush doesn't ship legacy models)                               |
| **Single PAYG key, walkthrough, no plan plumbing** | **tugudush extension**                                                                    |

### ⚠️ Critical: PAYG vs Token Plan

The MiniMax Anthropic-compatible endpoint accepts **both** PAYG Open Platform API Keys and Token Plan Subscription Keys. **Both extensions hit the same endpoint** (`api.minimax.io/anthropic`), but they differ in which key type they were **designed** for. The PAYG failure previously attributed to "the Anthropic endpoint" was actually specific to the klarkxy extension's setup — see [Appendix B](#appendix-b-why-klarkxy-cannot-do-payg).

| Key type               | Custom Endpoint (OpenAI) | klarkxy Extension (Anthropic) | tugudush Extension (Anthropic)   |
| ---------------------- | ------------------------ | ----------------------------- | -------------------------------- |
| Token Plan (`sk-cp-…`) | ✅                       | ✅                            | ✅ (works, though PAYG-targeted) |
| PAYG (Open Platform)   | ✅                       | ❌ (404 — see Appendix B)     | ✅ (designed for this)           |

### Bottom Line

Three valid paths exist for MiniMax-M3 in Copilot Chat:

| Path                         | Best for                                                                                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **klarkxy/minimax-vscode**   | Token Plan subscribers who want the full dashboard, quota bar, MCP web search, and legacy-model visibility. PAYG users cannot use it.                                    |
| **tugudush/minimax-copilot** | PAYG users who want a focused, Anthropic-native experience with M3.1 Flash, tunable thinking depth, a walkthrough, and minimal surface area. Token Plan keys also work.  |
| **Custom endpoint**          | Users who want zero dependencies, full visibility into the JSON, or work entirely off OpenAI-compatible tooling. PAYG- and Token Plan-eligible with no third-party code. |

For our use case (validating custom endpoints and documenting setups), we maintain all three paths in the docs: the klarkxy extension for Token Plan users who want the polished UX, the tugudush extension for PAYG users who want a focused UX, and the custom endpoint as the canonical API reference and the no-dependency baseline.

## Extension Codebase Notes

### `klarkxy/minimax-vscode` (v2.5.3)

Key architectural details:

- **Entry point:** `src/extension.ts` → `src/runtime/lifecycle.ts` — orchestrates activation order: command context → diagnostics → commands → Claude Code ingester → action URLs → MCP provider → endpoint auto-select → `registerProvider()` → chat-turn notifier → welcome walkthrough.
- **Provider:** `src/provider/index.ts` — `MiniMaxChatProvider` implements `LanguageModelChatProvider`; `provideLanguageModelChatInformation` returns models regardless of key state.
- **Key manager:** `src/keyManager.ts` — Named key pool with region auto-detection, active-key switching, fingerprinting; persisted via Secret Storage + Memento.
- **Auth:** `src/auth.ts` — Reads from Secret Storage; falls back to `minimax.apiKey` setting in CI only.
- **Client:** `src/client/` — Anthropic-compatible request/response layer; streaming SSE parser; error mapping with action URLs.
- **Models:** `src/provider/models.ts` + `src/models/registry.ts` — Model definitions with pricing tiers, context windows, thinking schema; `configurationSchema` for thinking toggle.
- **Dashboard:** `src/dashboard/` — Webview panel with tabbed layout (总/copilot/claude/codex/opencode); Token Plan quota aggregator; mmx-cli status detection; MCP provider status.
- **Claude Code ingest:** `src/dashboard/claudeCodeIngest.ts` — Background JSONL poller with UUID-based dedup, cursor persistence, per-model aggregation.
- **MCP:** `src/runtime/mcp.ts` — Registers `minimax-web-search` MCP server definition provider; injects API key + host from active key pool.
- **Tool flow:** `src/provider/tools/` — Preflight `activate_*` tool synthesis, tool-drift notices, request tool list preparation.
- **Config:** `src/config.ts` — Typed getters around `vscode.workspace.getConfiguration('minimax')`.
- **i18n:** `src/i18n.ts` — Zero-dep `t(key, ...args)` against hand-written en/zh-cn dictionary.
- **Build:** `esbuild` — bundles to `out/extension.js`, target Node 20, CJS.
- **Tests:** `node --test` runner; unit tests for provider, tool flow, MCP, key manager, config.

### `tugudush/minimax-copilot` (v0.2.0)

Key architectural details:

- **Entry point:** `src/activate.ts` — minimal activation: `initI18n()` → log version+locale → eagerly `activate('github.copilot-chat')` → construct `MiniMaxChatProvider` → `vscode.lm.registerLanguageModelChatProvider('minimax', provider)` → `registerCommands(context)`.
- **Provider:** `src/provider/index.ts` — `MiniMaxChatProvider` implements `LanguageModelChatProvider`; maintains a `thinkingSignatures` map (block id → signature) for replay across turns; subscribes to `onDidChangeApiKey` and `onDidChangeConfiguration` for picker refresh; `provideTokenCount` returns `Math.ceil(text.length / 3.5)` (character-based estimate).
- **Auth:** `src/auth.ts` — A single PAYG API key in `context.secrets` under `minimax-paygo.apiKey`; no `getExtensionSetting('minimax.apiKey')` CI fallback; event emitter fires on `set`/`clear`.
- **Endpoint:** `src/runtime/endpoint.ts` — `resolveBaseUrl()` reads `minimax.apiBaseUrl` setting first, then falls back to `vscode.env.language.startsWith('zh') ? HOST_CHINA : HOST_GLOBAL`. Constants `HOST_GLOBAL = 'https://api.minimax.io/anthropic'`, `HOST_CHINA = 'https://api.minimaxi.com/anthropic'` live in `src/consts.ts`.
- **Client:** `src/client/client.ts` — Wraps `@anthropic-ai/sdk@^0.39.0`; emits `LanguageModelTextPart`, `LanguageModelThinkingPart` (when proposal active — see guard), `LanguageModelToolCallPart`; tracks in-flight thinking and tool-use blocks across `content_block_start` / `content_block_delta` / `content_block_stop` events; captures thinking-block signatures from `content_block_stop`. Thinking selection comes from the registry: `thinkingAlwaysOn` models always send `thinking: { type: "adaptive" }`, M3 sends it only when `minimax.thinking` is on, and `effortTunable` models add `output_config: { effort }` from `minimax.thinkingEffort`.
- **Convert:** `src/client/convert.ts` — VS Code → Anthropic message converter. Handles `LanguageModelTextPart`, `LanguageModelThinkingPart` (with signature replay), `LanguageModelToolCallPart`, `LanguageModelToolResultPart` (including wrapped, `DataPart`, `PromptTsxPart` variants), synthetic `cache_control` data part. Same-role message merging enforced to satisfy Anthropic's alternation requirement. **Four stacked bugfixes** for the loop-repeat failure mode are documented in `docs/bugs/loop-repeat/findings-and-plan.md`.
- **Config:** `src/config.ts` — typed getters over the `minimax` section (`thinking`, `thinkingEffort`, `maxOutputTokens`, `debugMode`, `visibleModels`, `apiBaseUrl`).
- **Models:** `src/models/registry.ts` — Hard-coded 3-model registry (M3.1 Flash, M3, M3-Priority) with context windows, per-model output caps (32,768 / 8,192), `thinking` flags, `thinkingAlwaysOn`, and `effortTunable`; M2.x was removed in v0.2.0. `pricingDetail` computes PAYG input/output rates per active region, including the China-¥ conversion (×7 multiplier) and the 1.5× priority surcharge. Display names are resolved lazily via `modelName()` so `initI18n()` has already run. Picker entries built in `src/provider/models.ts` with `capabilities: { imageInput: <multimodal>, toolCalling: 128 }`.
- **Errors:** `src/client/error.ts` — Maps HTTP status to i18n toasts; only 402 gets a deep-link action (`Top Up` → `billingUrl()`).
- **Thinking guard:** `src/runtime/thinkingPartGuard.ts` — Runtime constructor check for `LanguageModelThinkingPart` so thinking deltas are dropped silently on stable VS Code.
- **Walkthrough:** `walkthroughs/setup/{welcome,set-key,choose-region,thinking}.md` plus `package.json#contributes.walkthroughs` registration. Each step can declare `completionEvents` to auto-advance on corresponding commands.
- **i18n:** `src/i18n.ts` — `initI18n()` picks `en` or `zh` once at activation; lightweight `t(key)` lookup against a hand-written dictionary.
- **Build:** `esbuild` → `dist/extension.js`; ESLint flat config; Prettier; `tsc --noEmit`; `npm run ltfb` = lint + typecheck + format + compile.
- **Tests:** `node --import tsx --test test/**/*.test.ts`; 20 tests in `test/convert.test.ts` (conversion, thinking replay, vision) plus 13 in `test/registry.test.ts` (model metadata and pricing).

## Appendix A: zelosleone Version — Bootstrapping Deadlock

The [zelosleone/minimax-vscode](https://github.com/zelosleone/minimax-vscode) extension (the original fork) has a **fatal bootstrapping deadlock** that prevents models from appearing in the picker:

1. `provideLanguageModelChatInformation` reads the API key from `options.configuration.apiKey` (VS Code internal plumbing).
2. If the key is absent → returns `[]` → no models in picker.
3. `provideLanguageModelChatResponse` _does_ have a Secret Storage + prompt fallback, but it never fires because no models are selectable.
4. No `MiniMax: Add API Key` command exists to break the cycle.

The klarkxy fork fixes this: `provideLanguageModelChatInformation` checks `hasApiKey()` for tooltip purposes only and **always returns models**. The `MiniMax: Add API Key` command is available from the command palette immediately after installation. No deadlock.

The tugudush fork fixes this in the same way: `provideLanguageModelChatInformation` returns all three entries unconditionally regardless of key state; `MiniMax: Set API Key` is available from the moment the extension loads. No deadlock.

## Appendix B: Why klarkxy Cannot Do PAYG

The klarkxy extension targets `api.minimax.io/anthropic`. MiniMax's Anthropic-compatible endpoint **does** accept PAYG Open Platform API Keys at the protocol level (it accepts both `sk-cp-…` subscription keys and PAYG keys via the same `x-api-key` header). The 404 returned for PAYG against the klarkxy extension is therefore **not** an endpoint restriction — it is a klarkxy-extension restriction, intentional or otherwise.

Examining the klarkxy extension source on this point is out of scope for this analysis, but two patterns are consistent with the observed behaviour:

1. **Auth-dispatch logic.** Some upstream configurations gate Anthropic-compat access behind a Token Plan allowlist and route PAYG accounts to the OpenAI-compatible endpoint. The klarkxy extension may have assumed the Token-Plan-only contract from the [Other Tools configuration reference](https://platform.minimax.io/docs/token-plan/other-tools) and validated accordingly.
2. **Manual user-flow assumption.** The extension's `MiniMax: Add API Key` command names and screenshots reference the Subscription Key workflow; PAYG may simply have been outside the initial design surface and never tested.

The net practical answer for users: **PAYG customers cannot use the klarkxy extension today.** This is the gap the tugudush extension fills.

## Appendix C: Why tugudush Can Do PAYG

The tugudush extension targets the **same** endpoint (`api.minimax.io/anthropic`) but does not gate on key prefix or account type. Its auth layer (`src/auth.ts`) accepts any non-empty string as a valid API key and forwards it verbatim in the `x-api-key` header:

```ts
const client = new Anthropic({
  apiKey, // Whatever the user stored — PAYG or Token Plan
  baseURL: baseUrl // api.minimax.io/anthropic or api.minimaxi.com/anthropic
})
```

There is no key-prefix validation, no allowlist check, no upstream probe. If the upstream accepts the key, the request proceeds. If the key is invalid, the request fails — and the user sees a 401/403 toast.

In practice:

| Key in `minimax-paygo.apiKey`           | Behaviour                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| PAYG Open Platform API Key              | ✅ Works against `api.minimax.io/anthropic`. PAYG billing.                                              |
| Token Plan Subscription Key (`sk-cp-…`) | ✅ Works against `api.minimax.io/anthropic`. Token Plan quota.                                          |
| Empty / malformed                       | ❌ Extension emits a placeholder `LanguageModelTextPart` ("Set API key…") and skips the Anthropic call. |

Region still matters: a PAYG key issued by `platform.minimax.io` only authenticates against `api.minimax.io`; a China PAYG key only authenticates against `api.minimaxi.com`. The `MiniMax: Switch to Global/Chinese API` commands cover both directions.

## References

- [klarkxy/minimax-vscode (GitHub)](https://github.com/klarkxy/minimax-vscode)
- [MiniMax Copilot (klarkxy) on VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=klarkxy.minimax-vscode-copilot)
- [tugudush/minimax-copilot (GitHub)](https://github.com/tugudush/minimax-copilot)
- [tugudush/minimax-copilot CHANGELOG](https://github.com/tugudush/minimax-copilot/blob/main/CHANGELOG.md)
- [tugudush/minimax-copilot publishing notes](https://github.com/tugudush/minimax-copilot/blob/main/docs/publishing.md)
- [tugudush/minimax-copilot loop-repeat postmortem](https://github.com/tugudush/minimax-copilot/blob/main/docs/bugs/loop-repeat/findings-and-plan.md)
- [Our MiniMax setup guide (OpenAI-compatible)](../models/minimax.md)
- [MiniMax Anthropic API docs](https://platform.minimax.io/docs/api-reference/text-anthropic-api)
- [MiniMax Token Plan](https://platform.minimax.io/docs/token-plan/intro)
- [zelosleone/minimax-vscode](https://github.com/zelosleone/minimax-vscode) (original fork — broken)
