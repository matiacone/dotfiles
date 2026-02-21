# v2 Persons API

Base URL: `https://api.affinity.co`
Auth: Bearer token

## GET /v2/persons

Paginate all persons. Requires "Export All People directory" permission.

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | string | -- | Pagination cursor |
| `limit` | int32 | 100 | 1-100 |
| `ids` | int64[] | -- | Filter by person IDs |
| `fieldIds` | string[] | -- | Field IDs to return data for |
| `fieldTypes` | string[] | -- | `enriched`, `global`, `relationship-intelligence` |

**Response:** `{ data: Person[], pagination: { prevUrl, nextUrl } }`

**Person:**

| Field | Type |
|-------|------|
| `id` | int64 |
| `firstName` | string |
| `lastName` | string or null |
| `primaryEmailAddress` | string (email) or null |
| `emailAddresses` | string[] |
| `type` | `internal` / `external` |
| `fields` | Field[] (only if fieldIds/fieldTypes specified) |

## GET /v2/persons/{personId}

Single person. Same field selection query params.

**Response:** Person object (unwrapped).

## GET /v2/persons/fields

Person field metadata. Paginated.

**Query Params:** `cursor`, `limit` (default 100)

**Response:** `{ data: FieldMetadata[], pagination }`

Same FieldMetadata schema as v2-companies.md.

## GET /v2/persons/{personId}/lists

Lists containing this person. Paginated.

**Response:** `{ data: List[], pagination }`

## GET /v2/persons/{personId}/list-entries

List entries across all lists. Requires "Export data from Lists".

**Response:** `{ data: ListEntry[], pagination }`

## GET /v2/persons/{personId}/notes

Notes for a person. Default limit: 20. Includes directly attached notes, meeting notes, and mentions.

**Query Params:** `filter`, `cursor`, `limit` (default 20), `totalCount`

**Filter props:** `creator.id` (=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**Response:** `{ data: Note[], pagination: { prevUrl, nextUrl, totalCount? } }`
