---
name: logs
description: DealDeploy logging infrastructure. Covers the backend logger, Convex-to-ClickHouse pipeline, ClickHouse tables, and the log-viewer app. Use when working with logging, debugging log data, writing queries, or modifying the log pipeline.
metadata:
  version: "1.0"
---

# DealDeploy Logging Infrastructure

## Architecture

```
Backend (Convex)           Cloudflare Worker              ClickHouse              Log Viewer
logger.emit()  ──►  Convex Log Stream  ──►  log-ingest worker  ──►  console_logs         ──►  Vite + React app
                                                                    function_executions        (localhost:5174)
```

**Packages:**
- `packages/backend/convex/lib/logger.ts` — Logger implementation
- `packages/log-ingest/` — Cloudflare Worker that transforms and inserts events
- `apps/log-viewer/` — Local React dashboard for querying ClickHouse

## When to Use This Skill

- Writing or reviewing code that uses `createLogger` / `logger.emit`
- Debugging log data in ClickHouse
- Modifying the log-ingest worker or transform logic
- Adding new dashboards or queries to the log-viewer app
- Understanding what data is available for analysis

## Backend Logger

**File:** `packages/backend/convex/lib/logger.ts`

### createLogger

```typescript
import { createLogger } from "../lib/logger";

const logger = createLogger("enrichment.trigger");
logger.set({ companyId, enrichmentType: "enrichCompany" });
logger.emit();  // emits at "info" level
```

- First arg is the **operation name** (dot-separated, e.g. `"sequences.generateStep"`)
- Optional second arg is inherited context from a parent logger (via `logger.getContext()`)
- Tracks `_operations` breadcrumb array and `_startTime` for duration

### logger.set(data)

Merges fields into the event context. Call multiple times to accumulate:

```typescript
logger.set({ companyId: "abc", step: 1 });
logger.set({ result: "ok" });
```

**Typed fields** (`WideEventFields`):
- `result` — outcome string (e.g. `"ok"`, `"processed"`, `"no_valid_personalizations"`)
- `error` — error message string
- `delegated` — boolean, marks delegated work
- `event` — event type string

Any additional fields are accepted and stored in `context` JSON in ClickHouse.

### logger.emit(level?)

Outputs a single JSON event via `console.log()` (captured by Convex log stream):

```typescript
logger.emit();        // "info"
logger.emit("warn");  // "warn"
logger.emit("debug"); // "debug"
```

Emitted shape:
```json
{
  "timestamp": "2026-02-19T15:30:45.123Z",
  "level": "info",
  "service": "deal-deploy",
  "operation": "enrichment.trigger",
  "operations": ["parent.op", "enrichment.trigger"],
  "duration": "142ms",
  "companyId": "abc",
  "result": "ok"
}
```

### logger.createError(options)

Logs the error event AND returns a ConvexError to throw:

```typescript
throw logger.createError({
  message: "Enrichment failed",
  status: 500,
  why: "Clay API returned 429",
  fix: "Retry after rate limit resets",
  cause: originalError,
});
```

This:
1. Sets `error`, `why`, `fix`, `cause`, `status` fields on the logger
2. Calls `logger.emit("error")`
3. Returns a `ConvexError<AppErrorData>` to throw

### Context Propagation (Breadcrumbs)

Pass parent context to child loggers for operation chaining:

```typescript
const parent = createLogger("pipeline.run");
parent.set({ pipelineId: "p1" });

const child = createLogger("pipeline.step", parent.getContext());
child.emit();
// operations: ["pipeline.run", "pipeline.step"]
// pipelineId: "p1" (inherited)
// duration: measured from parent's start time
```

## Log Ingest Worker

**Package:** `packages/log-ingest/`

Cloudflare Worker that receives Convex log stream webhooks and inserts into ClickHouse.

### Flow

1. **Webhook arrives** — Convex POSTs a JSON array of events
2. **HMAC verification** — validates `x-webhook-signature` header with `WEBHOOK_SECRET`
3. **Transform** — routes by `event.topic`:
   - `"console"` → `transformConsoleEvent()` → `console_logs` table
   - `"function_execution"` → `transformFunctionExecution()` → `function_executions` table
4. **Insert** — bulk POST to ClickHouse using `JSONEachRow` format

### Console Event Transform

The worker parses the JSON from `console.log()` output, extracts known fields, and stores the rest as `context` JSON:

**Known fields** (extracted to columns): `timestamp`, `level`, `service`, `operation`, `operations`, `duration`, `result`, `error`, `why`, `fix`, `cause`, `status`, `delegated`, `event`

**Everything else** → serialized to `context` column as JSON string.

**Duration parsing:** `"142ms"` → `142` | `"2.50s"` → `2500`

**Message parsing:** Convex wraps `console.log` output in single quotes: `'{"json":...}'` — the worker strips these.

### Worker Environment Variables

Set via `wrangler secret put`:
```
CLICKHOUSE_URL        — ClickHouse HTTPS endpoint
CLICKHOUSE_USER       — ClickHouse user (e.g. "default")
CLICKHOUSE_PASSWORD   — ClickHouse password/key
WEBHOOK_SECRET        — shared HMAC secret with Convex
```

## ClickHouse Tables

### console_logs

Business events emitted by `logger.emit()`. One row per emit call.

| Column | Type | Source |
|--------|------|--------|
| `timestamp` | DateTime64(3) | Event timestamp (UTC) |
| `function_type` | String | `"query"`, `"mutation"`, `"action"`, `"http_action"` |
| `function_path` | String | Convex function path (e.g. `"crons:generateDueSteps"`) |
| `level` | String | `"debug"`, `"info"`, `"warn"`, `"error"` |
| `service` | String | Always `"deal-deploy"` |
| `operation` | String | Operation name from `createLogger()` |
| `operations` | Array(String) | Breadcrumb trail of operation chain |
| `duration_ms` | Nullable(Float64) | Parsed from duration string |
| `result` | Nullable(String) | Outcome string |
| `error` | Nullable(String) | Error message |
| `error_why` | Nullable(String) | Error context |
| `error_fix` | Nullable(String) | Error remediation |
| `error_cause` | Nullable(String) | Original error message |
| `error_status` | Nullable(Int32) | HTTP status code |
| `context` | String | JSON of all non-known fields |

### function_executions

Automatic Convex metrics. One row per function call (query/mutation/action).

| Column | Type | Source |
|--------|------|--------|
| `timestamp` | DateTime64(3) | Execution timestamp (UTC) |
| `function_type` | String | `"query"`, `"mutation"`, `"action"`, `"http_action"` |
| `function_path` | String | Convex function path |
| `status` | String | **`"success"` or `"failure"`** (NOT "error") |
| `error_message` | Nullable(String) | Error message if failed |
| `execution_time_ms` | Int32 | Wall clock execution time |
| `db_read_bytes` | Int32 | Database read volume |
| `db_write_bytes` | Int32 | Database write volume |
| `storage_read_bytes` | Int32 | Storage read volume |
| `storage_write_bytes` | Int32 | Storage write volume |

**IMPORTANT:** The `status` column uses `"failure"` not `"error"`. Always filter with `status = 'failure'`.

### Timestamps

ClickHouse stores timestamps as DateTime64(3) in UTC without a `Z` suffix (e.g. `"2026-02-19 15:30:45.123"`). When parsing in JavaScript, append `Z`:

```typescript
new Date(`${timestamp.replace(" ", "T")}Z`);
```

The log-viewer has helpers in `apps/log-viewer/src/lib/format.ts`:
- `parseClickHouseTimestamp(ts)` — parses to Date (UTC → JS)
- `formatTimestamp(ts)` — full datetime in EST
- `formatTime(ts)` — time-only in EST
- `formatBucket(ts)` — short format for chart axes in EST

## Known Operation Names

### Sequences
- `sequences.generateStep` — AI generates email step content
- `sequences.sendStep` / `sequences.completeStep` — sends or completes a step
- `sequences.applyPersonalization` — applies personalization to step

### Enrollments
- `enrollment.cancelForCompany` — cancels enrollment for a company
- `enrollment.cancelForBounce` — cancels enrollment due to email bounce
- `enrollment.completeStep` — completes an enrollment step

### Enrichments
- `enrichment.trigger` — triggers an enrichment job
- `enrichment.pipeline` — enrichment pipeline orchestration
- `enrichment.onComplete` — enrichment completion handler
- `enrichmentTests.suite` / `enrichmentTests.single` — enrichment test runs

### Auth
- `auth.signUp` — user sign-up event

### Actions
- `action.trigger` / `action.complete` / `action.fail` / `action.retry`

### CRM Sync
- `crm.syncCompanies` / `crm.syncCallNotes` / `crm.syncEmails`
- `crm.processEmailsBatch` / `crm.syncUsers`

### HTTP Handlers
- `http.nylasWebhook` / `http.nylasWebhookVerify` / `http.nylasCallback`
- `http.receiveEnrichmentResponse` / `http.createCompany` / `http.fizzyWebhook`

### Integrations
- `affinity.syncAndAddToList`
- `clay.sendToClay` / `clay.checkRateLimitAndSend`
- `chat.usage`

### Webhooks (result-based)
- Operation `"webhook"` with result values: `"processed"`, `"unknown_event_type"`

## Log Viewer App

**Location:** `apps/log-viewer/`

Local-only Vite + React app that queries ClickHouse via Vite's dev proxy.

### Running

```bash
cd apps/log-viewer && bun run dev   # starts on port 5174
```

Or from monorepo root:
```bash
bun run dev:logs
```

### Environment

`.env.local` (gitignored):
```
CLICKHOUSE_URL=https://mttyqa4onx.us-east-1.aws.clickhouse.cloud:8443
CLICKHOUSE_USER=default
CLICKHOUSE_KEY=<password>
```

These are NOT `VITE_` prefixed — they stay server-side in the Vite proxy config. The proxy at `/api/clickhouse` rewrites to the ClickHouse URL and injects auth headers.

### Routes

| Route | Purpose |
|-------|---------|
| `/dashboard` | Overview: executions, sign-ins, latency, error rate, activity chart, enrichments over time, sign-in activity, sequence pipeline, webhooks, top functions, recent events |
| `/logs` | Log Explorer: filterable paginated table of `console_logs` with expandable rows for context/error details |
| `/performance` | Latency percentiles (p50/p95/p99), throughput, slow functions table |
| `/errors` | Error rate over time, top errors by function, recent error logs |
| `/sql` | Ad-hoc SQL runner with query history |

### Data Layer

**Client:** `src/lib/clickhouse.ts` — `queryClickHouse<T>(sql, signal?)` posts SQL to `/api/clickhouse`, appends `FORMAT JSON`

**Hook:** `src/hooks/use-clickhouse-query.ts` — `useClickHouseQuery<T>(sql)` wraps fetch with loading/error/success states, AbortController on unmount, `refetch()` method

### Querying ClickHouse Directly

**Credentials** are in `apps/log-viewer/.env.local` (gitignored). Read that file to get `CLICKHOUSE_URL`, `CLICKHOUSE_USER`, and `CLICKHOUSE_KEY`.

**Via curl:**
```bash
curl --user '$CLICKHOUSE_USER:$CLICKHOUSE_KEY' \
  --data-binary 'SELECT count() FROM console_logs' \
  $CLICKHOUSE_URL

# JSON output
curl --user '$CLICKHOUSE_USER:$CLICKHOUSE_KEY' \
  --data-binary 'SELECT * FROM console_logs ORDER BY timestamp DESC LIMIT 5 FORMAT JSON' \
  $CLICKHOUSE_URL

# List tables
curl --user '$CLICKHOUSE_USER:$CLICKHOUSE_KEY' \
  --data-binary 'SHOW TABLES' \
  $CLICKHOUSE_URL

# Table schema
curl --user '$CLICKHOUSE_USER:$CLICKHOUSE_KEY' \
  --data-binary 'DESCRIBE console_logs' \
  $CLICKHOUSE_URL
```

### Useful Queries

```sql
-- Recent business events
SELECT timestamp, operation, result, level, context
FROM console_logs
WHERE timestamp >= now() - INTERVAL 24 HOUR
  AND operation <> ''
ORDER BY timestamp DESC
LIMIT 50

-- Error rate
SELECT
  countIf(status = 'failure') / count() AS error_rate
FROM function_executions
WHERE timestamp >= now() - INTERVAL 24 HOUR

-- Slow functions
SELECT
  function_path,
  avg(execution_time_ms) AS avg_ms,
  quantile(0.95)(execution_time_ms) AS p95_ms,
  count() AS count
FROM function_executions
WHERE timestamp >= now() - INTERVAL 24 HOUR
GROUP BY function_path
ORDER BY p95_ms DESC
LIMIT 20

-- Enrichment activity
SELECT
  toStartOfInterval(timestamp, INTERVAL 1 HOUR) AS bucket,
  countIf(operation = 'enrichment.trigger') AS triggered,
  countIf(operation = 'enrichment.onComplete' AND level <> 'ERROR') AS completed
FROM console_logs
WHERE timestamp >= now() - INTERVAL 7 DAY
  AND operation LIKE 'enrichment.%'
GROUP BY bucket
ORDER BY bucket
```

## Best Practices

See `packages/backend/CLAUDE.md` "Logging" section for rules:
- Always use `createError()` object form with `why`, `fix` fields
- Always pass `cause` when an error is in scope
- Use `throw logger.createError()` instead of standalone `createError` when a logger exists
- Pass loggers to downstream functions to avoid double-emitting
