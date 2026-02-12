---
name: update-command
description: Update or create custom slash commands
---

Custom slash commands are stored in `~/dotfiles/claude/.claude/commands/` and symlinked to `~/.claude/commands/` via GNU Stow.

When the user asks to update or create a command:

1. Read the existing command file if updating: `~/dotfiles/claude/.claude/commands/<command-name>.md`
2. Make the requested changes or create a new file
3. Write to the dotfiles source location: `~/dotfiles/claude/.claude/commands/`

Command structure:
```markdown
---
description: Brief description shown in command list
---

Instructions for Claude to follow when the command is invoked.

Use $ARGUMENTS placeholder where user input should be inserted.
```

$ARGUMENTS
