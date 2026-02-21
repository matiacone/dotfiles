# Lexical Commands System

Commands are Lexical's event/communication system. Everything flows through commands.

## Built-in Commands (Most Relevant for Email)

```typescript
import {
  FORMAT_TEXT_COMMAND,      // 'bold', 'italic', 'underline', 'strikethrough', 'code', 'subscript', 'superscript'
  FORMAT_ELEMENT_COMMAND,   // 'left', 'center', 'right', 'justify'
  UNDO_COMMAND,
  REDO_COMMAND,
  INDENT_COMMAND,
  OUTDENT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  KEY_ENTER_COMMAND,
  PASTE_COMMAND,
  CLEAR_EDITOR_COMMAND,
} from 'lexical';
```

## Dispatching Commands

```typescript
// Bold the selected text
editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');

// Center-align the current block
editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');

// Undo
editor.dispatchCommand(UNDO_COMMAND, undefined);

// Redo
editor.dispatchCommand(REDO_COMMAND, undefined);

// Indent
editor.dispatchCommand(INDENT_COMMAND, undefined);

// Outdent
editor.dispatchCommand(OUTDENT_COMMAND, undefined);
```

## Listening for Commands

Commands propagate through handlers by priority (0-4, highest first). A handler can stop propagation by returning `true`.

```typescript
import { COMMAND_PRIORITY_LOW, COMMAND_PRIORITY_EDITOR } from 'lexical';

editor.registerCommand(
  KEY_ENTER_COMMAND,
  (event: KeyboardEvent | null) => {
    // Custom enter behavior for email (e.g., Shift+Enter = line break)
    if (event?.shiftKey) {
      // Insert line break instead of new paragraph
      return false; // Don't stop propagation
    }
    return false;
  },
  COMMAND_PRIORITY_LOW
);
```

## Command Priorities

| Priority | Constant | Use Case |
|----------|----------|----------|
| 0 | `COMMAND_PRIORITY_CRITICAL` | System-level, must run first |
| 1 | `COMMAND_PRIORITY_HIGH` | Important overrides |
| 2 | `COMMAND_PRIORITY_NORMAL` | Standard handlers |
| 3 | `COMMAND_PRIORITY_LOW` | Fallback handlers |
| 4 | `COMMAND_PRIORITY_EDITOR` | Editor default behavior |

## Creating Custom Commands

```typescript
import { createCommand, COMMAND_PRIORITY_EDITOR } from 'lexical';

// Define the command with a type for its payload
export const INSERT_SIGNATURE_COMMAND = createCommand<void>('INSERT_SIGNATURE');
export const INSERT_TEMPLATE_COMMAND = createCommand<{ templateId: string }>('INSERT_TEMPLATE');

// Register handler
editor.registerCommand(
  INSERT_SIGNATURE_COMMAND,
  () => {
    // Insert signature logic
    const signatureNode = $createEmailSignatureNode();
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      selection.insertNodes([signatureNode]);
    }
    return true; // Stop propagation
  },
  COMMAND_PRIORITY_EDITOR
);

// Dispatch
editor.dispatchCommand(INSERT_SIGNATURE_COMMAND, undefined);
editor.dispatchCommand(INSERT_TEMPLATE_COMMAND, { templateId: 'welcome' });
```

## Common Email Editor Commands

### Toggle Link

```typescript
import { $toggleLink } from '@lexical/link';
import { $getSelection, $isRangeSelection } from 'lexical';

function insertLink(url: string) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $toggleLink(url);
    }
  });
}

function removeLink() {
  editor.update(() => {
    $toggleLink(null);
  });
}
```

### Insert List

```typescript
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';

// Insert ordered list
editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);

// Insert unordered list
editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
```

### Clear Editor

```typescript
import { CLEAR_EDITOR_COMMAND } from 'lexical';

editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
```

## Intercepting Paste

```typescript
import { PASTE_COMMAND, COMMAND_PRIORITY_HIGH } from 'lexical';

editor.registerCommand(
  PASTE_COMMAND,
  (event: ClipboardEvent) => {
    // Custom paste handling for email
    const html = event.clipboardData?.getData('text/html');
    if (html) {
      // Sanitize HTML before inserting
      const sanitizedHtml = sanitizeEmailHtml(html);
      // ... insert sanitized content
      return true; // Prevent default paste
    }
    return false; // Allow default paste
  },
  COMMAND_PRIORITY_HIGH
);
```

## Keyboard Shortcuts

Lexical handles common shortcuts by default:
- `Ctrl/Cmd + B` → Bold
- `Ctrl/Cmd + I` → Italic
- `Ctrl/Cmd + U` → Underline
- `Ctrl/Cmd + Z` → Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` → Redo

To add custom shortcuts, listen for `KEY_DOWN_COMMAND`:

```typescript
import { KEY_DOWN_COMMAND, COMMAND_PRIORITY_HIGH } from 'lexical';

editor.registerCommand(
  KEY_DOWN_COMMAND,
  (event: KeyboardEvent) => {
    // Ctrl/Cmd + Shift + S for signature
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 's') {
      event.preventDefault();
      editor.dispatchCommand(INSERT_SIGNATURE_COMMAND, undefined);
      return true;
    }
    return false;
  },
  COMMAND_PRIORITY_HIGH
);
```
