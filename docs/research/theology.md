# Catholic Theology / Magisterium AI Integration Research

> Researched: June 25, 2026. Status: promising, not yet live-validated from VS Code in this repo.

## Summary

[Magisterium AI](https://www.magisterium.com/) is a Catholic-specific answer engine and knowledge platform. It is a better fit for questions about Catholic doctrine, morals, liturgy, Scripture, canon law, saints, dioceses, and Church history than a general-purpose model alone, because it is designed to answer from a curated Catholic corpus rather than from broad model memory.

The strongest integration path for this repo is **MCP first**, with **Chat Completions as a secondary custom-endpoint candidate**.

- **MCP** gives VS Code Copilot access to Magisterium's Catholic source tools: search, fetch, Mass readings, martyrology, saints, clergy/pope/diocese lookup, and a cited `chat` tool.
- **Chat Completions** is OpenAI-compatible at `https://www.magisterium.com/api/v1/chat/completions` with model `magisterium-1`, so it may fit `chatLanguageModels.json` as a `customendpoint` model.
- **A2A** is useful for custom agent frameworks, but it is not the natural first integration for this repo unless we build a dedicated A2A client or bridge.

## Public capabilities

Magisterium's home page describes it as the "World's #1 answer engine for the Catholic Church" and says it draws on more than **32,000 Catholic texts**. Public feature claims include:

- Catholic Q&A aligned with Church teaching.
- Built-in document viewer and source-grounded responses.
- Biblical commentary for Scripture study, teaching, and homily prep.
- Saints database with more than 12,000 entries.
- Ecclesiastical directory with dioceses, bishops, cathedrals, basilicas, and major Church events.
- Diocesan statistics and financial records.
- Mass readings, saints of the day, prayers, Catholic news, and other widgets.
- Native apps, WhatsApp, Claude/ChatGPT MCP connectors, API, MCP, and A2A.

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

Important limit: MCP requires a paid Magisterium plan. Free accounts receive `PLAN_REQUIRED` for MCP tool calls.

### 2. Chat Completions - possible custom endpoint

Docs: [Chat Completions](https://www.magisterium.com/developers/docs/chat), [first request](https://www.magisterium.com/developers/docs/chat/making-first-request), [citations](https://www.magisterium.com/developers/docs/chat/citations)

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

Candidate `chatLanguageModels.json` block for future validation:

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

Validation notes:

- Start with `toolCalling: false`; the public Chat Completions docs do not advertise OpenAI tool-calling support for this endpoint.
- Streaming is documented. The `citations` field is included on the final stream chunk when streaming is enabled.
- VS Code's custom-endpoint provider may ignore Magisterium's top-level `citations` field, so direct Chat Completions may produce good answers but less visible source metadata than MCP.
- API keys are generated at `https://www.magisterium.com/developers/api` and are long-lived keys for Chat Completions, Search, and News endpoints. They do not authenticate A2A.

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

MCP and A2A share rate limits and require a paid plan:

| Plan         | Daily requests   | Per-minute MCP + A2A pool |
| ------------ | ---------------- | ------------------------- |
| Free         | No MCP/A2A usage | 0                         |
| Pro          | Unlimited        | 15/min                    |
| Organization | Unlimited        | 15/min                    |
| Enterprise   | Custom           | Custom                    |

Expensive LLM-backed answers are stricter:

| Operation         | Paid-plan limit |
| ----------------- | --------------- |
| MCP `chat`        | 2/min           |
| A2A `catholic_qa` | 2/min           |

Search/fetch, liturgical readings, and saints-style lookups use the default pool rather than the expensive Q&A pool.

Chat Completions and Search use developer API keys and have their own API tiers. The docs say free tier allows a restricted number of requests per minute, with Pro available for higher limits; exact Chat/Search per-minute values were not visible in the fetched docs.

## Recommendation for this repo

1. **Document Magisterium as a companion theology tool**, not as a replacement for general models.
2. **Use MCP first** for source-grounded Catholic teaching inside VS Code Copilot.
3. **Use GLM 5.2, Claude, GPT, Qwen, or MiniMax as the reasoning/writing model**, and instruct it to consult Magisterium explicitly for Catholic questions.
4. **Validate `magisterium-1` as a `customendpoint` model separately** with a real API key before adding it to the default example config.
5. **Do not enable tool calling in the candidate custom-endpoint block** until Magisterium documents or validates OpenAI tool-call handling on the Chat Completions endpoint.

Suggested prompt pattern once MCP is configured:

```text
Use Magisterium AI for Catholic sources before answering. Distinguish dogma, doctrine, discipline, theological opinion, and private revelation. Cite the Catechism, Vatican documents, canon law, Scripture, or other Magisterium sources when relevant. If the question differs between Latin and Eastern Catholic practice, say so.
```

## Open validation tasks

- Configure Magisterium MCP in VS Code and confirm OAuth login succeeds.
- Confirm which MCP config shape VS Code expects for remote OAuth servers in this workspace.
- Call `search`, `fetch`, and `chat` from Copilot and verify tool outputs are visible and useful.
- Test direct `chatLanguageModels.json` custom endpoint with `magisterium-1`.
- Confirm whether streaming responses render correctly in VS Code.
- Confirm whether VS Code exposes or discards the top-level `citations` field from Chat Completions.
- Check whether Chat Completions accepts or rejects a VS Code tool-enabled request if `toolCalling` is set to `true`.
