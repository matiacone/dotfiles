# Lexical Common Gotchas & Tips

## Critical Rules

### 1. Never use `\n` in TextNodes

Use `LineBreakNode` instead. Lexical needs this for cross-browser/OS consistency.

```typescript
// Bad
const text = $createTextNode('Line 1\nLine 2');

// Good
import { $createLineBreakNode, $createTextNode } from 'lexical';

const line1 = $createTextNode('Line 1');
const lineBreak = $createLineBreakNode();
const line2 = $createTextNode('Line 2');
paragraph.append(line1, lineBreak, line2);
```

### 2. Register all nodes you use

If you use `ListPlugin`, you must include `ListNode` and `ListItemNode` in your config's `nodes` array.

```typescript
// Bad - will throw errors
const config = {
  nodes: [], // Missing list nodes!
};
<ListPlugin /> // Will fail

// Good
import { ListNode, ListItemNode } from '@lexical/list';

const config = {
  nodes: [ListNode, ListItemNode],
};
```

### 3. `$`-prefixed functions are context-dependent

Calling `$getRoot()` outside an `editor.update()` or `editor.read()` closure will throw a runtime error.

```typescript
// Bad - will throw
const root = $getRoot(); // Error!

// Good
editor.read(() => {
  const root = $getRoot(); // Works
});

editor.update(() => {
  const root = $getRoot(); // Works
});
```

### 4. State updates are async by default

If you need synchronous behavior (e.g., reading state right after update), pass `{ discrete: true }`:

```typescript
// Async (default) - state may not be updated immediately
editor.update(() => {
  // changes
});
// Can't reliably read state here

// Sync - waits for update to complete
editor.update(() => {
  // changes
}, { discrete: true });
// State is now updated
```

### 5. Lexical is uncontrolled

Don't try to pass state back in. Use `editorState` only in `initialConfig` once at initialization.

```typescript
// Bad - trying to control state
const [state, setState] = useState(initialState);
<LexicalComposer initialConfig={{ editorState: state }}> // Won't work as expected

// Good - set once at initialization
const initialConfig = {
  editorState: savedDraftJson, // Only used once
};
<LexicalComposer initialConfig={initialConfig}>
```

### 6. Transforms > Update Listeners for reactions

Transforms run before DOM reconciliation, avoiding double-renders:

```typescript
// Less efficient - runs after DOM update
editor.registerUpdateListener(({ editorState }) => {
  editorState.read(() => {
    // React to changes
  });
});

// More efficient - runs before DOM update
editor.registerNodeTransform(TextNode, (textNode) => {
  // React to text node changes
});
```

### 7. Keys are runtime-only

Node keys are not serialized and should be treated as opaque random values. Don't hardcode them in tests.

```typescript
// Bad
expect(node.__key).toBe('1'); // Keys are random

// Good
expect(node.getTextContent()).toBe('expected text');
```

### 8. Copy/paste uses HTML as transfer format

`exportDOM()` and `importDOM()` on your custom nodes directly affect copy/paste fidelity between Lexical and external apps (Gmail, Outlook, Google Docs).

### 9. Theme classes are applied via `createDOM()`

If a custom node's `createDOM()` doesn't read from the theme config, your theme classes won't apply.

```typescript
// Bad - ignores theme
createDOM(): HTMLElement {
  const div = document.createElement('div');
  div.className = 'hardcoded-class';
  return div;
}

// Good - reads from theme
createDOM(config: EditorConfig): HTMLElement {
  const div = document.createElement('div');
  const className = config.theme?.myNode;
  if (className) {
    div.className = className;
  }
  return div;
}
```

### 10. The Lexical Playground is a reference, not a library

The toolbar, floating menus, etc. in the playground are not exported as packages. They're meant as examples to copy and adapt.

## Common Mistakes

### Forgetting to return cleanup functions

```typescript
// Bad - memory leak
useEffect(() => {
  editor.registerUpdateListener(() => {});
}, [editor]);

// Good - cleanup on unmount
useEffect(() => {
  return editor.registerUpdateListener(() => {});
}, [editor]);
```

### Not handling null selection

```typescript
// Bad - may crash
editor.read(() => {
  const selection = $getSelection();
  selection.insertText('hello'); // Error if selection is null!
});

// Good - null check
editor.read(() => {
  const selection = $getSelection();
  if ($isRangeSelection(selection)) {
    selection.insertText('hello');
  }
});
```

### Infinite transform loops

```typescript
// Bad - infinite loop
editor.registerNodeTransform(TextNode, (textNode) => {
  textNode.setTextContent(textNode.getTextContent().toUpperCase());
  // This triggers another transform!
});

// Good - check before modifying
editor.registerNodeTransform(TextNode, (textNode) => {
  const text = textNode.getTextContent();
  const upper = text.toUpperCase();
  if (text !== upper) {
    textNode.setTextContent(upper);
  }
});
```

---

# Package Reference

| Package | Purpose |
|---------|---------|
| `lexical` | Core engine — editor, nodes, commands, selection |
| `@lexical/react` | React bindings — `LexicalComposer`, plugins, hooks |
| `@lexical/rich-text` | `HeadingNode`, `QuoteNode`, rich text commands |
| `@lexical/list` | `ListNode`, `ListItemNode`, list commands |
| `@lexical/link` | `LinkNode`, `AutoLinkNode`, `$toggleLink` |
| `@lexical/table` | Table nodes and commands |
| `@lexical/html` | `$generateHtmlFromNodes`, `$generateNodesFromDOM` |
| `@lexical/selection` | Selection utilities |
| `@lexical/utils` | General utilities (`$wrapNodeInElement`, `mergeRegister`, etc.) |
| `@lexical/clipboard` | Copy/paste handling |
| `@lexical/history` | Undo/redo stack |
| `@lexical/markdown` | Markdown import/export and shortcuts |
| `@lexical/headless` | Server-side editor (no DOM) |
| `@lexical/code` | Code blocks with syntax highlighting |

## Installation for Email Editor

```bash
bun add lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link @lexical/html @lexical/history @lexical/selection @lexical/utils
```

## TypeScript Types

All packages include TypeScript definitions. Key types:

```typescript
import type {
  LexicalEditor,
  EditorState,
  LexicalNode,
  ElementNode,
  TextNode,
  RangeSelection,
  NodeSelection,
  EditorConfig,
  SerializedLexicalNode,
  SerializedTextNode,
  SerializedElementNode,
  DOMConversionMap,
  DOMExportOutput,
  TextFormatType,
  ElementFormatType,
} from 'lexical';
```
