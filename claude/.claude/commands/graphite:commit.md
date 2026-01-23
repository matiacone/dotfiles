---
description: Add a new commit to current branch (instead of amending)
---

Add staged changes as a NEW commit on the current branch (instead of amending the existing commit), then submit.

1. Run `git status` to see what's staged
2. Run `git diff --staged` to analyze the changes
3. Generate a concise commit message based on what changed (use conventional commit style if appropriate)
4. Run `gt modify --commit -m "<generated-message>"` to create a new commit
5. Run `gt submit --no-interactive --publish` to push and update PR
6. Show `gt log short` to confirm
