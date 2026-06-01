---
mode: agent
description: Audit and update all documentation (README.md, AGENTS.md, docs/models/) against the live chatLanguageModels.json config and proxy source files.
---

You are updating the documentation in this repository to be accurate and complete. Follow these steps precisely.

## Step 1 — Read the source of truth

Read these files in parallel before touching any documentation:

1. `${env:APPDATA}/Code/User/chatLanguageModels.json` — the live VS Code model registry. Every provider entry and every model entry in this file must be reflected in the docs.
2. `proxy/kimi-proxy.mjs` — the Kimi proxy source. Extract all env-var names, default values, rewrite logic (temperature, top_p, thinking), health-check route, and log path.

## Step 2 — Read all existing documentation

Read in parallel:

- `README.md`
- `AGENTS.md`
- `docs/models/kimi-k2.6.md`
- `docs/models/qwen.md`

## Step 3 — Audit against source of truth

For each provider in `chatLanguageModels.json`, verify the following in the docs:

### Per provider / model checks

- [ ] Provider name, vendor, and API type match.
- [ ] Model `id`, `name`, and `url` match exactly.
- [ ] `toolCalling`, `vision`, `streaming` flags match.
- [ ] `requestBody` overrides (e.g. `enable_thinking`, `temperature`) match.
- [ ] `maxInputTokens` / `maxOutputTokens` are documented if present in the config, and absent if not.
- [ ] The proxy URL (`http://127.0.0.1:3457/v1/chat/completions`) is used for Kimi and a direct DashScope URL for Qwen.

### Proxy checks (kimi-proxy.mjs)

- [ ] Default port matches the URL shown in the docs.
- [ ] Default `temperature` values (plain-chat and non-thinking) match what the docs describe.
- [ ] Default `top_p` matches.
- [ ] `KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS` behavior is accurately described.
- [ ] All env-var names listed in `--help` output match what the docs say.
- [ ] Health-check endpoint (`/healthz`) and its response shape are documented.
- [ ] Log file path (`debug_log/kimi-proxy.ndjson`) matches the docs.

### README.md quick-start table

- [ ] Every model in `chatLanguageModels.json` that is a `customendpoint` appears in the table.
- [ ] "Needs proxy?" column matches reality.
- [ ] "Vision" and "Tool calling" columns match `vision` and `toolCalling` flags.

### JSON config snippets in README.md and model docs

- [ ] The Kimi snippet matches the live chatLanguageModels.json entry exactly (field order and values).
- [ ] The Qwen snippet matches the live chatLanguageModels.json entry exactly.
- [ ] Placeholder text uses `<your-moonshot-key>` / `<your-dashscope-key>` consistently.

### AGENTS.md

- [ ] The "Scope" section lists every validated model.
- [ ] The "Commands" section commands are correct for the proxy defaults.
- [ ] Provider-specific constraints reflect current proxy behavior.

### docs/models/\*.md

- [ ] "Final Working Configuration" snippets match the live config.
- [ ] Proxy behavior bullets (temperature, top_p, thinking rewrite) match the proxy source.
- [ ] Any model that exists in chatLanguageModels.json but lacks a model doc gets a note added to README.md and AGENTS.md describing its status.

## Step 4 — Apply updates

For every discrepancy found in Step 3, update the relevant file. Use the minimum change required — do not reformat or restructure sections that are already accurate.

If a provider exists in `chatLanguageModels.json` but has no model doc under `docs/models/`, add a brief entry to README.md and AGENTS.md noting it as present in the config but not yet fully validated.

## Step 5 — Verify

After all edits, re-read each modified file and confirm:

- No JSON snippet in the docs contradicts the live `chatLanguageModels.json`.
- No proxy env-var, default value, or behavior description in the docs contradicts `proxy/kimi-proxy.mjs`.
- The README quick-start table is consistent with both the live config and the model docs.

Report a one-line summary of each file changed and what was corrected.
