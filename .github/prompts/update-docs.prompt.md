---
agent: agent
description: Audit and update all documentation (README.md, AGENTS.md, docs/models/) against the live chatLanguageModels.json config and proxy source files.
---

You are updating the documentation in this repository to be accurate and complete. Follow these steps precisely.

## Step 1 — Read the source of truth

Read these files in parallel before touching any documentation:

1. `${env:APPDATA}/Code/User/chatLanguageModels.json` — the live VS Code model registry. Use this file as a reference to verify the models **already documented** in this repo. Only models that have documentation under `docs/models/` or an entry in the README quick-start table need to be checked. Undocumented entries in the config are out of scope — do not add docs for them unless explicitly asked.
2. All proxy source files under `proxy/` — discover the current set with `file_search` for `proxy/*.mjs`. For each proxy, extract all env-var names, default values, rewrite logic (temperature, top_p, thinking), health-check route, and log path.

## Step 2 — Read all existing documentation

Read in parallel:

- `README.md`
- `AGENTS.md`
- `docs/example-config.md`
- All files in `docs/models/` (discover the current set with `file_search` for `docs/models/*.md` — do not assume a fixed list).

## Step 3 — Audit against source of truth

For each provider in `chatLanguageModels.json`, verify the following in the docs:

### Per provider / model checks

- [ ] Provider name, vendor, and API type match.
- [ ] Model `id`, `name`, and `url` match exactly.
- [ ] `toolCalling`, `vision`, `streaming` flags match.
- [ ] `requestBody` overrides (e.g. `enable_thinking`, `temperature`) match.
- [ ] `maxInputTokens` / `maxOutputTokens` are documented if present in the config, and absent if not.
- [ ] The proxy URL (e.g. `http://127.0.0.1:3457/v1/chat/completions` for Kimi, `http://127.0.0.1:3458/v1/chat/completions` for Qwen, `http://127.0.0.1:3459/v1/chat/completions` for MiMo) is used for proxy-based models, and a direct API URL for models that don't need a proxy.

### Proxy checks (all proxies under `proxy/`)

For each proxy discovered under `proxy/`, verify:

- [ ] Default port matches the URL shown in the docs.
- [ ] Default `temperature` values (plain-chat and non-thinking) match what the docs describe.
- [ ] Default `top_p` matches.
- [ ] Thinking-disable/tool-detection behavior is accurately described.
- [ ] All env-var names listed in `--help` output match what the docs say.
- [ ] Health-check endpoint (`/healthz`) and its response shape are documented.
- [ ] Log file path matches the docs.

### README.md quick-start table

- [ ] Every model in the README quick-start table has a matching entry in `chatLanguageModels.json` with consistent flags.
- [ ] "Needs proxy?" column matches reality.
- [ ] "Vision" and "Tool calling" columns match `vision` and `toolCalling` flags.

### JSON config snippets in README.md and model docs

- [ ] Every provider's "Final Working Configuration" snippet in its model doc (Kimi, Qwen, MiMo, MiniMax, and any new provider) matches the live `chatLanguageModels.json` entry exactly — same field order, same values, including numeric formatting (e.g. `1` vs `1.0`).
- [ ] The combined full-config snippet in `docs/example-config.md` matches the live `chatLanguageModels.json` for every provider it covers, end to end.
- [ ] "At a Glance" summary tables in each model doc (e.g. context, max output) reflect the actual `maxInputTokens` / `maxOutputTokens` values from the live config, not just the JSON snippet below.
- [ ] Placeholder text uses `<your-moonshot-key>` / `<your-dashscope-key>` consistently.

### AGENTS.md

- [ ] The "Scope" section lists every validated model.
- [ ] The "Commands" section commands are correct for the proxy defaults.
- [ ] Provider-specific constraints reflect current proxy behavior.

### docs/models/\*.md

- [ ] "Final Working Configuration" snippets match the live config.
- [ ] Proxy behavior bullets (temperature, top_p, thinking rewrite) match the proxy source.

## Step 4 — Apply updates

For every discrepancy found in Step 3, update the relevant file. Use the minimum change required — do not reformat or restructure sections that are already accurate.

## Step 5 — Verify

After all edits, re-read each modified file and confirm:

- No JSON snippet in the docs contradicts the live `chatLanguageModels.json`.
- No proxy env-var, default value, or behavior description in the docs contradicts any proxy source under `proxy/`.
- The README quick-start table is consistent with both the live config and the model docs.

Report a one-line summary of each file changed and what was corrected.
