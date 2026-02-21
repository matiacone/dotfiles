# v2 Companies API

Base URL: `https://api.affinity.co`
Auth: Bearer token

## GET /v2/companies

Paginate all companies. Requires "Export All Organizations directory" permission.

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | string | -- | Pagination cursor |
| `limit` | int32 | 100 | 1-100 |
| `ids` | int64[] | -- | Filter by company IDs |
| `fieldIds` | string[] | -- | Field IDs to return data for |
| `fieldTypes` | string[] | -- | `enriched`, `global`, `relationship-intelligence` |

**Response:** `{ data: Company[], pagination: { prevUrl, nextUrl } }`

**Company:**

| Field | Type |
|-------|------|
| `id` | int64 |
| `name` | string |
| `domain` | string or null |
| `domains` | string[] |
| `isGlobal` | boolean |
| `fields` | Field[] (only if fieldIds/fieldTypes specified) |

## GET /v2/companies/{companyId}

Single company. Same query params as above (minus cursor/limit/ids).

**Response:** Company object (unwrapped).

## GET /v2/companies/fields

Company field metadata. Paginated.

**Query Params:** `cursor`, `limit` (default 100)

**Response:** `{ data: FieldMetadata[], pagination }`

**FieldMetadata:**

| Field | Type |
|-------|------|
| `id` | string (e.g. `affinity-data-location`, `field-1234`) |
| `name` | string |
| `type` | `enriched` / `global` / `list` / `relationship-intelligence` |
| `valueType` | See value types in v2-data-model.md |
| `enrichmentSource` | `affinity-data` / `dealroom` / `eventbrite` / `mailchimp` / null |

## GET /v2/companies/{companyId}/lists

Lists containing this company. Paginated.

**Response:** `{ data: List[], pagination }`

**List:** `{ id, name, creatorId, ownerId, isPublic }`

## GET /v2/companies/{companyId}/list-entries

List entries for this company across all lists. Requires "Export data from Lists".

**Response:** `{ data: ListEntry[], pagination }`

**ListEntry:** `{ id, listId, createdAt, creatorId, fields: Field[] }`

## GET /v2/companies/{companyId}/notes

Notes for a company. Default limit: 20.

**Query Params:** `filter`, `cursor`, `limit` (default 20), `totalCount`

**Filter props:** `creator.id` (=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**Response:** `{ data: Note[], pagination: { prevUrl, nextUrl, totalCount? } }`

See v2-notes.md for Note schema.
