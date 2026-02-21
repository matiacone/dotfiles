# v2 Merges API (BETA)

Base URL: `https://api.affinity.co`
Auth: Bearer token
Requires "Manage duplicates" permission + organization admin role.

---

## Company Merges

### POST /v2/company-merges

Initiate an async company merge.

**Body:**
```json
{
  "primaryCompanyId": 123,
  "duplicateCompanyId": 456
}
```

**Response (202):** `{ "taskUrl": "https://api.affinity.co/v2/tasks/company-merges/{taskId}" }`

### GET /v2/company-merges

Paginate all company merges (reverse chronological).

**Query Params:** `cursor`, `limit` (default 100), `filter`

**Filter props:** `status` (=: `in-progress`/`success`/`failed`), `taskId` (=: UUID)

**CompanyMergeState:**

| Field | Type |
|-------|------|
| `id` | int64 |
| `status` | `in-progress` / `success` / `failed` |
| `taskId` | UUID string |
| `startedAt` | datetime |
| `primaryCompanyId` | int64 |
| `duplicateCompanyId` | int64 |
| `completedAt` | datetime or null |
| `errorMessage` | string or null |

### GET /v2/company-merges/{mergeId}

Single merge status.

### GET /v2/tasks/company-merges

Paginate all company merge tasks (reverse chronological).

**Query Params:** `cursor`, `limit` (default 100), `filter`

**Filter props:** `status` (=: `in-progress`/`success`/`failed`)

**CompanyMergeTask:**

| Field | Type |
|-------|------|
| `id` | UUID string |
| `status` | `in-progress` / `success` / `failed` |
| `resultsSummary.total` | int32 |
| `resultsSummary.inProgress` | int32 |
| `resultsSummary.success` | int32 |
| `resultsSummary.failed` | int32 |

### GET /v2/tasks/company-merges/{taskId}

Single task status.

---

## Person Merges

### POST /v2/person-merges

Initiate an async person merge.

**Body:**
```json
{
  "primaryPersonId": 123,
  "duplicatePersonId": 456
}
```

**Response (202):** `{ "taskUrl": "..." }`

### GET /v2/person-merges

Paginate all person merges. Default limit: **25**.

**Query Params:** `cursor`, `limit` (default 25), `filter`

**Filter props:** `status` (=), `taskId` (=)

**PersonMergeState:** Same schema as CompanyMergeState but with `primaryPersonId`/`duplicatePersonId`.

### GET /v2/person-merges/{mergeId}

Single merge status.

### GET /v2/tasks/person-merges

Paginate all person merge tasks. Default limit: **25**.

**Query Params:** `cursor`, `limit` (default 25), `filter`

**PersonMergeTask:** Same schema as CompanyMergeTask.

### GET /v2/tasks/person-merges/{taskId}

Single task status.
