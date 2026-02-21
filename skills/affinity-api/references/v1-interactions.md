# v1 Interactions API

Base URL: `https://api.affinity.co`
Auth: HTTP Basic (`:API_KEY`)

## Interaction Types

| Code | Type |
|------|------|
| 0 | Email |
| 1 | Event/Meeting |
| 2 | Phone Call |
| 3 | Chat Message |

## GET /interactions

Get all interactions.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `person_id` | integer | Filter by person |
| `organization_id` | integer | Filter by organization |
| `opportunity_id` | integer | Filter by opportunity |
| `type` | integer | Filter by type (0-3) |
| `page_size` | integer | Results per page |
| `page_token` | string | Pagination token |

**Interaction Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Interaction ID |
| `type` | integer | Interaction type (0-3) |
| `subject` | string | Subject (emails/meetings) |
| `body` | string | Body content |
| `date` | string | Interaction date |
| `start_time` | string | Start time (meetings/calls) |
| `end_time` | string | End time (meetings/calls) |
| `direction` | integer | 0=incoming, 1=outgoing |
| `external_id` | string | External provider ID |
| `attendee_ids` | integer[] | Person IDs of attendees |
| `person_ids` | integer[] | Associated person IDs |
| `organization_ids` | integer[] | Associated organization IDs |
| `opportunity_ids` | integer[] | Associated opportunity IDs |
| `is_meeting` | boolean | Whether it's a meeting |
| `created_at` | string | ISO 8601 timestamp |

## GET /interactions/{interaction_id}

Get a single interaction.

## POST /interactions

Create a manual interaction.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `type` | integer | Yes |
| `subject` | string | No |
| `body` | string | No |
| `date` | string | No |
| `person_ids` | integer[] | No |
| `organization_ids` | integer[] | No |
| `opportunity_ids` | integer[] | No |

## PUT /interactions/{interaction_id}

Update an interaction. Same body as POST (all optional).

## DELETE /interactions/{interaction_id}

Delete an interaction.

---

# v1 Relationship Strengths API

## GET /relationships-strengths

Fetch relationship strength scores.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `person_id` | integer | Person to query |
| `organization_id` | integer | Organization to query |
| `internal_person_id` | integer | Internal team member |

Returns relationship strength data between persons and organizations.
