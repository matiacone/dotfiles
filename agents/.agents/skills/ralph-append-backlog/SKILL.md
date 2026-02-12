---
name: ralph-append-backlog
description: Append tasks to the Ralph backlog
allowed-tools: Read Edit Bash(gt add:*) Bash(gt modify:*) Bash(gt submit:*)
---

Append tasks to the Ralph backlog at `.ralph/backlog.json` based on our conversation.

## Instructions

1. **Read** the current `.ralph/backlog.json` file first

2. **Analyze the conversation history** - Review our discussion to identify:
   - Tasks the user mentioned wanting to do
   - Work items discovered during our conversation
   - Follow-up tasks or improvements discussed
   - Bug fixes or features that came up
   - Any TODOs or "we should also" items mentioned

3. **For each task**, create a task object:
   ```json
   {
     "title": "Brief task title",
     "description": "Why this needs to be done with enough context to start",
     "acceptance": ["Clear, testable criterion"],
     "branch": "ralph/<descriptive-name>",
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
- **Branch naming**: Use `ralph/descriptive-branch-name` format
- **Branch grouping**: Group related tasks onto the same branch (e.g., all email sending tasks on `ralph/email-sending`, all webhook tasks on `ralph/webhook-handlers`)
- Tasks on the same branch will be committed sequentially with `gt modify -c`; different branches will be created with `gt create`

**CRITICAL: Atomic Changes**
- If a task changes a shared API (function signature, query args, etc.), it MUST include updating all callers in the same task
- Never split "change the API" and "update callers" into separate tasks - this breaks the build between tasks
- Example: "Refactor getCompaniesPaginated args" should include both backend changes AND frontend caller updates

**CRITICAL: Full-Stack Type Checking**
- Every task must leave the codebase in a state where `bun run check-types` passes at the ROOT level (not just in one package)
- When planning tasks, consider: "After this task is done, will the entire monorepo still compile?"
- If a task would break type checking until a subsequent task is done, merge those tasks

## Verification Requirements

**IMPORTANT:** After implementing changes, you MUST verify they work:

- **UI changes**: Use the /chrome slash command to confirm UI changes work as expected. Navigate to the relevant pages and verify the changes are visible and functional.
- **Backend changes / non-trivial routes**: For backend changes or routes more complicated than basic CRUD, you must verify with one of these approaches:
  1. Create 1-2 unit tests that confirm the changes work correctly, OR
  2. Create a test query/mutation in `test.ts` on the live DB with logging and run it via `npx convex run test:<functionName>` to confirm changes work

**IMPORTANT:** Always APPEND the new tasks to the existing `.ralph/backlog.json` file. Read the file first, then add your new tasks to the existing tasks array. Never overwrite the entire file.

6. **Commit the changes** - After updating the backlog, stage, commit, and submit:
   ```bash
   gt add .ralph/backlog.json && gt modify && gt submit --no-interactive
   ```
