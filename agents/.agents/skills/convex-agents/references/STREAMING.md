# Streaming

Stream responses to give users real-time feedback while LLMs generate text.

## Streaming Approaches

1. **HTTP Streaming** - Traditional approach, works out of the box
2. **Delta Streaming** - Async, survives network interruptions, multiple clients

## Delta Streaming (Recommended)

### Saving Stream Deltas

```typescript
await agent.streamText(
  ctx,
  { threadId },
  { prompt },
  { saveStreamDeltas: true }
);
```

### Configuration Options

```typescript
{
  saveStreamDeltas: {
    chunking: "word" | "line" | regex | customFunction,
    throttleMs: 1000, // How frequently deltas are saved
  }
}
```

## Server-Side Query for Streaming

```typescript
import { paginationOptsValidator } from "convex/server";
import { vStreamArgs, listUIMessages, syncStreams } from "@convex-dev/agent";
import { components } from "./_generated/api";

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    await authorizeThreadAccess(ctx, args.threadId);

    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);

    return { ...paginated, streams };
  },
});
```

## Client-Side: useUIMessages Hook

```typescript
import { useUIMessages } from "@convex-dev/agent/react";

function MyComponent({ threadId }: { threadId: string }) {
  const { results, status, loadMore } = useUIMessages(
    api.chat.streaming.listMessages,
    { threadId },
    { initialNumItems: 10, stream: true },
  );

  return (
    <div>
      {results.map((message) => (
        <div key={message.key}>{message.text}</div>
      ))}
    </div>
  );
}
```

## Text Smoothing

### useSmoothText Hook

```typescript
import { useSmoothText, type UIMessage } from "@convex-dev/agent/react";

function Message({ message }: { message: UIMessage }) {
  const [visibleText] = useSmoothText(message.text, {
    startStreaming: message.status === "streaming",
  });
  return <div>{visibleText}</div>;
}
```

### SmoothText Component

```typescript
import { SmoothText } from "@convex-dev/agent/react";

<SmoothText text={message.text} />
```

## HTTP Streaming (Manual)

### Consuming the Stream

```typescript
const result = await agent.streamText(ctx, { threadId }, { prompt });

for await (const textPart of result.textStream) {
  console.log(textPart);
}
```

### Return as HTTP Response

```typescript
const result = await agent.streamText(
  ctx,
  { threadId },
  { prompt },
  { saveStreamDeltas: { returnImmediately: true } },
);

return result.toUIMessageStreamResponse();
```

## Advanced: Manual Delta Streaming

Use `DeltaStreamer` for custom streaming without the Agent wrapper:

```typescript
import { DeltaStreamer, compressUIMessageChunks } from "@convex-dev/agent";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

async function stream(ctx: ActionCtx, threadId: string, order: number) {
  const streamer = new DeltaStreamer(
    components.agent,
    ctx,
    {
      throttleMs: 100,
      onAsyncAbort: async () => console.error("Aborted"),
      compress: compressUIMessageChunks,
      abortSignal: undefined,
    },
    {
      threadId,
      format: "UIMessageChunk",
      order,
      stepOrder: 0,
      userId: undefined,
    },
  );

  const response = streamText({
    model: openai.chat("gpt-4o-mini"),
    prompt: "Tell me a joke",
    abortSignal: streamer.abortController.signal,
    onError: (error) => {
      console.error(error);
      streamer.fail(errorToString(error.error));
    },
  });

  void streamer.consumeStream(response.toUIMessageStream());

  return {
    response,
    streamId: await streamer.getStreamId(),
  };
}
```

### Query for Manual Streams

```typescript
import { vStreamArgs, syncStreams } from "@convex-dev/agent";

export const listStreams = query({
  args: {
    threadId: v.string(),
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const streams = await syncStreams(ctx, components.agent, {
      ...args,
      includeStatuses: ["streaming", "aborted", "finished"],
    });
    return { streams };
  },
});
```

### Client Hook for Manual Streams

```typescript
const messages = useStreamingUIMessages(api.example.listStreams, { threadId });
```
