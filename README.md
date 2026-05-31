# Custom Endpoint Experiments

> **TL;DR** — This repo documents how to use non-GitHub language models inside VS Code's Copilot chat. We keep validated, copy-paste-ready configs and a small local proxy that smooths out provider quirks.

## What is this?

VS Code lets you add your own language-model endpoint ("Bring Your Own Key"). In practice, many providers claim "OpenAI-compatible" APIs but reject the exact request shapes that VS Code sends. This repo is a growing collection of **real, tested setups** — not just hopeful `curl` snippets.

Each provider/model gets one durable record under `docs/models/` plus any local proxy code it needs under `proxy/`.

### Why custom endpoints instead of OpenRouter?

[OpenRouter](https://openrouter.ai) is a popular unified gateway, but it is not always an option:

- **Corporate firewalls** block OpenRouter (and many other cloud AI gateways) by default. A custom endpoint lets you talk directly to a provider that _is_ allowed, or run a small local proxy on `localhost` that forwards through an approved egress path.
- **Provider-specific features** (Kimi's thinking mode, vision quirks, etc.) often need request rewriting that a generic aggregator does not support.
- **Cost or contract reasons** may mean your organisation already has a direct relationship with a specific provider and does not want traffic routed through a third party.

This repo is for those situations: validated, copy-paste-ready configs when OpenRouter is not the right tool for the job.

## Quick start — Kimi K2.6

The only fully validated setup today is **Kimi K2.6** (Moonshot). If that's what you're here for, you can be chatting in ~2 minutes.

### 1. Grab a Moonshot API key

Sign up at [platform.moonshot.ai](https://platform.moonshot.ai) and create an API key.

### 2. Start the local proxy

The proxy rewrites VS Code's requests into shapes Kimi actually accepts (fixed `temperature`, `top_p`, and disabling "thinking" during tool calls).

```bash
node proxy/kimi-proxy.mjs
```

You should see:

```
[kimi-proxy] listening on http://127.0.0.1:3457/v1/chat/completions
```

Check it's alive:

```bash
curl http://127.0.0.1:3457/healthz
```

> **Keep this terminal open** while you use Kimi in VS Code.

### 3. Register the model in VS Code

Open (or create) your user config file:

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

Paste this entry (replace `<your-moonshot-key>`):

```json
{
  "name": "Kimi",
  "vendor": "customendpoint",
  "apiKey": "<your-moonshot-key>",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "kimi-k2.6",
      "name": "Kimi K2.6",
      "url": "http://127.0.0.1:3457/v1/chat/completions",
      "requestBody": {
        "temperature": 1
      },
      "toolCalling": true,
      "vision": true,
      "streaming": true,
      "maxInputTokens": 262144,
      "maxOutputTokens": 32768
    }
  ]
}
```

> **Note:** The `requestBody.temperature` here is a hint to VS Code, but the proxy will enforce the exact values Kimi requires regardless.

### 4. Chat!

- Open the Copilot chat panel (`Ctrl+Alt+I` / `Cmd+Ctrl+I`).
- Click the model picker (top-right of the chat input).
- Choose **Kimi K2.6**.
- Ask something. Streaming, tool use, and vision all work.

### Troubleshooting

| Symptom                                 | Fix                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "Connection refused" or no response     | Make sure `node proxy/kimi-proxy.mjs` is still running.                                                                                                       |
| `invalid temperature` / `invalid top_p` | You're talking directly to Moonshot instead of through the proxy. Double-check the `url` in `chatLanguageModels.json`.                                        |
| Tool calls fail after first turn        | This happens if "thinking" stays enabled during tool loops. The proxy normally disables it automatically; ensure you're on the latest `proxy/kimi-proxy.mjs`. |

## What's validated?

| Capability        | Kimi K2.6 |
| ----------------- | --------- |
| Plain chat        | ✅        |
| Streaming         | ✅        |
| Tool / agent use  | ✅        |
| Vision            | ✅        |
| Direct (no proxy) | ❌        |

For the full research notes, tested values, and known limitations, see [`docs/models/kimi-k2.6.md`](docs/models/kimi-k2.6.md).

## Repo layout

```
.
├── docs/models/<provider>-<model>.md   # One merged record per model
├── proxy/                              # Local compatibility shims
└── debug_log/                          # Runtime logs (git-ignored)
```

## Adding a new model

Want to validate Qwen, GLM, Mimo, or something else?

1. Create `docs/models/<provider>-<model>.md`.
2. If the provider needs request rewriting, add a proxy script under `proxy/`.
3. Recommended sections for the record:
   1. Summary
   2. Compatibility assessment
   3. Final working configuration
   4. Validation summary
   5. Known limitations
   6. Final verdict
   7. Sources

## Limitations

- This repo covers **chat only**. GitHub Copilot features like inline completions, semantic search, and next-edit suggestions still require a GitHub-hosted model.
- Each proxy is tuned for a specific provider family. Don't point the Kimi proxy at an arbitrary OpenAI-compatible endpoint and expect it to work.
