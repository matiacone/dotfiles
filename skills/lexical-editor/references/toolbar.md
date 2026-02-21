# Building the Lexical Toolbar Plugin

Lexical does NOT ship a toolbar — you build your own. This is by design. Here's a production-grade approach.

## Basic Toolbar Plugin

```tsx
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
  TextFormatType,
  ElementFormatType,
} from 'lexical';
import { useState, useEffect, useCallback } from 'react';

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
    }
  }, []);

  // Track selection changes to update toolbar state
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW,
    );
  }, [editor, updateToolbar]);

  // Also update on general state changes
  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const formatElement = (format: ElementFormatType) => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, format);
  };

  return (
    <div className="toolbar">
      <button onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}>
        Undo
      </button>
      <button onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}>
        Redo
      </button>
      <div className="divider" />
      <button
        className={isBold ? 'active' : ''}
        onClick={() => formatText('bold')}
        aria-pressed={isBold}
      >
        <strong>B</strong>
      </button>
      <button
        className={isItalic ? 'active' : ''}
        onClick={() => formatText('italic')}
        aria-pressed={isItalic}
      >
        <em>I</em>
      </button>
      <button
        className={isUnderline ? 'active' : ''}
        onClick={() => formatText('underline')}
        aria-pressed={isUnderline}
      >
        <u>U</u>
      </button>
      <button
        className={isStrikethrough ? 'active' : ''}
        onClick={() => formatText('strikethrough')}
        aria-pressed={isStrikethrough}
      >
        <s>S</s>
      </button>
      <div className="divider" />
      <button onClick={() => formatElement('left')}>
        Align Left
      </button>
      <button onClick={() => formatElement('center')}>
        Align Center
      </button>
      <button onClick={() => formatElement('right')}>
        Align Right
      </button>
    </div>
  );
}
```

## Extended Toolbar with Lists and Links

```tsx
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { $isHeadingNode } from '@lexical/rich-text';
import { $getNearestNodeOfType } from '@lexical/utils';
import { $isAtNodeEnd } from '@lexical/selection';

function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  }
  return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
}

export function ExtendedToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [blockType, setBlockType] = useState<string>('paragraph');

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Text formatting
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Link detection
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      setIsLink($isLinkNode(parent) || $isLinkNode(node));

      // Block type detection
      const anchorNode = selection.anchor.getNode();
      const element = anchorNode.getKey() === 'root'
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();

      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        setBlockType(parentList ? parentList.getListType() : element.getListType());
      } else if ($isHeadingNode(element)) {
        setBlockType(element.getTag());
      } else {
        setBlockType(element.getType());
      }
    }
  }, []);

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        updateToolbar();
      });
    });
  }, [editor, updateToolbar]);

  const insertLink = useCallback(() => {
    if (!isLink) {
      const url = prompt('Enter URL:');
      if (url) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
      }
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="toolbar">
      {/* Text formatting */}
      <button
        className={isBold ? 'active' : ''}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
      >
        Bold
      </button>
      <button
        className={isItalic ? 'active' : ''}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        Italic
      </button>
      <button
        className={isUnderline ? 'active' : ''}
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        Underline
      </button>

      <div className="divider" />

      {/* Lists */}
      <button
        className={blockType === 'bullet' ? 'active' : ''}
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        Bullet List
      </button>
      <button
        className={blockType === 'number' ? 'active' : ''}
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        Numbered List
      </button>

      <div className="divider" />

      {/* Links */}
      <button
        className={isLink ? 'active' : ''}
        onClick={insertLink}
      >
        {isLink ? 'Remove Link' : 'Add Link'}
      </button>
    </div>
  );
}
```

## Toolbar CSS Example

```css
.toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  background: #fafafa;
}

.toolbar button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background 0.15s, border-color 0.15s;
}

.toolbar button:hover {
  background: #e8e8e8;
}

.toolbar button.active {
  background: #e0e0e0;
  border-color: #ccc;
}

.toolbar .divider {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 4px;
}
```

## Using with shadcn/ui Components

```tsx
import { Button } from '@deal-deploy/design-system/components/button';
import { Toggle } from '@deal-deploy/design-system/components/toggle';
import { Separator } from '@deal-deploy/design-system/components/separator';
import { Bold, Italic, Underline, List, ListOrdered, Link2 } from 'lucide-react';

export function ShadcnToolbar() {
  const [editor] = useLexicalComposerContext();
  // ... state management same as above

  return (
    <div className="flex items-center gap-1 p-2 border-b">
      <Toggle
        pressed={isBold}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
        size="sm"
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={isItalic}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
        size="sm"
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={isUnderline}
        onPressedChange={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
        size="sm"
        aria-label="Underline"
      >
        <Underline className="h-4 w-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <Toggle
        pressed={isLink}
        onPressedChange={insertLink}
        size="sm"
        aria-label="Link"
      >
        <Link2 className="h-4 w-4" />
      </Toggle>
    </div>
  );
}
```
