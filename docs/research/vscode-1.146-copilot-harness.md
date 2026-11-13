# VS Code 1.146: Copilot Harness and Custom Endpoints

> **Research date:** 2026-11-13  
> **Scope:** Repository custom endpoints and proxies in the VS Code Copilot harness.  
> **Status:** Documentation and code review only; no live provider requests or end-to-end harness tests were performed.

## Summary

The move to the Copilot harness warrants revalidation, but it does not by itself prove that any proxy can be removed. The most important questions are whether the current harness forwards the provider-specific fields in our examples and whether it preserves reasoning across real tool loops.

- VS Code 1.146 deprecates the Local harness; removal is planned for February 2027. The Copilot harness has been the default for new sessions since 1.143.
- Copilot harness BYOK requires `chat.agentHost.byokModels.enabled`. It is enabled in the inspected user's VS Code settings; the feature is documented as experimental.
- The current VS Code documentation describes `modelOptions` for sampling and dedicated model properties for reasoning, but does not document arbitrary `requestBody` passthrough. An arbitrary `extraBody` proposal remains open. Actual behavior needs a wire-level check.
- VS Code merged a BYOK Chat Completions reasoning replay change gated on the model's `thinking` capability. This is a reason to retest the guides' general claims that VS Code cannot preserve `reasoning_content`, not proof that all models or harness routes now work.
- The repository's utility-model instructions overstate the requirement: with a Copilot token, the documented default is to use Copilot utility models.
- Qwen's actual tool detection differs from the duplicate logic used in its integration tests. A tools array without `tool_choice` or a prior tool-role message is classified as plain chat by the actual proxy.

## Environment and evidence

| Item                                      | Observed                                                                                 |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| VS Code                                   | 1.146.0, commit `69047191fc427f2f92828279aae1d90d8eeda7ab`                               |
| Bundled Copilot extension                 | 0.74.0                                                                                   |
| Separately installed Copilot CLI          | 1.0.109; this is not evidence of the version used by every VS Code session               |
| Agent Host BYOK setting                   | `chat.agentHost.byokModels.enabled: true` in the inspected user settings                 |
| Provider validation in this investigation | None; prior model records remain historical evidence, not proof for this harness/version |

The setting observation is specific to the inspected installation and profile. Other profiles and users may need to enable it. No API keys, endpoint credentials, prompts, or conversation contents were inspected or recorded.

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
