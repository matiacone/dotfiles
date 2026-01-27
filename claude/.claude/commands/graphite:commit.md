---
description: Add a new commit to current branch (instead of amending)
---

Add staged changes as a NEW commit on the current branch (instead of amending the existing commit), then submit.

1. Run `git status` and `git diff --staged` to see what's staged
2. Analyze the staged changes and generate a concise commit message (conventional commit format: type(scope): description)
3. Run `gt modify --commit -m "<message>"` to create a new commit
4. Run `gt submit --no-interactive --publish` to push and update PR
5. Show `gt log short` to confirm

Do NOT ask the user for a commit message - generate it automatically based on the staged diff.
