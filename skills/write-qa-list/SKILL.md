---
name: write-qa-list
description: Generate a QA checklist by diffing the current branch against develop. Produces concrete, end-to-end manual testing steps that verify implemented functionality. Use when user wants a QA list, test plan, manual testing checklist, or asks to review changes for QA.
---

# Write QA List

Generate a human-friendly QA checklist from the current branch's changes vs develop.

## Process

1. **Collect the diff**
   - Run `git diff develop...HEAD --stat` for an overview of changed files
   - Run `git log develop..HEAD --oneline` for commit messages
   - Read the changed files to understand what was implemented

2. **Analyze the changes**
   - Identify each user-facing feature, fix, or behavior change
   - Include refactors — they can introduce regressions even without new features
   - Group related changes into logical features

3. **Write the checklist**
   - For each feature/fix, write 1-3 concrete QA steps
   - Each step must be an actionable task a human can perform in the app
   - Include the expected outcome for each step
   - Order from most critical to least critical

## Checklist Format

Write the checklist as a markdown file at `.claude/qa-checklist.md`:

```md
# QA Checklist — [branch name]

## Summary
[1-2 sentences on what this branch does]

## Prerequisites
- [ ] Backend running (`cd packages/backend && bun run dev`)
- [ ] Frontend running (`cd apps/deal-deploy && bun run dev`)
- [Any other setup needed, e.g. test data, env vars]

## Tests

### [Feature/Fix Name]
- [ ] **Step description** — Expected: [what should happen]
- [ ] **Step description** — Expected: [what should happen]

### [Feature/Fix Name 2]
- [ ] **Step description** — Expected: [what should happen]

## Regression Checks
- [ ] [Anything adjacent that could have broken]
```

## Rules

- **No vague steps.** Bad: "Verify email works." Good: "Send an email from the compose screen to a test address — Expected: email arrives within 30 seconds with correct subject and body."
- **Focus on what changed.** Don't test the entire app, only what this branch touches.
- **Include edge cases** if the diff reveals them (error states, empty states, boundary conditions).
- **Add regression checks** for areas adjacent to the changes that could plausibly break.
- **Refactors need QA too.** If code was moved or restructured, add steps that verify the existing behavior still works as expected.
