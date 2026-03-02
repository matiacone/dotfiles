---
name: ralph-checkout
description: Prepare the correct branch before starting work on a ralph task. Use after picking a GitHub issue but before implementing it. Decides whether to stay on the current branch or checkout develop based on code dependencies.
---

You just picked a task. Before writing any code, get on the right branch.

## Hard rules

- NEVER use raw `git checkout -b` or `git branch` — always use `gt`
- Do NOT create the new branch yet — that happens at commit time via `/ralph-commit`
- This skill only decides **where you start from**, not the branch name

## Step 1: Gather context

```bash
git branch --show-current
```

Then check: does the task you're about to start depend on code from your current branch?

## Step 2: Pick one

### A) Stay on current branch

Your current branch has code the new task needs. Examples:
- You just added a schema and now need the API that uses it
- You just created a shared hook and now need the UI that imports it
- The new task literally imports or calls functions from your current branch
- You're working on an artifact feature and already on its branch (e.g., `ralph/search`)

**Do nothing.** You're already in the right place.

### B) Go back to develop

The new task is independent of your current branch. Examples:
- Different area of the codebase entirely
- No imports, calls, or build-on from current branch changes
- Unrelated bug fix or feature

```bash
gt checkout develop && gt sync
```

## Step 3: Confirm

State which option you picked and why in one sentence, then proceed to implementation.
