# npm Packaging Plan

> **Status:** planning | **Branch:** `feature/npm` | **Started:** 2026-06-01

## Goal

Make the proxies runnable via `npm run <script>` locally and via `npx` after publishing to npmjs.

The desired UX:

```bash
# local development
npm run proxy:kimi
npm run proxy:qwen

# after publishing — one of these patterns
npx copilot-custom-endpoint kimi
npx copilot-custom-endpoint qwen
```

## Constraints

- npm package names **cannot** contain colons (`:`), so `npx copilot-custom-endpoint:kimi` is not possible as a literal package name.
- The `.mjs` proxy files already work with bare `node` — no transpilation needed.
- Both proxies are standalone Node.js servers; they don't share runtime code (each has its own copy of the HTTP boilerplate). We keep them independent.

---

## Phase 1 — Local `npm run` scripts

### What we need

A root `package.json` with two scripts:

```json
{
  "scripts": {
    "proxy:kimi": "node proxy/kimi-proxy.mjs",
    "proxy:qwen": "node proxy/qwen-proxy.mjs"
  }
}
```

The colon in script names is fine — npm script names allow colons (they're just shell targets, not package names).

### Files to create / change

| File           | Action |
| -------------- | ------ |
| `package.json` | Create |

### Validation

```bash
npm run proxy:kimi -- --help
npm run proxy:qwen -- --help
```

---

## Phase 2 — npm publish for `npx` usage

### CLI design

Publish a single package `copilot-custom-endpoint` with a subcommand-style CLI entry point.

```
npx copilot-custom-endpoint kimi    → starts the Kimi proxy on :3457
npx copilot-custom-endpoint qwen    → starts the Qwen proxy on :3458
```

This is implemented via a tiny wrapper script (`cli.mjs`) that inspects `process.argv[2]` and delegates to the appropriate proxy module.

### Why a single package with subcommands?

| Approach                                                                                    | UX                                                | Complexity                               |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------- |
| One package, subcommand CLI (`copilot-custom-endpoint kimi`)                                | Clean, single install                             | Medium — need a CLI wrapper              |
| Two packages (`copilot-custom-endpoint-kimi`, `copilot-custom-endpoint-qwen`)               | `npx copilot-custom-endpoint-kimi` works directly | Low — but two publish steps, two READMEs |
| One package, multiple bins (`copilot-custom-endpoint-kimi`, `copilot-custom-endpoint-qwen`) | `npx copilot-custom-endpoint-kimi` works directly | Medium — need shebangs + bin entries     |

**Decision: single package with subcommand CLI.** It's the cleanest UX. Also expose direct bins as aliases so `npx copilot-custom-endpoint-kimi` also works.

### Files to create / change

| File                                          | Action | Purpose                                              |
| --------------------------------------------- | ------ | ---------------------------------------------------- |
| `package.json`                                | Update | Add `name`, `version`, `bin`, `files`, metadata      |
| `cli.mjs`                                     | Create | Subcommand dispatcher (kimi / qwen)                  |
| `.npmignore` (or use `files` in package.json) | Create | Exclude `debug_log/`, `tests/`, `docs/` from publish |

### `package.json` publish shape

```json
{
  "name": "copilot-custom-endpoint",
  "version": "1.0.0",
  "description": "Local proxies for VS Code Copilot custom endpoints — Kimi K2 & Qwen 3.x",
  "license": "MIT",
  "type": "module",
  "bin": {
    "copilot-custom-endpoint": "cli.mjs",
    "copilot-custom-endpoint-kimi": "proxy/kimi-proxy.mjs",
    "copilot-custom-endpoint-qwen": "proxy/qwen-proxy.mjs"
  },
  "files": ["cli.mjs", "proxy/"],
  "scripts": {
    "proxy:kimi": "node proxy/kimi-proxy.mjs",
    "proxy:qwen": "node proxy/qwen-proxy.mjs"
  }
}
```

### CLI wrapper (`cli.mjs`)

Minimal — parses subcommand, spawns the right proxy.

```js
#!/usr/bin/env node
const sub = process.argv[2]
if (sub === 'kimi') await import('./proxy/kimi-proxy.mjs')
else if (sub === 'qwen') await import('./proxy/qwen-proxy.mjs')
else {
  console.error('Usage: copilot-custom-endpoint <kimi|qwen>')
  process.exit(1)
}
```

### Publishing steps

1. `npm login` (one-time)
2. `npm publish --dry-run` to verify the tarball contents
3. `npm publish`
4. Test: `npx copilot-custom-endpoint kimi --help`

---

## Phase 3 — Post-publish updates

- Update `README.md` to mention `npx` usage
- Update `AGENTS.md` commands section
- Add a version badge or install instructions

---

## Decisions

| Question | Decision                             | Reason                                    |
| -------- | ------------------------------------ | ----------------------------------------- |
| Scope    | Unscoped — `copilot-custom-endpoint` | Simpler `npx` UX                          |
| License  | MIT                                  | Standard permissive open-source           |
| Version  | `1.0.0`                              | Proxies are already validated and working |

---

## Progress log

| Date       | What happened                                                                                                                                                                                                                                                                                                        |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-01 | Plan drafted.                                                                                                                                                                                                                                                                                                        |
| 2026-06-01 | **Phase 1 done.** `package.json` created with `npm run proxy:kimi` and `npm run proxy:qwen` scripts. Both validated with `--help`.                                                                                                                                                                                   |
| 2026-06-01 | **Phase 2 done.** `cli.mjs` subcommand dispatcher created. `package.json` updated with `bin` entries (`copilot-custom-endpoint`, `copilot-custom-endpoint-kimi`, `copilot-custom-endpoint-qwen`) and `files` for publish. Validated: `node cli.mjs kimi --help`, `node cli.mjs qwen --help`, `node cli.mjs` (usage). |
| 2026-06-01 | **Phase 3 done.** README.md and AGENTS.md updated with `npm run` and `npx` usage.                                                                                                                                                                                                                                    |
| 2026-06-01 | **clean:logs added.** `npm run clean:logs` and `npx copilot-custom-endpoint clean` remove `debug_log/`.                                                                                                                                                                                                              |
