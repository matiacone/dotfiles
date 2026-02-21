# Lexical Serialization & Deserialization

This is the most important section for an email editor. You need to convert between Lexical's internal state and HTML for sending emails.

## JSON Serialization (for Storage/Drafts)

```typescript
// Lexical → JSON (save draft)
const editorState = editor.getEditorState();
const json = JSON.stringify(editorState.toJSON());
// Store `json` in your database (Convex)

// JSON → Lexical (load draft)
const initialConfig = {
  editorState: savedJsonString, // Pass directly as string
  // ... other config
};
```

## HTML Serialization (for Sending Emails)

This is what you'll use to generate the actual email body.

```typescript
import { $generateHtmlFromNodes } from '@lexical/html';

// Lexical → HTML
editor.read(() => {
  const htmlString = $generateHtmlFromNodes(editor, null); // null = entire editor
  // `htmlString` is your email body HTML
  sendEmail({ body: htmlString });
});
```

## HTML → Lexical (Loading HTML into the Editor)

Essential for "reply" and "forward" workflows where you need to load existing email HTML:

```typescript
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, CLEAR_HISTORY_COMMAND } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLayoutEffect } from 'react';

// Create a plugin to load initial HTML
function LoadHTMLPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    if (!html) return;

    editor.update(() => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      const root = $getRoot();
      root.clear();
      root.select();
      $insertNodes(nodes);
    });

    // Clear undo history so user can't undo back to empty state
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
  }, [html, editor]);

  return null;
}
```

## Customizing HTML Output (exportDOM)

The default HTML output may not be email-client-friendly. You can customize how each node serializes to HTML:

```typescript
import { ParagraphNode, LexicalEditor, DOMExportOutput } from 'lexical';

class EmailParagraphNode extends ParagraphNode {
  static getType() {
    return 'email-paragraph';
  }

  static clone(node: EmailParagraphNode) {
    return new EmailParagraphNode(node.__key);
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

## Editor-Level HTML Config (Alternative to Subclassing)

As of recent Lexical versions, you can configure import/export at the editor level without subclassing:

```typescript
import { ParagraphNode, $createParagraphNode } from 'lexical';

const editorConfig = {
  html: {
    export: new Map([
      [ParagraphNode, (editor, node) => {
        const element = document.createElement('p');
        element.style.margin = '0 0 10px 0';
        element.style.fontFamily = 'Arial, sans-serif';
        return { element };
      }],
    ]),
    import: {
      p: (node: HTMLElement) => ({
        conversion: (element: HTMLElement) => ({
          node: $createParagraphNode(),
        }),
        priority: 1,
      }),
    },
  },
};
```

## ExtendedTextNode Pattern (Preserving Styles)

The base `TextNode` intentionally strips rich CSS styles during HTML import/export. For an email editor that needs full styling fidelity, you need the `ExtendedTextNode` pattern:

```typescript
import {
  TextNode,
  SerializedTextNode,
  DOMConversionMap,
  $isTextNode
} from 'lexical';

export class ExtendedTextNode extends TextNode {
  static getType() {
    return 'extended-text';
  }

  static clone(node: ExtendedTextNode) {
    return new ExtendedTextNode(node.__text, node.__key);
  }

  static importDOM(): DOMConversionMap | null {
    const importers = TextNode.importDOM();
    return {
      ...importers,
      span: () => ({
        conversion: patchStyleConversion(importers?.span),
        priority: 1,
      }),
      strong: () => ({
        conversion: patchStyleConversion(importers?.strong),
        priority: 1,
      }),
      em: () => ({
        conversion: patchStyleConversion(importers?.em),
        priority: 1,
      }),
    };
  }

  static importJSON(serializedNode: SerializedTextNode): TextNode {
    return new ExtendedTextNode(serializedNode.text).updateFromJSON(serializedNode);
  }

  isSimpleText() {
    return this.__type === 'extended-text' && this.__mode === 0;
  }
}

// Patches the conversion to preserve CSS properties
function patchStyleConversion(originalDOMConverter: any) {
  return (node: HTMLElement) => {
    const original = originalDOMConverter?.(node);
    if (!original) return null;
    const originalOutput = original.conversion(node);
    if (!originalOutput) return originalOutput;

    const { backgroundColor, color, fontFamily, fontWeight, fontSize, textDecoration } = node.style;

    return {
      ...originalOutput,
      forChild: (lexicalNode: any, parent: any) => {
        const originalForChild = originalOutput?.forChild ?? ((x: any) => x);
        const result = originalForChild(lexicalNode, parent);
        if ($isTextNode(result)) {
          const style = [
            backgroundColor ? `background-color: ${backgroundColor}` : null,
            color ? `color: ${color}` : null,
            fontFamily ? `font-family: ${fontFamily}` : null,
            fontWeight ? `font-weight: ${fontWeight}` : null,
            fontSize ? `font-size: ${fontSize}` : null,
            textDecoration ? `text-decoration: ${textDecoration}` : null,
          ].filter(Boolean).join('; ');
          if (style.length) return result.setStyle(style);
        }
        return result;
      },
    };
  };
}

// Helper to create ExtendedTextNode
export function $createExtendedTextNode(text: string = ''): ExtendedTextNode {
  return new ExtendedTextNode(text);
}
```

### Register ExtendedTextNode with Node Replacement

```typescript
import { TextNode } from 'lexical';
import { ExtendedTextNode } from './ExtendedTextNode';

const config = {
  nodes: [
    ExtendedTextNode,
    {
      replace: TextNode,
      with: (node: TextNode) => new ExtendedTextNode(node.__text),
      withKlass: ExtendedTextNode
    },
  ],
};
```

## Headless Mode (Server-Side HTML Generation)

For generating HTML outside the browser (e.g., in a Convex action/function):

```typescript
import { createHeadlessEditor } from '@lexical/headless';
import { $generateHtmlFromNodes } from '@lexical/html';
import { JSDOM } from 'jsdom';

// Setup global DOM for headless environment
const dom = new JSDOM();
global.window = dom.window as any;
global.document = dom.window.document;

const editor = createHeadlessEditor({
  nodes: [/* your custom nodes */],
});

const savedState = '{"root":{"children":[...]}}';
const editorState = editor.parseEditorState(savedState);
editor.setEditorState(editorState);

editor.read(() => {
  const html = $generateHtmlFromNodes(editor, null);
  // Use `html` for email sending
});
```

## Complete Email HTML Generation Example

```typescript
import { $generateHtmlFromNodes } from '@lexical/html';
import { $getRoot } from 'lexical';

function generateEmailContent(editor: LexicalEditor): { html: string; plainText: string } {
  let html = '';
  let plainText = '';

  editor.read(() => {
    html = $generateHtmlFromNodes(editor, null);
    plainText = $getRoot().getTextContent();
  });

  // Wrap in email-safe HTML structure
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
