# v1 Persons API

Base URL: `https://api.affinity.co`
Auth: HTTP Basic (`:API_KEY`)

## GET /persons

Search and list persons.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `term` | string | Search term (name, email) |
| `with_interaction_dates` | boolean | Include first/last interaction dates |
| `with_interaction_persons` | boolean | Include interaction persons |
| `with_opportunities` | boolean | Include associated opportunities |
| `with_current_organizations` | boolean | Include current organizations |
| `min_first_email_date` | string | Filter by earliest first email |
| `max_first_email_date` | string | Filter by latest first email |
| `min_last_email_date` | string | Filter by earliest last email |
| `max_last_email_date` | string | Filter by latest last email |
| `page_size` | integer | Results per page |
| `page_token` | string | Pagination token |

**Person Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique person ID |
| `type` | integer | 0=external, 1=internal |
| `first_name` | string | First name |
| `last_name` | string | Last name |
| `primary_email` | string | Primary email address |
| `emails` | string[] | All email addresses |
| `organization_ids` | integer[] | Associated organization IDs |
| `list_entries` | object[] | List entries for this person |
| `interaction_dates` | object | `{ first_email_date, last_email_date, first_event_date, last_event_date, ... }` |
| `interactions` | object | Interaction counts/details |
| `opportunities` | object[] | Associated opportunities |

## GET /persons/{person_id}

Get a single person.

**Query Params:** `with_interaction_dates`, `with_interaction_persons`, `with_opportunities`, `with_current_organizations`

## POST /persons

Create a person.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `first_name` | string | Yes |
| `last_name` | string | Yes |
| `emails` | string[] | Yes |
| `organization_ids` | integer[] | No |

## PUT /persons/{person_id}

Update a person. Same body fields as POST (all optional).

## DELETE /persons/{person_id}

Delete a person permanently.

## GET /persons/fields

Get all global person fields. Returns array of field definition objects.
