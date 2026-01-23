---
description: Commit to the feature branch specified in plan.md (for ralph workflows)
---

Commit changes to the feature branch specified in the plan. All tasks for a feature go on ONE branch.

⚠️ CRITICAL RULES:
- NEVER use `gt track` - that means you created the branch with raw git, which breaks the stack
- NEVER checkout develop/main first - create the branch from your CURRENT position in the stack
- The branch parent must be whatever branch you're currently on, NOT develop

1. Read the **Branch** field from plan.md to get the target branch name
2. Generate a commit message based on the task you completed
3. Check current branch: `git branch --show-current`
4. If NOT on the target branch:
   - Check if branch exists: `git branch --list "<branch-name>"`
   - If it EXISTS: `gt checkout <branch-name>`, then `gt add -A && gt modify --commit -m "<message>"`
   - If it does NOT exist: `gt add -A && gt create <branch-name> -m "<message>"` (creates from current branch as parent)
5. If already on the target branch:
   - `gt add -A && gt modify --commit -m "<message>"`
6. Submit: `gt submit --no-interactive --publish`
7. Show `gt log short` to confirm the branch parent is correct (should NOT be develop unless you started on develop)
