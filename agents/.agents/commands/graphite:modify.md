---
description: Amend staged changes to current branch (keeps message)
---

Amend currently staged changes to the current commit and submit.

1. Run `git status` to see what's staged
2. Run `gt modify` to amend staged changes to current commit (keeps existing message)
3. Run `gt submit --no-interactive --publish` to push and update PR
4. Show `gt log short` to confirm
