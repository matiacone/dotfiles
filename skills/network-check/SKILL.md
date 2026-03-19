---
name: network-check
description: Check mutual LinkedIn connections (1st and 2nd degree) for a target person and post the results to a Slack channel. Use when user wants to see shared connections with someone on LinkedIn, check their network overlap, or review mutual connections before outreach.
---

# Network Check

Given a LinkedIn URL and target name, scrape all mutual 1st and 2nd degree connections, then post the list to Slack for review.

## Inputs

This skill expects three arguments (passed as skill args or provided by the user):

1. **LinkedIn URL** — the target person's profile URL (e.g. `https://www.linkedin.com/in/joshsokol`)
2. **Target name** — the person's name (e.g. "Josh Sokol")
3. **Slack channel** — channel name to post results (e.g. `#deal-flow`)

If any input is missing, ask the user before proceeding.

## Execution

### 1. Navigate to the Profile

Use whatever browser automation tool is available (e.g. `agent-browser`, Playwright MCP, Puppeteer MCP, etc.) to open the target's LinkedIn profile in a headed browser connected to the user's active Chrome session. The user must already be logged into LinkedIn.

If the page shows a login wall, stop and tell the user.

### 2. Open the Mutual Connections Page

After the profile loads, look for the mutual connections link — it typically reads something like "Sammy Abdullah, Mark Tornetta, and 11 other mutual connections". Click it. This opens a search results page filtered to the target with 1st-degree connections checked by default.

### 3. Enable 2nd-Degree Filter

On the search results page, find the 2nd-degree connection filter (a radio button or checkbox labeled "2nd"). Click it to include both 1st and 2nd degree connections in the results.

Wait 2 seconds for results to reload after toggling the filter.

### 4. Extract Connections

For each page of results, extract the following for every connection listed:

- **Name**
- **LinkedIn profile URL** (the `/in/` link)
- **Connection degree** (1st or 2nd — parsed from the "• 1st" or "• 2nd" text)
- **Title** (job title / headline)

**Preferred method: JavaScript evaluation.** Run JS in the browser context to pull structured data:

```javascript
JSON.stringify(
  Array.from(document.querySelectorAll('a[href*="/in/"]'))
    .map(a => ({ name: a.textContent.trim().split('•')[0].trim(), url: a.href.split('?')[0] }))
    .filter(a => a.url.includes('/in/') && !a.url.includes('/in/{target_slug}'))
    .reduce((acc, a) => { if (!acc.some(x => x.url === a.url)) acc.push(a); return acc; }, [])
)
```

**Fallback method: Parse the accessibility tree / snapshot.** Each result entry contains the name, degree, title, and location as text. Profile URLs can be extracted by reading link hrefs.

### 5. Paginate

Check for a "Next" button or page number buttons. If they exist, click "Next", wait 2 seconds, and repeat step 4.

Continue until there are no more pages.

### 6. Deduplicate and Format

Combine results from all pages. Deduplicate by LinkedIn URL. Sort by degree (1st first, then 2nd), then alphabetically by name.

### 7. Post to Slack

Use the Slack MCP (`mcp__slack__slack_post_message`) to post the results:

```
mcp__slack__slack_post_message(
  channel_id: "{slack_channel_id}",
  text: "🔗 Network Check: {target_name}\n{linkedin_url}\n\n*1st Degree ({count}):*\n{list}\n\n*2nd Degree ({count}):*\n{list}"
)
```

Format each connection as: `• <{url}|{name}> — {title}`

If the list is very long (50+ connections), split into multiple messages to stay within Slack's character limits (~4000 chars per message).

If Slack MCP is not available, fall back to printing the full list to the user in the terminal.

## Error Handling

- **Login wall on LinkedIn** — Stop and tell the user to log in manually.
- **No mutual connections link** — The target may have connection visibility restricted. Inform the user.
- **Empty results after filtering** — Report "No mutual connections found" and still post to Slack.
- **Slack MCP unavailable** — Print results to terminal instead. Tell the user they can set up Slack MCP with `/setup-slack-mcp`.
- **Rate limiting / CAPTCHA** — Stop immediately and alert the user.
