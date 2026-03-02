---
name: ralph-commit
description: Commit changes to the appropriate branch (for ralph workflows)
---

Commit your current changes using Graphite. You should already be on the correct base branch (via `/ralph-checkout`).

## Hard rules

- NEVER use `gt track` — if you need it, you created the branch wrong (with raw git)
- NEVER use raw `git commit`, `git checkout -b`, or `git branch` to create branches — always use `gt`
- Always make your code changes FIRST, then commit. Never create a branch with no changes.

## Step 1: Decide — new branch or existing?

Check your current branch: `git branch --show-current`

### A) You're already on the correct branch for this task

Your task's branch already exists and you're on it. Just add a new commit.

```bash
gt add -A && gt modify --commit -m "<message>"
```

### B) You need a NEW branch

You're on develop (or a parent branch) and need to create a branch for this task.

```bash
gt add -A && gt create --no-interactive <branch-name> -m "<message>"
```

## Step 2: Determine the branch name

- If `plan.md` exists in the feature directory, read the **Branch** field from it
- **Artifact/feature issues** (title prefixed "XYZ: "): Use ONE branch for the entire feature (e.g., `ralph/search`). All issues under the same artifact share this branch — use situation (A), not (B).
- **Standalone issues**: One branch per issue, kebab-case (e.g., `ralph/fix-login-bug`)

## Step 3: Generate commit message

Auto-generate a concise commit message in conventional commit format based on the diff. Do not ask the user.

## Step 4: Submit

```bash
gt submit --no-interactive --publish
```

## Step 5: Verify

Run `gt log short` and sanity-check:
- Independent work should show develop as parent
- Dependent/stacked work should show the branch it builds on as parent
- If you see a 5+ branch stack of unrelated changes, something went wrong — `/ralph-checkout` should have sent you back to develop
