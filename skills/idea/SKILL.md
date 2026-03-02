---
name: idea
description: Save an idea as a GitHub issue labeled "idea" in the current repo. Use when user wants to jot down, save, log, or file an idea as a GitHub issue.
---

# Idea

Capture the user's idea and file it as a GitHub issue with the `idea` label.

## Workflow

1. **Get the idea** — the user provides their idea as the skill argument or in conversation.

2. **Clarify (one question max)** — if the idea is ambiguous or too vague to write a useful issue title, ask ONE short follow-up question. Skip this if the idea is already clear enough.

3. **Detect the repo** — run `gh repo view --json nameWithOwner -q .nameWithOwner` from the current working directory.

4. **Ensure label exists** — run `gh label create idea --description "Ideas" --color "C5DEF5" 2>/dev/null || true` to create the label if it doesn't exist.

5. **Create the issue** — use `gh issue create` with:
   - **Title**: a concise summary of the idea (under 80 chars)
   - **Body**: the user's idea written up in 1-3 sentences. Keep it casual and brief — this is a scratchpad, not a spec.
   - **Label**: `idea`

6. **Confirm** — show the user the issue URL.
