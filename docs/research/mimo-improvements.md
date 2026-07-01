# MiMo — Improvement Opportunities from `xiaomimimo-for-copilot` Extension

> **Date:** 2026-07-01
> **Source:** [Sdcb/xiaomimimo-for-copilot](https://github.com/Sdcb/xiaomimimo-for-copilot) VS Code extension review
> **Scope:** Features and configuration present in the extension but absent from the current custom-endpoint + proxy setup.

## Summary

The `xiaomimimo-for-copilot` extension implements MiMo as a proper `LanguageModelChatProvider` (vendor `'mimo'`), registered directly into Copilot Chat's model picker. Our current approach uses VS Code's `customendpoint` vendor with a local Node.js proxy (`proxy/mimo-proxy.mjs`) for dynamic thinking suppression.

The extension takes the **harder but more capable path**: thinking mode is always ON, and a reasoning-content cache satisfies MiMo's API requirement that `reasoning_content` must be present in history for tool-call turns. Our proxy takes the simpler path: disable thinking on tool turns to avoid the 400 error.

---

## Features in the Extension NOT Present in Our Setup

### 1. Third Model: `mimo-v2.5-pro-ultraspeed`

The extension exposes a third MiMo model we don't have configured:

| Model ID                   | Description                                            | Vision | Context |
| -------------------------- | ------------------------------------------------------ | ------ | ------- |
| `mimo-v2.5-pro-ultraspeed` | "Fast Pro reasoning for latency-sensitive agent tasks" | ❌     | 917K    |

Our `chatLanguageModels.json` only has `mimo-v2.5-pro` and `mimo-v2.5`.

**Action:** Add `mimo-v2.5-pro-ultraspeed` to our MiMo model list if Xiaomi's API supports it.

### 2. Thinking Mode WITH Tool Calling (Reasoning Content Cache)

**This is the single biggest architectural difference.**

Our proxy dynamically suppresses thinking when tools are present:

- Plain chat → thinking ON (reasoning visible)
- Tool-enabled requests → `thinking: { type: "disabled" }` injected

The extension does the opposite — thinking is always ON — and manages the complexity by:

1. **Caching** `reasoning_content` keyed by `tool_call_id` in a `Map<string, ReasoningEntry>` (max 200 entries, LRU eviction).
2. **Re-injecting** cached reasoning into prior assistant messages when reconstructing history for subsequent turns.
3. **Pruning** the cache at conversation start (messages ≤ 2) or on eviction.

This satisfies MiMo's hard API requirement: when thinking is enabled and history contains tool calls, `reasoning_content` **must** be present in every assistant message that precedes a tool result. Otherwise the API returns HTTP 400.

**Implication:** With the extension, you see the model's reasoning **even during agent mode** — e.g., "why did it choose to read this file?" — which is currently impossible with our proxy.

**Relevant source files in the extension:**

- `src/provider/cache.ts` — `ReasoningEntry` interface and `pruneReasoningCache()`
- `src/provider/convert.ts` — `convertMessages()` injects cached reasoning into history
- `src/provider/index.ts` — caches reasoning on tool-call emit and response completion

### 3. Real-Time Reasoning Visibility via `LanguageModelThinkingPart`

The extension uses the proposed `LanguageModelThinkingPart` API to stream reasoning content as collapsible blocks inside Copilot Chat. This requires a `.d.ts` augmentation (`vscode.proposed.languageModelThinkingPart.d.ts`) since the type isn't in stable `@types/vscode` yet.

Our proxy strips reasoning during tool turns, so we never get this. Even in plain chat (where the proxy leaves thinking ON), VS Code's `customendpoint` vendor may not render `reasoning_content` as collapsible blocks the way the extension does.

### 4. Token Usage Reporting in the Context Window Widget

The extension reports token usage via `LanguageModelDataPart.json(usage, 'usage')`, which feeds VS Code's context window bar. This is the same convention used by Copilot's own BYOK providers (Anthropic, Gemini).

Our setup has no usage feedback mechanism.

### 5. Prompt Caching Feedback Loop

The extension reads `prompt_tokens_details.cached_tokens` from each streaming response and feeds it back to the API on subsequent requests. This keeps MiMo's server-side prompt cache warm across multi-turn conversations.

Real-world cache performance from the extension's README:

```
tokens: prompt=14973 completion=130 | cache: hit=12288 rate=82% | reasoning=83 | chars/tok=3.17
tokens: prompt=15179 completion=230 | cache: hit=14912 rate=98% | reasoning=111 | chars/tok=2.58
tokens: prompt=17110 completion=245 | cache: hit=15168 rate=89% | reasoning=42 | chars/tok=2.23
tokens: prompt=17635 completion=174 | cache: hit=17088 rate=97% | reasoning=77 | chars/tok=1.99
tokens: prompt=18068 completion=521 | cache: hit=17600 rate=97% | reasoning=108 | chars/tok=1.83
tokens: prompt=19077 completion=57  | cache: hit=18048 rate=95% | reasoning=24 | chars/tok=1.75
tokens: prompt=19201 completion=142 | cache: hit=19072 rate=99% | reasoning=23 | chars/tok=1.69
```

Cache hit rates climb to **97–99%** on subsequent turns. Our proxy is a transparent passthrough with no cache awareness — we're likely paying for re-computation on every turn.

### 6. Adaptive Chars-Per-Token Calibration

The extension implements `provideTokenCount()` with an adaptive ratio:

```ts
// Exponential moving average from actual API usage
this.charsPerToken = this.charsPerToken * 0.7 + observedRatio * 0.3
```

Initialized at `4.0` and continuously calibrated from real token counts. Our setup relies on VS Code's default token estimation, which may be inaccurate for MiMo's tokenizer.

### 7. Multi-Region Endpoint Selector

The extension has a built-in settings dropdown with all 4 MiMo endpoints:

| Endpoint                           | Plan                            |
| ---------------------------------- | ------------------------------- |
| `api.xiaomimimo.com/v1`            | Standard API (no plan)          |
| `token-plan-cn.xiaomimimo.com/v1`  | Token Plan — China              |
| `token-plan-sgp.xiaomimimo.com/v1` | Token Plan — Singapore          |
| `token-plan-ams.xiaomimimo.com/v1` | Token Plan — Europe (Amsterdam) |
| Custom Endpoint                    | Any OpenAI-compatible URL       |

Our setup hardcodes the proxy URL (`http://127.0.0.1:3459`). Switching endpoints requires manual `chatLanguageModels.json` edits.

### 8. No Proxy Server Dependency

The extension is pure VS Code API + Node.js built-ins — no local proxy server to start, no extra terminal, no `npm run proxy:mimo`. This is simpler and eliminates a failure point.

Our approach requires `proxy/mimo-proxy.mjs` to be running for dynamic thinking suppression. If the proxy isn't running, MiMo models are effectively broken.

### 9. API Key Validation

The extension validates API key format on entry:

- Must start with `sk-` or `tp-`
- Provides immediate feedback on the input box

Our setup uses VS Code's generic `chat.lm.secret` mechanism with no MiMo-specific validation.

### 10. Dedicated Commands & Output Channel

| Command               | Description                         |
| --------------------- | ----------------------------------- |
| `MiMo: Set API Key`   | Configure API key with validation   |
| `MiMo: Get API Key`   | Open MiMo platform to create key    |
| `MiMo: Clear API Key` | Remove stored key                   |
| `MiMo: Open Settings` | Jump to `mimo-copilot` settings     |
| `MiMo: Show Logs`     | View extension logs in Output panel |

The extension also has a dedicated `MiMo` output channel with timestamped log entries (token usage, cache hit rates, errors). Our setup has proxy logs in `debug_log/` but no in-editor visibility.

### 11. Welcome Walkthrough

A guided setup walkthrough (`sdmapvstool.xiaomimimo-for-copilot#mimoGettingStarted`) that steps through:

1. Set API Key
2. Set Base URL
3. Show Models

Our setup requires reading `docs/models/mimo.md` manually.

### 12. Automatic Image Stripping

If you send images to `mimo-v2.5-pro` (text-only), the extension strips them with a logged warning. Our setup would pass them through — likely getting an API error from MiMo.

### 13. `stream_options: { include_usage: true }`

The extension sends this in every streaming request to get per-chunk usage stats. Our proxy doesn't add this, so we don't get granular token usage data.

### 14. Model ID Override Support

The extension has a `modelIdOverrides` setting for third-party API proxies:

```json
"mimo-copilot.modelIdOverrides": {
    "mimo-v2.5-pro": "some-other-model-id"
}
```

Useful for routing through alternative endpoints. Our setup would require editing the model `id` directly in `chatLanguageModels.json`.

### 15. Clean Shutdown / Deactivation

On extension deactivation:

- `isActive` set to `false`
- `provideLanguageModelChatInformation` returns `[]`
- Models are immediately dropped from the Copilot picker
- No stale entries left behind

Our setup leaves models in the picker as long as the config is in `chatLanguageModels.json`.

### 16. Context Window: 917K vs 1M

The extension uses `maxInputTokens: 917504` (917K) for all MiMo models. Our config uses `1048576` (1M). The extension's value is likely the more conservative/accurate limit. Over-reporting could cause requests to exceed the real limit.

---

## What Our Setup Has That the Extension Doesn't

| Feature                            | Detail                                                                                                                                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Dynamic thinking suppression**   | Thinking ON in plain chat, OFF in tool loops. The extension always has thinking ON and manages the complexity. Our approach is simpler at the cost of losing reasoning visibility in agent mode. |
| **No Marketplace dependency**      | Pure JSON config + a local Node.js proxy. No extension to install/update/trust.                                                                                                                  |
| **Shared proxy infrastructure**    | `npm run proxy` starts Kimi, Qwen, and MiMo proxies concurrently. One command, all providers.                                                                                                    |
| **Full control over request body** | We can tweak `temperature`, `top_p`, and other params without waiting for an extension update.                                                                                                   |
| **Existing documentation**         | `docs/models/mimo.md` is comprehensive and maintained in-repo.                                                                                                                                   |

---

## Prioritized Recommendations

### High Impact / Low Effort

1. **Add `mimo-v2.5-pro-ultraspeed`** to `chatLanguageModels.json` if the API supports it. Just a new model entry.

2. **Set `maxInputTokens` to `917504`** instead of `1048576` — matches the extension's more accurate limit.

3. **Add `stream_options` to the proxy** — inject `"stream_options": { "include_usage": true }` in proxied requests to get usage stats. Minor proxy change.

### High Impact / High Effort

4. **Implement reasoning-content caching in the proxy** — the single biggest capability gap. This would let thinking mode work WITH tool calling. The proxy would need to:
   - Maintain a `tool_call_id → reasoning_content` map across turns
   - Inject cached `reasoning_content` into assistant messages in history
   - Evict stale entries (conversation start heuristic, LRU)

   This is essentially porting `src/provider/cache.ts` + the injection logic from `src/provider/convert.ts` into `proxy/mimo-proxy.mjs`.

5. **Consider adopting the extension** — if the extension works reliably and doesn't break on VS Code updates, it may be simpler than maintaining equivalent functionality in our proxy. The extension is MIT-licensed.

### Nice to Have

6. **Token usage logging** in the proxy — log cache hit rates and reasoning token counts similar to the extension's output channel format.

7. **Adaptive token counting** — calibrate chars-per-token from actual usage if we ever need accurate token estimates.

---

## Architectural Comparison

| Aspect                 | Extension                                     | Our Setup                               |
| ---------------------- | --------------------------------------------- | --------------------------------------- |
| **Integration**        | `LanguageModelChatProvider` (vendor `'mimo'`) | `customendpoint` vendor + proxy         |
| **Thinking + Tools**   | Always ON, cache-managed                      | Dynamic suppression (OFF on tool turns) |
| **Dependencies**       | None (VS Code + Node built-ins)               | Node.js proxy server                    |
| **API key storage**    | `SecretStorage` (OS keychain)                 | VS Code `chat.lm.secret`                |
| **Token visibility**   | Context widget + output channel               | None                                    |
| **Cache awareness**    | Full feedback loop                            | None (transparent proxy)                |
| **Models exposed**     | 3 (UltraSpeed, Pro, V2.5)                     | 2 (Pro, V2.5)                           |
| **Endpoint switching** | Settings dropdown                             | Manual JSON edit                        |
| **Maintenance burden** | Extension updates                             | Proxy + config maintenance              |
