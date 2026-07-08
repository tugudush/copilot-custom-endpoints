# VS Code 1.128 — Custom Endpoint `modelOptions` (sampling parameters)

> **Research date:** 2026-07-08 (VS Code 1.128 release day)
> **Primary sources:**
>
> - [VS Code 1.128 release notes — "Configure sampling parameters for custom endpoint models"](https://code.visualstudio.com/updates/v1_128)
> - [Add a custom endpoint model — VS Code Agent Customization docs](https://code.visualstudio.com/docs/agent-customization/language-models#_add-a-custom-endpoint-model)
>
> **Why this matters:** Our `chatLanguageModels.json` currently injects `temperature` and `top_p` via a `requestBody` JSON object on each model entry. VS Code 1.128 (released today) introduces a **first-party** `modelOptions` field on the model entry that explicitly sets these two sampling parameters at the framework layer — without needing to touch the upstream JSON shape. This doc examines whether migrating to `modelOptions` changes behavior, what the per-model picture looks like, and what is safe to do today vs. what needs an in-editor validation pass.

---

## TL;DR

- `modelOptions` is a **new, additive, first-party** sampling-parameter mechanism. It does **not** replace `requestBody`; the two coexist. Specifically: `modelOptions` only supports `temperature` and `top_p`. Everything else (`thinking`, `reasoning_split`, `max_tokens`, `enable_thinking`) **still has to live in `requestBody`**.
- The current setup is **fully functional**. `requestBody.temperature` and `requestBody.top_p` continue to be forwarded verbatim to the upstream provider. No regression, no urgent change needed.
- Migration is **stylistic** for our config: move the eight `temperature` / `top_p` entries from `requestBody` into `modelOptions`, leaving the three models that need other fields (`Kimi K2.7 Code`, `GLM 5V Turbo`, `MiniMax M3`) with a smaller `requestBody` containing only what `modelOptions` cannot express.
- **Qwen** is unchanged — the proxy on `:3458` owns sampling and `enable_thinking`; the model entry never had `requestBody` overrides.
- **Kimi** through the proxy on `:3457` gets only cosmetic benefit — the Kimi proxy already forces `temperature: 1` and `top_p: 0.95` regardless of what VS Code sends, so `modelOptions` is a comment, not a behavior change.
- **There is no `modelOptions.max_tokens` equivalent.** Kimi K2.7 Code's `max_tokens: 4096` cap must stay in `requestBody`. The same is true for any model where `max_tokens` is a real request-body parameter rather than the `maxOutputTokens` capability hint.
- The `modelOptions` path is **new in 1.128 and not yet end-to-end validated** in this repo against any provider. Migration should be paired with a real chat turn per affected provider to confirm parity with the current `requestBody` behavior. `requestBody.temperature = 1` was last validated against Kimi on 2026-07-03 (see `/memories/repo/custom-endpoint.md`).

---

## 1. What `modelOptions` is

From the [1.128 release notes](https://code.visualstudio.com/updates/v1_128) under **Chat → Configure sampling parameters for custom endpoint models**:

> You can configure `temperature` and `top_p` for each Custom Endpoint model, so requests work with providers that have strict parameter requirements.
>
> Add the `modelOptions` object to a model's JSON configuration:
>
> ```json
> {
>    ...
>    "models": [
>    {
>      "id": "<model-id>",
>      "modelOptions": {
>        "temperature": 1,
>        "top_p": null
>      },
>      ...
>    }
> }
> ```
>
> Set a property to a number to override the default value that VS Code sends. Set it to `null` to omit the parameter from requests and use the model server's default. These options apply to Chat Completions, Responses, and Messages-compatible endpoints.

### Key properties

| Aspect                            | Behavior                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Supported keys**                | `temperature`, `top_p` only.                                                                      |
| **Number value**                  | Overrides the value VS Code would send by default.                                                |
| **`null` value**                  | Removes the parameter from the outgoing request entirely — server default is used.                |
| **Scope**                         | Per-model, inside the `models[]` array of a `vendor: "customendpoint"` provider entry.            |
| **Endpoints**                     | Chat Completions, Responses, and Messages-compatible. Our setup only uses Chat Completions today. |
| **Relationship to `requestBody`** | Independent. Both fields are valid and forwarded. Do **not** set the same key in both — pick one. |

### Why `null` matters

`null` is **not** equivalent to `0` or "any other falsy value." It means "strip the key from the outgoing JSON body so the server picks its own default." For providers that reject _any_ `top_p` (e.g., some Anthropic-compatible surfaces that don't accept it on certain endpoints), this is the escape hatch that doesn't require falling back to a proxy.

---

## 2. Interaction with `requestBody`

Both fields are independent and additive:

- `requestBody` is passed through to the upstream JSON body. It can carry arbitrary keys (provider-specific extensions like `thinking`, `reasoning_split`, `enable_thinking`, `max_tokens`).
- `modelOptions` is set at the VS Code framework layer and is merged into the outgoing request above whatever `requestBody` contains — but `modelOptions` only knows two keys today.

The two fields do **not** conflict because they live in different layers. There is one cautionary case to flag:

> **If the same key appears in both** — e.g., `requestBody.temperature: 1` _and_ `modelOptions.temperature: 1` — the upstream will receive the field once. Which layer wins has not been publicly documented; in practice both produce `temperature: 1` in the request so the visible behavior is identical. The recommendation is **don't duplicate** to keep the config readable and to avoid subtle surprises if VS Code's merge order ever changes.

---

## 3. Current per-model inventory

Snapshot taken from the live `chatLanguageModels.json` on 2026-07-08 (matching the layout in [`docs/example-config.md`](../example-config.md)):

| Model                       | `url`                                           | Current `requestBody`                                                                      | What can move to `modelOptions`                               | What must remain in `requestBody`                                                                                                 |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Qwen 3.7 Max** (text)     | `http://127.0.0.1:3458/v1/chat/completions`     | _(none)_                                                                                   | Nothing to gain — proxy owns sampling + `enable_thinking`.    | _(none)_                                                                                                                          |
| **Qwen 3.7 Plus** (vision)  | `http://127.0.0.1:3458/v1/chat/completions`     | _(none)_                                                                                   | Same — proxy owns it.                                         | _(none)_                                                                                                                          |
| **Kimi K2.6** (vision)      | `http://127.0.0.1:3457/v1/chat/completions`     | `temperature: 1`                                                                           | `temperature: 1` (proxy also forces this; cosmetic move only) | _(none)_                                                                                                                          |
| **Kimi K2.7 Code** (vision) | `http://127.0.0.1:3457/v1/chat/completions`     | `temperature: 1`, `max_tokens: 4096`                                                       | `temperature: 1`                                              | **`max_tokens: 4096`** (no `modelOptions` equivalent; K2.7 is always-thinking, see [models/kimi.md](../models/kimi.md))           |
| **MiMo V2.5 Pro** (text)    | `http://127.0.0.1:3459/v1/chat/completions`     | `temperature: 1`, `top_p: 0.95`                                                            | Both                                                          | _(proxy injects `thinking: { type: "disabled" }` on tool turns; nothing else needed)_                                             |
| **MiMo V2.5** (vision)      | `http://127.0.0.1:3459/v1/chat/completions`     | `temperature: 1`, `top_p: 0.95`                                                            | Both                                                          | _(proxy manages `thinking`)_                                                                                                      |
| **GLM 5V Turbo** (vision)   | `https://api.z.ai/api/paas/v4/chat/completions` | `thinking: { type: "enabled" }`, `temperature: 1`, `top_p: 0.95`                           | `temperature: 1`, `top_p: 0.95`                               | **`thinking: { type: "enabled" }`** (Z.ai server-side `clear_thinking` defaults to `true`, see [models/glm.md](../models/glm.md)) |
| **MiniMax M3** (vision)     | `https://api.minimax.io/v1/chat/completions`    | `thinking: { type: "adaptive" }`, `reasoning_split: true`, `temperature: 1`, `top_p: 0.95` | `temperature: 1`, `top_p: 0.95`                               | **`thinking: { type: "adaptive" }`**, **`reasoning_split: true`** (see [models/minimax.md](../models/minimax.md))                 |

**Net change if migrated:** 8 `temperature` / `top_p` entries move out of `requestBody` into `modelOptions`; 3 entries (`Kimi K2.7 Code`, `GLM 5V Turbo`, `MiniMax M3`) retain a smaller `requestBody` for provider-specific keys; 5 entries (`Kimi K2.6`, both MiMo, both Qwen) end up with no `requestBody` at all.

---

## 4. Migration plan

### Suggested target config (illustrative — for one migrated entry)

Before:

```json
{
  "id": "MiniMax-M3",
  "name": "MiniMax M3 (vision)",
  "url": "https://api.minimax.io/v1/chat/completions",
  "toolCalling": true,
  "vision": true,
  "streaming": true,
  "maxInputTokens": 1048576,
  "maxOutputTokens": 131072,
  "requestBody": {
    "thinking": { "type": "adaptive" },
    "reasoning_split": true,
    "temperature": 1,
    "top_p": 0.95
  }
}
```

After:

```json
{
  "id": "MiniMax-M3",
  "name": "MiniMax M3 (vision)",
  "url": "https://api.minimax.io/v1/chat/completions",
  "modelOptions": {
    "temperature": 1,
    "top_p": 0.95
  },
  "toolCalling": true,
  "vision": true,
  "streaming": true,
  "maxInputTokens": 1048576,
  "maxOutputTokens": 131072,
  "requestBody": {
    "thinking": { "type": "adaptive" },
    "reasoning_split": true
  }
}
```

### Step-by-step

1. **Edit `chatLanguageModels.json`.** For each affected model, move `temperature` and `top_p` from `requestBody` to a new `modelOptions` object. Leave `requestBody` populated only with keys `modelOptions` cannot represent.
2. **Mirror to `docs/example-config.md`.** That file is the documented source of truth for copy-paste setups — its JSON snippets must match the live config exactly.
3. **Restart Copilot Chat** (or reload the window) so VS Code re-reads `chatLanguageModels.json`. The Custom Endpoint provider reloads on file change, but a window reload guarantees a clean state.
4. **Validation pass** — one chat turn per affected provider, ideally a turn that uses vision (for the vision-capable models) and a turn that uses tools (for the tool-calling models). Watch for any provider that returns 400 / rejects the request; if it does, restore from `git diff` and triage.
5. **Check `debug_log/<proxy>.ndjson`** for the proxy-routed models (Kimi, Qwen, MiMo) to confirm the request body shape matches what the proxy expects.

### Validation priority order

Most likely to require attention: **GLM 5V Turbo** (no proxy in front, `modelOptions` is the only thing standing between the framework and the upstream API). Then **MiniMax M3**, then **MiMo** (the MiMo proxy rewrites `thinking` only and is indifferent to `temperature`/`top_p`). Lowest risk: **Kimi** through the proxy (proxy forces values regardless).

---

## 5. Edge cases and gotchas

### 5.1 Kimi K2.7 Code — `max_tokens` must stay

The Kimi K2.7 proxy detects `kimi-k2.7*` model slugs and **skips** the thinking-disable rewrite (K2.7 is always-thinking — see [models/kimi.md](../models/kimi.md)). The upstream also requires `max_tokens ≤ 4096` for K2.7 Code in agent mode to avoid VS Code's "Response too long" error. **There is no `modelOptions.max_tokens` equivalent** — this value must stay in `requestBody`. Do **not** attempt to express it as `maxOutputTokens` (that is a VS Code capability hint, not an upstream request-body parameter).

### 5.2 Kimi K2.6 / Qwen 3.7 / MiMo V2.5 — proxies still win

The Qwen and MiMo proxies dynamically choose which fields to inject (`enable_thinking` for Qwen, `thinking` for MiMo) based on whether tools are present. The Kimi proxy forces `temperature: 1` and `top_p: 0.95` on every request, regardless of what VS Code sends. For these three providers, **`modelOptions` is a comment**: the visible request body is determined by the proxy, not by the `chatLanguageModels.json` entry. Migration is harmless but provides no behavioral benefit.

### 5.3 GLM — server-side `temperature` is hard-capped

Z.ai's PaaS endpoint (`api.z.ai/api/paas/v4`) **hard-caps `temperature` at 1.0 server-side** (validated — see [models/glm.md](../models/glm.md)). Sending `temperature > 1.0` results in an error. Migration must preserve `temperature: 1` (not `1.0` — both pass JSON parsing, but consistency with the existing config is preferable).

### 5.4 MiniMax — `thinking.disabled` is a hint, not an override

Per [models/minimax.md](../models/minimax.md), MiniMax M3 reasons regardless of the `thinking` setting. `thinking: { type: "disabled" }` is a soft hint that only changes the _response field layout_, not the model's internal behavior. `thinking: { type: "adaptive" }` lets the model decide. Migration of `thinking` is **not** in scope for this doc — it stays in `requestBody` for both options to control the field layout.

### 5.5 `top_p: null` vs `top_p: 0.95`

| Provider            | Recommended `top_p` | Reasoning                                        |
| ------------------- | ------------------- | ------------------------------------------------ |
| GLM 5V Turbo        | `0.95`              | Z.ai docs explicitly pair with `temperature: 1`. |
| MiniMax M3          | `0.95`              | Empirically validated.                           |
| MiMo V2.5 / Pro     | `0.95`              | Empirically validated.                           |
| Kimi K2.6 / K2.7    | n/a                 | Proxy forces `0.95`.                             |
| Qwen 3.7 Plus / Max | n/a                 | Proxy handles.                                   |

For models that don't have a strict requirement, `top_p: null` (omit and let the server default) is also acceptable. There is no documented advantage to either choice for our providers.

### 5.6 Setting the same key in both `requestBody` and `modelOptions`

**Don't.** The merge order is not publicly documented and the values are likely to remain equal in our setup (since `requestBody.*` was chosen to match what `modelOptions.*` should be), but it's a brittle layout. The convention going forward: **`modelOptions` for `temperature` / `top_p`, `requestBody` for everything else.**

---

## 6. Validation status

| Path                                                                                     | Last validated                   | Notes                                                                                                                                                                                                                 |
| ---------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `requestBody.temperature = 1` (Kimi direct → proxy → upstream)                           | 2026-07-03                       | Per `/memories/repo/custom-endpoint.md`.                                                                                                                                                                              |
| `requestBody.top_p = 0.95` (MiMo direct → proxy → upstream)                              | June 2026 (model rollout)        | Empirically validated during MiMo V2.5 onboarding.                                                                                                                                                                    |
| `requestBody.temperature: 1, top_p: 0.95` (GLM 5V Turbo direct)                          | June 2026                        | Empirically validated; hard-cap on `temperature` confirmed.                                                                                                                                                           |
| `requestBody.thinking.adaptive, reasoning_split, temperature, top_p` (MiniMax M3 direct) | June 2026                        | Empirically validated against `api.minimax.io`.                                                                                                                                                                       |
| `modelOptions.temperature`, `modelOptions.top_p` (any provider)                          | **Not yet validated in-editor.** | 1.128 release is the day of this doc; the new framework-layer field has not been tested with any of our providers. Migration should include a real chat turn per affected provider to confirm parity before shipping. |

---

## 7. Recommendation

> **No urgent change.** The existing config is fully functional on VS Code 1.128 and earlier.
>
> **Plan a small, low-risk migration** when convenient:
>
> - Move `temperature` / `top_p` from `requestBody` into `modelOptions` on the 4 affected models (K2.6, K2.7 Code, MiMo ×2, GLM 5V Turbo, MiniMax M3).
> - Keep `requestBody` for keys `modelOptions` cannot express: `thinking`, `reasoning_split`, `max_tokens`.
> - Mirror the change in `docs/example-config.md`.
> - Validate with one chat turn per affected provider on VS Code 1.128 before closing the migration.
>
> The Kimi proxy forces `temperature` and `top_p` regardless, the Qwen and MiMo proxies manage `thinking` independently of `temperature` / `top_p`, and the GLM and MiniMax direct setups have well-tested `requestBody` overrides that the migration merely reshapes without changing the wire content.

---

## Appendix A — Raw release note excerpt

> **Configure sampling parameters for custom endpoint models**
>
> You can configure `temperature` and `top_p` for each [Custom Endpoint model](https://code.visualstudio.com/docs/agent-customization/language-models#_add-a-custom-endpoint-model), so requests work with providers that have strict parameter requirements.
>
> Add the `modelOptions` object to a model's JSON configuration:
>
> ```json
> {
>    ...
>    "models": [
>    {
>      "id": "<model-id>",
>      "modelOptions": {
>        "temperature": 1,
>        "top_p": null
>      },
>      ...
>    }
> }
> ```
>
> Set a property to a number to override the default value that VS Code sends. Set it to `null` to omit the parameter from requests and use the model server's default. These options apply to Chat Completions, Responses, and Messages-compatible endpoints.

Source: [code.visualstudio.com/updates/v1_128](https://code.visualstudio.com/updates/v1_128), July 8, 2026.
