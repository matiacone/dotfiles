# v2 Interactions API

Base URL: `https://api.affinity.co`
Auth: Bearer token

All interaction endpoints share the same pagination pattern and filter syntax.

---

## GET /v2/emails

Paginate all emails.

**Query Params:** `cursor`, `limit` (default 100), `filter`

**Filter props:** `id` (=), `sentAt` (>, <, >=, <=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**Email Object:**

| Field | Type |
|-------|------|
| `id` | int64 |
| `sentAt` | datetime |
| `loggingType` | `"automated"` |
| `direction` | `"sent"` / `"received"` |
| `subject` | string or null |
| `createdAt` | datetime |
| `updatedAt` | datetime or null |
| `from` | Attendee |
| `toParticipantsPreview` | `{ data: Attendee[], totalCount: int64 }` |
| `ccParticipantsPreview` | `{ data: Attendee[], totalCount: int64 }` |

**Attendee:** `{ emailAddress: string or null, person: PersonData or null }`

---

## GET /v2/calls

Paginate all calls.

**Query Params:** `cursor`, `limit` (default 100), `filter`

**Filter props:** `id` (=), `startTime` (>, <, >=, <=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**Call Object:**

| Field | Type |
|-------|------|
| `id` | int64 |
| `loggingType` | `"manual"` |
| `title` | string or null |
| `startTime` | datetime |
| `endTime` | datetime or null |
| `allDay` | boolean |
| `creator` | Attendee or null |
| `createdAt` | datetime |
| `updatedAt` | datetime or null |
| `attendeesPreview` | `{ data: Attendee[], totalCount: int64 }` |

---

## GET /v2/meetings

Paginate all meetings.

**Query Params:** `cursor`, `limit` (default 100), `filter`

**Filter props:** `id` (=), `startTime` (>, <, >=, <=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**Meeting Object:**

| Field | Type |
|-------|------|
| `id` | int64 |
| `loggingType` | `"automated"` / `"manual"` |
| `title` | string or null |
| `startTime` | datetime |
| `endTime` | datetime or null |
| `allDay` | boolean |
| `creator` | Attendee or null |
| `organizer` | Attendee or null |
| `createdAt` | datetime |
| `updatedAt` | datetime or null |
| `attendeesPreview` | `{ data: Attendee[], totalCount: int64 }` |

**Key difference from calls:** Meetings have `organizer` field and `loggingType` can be `"automated"`.

---

## GET /v2/chat-messages

Paginate all chat messages.

**Query Params:** `cursor`, `limit` (default 100), `filter`

**Filter props:** `id` (=), `sentAt` (>, <, >=, <=), `createdAt` (>, <, >=, <=), `updatedAt` (>, <, >=, <=)

**ChatMessage Object:**

| Field | Type |
|-------|------|
| `id` | int64 |
| `sentAt` | datetime |
| `loggingType` | `"manual"` |
| `direction` | `"sent"` / `"received"` |
| `creator` | PersonData |
| `createdAt` | datetime |
| `updatedAt` | datetime or null |
| `participantsPreview` | `{ data: PersonData[], totalCount: int64 }` |

**Key difference from emails:** Uses PersonData (not Attendee) and `participantsPreview` (not to/cc).
