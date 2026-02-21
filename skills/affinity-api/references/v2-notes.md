# v2 Notes API

Base URL: `https://api.affinity.co`
Auth: Bearer token

## GET /v2/notes

Get all notes (excluding replies). Default limit: 20.

**Query Params:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `cursor` | string | -- | Pagination cursor |
| `limit` | int32 | 20 | 0-100 |
| `totalCount` | boolean | false | Include total count |
| `filter` | string | -- | Filter expression |
| `includes` | string[] | -- | `companiesPreview`, `personsPreview`, `opportunitiesPreview`, `repliesCount` |

**Filter props:** `id` (=), `creator.id` (=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**Response:** `{ data: Note[], pagination: { prevUrl, nextUrl, totalCount? } }`

## Note Types (discriminated union on `type`)

### EntitiesNote (`type: "entities"`)

| Field | Type |
|-------|------|
| `id` | int32 |
| `type` | `"entities"` |
| `content` | `{ html: string or null }` |
| `creator` | PersonData |
| `mentions` | Mention[] (max 100) |
| `createdAt` | datetime |
| `updatedAt` | datetime or null |
| `permissions` | `{ sharingType: "private"/"public"/"custom", owner: PersonData }` |
| `repliesCount?` | int32 (if `includes=repliesCount`) |
| `companiesPreview?` | `{ data: CompanyData[], totalCount }` |
| `personsPreview?` | `{ data: PersonData[], totalCount }` |
| `opportunitiesPreview?` | `{ data: Opportunity[], totalCount }` |

### InteractionNote (`type: "interaction"`)

Same as EntitiesNote + `interaction: { id: int64, type: "meeting"/"call"/"email"/"chat-message" }`

### AiNotetakerRootNote (`type: "ai-notetaker"`)

Same as EntitiesNote + `transcriptId: int32` + `interaction: { id, type: "meeting" }`

### UserReplyNote (`type: "user-reply"`)

| Field | Type |
|-------|------|
| `id` | int32 |
| `type` | `"user-reply"` |
| `content` | `{ html: string or null }` |
| `creator` | PersonData |
| `mentions` | Mention[] |
| `createdAt` | datetime |
| `updatedAt` | datetime or null |
| `parent` | `{ id: int32 }` |

### AiNotetakerReplyNote (`type: "ai-notetaker-reply"`)

Same as UserReplyNote + `transcriptId: int32` + `interaction: { id, type: "meeting" }`

## Shared Types

**PersonData:** `{ id, firstName, lastName, primaryEmailAddress, type: "internal"/"external"/"collaborator" }`

**CompanyData:** `{ id, name, domain }`

**Opportunity:** `{ id, name, listId }`

**Mention:** `{ id, type: "person", person: PersonData }`

---

## GET /v2/notes/{noteId}

Single note. Accepts `includes` param.

## GET /v2/notes/{noteId}/attached-companies

Companies attached to a note. Default limit: 20.

**Response:** `{ data: CompanyData[], pagination }`

## GET /v2/notes/{noteId}/attached-persons

Persons attached to a note. Default limit: 20.

**Response:** `{ data: PersonData[], pagination }`

## GET /v2/notes/{noteId}/attached-opportunities

Opportunities attached to a note. Default limit: 20.

**Response:** `{ data: Opportunity[], pagination }`

## GET /v2/notes/{noteId}/replies

Replies for a note. Default limit: 20.

**Query Params:** `filter`, `cursor`, `limit`, `totalCount`

**Filter props:** `creator.id` (=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**Response:** `{ data: (UserReplyNote | AiNotetakerReplyNote)[], pagination }`
