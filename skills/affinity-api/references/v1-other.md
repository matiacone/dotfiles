# v1 Entity Files API

Base URL: `https://api.affinity.co`
Auth: HTTP Basic (`:API_KEY`)

## GET /entity-files

Get all files.

**Query Params:**

| Param | Type | Description |
|-------|------|-------------|
| `person_id` | integer | Filter by person |
| `organization_id` | integer | Filter by organization |
| `opportunity_id` | integer | Filter by opportunity |
| `page_size` | integer | Results per page |
| `page_token` | string | Pagination token |

**File Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | File ID |
| `name` | string | File name |
| `size` | integer | File size in bytes |
| `person_id` | integer or null | Associated person |
| `organization_id` | integer or null | Associated organization |
| `opportunity_id` | integer or null | Associated opportunity |
| `uploader_id` | integer | Uploader's person ID |
| `created_at` | string | ISO 8601 timestamp |

## GET /entity-files/{entity_file_id}

Get a single file's metadata.

## GET /entity-files/{entity_file_id}/download

Download the file content.

## POST /entity-files

Upload files. Use `multipart/form-data`.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `files` | file(s) | Yes |
| `person_id` | integer | No |
| `organization_id` | integer | No |
| `opportunity_id` | integer | No |

---

# v1 Reminders API

## GET /reminders

Get all reminders.

**Reminder Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Reminder ID |
| `person_id` | integer or null | Associated person |
| `organization_id` | integer or null | Associated organization |
| `opportunity_id` | integer or null | Associated opportunity |
| `creator_id` | integer | Creator's person ID |
| `content` | string | Reminder content |
| `due_date` | string | Due date |
| `completed_at` | string or null | Completion timestamp |
| `created_at` | string | ISO 8601 timestamp |
| `type` | integer | Reminder type |
| `status` | integer | Reminder status |

## GET /reminders/{reminder_id}

Get a single reminder.

## POST /reminders

Create a reminder.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `content` | string | Yes |
| `due_date` | string | Yes |
| `person_id` | integer | No |
| `organization_id` | integer | No |
| `opportunity_id` | integer | No |
| `type` | integer | No |

## PUT /reminders/{reminder_id}

Update a reminder.

## DELETE /reminders/{reminder_id}

Delete a reminder.

---

# v1 Webhooks API

## GET /webhook-subscriptions

Get all webhook subscriptions. Max 3 per instance.

**Webhook Object:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Subscription ID |
| `webhook_url` | string | Callback URL |
| `subscriptions` | object[] | Event subscriptions |
| `disabled` | boolean | Whether disabled |

## GET /webhook-subscriptions/{subscription_id}

Get a single subscription.

## POST /webhook-subscriptions

Create a webhook subscription.

**Body:**

| Field | Type | Required |
|-------|------|----------|
| `webhook_url` | string | Yes |
| `subscriptions` | object[] | Yes |

## PUT /webhook-subscriptions/{subscription_id}

Update a subscription.

## DELETE /webhook-subscriptions/{subscription_id}

Delete a subscription.

---

# v1 Utility Endpoints

## GET /whoami

Returns authenticated user info including `tenant` (org details) and `user` (person details).

## GET /rate-limit

Returns current rate limit status:

| Field | Type | Description |
|-------|------|-------------|
| `user_limit` | integer | Requests per minute |
| `user_remaining` | integer | Remaining this minute |
| `user_reset` | integer | Seconds until reset |
| `org_limit` | integer | Monthly limit |
| `org_remaining` | integer | Remaining this month |
| `org_reset` | integer | Seconds until reset |

---

# Error Codes (v1)

| Code | Description |
|------|-------------|
| 401 | Unauthorized (invalid API key) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 422 | Malformed request |
| 429 | Rate limited |
| 500 | Server error |
| 503 | Service unavailable |
