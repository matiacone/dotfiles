# Debugging and Troubleshooting

Debug agents using the Playground, logging, and dashboard inspection.

## Playground

The Playground UI provides testing and debugging:

- Pick a user to list threads
- Browse threads
- View messages with tool call details
- Show message metadata
- Experiment with context options
- Send test messages

### Setup

```typescript
// convex/playground.ts
import { definePlaygroundAPI } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { myAgent } from "./agents";

export const {
  isApiKeyValid,
  listAgents,
  listUsers,
  listThreads,
  listMessages,
  createThread,
  generateText,
  fetchPromptContext,
} = definePlaygroundAPI(components.agent, {
  agents: [myAgent],
});
```

### Generate API Key

```bash
npx convex run --component agent apiKeys:issue '{name:"my-key"}'
```

### Access Playground

Visit https://get-convex.github.io/agent/ or run locally:

```bash
npx @convex-dev/agent-playground
```

## Logging Raw Requests/Responses

```typescript
const agent = new Agent(components.agent, {
  languageModel,
  rawRequestResponseHandler: async (ctx, { request, response }) => {
    console.log("request", request);
    console.log("response", response);
  },
});
```

Use with [Log Streaming](https://docs.convex.dev/production/integrations/log-streams/) for Axiom/etc.

## Logging Context Messages

```typescript
const agent = new Agent(components.agent, {
  languageModel,
  contextHandler: async (ctx, { allMessages }) => {
    console.log("context", allMessages);
    return allMessages;
  },
});
```

## Dashboard Inspection

Go to **Data** tab > Select **agent** component > Browse tables:

| Table | Contents |
|-------|----------|
| `threads` | One row per thread |
| `messages` | Each ModelMessage (user, tool call, tool result, assistant) |
| `streamingMessages` | Active streams (with associated `streamDeltas`) |
| `files` | Tracked files from message content |

### Key Message Fields

- `agentName`: Which agent generated it
- `status`: Message status
- `order` / `stepOrder`: Message ordering
- `message`: Raw message content

## Common Issues

### Type errors on `components.agent`

**Cause**: Component code not generated

**Fix**: Run `npx convex dev` to generate component types

### Circular dependencies

**Cause**: Workflow return types depending on other Convex functions

**Fix**: Add explicit return types:

```typescript
export const myWorkflow = workflow.define({
  args: { prompt: v.string() },
  handler: async (step, args): Promise<string> => {
    // ...
  },
});

export const myFunction = action({
  args: { prompt: v.string() },
  handler: async (ctx, args): Promise<string> => {
    // ...
  },
});
```

### Tool calls not executing

**Cause**: `maxSteps` not set or set to 1

**Fix**: Set `maxSteps` > 1 or use `stopWhen: stepCountIs(n)`:

```typescript
const agent = new Agent(components.agent, {
  languageModel,
  tools: { myTool },
  maxSteps: 5,
});
```

### Streaming not working

**Cause**: Missing `streamArgs` in query or `stream: true` in hook

**Fix**: Ensure query includes `vStreamArgs` and `syncStreams`:

```typescript
// Query
export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs, // Required
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});

// Client
const { results } = useUIMessages(
  api.chat.listMessages,
  { threadId },
  { stream: true }, // Required
);
```

### Messages not appearing

**Cause**: Authorization blocking access

**Fix**: Check thread access authorization matches user ID

### File uploads failing

**Cause**: Trying to save files in mutations

**Fix**: Save files in actions, then reference by ID in mutations

## Rate Limiting

Control request rates with the Rate Limiter component:

```typescript
import { RateLimiter, MINUTE, SECOND } from "@convex-dev/rate-limiter";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  sendMessage: {
    kind: "fixed window",
    period: 5 * SECOND,
    rate: 1,
    capacity: 2,
  },
  tokenUsage: {
    kind: "token bucket",
    period: MINUTE,
    rate: 2000,
    capacity: 10000,
  },
});
```

### Pre-flight Check

```typescript
await rateLimiter.limit(ctx, "sendMessage", { key: userId, throws: true });
```

### Post-generation Tracking

```typescript
const agent = new Agent(components.agent, {
  usageHandler: async (ctx, { usage, userId }) => {
    if (userId) {
      await rateLimiter.limit(ctx, "tokenUsage", {
        key: userId,
        count: usage.totalTokens,
        reserve: true,
      });
    }
  },
});
```

## Usage Tracking

Track token usage for billing:

```typescript
const agent = new Agent(components.agent, {
  usageHandler: async (ctx, args) => {
    await ctx.runMutation(internal.usage.insertRawUsage, {
      userId: args.userId,
      agentName: args.agentName,
      model: args.model,
      provider: args.provider,
      usage: args.usage,
      providerMetadata: args.providerMetadata,
    });
  },
});
```

### Usage Table Schema

```typescript
defineTable({
  userId: v.string(),
  agentName: v.optional(v.string()),
  model: v.string(),
  provider: v.string(),
  usage: vUsage,
  providerMetadata: v.optional(vProviderMetadata),
  billingPeriod: v.string(),
}).index("billingPeriod_userId", ["billingPeriod", "userId"])
```

## Testing

### convex-test Library

```typescript
import { convexTest } from "convex-test";
import { test, expect } from "vitest";

test("agent generates response", async () => {
  const t = convexTest(schema, modules);

  // Create thread
  const threadId = await t.action(api.chat.createThread, {});

  // Send message
  await t.action(api.chat.sendMessage, {
    threadId,
    prompt: "Hello",
  });

  // Verify response
  const messages = await t.query(api.chat.listMessages, {
    threadId,
    paginationOpts: { cursor: null, numItems: 10 },
  });

  expect(messages.page.length).toBeGreaterThan(1);
});
```

### Local Backend Testing

Use Convex open source for full backend testing:

```bash
npx convex dev --once
```
