# Agent Definition and Usage

Agents encapsulate models, prompting, tools, and configuration. They can be defined as globals or at runtime.

## Basic Agent Definition

```typescript
import { components } from "./_generated/api";
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";

const agent = new Agent(components.agent, {
  name: "Basic Agent",
  languageModel: openai.chat("gpt-4o-mini"),
});
```

## Dynamic Agent Definition

Create agents at runtime for specific contexts:

```typescript
function createAuthorAgent(
  ctx: ActionCtx,
  bookId: Id<"books">,
  model: LanguageModel,
) {
  return new Agent(components.agent, {
    name: "Author",
    languageModel: model,
    tools: {
      getChapter: getChapterTool(ctx, bookId),
      researchCharacter: researchCharacterTool(ctx, bookId),
    },
    maxSteps: 10,
  });
}
```

## Generating Text

### Synchronous Approach

```typescript
export const generateReply = action({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    const result = await agent.generateText(ctx, { threadId }, { prompt });
    return result.text;
  },
});
```

### Asynchronous Approach (Recommended)

```typescript
import { saveMessage } from "@convex-dev/agent";

export const sendMessage = mutation({
  args: { threadId: v.id("threads"), prompt: v.string() },
  handler: async (ctx, { threadId, prompt }) => {
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
    });
    await ctx.scheduler.runAfter(0, internal.example.generateResponseAsync, {
      threadId,
      promptMessageId: messageId,
    });
  },
});

export const generateResponseAsync = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  handler: async (ctx, { threadId, promptMessageId }) => {
    await agent.generateText(ctx, { threadId }, { promptMessageId });
  },
});
```

## Generating Objects

```typescript
import { z } from "zod/v3";

const result = await thread.generateObject({
  prompt: "Generate a plan based on the conversation so far",
  schema: z.object({
    steps: z.array(z.string()),
    estimatedTime: z.number(),
  }),
});
```

## Full Agent Configuration

```typescript
import { tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod/v3";
import { Agent, createTool, type Config } from "@convex-dev/agent";

const sharedDefaults = {
  languageModel: openai.chat("gpt-4o-mini"),
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),

  usageHandler: async (ctx, args) => {
    const { usage, model, provider, agentName, threadId, userId } = args;
    // Log or save usage
  },

  contextHandler: async (ctx, args) => {
    return [...customMessages, args.allMessages];
  },

  rawResponseHandler: async (ctx, args) => {
    const { request, response, agentName, threadId, userId } = args;
    // Log request/response
  },

  callSettings: { maxRetries: 3, temperature: 1.0 },
} satisfies Config;

const supportAgent = new Agent(components.agent, {
  instructions: "You are a helpful assistant.",
  tools: {
    myConvexTool: createTool({
      description: "My Convex tool",
      args: z.object({ input: z.string() }),
      handler: async (ctx, args): Promise<string> => {
        return "Hello, world!";
      },
    }),
  },
  stopWhen: stepCountIs(5),
  ...sharedDefaults,
});
```

## Thread Object Methods

When using `agent.createThread` or `agent.continueThread` from an action:

```typescript
const { thread } = await agent.continueThread(ctx, { threadId });

// Thread methods
await thread.getMetadata();
await thread.updateMetadata({ patch: { title, summary } });
await thread.generateText({ prompt });
await thread.streamText({ prompt });
await thread.generateObject({ prompt, schema });
await thread.streamObject({ prompt, schema });
```

## Agent Options Reference

| Option | Description |
|--------|-------------|
| `name` | Agent identifier for message attribution |
| `languageModel` | LLM to use (e.g., `openai.chat("gpt-4o-mini")`) |
| `textEmbeddingModel` | Embedding model for vector search |
| `instructions` | System prompt |
| `tools` | Tools the agent can call |
| `maxSteps` / `stopWhen` | Control multi-step tool execution |
| `contextOptions` | Configure context message fetching |
| `storageOptions` | Configure message storage |
| `usageHandler` | Track token usage |
| `contextHandler` | Filter/modify context messages |
| `rawResponseHandler` | Log requests/responses |
| `callSettings` | LLM call settings (retries, temperature) |
