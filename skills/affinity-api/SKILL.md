---
name: affinity-api
description: |
  Affinity CRM API (v1 + v2) for managing deal flow, relationships, and pipeline data.
  Use when: (1) Reading/writing companies, persons, or opportunities, (2) Managing lists and list entries,
  (3) Working with field values and field metadata, (4) Querying notes, emails, meetings, calls, or chat messages,
  (5) Uploading/downloading entity files, (6) Managing webhooks, (7) Merging duplicate records,
  (8) Working with transcripts, (9) Any Affinity CRM API integration.
---

# Affinity CRM API

## Quick Reference

**Base URL:** `https://api.affinity.co`

**Auth (v1):** HTTP Basic Auth — `Authorization: Basic <base64(:API_KEY)>` (empty username, API key as password)

**Auth (v2):** Bearer token — `Authorization: Bearer <API_KEY>`

**Rate Limits:** 900 req/min per user. Monthly: Scale/Advanced 100k, Enterprise unlimited.

**API Version (v2):** `2024-01-01` (set via `x-affinity-api-version` header or when creating key)

## v1 vs v2 Summary

| Feature | v1 | v2 |
|---------|----|----|
| Auth | Basic Auth | Bearer Token |
| CRUD | Full CRUD on all resources | Read-only + field updates on list entries |
| Pagination | `page_size` + `page_token` | Cursor-based (`cursor` + `limit`, follow `nextUrl`) |
| Field data | Separate field-values endpoint | Inline on entity via `fieldIds`/`fieldTypes` params |
| Interactions | Single `/interactions` endpoint | Separate `/emails`, `/calls`, `/meetings`, `/chat-messages` |

## Common Operations

### List all companies (v2)
```
GET /v2/companies?fieldTypes=enriched&fieldTypes=global&limit=100
```

### Get a person with fields (v2)
```
GET /v2/persons/{id}?fieldIds=field-1234&fieldIds=affinity-data-location
```

### Update a field value on a list entry (v2)
```
POST /v2/lists/{listId}/list-entries/{entryId}/fields/{fieldId}
Body: { "value": { "type": "dropdown", "data": { "dropdownOptionId": 123 } } }
```

### Create a person (v1)
```
POST /persons
Body: { "first_name": "Jane", "last_name": "Doe", "emails": ["jane@example.com"] }
```

### Search organizations (v1)
```
GET /organizations?term=Acme&with_interaction_dates=true
```

## Reference Documentation

### v1 API (Full CRUD)
- **[v1-lists.md](references/v1-lists.md)** — Lists, list entries
- **[v1-persons.md](references/v1-persons.md)** — Persons CRUD + search
- **[v1-organizations.md](references/v1-organizations.md)** — Organizations CRUD + search
- **[v1-opportunities.md](references/v1-opportunities.md)** — Opportunities CRUD
- **[v1-fields.md](references/v1-fields.md)** — Fields + field values + field value changes
- **[v1-interactions.md](references/v1-interactions.md)** — Interactions (email/meeting/call/chat)
- **[v1-notes.md](references/v1-notes.md)** — Notes CRUD
- **[v1-other.md](references/v1-other.md)** — Files, reminders, webhooks, whoami, rate-limit

### v2 API (Read + Field Updates)
- **[v2-companies.md](references/v2-companies.md)** — Companies, fields, lists, list entries, notes
- **[v2-persons.md](references/v2-persons.md)** — Persons, fields, lists, list entries, notes
- **[v2-opportunities.md](references/v2-opportunities.md)** — Opportunities + notes
- **[v2-lists.md](references/v2-lists.md)** — Lists, list entries, field values, saved views, batch updates
- **[v2-notes.md](references/v2-notes.md)** — Notes, replies, attached entities
- **[v2-interactions.md](references/v2-interactions.md)** — Emails, calls, meetings, chat messages
- **[v2-merges.md](references/v2-merges.md)** — Company + person merge operations (BETA)
- **[v2-transcripts.md](references/v2-transcripts.md)** — Transcripts + fragments (BETA)
- **[v2-other.md](references/v2-other.md)** — Auth whoami, feedback
- **[v2-data-model.md](references/v2-data-model.md)** — Data model, field types, filtering syntax, permissions

## Critical Notes

1. **v2 field data not returned by default** — must specify `fieldIds` or `fieldTypes` query params
2. **Nested associations truncated at 100** — person/company multi arrays capped
3. **Empty arrays return `null`** — not `[]` for multi-type fields with no data
4. **Date normalization (Jan 2026)** — timestamps stored as midnight PT, time components ignored
5. **v1 `.unique()` vs `.first()`** — never use `.unique()` on Convex queries (per project guidelines)
6. **Partner data restrictions** — Crunchbase, Pitchbook, and Dealroom "exclusive" fields not exposed via API
7. **Saved views** — only `sheet`-type supported, respects filters but NOT sort order
