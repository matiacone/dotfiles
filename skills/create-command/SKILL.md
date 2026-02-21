---
name: create-command
description: Create a new custom slash command
allowed-tools: Write Bash(mkdir:*)
---

Create a new custom slash command for: $ARGUMENTS

When creating the command:

1. **Use instruction format**: Write commands as direct instructions, not conversational messages
2. **Structure properly**:
   - YAML frontmatter with `description` field
   - Clear, imperative instructions in the body
   - Use `$ARGUMENTS` placeholder where user input should be inserted
3. **Ask for clarification** if needed:
   - Command name and scope (project vs personal)
   - Specific instructions the command should execute
   - Any special features needed (file references @, bash execution !, etc.)
4. **Create the file** in the appropriate directory:
   - Personal commands: `~/dotfiles/claude/.claude/commands/` (symlinked to ~/.claude/commands via GNU Stow)
   - Project commands: `.claude/commands/`
5. **Confirm** the command is ready to use with proper syntax
