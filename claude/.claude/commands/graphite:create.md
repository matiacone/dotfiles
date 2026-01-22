---
description: Create a new Graphite branch with changes and submit PR
---

Create a new Graphite branch with all current changes and submit PR.

1. Run `git status` to see current changes
2. Ask the user for a commit message (or use the argument if provided: $ARGUMENTS)
3. Run `gt add -A && gt create -m "<message>"` to create the branch
4. Run `gt submit --no-interactive --publish` to push and create PR
5. Show `gt log short` to confirm
