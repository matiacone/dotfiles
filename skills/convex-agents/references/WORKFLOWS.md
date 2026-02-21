# Workflows

Agentic workflows combine LLM prompting with decision logic for multi-step operations.

## Workflow Elements

1. Prompting an LLM (message history, context, etc.)
2. Deciding what to do with the response

## Simple Chaining

```typescript
export const getAdvice = action({
  args: { location: v.string(), threadId: v.string() },
  handler: async (ctx, { location, threadId }) => {
    // Get weather forecast
    await weatherAgent.generateText(
      ctx,
      { threadId },
      { prompt: `What is the weather in ${location}?` },
    );

    // Get fashion advice based on weather (includes history)
    await fashionAgent.generateText(
      ctx,
      { threadId },
      { prompt: `What should I wear based on the weather?` },
    );
  },
});
```

## Building Reliable Workflows

LLMs are unreliable. Use these Convex components:

| Component | Purpose |
|-----------|---------|
| [Action Retrier](https://convex.dev/components/retrier) | Retry failed actions |
| [Workpool](https://convex.dev/components/workpool) | Limit concurrency, manage load |
| [Workflow](https://convex.dev/components/workflow) | Durable multi-step execution |

## Workflow Component

For long-lived, durable workflows with:
- Retries and idempotency
- Server restart survival
- Step-by-step progress tracking

### Installation

```bash
npm install @convex-dev/workflow
```

### Basic Workflow

```typescript
import { WorkflowManager } from "@convex-dev/workflow";

const workflow = new WorkflowManager(components.workflow);

export const supportAgentWorkflow = workflow.define({
  args: { prompt: v.string(), userId: v.string() },
  handler: async (step, { prompt, userId }): Promise<string> => {
    // Create thread (mutation step)
    const { threadId } = await createThread(step, components.agent, {
      userId,
      title: prompt,
    });

    // Save message (mutation step)
    const { messageId } = await saveMessage(step, components.agent, {
      threadId,
      prompt,
    });

    // Generate response (action step with retry)
    const { text } = await step.runAction(
      internal.example.getSupport,
      { threadId, userId, promptMessageId: messageId },
      { retry: true },
    );

    // Generate structured output
    const { object } = await step.runAction(
      internal.example.getStructuredSupport,
      { userId, prompt: text },
    );

    // Send user message (mutation step)
    await step.runMutation(internal.example.sendUserMessage, {
      userId,
      message: object.instruction,
    });

    return text;
  },
});
```

### Key Points

- Pass `step` instead of `ctx` to Agent functions
- Use `step.runAction` for actions (with optional retry)
- Use `step.runMutation` for mutations
- Always add return types to avoid circular dependencies
- Keep step arguments/returns small (use IDs, not data)

## Exposing Agent as Convex Actions

For use as workflow steps:

### Text Action

```typescript
import { stepCountIs } from "ai";

export const getSupport = supportAgent.asTextAction({
  stopWhen: stepCountIs(10),
});
```

### Object Action

```typescript
export const getStructuredSupport = supportAgent.asObjectAction({
  schema: z.object({
    analysis: z.string().describe("Analysis of the user's request"),
    instruction: z.string().describe("Suggested action"),
  }),
});
```

## Complex Workflow Patterns

- Dynamic routing based on LLM/vector search
- Fan-out/fan-in LLM calls
- Multi-agent orchestration
- ReAct (Reasoning and Acting) cycles
- Agent messaging networks
- Pausable/resumable workflows

## Human Agents

Allow humans to act as agents in conversations.

### Save User Message Without Reply

```typescript
import { saveMessage } from "@convex-dev/agent";

await saveMessage(ctx, components.agent, {
  threadId,
  prompt: "The user message",
});
```

### Human as Agent

```typescript
await saveMessage(ctx, components.agent, {
  threadId,
  agentName: "Alex",
  message: { role: "assistant", content: "The human reply" },
  metadata: {
    provider: "human",
    providerMetadata: { human: { name: "Alex" } },
  },
});
```

### Human-in-the-Loop via Tool

```typescript
const askHuman = tool({
  description: "Ask a human a question",
  parameters: z.object({
    question: z.string().describe("The question to ask"),
  }),
});

// Use in agent
const result = await agent.generateText(
  ctx,
  { threadId },
  { prompt: question, tools: { askHuman } },
);

// Handle tool calls
const supportRequests = result.toolCalls
  .filter((tc) => tc.toolName === "askHuman")
  .map(({ toolCallId, args }) => ({
    toolCallId,
    question: args.question,
  }));
```

### Human Response to Tool Call

```typescript
export const humanResponse = internalAction({
  args: {
    humanName: v.string(),
    response: v.string(),
    toolCallId: v.string(),
    threadId: v.string(),
    messageId: v.string(),
  },
  handler: async (ctx, args) => {
    await agent.saveMessage(ctx, {
      threadId: args.threadId,
      message: {
        role: "tool",
        content: [{
          type: "tool-result",
          result: args.response,
          toolCallId: args.toolCallId,
          toolName: "askHuman",
        }],
      },
    });

    // Continue generation
    await agent.generateText(
      ctx,
      { threadId: args.threadId },
      { promptMessageId: args.messageId },
    );
  },
});
```

## Deciding Who Responds

1. Store user/LLM assignment in database
2. Use cheap LLM to classify questions
3. Vector embeddings for routing decisions
4. Structured output with routing field
5. Tool call to request human intervention
