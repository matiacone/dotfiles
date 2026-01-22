---
description: Add a new commit to current branch (instead of amending)
---

Add staged changes as a NEW commit on the current branch (instead of amending the existing commit).

1. Run `git status` to see what's staged
2. Ask the user for a commit message
3. Run `gt modify --commit -m "<message>"` to create a new commit
4. Show `gt log short` to confirm
