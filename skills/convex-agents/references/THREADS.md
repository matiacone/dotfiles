# Threads

Threads group messages together in a linear history. All messages are associated with a thread.

## Creating a Thread

### In a Mutation or Action

```typescript
import { createThread } from "@convex-dev/agent";

const threadId = await createThread(ctx, components.agent);
```

### With Metadata

```typescript
const userId = await getAuthUserId(ctx);
const threadId = await createThread(ctx, components.agent, {
  userId,
  title: "My thread",
  summary: "This is a summary of the thread",
});
```

### From an Agent (Actions Only)

```typescript
const { threadId, thread } = await agent.createThread(ctx, { userId });
```

## Continuing a Thread

```typescript
const { thread } = await agent.continueThread(ctx, { threadId });
const result = await thread.generateText({ prompt });
```

## Thread Object Methods

| Method | Description |
|--------|-------------|
| `getMetadata()` | Get userId, title, summary, etc. |
| `updateMetadata({ patch })` | Update title, summary, userId |
| `generateText({ prompt })` | Generate text response |
| `streamText({ prompt })` | Stream text response |
| `generateObject({ prompt, schema })` | Generate structured object |
| `streamObject({ prompt, schema })` | Stream structured object |

## Deleting Threads

### Single Thread

```typescript
// Async (mutation or action)
await agent.deleteThreadAsync(ctx, { threadId });

// Sync in batches (action only)
await agent.deleteThreadSync(ctx, { threadId });
```

### All Threads by User

```typescript
await agent.deleteThreadsByUserId(ctx, { userId });
```

### All User Data

```typescript
// Async
await ctx.runMutation(components.agent.users.deleteAllForUserIdAsync, {
  userId,
});

// Sync
await ctx.runMutation(components.agent.users.deleteAllForUserId, { userId });
```

## Listing Threads by User

```typescript
const threads = await ctx.runQuery(
  components.agent.threads.listThreadsByUserId,
  { userId, paginationOpts: args.paginationOpts },
);
```

## Getting Messages in a Thread

```typescript
import { listMessages, listUIMessages } from "@convex-dev/agent";

// Raw messages
const messages = await listMessages(ctx, components.agent, {
  threadId,
  excludeToolMessages: true,
  paginationOpts: { cursor: null, numItems: 10 },
});

// UI-friendly messages
const uiMessages = await listUIMessages(ctx, components.agent, {
  threadId,
  paginationOpts: { cursor: null, numItems: 10 },
});
```

## Authorization Pattern

Implement your own authorization function:

```typescript
async function authorizeThreadAccess(ctx: QueryCtx, threadId: string) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Unauthorized");

  const thread = await ctx.runQuery(
    components.agent.threads.getThread,
    { threadId }
  );

  if (thread?.userId !== userId) {
    throw new Error("Access denied");
  }
}
```
