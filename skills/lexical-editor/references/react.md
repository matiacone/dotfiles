# Lexical React Integration

## Installation

```bash
bun add lexical @lexical/react @lexical/rich-text @lexical/list @lexical/link @lexical/html @lexical/history @lexical/selection @lexical/utils
```

## Minimal Rich Text Editor

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';

const theme = {
  paragraph: 'editor-paragraph',
  text: {
    bold: 'editor-text-bold',
    italic: 'editor-text-italic',
    underline: 'editor-text-underline',
    strikethrough: 'editor-text-strikethrough',
  },
  heading: {
    h1: 'editor-heading-h1',
    h2: 'editor-heading-h2',
    h3: 'editor-heading-h3',
  },
  list: {
    ol: 'editor-list-ol',
    ul: 'editor-list-ul',
    listitem: 'editor-listitem',
  },
  link: 'editor-link',
};

function onError(error: Error) {
  console.error(error);
}

export function EmailEditor() {
  const initialConfig = {
    namespace: 'EmailEditor',
    theme,
    onError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
    ],
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <ToolbarPlugin />
      <RichTextPlugin
        contentEditable={
          <ContentEditable
            className="email-editor-content"
            aria-placeholder="Compose your email..."
            placeholder={<div className="placeholder">Compose your email...</div>}
          />
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <LinkPlugin />
    </LexicalComposer>
  );
}
```

## Key Concepts for React

- **`<LexicalComposer>`** is the root provider. It creates the editor instance and makes it available via React Context.
- **Plugins are React components** rendered as children of `<LexicalComposer>`. They access the editor via `useLexicalComposerContext()`.
- **Lexical is uncontrolled** — don't try to pass editor state back in like a controlled input. Use `initialConfig.editorState` only once at initialization.

## Official React Plugins

| Plugin | Purpose | Registration Needed |
|--------|---------|-------------------|
| `RichTextPlugin` | Core rich text editing (typing, deletion, copy/paste, formatting, indent/outdent) | — |
| `HistoryPlugin` | Undo/redo stack management | — |
| `OnChangePlugin` | Fires callback on every state change | — |
| `ListPlugin` | Ordered/unordered list support | `ListNode`, `ListItemNode` |
| `CheckListPlugin` | Check lists (todo-style) | `ListNode`, `ListItemNode` + CSS |
| `LinkPlugin` | Link support with `$toggleLink` command | `LinkNode` |
| `AutoLinkPlugin` | Auto-converts typed URLs to links | `AutoLinkNode`, `LinkNode` |
| `TablePlugin` | Table support | `TableNode`, `TableCellNode`, `TableRowNode` |
| `TabIndentationPlugin` | Tab key for indentation | — |
| `MarkdownShortcutPlugin` | Markdown shortcuts (headings, bold, lists, etc.) | Various nodes |
| `ClearEditorPlugin` | Adds `clearEditor` command | — |
| `AutoFocusPlugin` | Auto-focuses the editor on mount | — |
| `EditorRefPlugin` | Exposes the editor instance via a ref | — |
| `SelectionAlwaysOnDisplay` | Keeps selection visible when editor loses focus | — |

**Important:** Many plugins require you to register their corresponding nodes in the `nodes` array of the initial config.

## Accessing the Editor Instance

```tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

function MyPlugin() {
  const [editor] = useLexicalComposerContext();

  // Now you can use the editor instance
  const handleClick = () => {
    editor.update(() => {
      // Make changes
    });
  };

  return <button onClick={handleClick}>Do something</button>;
}
```

## OnChangePlugin for State Tracking

```tsx
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

<OnChangePlugin
  onChange={(editorState) => {
    // Called on every state change
    const json = JSON.stringify(editorState.toJSON());
    saveDraft(json);
  }}
  ignoreHistoryMergeTagChange={true}
/>
```

## EditorRefPlugin for External Access

```tsx
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { useRef } from 'react';
import type { LexicalEditor } from 'lexical';

function MyComponent() {
  const editorRef = useRef<LexicalEditor | null>(null);

  const handleSend = () => {
    if (editorRef.current) {
      editorRef.current.read(() => {
        // Read state
      });
    }
  };

  return (
    <LexicalComposer initialConfig={config}>
      <EditorRefPlugin editorRef={editorRef} />
      {/* other plugins */}
      <button onClick={handleSend}>Send</button>
    </LexicalComposer>
  );
}
```

## Extensions System (v0.36+, Experimental)

Extensions are a newer, framework-agnostic alternative to React plugins:

```typescript
import { defineExtension } from 'lexical';

const MyExtension = defineExtension({
  name: 'my-extension',
  nodes: [MyCustomNode],
  register: (editor) => {
    return editor.registerCommand(MY_COMMAND, handler, COMMAND_PRIORITY_LOW);
  },
});
```

Benefits over React plugins: automatic dependency management, no context provider hierarchy issues, and they work outside React.
