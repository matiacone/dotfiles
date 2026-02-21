# Lexical Theming

Lexical uses a CSS class mapping system. You define a theme object that maps node types to CSS class names.

## Theme Configuration

```typescript
const emailTheme = {
  // Block elements
  paragraph: 'email-p',
  quote: 'email-blockquote',
  heading: {
    h1: 'email-h1',
    h2: 'email-h2',
    h3: 'email-h3',
    h4: 'email-h4',
    h5: 'email-h5',
    h6: 'email-h6',
  },

  // Lists
  list: {
    ol: 'email-ol',
    ul: 'email-ul',
    listitem: 'email-li',
    nested: {
      listitem: 'email-nested-li',
    },
    listitemChecked: 'email-li-checked',
    listitemUnchecked: 'email-li-unchecked',
  },

  // Links
  link: 'email-link',

  // Text formatting
  text: {
    bold: 'email-bold',
    italic: 'email-italic',
    underline: 'email-underline',
    strikethrough: 'email-strikethrough',
    code: 'email-inline-code',
    subscript: 'email-subscript',
    superscript: 'email-superscript',
    underlineStrikethrough: 'email-underline-strikethrough',
  },

  // Other elements
  image: 'email-image',
  hashtag: 'email-hashtag',
  code: 'email-code-block',

  // Table (if using @lexical/table)
  table: 'email-table',
  tableCell: 'email-table-cell',
  tableCellHeader: 'email-table-cell-header',
  tableRow: 'email-table-row',
};
```

## Using the Theme

Pass the theme as part of your `initialConfig`:

```tsx
const initialConfig = {
  namespace: 'EmailEditor',
  theme: emailTheme,
  onError: console.error,
  nodes: [/* ... */],
};

<LexicalComposer initialConfig={initialConfig}>
  {/* plugins */}
</LexicalComposer>
```

## CSS Styles

The theme classes are applied to the DOM elements created by each node's `createDOM()` method. You need to define the actual CSS:

```css
/* Block elements */
.email-p {
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.email-blockquote {
  margin: 10px 0;
  padding-left: 16px;
  border-left: 4px solid #ccc;
  color: #666;
}

.email-h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 20px 0 10px 0;
}

.email-h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 18px 0 8px 0;
}

.email-h3 {
  font-size: 16px;
  font-weight: bold;
  margin: 16px 0 6px 0;
}

/* Lists */
.email-ol {
  margin: 10px 0;
  padding-left: 24px;
  list-style-type: decimal;
}

.email-ul {
  margin: 10px 0;
  padding-left: 24px;
  list-style-type: disc;
}

.email-li {
  margin: 4px 0;
}

.email-nested-li {
  margin-left: 20px;
}

/* Links */
.email-link {
  color: #0066cc;
  text-decoration: underline;
  cursor: pointer;
}

.email-link:hover {
  color: #004499;
}

/* Text formatting */
.email-bold {
  font-weight: bold;
}

.email-italic {
  font-style: italic;
}

.email-underline {
  text-decoration: underline;
}

.email-strikethrough {
  text-decoration: line-through;
}

.email-underline-strikethrough {
  text-decoration: underline line-through;
}

.email-inline-code {
  font-family: 'Monaco', 'Menlo', monospace;
  background: #f4f4f4;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}

.email-subscript {
  vertical-align: sub;
  font-size: smaller;
}

.email-superscript {
  vertical-align: super;
  font-size: smaller;
}
```

## Tailwind CSS Integration

With Tailwind CSS 4, you can use `@apply` or define classes in your `global.css`:

```css
/* In global.css */
.email-p {
  @apply mb-2.5 leading-relaxed;
}

.email-blockquote {
  @apply my-2.5 pl-4 border-l-4 border-gray-300 text-gray-600;
}

.email-bold {
  @apply font-bold;
}

.email-italic {
  @apply italic;
}

.email-underline {
  @apply underline;
}

.email-link {
  @apply text-blue-600 underline hover:text-blue-800;
}

.email-ol {
  @apply my-2.5 pl-6 list-decimal;
}

.email-ul {
  @apply my-2.5 pl-6 list-disc;
}

.email-li {
  @apply my-1;
}
```

## Theme-Aware Custom Nodes

If you create custom nodes, make sure they read from the theme in `createDOM()`:

```typescript
import { ElementNode, EditorConfig } from 'lexical';

export class EmailSignatureNode extends ElementNode {
  static getType(): string {
    return 'email-signature';
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement('div');
    // Apply theme class if available
    const theme = config.theme;
    const className = theme?.emailSignature;
    if (className) {
      div.className = className;
    } else {
      // Fallback styles
      div.style.borderTop = '1px solid #ccc';
      div.style.marginTop = '16px';
      div.style.paddingTop = '8px';
    }
    return div;
  }
}
```

Then add it to your theme:

```typescript
const emailTheme = {
  // ... other theme properties
  emailSignature: 'email-signature-block',
};
```

## Important Notes

1. **Theme classes are only applied in the editor DOM** — they don't automatically appear in HTML export. You need to override `exportDOM()` for email-safe output.

2. **Theme classes require nodes to read them** — if a custom node's `createDOM()` doesn't read from the theme config, your theme classes won't apply.

3. **The Lexical Playground is not a library** — the toolbar, floating menus, etc. in the playground are not exported as packages. They're examples to copy and adapt.

4. **Combine with inline styles for email** — for email output, you'll want to use inline styles instead of classes. See the serialization reference for `exportDOM()` patterns.
