---
allowed-tools: Read, Edit, Bash(gt add:*), Bash(gt modify:*), Bash(gt submit:*)
description: Append tasks to an existing Ralph feature plan
---

Append tasks to an existing Ralph feature plan based on our conversation.

## Instructions

1. **Identify the feature** - Look at the current branch or recent conversation to determine which feature plan to update. Check `.ralph/features/` for existing feature directories.

2. **Read** the current `.ralph/features/<feature-name>/tasks.json` file

3. **Analyze the conversation history** - Review our discussion to identify:
   - New tasks that need to be added
   - Additional work discovered during implementation
   - Follow-up items or improvements discussed
   - Any TODOs or "we should also" items mentioned

4. **For each new task**, create a task object:
   ```json
   {
     "title": "Task title",
     "description": "WHY this needs to be done (not HOW)",
     "acceptance": ["Clear criterion to verify completion"],
     "passes": false
   }
   ```

5. **APPEND** the new tasks to the existing `tasks` array - do NOT replace existing tasks

6. **Confirm** what was added by listing the new task titles

## Task Guidelines

- Each task should be independently testable and valuable
- Include validation/testing as a separate task if needed
- Description should explain WHY, not prescribe HOW (no line numbers, no exact code)
- Acceptance criteria should be clear enough to verify completion
- Think kanban tickets: just enough context to start, clear done criteria
- All tasks start with `"passes": false`

**CRITICAL: Atomic Changes**
- If a task changes a shared API (function signature, query args, etc.), it MUST include updating all callers in the same task
- Never split "change the API" and "update callers" into separate tasks - this breaks the build between tasks
- Example: "Refactor getCompaniesPaginated args" should include both backend changes AND frontend caller updates

**CRITICAL: Full-Stack Type Checking**
- Every task must leave the codebase in a state where `bun run check-types` passes at the ROOT level (not just in one package)
- When planning tasks, consider: "After this task is done, will the entire monorepo still compile?"
- If a task would break type checking until a subsequent task is done, merge those tasks

**IMPORTANT:** Always APPEND the new tasks to the existing `tasks.json` file. Read the file first, then add your new tasks to the existing tasks array. Never overwrite the entire file or remove existing tasks.

7. **Commit the changes** - After updating the plan, stage, commit, and submit:
   ```bash
   gt add .ralph/features/<feature-name>/tasks.json && gt modify && gt submit --no-interactive
   ```
