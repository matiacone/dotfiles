---
description: Review conversation for lessons learned and update AGENTS.md
---

Review the full conversation history and determine whether any material lessons were learned. Look for:

- **Gotchas**: Unexpected behavior, tricky bugs, or non-obvious pitfalls encountered during the work
- **Best practices**: Patterns that worked well or coding approaches that should be repeated
- **User preferences**: Expressed preferences about code style, architecture, tooling, or workflow
- **Agent pointers**: Things a future agent should know to avoid repeating mistakes or wasting time

Only capture genuinely useful insights. Do NOT log routine work, obvious things, or pad with filler. If nothing material was learned, say so and stop.

For each lesson identified:

1. Determine which AGENTS.md it belongs in based on relevance:
   - Root `AGENTS.md` - cross-cutting concerns, general workflow, tooling
   - `apps/deal-deploy/AGENTS.md` - frontend-specific lessons (React, UI, components)
   - `packages/backend/AGENTS.md` - backend-specific lessons (Convex, APIs, data model)
   - Or the global dotfiles `AGENTS.md` at `~/dotfiles/agents/.agents/AGENTS.md` if it applies across all projects

2. Read the target AGENTS.md file first to avoid duplicating existing entries

3. Append the new lessons under a clear heading or existing section. Keep entries concise - one to three sentences max per lesson.

4. Present what you plan to add and where before writing, so the user can approve or adjust.
