# v2 Lists API

Base URL: `https://api.affinity.co`
Auth: Bearer token

## GET /v2/lists

Paginate all accessible lists.

**Query Params:** `cursor`, `limit` (default 100)

**Response:** `{ data: ListWithType[], pagination }`

**ListWithType:**

| Field | Type |
|-------|------|
| `id` | int64 |
| `name` | string |
| `type` | `company` / `opportunity` / `person` |
| `isPublic` | boolean |
| `ownerId` | int64 |
| `creatorId` | int64 |

## GET /v2/lists/{listId}

Single list metadata.

**Response:** ListWithType (unwrapped).

## GET /v2/lists/{listId}/fields

Field metadata for a list (includes list-specific fields). Paginated.

**Query Params:** `cursor`, `limit` (default 100)

**Response:** `{ data: FieldMetadata[], pagination }`

---

## GET /v2/lists/{listId}/list-entries

Paginate list entries with embedded entity and field data. Requires "Export data from Lists".

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | string | -- | Pagination cursor |
| `limit` | int32 | 100 | 1-100 |
| `fieldIds` | string[] | -- | Field IDs to include |
| `fieldTypes` | string[] | -- | `enriched`, `global`, `list`, `relationship-intelligence` |

**Response:** `{ data: ListEntryWithEntity[], pagination }`

**ListEntryWithEntity** — discriminated union on `type`:

### CompanyListEntry (`type: "company"`)
```
{ id, type: "company", listId, createdAt, creatorId, entity: Company }
```

### PersonListEntry (`type: "person"`)
```
{ id, type: "person", listId, createdAt, creatorId, entity: Person }
```

### OpportunityListEntry (`type: "opportunity"`)
```
{ id, type: "opportunity", listId, createdAt, creatorId, entity: OpportunityWithFields }
```

**OpportunityWithFields:** `{ id, name, listId, fields: Field[] }`

## GET /v2/lists/{listId}/list-entries/{listEntryId}

Single list entry. Same `fieldIds`/`fieldTypes` params. Returns ListEntryWithEntity (unwrapped).

---

## GET /v2/lists/{listId}/list-entries/{listEntryId}/fields

Paginate field values on a list entry.

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `ids` | string[] | -- | Filter by field IDs |
| `types` | string[] | -- | Filter by field types |
| `cursor` | string | -- | Cursor |
| `limit` | int32 | **20** | 1-100 (note: default is 20, not 100) |

**Response:** `{ data: Field[], pagination }`

## GET /v2/lists/{listId}/list-entries/{listEntryId}/fields/{fieldId}

Single field value. Returns Field object (unwrapped).

---

## POST /v2/lists/{listId}/list-entries/{listEntryId}/fields/{fieldId}

Update a single field value. Returns **204 No Content** on success.

**Body:** `{ "value": FieldValueUpdate }`

**FieldValueUpdate** — discriminated union on `type`:

| type | data |
|------|------|
| `text` | string or null |
| `filterable-text` | string or null |
| `filterable-text-multi` | string[] or null |
| `number` | number or null |
| `number-multi` | number[] or null |
| `datetime` | ISO 8601 string or null |
| `location` | `{ streetAddress, city, state, country, continent }` or null |
| `location-multi` | Location[] or null |
| `dropdown` | `{ dropdownOptionId: int64 }` or null |
| `dropdown-multi` | `[{ dropdownOptionId }]` or null |
| `ranked-dropdown` | `{ dropdownOptionId: int64 }` or null |
| `person` | `{ id: int64 }` or null |
| `person-multi` | `[{ id }]` (max 100) or null |
| `company` | `{ id: int64 }` or null |
| `company-multi` | `[{ id }]` (max 100) or null |

**Example:**
```json
{ "value": { "type": "dropdown", "data": { "dropdownOptionId": 123 } } }
```

## PATCH /v2/lists/{listId}/list-entries/{listEntryId}/fields

Batch update up to 100 fields at once.

**Body:**
```json
{
  "operation": "update-fields",
  "updates": [
    { "id": "field-1", "value": { "type": "text", "data": "New value" } },
    { "id": "field-2", "value": { "type": "number", "data": 42 } }
  ]
}
```

**Response:** `{ "operation": "update-fields" }` (200 OK)

---

## GET /v2/lists/{listId}/saved-views

Paginate saved views for a list.

**Response:** `{ data: SavedView[], pagination }`

**SavedView:** `{ id, name, type: "sheet"/"board"/"dashboard", createdAt }`

## GET /v2/lists/{listId}/saved-views/{viewId}

Single saved view metadata.

## GET /v2/lists/{listId}/saved-views/{viewId}/list-entries

List entries filtered by saved view. Only `sheet`-type views supported.

**Query Params:** `cursor`, `limit` (default 100). Does NOT accept `fieldIds`/`fieldTypes` — returns columns configured in the view.

**Key behaviors:**
- Respects view filters
- Returns view-configured field data only
- Does NOT respect sort order
- Only sheet-type views supported

**Response:** Same `ListEntryWithEntity` format.
