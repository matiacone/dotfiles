---
name: ralph-commit
description: Commit changes to the appropriate branch (for ralph workflows)
---

Commit changes to the feature branch.

**CRITICAL RULES:**
- NEVER use `gt track` - that means you created the branch with raw git, which breaks the stack
- NEVER checkout develop/main first - create the branch from your CURRENT position in the stack
- The branch parent must be whatever branch you're currently on, NOT develop

1. Determine the target branch name:
   - If `plan.md` exists in the feature directory, read the **Branch** field from it
   - **Artifact/feature issues** (title prefixed "XYZ: "): Use ONE branch for the entire feature (e.g., `ralph/search`). All issues under the same artifact share this branch — modify, don't create.
   - **Standalone issues**: One branch per issue (e.g., `ralph/fix-login-bug`)
2. Generate a commit message based on the task you completed
3. Check current branch: `git branch --show-current`
4. If NOT on the target branch:
   - Check if branch exists: `git branch --list "<branch-name>"`
   - If it EXISTS: `gt checkout <branch-name>`, then `gt add -A && gt modify --commit -m "<message>"`
   - If it does NOT exist: `gt add -A && gt create --no-interactive <branch-name> -m "<message>"` (creates from current branch as parent)
5. If already on the target branch:
   - `gt add -A && gt modify --commit -m "<message>"`
6. Submit: `gt submit --no-interactive --publish`
7. Show `gt log short` to confirm the branch parent is correct (should NOT be develop unless you started on develop)
