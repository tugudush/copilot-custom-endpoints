# Copilot Harness Compatibility Plan

**Date:** 2026-11-13  
**Input:** [VS Code 1.146 research](../../research/vscode-1.146-copilot-harness.md)  
**Status:** Proposed; no compatibility change or live provider validation is implied.

## Goal and scope

Make the repository's custom-endpoint guidance and proxy tests reliable for the VS Code Copilot harness, while retaining existing working routes until replacements are verified. This plan covers Kimi, Qwen, MiMo, MiniMax, GLM, and the extension-provided DeepSeek path; it does not change model rosters or pricing.

The research is the sole requested planning input, not a formal feature specification. The `REQ` identifiers below are **derived planning objectives**, not identifiers claimed to exist in that research. No separate architecture, constitution, or topology artifacts were supplied; use [AGENTS.md](../../../AGENTS.md) and existing repository conventions as constraints.

## Objectives

| ID      | Objective                                                                                                                    |
| ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| REQ-001 | Establish a reproducible, privacy-preserving baseline for the Copilot harness and BYOK request configuration.                |
| REQ-002 | Test production proxy behavior rather than duplicated rewrite implementations and resolve discrepancies only with evidence.  |
| REQ-003 | Validate provider-specific streaming, tool loops, reasoning replay, and direct/proxy compatibility before changing defaults. |
| REQ-004 | Correct setup, utility-model, request-field, and provider guidance according to verified behavior.                           |
| REQ-005 | Verify context/output limits and keep affected configuration and model facts consistent.                                     |
| REQ-006 | Preserve redaction and existing behavior, run relevant checks, and report unverified or blocked paths explicitly.            |

## Constraints and decisions

- **Evidence first:** `requestBody` passthrough, `modelOptions`, `thinking` metadata, reasoning effort, output limits, and tool history must be observed separately. Undocumented does not mean proven unsupported. Do not prescribe proposed `extraBody` while it remains unverified.
- **Preserve current routes:** Keep provider-specific proxies and thinking fallbacks until equivalent direct behavior is demonstrated. Do not introduce K2-style request-body `thinking` for K3.
- **No secrets or private code in evidence:** Use synthetic prompts, tool results and images. For local interception, record only sanitized field names, allowed non-secret parameter values, and reasoning-presence booleans. Never persist credentials, workspace IDs, full messages, reasoning text, or unredacted traffic. Follow existing proxy redaction.
- **Live tests are gated:** Provider validation needs a user-approved test window, valid credentials, network access, and potential spend. Use the user's secure VS Code credential flow; never request credentials in chat or commit them. If unavailable, mark the provider route **blocked/not validated**, retain its current guidance and fallback, and continue independent local/documentation work.
- **Avoid side effects:** Do not change the user's active `chatLanguageModels.json`, settings, `.env`, or running proxy processes. Use an isolated temporary VS Code profile and temporary local test server, and clean up only resources created for the test.
- **Repository conventions:** Provider behavior stays provider-specific. If context facts in README, pricing, or benchmarks change, follow the repository's roster-consistency and pricing-sort instructions; do not make unrelated roster changes.
- **Applied guidelines:** No matching framework-migration guideline applies to these Node.js proxies and VS Code configurations.

## Phase 1 - Establish the request baseline

### 1.1 Isolated test setup (REQ-001, REQ-006)

Prerequisite for phases 1.2 and 3. Record the VS Code and built-in Copilot extension versions, selected harness, BYOK setting, model ID, API type, and route. Build or reuse a loopback mock Chat Completions endpoint with synthetic SSE responses and tool calls; it must not forward traffic to a provider. Compare the configured request with the received sanitized shape without logging authorization or conversation content.

- [ ] T001 [Plan:1.1] Prepare an isolated VS Code profile and local mock using existing patterns in `tests/proxy.test.mjs`; document the version, harness, route and safe evidence procedure in `docs/research/vscode-1.146-copilot-harness.md`.
- [ ] T002 [Plan:1.1] Confirm model visibility, streaming, and a synthetic tool-call/follow-up round through the Copilot harness; record pass, fail, or blocked status without storing payloads.

### 1.2 Verify configuration propagation (REQ-001, REQ-004)

Depends on 1.1. In separate controlled cases compare `requestBody` fields against `modelOptions` sampling values, supported reasoning metadata/effort controls, and `maxOutputTokens`. Observe request fields before proxy rewriting and, where applicable, the sanitized result after rewriting. Include Kimi's documented output-token override and Qwen, MiMo, MiniMax, and GLM provider-specific fields.

- [ ] T003 [Plan:1.2] Record per-field observed behavior, including absent versus present fields and any precedence, in `docs/research/vscode-1.146-copilot-harness.md`; distinguish VS Code metadata from provider request-body fields.
- [ ] T004 [Plan:1.2] Classify each current example in `docs/example-config.md` and `docs/models/` as verified, contradicted, or unverified; do not migrate fields until a supported equivalent and effective wire behavior are established.

## Phase 2 - Align proxy tests with production

### 2.1 Test actual rewrites (REQ-002, REQ-006)

Can start independently of phase 1. Replace the duplicated Qwen and Kimi test rewrites with tests of the production behavior, using the smallest practical test seam or real proxy processes with a mock upstream. Preserve startup behavior, provider-specific rewrites, streaming, forwarded headers, and redacted logging. Retain the existing direct MiMo rewrite coverage.

- [ ] T005 [Plan:2.1] Update `tests/proxy.test.mjs` and, only if needed for a minimal test seam, `proxy/qwen-proxy.mjs` and `proxy/kimi-proxy.mjs` so tests invoke production rewrites rather than copies.
- [ ] T006 [Plan:2.1] Cover plain chat, a nonempty tools array with omitted `tool_choice`, explicit `tool_choice: "none"`, active `tool_choice`, tool-role history, and K3 always-thinking behavior; keep the existing relevant `tests/mimo-rewrite.test.mjs` cases.

### 2.2 Resolve Qwen's first tool-capable request (REQ-002, REQ-003)

Depends on 1.2 and 2.1. Compare actual harness request shapes and provider requirements with Qwen's documented promise. Decide whether a tools array alone should trigger suppression, including the semantics of explicit `"none"`; document the chosen trade-off. Do not change production behavior merely to match the old duplicate tests.

- [ ] T007 [Plan:2.2] Use the evidence from `docs/research/vscode-1.146-copilot-harness.md` to document the first-turn and `tool_choice: \"none\"` decision in `docs/models/qwen.md`.
- [ ] T008 [Plan:2.2] If the evidence requires a change, update `proxy/qwen-proxy.mjs` and its production-path regression cases in `tests/proxy.test.mjs`; otherwise retain behavior and document the limitation.

## Phase 3 - Provider compatibility validation

### 3.1 Compare routes and reasoning history (REQ-003, REQ-006)

Depends on 1.2; phase 2.2 is a prerequisite for declaring Qwen's changed behavior validated. With approval, test real providers using synthetic content. For every applicable route, verify model visibility, streaming plain chat, a multi-step tool loop with a follow-up result, and whether required reasoning history is present. Use `thinking: true` as VS Code capability metadata only where supported; do not confuse it with a provider request-body object.

| Provider            | Required comparison / checks                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Kimi K3.1 Pro       | Existing proxy; direct route only after checking K3 sampling and parameters. Verify output limit and reasoning replay.     |
| Qwen 3.8 Max        | Existing proxy and direct route; verify first tool-capable turn and the intended thinking behavior.                        |
| MiMo V2.6           | Existing proxy and direct route; verify complete versus missing reasoning history and the fallback.                        |
| MiniMax M3.1 Flash  | Direct route; verify provider-specific request settings, streaming, tool loop, and reasoning visibility.                   |
| GLM 5.3 / 5.3 Flash | Direct route; verify provider-specific settings and tool history, including server-side thinking handling.                 |
| DeepSeek extension  | Separately verify model visibility and tool loop in the Copilot harness and Agents window when the extension is available. |

- [ ] T009 [Plan:3.1] Record dated pass/fail/blocked results, versions, model, route, sanitized request-field observations, and failures in each applicable `docs/models/` record; do not claim a model or route is validated when prerequisites are missing.
- [ ] T010 [Plan:3.1] For each vision-capable route in `docs/models/`, test a synthetic image; exercise a sufficiently long synthetic conversation and compaction, recording any untested capability as a gap.
- [ ] T011 [Plan:3.1] Keep proxy defaults unchanged unless the relevant direct route passes the checks and has an explicit documented rollback path; update `docs/models/kimi.md`, `docs/models/qwen.md`, or `docs/models/mimo.md` only for routes actually verified.

## Phase 4 - Correct configuration and guidance

### 4.1 Update harness and parameter guidance (REQ-004, REQ-006)

Depends on phase 1 observations; provider-specific claims additionally depend on phase 3. Document the Copilot harness BYOK opt-in, its experimental status, and Local harness deprecation. Correct utility guidance using the documented `chat.utilityModel`, `chat.utilitySmallModel`, and `chat.byokUtilityModelDefault` behavior; verify any old-setting migration separately. Replace unconditional reasoning-history and `requestBody` claims with observed results or explicit uncertainty.

- [ ] T012 [Plan:4.1] Update `README.md`, `AGENTS.md`, and `docs/example-config.md` for harness setup, utility models, and any verified configuration changes; keep links and copied examples consistent with affected `docs/models/` guides.
- [ ] T013 [Plan:4.1] Update the affected `docs/models/kimi.md`, `docs/models/qwen.md`, `docs/models/mimo.md`, `docs/models/minimax.md`, `docs/models/glm.md`, and `docs/models/deepseek.md` only to the extent supported by phase 1 or 3 evidence; retain explicit unvalidated warnings where needed.

### 4.2 Verify model limits (REQ-005)

Can start after 1.2 independently of live testing. Check current provider documentation for the exact total context and maximum output for each documented model, including units. For each example ensure `maxInputTokens + maxOutputTokens` does not exceed the confirmed total and separately verify what limits the actual outgoing request.

- [ ] T014 [Plan:4.2] Record provider sources and calculate safe limits for the examples in `docs/example-config.md` and affected `docs/models/` records; do not infer a provider's exact 1M limit from an approximate label.
- [ ] T015 [Plan:4.2] Update confirmed capability values consistently in affected guides and, if model facts are changed there, `README.md`, `docs/pricing.md`, and `docs/benchmarks.md`; preserve roster consistency and sort order.

## Phase 5 - Validation and handoff

### 5.1 Run focused checks and report gaps (REQ-006)

Depends on implementation and documentation work above; blocked live provider checks must remain visible and cannot count as passing.

- [ ] T016 [Plan:5.1] Run `node --test tests\\proxy.test.mjs tests\\mimo-rewrite.test.mjs`, then `npm test` and `npm run lint` for any proxy changes; run Prettier's check on changed documentation and code without formatting unrelated files.
- [ ] T017 [Plan:5.1] Verify test servers and temporary profiles created by this work are stopped/cleaned up, inspect redaction behavior, and summarize verified routes, blocked routes, failures, and any remaining follow-up in `docs/research/vscode-1.146-copilot-harness.md`.

## Completion criteria

1. Production proxy tests cover the specified tool and reasoning cases without copied rewrite logic; any behavior change has a regression test and documented rationale.
2. Harness setup and utility guidance match verified settings and official documentation; provider-specific claims distinguish tested results from uncertainty.
3. Each provider/route has a dated result or an explicit blocked/not-tested status. Proxy retirement or a default switch requires successful equivalent route validation; a blocked live test is **not** a pass.
4. Confirmed context/output limits satisfy the documented context invariant and related model facts remain consistent.
5. Relevant automated checks pass, redaction is preserved, and no user configuration, credentials, or unrelated files are changed.

## Requirement mapping

| Objective | Plan items              | Evidence of completion                                                                                    |
| --------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| REQ-001   | 1.1, 1.2                | Sanitized local harness and request-field findings in `docs/research/vscode-1.146-copilot-harness.md`.    |
| REQ-002   | 2.1, 2.2                | Production-path regression tests and an evidence-based Qwen detection decision.                           |
| REQ-003   | 2.2, 3.1                | Dated provider and route results, including explicit blocked cases.                                       |
| REQ-004   | 1.2, 4.1                | Consistent harness, utility, and configuration guidance across README, example config, and model records. |
| REQ-005   | 4.2                     | Provider-cited limits and consistent configuration values.                                                |
| REQ-006   | 1.1, 2.1, 3.1, 4.1, 5.1 | Redacted validation, passing applicable checks, cleanup, and an honest gap report.                        |
