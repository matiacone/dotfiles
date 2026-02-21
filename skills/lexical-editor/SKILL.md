---
name: lexical-editor
description: Build rich text editors with Lexical framework for email composition. Use when implementing email editors, HTML serialization, custom nodes, toolbars, or integrating Lexical with React. Covers email-safe HTML output, draft storage, and reply/forward workflows.
---

# Lexical Rich Text Editor for Email Integration

Lexical is Meta's extensible text-editor framework (~22kb min+gzip) with first-class React bindings. Unlike monolithic editors, Lexical is a framework where you compose your own editor from building blocks.

## When to Use This Skill

- Building an email composer with rich text
- Converting Lexical state to email-safe HTML
- Loading HTML into Lexical (reply/forward flows)
- Creating custom nodes for email signatures, templates
- Building formatting toolbars
- Implementing draft auto-save with Convex

## Quick Reference

### Core Packages

```bash
bun add lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link @lexical/html @lexical/history @lexical/selection @lexical/utils
```

### Minimal Setup

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';

const initialConfig = {
  namespace: 'EmailEditor',
  theme: { /* see references/theming.md */ },
  onError: console.error,
  nodes: [/* see references/nodes.md */],
};

<LexicalComposer initialConfig={initialConfig}>
  <RichTextPlugin
    contentEditable={<ContentEditable />}
    ErrorBoundary={LexicalErrorBoundary}
  />
  <HistoryPlugin />
</LexicalComposer>
```

### Critical Conventions

1. **`$`-prefixed functions** (like `$getRoot()`, `$getSelection()`) can ONLY be called inside `editor.update()` or `editor.read()` closures
2. **Never use `\n` in TextNodes** — use `LineBreakNode` instead
3. **Lexical is uncontrolled** — use `editorState` in `initialConfig` only once at initialization
4. **Register all nodes you use** — if using `ListPlugin`, include `ListNode` and `ListItemNode` in config

### HTML Serialization (Email Output)

```typescript
import { $generateHtmlFromNodes } from '@lexical/html';

// Lexical → HTML for sending
editor.read(() => {
  const html = $generateHtmlFromNodes(editor, null);
  sendEmail({ body: html });
});
```

### Loading HTML (Reply/Forward)

```typescript
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

editor.update(() => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(html, 'text/html');
  const nodes = $generateNodesFromDOM(editor, dom);
  $getRoot().clear();
  $insertNodes(nodes);
});
```

## Reference Documentation

Detailed documentation is split into focused reference files:

| Topic | File | Contents |
|-------|------|----------|
| Architecture | [references/architecture.md](references/architecture.md) | Core concepts, update cycle, state management |
| Node System | [references/nodes.md](references/nodes.md) | Built-in nodes, custom nodes, node replacement |
| React Integration | [references/react.md](references/react.md) | LexicalComposer, plugins, hooks |
| Commands | [references/commands.md](references/commands.md) | Built-in commands, custom commands, event handling |
| Serialization | [references/serialization.md](references/serialization.md) | JSON/HTML export, email-safe output, ExtendedTextNode |
| Toolbar | [references/toolbar.md](references/toolbar.md) | Building formatting toolbars, selection state |
| Email Patterns | [references/email-patterns.md](references/email-patterns.md) | Email-specific considerations, reply/forward, drafts |
| Theming | [references/theming.md](references/theming.md) | CSS class mapping, theme configuration |

## Recommended Email Editor Architecture

```
┌─────────────────────────────────────┐
│  LexicalComposer (initialConfig)    │
│  ├── ToolbarPlugin (custom)         │  ← Formatting toolbar
│  ├── RichTextPlugin                 │  ← Core editing
│  ├── HistoryPlugin                  │  ← Undo/Redo
│  ├── ListPlugin                     │  ← Lists
│  ├── LinkPlugin                     │  ← Links
│  ├── AutoLinkPlugin                 │  ← Auto-link URLs
│  ├── OnChangePlugin                 │  ← Save drafts
│  ├── LoadHTMLPlugin (custom)        │  ← Reply/forward
│  └── SignaturePlugin (custom)       │  ← Email signatures
│                                     │
│  Node Registration:                 │
│  ├── ExtendedTextNode (replaces TextNode)
│  ├── HeadingNode, QuoteNode         │
│  ├── ListNode, ListItemNode         │
│  ├── LinkNode, AutoLinkNode         │
│  └── EmailSignatureNode (custom)    │
└─────────────────────────────────────┘
```

## Data Flow with Convex

- **Drafts:** Lexical JSON → Convex mutation (store as JSON string)
- **Send:** Lexical → `$generateHtmlFromNodes()` → Convex action → Email API
- **Reply/Forward:** Received HTML → `$generateNodesFromDOM()` → Lexical
- **Server-side:** `@lexical/headless` + JSDOM in Convex action

## Common Gotchas

See [references/gotchas.md](references/gotchas.md) for the full list, but key ones:

1. Register ALL nodes you use in the `nodes` array
2. `$`-prefixed functions only work inside update/read closures
3. Use `LineBreakNode` for line breaks, never `\n` in text
4. State updates are async by default (use `{ discrete: true }` for sync)
5. Theme classes require nodes to read from theme in `createDOM()`
