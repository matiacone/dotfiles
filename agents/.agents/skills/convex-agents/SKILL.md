---
name: convex-agents
description: Build AI agents with Convex using @convex-dev/agent. Covers agents, threads, messages, streaming, tools, RAG, workflows, and React integration. Use when creating AI chat apps, building agentic workflows, or implementing LLM-powered features with Convex.
---

# Convex Agents Skill

Build AI agents with persistent conversation history, streaming, tools, and RAG using the `@convex-dev/agent` library.

## When to Use This Skill

- Creating AI chat applications with Convex
- Building agentic workflows with LLM calls
- Implementing streaming responses
- Adding tool calls to agents
- Setting up RAG (retrieval-augmented generation)
- Managing conversation threads and messages

## Quick Start

### Installation

```bash
npm install @convex-dev/agent
```

### Configure Component

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);

export default app;
```

Run `npx convex dev` to generate component types.

### Define an Agent

```typescript
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { components } from "./_generated/api";

const myAgent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions: "You are a helpful assistant.",
});
```

### Basic Usage

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import { createThread } from "@convex-dev/agent";

export const chat = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const threadId = await createThread(ctx, components.agent);
    const result = await myAgent.generateText(ctx, { threadId }, { prompt });
    return result.text;
  },
});
```

## Core Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | Encapsulates model, prompts, tools, and configuration |
| **Thread** | Groups messages in linear history |
| **Message** | Individual prompt or response in a thread |
| **Tools** | Functions the LLM can call |
| **Streaming** | Real-time response delivery via deltas |

## Key Patterns

### Async Response Generation (Recommended)

Save prompt first, then generate asynchronously for better UX:

```typescript
import { saveMessage } from "@convex-dev/agent";

export const sendMessage = mutation({
  args: { threadId: v.id("threads"), prompt: v.string() },
  handler: async (ctx, { threadId, prompt }) => {
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      prompt,
    });
    await ctx.scheduler.runAfter(0, internal.chat.generateResponse, {
      threadId,
      promptMessageId: messageId,
    });
  },
});

export const generateResponse = internalAction({
  args: { threadId: v.string(), promptMessageId: v.string() },
  handler: async (ctx, { threadId, promptMessageId }) => {
    await myAgent.generateText(ctx, { threadId }, { promptMessageId });
  },
});
```

### Streaming with Deltas

```typescript
await myAgent.streamText(
  ctx,
  { threadId },
  { prompt },
  { saveStreamDeltas: true }
);
```

### Creating Tools

```typescript
import { createTool } from "@convex-dev/agent";
import { z } from "zod/v3";

const searchTool = createTool({
  description: "Search the database",
  args: z.object({ query: z.string() }),
  handler: async (ctx, args): Promise<string> => {
    const results = await ctx.runQuery(api.search.find, { query: args.query });
    return JSON.stringify(results);
  },
});
```

## Reference Documentation

For detailed information, see the reference files:

- [Agent Definition & Usage](references/AGENT-USAGE.md)
- [Threads](references/THREADS.md)
- [Messages](references/MESSAGES.md)
- [Streaming](references/STREAMING.md)
- [Tools](references/TOOLS.md)
- [RAG](references/RAG.md)
- [Workflows](references/WORKFLOWS.md)
- [React Integration](references/REACT.md)
- [Debugging & Troubleshooting](references/DEBUGGING.md)

## Common Issues

### Type errors on `components.agent`

Run `npx convex dev` to generate component code.

### Circular dependencies

Add explicit return types to workflow handlers:

```typescript
handler: async (step, args): Promise<string> => { ... }
```

### Tool calls not executing

Set `maxSteps` or `stopWhen: stepCountIs(n)` where n > 1.
