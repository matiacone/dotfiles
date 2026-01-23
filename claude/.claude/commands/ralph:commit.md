---
description: Commit to an existing feature branch (for ralph workflows)
---

Commit changes to the feature branch specified in the plan. Use this when working on a feature with multiple tasks that should all go on ONE branch.

Arguments: $ARGUMENTS (should be: "<branch-name>" "<commit-message>")

1. Parse arguments: first arg is branch name, second is commit message
2. Check current branch: `git branch --show-current`
3. If NOT on the correct branch:
   - Check if branch exists: `git branch --list "<branch-name>"`
   - If it EXISTS: `gt checkout <branch-name>`
   - If it does NOT exist: `gt add -A && gt create <branch-name> -m "<commit-message>"` then `gt submit --no-interactive --publish`
4. If already on the correct branch:
   - `gt add -A && gt modify --commit -m "<commit-message>"`
5. Submit: `gt submit --no-interactive --publish`
6. Show `gt log short` to confirm
