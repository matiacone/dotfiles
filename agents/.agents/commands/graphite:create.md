---
description: Create a new Graphite branch with changes and submit PR
---

Create a new Graphite branch with all current changes and submit PR.

1. Run `git status` and `git diff` to see current changes
2. Analyze the changes and generate:
   - A concise commit message (conventional commit format: type(scope): description)
   - A kebab-case branch name derived from the commit message
3. Run `gt add -A && gt create -m "<message>"` to create the branch
4. Run `gt submit --no-interactive --publish` to push and create PR
5. Show `gt log short` to confirm

Do NOT ask the user for a commit message or branch name - generate them automatically based on the diff.
