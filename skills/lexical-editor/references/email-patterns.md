# Email-Specific Patterns for Lexical

## HTML Output for Email Clients

Email HTML has severe constraints:
- No external CSS
- Limited tag support
- Outlook uses Word's rendering engine
- Gmail strips certain styles
- Different clients render differently

### Key Strategies

1. **Inline all styles** — Override `exportDOM()` on all nodes to use inline CSS, not classes
2. **Use tables for layout** — Ghost's `@tryghost/kg-lexical-html-renderer` shows this pattern
3. **Sanitize output** — Strip any Lexical-specific data attributes
4. **Test across clients** — Gmail, Outlook, Apple Mail all render differently

### Email-Safe Node Example

```typescript
class EmailParagraphNode extends ParagraphNode {
  static getType() {
    return 'email-paragraph';
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement('p');
    // Email-safe inline styles instead of classes
    element.style.margin = '0 0 10px 0';
    element.style.fontFamily = 'Arial, sans-serif';
    element.style.fontSize = '14px';
    element.style.lineHeight = '1.5';
    element.style.color = '#333333';
    return { element };
  }
}
```

## Loading Reply/Forward Content

```tsx
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

function ReplyEditor({ originalHtml }: { originalHtml: string }) {
  const initialConfig = {
    namespace: 'ReplyEditor',
    editorState: (editor: LexicalEditor) => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(originalHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.select();
      $insertNodes(nodes);
    },
    nodes: [/* your nodes */],
    onError: console.error,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* plugins */}
    </LexicalComposer>
  );
}
```

## Saving Drafts to Convex

```tsx
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useMutation } from 'convex/react';
import { api } from '@deal-deploy/backend/convex/_generated/api';
import { useDebouncedCallback } from 'use-debounce';

function DraftSavePlugin({ draftId }: { draftId: Id<'emailDrafts'> }) {
  const saveDraft = useMutation(api.emailDrafts.update);

  const debouncedSave = useDebouncedCallback(
    (editorState: EditorState) => {
      const json = JSON.stringify(editorState.toJSON());
      saveDraft({ id: draftId, content: json });
    },
    1000 // Save after 1 second of inactivity
  );

  return (
    <OnChangePlugin
      onChange={debouncedSave}
      ignoreHistoryMergeTagChange={true}
    />
  );
}
```

## Getting HTML on Send

```typescript
import { $generateHtmlFromNodes } from '@lexical/html';
import { $getRoot } from 'lexical';

function handleSend(editor: LexicalEditor) {
  let html = '';
  let plainText = '';

  editor.read(() => {
    html = $generateHtmlFromNodes(editor, null);
    plainText = $getRoot().getTextContent();
  });

  // Wrap in email-safe structure
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; color: #333333;">
      ${html}
    </body>
    </html>
  `;

  return { html: emailHtml, plainText };
}
```

## Line Break Handling

Email editors typically need `<br>` for Shift+Enter and `<p>` for Enter. Lexical handles this by default:
- Enter creates a new paragraph
- Listen for Shift+Enter to insert a `LineBreakNode`

```typescript
import { KEY_ENTER_COMMAND, COMMAND_PRIORITY_HIGH, $insertNodes } from 'lexical';
import { $createLineBreakNode } from 'lexical';

editor.registerCommand(
  KEY_ENTER_COMMAND,
  (event: KeyboardEvent | null) => {
    if (event?.shiftKey) {
      event.preventDefault();
      editor.update(() => {
        const lineBreak = $createLineBreakNode();
        $insertNodes([lineBreak]);
      });
      return true;
    }
    return false;
  },
  COMMAND_PRIORITY_HIGH
);
```

## Email Signature Plugin

```tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getRoot, $createParagraphNode, $createTextNode } from 'lexical';
import { useEffect } from 'react';

interface SignaturePluginProps {
  signature?: string;
  insertOnMount?: boolean;
}

export function SignaturePlugin({ signature, insertOnMount = false }: SignaturePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!signature || !insertOnMount) return;

    editor.update(() => {
      const root = $getRoot();

      // Add separator
      const separatorPara = $createParagraphNode();
      separatorPara.append($createTextNode('--'));
      root.append(separatorPara);

      // Add signature lines
      const signatureLines = signature.split('\n');
      for (const line of signatureLines) {
        const para = $createParagraphNode();
        para.append($createTextNode(line));
        root.append(para);
      }
    });
  }, [editor, signature, insertOnMount]);

  return null;
}
```

## Quoted Reply Content

```tsx
import { $createQuoteNode } from '@lexical/rich-text';
import { $generateNodesFromDOM } from '@lexical/html';

function insertQuotedReply(editor: LexicalEditor, originalHtml: string) {
  editor.update(() => {
    const root = $getRoot();

    // Add blank line for user's reply
    const replyPara = $createParagraphNode();
    root.append(replyPara);

    // Add "On [date], [sender] wrote:" header
    const headerPara = $createParagraphNode();
    headerPara.append($createTextNode('On Jan 15, 2024, John Doe wrote:'));
    root.append(headerPara);

    // Parse and quote the original content
    const parser = new DOMParser();
    const dom = parser.parseFromString(originalHtml, 'text/html');
    const nodes = $generateNodesFromDOM(editor, dom);

    const quoteNode = $createQuoteNode();
    for (const node of nodes) {
      quoteNode.append(node);
    }
    root.append(quoteNode);

    // Move cursor to the reply area at the top
    replyPara.selectStart();
  });
}
```

## Attachment Indicator Node

```typescript
import { DecoratorNode, SerializedLexicalNode, LexicalNode } from 'lexical';

interface AttachmentPayload {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
}

export class AttachmentNode extends DecoratorNode<JSX.Element> {
  __attachment: AttachmentPayload;

  static getType(): string {
    return 'attachment';
  }

  static clone(node: AttachmentNode): AttachmentNode {
    return new AttachmentNode(node.__attachment, node.__key);
  }

  constructor(attachment: AttachmentPayload, key?: string) {
    super(key);
    this.__attachment = attachment;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'attachment-indicator';
    return div;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
        <PaperclipIcon className="h-4 w-4" />
        <span>{this.__attachment.filename}</span>
        <span className="text-gray-500 text-sm">
          ({formatFileSize(this.__attachment.size)})
        </span>
      </div>
    );
  }

  static importJSON(serializedNode: SerializedLexicalNode & { attachment: AttachmentPayload }): AttachmentNode {
    return new AttachmentNode(serializedNode.attachment);
  }

  exportJSON(): SerializedLexicalNode & { attachment: AttachmentPayload } {
    return {
      ...super.exportJSON(),
      attachment: this.__attachment,
      type: 'attachment',
      version: 1,
    };
  }
}
```

## Complete Email Editor Component

```tsx
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';

interface EmailEditorProps {
  initialHtml?: string;
  signature?: string;
  onSend: (content: { html: string; plainText: string }) => void;
  draftId?: Id<'emailDrafts'>;
}

export function EmailEditor({ initialHtml, signature, onSend, draftId }: EmailEditorProps) {
  const editorRef = useRef<LexicalEditor | null>(null);

  const initialConfig = {
    namespace: 'EmailEditor',
    theme: emailTheme,
    onError: console.error,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      ExtendedTextNode,
      { replace: TextNode, with: (node: TextNode) => new ExtendedTextNode(node.__text), withKlass: ExtendedTextNode },
    ],
    editorState: initialHtml ? (editor: LexicalEditor) => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(initialHtml, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $getRoot().select();
      $insertNodes(nodes);
    } : undefined,
  };

  const handleSend = () => {
    if (editorRef.current) {
      const content = handleSend(editorRef.current);
      onSend(content);
    }
  };

  return (
    <div className="email-editor-container">
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <div className="editor-inner">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="email-content-editable" />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <EditorRefPlugin editorRef={editorRef} />
        {signature && <SignaturePlugin signature={signature} insertOnMount />}
        {draftId && <DraftSavePlugin draftId={draftId} />}
      </LexicalComposer>
      <div className="editor-actions">
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
```
