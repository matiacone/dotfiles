# v2 Transcripts API (BETA)

Base URL: `https://api.affinity.co`
Auth: Bearer token

## GET /v2/transcripts

Paginate all transcripts.

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | string | -- | Pagination cursor |
| `limit` | int32 | 20 | 0-100 |
| `totalCount` | boolean | false | Include total count |
| `filter` | string | -- | Filter expression |

**Filter props:** `id` (=), `createdAt` (>, <, >=, <=)

**Response:** `{ data: BaseTranscript[], pagination: { prevUrl, nextUrl, totalCount? } }`

**BaseTranscript:**

| Field | Type |
|-------|------|
| `id` | int32 |
| `note` | AiNotetakerRootNote or AiNotetakerReplyNote |
| `createdAt` | datetime |
| `languageCode` | enum: `de`, `en`, `es`, `fr`, `id`, `it`, `ja`, `ko`, `nl`, `pt`, `ru`, `sv`, `uk`, `zh` |

## GET /v2/transcripts/{transcriptId}

Single transcript with first 100 fragments.

**Response:**

| Field | Type |
|-------|------|
| `id` | int32 |
| `note` | AiNotetakerRootNote or AiNotetakerReplyNote |
| `createdAt` | datetime |
| `languageCode` | enum |
| `fragmentsPreview` | `{ data: Fragment[], totalCount: int64 }` |

**Fragment:**

| Field | Type |
|-------|------|
| `content` | string |
| `speaker` | string |
| `startTimestamp` | string (HH:MM:SS) |
| `endTimestamp` | string (HH:MM:SS) |

## GET /v2/transcripts/{transcriptId}/fragments

Paginate all fragments for a transcript.

**Query Params:** `cursor`, `limit` (default 20), `totalCount`

**Response:** `{ data: Fragment[], pagination: { prevUrl, nextUrl, totalCount? } }`
