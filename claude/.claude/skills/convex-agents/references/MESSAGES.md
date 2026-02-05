# Messages

The Agent component stores message and thread history for conversations between humans and agents.

## Retrieving Messages

### Server-Side Query

```typescript
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { listUIMessages } from "@convex-dev/agent";
import { components } from "./_generated/api";

export const listThreadMessages = query({
  args: { threadId: v.string(), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    await authorizeThreadAccess(ctx, args.threadId);

    const paginated = await listUIMessages(ctx, components.agent, args);
    return paginated;
  },
});
```

### Message Types

- `listUIMessages` - Returns UIMessages (recommended for UIs)
- `listMessages` - Returns raw MessageDocs

## UIMessage Type

Extended from AI SDK's UIMessage:

| Field | Description |
|-------|-------------|
| `parts` | Array of parts (text, file, image, toolCall, toolResult) |
| `content` | String message content |
| `role` | "user", "assistant", "system" |
| `key` | Unique identifier |
| `order` | Order in thread |
| `stepOrder` | Step order within message |
| `status` | Message status or "streaming" |
| `agentName` | Agent that generated the message |
| `text` | Text content |
| `_creationTime` | Timestamp |

## Saving Messages

### Automatic Saving

Messages are saved automatically when using `generateText` or `streamText`.

### Manual Saving

```typescript
import { saveMessage } from "@convex-dev/agent";

const { messageId } = await saveMessage(ctx, components.agent, {
  threadId,
  userId,
  message: { role: "user", content: "The user message" },
});
```

### Using the Agent Class

```typescript
const { messageId } = await agent.saveMessage(ctx, {
  threadId,
  userId,
  prompt,
  metadata,
});

// Batch save
const { messages } = await agent.saveMessages(ctx, {
  threadId,
  userId,
  messages: [{ role, content }],
  metadata: [{ reasoning, usage }],
});
```

## Message Ordering

- `order`: Incrementing integer per thread
- `stepOrder`: Order within a response (0 for prompt, 1+ for responses)

When `saveMessage` or `generateText` is called:
- New message gets next `order` with `stepOrder: 0`
- Response messages share `order` with incrementing `stepOrder`

## Storage Options

```typescript
const result = await thread.generateText({ messages }, {
  storageOptions: {
    saveMessages: "all" | "none" | "promptAndOutput",
  },
});
```

## Deleting Messages

### By ID

```typescript
await agent.deleteMessage(ctx, { messageId });
await agent.deleteMessages(ctx, { messageIds });
```

### By Order Range

```typescript
// Delete all messages with order 1 or 2
await agent.deleteMessageRange(ctx, {
  threadId,
  startOrder: 1,
  endOrder: 3, // exclusive
});

// Delete with stepOrder range
await agent.deleteMessageRange(ctx, {
  threadId,
  startOrder: 1,
  startStepOrder: 2,
  endOrder: 2,
  endStepOrder: 5,
});
```

## Utility Functions

```typescript
import {
  serializeDataOrUrl,
  filterOutOrphanedToolMessages,
  extractText,
} from "@convex-dev/agent";
```

| Function | Description |
|----------|-------------|
| `serializeDataOrUrl` | Serialize DataContent or URL to Convex format |
| `filterOutOrphanedToolMessages` | Filter tool calls without results |
| `extractText` | Extract text from ModelMessage |

## Validators and Types

```typescript
import {
  vMessage,
  MessageDoc,
  vMessageDoc,
  Thread,
  ThreadDoc,
  vThreadDoc,
  AgentComponent,
  ToolCtx,
} from "@convex-dev/agent";
```

## Converting to UIMessages

```typescript
import { toUIMessages, type UIMessage } from "@convex-dev/agent";

const { results } = useThreadMessages(...);
const uiMessages = toUIMessages(results);
```
