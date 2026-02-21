# v2 Auth & Feedback API

Base URL: `https://api.affinity.co`
Auth: Bearer token

## GET /v2/auth/whoami

Verify authentication and get current user/org info.

**Response:**

```json
{
  "tenant": {
    "id": 1,
    "name": "My Organization",
    "subdomain": "my-org"
  },
  "user": {
    "id": 1,
    "firstName": "Jane",
    "lastName": "Doe",
    "emailAddress": "jane@example.com"
  },
  "grant": {
    "type": "api-key",
    "scopes": ["api"],
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

**grant.type:** `api-key` or `access-token`

---

## POST /v2/feedback (BETA)

Send product feedback to Affinity.

**Body:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `type` | enum | Yes | `mcp`, `api`, `other` |
| `subject` | string | Yes | 1-255 chars |
| `body` | string | Yes | 1-10000 chars |

**Response:** 204 No Content
