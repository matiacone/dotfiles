# Convex Migrations

Use `@convex-dev/migrations` for online migrations that run in batches asynchronously.

## Installation

```bash
npm install @convex-dev/migrations
```

```ts
// convex/convex.config.ts
import { defineApp } from "convex/server";
import migrations from "@convex-dev/migrations/convex.config.js";

const app = defineApp();
app.use(migrations);
export default app;
```

## Setup

```ts
// convex/migrations.ts
import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);
export const run = migrations.runner();
```

## Migration Workflow

1. **Modify schema** to allow old AND new values (add optional field or make existing field optional)
2. **Update code** to handle both versions
3. **Define migration** to transform data
4. **Push and run** migration to completion
5. **Update schema** to require new values (push will fail if data doesn't match)

## Defining Migrations

### Basic Migration
```ts
export const setDefaultValue = migrations.define({
  table: "myTable",
  migrateOne: async (ctx, doc) => {
    if (doc.optionalField === undefined) {
      await ctx.db.patch(doc._id, { optionalField: "default" });
    }
  },
});
```

### Shorthand (Return Object = Auto Patch)
```ts
export const clearField = migrations.define({
  table: "myTable",
  migrateOne: () => ({ optionalField: undefined }),
});
// Equivalent to: await ctx.db.patch(doc._id, { optionalField: undefined })
```

### Migrate Subset Using Index
```ts
export const validateRequiredField = migrations.define({
  table: "myTable",
  customRange: (query) =>
    query.withIndex("by_requiredField", (q) => q.eq("requiredField", "")),
  migrateOne: async (_ctx, doc) => {
    return { requiredField: "<unknown>" };
  },
});
```

## Running Migrations

### CLI
```bash
# Run single migration
npx convex run migrations:run '{fn: "migrations:setDefaultValue"}'

# Run with --prod for production
npx convex run migrations:run '{fn: "migrations:setDefaultValue"}' --prod

# Dry run (validate without committing)
npx convex run migrations:run '{fn: "migrations:setDefaultValue", dryRun: true}'

# Restart from beginning
npx convex run migrations:run '{fn: "migrations:setDefaultValue", cursor: null}'
```

### Runner Functions
```ts
// Single migration runner
export const runIt = migrations.runner(internal.migrations.setDefaultValue);

// Run all migrations in series
export const runAll = migrations.runner([
  internal.migrations.setDefaultValue,
  internal.migrations.validateRequiredField,
  internal.migrations.convertUnionField,
]);
```

### Programmatically
```ts
// Single migration
await migrations.runOne(ctx, internal.migrations.setDefaultValue);

// Serial migrations
await migrations.runSerially(ctx, [
  internal.migrations.setDefaultValue,
  internal.migrations.validateRequiredField,
]);
```

## Operations

### Check Status
```bash
npx convex run --component migrations lib:getStatus --watch
```

```ts
const status = await migrations.getStatus(ctx, { limit: 10 });
// or
const status = await migrations.getStatus(ctx, {
  migrations: [internal.migrations.setDefaultValue],
});
```

### Cancel Migration
```bash
npx convex run --component migrations lib:cancel '{name: "migrations:myMigration"}'
```

```ts
await migrations.cancel(ctx, internal.migrations.myMigration);
```

## Configuration Options

### Custom Batch Size
```ts
export const clearField = migrations.define({
  table: "myTable",
  batchSize: 10, // Default is 100
  migrateOne: () => ({ optionalField: undefined }),
});

// Or per-invocation
await migrations.runOne(ctx, internal.migrations.clearField, { batchSize: 1 });
```

### Parallelize Within Batch
```ts
export const clearField = migrations.define({
  table: "myTable",
  parallelize: true, // Run migrateOne calls in parallel within each batch
  migrateOne: () => ({ optionalField: undefined }),
});
```

### Custom internalMutation
```ts
import { internalMutation } from "./functions";
import { Migrations } from "@convex-dev/migrations";
import { components } from "./_generated/api";

export const migrations = new Migrations(components.migrations, {
  internalMutation,
});
```

### Shorthand Prefix
```ts
export const migrations = new Migrations(components.migrations, {
  migrationsLocationPrefix: "migrations:",
});
// Then: npx convex run migrations:run '{fn: "myMigration"}'
```

## Deploy with Migrations

```bash
npx convex deploy --cmd 'npm run build' && npx convex run migrations:runAll --prod
```

## Testing Migrations

```ts
import { test, expect } from "vitest";
import { convexTest } from "convex-test";
import component from "@convex-dev/migrations/test";
import { runToCompletion } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import schema from "./schema";

test("test setDefaultValue migration", async () => {
  const t = convexTest(schema);
  component.register(t);

  await t.run(async (ctx) => {
    await ctx.db.insert("myTable", { optionalField: undefined });

    await runToCompletion(ctx, components.migrations, internal.migrations.setDefaultValue);

    const docs = await ctx.db.query("myTable").collect();
    expect(docs.every((doc) => doc.optionalField !== undefined)).toBe(true);
  });
});
```

## Synchronous Execution (Actions)

```ts
import { runToCompletion } from "@convex-dev/migrations";

export const myAction = internalAction({
  args: {},
  handler: async (ctx) => {
    await runToCompletion(ctx, components.migrations, internal.migrations.setDefaultValue);
  },
});
```

## Behavior Notes

- **Duplicate prevention**: Refuses to start if already running
- **Resume on failure**: Continues from last successful batch
- **Serial migrations**: Skips completed, resumes partial, stops on failure
- **Dry run**: Runs one batch then throws (no changes committed)
