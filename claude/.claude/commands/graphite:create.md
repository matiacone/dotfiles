---
description: Create a new Graphite branch with changes and submit PR
---

Create a new Graphite branch with all current changes and submit PR.

1. Run `git status` to see current changes
2. Run `git diff` and `git diff --staged` to analyze all changes
3. Generate a concise commit message based on what changed (use conventional commit style if appropriate)
4. Run `gt add -A && gt create -m "<generated-message>"` to create the branch
5. Run `gt submit --no-interactive --publish` to push and create PR
6. Show `gt log short` to confirm
