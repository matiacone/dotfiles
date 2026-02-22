---
name: ralph-append-backlog
description: Append to Ralph Backlog
allowed-tools: Bash(gh issue create:*) Bash(gh issue list:*)
---

Create standalone GitHub issues based on user instructions. If the user provides specific issues to create, follow their instructions exactly. If no specific issues are provided, analyze the conversation to determine what issues to create.

## Instructions

1. **Determine issues to create**:
   - If the user specifies what issues to create, use their instructions directly
   - If no instructions are provided, review the conversation to identify tasks, follow-up work, bugs, features, or TODOs that came up

2. **For each task**, create a GitHub issue:
   ```bash
   gh issue create --title "<Task title>" --body "$(cat <<'EOF'
   <Description: WHY this needs to be done with enough context to start>

   ## Acceptance Criteria
   - [ ] Clear, testable criterion

   ## Blocked by
   <list any issue numbers that must be completed first, or "None">
   EOF
   )"
   ```

3. **Confirm** what was created by listing the new issue numbers and titles

## Task Guidelines

- Each issue should be independently testable and valuable
- Description should explain WHY, not prescribe HOW
- Acceptance criteria should be clear enough to verify completion
- Think kanban tickets: just enough context to start, clear done criteria

**CRITICAL: Atomic Changes**
- If a task changes a shared API (function signature, query args, etc.), it MUST include updating all callers in the same issue
- Never split "change the API" and "update callers" into separate issues - this breaks the build between tasks

**CRITICAL: Full-Stack Type Checking**
- Every issue must leave the codebase in a state where `bun run check-types` passes at the ROOT level
- If a task would break type checking until a subsequent task is done, merge those tasks into one issue
