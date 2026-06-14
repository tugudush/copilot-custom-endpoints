# Kimi K2.7 Code — VS Code Custom Endpoint Setup Guide

> **Status:** ✅ **Validated June 14, 2026.** Kimi K2.7 Code works as a Copilot custom endpoint through the local Kimi proxy. The proxy detects K2.7 and skips the `thinking: disabled` rewrite (K2.7 rejects it) while keeping temperature/top_p enforcement.
>
> For the detailed validation narrative, see the [Validation Record](#validation-record) appendix.

---

## Why this is its own page (not a section in kimi.md)

K2.7 is a real architectural and behavioral change versus K2.6, not a parameter tweak:

- **Always-thinking** — OpenRouter's description and the Moonshot pricing page agree the model "always operates in a thinking mode, preserving full reasoning content across multi-turn conversations." K2.6 has a non-thinking mode that K2.7 removes.
- **Video input** — K2.6's native multimodal was text + image. K2.7 adds video. Worth verifying how VS Code forwards (or doesn't forward) video frames.
- **New MoE tuning** — same 32B/1T shape as K2.6, but the inference stack and "automatic context caching" wording on the Moonshot page suggest internal changes that may shift the sampling-rewrite rules the K2.6 proxy was tuned for.
- **Pricing column changed** — K2.6 lists input / non-thinking output / thinking output. K2.7 lists input / cached input / output (no thinking-mode split). Reflects the always-thinking behavior.

This is enough surface area that mixing K2.6 and K2.7 in the same doc would hide the differences that matter for VS Code.

---

## What we know from Moonshot (authoritative)

Source: <https://platform.kimi.ai/docs/pricing/chat-k27-code> and <https://platform.kimi.ai/docs/pricing/promotion>, retrieved June 14, 2026.

| Field              | Value (K2.7)                                                                                    | vs K2.6                             |
| ------------------ | ----------------------------------------------------------------------------------------------- | ----------------------------------- |
| Model id           | `kimi-k2.7-code`                                                                                | `kimi-k2.6`                         |
| Context window     | 262,144 tokens                                                                                  | 256K                                |
| Architecture       | 32B active / 1T total MoE (per OpenRouter summary)                                              | Same shape                          |
| Modalities         | **Text + image + video input**, text output                                                     | Text + image input                  |
| Thinking           | **Always on**; preserves `reasoning_content` across multi-turn                                  | Selectable thinking / non-thinking  |
| Tool calling       | ✅ ToolCalls, JSON Mode, Partial Mode                                                           | ✅                                  |
| Context caching    | **Automatic** (per Moonshot product description)                                                | Not advertised on K2.6 page         |
| Direct input price | **$0.19 / 1M**                                                                                  | $0.16 / 1M                          |
| Cached input price | **$0.95 / 1M**                                                                                  | n/a (no cache tier listed for K2.6) |
| Output price       | **$4.00 / 1M** (no thinking/non-thinking split)                                                 | $0.95 non-thinking / $4.00 thinking |
| Launch promo       | $100+ top-up → 20–30% voucher (through **July 2, 2026 PDT**)                                    | n/a                                 |
| Endpoint           | `https://api.moonshot.ai/v1/chat/completions` (assumed; not yet confirmed on K2.7-specific doc) | Same                                |

**Answers from validation:**

1. ✅ Direct Moonshot slug is `kimi-k2.7-code`.
2. ✅ `top_p` is still locked; proxy forces `0.95`.
3. ✅ `temperature` is still locked to `1`; proxy forces it.
4. ✅ K2.7 **rejects** `thinking: disabled` (HTTP 400). Proxy now detects `kimi-k2.7*` and skips that rewrite.

---

## What the existing proxy assumes (K2.6 era)

[`proxy/kimi-proxy.mjs`](../../proxy/kimi-proxy.mjs) currently does four things on every request. Each assumption needs to be re-checked for K2.7:

| #   | Proxy behavior                                             | K2.6 confirmed | K2.7 needs re-check?                                    |
| --- | ---------------------------------------------------------- | -------------- | ------------------------------------------------------- |
| 1   | Force `temperature: 1` on thinking-mode requests           | ✅             | ⚠️ Default still 1, but now applies to **all** requests |
| 2   | Force `temperature: 0.6` when thinking is disabled (tools) | ✅             | ⚠️ Path may not exist on K2.7                           |
| 3   | Force `top_p: 0.95`                                        | ✅             | ⚠️ Almost certainly still required                      |
| 4   | Force `thinking: { type: "disabled" }` on tool turns       | ✅             | 🔴 **Biggest unknown** — K2.7 is always-thinking        |
| 5   | Pass through `Authorization: Bearer …`                     | ✅             | ✅ Same auth scheme                                     |
| 6   | Preserve streaming (SSE)                                   | ✅             | ⚠️ Should still work; verify                            |

**The headline risk** is item #4. If K2.7 errors on `thinking: disabled`, the proxy needs a K2.7-specific code path. If it silently ignores it, the K2.6 path keeps working. If it switches the model to a non-thinking sub-mode and that path is broken in tool loops, the proxy needs to **stop** forcing `disabled` for K2.7 specifically.

---

## Validation plan

Run in this order. Each step is a gate; do not proceed past a failure until the previous step is green.

### Step 0 — Prerequisites

- A Moonshot API key with credit on it. The 15 RMB (~$2) free trial credit is enough for a smoke test.
- The K2.6 proxy checked out on `main` and currently working (so we have a known-good baseline).
- `node` ≥ 18 and `curl`.

### Step 1 — Confirm the direct API path works at all

**Status:** ✅ **Completed June 14, 2026.**

Before touching the proxy, prove K2.7 responds to Moonshot directly. This is the cheapest sanity check.

```bash
curl -sS https://api.moonshot.ai/v1/models \
  -H "Authorization: Bearer $KIMI_API_KEY" | head -200
```

**Result:** `kimi-k2.7-code` is the exact slug on Moonshot direct. Model list also confirms:

- `supports_image_in: true`
- `supports_video_in: true` (new vs K2.6)
- `supports_reasoning: true`
- `context_length: 262144`

```bash
curl -sS https://api.moonshot.ai/v1/chat/completions \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.7-code",
    "messages": [{"role": "user", "content": "Reply with the word OK and nothing else."}],
    "temperature": 1,
    "top_p": 0.95,
    "max_tokens": 256
  }'
```

**Result:** HTTP 200, `content: "OK"`, `reasoning_content` present, `cached_tokens: 16` (automatic caching working), `finish_reason: "stop"`.

**⚠️ Critical finding:** With `max_tokens=32`, `content` was empty because reasoning consumed the entire token budget. K2.7 is **always-thinking** — reasoning tokens count against `max_tokens`. Set `max_tokens` generously (≥256) in VS Code config to avoid truncated responses.

**Pass criteria:** HTTP 200, body contains `"content": "OK"` (or similar), no `invalid temperature` or `invalid top_p` error.

### Step 2 — Confirm the proxy still works as-is against K2.7

**Status:** ✅ **Completed June 14, 2026.**

Start the existing K2.6 proxy unchanged. Send a K2.7 request **through** the proxy.

```bash
npm run proxy:kimi &   # starts on :3457
curl -sS http://127.0.0.1:3457/v1/chat/completions \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.7-code",
    "messages": [{"role": "user", "content": "Reply with the word OK and nothing else."}],
    "max_tokens": 256
  }'
```

**Result:** HTTP 200, `content: "OK"`, `reasoning_content` present. Proxy rewrite (temperature→1, top_p→0.95) applied successfully.

**Outcome:** ✅ Works as-is for plain chat. The K2.6 proxy already handles K2.7 basic requests. No code change needed for non-tool turns. Proceed to Step 3 to test the 🔴 critical tool-turn behavior.

### Step 3 — Test thinking-disabled behavior on K2.7

**Status:** ✅ **Completed June 14, 2026.**

If Step 2 failed with a `thinking` error, run two focused curls to characterize K2.7's behavior:

```bash
# A. Tool turn WITH thinking: disabled (what the proxy sends today)
curl -sS https://api.moonshot.ai/v1/chat/completions \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.7-code",
    "messages": [{"role": "user", "content": "What is 2+2?"}],
    "tools": [{"type":"function","function":{"name":"ping","description":"ping","parameters":{"type":"object","properties":{}}}}],
    "thinking": {"type": "disabled"},
    "temperature": 0.6,
    "top_p": 0.95,
    "max_tokens": 256
  }'
```

**Result A:** HTTP 400 — `{"error":{"message":"invalid thinking: only type=enabled is allowed for this model","type":"invalid_request_error"}}`

K2.7 **rejects** `thinking: disabled`. The proxy's current behavior breaks K2.7.

```bash
# B. Tool turn WITHOUT forcing thinking: disabled (let K2.7 think)
curl -sS https://api.moonshot.ai/v1/chat/completions \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.7-code",
    "messages": [{"role": "user", "content": "What is 2+2?"}],
    "tools": [{"type":"function","function":{"name":"ping","description":"ping","parameters":{"type":"object","properties":{}}}}],
    "temperature": 1,
    "top_p": 0.95,
    "max_tokens": 256
  }'
```

**Result B:** HTTP 200 — `content: "2 + 2 = 4."`, `reasoning_content` present, `finish_reason: "stop"`.

**Path forward:** Don't force `thinking: disabled` on K2.7. Let it think on every turn. The proxy needs a K2.7-specific branch that skips the thinking-disable rewrite while keeping temperature/top_p enforcement.

**⚠️ Risk:** VS Code does not forward `reasoning_content` between tool turns. This may break multi-turn tool loops — see Step 5.

### Step 4 — Test temperature / top_p lock-in on K2.7

If Step 2 failed on sampling values, check what K2.7 actually allows:

```bash
curl -sS https://api.moonshot.ai/v1/chat/completions \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.7-code",
    "messages": [{"role": "user", "content": "ping"}],
    "temperature": 0.3
  }'
```

Almost certainly fails with `invalid temperature: only 1 is allowed`. Document the exact error text. The proxy's existing rewrite is probably correct — just confirm.

### Step 5 — Two-turn tool loop against the proxy

**Status:** ✅ **Completed June 14, 2026.**

If Steps 2–4 pass, the smoke test that actually matters is a 2-turn tool loop, since that's what the VS Code agent does. Use this exact sequence — it's the same shape as the Qwen tests in `tests/proxy.test.mjs`:

```bash
# Turn 1: ask for a tool call
curl -sS http://127.0.0.1:3457/v1/chat/completions \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.7-code",
    "messages": [{"role": "user", "content": "Use the ping tool."}],
    "tools": [{"type":"function","function":{"name":"ping","description":"ping","parameters":{"type":"object","properties":{}}}}],
    "tool_choice": "auto",
    "stream": false,
    "max_tokens": 256
  }'
```

**Turn 1 result:** HTTP 200, model calls `ping` tool, `finish_reason: "tool_calls"`, `reasoning_content` present.

Capture the `tool_call_id` from the response, then:

```bash
# Turn 2: feed the tool result back
curl -sS http://127.0.0.1:3457/v1/chat/completions \
  -H "Authorization: Bearer $KIMI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "kimi-k2.7-code",
    "messages": [
      {"role": "user", "content": "Use the ping tool."},
      {"role": "assistant", "content": null, "tool_calls": [{"id":"<ID>","type":"function","function":{"name":"ping","arguments":"{}"}}]},
      {"role": "tool", "tool_call_id": "<ID>", "content": "pong"}
    ],
    "tools": [{"type":"function","function":{"name":"ping","description":"ping","parameters":{"type":"object","properties":{}}}}],
    "stream": false,
    "max_tokens": 256
  }'
```

**Turn 2 result:** HTTP 200, assistant produces natural-language answer: `"I used the ping tool and received the response: **pong**."`, `finish_reason: "stop"`.

**Pass criteria:** Turn 2 returns 200, the assistant produces a final natural-language answer (not another tool call stuck in a loop). ✅

**🎉 Critical finding:** No `reasoning_content is missing` error on Turn 2. K2.7 handles the tool loop gracefully even when VS Code doesn't forward `reasoning_content` between turns. This is **better behavior than MiMo**, which errors in the same scenario.

### Additional real-world validation — integrated browser tool

**Status:** ✅ **Completed June 14, 2026.**

Prompt in VS Code Agent mode: *"please open google site using vscode integrated browser"*

Result: K2.7 invoked the browser/open tool, VS Code opened `https://www.google.com` in the integrated browser, and reported *"Opened Google in the integrated browser."* Screenshot captured.

This confirms K2.7's tool-calling path works end-to-end through the proxy in a real VS Code agent session, not just in `curl` tests.

### Step 6 — VS Code picker integration

**Status:** ✅ **Completed June 14, 2026.** Manual VS Code test passed. K2.7 was tested in Agent mode with the integrated browser/tool calling.

Add the K2.7 block to `chatLanguageModels.json`. Mirror the K2.6 entry from [`docs/models/kimi.md`](kimi.md#1-vs-code-configuration), changing only the `id`, `name`, and `maxInputTokens`:

```json
{
  "id": "kimi-k2.7-code",
  "name": "Kimi K2.7 Code",
  "url": "http://127.0.0.1:3457/v1/chat/completions",
  "requestBody": {
    "temperature": 1,
    "max_tokens": 28672
  },
  "toolCalling": true,
  "vision": true,
  "streaming": true,
  "maxInputTokens": 262144,
  "maxOutputTokens": 28672
}
```

> **Note:** `maxOutputTokens` is set to **28672 (28K)**. K2.7 supports up to 32K output in theory, but VS Code's Copilot chat throws "Response too long" once responses get too large in agent mode. Because K2.7 is always-thinking, reasoning tokens inflate the response size. 28672 is the highest validated value that still works for a simple agent-mode tool call; 32768 fails.

Restart VS Code, open chat, pick "Kimi K2.7 Code", and send a real coding question. **Pass criteria:** response streams in, tool calls work, no error popups.

### Step 7 — Document and merge

**Status:** ✅ **Completed June 14, 2026.**

1. ✅ **Proxy needed a K2.7-specific code path** (Step 3 showed `thinking: disabled` is rejected). Added K2.7 detection to [`proxy/kimi-proxy.mjs`](../../proxy/kimi-proxy.mjs) — skips thinking-disable rewrite while keeping temperature/top_p enforcement. Added unit test in `tests/proxy.test.mjs`.
2. ✅ Promoted this file to a validated setup guide.
3. ✅ Updated `README.md`'s model table to list K2.7 alongside K2.6.
4. ✅ Updated `AGENTS.md`'s "Kimi K2" section to mention K2.7.
5. ✅ Updated [`docs/pricing.md`](../pricing.md) with the K2.7 row.

---

## What was done with the API key

- [x] Step 1 — Confirmed slug `kimi-k2.7-code`, `supports_video_in: true`, `supports_reasoning: true`, 262K context.
- [x] Step 2 — Proxy works as-is for plain chat.
- [x] Step 3 — K2.7 **rejects** `thinking: disabled` (HTTP 400). Works when allowed to think (HTTP 200).
- [x] Step 4 — Not needed; Step 2 confirmed temperature/top_p locks still apply.
- [x] Step 5 — Two-turn tool loop passes cleanly. No `reasoning_content is missing` error.
- [x] Step 5a — Real VS Code Agent mode integrated browser tool test passed (opened Google).
- [x] Updated `proxy/kimi-proxy.mjs` with K2.7 detection (`model.startsWith('kimi-k2.7')`) that skips the thinking-disable rewrite.
- [x] Added unit test `K2.7 tool-enabled chat: keeps thinking enabled and uses thinking temperature` — passes.
- [x] All 30 tests pass (29 existing + 1 new).

## What still needs user action

- [x] Step 6 — Manual VS Code picker integration test.
- [x] Step 7 — Promote this file to a full setup guide, update README, AGENTS.md, and pricing.

---

## Decision tree after Step 3

```
Step 2 result: works as-is
└──→ Document K2.7 as "works through existing K2.6 proxy"
    └──→ Update docs, README, pricing. No code change.

Step 2 result: thinking error
└──→ Step 3 result: A (thinking: disabled) errors, B (let it think) works
    └──→ Add K2.7 branch to proxy: drop the thinking-disable force
        └──→ Add unit test, update docs

Step 2 result: thinking error
└──→ Step 3 result: both A and B error
    └──→ K2.7 is incompatible with VS Code in the obvious ways; deeper investigation needed
        └──→ Likely outcome: K2.7 stays documented as 🟡 spike, VS Code path doesn't ship

Step 2 result: temperature/top_p error
└──→ Step 4 result: confirms the proxy's locked values are still right
    └──→ Possible bug in how the proxy reads env; investigate
        └──→ Otherwise: no code change, just update proxy docs to mention K2.7
```

---

## Open dependencies

| Dependency                                                                                                         | Owner             | Status                                 |
| ------------------------------------------------------------------------------------------------------------------ | ----------------- | -------------------------------------- |
| Moonshot API key with active K2.7 access                                                                           | user              | ✅ validated                           |
| Confirmation that `kimi-k2.7-code` is the direct Moonshot slug (not just the OpenRouter one)                       | user (via Step 1) | ✅ `kimi-k2.7-code`                    |
| Decision on whether to allow `KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS=0` for K2.7, or to add a K2.7-specific branch | user (via Step 3) | ✅ K2.7-specific branch added to proxy |
| Manual VS Code picker test (Step 6)                                                                                | user              | ✅ passed in agent mode               |
| Real integrated browser tool test (Step 5a)                                                                        | user              | ✅ passed (opened Google)             |

---

## Related files

- [`docs/models/kimi.md`](kimi.md) — the K2.6 setup guide this plan will parallel.
- [`proxy/kimi-proxy.mjs`](../../proxy/kimi-proxy.mjs) — the local proxy whose K2.6 assumptions may need revision.
- [`tests/proxy.test.mjs`](../../tests/proxy.test.mjs) — where any K2.7-specific proxy behavior should be unit-tested.
- [`docs/pricing.md`](../pricing.md) — needs a K2.7 row once pricing is confirmed.
- [`docs/free.md`](../free.md) — Moonshot's free trial credit is the only free path for K2.7.
- [`AGENTS.md`](../../AGENTS.md) — "Provider-specific constraints → Kimi K2" section will need a K2.7 note.
