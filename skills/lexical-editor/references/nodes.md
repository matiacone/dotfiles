# Lexical Node System

Nodes are the fundamental data model. Every piece of content in the editor is a node.

## Built-in Node Types

| Node | Role | Package |
|------|------|---------|
| `RootNode` | Top-level container (the `contentEditable` itself). Cannot be subclassed. | `lexical` |
| `TextNode` | Inline text with formatting (bold, italic, etc.) stored as bit flags | `lexical` |
| `ParagraphNode` | Block-level paragraph | `lexical` |
| `LineBreakNode` | Represents `\n` — **never use `\n` in TextNodes** | `lexical` |
| `HeadingNode` | `<h1>` through `<h6>` | `@lexical/rich-text` |
| `QuoteNode` | Blockquote | `@lexical/rich-text` |
| `ListNode` | Ordered/unordered lists | `@lexical/list` |
| `ListItemNode` | Individual list items | `@lexical/list` |
| `LinkNode` | Hyperlinks | `@lexical/link` |
| `TableNode` | Tables | `@lexical/table` |
| `DecoratorNode` | Framework-agnostic wrapper for embedding arbitrary components (images, embeds, etc.) | `lexical` |

## Node Hierarchy

```
RootNode (always the top)
  └── ElementNode (block-level containers)
       ├── ParagraphNode
       ├── HeadingNode
       ├── QuoteNode
       ├── ListNode
       │    └── ListItemNode
       └── ... custom block nodes
  └── TextNode (inline content within ElementNodes)
  └── DecoratorNode (inline or block embeds)
```

## Creating Custom Nodes

Every custom node must implement:
- `static getType()` — unique string identifier
- `static clone(node)` — cloning for state snapshots
- `static importJSON()` — deserialization
- `exportJSON()` — serialization
- `createDOM()` — how to render to the DOM
- `updateDOM()` — whether to recreate the DOM element on changes

### Example: Email Signature Node

```typescript
import { ElementNode, SerializedElementNode, LexicalNode, EditorConfig } from 'lexical';

export class EmailSignatureNode extends ElementNode {
  static getType(): string {
    return 'email-signature';
  }

  static clone(node: EmailSignatureNode): EmailSignatureNode {
    return new EmailSignatureNode(node.__key);
  }

  static importJSON(serializedNode: SerializedElementNode): EmailSignatureNode {
    return new EmailSignatureNode().updateFromJSON(serializedNode);
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    div.className = 'email-signature';
    div.style.borderTop = '1px solid #ccc';
    div.style.marginTop = '16px';
    div.style.paddingTop = '8px';
    return div;
  }

  updateDOM(): boolean {
    return false; // DOM doesn't need to be recreated
  }
}
```

## Node Replacement (Overriding Built-in Nodes)

You can replace any built-in node with a subclass to customize behavior — crucial for email editors that need custom HTML output:

```typescript
const editorConfig = {
  nodes: [
    CustomParagraphNode,
    {
      replace: ParagraphNode,
      with: (node: ParagraphNode) => $createCustomParagraphNode(),
      withKlass: CustomParagraphNode,
    },
  ],
};
```

The `withKlass` option ensures transforms and mutation listeners targeting the original node also apply to your replacement.

## NodeState API (Experimental, v0.26+)

A newer alternative to adding properties via subclassing. Lets you attach arbitrary key-value data to any node without subclassing:

```typescript
import { createState, $getState, $setState } from 'lexical';

const emailPriority = createState('emailPriority', { default: 'normal' });

// Reading
const priority = $getState(someNode, emailPriority);

// Writing
$setState(someNode, emailPriority, 'high');
```

Benefits: automatic JSON serialization, less boilerplate, works with `RootNode` for document-level metadata.

## Common Email Editor Nodes Registration

```typescript
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { ExtendedTextNode } from './ExtendedTextNode'; // See serialization.md
import { TextNode } from 'lexical';

const initialConfig = {
  nodes: [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    LinkNode,
    AutoLinkNode,
    ExtendedTextNode,
    // Replace TextNode with ExtendedTextNode for style preservation
    {
      replace: TextNode,
      with: (node: TextNode) => new ExtendedTextNode(node.__text),
      withKlass: ExtendedTextNode,
    },
  ],
};
```
