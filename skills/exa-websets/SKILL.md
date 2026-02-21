---
name: exa-websets
description: Exa Websets API for finding, verifying, and enriching structured web data at scale. Use when building entity search (companies, people, articles), lead sourcing, data enrichment, or web scraping features with the Exa Websets API or exa-js SDK. Triggers on Exa, Websets, entity search, lead generation, web data enrichment.
---

# Exa Websets

Exa Websets is an async, event-driven API for discovering entities (companies, people, articles, research papers) matching natural-language criteria, verifying each with AI agents, and enriching items with structured data.

**Base URL:** `https://api.exa.ai/websets/v0`
**Auth:** `x-api-key` header
**SDK:** `exa-js` (TypeScript), `exa-py` (Python)

## Core Workflow

1. **Create a Webset** with a search query -- returns immediately with `status: "running"`
2. **Search agents** find and verify entities against criteria
3. **Items** are added as they pass verification (`webset.item.created` event)
4. **Enrichment agents** extract additional data (`webset.item.enriched` event)
5. **Webset becomes `idle`** when done (`webset.idle` event)

## Key Concepts

### Criteria vs Enrichments

- **Criteria** = binary filters. ALL must be satisfied for inclusion. Max 5. Included in base cost.
- **Enrichments** = data extractors applied AFTER filtering. Max 10. Additional credits.
- Rule: Essential to whether you want the result? Criterion. Additional info about qualified results? Enrichment.
- Common mistake: Making "nice-to-haves" into criteria, which overly narrows results.

### Entity Types

- `company` -- name, location, description, URL
- `person` -- name, location, position, company info, pictureUrl
- `article` -- article metadata
- `research_paper` -- paper metadata
- `custom` -- requires a `description` field

### Enrichment Formats

`text` | `number` | `date` | `email` | `phone` | `options` (max 20 labels)

## TypeScript SDK Quick Reference

```typescript
import Exa from "exa-js";
const exa = new Exa(process.env.EXA_API_KEY);

// Create webset with search + enrichments
const webset = await exa.websets.create({
  search: {
    query: "AI companies in Europe that raised Series A funding",
    count: 10,
  },
  enrichments: [
    { description: "Company founding year", format: "number" },
    { description: "CEO name", format: "text" },
    { description: "Company stage", format: "options", options: [
      { label: "Seed" }, { label: "Series A" }, { label: "Series B+" }
    ]},
  ],
});

// Wait for completion
const idle = await exa.websets.waitUntilIdle(webset.id, {
  timeout: 60000, pollInterval: 2000,
  onPoll: (status) => console.log(`Status: ${status}...`),
});

// List items
const items = await exa.websets.items.list(webset.id, { limit: 10 });
```

### SDK Subclients

```
exa.websets.create/get/list/update/delete/cancel/waitUntilIdle
exa.websets.items.list/get/delete
exa.websets.searches.create/get/cancel
exa.websets.enrichments.create/get/update/delete/cancel
exa.websets.webhooks.create/get/list/update/delete
```

## Create Webset Request Shape

```json
{
  "search": {
    "query": "natural language description (required)",
    "count": 10,
    "entity": { "type": "company|person|article|research_paper|custom" },
    "criteria": [{ "description": "binary filter" }],
    "recall": true,
    "scope": [{ "source": "import|webset", "id": "..." }],
    "exclude": [{ "source": "import|webset", "id": "..." }],
    "behavior": "override|append"
  },
  "enrichments": [{
    "description": "what to extract",
    "format": "text|number|date|email|phone|options",
    "options": [{ "label": "..." }]
  }],
  "exclude": [{ "source": "import|webset", "id": "..." }],
  "externalId": "your-id",
  "metadata": {}
}
```

## Item Response Shape

Items have `properties` (entity data), `evaluations` (per-criterion reasoning with `satisfied: yes|no|unclear`), and `enrichments` (per-enrichment results with `status`, `result[]`, `reasoning`).

See [full API reference](references/API_REFERENCE.md) for complete endpoint listing, response shapes, monitors, imports, webhooks, and events.

## Best Practices

1. Start with the query, let the API auto-detect entity type and criteria
2. Keep criteria tight and essential -- move nice-to-haves to enrichments
3. Use `preview` endpoint before creating expensive Websets
4. Use webhooks for production, `waitUntilIdle` for scripts
5. Use `behavior: "append"` when adding searches to existing items (default is `override`)
6. Use `scope` for relational searches within imported data
7. Use `exclude` to prevent duplicates across searches/imports

## Common Pitfalls

- Overly restrictive criteria -- broaden criteria or reduce count if getting no results
- Websets finds entity lists, NOT answers to open-ended questions
- Results arrive incrementally -- poll or use webhooks
- New searches default to `override` which replaces existing items
- Check `evaluations[].satisfied` field -- items may have `unclear` matches

## Credits

- 10 credits per matching result
- 5 credits per email/phone enrichment
- 2 credits per row for other enrichments
- 2 credits per resolved import result
