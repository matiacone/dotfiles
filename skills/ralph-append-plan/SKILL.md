---
name: ralph-append-plan
description: Create child GitHub issues on a PRD (feature plan) issue
allowed-tools: Bash(gh issue create:*) Bash(gh issue view:*) Bash(gh issue list:*)
---

Create child GitHub issues for a PRD (Product Requirements Document) issue based on our conversation.

## Instructions

1. **Identify the PRD** - Get the PRD issue number from the conversation or by searching:
   ```bash
   gh issue list --state open --search "Artifact:" --json number,title
   ```

2. **Read the PRD** - Use `gh issue view <number>` to understand the full feature plan

3. **Analyze the conversation history** - Review our discussion to identify:
   - New tasks that need to be added as child issues
   - Additional work discovered during implementation
   - Follow-up items or improvements discussed
   - Any TODOs or "we should also" items mentioned

4. **For each new task**, create a GitHub issue:
   ```bash
   gh issue create --title "<PRD Prefix>: <Task title>" --body "$(cat <<'EOF'
   <Description: WHY this needs to be done with enough context to start>

   ## Acceptance Criteria
   - [ ] Clear, testable criterion

   ## Parent PRD
   #<prd-number>

   ## Blocked by
   <list any issue numbers that must be completed first, or "None">
   EOF
   )"
   ```

5. **Confirm** what was created by listing the new issue numbers and titles

## Task Guidelines

- Each issue should be independently testable and valuable
- Title should be prefixed with the PRD's prefix (e.g., "Search: Create search API")
- Description should explain WHY, not prescribe HOW
- Acceptance criteria should be clear enough to verify completion
- Think kanban tickets: just enough context to start, clear done criteria

**CRITICAL: Atomic Changes**
- If a task changes a shared API (function signature, query args, etc.), it MUST include updating all callers in the same issue
- Never split "change the API" and "update callers" into separate issues - this breaks the build between tasks

**CRITICAL: Full-Stack Type Checking**
- Every issue must leave the codebase in a state where `bun run check-types` passes at the ROOT level
- If a task would break type checking until a subsequent task is done, merge those tasks into one issue
