---
name: yolo
description: Commit all changes, push to remote, and deploy in one shot with no confirmations. Use when user says "yolo", wants to ship fast, or asks to commit+push+deploy in one go.
---

# YOLO

Full send: commit, push, deploy. No stopping.

## Steps

1. **Stage everything**: `git add -A`
2. **Commit**: Write a concise commit message based on the diff. Do NOT ask the user for a message — just write one.
3. **Push**: `git push` to the current branch's remote. If no upstream, use `git push -u origin HEAD`.
4. **Deploy**: Run `bun run deploy` from the repo root. This does a patch bump by default.
   - If the user says "minor" or "major", run `bun run deploy:minor` or `bun run deploy:major` instead.

## Rules

- Do NOT ask for confirmation at any step. Just do it.
- Do NOT pause between steps. Run them back to back.
- If any step fails, stop and report the error.
- Always include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>` in the commit message.
