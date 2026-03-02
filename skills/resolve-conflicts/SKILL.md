---
name: resolve-conflicts
description: Resolves merge conflicts across a Graphite stack during restacks. Use when gt restack reports conflicts, when a stacked PR branch cannot continue due to merge markers, or when users mention /resolve-conflicts.
---

# Resolve Conflicts

## Quick start

Use this sequence for each conflicted branch in the stack:

1. Run `gt restack`.
2. Fix merge conflicts in files.
3. Run `gt add -A && gt continue`.
4. Repeat until Graphite reports no remaining conflicts.

## Workflows

### Resolve one conflicted branch

1. Start restack:
   - `gt restack`
2. Identify conflicts:
   - Check conflicted files in Git status.
   - Open files and remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Validate code compiles/tests if relevant to touched files.
4. Stage and continue:
   - `gt add -A && gt continue`

Checklist:
- [ ] Conflict markers removed
- [ ] Intended logic preserved
- [ ] Files staged
- [ ] Continue command succeeds

### Resolve an entire stacked branch chain

1. Run `gt restack` once.
2. If conflicts appear, resolve the current branch.
3. Run `gt add -A && gt continue`.
4. Repeat resolve + continue for each subsequent conflicted branch.
5. Finish only when stack is conflict free.

Checklist:
- [ ] Every conflicted branch was resumed with `gt continue`
- [ ] `gt restack` finishes without new conflicts
- [ ] Final Git status is clean (or only expected local changes)

## Advanced features

- Prefer minimal conflict edits that preserve branch intent.
- If the same conflict pattern appears repeatedly, apply the same semantic resolution across branches.
- If restack stops unexpectedly, rerun `gt restack` and continue the same loop.
