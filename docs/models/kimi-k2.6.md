# Kimi K2.6 Validation Record

## Summary

- Goal: validate `kimi-k2.6` as a VS Code / GitHub Copilot Custom Endpoint model.
- Final verdict: the proxy-backed setup is acceptable for plain chat, streaming, and tool-enabled agent flows.
- Direct endpoint verdict: direct VS Code -> Moonshot integration is not viable in this environment because VS Code sends request shapes that `kimi-k2.6` rejects.
- Working path: VS Code -> `http://127.0.0.1:3457/v1/chat/completions` -> `proxy/kimi-proxy.mjs` -> `https://api.moonshot.ai/v1/chat/completions`.

## Compatibility Assessment

### Why Kimi was a reasonable candidate

Kimi documents an OpenAI-compatible Chat Completions API with:

- Bearer-token authentication
- `model` selection in the request body
- streaming responses
- `tools` / `tool_calls`

That made VS Code Custom Endpoint `chat-completions` mode the lowest-risk starting point.

### Important caveats from research

- Kimi documents `tools` / `tool_calls`, not deprecated `functions` / `function_call`.
- `tool_choice="required"` is not supported.
- Thinking controls are Kimi-specific through a `thinking` object and `reasoning_content` fields.
- VS Code BYOK/custom endpoint support does not replace GitHub-hosted features such as inline completions or semantic search.
- K2-family models use fixed sampling values, which made request rewriting necessary when VS Code sent incompatible values.

## Final Working Configuration

### VS Code user config

User config file (path is OS-specific):

| OS      | Path                                                              |
| ------- | ----------------------------------------------------------------- |
| Windows | `%APPDATA%\Code\User\chatLanguageModels.json`                     |
| macOS   | `~/Library/Application Support/Code/User/chatLanguageModels.json` |
| Linux   | `~/.config/Code/User/chatLanguageModels.json`                     |

Applied model entry shape:

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

### Local proxy

Proxy script:

```text
proxy/kimi-proxy.mjs
```

Listen URL:

```text
http://127.0.0.1:3457/v1/chat/completions
```

Health check:

```text
http://127.0.0.1:3457/healthz
```

Response shape:

```json
{
  "ok": true,
  "upstreamUrl": "https://api.moonshot.ai/v1/chat/completions",
  "port": 3457,
  "forcedTemperature": 1,
  "forcedTopP": 0.95
}
```

#### Environment variables

| Variable                                    | Default                                               | Purpose                                                 |
| ------------------------------------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| `KIMI_PROXY_PORT`                           | `3457` (falls back to `PORT`)                         | Local listen port                                       |
| `KIMI_UPSTREAM_URL`                         | `https://api.moonshot.ai/v1/chat/completions`         | Upstream Moonshot endpoint                              |
| `KIMI_PROXY_FORCE_TEMPERATURE`              | `1`                                                   | Temperature for thinking-mode requests                  |
| `KIMI_PROXY_FORCE_NON_THINKING_TEMPERATURE` | `0.6`                                                 | Temperature when thinking is disabled (tool requests)   |
| `KIMI_PROXY_FORCE_TOP_P`                    | `0.95`                                                | `top_p` to force into the request body                  |
| `KIMI_PROXY_DISABLE_THINKING_WITH_TOOLS`    | `1`                                                   | Force `thinking={"type":"disabled"}` when tools present |
| `KIMI_PROXY_LOG`                            | `debug_log/kimi-proxy.ndjson` (relative to repo root) | Redacted NDJSON log path                                |

Start command:

```text
node proxy/kimi-proxy.mjs
```

Proxy behavior:

- forwards the existing `Authorization` header upstream
- rewrites plain-chat requests to `temperature: 1` and `top_p: 0.95`
- rewrites tool-enabled requests to `thinking: {"type": "disabled"}`, `temperature: 0.6`, and `top_p: 0.95`
- preserves streaming responses
- writes redacted request summaries to `debug_log/kimi-proxy.ndjson`

## Validation Summary

### Final outcome

- `Kimi K2.6` appears in the VS Code Language Models UI and the chat picker.
- External `GET /v1/models`, non-streaming chat, and streaming chat all returned HTTP `200` against Moonshot.
- Proxy-backed in-editor plain chat works.
- Proxy-backed in-editor streaming works.
- Proxy-backed integrated-browser tool use works end to end after the tool-aware rewrite was added.

### Why direct integration failed

Direct VS Code requests to Moonshot failed in stages:

1. initial auth failure while the config still pointed at the older `api.moonshot.cn` endpoint
2. `invalid temperature: only 1 is allowed for this model`
3. `invalid top_p: only 0.95 is allowed for this model`
4. after the first tool-enabled attempt, `thinking is enabled but reasoning_content is missing in assistant tool call message`

The model-level `requestBody.temperature = 1` override validated locally but was not sufficient in practice, which strongly suggests that VS Code's Custom Endpoint provider ignored or overwrote some model-specific request fields.

## Validation Details

### External API checks

- `GET https://api.moonshot.ai/v1/models`: passed with HTTP `200`
- `POST https://api.moonshot.ai/v1/chat/completions`: passed with HTTP `200`
- streaming `POST https://api.moonshot.ai/v1/chat/completions`: passed with HTTP `200`

### Basic chat smoke test

Prompt used:

```text
Reply with one sentence confirming this model is available.
```

Observed result:

- direct path failed due to Kimi-incompatible sampling values
- proxy-backed path succeeded and returned upstream `text/event-stream`

### Tool-enabled validation

Prompt used:

```text
Please open kimi documentation site using vscode integrated browser
```

Observed result:

- first run: browser tool invocation succeeded, but the post-tool follow-up failed because thinking remained enabled and VS Code did not preserve `reasoning_content`
- workaround: force `thinking: {"type": "disabled"}` plus `temperature: 0.6` on tool-enabled turns
- rerun: both the tool turn and the follow-up model turn returned upstream `200` with `text/event-stream`

### Proxy validation notes

- redacted proxy logs confirmed `temperature 0.1 -> 1` and `top_p 1 -> 0.95` for plain-chat requests
- redacted proxy logs later confirmed `thinking undefined -> disabled` and `temperature 0.1 -> 0.6` for tool-enabled requests

## Known Limitations

- Direct VS Code -> Moonshot integration remains incompatible for `kimi-k2.6` in this environment.
- If the local proxy is not running, plain chat and agent flows will fail.
- This proxy is tuned for the Kimi K2 family request constraints, not for arbitrary providers.
- GitHub Copilot inline completions and semantic-search-backed features are still outside the scope of this setup.

## Final Verdict

- acceptable for plain chat: yes
- acceptable for streaming chat: yes
- acceptable for tool-enabled agent use: yes, with the local proxy workaround
- acceptable without a proxy: no

Recommended operating mode:

- keep the model URL pointed at `http://127.0.0.1:3457/v1/chat/completions`
- keep `proxy/kimi-proxy.mjs` running while using Kimi in VS Code chat

## Sources

- VS Code custom endpoint docs: `https://code.visualstudio.com/docs/copilot/customization/language-models#_add-a-custom-endpoint-model`
- Kimi docs index: `https://platform.kimi.ai/docs/llms.txt`
- Kimi chat completion docs: `https://platform.kimi.ai/docs/api/chat.md`
- Kimi models list: `https://platform.kimi.ai/docs/api/list-models.md`
- Kimi model parameter reference: `https://platform.kimi.ai/docs/api/models-overview.md`
- Kimi tool use docs: `https://platform.kimi.ai/docs/api/tool-use.md`
- Kimi K2.6 quickstart: `https://platform.kimi.ai/docs/guide/kimi-k2-6-quickstart.md`
- Kimi thinking guide: `https://platform.kimi.ai/docs/guide/use-kimi-k2-thinking-model.md`
- Kimi web search guide: `https://platform.kimi.ai/docs/guide/use-web-search.md`
- Kimi coding tools / agent guide: `https://platform.kimi.ai/docs/guide/agent-support.md`
