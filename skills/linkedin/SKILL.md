---
name: linkedin
description: >
  LinkedIn automation: send connection requests from HubSpot tasks or check mutual connections
  and post to Slack. Use when the user mentions LinkedIn outreach, connection requests, mutual
  connections, or network check. Triggers on: "LinkedIn outreach", "send connection requests",
  "network check", "mutual connections", "check my network", or any LinkedIn automation task.
---

# LinkedIn Automation

This skill completes LinkedIn tasks. Route to the correct workflow based on what the user asks for:

- **Outreach** — "send connection requests", "LinkedIn outreach", "connect on LinkedIn" → follow [outreach.md](outreach.md)
- **Network check** — "mutual connections", "network check", "shared connections", LinkedIn URL + Slack channel → follow [network-check.md](network-check.md)

If unclear which workflow the user wants, ask.

## Memory

**Before running any workflow**, check your memory for past learnings about LinkedIn automation — browser quirks, selector changes, HubSpot field names, things that broke last time, etc. Past runs may have saved gotchas that prevent you from repeating mistakes.

**After completing any workflow**, save any new learnings, gotchas, or surprises to memory. Examples of things worth saving:

- LinkedIn UI changes (new button labels, moved elements, changed selectors)
- Browser automation techniques that worked or failed
- HubSpot property names or filter quirks discovered during the run
- Timing issues (waits that were too short, rate limits hit)
- Workarounds you had to improvise

Save these as `feedback` type memories so future runs benefit from them.

## Slack Posting

Both outreach (summary) and network-check (connection list) can post to Slack via `mcp__slack__slack_post_message`. If Slack MCP is not configured, fall back to terminal output and suggest the user run `/setup-slack-mcp`.

Format Slack messages with:
- LinkedIn URLs as `<url|display text>` links
- Bold section headers with `*text*`
- Keep messages under ~4000 chars; split into multiple if needed
