# v2 Data Model, Field Types, Filtering & Permissions

## Entity Types

- **Persons** — individual contacts
- **Companies** — called "Organizations" in the UI
- **Opportunities** — deal/opportunity records

All three can be added to Lists. A List Entry is a row within a List.

## Field Categories

| Category | Scope | Description |
|----------|-------|-------------|
| `enriched` | Global | Firmographic data from Affinity/partners |
| `list` | List-specific | Custom columns on a specific list |
| `global` | Global | Account-wide custom fields |
| `relationship-intelligence` | Global | From email/calendar data |

**Field ID patterns:**
- Enriched: `affinity-data-description`, `dealroom-number-of-employees`
- Custom: `field-1234`
- RI: `source-of-introduction`, `first-email`, `last-contact`

**Enrichment sources:** `affinity-data`, `dealroom`, `eventbrite`, `mailchimp`, or `null`

**Partner data restrictions:** Crunchbase, Pitchbook, and Dealroom "exclusive" fields NOT exposed via API.

## Field Value Types (Read)

| type | data |
|------|------|
| `text` | string or null |
| `filterable-text` | string or null |
| `filterable-text-multi` | string[] or null |
| `number` | number or null |
| `number-multi` | number[] or null |
| `datetime` | ISO 8601 string or null |
| `location` | `{ streetAddress, city, state, country, continent }` or null |
| `location-multi` | Location[] or null |
| `dropdown` | `{ dropdownOptionId, text }` or null |
| `dropdown-multi` | Dropdown[] or null |
| `ranked-dropdown` | `{ dropdownOptionId, text, rank, color }` or null |
| `person` | PersonData or null |
| `person-multi` | PersonData[] (max 100) or null |
| `company` | CompanyData or null |
| `company-multi` | CompanyData[] (max 100) or null |
| `formula-number` | `{ calculatedValue: number or null }` or null |
| `interaction` | ChatMessage / Email / Meeting / PhoneCall or null |

**Empty arrays return `null`**, not `[]`.

## Interaction Sub-Types (Read-Only)

**Email:** `{ type: "email", id, subject, sentAt, from: Attendee, to: Attendee[], cc: Attendee[] }`

**Meeting:** `{ type: "meeting", id, title, allDay, startTime, endTime, attendees: Attendee[] }`

**PhoneCall:** `{ type: "call", id, startTime, attendees: Attendee[] }`

**ChatMessage:** `{ type: "chat-message", id, direction, sentAt, manualCreator: PersonData, participants: PersonData[] }`

**Attendee:** `{ emailAddress, person: PersonData or null }`

**PersonData:** `{ id, firstName, lastName, primaryEmailAddress, type: "internal"/"external"/"collaborator" }`

**CompanyData:** `{ id, name, domain }`

## Nested Associations

- Truncated at **100 entries** (hard cap, no pagination workaround)
- Affects: person/company multi fields, companies in opportunities, persons in opportunities

## Date Normalization (Jan 2026)

Timestamps stored as midnight PT. Time components ignored on write and stripped on read.

---

## Filtering Syntax

Used in `filter` query parameter across v2 endpoints.

### Operators

| Operator | Types | Example |
|----------|-------|---------|
| `=` | All | `creator.id=1` |
| `=^` | Text | `content =^ he` (starts with) |
| `=$` | Text | `content =$ llo` (ends with) |
| `=~` | Text, Collections | `content =~ lo` (contains) |
| `>`, `>=`, `<`, `<=` | Numeric, date | `createdAt>2025-01-01T00:00:00Z` |
| `=*` | All | `content = *` (is not null) |
| `!=*` | All | `content != *` (is null) |
| `=[]` | Collections | `industries =[]` (is empty) |
| `!` | All | `!(content = "hello")` (negation) |

### Combining Filters

- `&` = AND (higher precedence)
- `|` = OR
- Parentheses for grouping: `(foo = 1 | baz = 2) & bar = 3`
- Escape special chars with `\`
- Spaces insignificant unless in double quotes

---

## Pagination

- **Cursor-based** (not offset)
- Default limit: 100 (20 for notes endpoints)
- Max limit: 100
- Follow `pagination.nextUrl` for next page
- `totalCount` available on notes/transcripts endpoints when `totalCount=true`

## Rate Limits

- **900 req/min** per user (v1 + v2 combined)
- Monthly: Essentials=unlimited, Scale/Advanced=100k, Enterprise=unlimited
- Headers: `x-ratelimit-limit-user`, `x-ratelimit-limit-user-remaining`, `x-ratelimit-limit-user-reset`, `x-ratelimit-limit-org`, `x-ratelimit-limit-org-remaining`, `x-ratelimit-limit-org-reset`
- 429 = rate limited

## Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 405 | Method Not Allowed |
| 422 | Unprocessable Entity |
| 429 | Rate Limited |
| 500 | Server Error |
| 503 | Service Unavailable |

**Error format:** `{ "errors": [{ "code": "...", "message": "...", "param": "..." }] }`

## Permissions

| Permission | Endpoints |
|------------|-----------|
| "Export All Organizations directory" | GET /v2/companies, /v2/companies/{id} |
| "Export All People directory" | GET /v2/persons, /v2/persons/{id} |
| "Export data from Lists" | All list-entries endpoints, field update endpoints |
| "Manage duplicates" + admin | All merge endpoints |
