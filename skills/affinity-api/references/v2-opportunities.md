# v2 Opportunities API

Base URL: `https://api.affinity.co`
Auth: Bearer token
Requires "Export data from Lists" permission.

## GET /v2/opportunities

Paginate all opportunities. Returns basic info only (NO field data).

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | string | -- | Pagination cursor |
| `limit` | int32 | 100 | 1-100 |
| `ids` | int64[] | -- | Filter by opportunity IDs |

**Response:** `{ data: Opportunity[], pagination }`

**Opportunity:** `{ id: int64, name: string, listId: int64 }`

**Important:** For field data on opportunities, use `GET /v2/lists/{listId}/list-entries` with `fieldIds`/`fieldTypes`.

## GET /v2/opportunities/{opportunityId}

Single opportunity. Returns basic info only.

**Response:** `{ id, name, listId }`

## GET /v2/opportunities/{opportunityId}/notes

Notes for an opportunity. Default limit: 20.

**Query Params:** `filter`, `cursor`, `limit` (default 20), `totalCount`

**Filter props:** `creator.id` (=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**Response:** `{ data: Note[], pagination: { prevUrl, nextUrl, totalCount? } }`
