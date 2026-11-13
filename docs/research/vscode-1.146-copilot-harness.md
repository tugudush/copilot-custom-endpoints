# VS Code 1.146: Copilot Harness and Custom Endpoints

> **Research date:** 2026-11-13  
> **Scope:** Repository custom endpoints and proxies in the VS Code Copilot harness.  
> **Status:** Phase 1 complete — request baselines captured on both harnesses with a loopback mock. Provider-side compatibility (Phase 3) is **not** validated: no real provider endpoint was contacted.

## Summary

The move to the Copilot harness warrants revalidation, but it does not by itself prove that any proxy can be removed. The most important questions are whether the current harness forwards the provider-specific fields in our examples and whether it preserves reasoning across real tool loops.

- VS Code 1.146 deprecates the Local harness; removal is planned for February 2027. The Copilot harness has been the default for new sessions since 1.143.
- Copilot harness BYOK requires `chat.agentHost.byokModels.enabled`. It is enabled in the inspected user's VS Code settings; the feature is documented as experimental.
- The current VS Code documentation describes `modelOptions` for sampling and dedicated model properties for reasoning, but does not document arbitrary `requestBody` passthrough. Measured on VS Code 1.146: `modelOptions` is forwarded, `requestBody` is **silently dropped** on both harnesses. See [§3](#measured-request-baseline-third-pass-requestbody-vs-modeloptions-2026-11-13).
- VS Code merged a BYOK Chat Completions reasoning replay change gated on the model's `thinking` capability. This is a reason to retest the guides' general claims that VS Code cannot preserve `reasoning_content`, not proof that all models or harness routes now work.
- The repository's utility-model instructions overstate the requirement: with a Copilot token, the documented default is to use Copilot utility models.
- Qwen's actual tool detection differs from the duplicate logic used in its integration tests. A tools array without `tool_choice` or a prior tool-role message is classified as plain chat by the actual proxy.

## Environment and evidence

| Item                                      | Observed                                                                            |
| ----------------------------------------- | ----------------------------------------------------------------------------------- |
| VS Code                                   | 1.146.0, commit `69047191fc427f2f92828279aae1d90d8eeda7ab`                          |
| Bundled Copilot extension                 | 0.74.0                                                                              |
| Separately installed Copilot CLI          | 1.0.109; this is not evidence of the version used by every VS Code session          |
| Agent Host BYOK setting                   | `chat.agentHost.byokModels.enabled: true` in the inspected user settings            |
| Provider validation in this investigation | **None** — traffic went only to a loopback mock; no provider endpoint was contacted |

The setting observation is specific to the inspected installation and profile. Other profiles and users may need to enable it. No API keys, endpoint credentials, prompts, or conversation contents were inspected or recorded.

### Measured request baseline (Copilot harness, 2026-11-13)

First real observation of what VS Code 1.146 sends, captured by the loopback mock ([tools/mock-endpoint.mjs](../../tools/mock-endpoint.mjs)) in an isolated profile. Model entry: `customendpoint`, id `qwen3.8-max`, URL `http://127.0.0.1:3458/v1/chat/completions` (the local Qwen proxy, upstream redirected to the mock), no `requestBody`, no `modelOptions`.

| Observation (agent mode)       | Turn 1                                                                  | Turn 2 (after tool result)            |
| ------------------------------ | ----------------------------------------------------------------------- | ------------------------------------- |
| Top-level keys                 | `messages, model, n, stream, stream_options, temperature, tools, top_p` | same, plus `enable_thinking`          |
| `temperature` / `top_p`        | `0.1` / `1`                                                             | `0.1` / `1`                           |
| `tools` / `tool_choice`        | 128 tools / **absent**                                                  | 128 tools / absent                    |
| `enable_thinking` (post-proxy) | absent (removed)                                                        | `false` (injected)                    |
| Message roles                  | `system, user, user`                                                    | `system, user, user, assistant, tool` |
| Assistant tool-call reasoning  | —                                                                       | absent (`reasoning_content` not sent) |

Confirmed findings, scoped to this configuration:

1. **The first-turn tools gap is real on the Copilot harness.** The harness sends 128 tools with no `tool_choice`, so the proxy's history-based detection classifies turn 1 as plain chat and leaves thinking at the provider default.
2. The proxy suppresses thinking from turn 2 onward, once a `tool`-role message exists.
3. Synthetic SSE tool calls work end-to-end: the harness executed the mocked tool and issued a follow-up request, so the mock is a valid harness probe.
4. VS Code supplies `temperature`/`top_p` itself (0.1 / 1 here) and sends `n` and `stream_options`; none of these came from configuration.

Not yet measured: `requestBody` and `modelOptions` passthrough (this entry had neither), the `thinking: true` metadata variants, the direct-to-mock models, and any Local-harness session.

### Measured request baseline, second pass (2026-11-13)

Additional turns were run in the same isolated profile. Three distinct configurations were exercised; one intended configuration produced no request at all.

| #   | Configuration reported by the user                                                                                                         | Configuration visible on the wire                                                                                                           | Result                                  |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| A   | Plain direct mock model (no `requestBody`)                                                                                                 | `model=qwen3.8-max`, 128 tools, no `tool_choice`                                                                                            | Both turns arrived; tool loop completed |
| B   | Direct mock model with `thinking: true` + `supportsReasoningEffort: ["low","medium","high"]` + `reasoningEffortFormat: "chat-completions"` | `model=qwen3.8-max-thinking`, 98 tools, no `tool_choice`                                                                                    | Reached the mock                        |
| C   | Local harness via the proxy                                                                                                                | `model=qwen3.8-max`, 94 tools from the Local tool vocabulary (`create_directory`, `create_file`, `edit_notebook_file`, …), no `tool_choice` | Three turns; proxy rewrites visible     |
| D   | Direct mock model with `requestBody` + `modelOptions`                                                                                      | **No request captured**                                                                                                                     | **Unmeasured**                          |

Field-level results:

| Field                                   | A (direct, plain) | B (thinking metadata) | C (Local harness, proxy)              |
| --------------------------------------- | ----------------- | --------------------- | ------------------------------------- |
| `temperature`                           | `0.1`             | **absent**            | `0.1`                                 |
| `top_p`                                 | `1`               | `1`                   | `1`                                   |
| `reasoning_effort`                      | absent            | **`"medium"`**        | absent                                |
| `max_completion_tokens`                 | absent            | **`131072`**          | absent                                |
| provider `thinking` object              | absent            | absent                | absent                                |
| `enable_thinking`                       | absent            | absent                | absent on turn 1, `false` from turn 2 |
| assistant tool-call `reasoning_content` | absent            | absent                | absent                                |

Findings, scoped to these runs:

1. **Both harnesses exhibit the first-turn tools gap.** The Local harness also sends its full tool set (94 tools) with no `tool_choice`, so the proxy again treats turn 1 as plain chat and only suppresses from the first tool-role message onward.
2. **`supportsReasoningEffort` + `reasoningEffortFormat` do reach the wire.** VS Code sent a top-level `reasoning_effort: "medium"` for the thinking-capable entry — a supported way to steer effort without `requestBody`.
3. **`maxOutputTokens` is forwarded as `max_completion_tokens`** for that same entry, so it is not a pure UI hint. Treat large output limits as wire-visible.
4. `thinking: true` did **not** create a provider `thinking` object; it stayed metadata, as expected.
5. `reasoning_content` was absent from assistant tool-call messages on **both** harnesses. The replay change is therefore not observable in this configuration.
6. VS Code omits `temperature` for the thinking-capable entry while sending `0.1` elsewhere — sampling defaults are not uniform across entries.

**Still unmeasured:** `requestBody` passthrough and `modelOptions`. Configuration D produced no captured request, so neither field's forwarding is established. A retry must confirm the selected model is `Mock Qwen direct (requestBody + modelOptions)` — the wire `model` value should be `qwen3.8-max-requestbody`.

### Measured request baseline, third pass: `requestBody` vs `modelOptions` (2026-11-13)

Retried configuration D on both harnesses. Model entry as declared:

```json
{
  "id": "qwen3.8-max-requestbody",
  "url": "http://127.0.0.1:3490/v1/chat/completions",
  "maxOutputTokens": 131072,
  "modelOptions": { "temperature": 1, "top_p": 0.95 },
  "requestBody": {
    "enable_thinking": false,
    "reasoning_effort": "low",
    "max_tokens": 8192
  }
}
```

Four requests captured (two per harness), all with `model=qwen3.8-max-requestbody`:

| Field                   | Declared in         | Copilot harness | Local harness |
| ----------------------- | ------------------- | --------------- | ------------- |
| `temperature`           | `modelOptions`      | **`1`**         | **`1`**       |
| `top_p`                 | `modelOptions`      | **`0.95`**      | **`0.95`**    |
| `enable_thinking`       | `requestBody`       | **absent**      | **absent**    |
| `reasoning_effort`      | `requestBody`       | **absent**      | **absent**    |
| `max_tokens`            | `requestBody`       | **absent**      | **absent**    |
| `max_completion_tokens` | (`maxOutputTokens`) | absent          | absent        |
| `tools` / `tool_choice` | —                   | 100 / absent    | 85 / absent   |

Conclusion, identical on both harnesses: **`modelOptions` is forwarded; `requestBody` is silently dropped.**

This is the highest-impact finding in this record. Every model guide that depends on `requestBody` is documented against a mechanism that does not reach the provider on VS Code 1.146 in either harness. `maxOutputTokens` being forwarded as `max_completion_tokens` is also entry-dependent (observed on the `thinking: true` entry, not here), so it is not a substitute for `max_tokens`.

### Classification of current configuration guidance (T004)

| Record                                              | Relies on                                                       | Status after measurement                                                                                                             |
| --------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [qwen.md](../../docs/models/qwen.md) direct snippet | `requestBody.enable_thinking: false`                            | **Contradicted** — direct route would run with thinking on; the proxy remains the only working suppression path                      |
| [mimo.md](../../docs/models/mimo.md) direct config  | `requestBody.thinking: { type: "disabled" }`                    | **Contradicted** — direct route keeps provider default thinking                                                                      |
| [glm.md](../../docs/models/glm.md)                  | `requestBody.thinking` / `reasoning_effort` / `temperature`     | **Contradicted for the `requestBody` keys**; sampling should move to `modelOptions`; effort should move to `supportsReasoningEffort` |
| [minimax.md](../../docs/models/minimax.md)          | `requestBody.thinking` / `reasoning_split` / `reasoning_effort` | **Contradicted** — reasoning split and effort cannot be set this way                                                                 |
| [kimi.md](../../docs/models/kimi.md)                | `requestBody.max_tokens` / optional `reasoning_effort`          | **Contradicted** — `max_tokens` and effort are not forwarded; the proxy's enforced sampling still applies                            |

Supported alternatives observed on the wire:

- `modelOptions.temperature` / `modelOptions.top_p` — verified on both harnesses.
- `supportsReasoningEffort` + `reasoningEffortFormat: "chat-completions"` — produced a top-level `reasoning_effort` on the `thinking: true` entry.
- `thinking: true` — metadata only; does not add a provider `thinking` object.
- `maxOutputTokens` — forwarded as `max_completion_tokens` on the reasoning entry only; verify per entry.

Any provider that needs a custom object (`thinking`, `reasoning_split`, `enable_thinking`, `max_tokens`) must get it from a proxy or an extension, not from `requestBody`.

## 1. Harness transition

The Copilot harness uses the Copilot SDK and Agent Host. A harness coordinates context and tools; selecting a model or custom endpoint does not itself select a harness. The legacy Local harness remains available during the transition, but is functionally frozen and scheduled for removal in February 2027. See the [VS Code 1.146 release notes](https://code.visualstudio.com/updates/v1_146#_copilot-harness-and-deprecation-of-the-local-harness) and [migration guide](https://code.visualstudio.com/docs/agents/run/move-to-copilot).

For the Copilot harness, enable `chat.agentHost.byokModels.enabled` and configure the provider in the Language Models editor. BYOK availability, tool access, extension support, and authentication can differ between harnesses. The [harness guide](https://code.visualstudio.com/docs/agents/run/agent-harnesses#_copilot) describes this BYOK route as experimental.

**Recommendation:** Add this opt-in and the Local-harness deadline to setup guidance after testing in a new Copilot session. Test extension-provided DeepSeek separately: availability in the Agents window and extension execution are not automatically established by custom-endpoint support.

## 2. Request configuration is the highest-priority check

Current [VS Code custom-endpoint documentation](https://code.visualstudio.com/docs/agent-customization/language-models#_custom-endpoint-configuration-reference) describes:

- `modelOptions.temperature` and `modelOptions.top_p` for sampling. The [merged implementation](https://github.com/microsoft/vscode/pull/323532) supports `null` to omit a sampling parameter; explicit per-request options can take precedence.
- Model metadata such as `thinking: true`, `supportsReasoningEffort`, and `reasoningEffortFormat`. These describe model capabilities and supported effort controls; the top-level model metadata field `thinking: true` is **not** the provider request-body object `thinking: { "type": ... }`.
- `maxInputTokens`, `maxOutputTokens`, and optionally `contextWindow` as model capability settings.

The current official configuration reference does **not** list arbitrary `requestBody` passthrough. [microsoft/vscode#321372](https://github.com/microsoft/vscode/issues/321372) tracks additional request-body parameters, and [microsoft/vscode#329215](https://github.com/microsoft/vscode/pull/329215) remains an open implementation candidate for `extraBody` as of this research date. Do **not** assume the proposed `extraBody` has shipped.

This does not prove that `requestBody` is ignored in every route or installation. It means its forwarding is not established by the current official reference and needs verification. In particular:

| Setup                            | Field or behavior to verify                                                                                                               |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| [Kimi](../models/kimi.md)        | Whether the documented `max_tokens: 8192` and optional `reasoning_effort` reach the upstream request; the proxy itself enforces sampling. |
| [Qwen direct](../models/qwen.md) | Whether `enable_thinking: false` is actually sent; the proxy injects it only under its own tool-detection conditions.                     |
| [MiMo direct](../models/mimo.md) | Whether the static `thinking: { type: "disabled" }` is sent; the proxy provides a history-aware fallback.                                 |
| [MiniMax](../models/minimax.md)  | Whether `thinking`, `reasoning_split`, and `reasoning_effort` are sent, or whether provider defaults give equivalent behavior.            |
| [GLM](../models/glm.md)          | Whether `thinking`, `reasoning_effort`, and sampling settings reach the provider as intended.                                             |

The earlier [1.128 research note](vscode-1.128-modeloptions.md) states that `requestBody` is forwarded and interoperates with `modelOptions`. Treat that statement as unverified for the current harness, not as a guarantee. Do not remove provider-specific settings or switch working configurations on the strength of the documentation mismatch alone.

## 3. Reasoning replay and proxy implications

[microsoft/vscode#318809](https://github.com/microsoft/vscode/pull/318809) merged support in the BYOK Chat Completions path for reading and replaying `reasoning_content` and `reasoning`, gated on the model's thinking capability. Its description names DeepSeek, Kimi, MiniMax, and OpenRouter. It does not by itself establish compatibility with every provider, current Copilot harness route, model, or streaming/tool-history shape.

- **Kimi K3.1 Pro:** The [proxy](../../proxy/kimi-proxy.mjs) forces sampling, removes a provider request-body `thinking` object for K3, and keeps reasoning enabled. Current `modelOptions` and replay support make a direct-path retest worthwhile, but neither proves that the direct route satisfies all provider requirements. Keep the proxy until validated.
- **Qwen:** The [proxy](../../proxy/qwen-proxy.mjs) suppresses thinking when it detects tool activity. Test whether thinking and multi-step tool loops work with the current harness before relaxing this behavior.
- **MiMo:** The [rewrite](../../lib/mimo-rewrite.mjs) already preserves thinking when assistant tool-call history contains nonempty `reasoning_content`, and disables it only for incomplete tool history. Verify real replay with the current harness before removing that fallback.
- **MiniMax and GLM:** Retest direct tool loops and reasoning visibility. GLM's documented server-side history handling is a separate provider behavior; do not infer its behavior from the VS Code replay fix.

Use the VS Code model capability `thinking: true` when testing a reasoning-capable custom endpoint, after checking the relevant model and provider. This is metadata for VS Code, not an instruction to send a K2-style `thinking` object to K3.

## 4. Utility models and context limits

The [README](../../README.md#4-configure-the-utility-small-model) says a utility small model must always be set and links utility flows to token counting and prompt truncation. Current [VS Code documentation](https://code.visualstudio.com/docs/agent-customization/language-models#_change-the-model-for-utility-tasks) instead says:

- `chat.utilityModel` and `chat.utilitySmallModel` default to GitHub Copilot's built-in utility models when a Copilot token is available.
- Without a Copilot token, configure both utility settings or select **Main Agent Model** in `chat.byokUtilityModelDefault` to enable the described utility features.
- Documented examples include titles, summaries, intent detection, commit messages, and pull request descriptions. The documentation does not establish that these settings control token counting or prompt truncation.

Setup guidance should be corrected after confirming the applicable settings in the target release; do not assume the older `chat.lm.utilitySmallModel` identifier is equivalent without checking migration behavior.

The same [model configuration reference](https://code.visualstudio.com/docs/agent-customization/language-models#_model-configuration-reference) says `maxInputTokens + maxOutputTokens` must not exceed the model's full context window. Several current model snippets describe a 1M context while assigning roughly 1M input **plus** 131072 output. Recheck each provider's exact limits and correct the capability values once confirmed; the discrepancy is a configuration risk, not a measured runtime failure.

### Context and output limits, reconciled (T014, 2026-11-13)

The configuration reference states the rule directly: "The sum of `maxInputTokens` and `maxOutputTokens` must not exceed the model's context window. VS Code uses the sum of these two values as the model's total context window… Typically, you set `maxInputTokens` to the model's context window size minus `maxOutputTokens`." It also documents an optional `contextWindow` field, which lets VS Code derive `maxInputTokens = contextWindow - maxOutputTokens`.

Provider limits, from the provider's own documentation, plus the values now used in every snippet:

| Model                      | Context window                      | Max output                                | `maxOutputTokens` | `maxInputTokens` | Source                                                                                                                                                                                                         |
| -------------------------- | ----------------------------------- | ----------------------------------------- | ----------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kimi-k3.1-pro`            | 1,048,576 (input + output combined) | 131072 default, 1048576 technical maximum | 131072            | 917504           | [Kimi platform docs](https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart), [Bedrock model card](https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-moonshot-ai-kimi-k3-1-highspeed.html) |
| `qwen3.8-max`              | 1,000,000                           | 131072 (DashScope input cap: 991000)      | 131072            | 868928           | Alibaba Cloud Model Studio model list                                                                                                                                                                          |
| `mimo-v2.6-*`              | 1,048,576                           | 131072 (128K)                             | 131072            | 917504           | [Xiaomi MiMo model docs](https://mimo.mi.com/docs/quick-start/summary/model)                                                                                                                                   |
| `MiniMax-M3.1-Flash`       | 1,000,000                           | 131072 recommended, 524288 maximum        | 131072            | 868928           | [MiniMax text-generation docs](https://platform.minimax.io/docs/guides/text-generation)                                                                                                                        |
| `glm-5.3`, `glm-5.3-flash` | 1,048,576                           | 131072 (128K)                             | 131072            | 917504           | [Z.ai GLM-5.3 migration guide](https://docs.z.ai/guides/overview/migrate-to-glm-new)                                                                                                                           |

Confirming sources: Z.ai's migration guide states "maximum context 1M, maximum output 128K"; MiniMax's model table lists a 1,000,000-token context window for `MiniMax-M3.1-Flash`; DashScope's model list gives `qwen3.8-max` a 1,000,000-token context with a 991,000-token input cap and 131,072-token output cap; Kimi's docs describe the K3.1 Pro window as input plus output combined; MiMo documents a 1M window with 128K maximum generation.

Consequences and trade-offs:

- A declared total equal to the advertised window is the conservative reading. Where a provider quotes an input cap and an output cap separately (Qwen: 991,000 input / 131,072 output), the true simultaneous budget is not documented, so the snippet declares the advertised 1,000,000-token window instead of the 1,122,072-token sum. VS Code then compacts slightly earlier than DashScope's raw input cap; it cannot overstate the window and provoke provider-side `400` errors at the extreme end.
- `maxOutputTokens` stays at each provider's documented default rather than its technical maximum (Kimi 1048576, MiniMax 524288), because output tokens are wire-visible on reasoning entries and a larger output budget would shrink the usable input window.
- Model facts themselves did not change, so [README.md](../../README.md), [docs/pricing.md](../pricing.md), and [docs/benchmarks.md](../benchmarks.md) needed no edit beyond the existing "1M" context labels.
- Whether VS Code enforces the invariant or merely displays it is unmeasured; the corrected values make the question moot for these examples.

## 5. Qwen tool detection and tests

The actual [Qwen proxy](../../proxy/qwen-proxy.mjs) marks a request as having tool activity when history contains a `tool`-role message or `tool_choice` is present and not `"none"` or `null`. A nonempty `tools` array alone does not satisfy this condition. Thus an initial tool-capable request with `tools` but no `tool_choice` keeps the default thinking mode. Whether this leads to a provider error depends on the subsequent model response and history; the behavior itself follows from the code.

The [Qwen integration tests](../../tests/proxy.test.mjs) construct a separate rewrite that detects a nonempty `tools` array instead of invoking the production Qwen rewrite. Consequently, those tests do not establish the behavior of the actual proxy for that case. The Kimi integration tests also duplicate their rewrite logic, and the MiMo rewrite has separate direct unit tests.

**Recommendation:** Add tests exercising the actual proxy implementations, including tools with omitted `tool_choice`, explicit `"none"`, tool-result history, and multi-turn reasoning history. Decide the desired first-turn Qwen behavior based on actual harness requests and provider requirements before changing it.

## 6. Suggested validation before changing defaults

1. Start a **new Copilot harness** session with the configured provider and confirm model visibility and streaming plain chat.
2. Compare sanitized outbound request shapes against the intended model configuration: sampling, token limits, thinking/effort controls, tools, and message roles. Verify `requestBody` independently for direct and proxy-backed routes.
3. Run at least one multi-step tool loop per provider, including a follow-up tool result. Check whether assistant tool-call history retains the provider-required reasoning and whether the model completes without HTTP 400.
4. For Kimi, Qwen, and MiMo, compare current proxy behavior with a direct route only after checking provider-specific requirements. For vision-capable models, separately test image input.
5. Test a long conversation and context compaction; verify context settings against the provider's actual limits.
6. Record the VS Code version, harness, model ID, route, configuration properties, outcomes, and any failures in the appropriate model record. Do not record credentials, workspace identifiers, full prompts, reasoning text, or unredacted request/response bodies.

No endpoint, proxy, or user configuration was changed during this investigation. The above checks may incur provider charges and require a working user-supplied key.

## 7. Temporary artifacts to delete when the work is finished

Phase 1 created local scratch state outside the repository. None of it is needed once the plan's remaining phases are done, and everything is recreateable.

| Artifact                             | Location                               | Size (2026-11-13) | State                                                                                                                                           |
| ------------------------------------ | -------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Isolated VS Code profile             | `%TEMP%\copilot-harness-baseline`      | ~477 MB           | **Folder retained by request.** The window was closed, no processes remain, and `data\Backups` is empty, so deleting it loses no unsaved edits. |
| Sanitized mock captures              | `debug_log/mock-endpoint.ndjson`       | small             | Git-ignored. Raw evidence behind the measurement tables above; keep until the docs are committed, then removable with `npm run clean:logs`.     |
| Sanitized proxy captures             | `debug_log/qwen-proxy-baseline.ndjson` | small             | Git-ignored; same handling.                                                                                                                     |
| Mock server and Qwen proxy processes | `:3490`, `:3458`                       | —                 | **Stopped.** Both ports verified closed.                                                                                                        |

The profile was created with `code --user-data-dir="%TEMP%\copilot-harness-baseline\data"` and holds a scratch `chatLanguageModels.json` plus `settings.json` (`chat.agentHost.byokModels.enabled: true`). It is isolated from the user's real VS Code profile, which was never modified.

**Deletion checklist (run only after the remaining phases are complete):**

1. Confirm no `Code.exe` process references the profile: `Get-CimInstance Win32_Process -Filter "Name='Code.exe'" | Where-Object { $_.CommandLine -like '*copilot-harness-baseline*' }`
2. Remove the folder: `Remove-Item -Recurse -Force "$env:TEMP\copilot-harness-baseline"`
3. Remove captures: `npm run clean:logs`

## 8. Status summary by route and harness (2026-11-13)

Phase 5's gap report, updated after the Phase 3 live runs. "Verified" means observed in this investigation; the mock-only rows below describe what Phase 2 and Phase 4 established before real provider traffic, and the last two rows record what Phase 3 added.

| Evidence                                                                                     | Copilot harness                                                                     | Local harness                                     |
| -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| Model visibility, streaming reply                                                            | ✅ Verified 2026-11-13                                                              | ✅ Verified 2026-11-13                            |
| Mocked tool call executed, follow-up request observed                                        | ✅ Verified 2026-11-13                                                              | ✅ Verified 2026-11-13                            |
| `modelOptions.temperature` / `top_p` forwarded                                               | ✅ Verified                                                                         | ✅ Verified                                       |
| `requestBody` (`enable_thinking`, `reasoning_effort`, `max_tokens`)                          | ❌ Silently dropped — do not use                                                    | ❌ Silently dropped — do not use                  |
| `supportsReasoningEffort` + `reasoningEffortFormat: "chat-completions"` → `reasoning_effort` | ✅ Verified on the `thinking: true` entry                                           | ⚠️ Not measured on that entry                     |
| `maxOutputTokens` → `max_completion_tokens`                                                  | ⚠️ Entry-dependent — observed only on the reasoning entry                           | ⚠️ Same limitation                                |
| `thinking: true` creates a provider `thinking` object                                        | ❌ No — metadata only                                                               | ❌ No — metadata only                             |
| `reasoning_content` replayed in assistant tool-call history                                  | ⚠️ Only on the Kimi entry; absent for Qwen / MiMo / MiniMax / GLM                   | ⚠️ Same — Kimi only                               |
| First-turn `tools` array without `tool_choice`                                               | ✅ Confirmed (128 tools)                                                            | ✅ Confirmed (94 tools in Phase 2, 57 in Phase 3) |
| Enforced context/output limit at the provider                                                | ⚠️ Unmeasured — limits are configuration, not validated                             | ⚠️ Unmeasured                                     |
| Vision input, long-conversation compaction                                                   | ⚠️ Not tested                                                                       | ⚠️ Not tested                                     |
| Real provider routes (Kimi, Qwen, MiMo, MiniMax, GLM)                                        | ✅ Live-tested 2026-11-13, see [§9](#9-phase-3-live-provider-validation-2026-11-13) | ✅ Live-tested 2026-11-13, see §9                 |
| Extension-provided DeepSeek (Agents window / editor)                                         | ⛔ Not tested                                                                       | ⛔ Not tested                                     |

Automated checks after the Phase 2 and Phase 4 work: `npm test` 49/49 passing, `npm run lint` clean, `npx prettier --check .` clean.

Cleanup state at the end of Phase 5 work: no test server holds a port (`:3457`–`:3459`, `:3490` all free) and no `Code.exe` references the isolated profile. Two idle `node` processes from the 13:39 baseline window (`proxy/qwen-proxy.mjs`, `proxy/kimi-proxy.mjs`) were left running untouched because they belong to the user's environment, hold no listening socket, and may be deliberately paused rather than orphaned. `debug_log/` still holds the sanitized captures listed above until the docs are committed.

## 9. Phase 3 live provider validation (2026-11-13)

Real provider traffic, one isolated profile, loopback-only relays. All five documented custom-endpoint routes — Kimi, Qwen, MiMo, MiniMax, GLM — completed a full plain-chat plus multi-step tool loop on **both** harnesses: on the Copilot harness first, then repeated on the Local harness in the same session. The Local run is recorded in [its own subsection](#local-harness-run-2026-11-13-same-session); everything before it is Copilot harness unless stated otherwise.

### How the traffic was routed, and why

VS Code 1.146 does **not** send a literal `apiKey` from `chatLanguageModels.json`. A diagnostic endpoint on `:3470` received `Authorization: Bearer` with an empty token (header value literally `Bearer`, no other key header present) for an entry whose `apiKey` was a real provider key. Setting the key through **Chat: Manage Language Models → Update API Key** (SecretStorage) is the supported path, as the README already says; pasting a key into the JSON file is not.

To keep credentials out of VS Code storage during the test, keys were injected by temporary local relays in `%TEMP%` that forward to the real provider with `Authorization: Bearer <key>` and rewrite nothing else:

```
VS Code -> production proxy (:3457/:3458/:3459) -> auth relay (:3462/:3463/:3464) -> provider
VS Code -> auth relay (:3460 MiniMax, :3461 GLM)                                -> provider
```

The production Kimi, Qwen, and MiMo proxies therefore still applied their normal rewrites; the relay only supplied the credential. Relay summaries record the sanitized request shape after those rewrites, which is what the provider receives. All relays, the isolated profile, and the scratch workspace were deleted after the run; only the sanitized NDJSON captures in `debug_log/phase3-*.ndjson` were kept.

### Results per route

| Route                                  | Model                          | Turn 1 (plain, 128 tools) | Tool turn                 | Provider status |
| -------------------------------------- | ------------------------------ | ------------------------- | ------------------------- | --------------- |
| Kimi proxy `:3457` → relay → Moonshot  | `kimi-k3.1-pro`                | 200                       | 200, tool result accepted | ✅ Pass         |
| Qwen proxy `:3458` → relay → DashScope | `qwen3.8-max`                  | 200                       | 200, tool result accepted | ✅ Pass         |
| MiMo proxy `:3459` → relay → Xiaomi    | `mimo-v2.6-pro`                | 200                       | 200, tool result accepted | ✅ Pass         |
| Relay `:3460` → MiniMax                | `MiniMax-M3.1-Flash`           | 200                       | 200, tool result accepted | ✅ Pass         |
| Relay `:3461` → Z.ai                   | `glm-5.3-flash`, `glm-5.3`     | 200                       | 200, tool result accepted | ✅ Pass         |
| **Local harness** — all five routes    | Kimi, Qwen, MiMo, MiniMax, GLM | 200                       | 200, tool result accepted | ✅ Pass         |
| Local harness, GLM 5.3 (text model)    | —                              | not run                   | —                         | ⚠️ Flash only   |

Each passing route: the model appeared in the picker, streamed a reply, called a tool, and completed a follow-up turn after the tool result. A Kimi tool loop run also produced the intermediate `system/user/user/assistant/user` turn the harness inserts.

### What each request actually contained

| Route                            | `reasoning_effort`                        | `max_completion_tokens` | Proxy-specific field                                      | Replayed assistant `reasoning_content`     |
| -------------------------------- | ----------------------------------------- | ----------------------- | --------------------------------------------------------- | ------------------------------------------ |
| Kimi                             | `"high"` (from `supportsReasoningEffort`) | 131072                  | none (`thinking` object absent, correct for K3)           | **Yes — the tool-call message carried it** |
| Qwen                             | absent (no effort metadata on this entry) | absent                  | `enable_thinking: false` **only** on the tool turn        | No                                         |
| MiMo                             | absent                                    | absent                  | `thinking: {"type":"disabled"}` **only** on the tool turn | No                                         |
| MiniMax                          | `"medium"`                                | 131072                  | none                                                      | No                                         |
| GLM (`glm-5.3-flash`, `glm-5.3`) | `"low"`                                   | 131072                  | none — **no `thinking` object is sent**                   | No                                         |

Findings, scoped to these runs:

1. **Reasoning replay works for Kimi.** The third Kimi request contained an assistant message with `tool_calls` _and_ non-empty `reasoning_content`. The earlier claim that VS Code cannot preserve `reasoning_content` across tool turns is wrong for a `thinking: true` entry on this harness. This is the first direct evidence for the replay change in [microsoft/vscode#318809](https://github.com/microsoft/vscode/pull/318809) on a custom endpoint.
2. **Replay is not automatic for every `thinking: true` entry.** MiniMax also declares `thinking: true` and received `max_completion_tokens`, yet its follow-up carried no `reasoning_content`, and Qwen/MiMo (no `thinking` metadata) replayed none either. Per-provider replay is therefore still an open question; only Kimi is proven.
3. **The Qwen first-turn gap did not cause a failure.** Turn 1 went out with 128 tools, no `tool_choice`, and no `enable_thinking` (thinking at provider default) and returned 200; the proxy then injected `enable_thinking: false` for the tool turn. The limitation documented in [qwen.md](../models/qwen.md) is real but benign on `qwen3.8-max`.
4. **The MiMo fallback engaged as designed.** Turn 1 sent no `thinking` object; the tool turn received `thinking: {"type":"disabled"}` because no `reasoning_content` was replayed. No HTTP 400.
5. **`maxOutputTokens` → `max_completion_tokens` tracks the reasoning metadata, not the model.** Present on the Kimi (131072) and MiniMax (131072) entries, absent on Qwen and MiMo, whose entries declare no `thinking`. This matches the Phase 1 observation and confirms it is an entry-level rule.
6. **`reasoning_effort` reaches the wire for effort-enabled entries** (`"high"` for Kimi, `"medium"` for MiniMax) with no `requestBody` involved.
7. **The harness sends at most 128 tools.** The Chat view reported "The model only supports 128 tools, 143 tools were not provided to the model" in this profile; earlier baselines recorded 100–128 depending on configuration.
8. **GLM needs no provider object to think.** Both `glm-5.3-flash` and `glm-5.3` completed the tool loop with no `thinking` field in the request; Z.ai thinks by default server-side and `clear_thinking` strips history, so the absence of a client-side object is harmless — the same conclusion the Phase 1 `requestBody` measurement implied, now confirmed live.

### Local harness run (2026-11-13, same session)

Second pass with the session target set to **Local**. All five routes completed a request and a tool follow-up with HTTP 200: `qwen-upstream`, `kimi-upstream`, `mimo-upstream`, `minimax`, `glm`. Seven requests, seven 200 responses, no provider errors.

| Observation                            | Local harness                                                                                                                                                     |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tools sent                             | **57** (versus 128 on Copilot)                                                                                                                                    |
| Tool names                             | Local vocabulary (`create_file`, `edit_notebook_file`, …), as in the Phase 1 baseline                                                                             |
| Kimi reasoning replay on the tool turn | **Yes** — `reasoning_content` present on the assistant tool-call message                                                                                          |
| Qwen `enable_thinking`                 | absent on the first request, `false` on the tool request                                                                                                          |
| MiMo `thinking`                        | `{"type":"disabled"}` on a request whose history lacked reasoning                                                                                                 |
| GLM / MiniMax `reasoning_effort`       | `"low"` / `"medium"` reached the providers; `max_completion_tokens: 131072` on both                                                                               |
| Errors                                 | none from the providers; one `net::ERR_CONNECTION_REFUSED` from VS Code when the local relays had been stopped, cleared by **Try Again** once they were restarted |

Two harness behaviours worth recording:

1. **The session target does not persist.** A new chat starts on the Copilot harness even after a Local session; you must set the target again for every new chat. Mixing that up silently runs the wrong harness.
2. **Changing the model inside a live session keeps the session**, so history crosses providers. Later requests carried earlier Kimi/MiMo/GLM tool turns into the next provider's request — realistic, but it means the Local runs after the first are not independent, single-provider conversations.

Reasoning replay is therefore **harness-independent for Kimi**: Copilot and Local both replayed it on the tool turn.

### Still unverified

- Vision input on any route, and long-conversation compaction.
- GLM 5.3 (text model) on the Local harness — only `glm-5.3-flash` was exercised there.
- Whether a SecretStorage-set key (rather than the relay) changes any of the above; the request shape should be identical apart from the `Authorization` value, but this was not measured.

### Profile-loading note for future runs

A custom-endpoint provider added to a fresh profile did **not** appear in the model picker until the Language Models editor had been opened once in that window (`Add Models…` → editor → close). Until then the picker listed only extension-provided models. The editor itself showed the provider immediately, so this is a picker/BYOK-bridge refresh, not a configuration or schema problem. A provider whose display name collides with an installed extension's (for example `GLM`) also hides behind that extension's group, which is why the second run named the provider `GLM Relay`.

### Reproducing the run

The relays were temporary and are gone; recreate them with the shape above if this needs repeating. The three production proxies are unchanged by this phase. Captures: `debug_log/phase3-kimi.ndjson`, `phase3-qwen.ndjson`, `phase3-mimo.ndjson` (proxy-level, redacted) and `phase3-relay.ndjson` (route-level summaries incl. reasoning-presence counts).
