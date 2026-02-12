---
name: tweak
description: Review and fix issues from annotations.txt
---

Review the annotations file at @annotations.txt which contains code review feedback and issues to address.

For each annotation:
1. Read the referenced file and line numbers
2. Understand the requested change from the comment
3. Make the necessary code changes to fix the issue
4. Verify the fix is complete

After all issues have been addressed:
1. Review the annotations for any lessons, patterns, or guidelines that should be captured as lasting knowledge (e.g. coding conventions, architectural decisions, gotchas, best practices)
2. If any annotations represent reusable lessons, update the most relevant AGENTS.md file:
   - Root `AGENTS.md` for project-wide conventions
   - `packages/backend/AGENTS.md` for backend-specific patterns
   - `apps/deal-deploy/AGENTS.md` for frontend-specific patterns
   - Only add genuinely new guidance — don't duplicate what's already there
3. Delete the original `annotations.txt` file
4. Stage the changed files with `git add <changed-files>`
5. Use /graphite-modify to amend staged changes to the current commit
6. Use /graphite-submit to push and update the PR

Work through each annotation systematically and confirm when complete.
