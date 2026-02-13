# v1 Organizations API

Base URL: `https://api.affinity.co`
Auth: HTTP Basic (`:API_KEY`)

## GET /organizations

Search and list organizations.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `term` | string | Search term (name, domain) |
| `with_interaction_dates` | boolean | Include interaction dates |
| `with_interaction_persons` | boolean | Include interaction persons |
| `with_opportunities` | boolean | Include opportunities |
| `min_first_email_date` | string | Filter min first email |
| `max_first_email_date` | string | Filter max first email |
| `min_last_email_date` | string | Filter min last email |
| `max_last_email_date` | string | Filter max last email |
| `page_size` | integer | Results per page |
| `page_token` | string | Pagination token |

**Organization Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique org ID |
| `name` | string | Organization name |
| `domain` | string | Primary domain |
| `domains` | string[] | All domains |
| `global` | boolean | Whether globally shared |
| `person_ids` | integer[] | Associated person IDs |
| `list_entries` | object[] | List entries |
| `interaction_dates` | object | Interaction date data |
| `opportunities` | object[] | Associated opportunities |

## GET /organizations/{organization_id}

Get a single organization.

**Query Params:** `with_interaction_dates`, `with_interaction_persons`, `with_opportunities`

## POST /organizations

Create an organization.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `domain` | string | No |
| `person_ids` | integer[] | No |

## PUT /organizations/{organization_id}

Update an organization. Same body fields as POST (all optional).

## DELETE /organizations/{organization_id}

Delete an organization permanently.

## GET /organizations/fields

Get all global organization fields. Returns array of field definition objects.
