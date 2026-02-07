# React Integration

React hooks and components for displaying agent messages and handling streaming.

## useUIMessages Hook

The primary hook for fetching and displaying messages:

```typescript
import { useUIMessages } from "@convex-dev/agent/react";
import { api } from "../convex/_generated/api";

function ChatComponent({ threadId }: { threadId: string }) {
  const { results, status, loadMore } = useUIMessages(
    api.chat.listMessages,
    { threadId },
    { initialNumItems: 10 },
  );

  return (
    <div>
      {results.map((message) => (
        <div key={message.key}>
          <strong>{message.role}:</strong> {message.text}
        </div>
      ))}
      {status === "CanLoadMore" && (
        <button onClick={() => loadMore(10)}>Load More</button>
      )}
    </div>
  );
}
```

### With Streaming

```typescript
const { results, status, loadMore } = useUIMessages(
  api.chat.listMessages,
  { threadId },
  { initialNumItems: 10, stream: true },
);
```

## useThreadMessages Hook

Older hook that returns MessageDocs instead of UIMessages:

```typescript
import { useThreadMessages, toUIMessages } from "@convex-dev/agent/react";

const { results } = useThreadMessages(
  api.chat.listMessages,
  { threadId },
);
const uiMessages = toUIMessages(results);
```

## Optimistic Updates

Show sent messages immediately before server confirmation:

```typescript
import { optimisticallySendMessage } from "@convex-dev/agent/react";

const sendMessage = useMutation(
  api.chat.sendMessage,
).withOptimisticUpdate(
  optimisticallySendMessage(api.chat.listMessages),
);
```

### Custom Arguments

```typescript
const sendMessage = useMutation(
  api.chat.sendMessage,
).withOptimisticUpdate((store, args) => {
  optimisticallySendMessage(api.chat.listMessages)(store, {
    threadId: args.threadId,
    prompt: args.customPromptField,
  });
});
```

## Text Smoothing

### useSmoothText Hook

Smooth text as it streams in:

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

function Message({ message }: { message: UIMessage }) {
  return <SmoothText text={message.text} />;
}
```

## useStreamingUIMessages Hook

For custom streaming without the Agent wrapper:

```typescript
import { useStreamingUIMessages } from "@convex-dev/agent/react";

const messages = useStreamingUIMessages(api.chat.listStreams, { threadId });
```

## UIMessage Type

Extended from AI SDK UIMessage:

```typescript
import { type UIMessage } from "@convex-dev/agent";

interface UIMessage {
  // Core AI SDK fields
  parts: Array<TextPart | FilePart | ImagePart | ToolCallPart | ToolResultPart>;
  content: string;
  role: "user" | "assistant" | "system";

  // Agent component extensions
  key: string;           // Unique identifier
  order: number;         // Order in thread
  stepOrder: number;     // Step within response
  status: string;        // "streaming" or final status
  agentName?: string;    // Agent that generated
  text: string;          // Text content
  _creationTime: number; // Timestamp
}
```

## Complete Chat Example

```typescript
import { useState } from "react";
import { useMutation } from "convex/react";
import { useUIMessages, optimisticallySendMessage, SmoothText } from "@convex-dev/agent/react";
import { api } from "../convex/_generated/api";

function Chat({ threadId }: { threadId: string }) {
  const [input, setInput] = useState("");

  const { results: messages, status, loadMore } = useUIMessages(
    api.chat.listMessages,
    { threadId },
    { initialNumItems: 20, stream: true },
  );

  const sendMessage = useMutation(
    api.chat.sendMessage,
  ).withOptimisticUpdate(
    optimisticallySendMessage(api.chat.listMessages),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ threadId, prompt: input });
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {status === "CanLoadMore" && (
          <button onClick={() => loadMore(20)}>Load older messages</button>
        )}

        {messages.map((message) => (
          <div
            key={message.key}
            className={message.role === "user" ? "text-right" : "text-left"}
          >
            <div className={`inline-block p-3 rounded-lg ${
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-gray-100"
            }`}>
              {message.status === "streaming" ? (
                <SmoothText text={message.text} />
              ) : (
                message.text
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="w-full p-2 border rounded"
        />
      </form>
    </div>
  );
}
```

## Server-Side Query for React

```typescript
import { query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { listUIMessages, vStreamArgs, syncStreams } from "@convex-dev/agent";
import { components } from "./_generated/api";

export const listMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    // Add authorization here
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});
```
