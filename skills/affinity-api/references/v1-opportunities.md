# v1 Opportunities API

Base URL: `https://api.affinity.co`
Auth: HTTP Basic (`:API_KEY`)

## GET /opportunities

Search and list opportunities.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `term` | string | Search term |
| `page_size` | integer | Results per page |
| `page_token` | string | Pagination token |

**Opportunity Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique opportunity ID |
| `name` | string | Opportunity name |
| `list_id` | integer | Parent list ID |
| `person_ids` | integer[] | Associated person IDs |
| `organization_ids` | integer[] | Associated organization IDs |

## GET /opportunities/{opportunity_id}

Get a single opportunity.

## POST /opportunities

Create an opportunity.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `list_id` | integer | Yes |
| `person_ids` | integer[] | No |
| `organization_ids` | integer[] | No |

## PUT /opportunities/{opportunity_id}

Update an opportunity. Same body fields as POST (all optional except `list_id`).

## DELETE /opportunities/{opportunity_id}

Delete an opportunity permanently.
