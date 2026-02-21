# Tools

Tools allow LLMs to call external services or functions.

## Use Cases

- Retrieving data from the database
- Writing or updating data
- Searching the web
- Calling external APIs
- Human-in-the-loop interactions

## Providing Tools

Tools can be provided at different layers (later overrides earlier):

```typescript
// Agent constructor
new Agent(components.agent, { tools: {...} })

// Creating a thread
createThread(ctx, { tools: {...} })

// Continuing a thread
continueThread(ctx, { tools: {...} })

// Thread functions
thread.generateText({ tools: {...} })

// Outside a thread
agent.generateText(ctx, {}, { tools: {...} })
```

## Automatic Tool Execution

Set `maxSteps` or `stopWhen` to enable multi-step tool execution:

```typescript
const agent = new Agent(components.agent, {
  languageModel,
  tools: { myTool },
  maxSteps: 5, // or stopWhen: stepCountIs(5)
});
```

## Creating Tools with Convex Context

### Using createTool (Recommended)

```typescript
import { createTool } from "@convex-dev/agent";
import { z } from "zod/v3";

export const ideaSearch = createTool({
  description: "Search for ideas in the database",
  args: z.object({
    query: z.string().describe("The query to search for"),
  }),
  handler: async (ctx, args, options): Promise<Array<Idea>> => {
    // ctx has: agent, userId, threadId, messageId
    // plus ActionCtx: auth, storage, runMutation, runAction
    const ideas = await ctx.runQuery(api.ideas.searchIdeas, {
      query: args.query,
    });
    return ideas;
  },
});
```

### Runtime Tool Definition

```typescript
import { tool } from "ai";

function createContextualTool(ctx: ActionCtx, teamId: Id<"teams">) {
  return tool({
    description: "My tool",
    parameters: z.object({ input: z.string() }),
    execute: async (args): Promise<string> => {
      return await ctx.runQuery(internal.foo.bar, { ...args, teamId });
    },
  });
}
```

## ToolCtx Properties

| Property | Description |
|----------|-------------|
| `agent` | The Agent instance |
| `userId` | User ID if set |
| `threadId` | Thread ID if set |
| `messageId` | Prompt message ID |
| `auth` | Auth context (null in scheduled functions) |
| `storage` | File storage |
| `runQuery` | Run queries |
| `runMutation` | Run mutations |
| `runAction` | Run actions |

## Custom Context in Tools

### Define Agent with Custom Context Type

```typescript
const myAgent = new Agent<{ orgId: string }>(components.agent, {
  languageModel,
  tools: { myTool },
});
```

### Use Custom Context in Tool

```typescript
type MyCtx = ToolCtx & { orgId: string };

const myTool = createTool({
  args: z.object({ query: z.string() }),
  description: "Search within organization",
  handler: async (ctx: MyCtx, args) => {
    // Access ctx.orgId
    return await ctx.runQuery(api.search.byOrg, {
      orgId: ctx.orgId,
      query: args.query,
    });
  },
});
```

### Pass Custom Context When Calling

```typescript
await agent.generateText({ ...ctx, orgId: "123" }, { threadId }, { prompt });
```

## Agent as a Tool

Use one agent as a tool for another:

```typescript
const agentTool = createTool({
  description: `Ask a question to agent ${agent.name}`,
  args: z.object({
    message: z.string().describe("The message to ask the agent"),
  }),
  handler: async (ctx, args, options): Promise<string> => {
    const { userId } = ctx;
    const { thread } = await agent.createThread(ctx, { userId });

    const result = await thread.generateText(
      {
        prompt: [...options.messages, { role: "user", content: args.message }],
      },
      { storageOptions: { saveMessages: "all" } },
    );

    return result.text;
  },
});
```

## Direct LLM Tool (No Thread)

```typescript
import { generateText } from "ai";

const llmTool = createTool({
  description: "Ask a question to an LLM",
  args: z.object({
    message: z.string().describe("The message to ask"),
  }),
  handler: async (ctx, args, options): Promise<string> => {
    const result = await generateText({
      system: "You are a helpful assistant.",
      prompt: [...options.messages, { role: "user", content: args.message }],
      model: myLanguageModel,
    });
    return result.text;
  },
});
```

## Best Practices

1. Use `.describe()` on zod fields for LLM context
2. Annotate return types to avoid type cycles
3. Tools are stored as messages in the thread
4. Tool results are automatically passed back to the LLM
