# v1 Fields API

Base URL: `https://api.affinity.co`
Auth: HTTP Basic (`:API_KEY`)

## Value Types

| Code | Type |
|------|------|
| 0 | Person |
| 1 | Organization |
| 2 | Dropdown |
| 3 | Number |
| 4 | Date |
| 5 | Location |
| 6 | Text |
| 7 | Ranked Dropdown |

## Entity Types

| Code | Type |
|------|------|
| 0 | Person |
| 1 | Organization |
| 8 | Opportunity |

---

## GET /fields

Get field definitions.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `list_id` | integer | Filter by list |
| `value_type` | integer | Filter by value type (0-7) |
| `entity_type` | integer | Filter by entity type (0, 1, 8) |
| `with_modified_names` | boolean | Include list-prefixed names |
| `exclude_dropdown_options` | boolean | Exclude dropdown options from response |

**Field Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Field ID |
| `name` | string | Field name |
| `list_id` | integer or null | List-specific or global (null) |
| `value_type` | integer | Value type code |
| `allows_multiple` | boolean | Multi-value allowed |
| `entity_type` | integer | Entity type code |
| `dropdown_options` | object[] | `{ id, text, rank, color }` |

## POST /fields

Create a field.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `entity_type` | integer | Yes |
| `value_type` | integer | Yes |
| `list_id` | integer | No (null = global) |

## DELETE /fields/{field_id}

Delete a field permanently.

---

# v1 Field Values API

## GET /field-values

Get field values. Must provide exactly one filter param.

**Query Params (one required):**

| Param | Type | Description |
|-------|------|-------------|
| `person_id` | integer | Values for a person |
| `organization_id` | integer | Values for an organization |
| `opportunity_id` | integer | Values for an opportunity |
| `list_entry_id` | integer | Values for a list entry |

**Field Value Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Field value ID |
| `field_id` | integer | Parent field ID |
| `entity_id` | integer | Entity this value belongs to |
| `list_entry_id` | integer or null | List entry (if list-specific) |
| `value` | any | The actual value (type depends on field) |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string | ISO 8601 timestamp |

## POST /field-values

Create a field value.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `field_id` | integer | Yes |
| `entity_id` | integer | Yes |
| `value` | any | Yes |
| `list_entry_id` | integer | No |

## PUT /field-values/{field_value_id}

Update a field value.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `value` | any | Yes |

## DELETE /field-values/{field_value_id}

Delete a field value.

---

# v1 Field Value Changes API

## GET /field-value-changes

Get historical changes to field values.

**Query Params:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `field_id` | integer | Yes | Field to query changes for |
| `action_type` | integer | No | 0=Create, 1=Delete, 2=Update |
| `person_id` | integer | No | Filter by person |
| `organization_id` | integer | No | Filter by organization |
| `opportunity_id` | integer | No | Filter by opportunity |
| `list_entry_id` | integer | No | Filter by list entry |

**Change Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Change ID |
| `field_id` | integer | Field ID |
| `entity_id` | integer | Entity ID |
| `list_entry_id` | integer or null | List entry ID |
| `action_type` | integer | 0=Create, 1=Delete, 2=Update |
| `value` | object | `{ text, number, ... }` current value |
| `changed_at` | string | ISO 8601 timestamp |
| `changer` | object | User who made the change |
