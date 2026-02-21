# v1 Lists API

Base URL: `https://api.affinity.co`
Auth: HTTP Basic (`:API_KEY`)

## GET /lists

Returns all accessible lists.

**Response:** Array of list objects.

**List Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique list identifier |
| `type` | integer | 0=person, 1=organization, 8=opportunity |
| `name` | string | List title |
| `public` | boolean | Accessible to all users |
| `owner_id` | integer | Owner's internal person ID |
| `creator_id` | integer | Creator's internal person ID |
| `list_size` | integer | Number of entries |
| `additional_permissions` | object[] | `{ internal_person_id, role_id }` (0=Admin, 1=Basic, 2=Standard) |

## GET /lists/{list_id}

Returns a single list with its fields.

**Path Params:** `list_id` (integer, required)

**Response:** List object + `fields` array:

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Field ID |
| `name` | string | Field name |
| `value_type` | integer | See value types below |
| `allows_multiple` | boolean | Multi-value field |
| `dropdown_options` | object[] | `{ id, text, rank, color }` |

## POST /lists

Create a new list.

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | List title |
| `type` | integer | Yes | 0=person, 1=organization, 8=opportunity |
| `is_public` | boolean | Yes | Public/private |
| `owner_id` | integer | No | Defaults to API key owner |
| `additional_permissions` | object[] | No | `{ internal_person_id, role_id }` |

---

# v1 List Entries API

## GET /lists/{list_id}/list-entries

Get all entries on a list.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `page_size` | integer | Results per page |
| `page_token` | string | Pagination token |

**Response:** Array of list entry objects.

**List Entry Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | List entry ID |
| `list_id` | integer | Parent list ID |
| `creator_id` | integer | Creator's internal person ID |
| `entity_id` | integer | Associated entity ID |
| `entity_type` | integer | 0=person, 1=organization, 8=opportunity |
| `entity` | object | Embedded entity object |
| `created_at` | string | ISO 8601 timestamp |

## GET /lists/{list_id}/list-entries/{list_entry_id}

Get a single list entry.

## POST /lists/{list_id}/list-entries

Add an entity to a list.

**Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `entity_id` | integer | Yes | Entity to add |
| `creator_id` | integer | No | Creator override |

## DELETE /lists/{list_id}/list-entries/{list_entry_id}

Remove an entry from a list.
