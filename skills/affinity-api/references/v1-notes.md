# v1 Notes API

Base URL: `https://api.affinity.co`
Auth: HTTP Basic (`:API_KEY`)

## GET /notes

Get all notes.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `person_id` | integer | Filter by person |
| `organization_id` | integer | Filter by organization |
| `opportunity_id` | integer | Filter by opportunity |
| `creator_id` | integer | Filter by note creator |
| `page_size` | integer | Results per page |
| `page_token` | string | Pagination token |

**Note Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Note ID |
| `creator_id` | integer | Creator's person ID |
| `person_ids` | integer[] | Associated person IDs |
| `associated_person_ids` | integer[] | Additional associated persons |
| `interaction_person_ids` | integer[] | Interaction person IDs |
| `interaction_id` | integer or null | Linked interaction |
| `interaction_type` | integer | Interaction type code |
| `is_meeting` | boolean | Whether linked to a meeting |
| `mentioned_person_ids` | integer[] | Mentioned persons |
| `organization_ids` | integer[] | Associated organization IDs |
| `opportunity_ids` | integer[] | Associated opportunity IDs |
| `parent_id` | integer or null | Parent note (for replies) |
| `content` | string | Note content (HTML) |
| `type` | integer | Note type |
| `created_at` | string | ISO 8601 timestamp |
| `updated_at` | string or null | ISO 8601 timestamp |

## GET /notes/{note_id}

Get a single note.

## POST /notes

Create a note.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `content` | string | Yes |
| `person_ids` | integer[] | No |
| `organization_ids` | integer[] | No |
| `opportunity_ids` | integer[] | No |
| `mentioned_person_ids` | integer[] | No |
| `parent_id` | integer | No (for replies) |
| `creator_id` | integer | No |

## PUT /notes/{note_id}

Update a note.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `content` | string | Yes |
| `mentioned_person_ids` | integer[] | No |

## DELETE /notes/{note_id}

Delete a note permanently.
