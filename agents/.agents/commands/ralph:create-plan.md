---
allowed-tools: Read, Write, Bash(mkdir:*), Bash(gt add:*), Bash(gt modify:*), Bash(gt submit:*)
description: Convert the current plan discussion into a Ralph feature plan
---

Convert the current conversation into a Ralph feature plan.

## Instructions

1. **Analyze the conversation** - Review our discussion to determine:
   - The feature name (derive from the topic we discussed)
   - The tasks needed to implement it
   - Any requirements or constraints mentioned

2. **Create the feature directory**: `.ralph/features/<feature-name>/`

3. **Create plan.md** - Synthesize our discussion into a plan document at `.ralph/features/<feature-name>/plan.md`. Add a `Branch: feature/<feature-name>` line near the top.

4. **Write tasks.json** - Break the feature into executable tasks:
   ```json
   {
     "tasks": [
       {
         "title": "Task title",
         "description": "WHY this needs to be done (not HOW)",
         "acceptance": ["Clear criterion to verify completion"],
         "passes": false
       }
     ]
   }
   ```

5. **Task guidelines**:
   - Break the feature into tasks as needed (not too granular, not too broad)
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

6. **Verification requirements**:
   - **UI changes**: Use the /chrome slash command to confirm UI changes work as expected. Navigate to the relevant pages and verify the changes are visible and functional.
   - **Backend changes / non-trivial routes**: For backend changes or routes more complicated than basic CRUD, you must verify with one of these approaches:
     1. Create 1-2 unit tests that confirm the changes work correctly, OR
     2. Create a test query/mutation in `test.ts` on the live DB with logging and run it via `npx convex run test:<functionName>` to confirm changes work

7. **Create empty progress.txt** in the same directory

8. **Commit the changes** - After creating the plan, check which branch you're on:
   - **If on a Graphite branch** (not `develop` or `main`): Use `/graphite:modify` to amend the current branch, then `/graphite:submit` to push
   - **If on `develop`**: Use `/graphite:commit` to commit directly to develop (it will auto-push)
