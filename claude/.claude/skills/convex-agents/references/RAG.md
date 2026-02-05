# RAG (Retrieval-Augmented Generation)

The Agent component has built-in hybrid vector/text search for message history. Use the RAG component for custom knowledge bases.

## What is RAG?

RAG allows LLMs to search custom knowledge bases for context:

- Search documents and knowledge bases
- Retrieve relevant context for answers
- Provide accurate, domain-specific responses
- Cite sources

## RAG Component Features

- **Namespaces**: Isolate user/team-specific data
- **Semantic Search**: Vector-based search with embeddings
- **Custom Filtering**: Filter during vector search
- **Chunk Context**: Get surrounding chunks
- **Importance Weighting**: Weight documents 0-1
- **Chunking Flexibility**: Custom or default chunking
- **Graceful Migrations**: Migrate without disruption

## Installation

```bash
npm install @convex-dev/rag
```

## RAG Approaches

### 1. Prompt-based RAG

Always search and inject context into the prompt:

```typescript
const context = await rag.search(ctx, {
  namespace: "global",
  query: userPrompt,
  limit: 10,
});

const result = await agent.generateText(
  ctx,
  { threadId },
  {
    prompt: `# Context:\n\n${context.text}\n\n---\n\n# Question:\n\n"""${userPrompt}"""`,
  },
);
```

**Best for**: FAQ systems, document search

### 2. Tool-based RAG

Let the LLM decide when to search:

```typescript
const searchContext = createTool({
  description: "Search for context related to this user prompt",
  args: z.object({
    query: z.string().describe("Describe the context you're looking for"),
  }),
  handler: async (ctx, { query }) => {
    const context = await rag.search(ctx, { namespace: userId, query });
    return context.text;
  },
});
```

**Best for**: Dynamic knowledge management

## Comparison

| Feature | Prompt-based | Tool-based |
|---------|-------------|------------|
| Context Search | Always | AI decides |
| Adding Context | Manual | AI can add during conversation |
| Flexibility | Simple, predictable | Intelligent, adaptive |
| Use Case | FAQ, document search | Dynamic knowledge |
| Predictability | Defined by code | AI may over/under-query |

## Ingesting Content

### Parsing Images

```typescript
const description = await thread.generateText({
  message: {
    role: "user",
    content: [{ type: "image", data: url, mimeType: blob.type }],
  },
});
```

### Parsing PDFs

Use Pdf.js in the browser (not server-side due to memory/bundle size).

### Parsing Text Files

Use text files directly or use an LLM to structure them for better embeddings.

## Files and Images in Messages

### Uploading and Using Files

```typescript
import { storeFile, getFile } from "@convex-dev/agent";

// 1. Store the file
const { file } = await storeFile(
  ctx,
  components.agent,
  new Blob([bytes], { type: mimeType }),
  { filename, sha256 },
);

// 2. Send with message
const { filePart, imagePart } = await getFile(ctx, components.agent, file.fileId);
const { messageId } = await agent.saveMessage(ctx, {
  threadId,
  message: {
    role: "user",
    content: [
      imagePart ?? filePart,
      { type: "text", text: "What is this image?" },
    ],
  },
  metadata: { fileIds: [file.fileId] },
});

// 3. Generate response
await thread.generateText({ promptMessageId: messageId });
```

### Inline File Saving (Actions)

```typescript
await thread.generateText({
  message: {
    role: "user",
    content: [
      { type: "image", image: imageBytes, mimeType: "image/png" },
      { type: "text", text: "What is this image?" },
    ],
  },
});
```

### Manual URL Approach

```typescript
const storageId = await ctx.storage.store(blob);
const url = await ctx.storage.getUrl(storageId);

await thread.generateText({
  message: {
    role: "user",
    content: [
      { type: "image", data: url, mimeType: blob.type },
      { type: "text", text: "What is this image?" },
    ],
  },
});
```

## Generating Images

```typescript
// Generate image with OpenAI, then save to thread
const imageBytes = await generateWithDallE(prompt);
await thread.generateText({
  message: {
    role: "assistant",
    content: [
      { type: "image", image: imageBytes, mimeType: "image/png" },
    ],
  },
});
```
