---
name: resolve-conflicts
description: Resolves merge conflicts across a Graphite stack during restacks. Use when gt restack reports conflicts, when a stacked PR branch cannot continue due to merge markers, or when users mention /resolve-conflicts.
---

# Resolve Conflicts

## Quick start

Use this sequence for each conflicted branch in the stack:

1. Run `gt ls` to list Graphite branches and identify which stack needs restacking.
2. Run `gt co <stack-branch>` to check out a branch in that stack (do not stay on `develop`).
3. Run `gt restack`.
4. Fix merge conflicts in files.
5. Run `gt add -A && gt continue`.
6. Repeat until Graphite reports no remaining conflicts.

## Workflows

### Resolve one conflicted branch

1. Choose a target stack branch:
   - `gt ls`
   - `gt co <stack-branch>`
   - Note: Running `gt restack` on `develop` typically does nothing.
2. Start restack:
   - `gt restack`
3. Identify conflicts:
   - Check conflicted files in Git status.
   - Open files and remove conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
4. Validate code compiles/tests if relevant to touched files.
5. Stage and continue:
   - `gt add -A && gt continue`

Checklist:
- [ ] Conflict markers removed
- [ ] Intended logic preserved
- [ ] Files staged
- [ ] Continue command succeeds

### Resolve an entire stacked branch chain

1. Run `gt ls` to inspect Graphite branches and choose the stack to restack.
2. Run `gt co <stack-branch>` to check out any branch in the selected stack (not `develop`).
3. Run `gt restack` once.
4. If conflicts appear, resolve the current branch.
5. Run `gt add -A && gt continue`.
6. Repeat resolve + continue for each subsequent conflicted branch.
7. Finish only when stack is conflict free.

Checklist:
- [ ] Every conflicted branch was resumed with `gt continue`
- [ ] `gt restack` finishes without new conflicts
- [ ] Final Git status is clean (or only expected local changes)
- [ ] Relevant stack was identified from `gt ls`
- [ ] Restack was started from a stack branch via `gt co <stack-branch>` (not `develop`)

## Advanced features

- Prefer minimal conflict edits that preserve branch intent.
- If the same conflict pattern appears repeatedly, apply the same semantic resolution across branches.
- If restack stops unexpectedly, rerun `gt restack` and continue the same loop.
