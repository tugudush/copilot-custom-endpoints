# Magisterium AI Integration Research

> Researched: June 25, 2026. Updated: June 25, 2026. Status: API basics are doc-backed; vision capability live-validated as unsupported (see Vision note below).

## Summary

[Magisterium AI](https://www.magisterium.com/) is a Catholic-specific answer engine and knowledge platform. It is a better fit for questions about Catholic doctrine, morals, liturgy, Scripture, canon law, saints, dioceses, and Church history than a general-purpose model alone, because it is designed to answer from a curated Catholic corpus rather than from broad model memory.

The strongest integration path for this repo is **MCP first**, with **Chat Completions as a secondary custom-endpoint candidate**.

- **MCP** gives VS Code Copilot access to Magisterium's Catholic source tools: search, fetch, Mass readings, martyrology, saints, clergy/pope/diocese lookup, and a cited `chat` tool.
- **Chat Completions** is OpenAI-compatible at `https://www.magisterium.com/api/v1/chat/completions` with model `magisterium-1`. The endpoint, model ID, auth pattern, and streaming behavior are documented; the safest VS Code capability flags still require inference and live validation.
- **A2A** is useful for custom agent frameworks, but it is not the natural first integration for this repo unless we build a dedicated A2A client or bridge.
- **No public general benchmark scores** were found for Magisterium on the same axes this repo uses for other models, such as Artificial Analysis, Arena, MMLU-style knowledge tests, or GPQA-style public leaderboards.

## Public capabilities

Magisterium's public pages describe it as the "World's #1 answer engine for the Catholic Church" and say it draws on more than **31,000 to 32,000 Catholic texts**, depending on the page. The same public materials describe more than **1 million users**, usage in **190 countries**, and support across **50 to 75 languages**, depending on the page cited.

Public feature claims include:

- Catholic Q&A aligned with Church teaching.
- Built-in document viewer and source-grounded responses.
- Biblical commentary for Scripture study, teaching, and homily prep.
- Saints database with more than 12,000 entries.
- Ecclesiastical directory with dioceses, bishops, cathedrals, basilicas, and major Church events.
- Diocesan statistics and financial records.
- Mass readings, saints of the day, prayers, Catholic news, and other widgets.
- Native apps, WhatsApp, Claude/ChatGPT MCP connectors, API, MCP, and A2A.

## Benchmark status

No public benchmark placement was found for Magisterium on the standard general-model leaderboards tracked elsewhere in this repo.

Not found in public materials reviewed:

- Artificial Analysis Intelligence Index
- Arena Text / Agent / Code / Overall rankings
- Public MMLU, GPQA, Humanity's Last Exam, or similar reproducible general-knowledge numbers

What Magisterium does publish instead:

- Product claims about source-grounded Catholic accuracy and doctrinal fidelity
- Architecture claims about operating as a retrieval-and-reasoning system over a bounded Catholic corpus
- Statements about private doctrinal evaluation suites and fidelity goals, but not a public benchmark report that can be compared directly to GLM, Claude, GPT, Qwen, or MiniMax

Practical consequence: Magisterium should be treated as a **specialist Catholic source-and-answer system**, not as a frontier general-purpose model with public benchmark comparables.

## Integration surfaces

### 1. MCP server - recommended first path

Docs: [MCP](https://www.magisterium.com/developers/docs/mcp), [MCP tools](https://www.magisterium.com/developers/docs/mcp/tools), [other MCP clients](https://help.magisterium.com/integrations/using-magisterium-with-other-mcp-clients)

Remote MCP server:

```text
https://mcp.magisterium.com
```

Magisterium's docs show this generic MCP shape:

```json
{
  "mcpServers": {
    "magisterium": {
      "url": "https://mcp.magisterium.com"
    }
  }
}
```

For VS Code Copilot, this should be adapted to VS Code's MCP configuration format rather than copied blindly. The key fact is the remote server URL above; authentication is handled through OAuth in clients that support it.

Documented MCP tools:

| Tool                     | Purpose                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `search`                 | Search the Magisterium corpus and return ranked source passages with IDs, titles, and source URLs.                                     |
| `fetch`                  | Retrieve full text and metadata for a passage ID returned by `search`.                                                                 |
| `get_mass_readings`      | Retrieve Catholic lectionary readings for a natural-language day or occasion.                                                          |
| `get_martyrology`        | Retrieve Roman Martyrology entries for a calendar date.                                                                                |
| `get_saint`              | Look up saints, blesseds, venerables, servants of God, or martyrs.                                                                     |
| `get_person`             | Look up Catholic clergy figures, including bishops and cardinals.                                                                      |
| `get_pope`               | Look up papal biographical and pontificate data.                                                                                       |
| `get_diocese`            | Look up diocesan metadata, current bishop, recent statistics, and recent financial totals.                                             |
| `get_diocese_statistics` | Retrieve yearly diocese statistics time series.                                                                                        |
| `chat`                   | Ask a Catholic faith, doctrine, morals, liturgy, canon law, Scripture, or Church history question and receive a composed cited answer. |

Why MCP is the best fit:

- It preserves Magisterium as a **source tool** beside a strong general model such as GLM 5.2, Claude, GPT, or Qwen.
- It gives the assistant raw retrieval (`search` + `fetch`) when we want source passages, and synthesized Q&A (`chat`) when we want an answer.
- It avoids depending on whether VS Code's custom-endpoint provider displays Magisterium's nonstandard top-level `citations` field.
- Magisterium explicitly lists VS Code Copilot among example MCP-capable clients in its help docs.

Important limit: MCP requires a paid Magisterium plan. Free accounts receive `PLAN_REQUIRED` for MCP tool calls. On paid plans, "Unlimited" means no daily cap, not unthrottled access; the shared MCP/A2A pool is still rate-limited, and the `chat` tool has an even stricter limit.

### 2. Chat Completions - possible custom endpoint

Docs: [Chat Completions](https://www.magisterium.com/developers/docs/chat), [first request](https://www.magisterium.com/developers/docs/chat/making-first-request), [citations](https://www.magisterium.com/developers/docs/chat/citations), [safety settings](https://www.magisterium.com/developers/docs/chat/safety-settings)

Endpoint:

```text
https://www.magisterium.com/api/v1/chat/completions
```

Model ID:

```text
magisterium-1
```

Authentication:

```text
Authorization: Bearer $MAGISTERIUM_API_KEY
```

The docs describe the API as OpenAI-compatible and show the standard `messages` array shape:

```json
{
  "model": "magisterium-1",
  "messages": [
    {
      "role": "user",
      "content": "What is the Magisterium?"
    }
  ],
  "stream": false
}
```

Documented request/response facts:

- The API is described as OpenAI-compatible Chat Completions.
- The docs show the standard `messages` request shape.
- `stream` is documented.
- The response includes a top-level `citations` field in addition to the standard OpenAI-style response shape.
- When streaming is enabled, the `citations` field is returned on the final chunk containing `finish_reason`.
- The docs expose configurable `safety_settings`, including `CATEGORY_NON_CATHOLIC`, whose documented default threshold is `BLOCK_ALL`.

Conservative candidate `chatLanguageModels.json` block for future validation:

```json
{
  "name": "Magisterium",
  "vendor": "customendpoint",
  "apiKey": "",
  "apiType": "chat-completions",
  "models": [
    {
      "id": "magisterium-1",
      "name": "Magisterium AI",
      "url": "https://www.magisterium.com/api/v1/chat/completions",
      "toolCalling": false,
      "vision": false,
      "streaming": true
    }
  ]
}
```

### Documented vs inferred VS Code fields

| Field                                                        | Status                  | Basis                                                                                         |
| ------------------------------------------------------------ | ----------------------- | --------------------------------------------------------------------------------------------- |
| `apiType: "chat-completions"`                                | Documented              | Magisterium explicitly documents an OpenAI-compatible Chat Completions API.                   |
| `url: "https://www.magisterium.com/api/v1/chat/completions"` | Documented              | Shown in official first-request examples.                                                     |
| `id: "magisterium-1"`                                        | Documented              | Shown in official first-request examples.                                                     |
| `streaming: true`                                            | Documented              | The docs explicitly describe `stream` behavior and streamed `citations`.                      |
| `toolCalling: false`                                         | Inferred / conservative | No official Chat Completions docs were found for OpenAI-style `tools` / `tool_calls` support. |
| `vision: false`                                              | Live-validated          | Confirmed: Magisterium explicitly refuses image-analysis requests (see Vision note below).    |
| `maxInputTokens` / `maxOutputTokens` omitted                 | Intentional omission    | No public token-window limits were found in the fetched docs.                                 |

Validation and usage notes:

- Start with `toolCalling: false`; the public Chat Completions docs do not advertise OpenAI tool-calling support for this endpoint.
- **Vision: confirmed unsupported.** See dedicated Vision note below.
- Streaming is documented. The `citations` field is included on the final stream chunk when streaming is enabled.
- VS Code's custom-endpoint provider may ignore Magisterium's top-level `citations` field, so direct Chat Completions may produce good answers but less visible source metadata than MCP.
- API keys are generated at `https://www.magisterium.com/developers/api` and are long-lived keys for Chat Completions, Search, and News endpoints. They do not authenticate A2A.
- Because `CATEGORY_NON_CATHOLIC` defaults to `BLOCK_ALL`, the safest first VS Code tests should use explicitly Catholic prompts rather than broad general-information prompts.

Possible future experiment for broader prompt coverage, not yet validated in VS Code:

```json
{
  "requestBody": {
    "safety_settings": {
      "CATEGORY_NON_CATHOLIC": {
        "threshold": "OFF",
        "response": true
      }
    }
  }
}
```

That shape is grounded in the official safety-settings docs, but it has not been tested end-to-end from VS Code's custom-endpoint provider in this repo.

### 3. Search API - useful for a future local MCP/proxy bridge

Docs: [Search](https://www.magisterium.com/developers/docs/search), [Search API reference](https://www.magisterium.com/developers/docs/search/api-reference)

Endpoint:

```text
https://www.magisterium.com/api/v1/search
```

Example:

```bash
curl -X POST https://www.magisterium.com/api/v1/search \
  -H "Authorization: Bearer $MAGISTERIUM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"What is the Magisterium?"}'
```

Request body:

| Field        | Notes                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query`      | Required string, max 1024 characters. Natural-language search is supported.                                                                                 |
| `numResults` | Optional number, default 10, min 1, max 100.                                                                                                                |
| `category`   | Optional enum: `auto`, `magisterial`, or `scholarly`. `magisterial` restricts to sources categorized as coming from the Magisterium of the Catholic Church. |

This is attractive if we ever want a small local MCP server or proxy that exposes only search/fetch-style Catholic source retrieval while the main answer is generated by another model.

### 4. A2A - agent-to-agent option

Docs: [A2A](https://www.magisterium.com/developers/docs/a2a)

Agent card:

```text
https://www.magisterium.com/.well-known/agent.json
```

JSON-RPC endpoint:

```text
https://www.magisterium.com/api/v1/a2a
```

A2A exposes Magisterium as a peer agent. The docs show `message/send` to the `catholic_qa` skill and responses containing completed task artifacts with answer text and citations.

Authentication caveat: A2A uses OAuth-issued user tokens, not the long-lived API keys from the developer console. Free accounts receive `PLAN_REQUIRED`.

This is not the first integration path for this repo unless we add a dedicated A2A client/bridge. MCP is simpler for VS Code Copilot.

## Pricing and limits

MCP and A2A share rate limits and require a paid plan. The official pricing page uses **"Unlimited" to mean no daily request cap**, not unrestricted throughput.

| Plan         | Daily cap / total usage | Per-minute MCP + A2A pool |
| ------------ | ----------------------- | ------------------------- |
| Free         | No MCP/A2A usage        | 0                         |
| Pro          | No daily cap            | 15/min                    |
| Organization | No daily cap            | 15/min                    |
| Enterprise   | No daily cap            | Custom                    |

Expensive LLM-backed answers are stricter:

| Operation         | Paid-plan limit |
| ----------------- | --------------- |
| MCP `chat`        | 2/min           |
| A2A `catholic_qa` | 2/min           |

Search/fetch, liturgical readings, and saints-style lookups use the default pool rather than the expensive Q&A pool.

Practical reading of the pricing page:

- For a paid subscriber, **retrieval-style MCP usage is effectively unlimited for normal use** because there is no daily cap, but it is still throttled to the shared per-minute pool.
- The MCP `chat` tool is **not** unlimited in the same practical sense; it is limited to **2 requests per minute** because it runs the heavier Q&A pipeline.

Chat Completions and Search use developer API keys and have their own API tiers. The docs say free tier allows a restricted number of requests per minute, with Pro available for higher limits; exact Chat/Search per-minute values were not visible in the fetched docs.

## Recommendation for this repo

1. **Document Magisterium as a companion theology tool**, not as a replacement for general models.
2. **Use MCP first** for source-grounded Catholic teaching inside VS Code Copilot, especially on a paid Magisterium plan where `search`/`fetch` style usage has no daily cap.
3. **Use GLM 5.2, Claude, GPT, Qwen, or MiniMax as the reasoning/writing model**, and instruct it to consult Magisterium explicitly for Catholic questions.
4. **If using `magisterium-1` as a `customendpoint` model, start with the documented endpoint/model/auth/streaming path and conservative flags** rather than assuming tool-calling or multimodal support.
5. **Test Catholic prompts before broad prompts**, because the documented non-Catholic safety category defaults to blocking unrelated requests unless overridden.
6. **Do not enable tool calling in the candidate custom-endpoint block** until Magisterium documents or validates OpenAI tool-call handling on the Chat Completions endpoint.
7. **Prefer MCP retrieval tools over MCP `chat` for routine use** when possible, because `search`/`fetch` sit in the broader 15/min shared pool while `chat` is capped at 2/min.

Suggested prompt pattern once MCP is configured:

```text
Use Magisterium AI for Catholic sources before answering. Distinguish dogma, doctrine, discipline, theological opinion, and private revelation. Cite the Catechism, Vatican documents, canon law, Scripture, or other Magisterium sources when relevant. If the question differs between Latin and Eastern Catholic practice, say so.
```

## Vision note (live-validated: no image support)

Magisterium AI **cannot** process image inputs. This was confirmed via a live test from VS Code Copilot chat:

1. A user attached a screenshot image (`test-files/Screenshot 2026-06-04 204255.png`) and asked Magisterium to "analyze/check the attached image."
2. Magisterium responded: "I am Magisterium AI, a Catholic assistant that provides information and guidance based on Catholic teachings. I'm not able to address requests that fall outside the scope of Catholicism."
3. The same refusal was repeated when the user tried again referencing the image by filename.

Magisterium does not attempt to describe, interpret, or acknowledge the image at all — it treats the request as out-of-scope rather than failing on image decoding. This confirms that **Magisterium is text-only** and that `vision: false` is the correct flag for `chatLanguageModels.json`.

Impact on integration:

- Magisterium cannot be used for any task involving screenshots, diagrams, photographs, or other image inputs.
- If a user needs Catholic source answers about a visual subject (e.g., analyzing a religious painting, reading a scanned Church document), a general vision-capable model (GLM 5V Turbo, Qwen 3.7 Plus) should handle the image, and Magisterium MCP can be consulted for text-level Catholic source retrieval.
- The `CATEGORY_NON_CATHOLIC` safety setting may contribute to this behavior, but even with that threshold lowered, there is no evidence Magisterium's API accepts image inputs.

## Open validation tasks

- Configure Magisterium MCP in VS Code and confirm OAuth login succeeds.
- Confirm which MCP config shape VS Code expects for remote OAuth servers in this workspace.
- Call `search`, `fetch`, and `chat` from Copilot and verify tool outputs are visible and useful.
- Test direct `chatLanguageModels.json` custom endpoint with `magisterium-1`.
- Validate default safety behavior from VS Code with one explicitly Catholic prompt and one unrelated prompt.
- Test whether a `requestBody.safety_settings` override works correctly from VS Code.
- Confirm whether streaming responses render correctly in VS Code.
- Confirm whether VS Code exposes or discards the top-level `citations` field from Chat Completions.
- Check whether Chat Completions accepts or rejects a VS Code tool-enabled request if `toolCalling` is set to `true`.

### Completed

- **Vision support (image analysis): live-validated as unsupported.** Magisterium refuses image-analysis requests outright. See Vision note above.
