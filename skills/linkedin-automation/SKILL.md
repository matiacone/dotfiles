---
name: linkedin-automation
description: >
  LinkedIn automation suite: send connection requests from HubSpot tasks, check mutual connections
  and post to Slack, or set up Slack MCP integration. Use when the user mentions LinkedIn outreach,
  connection requests, mutual connections, network check, or setting up Slack for LinkedIn workflows.
  Triggers on: "LinkedIn outreach", "send connection requests", "network check", "mutual connections",
  "check my network", "setup slack", or any LinkedIn automation task.
---

# LinkedIn Automation

Three workflows in one skill. Route based on what the user asks for:

| Subcommand | What it does |
|---|---|
| `outreach` | Send LinkedIn connection requests driven by HubSpot tasks |
| `network-check` | Scrape mutual 1st/2nd degree connections, post to Slack |
| `setup-slack` | Walk user through Slack MCP server setup |

## Routing

- If the user says "outreach", "send connection requests", "connect on LinkedIn", or "run LinkedIn outreach" → see [outreach.md](outreach.md)
- If the user says "network check", "mutual connections", "shared connections", or provides a LinkedIn URL + Slack channel → see [network-check.md](network-check.md)
- If the user says "setup slack", "connect to slack", or Slack MCP is missing when needed → see [setup-slack.md](setup-slack.md)
- If no subcommand is clear, ask the user which workflow they want.

## Shared: Browser Automation on LinkedIn

All browser workflows use whatever browser automation tool is available (agent-browser, Playwright MCP, Puppeteer MCP, etc.) connected to the user's active Chrome session. The user must already be logged into LinkedIn.

**LinkedIn DOM tips** (apply to both outreach and network-check):

- LinkedIn's DOM is heavily layered. Coordinate-based clicking is unreliable — prefer JavaScript evaluation or accessibility-tree refs over visual coordinates.
- To find buttons: query `document.querySelectorAll('button')` and match by `innerText`, or use snapshot refs.
- Hidden actions (Connect, Message) are often under the "More actions" / "More" dropdown — check there if the primary button isn't visible.
- Always wait 2-4 seconds between major actions. LinkedIn monitors for automation.
- If you hit a CAPTCHA, login wall, or rate limit warning — stop immediately and alert the user.

## Memory

**Before running any workflow**, check your memory for past learnings about LinkedIn automation — browser quirks, selector changes, HubSpot field names, things that broke last time, etc. Past runs may have saved gotchas that prevent you from repeating mistakes.

**After completing any workflow**, save any new learnings, gotchas, or surprises to memory. Examples of things worth saving:

- LinkedIn UI changes (new button labels, moved elements, changed selectors)
- Browser automation techniques that worked or failed
- HubSpot property names or filter quirks discovered during the run
- Timing issues (waits that were too short, rate limits hit)
- Workarounds you had to improvise

Save these as `feedback` type memories so future runs benefit from them.

## Shared: Slack Posting

Both `outreach` (summary) and `network-check` (connection list) can post to Slack via `mcp__slack__slack_post_message`. If Slack MCP is not configured, fall back to terminal output and suggest the user run the `setup-slack` workflow.

Format Slack messages with:
- LinkedIn URLs as `<url|display text>` links
- Bold section headers with `*text*`
- Keep messages under ~4000 chars; split into multiple if needed
