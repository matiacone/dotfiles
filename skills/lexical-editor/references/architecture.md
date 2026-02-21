# Lexical Architecture

## The Three Pillars

Lexical's architecture is a **unidirectional data flow** between three core concepts:

### 1. Editor Instance

The central object wiring everything together. Created via `createEditor()` or automatically by `@lexical/react`'s `<LexicalComposer>`. Attaches to a single `contentEditable` DOM element.

### 2. Editor State

An immutable snapshot of the editor's content at a point in time. Contains:
- A **Node Tree** (starting from the RootNode)
- A **Selection** object (can be null)

### 3. DOM Reconciler

Lexical's own virtual-DOM-like system that diffs the "current" and "pending" editor states and applies minimal DOM mutations. It handles LTR/RTL automatically and batches multiple synchronous updates into a single DOM reconciliation.

## The Update Cycle

```
User Input → DOM Event → Command Dispatched → Editor State Updated → DOM Reconciled
```

Lexical uses **double-buffering**: there's a frozen "current" state (what's on screen) and a work-in-progress "pending" state. Updates are batched and async by default for performance.

## Reading & Updating State

All state manipulation happens inside closures:

```typescript
// Read-only access
editor.read(() => {
  const root = $getRoot();
  const text = root.getTextContent();
});

// Mutating access
editor.update(() => {
  const root = $getRoot();
  const paragraph = $createParagraphNode();
  const textNode = $createTextNode('Hello');
  paragraph.append(textNode);
  root.append(paragraph);
});
```

**Critical convention:** Functions prefixed with `$` (like `$getRoot()`, `$getSelection()`) can ONLY be called inside `editor.update()` or `editor.read()` closures. Think of them like React hooks — context-dependent.

## Listeners

```typescript
// Fires on every state change
const unregister = editor.registerUpdateListener(({ editorState }) => {
  editorState.read(() => {
    const root = $getRoot();
    const text = root.getTextContent();
    updateCharCount(text.length);
  });
});

// Fires only when text content changes (not selection)
editor.registerTextContentListener((textContent) => {
  console.log('Text changed:', textContent);
});

// Fires when specific node types are mutated
editor.registerMutationListener(LinkNode, (mutatedNodes) => {
  for (const [nodeKey, mutation] of mutatedNodes) {
    console.log(`Link ${nodeKey} was ${mutation}`); // 'created' | 'updated' | 'destroyed'
  }
});
```

## Node Transforms

Transforms are the most efficient way to react to node changes because they run before DOM reconciliation (no double-update waterfall):

```typescript
// Auto-detect and linkify URLs as the user types
editor.registerNodeTransform(TextNode, (textNode) => {
  const text = textNode.getTextContent();
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch) {
    // Split and wrap in LinkNode
  }
});
```

**Important:** Transforms must be idempotent and should check state before mutating to avoid infinite loops.

## Working with DOM Events

For custom keyboard shortcuts or click handling:

```typescript
editor.registerRootListener((rootElement, prevRootElement) => {
  if (prevRootElement) {
    prevRootElement.removeEventListener('keydown', handleKeyDown);
  }
  if (rootElement) {
    rootElement.addEventListener('keydown', handleKeyDown);
  }
});
```

## Selection Types

Lexical has four selection types:

| Type | Use Case |
|------|----------|
| `RangeSelection` | Most common — text cursor or text range. Has `anchor` and `focus` points. |
| `NodeSelection` | For selecting entire nodes (images, embeds). |
| `TableSelection` | For multi-cell table selection. |
| `null` | Editor has no active selection (blurred). |

```typescript
editor.update(() => {
  const selection = $getSelection();

  if ($isRangeSelection(selection)) {
    // Text formatting check
    const isBold = selection.hasFormat('bold');

    // Get selected text
    const text = selection.getTextContent();

    // Insert text at cursor
    selection.insertText('Hello');

    // Insert nodes at cursor
    selection.insertNodes([newNode]);
  }
});
```
