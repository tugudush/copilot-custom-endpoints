# MiniMax: Custom Endpoint vs VS Code Extension Comparison

> **Date:** 2026-07-01  
> **Extension:** [klarkxy/minimax-vscode](https://github.com/klarkxy/minimax-vscode) (v2.5.3, MIT, by klarkxy)  
> **Marketplace:** [`klarkxy.minimax-vscode-copilot`](https://marketplace.visualstudio.com/items?itemName=klarkxy.minimax-vscode-copilot)  
> **Previously evaluated:** [zelosleone/minimax-vscode](https://github.com/zelosleone/minimax-vscode) — **broken** due to bootstrapping deadlock (see [Appendix A](#appendix-a-zelosleone-version--bootstrapping-deadlock))

## Overview

We currently use MiniMax-M3 via VS Code's built-in **custom endpoint** mechanism (`chatLanguageModels.json`), targeting the OpenAI-compatible `https://api.minimax.io/v1/chat/completions` endpoint.

The **klarkxy/minimax-vscode** extension ("MiniMax Copilot") is a mature, actively maintained native `LanguageModelChatProvider` that targets MiniMax's **Anthropic-compatible** endpoint (`https://api.minimax.io/anthropic`). It is functionally a different product from the zelosleone fork — different API surface, different features, and critically, **no bootstrapping deadlock**.

## Quick Comparison

| Aspect                        | Custom Endpoint (current)                                          | `klarkxy/minimax-vscode` Extension                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **API protocol**              | OpenAI-compatible (`/v1/chat/completions`)                         | Anthropic-compatible (`/anthropic`)                                                                                                                           |
| **Integration**               | `chatLanguageModels.json` — generic custom endpoint                | Native `LanguageModelChatProvider` — first-class VS Code LM integration                                                                                       |
| **Models**                    | 1: `MiniMax-M3` (manually configured)                              | 4 default: M3, M3-Priority, M2.7, M2.7‑highspeed (+6 legacy via manual override)                                                                              |
| **Thinking handling**         | `reasoning_split: true` — `reasoning_details` discarded by VS Code | Binary `disabled`/`adaptive` toggle in model picker dropdown; thinking blocks via `LanguageModelThinkingPart` (Insiders) or `[thinking]…[/thinking]` fallback |
| **API key**                   | `${input:chat.lm.secret.<id>}` via "Chat: Manage Language Models"  | VS Code Secret Storage + named **KeyManager pool**; `MiniMax: Add API Key` / `MiniMax: Manage API Keys` / auto-detect region                                  |
| **Shows models without key?** | ✅ Yes (custom endpoint always shows)                              | ✅ **Yes** — `provideLanguageModelChatInformation` does NOT gate on key presence; returns models regardless                                                   |
| **Configuration**             | Manual JSON editing (`chatLanguageModels.json`)                    | Settings UI: `minimax.apiBaseUrl`, `minimax.visibleModels`, `minimax.maxOutputTokens`, `minimax.enableM31MContext`, per-model sampling, debug modes           |
| **Region switching**          | Manually edit `url` in JSON                                        | Commands: `MiniMax: Switch to Global API` / `MiniMax: Switch to Chinese API`; auto-detect on first activation                                                 |
| **Thinking toggle**           | Not available (static `requestBody`)                               | Per-model `configurationSchema` dropdown in picker — binary `disabled`/`adaptive` on M3                                                                       |
| **Usage dashboard**           | None                                                               | Rich webview: today / 7-day / 30-day cards, 30-day bar chart, per-model breakdown, Token Plan quota (5h + weekly), Claude Code JSONL ingest                   |
| **Status bar**                | None                                                               | Live Token Plan quota bar (5h % / weekly %)                                                                                                                   |
| **M3 1M context**             | Not available (static 512K in model def)                           | `MiniMax: Toggle M3 1M Context` command with billing warning modal                                                                                            |
| **Web Search MCP**            | None (manual MCP config needed)                                    | Auto-registers `minimax-web-search` MCP server definition provider for Agent Mode                                                                             |
| **mmx-cli detection**         | None                                                               | Dashboard shows CLI/auth/SKILL status; one-click copy install prompt                                                                                          |
| **Error handling**            | Generic (HTTP status + raw body)                                   | MiniMax-specific error codes with i18n messages (en/zh-cn); action buttons (Set API Key, Show Logs)                                                           |
| **Per-model sampling**        | Static `temperature`/`top_p` in `requestBody`                      | Dynamic: `minimax.sampling` overrides per model + respects VS Code `modelOptions`                                                                             |
| **Debug/diagnostics**         | None                                                               | `minimax.debugMode` (`minimal`/`metadata`/`verbose`); per-request classifier; cache-hit stats; request dumps to disk                                          |
| **Commit messages**           | N/A                                                                | Route Copilot's Source Control ✨ commit button through MiniMax via `chat.utilitySmallModel`                                                                  |
| **Vision**                    | ✅ M3 (image + video, via `vision: true`)                          | ✅ M3 (image + **native video** `type: "video"` parts, 64 MB cap)                                                                                             |
| **Video input**               | ❌ Not exposed                                                     | ✅ M3 native video (`type: "video"` Anthropic content block)                                                                                                  |
| **i18n**                      | N/A                                                                | Full en/zh-cn (README, commands, settings, dashboard, error messages)                                                                                         |
| **Dependencies**              | None (VS Code built-in)                                            | Requires installing the extension; bundles Anthropic SDK                                                                                                      |
| **VS Code requirement**       | Any with Copilot Chat                                              | 1.111.0+; Insiders for native thinking blocks                                                                                                                 |
| **Maintenance**               | We own the config                                                  | Active — v2.5.3 (2026-07-01), rigorous changelog, marketplace distribution                                                                                    |
| **License**                   | N/A (our config)                                                   | MIT                                                                                                                                                           |

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

## Thinking/Reasoning: The Key Differentiator

### Current behavior (OpenAI-compatible custom endpoint)

We set `reasoning_split: true` so the server separates reasoning into `reasoning_details`. VS Code's generic custom-endpoint handler **does not recognize** `reasoning_details`. Reasoning is silently discarded.

**Net result: MiniMax reasoning is invisible to the user.**

### Extension behavior (Anthropic-compatible)

The Anthropic-compatible endpoint surfaces thinking through Anthropic's `thinking` block semantics:

| Scenario                      | Stable VS Code                                               | VS Code Insiders                                        |
| ----------------------------- | ------------------------------------------------------------ | ------------------------------------------------------- |
| Thinking `enabled` (adaptive) | Thinking text reported as `[thinking]…[/thinking]` text part | Thinking reported as native `LanguageModelThinkingPart` |
| Thinking `disabled`           | No thinking block emitted                                    | No thinking block emitted                               |

The thinking toggle is surfaced as a **per-model `configurationSchema` dropdown** in the Copilot model picker — the same UX pattern `deepseek-v4-for-copilot` uses for `reasoningEffort`. The user's choice (`disabled` or `adaptive`) rides on `options.modelConfiguration.thinkingEnabled` in every request.

On the Anthropic surface, MiniMax does **not** expose a reasoning-effort knob (no `budget_tokens`, no `reasoning_effort`, no `reasoning_split`). The toggle is purely binary.

**Net result: reasoning is visible (either as decorated text or native blocks), and the user can toggle it without editing JSON.**

### Verdict

The extension's thinking handling is **substantially better**. Our OpenAI-compatible setup discards reasoning entirely. The extension makes reasoning visible in all VS Code versions with a user-facing toggle.

## Model Support

| Model                                      | Custom Endpoint | Extension (default) | Extension (via override)              |
| ------------------------------------------ | --------------- | ------------------- | ------------------------------------- |
| `MiniMax-M3` (vision + video, 512K/1M ctx) | ✅ Configured   | ✅                  | —                                     |
| `MiniMax-M3-Priority`                      | ❌              | ✅                  | —                                     |
| `MiniMax-M2.7`                             | ❌              | ✅                  | —                                     |
| `MiniMax-M2.7-highspeed`                   | ❌              | ✅                  | —                                     |
| `MiniMax-M2.5`                             | ❌              | —                   | ✅ (`minimax.visibleModels` override) |
| `MiniMax-M2.5-highspeed`                   | ❌              | —                   | ✅                                    |
| `MiniMax-M2.1`                             | ❌              | —                   | ✅                                    |
| `MiniMax-M2.1-highspeed`                   | ❌              | —                   | ✅                                    |
| `MiniMax-M2`                               | ❌              | —                   | ✅                                    |

The extension defaults to 4 models (M3, M3-Priority, M2.7, M2.7‑HS). Legacy models (M2.5/M2.1/M2) are still registered but hidden by default — users can re-add via `minimax.visibleModels`. The rationale: MiniMax no longer recommends the legacy M2.x line.

M3-Priority is a separate picker entry for the higher-priority M3 tier (same model, different API quota pool).

## Configuration & DX

### Current approach

- Edit `%APPDATA%\Code\User\chatLanguageModels.json` by hand.
- API key managed via **Chat: Manage Language Models** command palette flow.
- Changing region requires editing the `url` field in JSON and restarting.
- Changing sampling parameters requires editing `requestBody` in JSON.
- Adding a model means copying the full model block.

### Extension approach

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

### Verdict

The extension offers **dramatically better DX** — no JSON editing, named key pool, settings UI, region auto-detection, one-click switching, and secure credential storage.

## Features Exclusive to the Extension

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

## Error Handling

### Current

Generic HTTP status + raw JSON body. No actionable guidance.

### Extension

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

## API Protocol: OpenAI vs Anthropic

This is a fundamental architectural difference between our setup and the extension:

|                      | Custom Endpoint                                           | klarkxy Extension                                                                   |
| -------------------- | --------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **Endpoint**         | `api.minimax.io/v1/chat/completions`                      | `api.minimax.io/anthropic`                                                          |
| **Protocol**         | OpenAI chat completions                                   | Anthropic Messages                                                                  |
| **Thinking field**   | `reasoning_split: true` + `reasoning_details` in response | Anthropic `thinking` block (`disabled`/`adaptive`)                                  |
| **Tool definitions** | OpenAI `tools[]` / `tool_choice`                          | Anthropic `tools[]`                                                                 |
| **Content blocks**   | OpenAI `content` string                                   | Anthropic content block array (`text`, `image`, `video`, `tool_use`, `tool_result`) |
| **Streaming**        | SSE (`data: {...}`)                                       | SSE (Anthropic event types)                                                         |
| **System prompt**    | `messages[0].role: "system"`                              | `system` top-level field                                                            |
| **Stop reasons**     | `finish_reason`                                           | `stop_reason`                                                                       |

Our custom endpoint docs target the OpenAI-compatible surface. The klarkxy extension targets the Anthropic-compatible surface. Both endpoints serve the same models with full feature parity per MiniMax's docs. The Anthropic surface has better thinking ergonomics (native `thinking` block vs `reasoning_split` extra_body hack).

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

### Extension Limitations

1. **Third-party dependency.** Maintenance depends on extension author (though active: v2.5.3 as of today).
2. **VS Code Insiders required for native thinking blocks.** Stable VS Code shows `[thinking]…[/thinking]` text markers.
3. **Anthropic-compatible only.** Cannot use the OpenAI-compatible endpoint (different protocol entirely).
4. **Token counting is character-based** (not actual tokenization).
5. **M3 1M context requires explicit opt-in** with billing warning (prudent, but adds a step).
6. **M2.5/M2.1/M2 hidden by default** — power users must manually override `minimax.visibleModels`.
7. **Token Plan-only.** The Anthropic-compatible endpoint requires a Token Plan subscription key (`sk-cp-…`). PAYG Open Platform API Keys return **HTTP 404**. See [API Protocol section](#api-protocol-openai-vs-anthropic).
8. **Bundles Anthropic SDK** — adds extension footprint (~1 MB, minor).

## Recommendation

| If you value…                               | Choose…                                                                 |
| ------------------------------------------- | ----------------------------------------------------------------------- |
| **Token Plan subscription** (`sk-cp-…` key) | **Extension** (made for this)                                           |
| **PAYG billing** (Open Platform API Key)    | **Custom endpoint** (extension requires Token Plan — PAYG keys get 404) |
| **Reasoning visibility**                    | Extension (decisive advantage)                                          |
| **Usage tracking & quota visibility**       | Extension (dashboard + status bar)                                      |
| **Zero dependencies, full control**         | Custom endpoint                                                         |
| **Multiple models + M3-Priority**           | Extension                                                               |
| **Quick regional switching**                | Extension                                                               |
| **Agent Mode MCP (web search)**             | Extension (auto-registered)                                             |
| **Commit message integration**              | Extension                                                               |
| **Auditability / no third-party code**      | Custom endpoint                                                         |
| **Native thinking UI (Insiders)**           | Extension                                                               |
| **Simplicity / minimal moving parts**       | Custom endpoint                                                         |
| **OpenAI-compatible protocol**              | Custom endpoint (extension uses Anthropic)                              |

### ⚠️ Critical: PAYG vs Token Plan

The extension's Anthropic-compatible endpoint (`api.minimax.io/anthropic`) **requires a Token Plan subscription key** (`sk-cp-…` prefix). Using a PAYG Open Platform API Key will return **HTTP 404**. This is confirmed by MiniMax's official [Other Tools configuration reference](https://platform.minimax.io/docs/token-plan/other-tools) — every tool on that page specifies "Get Subscription Key."

Our custom endpoint setup uses the OpenAI-compatible endpoint (`api.minimax.io/v1/chat/completions`) which accepts **both** PAYG and Token Plan keys.

| Key type               | Custom Endpoint (OpenAI) | Extension (Anthropic) |
| ---------------------- | ------------------------ | --------------------- |
| Token Plan (`sk-cp-…`) | ✅                       | ✅                    |
| PAYG (Open Platform)   | ✅                       | ❌ (404)              |

### Bottom Line

The **klarkxy/minimax-vscode** extension is a **production-grade, actively maintained** integration — but it is **Token Plan-only**. If you have a subscription, use it. If you're on pay-as-you-go, stick with the custom endpoint setup in this repo.

For our use case (validating custom endpoints and documenting setups), we maintain both paths: the extension for Token Plan users who want the polished UX, and the custom endpoint for PAYG users and as the canonical API reference.

## Extension Codebase Notes

Key architectural details of `klarkxy/minimax-vscode` (v2.5.3):

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

## Appendix A: zelosleone Version — Bootstrapping Deadlock

The [zelosleone/minimax-vscode](https://github.com/zelosleone/minimax-vscode) extension (the original fork) has a **fatal bootstrapping deadlock** that prevents models from appearing in the picker:

1. `provideLanguageModelChatInformation` reads the API key from `options.configuration.apiKey` (VS Code internal plumbing).
2. If the key is absent → returns `[]` → no models in picker.
3. `provideLanguageModelChatResponse` _does_ have a Secret Storage + prompt fallback, but it never fires because no models are selectable.
4. No `MiniMax: Add API Key` command exists to break the cycle.

The klarkxy fork fixes this: `provideLanguageModelChatInformation` checks `hasApiKey()` for tooltip purposes only and **always returns models**. The `MiniMax: Add API Key` command is available from the command palette immediately after installation. No deadlock.

## References

- [klarkxy/minimax-vscode (GitHub)](https://github.com/klarkxy/minimax-vscode)
- [MiniMax Copilot on VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=klarkxy.minimax-vscode-copilot)
- [Our MiniMax setup guide (OpenAI-compatible)](../models/minimax.md)
- [MiniMax Anthropic API docs](https://platform.minimax.io/docs/api-reference/text-anthropic-api)
- [MiniMax Token Plan](https://platform.minimax.io/docs/token-plan/intro)
- [zelosleone/minimax-vscode](https://github.com/zelosleone/minimax-vscode) (original fork — broken)
