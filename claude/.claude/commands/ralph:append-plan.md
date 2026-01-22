---
allowed-tools: Read, Edit, Bash(gt add:*), Bash(gt modify:*), Bash(gt submit:*)
description: Append tasks to an existing Ralph feature plan
---

Append tasks to an existing Ralph feature plan based on our conversation.

Feature name: $ARGUMENTS

## Instructions

1. **Read** the current `.ralph/features/<feature-name>/tasks.json` file first

2. **Analyze the conversation** - Based on our discussion, identify:
   - New tasks that need to be added
   - Additional work discovered during implementation
   - Follow-up items or improvements discussed

3. **For each new task**, create a task object:
   ```json
   {
     "title": "Task title",
     "description": "WHY this needs to be done (not HOW)",
     "acceptance": ["Clear criterion to verify completion"],
     "passes": false
   }
   ```

4. **APPEND** the new tasks to the existing `tasks` array - do NOT replace existing tasks

5. **Confirm** what was added by listing the new task titles

## Task Guidelines

- Each task should be independently testable and valuable
- Include validation/testing as a separate task if needed
- Description should explain WHY, not prescribe HOW (no line numbers, no exact code)
- Acceptance criteria should be clear enough to verify completion
- Think kanban tickets: just enough context to start, clear done criteria
- All tasks start with `"passes": false`

**IMPORTANT:** Always APPEND the new tasks to the existing `tasks.json` file. Read the file first, then add your new tasks to the existing tasks array. Never overwrite the entire file or remove existing tasks.

6. **Commit the changes** - After updating the plan, stage, commit, and submit:
   ```bash
   gt add .ralph/features/<feature-name>/tasks.json && gt modify && gt submit --no-interactive
   ```
