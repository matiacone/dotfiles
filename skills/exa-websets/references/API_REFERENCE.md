# Exa Websets API Reference

## All Endpoints

### Websets

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v0/websets` | Create a Webset (with optional search, enrichments, imports, excludes) |
| `GET` | `/v0/websets/{id}` | Get a Webset by ID (supports `?expand=items` for latest 100 items) |
| `POST` | `/v0/websets/{id}` | Update a Webset (metadata, excludes) |
| `DELETE` | `/v0/websets/{id}` | Delete a Webset and all its Items |
| `POST` | `/v0/websets/{id}/cancel` | Cancel all running operations on a Webset |
| `POST` | `/v0/websets/preview` | Preview how a query will be decomposed before committing |
| `GET` | `/v0/websets` | List all Websets (cursor-based pagination) |

### Items

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v0/websets/{webset}/items` | List all items (cursor pagination, `limit` param) |
| `GET` | `/v0/websets/{webset}/items/{id}` | Get a single item |
| `DELETE` | `/v0/websets/{webset}/items/{id}` | Delete an item (cancels its enrichments) |

### Searches

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v0/websets/{webset}/searches` | Create a new search on an existing Webset |
| `GET` | `/v0/websets/{webset}/searches/{id}` | Get a search by ID |
| `POST` | `/v0/websets/{webset}/searches/{id}/cancel` | Cancel a running search |

### Enrichments

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v0/websets/{webset}/enrichments` | Create an enrichment |
| `GET` | `/v0/websets/{webset}/enrichments/{id}` | Get an enrichment |
| `PATCH` | `/v0/websets/{webset}/enrichments/{id}` | Update an enrichment |
| `DELETE` | `/v0/websets/{webset}/enrichments/{id}` | Delete an enrichment (cancels running, removes all results) |
| `POST` | `/v0/websets/{webset}/enrichments/{id}/cancel` | Cancel a running enrichment |

### Imports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v0/imports` | Create an import (returns `uploadUrl` valid for ~1 hour) |
| `GET` | `/v0/imports/{id}` | Get an import |
| `PATCH` | `/v0/imports/{id}` | Update an import |
| `DELETE` | `/v0/imports/{id}` | Delete an import |
| `GET` | `/v0/imports` | List all imports |

Imports can be used to: **Enrich** (enhance your data), **Search** (use as scope for agentic search), **Exclude** (prevent duplicates).

### Monitors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v0/monitors` | Create a monitor |
| `GET` | `/v0/monitors/{id}` | Get a monitor |
| `PATCH` | `/v0/monitors/{id}` | Update a monitor |
| `DELETE` | `/v0/monitors/{id}` | Delete a monitor |
| `GET` | `/v0/monitors` | List all monitors |
| `GET` | `/v0/monitors/{id}/runs` | List monitor runs |
| `GET` | `/v0/monitors/{id}/runs/{runId}` | Get a specific monitor run |

Monitor behavior types:
- `search` -- Find new content matching criteria, auto-deduplicates
- `refresh` -- Update existing items by re-crawling source URLs or re-running enrichments

Scheduling: Unix cron expression (5 fields), max once per day. IANA timezone (default `Etc/UTC`).

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v0/webhooks` | Create a webhook (returns `secret` for signature verification -- save it, shown only once) |
| `GET` | `/v0/webhooks/{id}` | Get a webhook |
| `PATCH` | `/v0/webhooks/{id}` | Update a webhook (events, URL, metadata) |
| `DELETE` | `/v0/webhooks/{id}` | Delete a webhook |
| `GET` | `/v0/webhooks` | List all webhooks |
| `GET` | `/v0/webhooks/{id}/attempts` | List webhook delivery attempts |

### Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v0/events` | List all events (cursor pagination) |
| `GET` | `/v0/events/{id}` | Get a single event |

## Event Types

| Event | Description |
|-------|-------------|
| `webset.created` | Webset was created |
| `webset.deleted` | Webset was deleted |
| `webset.idle` | Webset finished all operations |
| `webset.paused` | Webset was paused |
| `webset.search.created` | A search was started |
| `webset.search.updated` | Search progress updated |
| `webset.search.completed` | Search finished |
| `webset.search.canceled` | Search was canceled |
| `webset.item.created` | New item added to Webset |
| `webset.item.enriched` | Item enrichment completed |
| `webset.export.created` | Export was created |
| `webset.export.completed` | Export finished |

## Full Response Shapes

### WebsetItem

```json
{
  "id": "string",
  "object": "webset_item",
  "source": "search",
  "sourceId": "string",
  "websetId": "string",
  "properties": {
    "type": "person|company|article|research_paper|custom",
    "url": "string",
    "description": "string",
    "person": { "name": "", "location": "", "position": "", "company": { "name": "", "location": "" }, "pictureUrl": "" },
    "company": { "name": "", "location": "", "description": "" }
  },
  "evaluations": [{
    "criterion": "string",
    "reasoning": "string",
    "satisfied": "yes|no|unclear",
    "references": [{ "title": "", "snippet": "", "url": "" }]
  }],
  "enrichments": [{
    "object": "enrichment_result",
    "status": "pending|running|completed|failed",
    "format": "text|number|date|email|phone|options",
    "result": ["string array of values"],
    "reasoning": "string",
    "references": [{ "title": "", "snippet": "", "url": "" }],
    "enrichmentId": "string"
  }],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Search Progress

```json
{
  "progress": {
    "found": 123,
    "analyzed": 123,
    "completion": 50,
    "timeLeft": 123
  }
}
```

### Recall Metrics (when `recall: true`)

```json
{
  "recall": {
    "expected": { "total": 123, "confidence": "high", "bounds": { "min": 123, "max": 123 } },
    "reasoning": "string"
  }
}
```

### Pagination (all list endpoints)

```json
{
  "data": [],
  "hasMore": true,
  "nextCursor": "string"
}
```

Pass `cursor` and optionally `limit` (max 200) as query parameters.

## Monitor Schema

```json
{
  "websetId": "string (required)",
  "cadence": {
    "cron": "string (required) -- 5-field Unix cron, max once/day",
    "timezone": "string -- IANA timezone, default Etc/UTC"
  },
  "behavior": {
    "type": "search|refresh",
    "config": {
      "query": "string",
      "criteria": [{ "description": "string" }],
      "entity": { "type": "company" },
      "count": 10,
      "behavior": "append"
    }
  },
  "metadata": {}
}
```

Statuses: `enabled`, `disabled`
Run statuses: `created`, `running`, `completed`, `failed`, `canceled`

## Import Workflow

```bash
# 1. Create import
curl -X POST https://api.exa.ai/websets/v0/imports \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${EXA_API_KEY}" \
  -d '{ "format": "csv", "entity": { "type": "company" } }'

# Response includes uploadUrl (valid ~1 hour) -- PUT your CSV there

# 2. Use import as scope in a search
curl -X POST https://api.exa.ai/websets/v0/websets \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${EXA_API_KEY}" \
  -d '{
    "search": {
      "query": "Companies with recent AI product launches",
      "count": 50,
      "scope": [{ "source": "import", "id": "imp_xyz" }]
    }
  }'
```

Import statuses: `pending`, `processing`, `completed`, `failed`

## Webhook Signature Verification

- Secret returned ONLY on webhook creation (store securely)
- Verify using HMAC-SHA256

## Full SDK Reference

### TypeScript (exa-js)

```typescript
import Exa from "exa-js";
const exa = new Exa(process.env.EXA_API_KEY);

// Websets
exa.websets.create(params)
exa.websets.get(id, { expand: ["items"] })
exa.websets.list({ cursor, limit })
exa.websets.update(id, params)
exa.websets.delete(id)
exa.websets.cancel(id)
exa.websets.waitUntilIdle(id, { timeout, pollInterval, onPoll })

// Items
exa.websets.items.list(websetId, { limit, cursor })
exa.websets.items.get(websetId, itemId)
exa.websets.items.delete(websetId, itemId)

// Searches
exa.websets.searches.create(websetId, params)
exa.websets.searches.get(websetId, searchId)
exa.websets.searches.cancel(websetId, searchId)

// Enrichments
exa.websets.enrichments.create(websetId, params)
exa.websets.enrichments.get(websetId, enrichmentId)
exa.websets.enrichments.update(websetId, enrichmentId, params)
exa.websets.enrichments.delete(websetId, enrichmentId)
exa.websets.enrichments.cancel(websetId, enrichmentId)

// Webhooks
exa.websets.webhooks.create(params)
exa.websets.webhooks.get(webhookId)
exa.websets.webhooks.list({ cursor, limit })
exa.websets.webhooks.update(webhookId, params)
exa.websets.webhooks.delete(webhookId)
```

### Python (exa-py)

```python
from exa_py import Exa
from exa_py.websets.types import CreateWebsetParameters, CreateEnrichmentParameters

exa = Exa("EXA_API_KEY")

webset = exa.websets.create(
    params=CreateWebsetParameters(
        search={"query": "...", "count": 5},
        enrichments=[
            CreateEnrichmentParameters(description="...", format="text"),
        ],
    )
)

webset = exa.websets.wait_until_idle(webset.id)  # timeout=3600, poll_interval=5
items = exa.websets.items.list(webset_id=webset.id)
```

## cURL Examples

### Create a Webset

```bash
curl -X POST https://api.exa.ai/websets/v0/websets \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${EXA_API_KEY}" \
  -d '{
    "search": {
      "query": "Marketing agencies based in the US that focus on consumer products",
      "count": 10
    },
    "enrichments": [
      { "description": "Annual revenue estimate", "format": "number" },
      { "description": "Key clients or brands", "format": "text" }
    ]
  }'
```

### Check Status

```bash
curl -X GET "https://api.exa.ai/websets/v0/websets/${WEBSET_ID}" \
  -H "x-api-key: ${EXA_API_KEY}"
```

### Get Items (with expand)

```bash
curl -X GET "https://api.exa.ai/websets/v0/websets/${WEBSET_ID}?expand=items" \
  -H "x-api-key: ${EXA_API_KEY}"
```

### Create a Monitor

```bash
curl -X POST https://api.exa.ai/websets/v0/monitors \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${EXA_API_KEY}" \
  -d '{
    "websetId": "ws_abc123",
    "cadence": { "cron": "0 9 * * 1", "timezone": "America/New_York" },
    "behavior": {
      "type": "search",
      "config": {
        "query": "AI startups that raised Series A in the last week",
        "count": 10,
        "criteria": [{ "description": "Company is an AI startup" }],
        "entity": { "type": "company" },
        "behavior": "append"
      }
    }
  }'
```

### Create a Webhook

```bash
curl -X POST https://api.exa.ai/websets/v0/webhooks \
  -H "Content-Type: application/json" \
  -H "x-api-key: ${EXA_API_KEY}" \
  -d '{
    "events": ["webset.item.created", "webset.idle"],
    "url": "https://your-app.com/webhooks/exa"
  }'
```

## MCP Server Configuration

### Hosted (recommended)

```json
{
  "mcpServers": {
    "exa-websets": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.exa.ai/websets?exaApiKey=YOUR_KEY"]
    }
  }
}
```

### Local (npm)

```json
{
  "mcpServers": {
    "websets": {
      "command": "npx",
      "args": ["-y", "websets-mcp-server"],
      "env": { "EXA_API_KEY": "your-key" }
    }
  }
}
```

## Pricing

- 10 credits per matching result
- 5 credits per email/phone enrichment
- 2 credits per row for other enrichments
- 2 credits per resolved import result
- Free: 1,000 credits, max 25 results/Webset
- Core ($49/mo): 8,000 credits, max 100 results/Webset
- Pro ($449/mo): 100,000 credits, max 1,000 results, API access
- Enterprise: Custom
