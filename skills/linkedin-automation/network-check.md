# Network Check Workflow

Given a LinkedIn URL and target name, scrape all mutual 1st and 2nd degree connections, then post a structured list to a Slack channel for review.

## Inputs

1. **LinkedIn URL** — target's profile URL (e.g. `https://www.linkedin.com/in/joshsokol`)
2. **Target name** — the person's name (e.g. "Josh Sokol")
3. **Slack channel** — channel name to post results (e.g. `#deal-flow`)

If any input is missing, ask the user before proceeding.

## Step 1: Navigate to the Profile

Open the target's LinkedIn profile in the browser. The user must already be logged in.

If the page shows a login wall, stop and tell the user.

## Step 2: Open Mutual Connections

After the profile loads, find the mutual connections link — it reads something like "Sammy Abdullah, Mark Tornetta, and 11 other mutual connections". Click it.

This opens a search results page filtered to the target with 1st-degree connections checked by default.

## Step 3: Enable 2nd-Degree Filter

On the search results page, find the 2nd-degree connection filter (a radio button or checkbox labeled "2nd"). Click it to include both 1st and 2nd degree connections.

Wait 2 seconds for results to reload.

## Step 4: Extract Connections

For each page of results, extract:

- **Name**
- **LinkedIn profile URL** (the `/in/` link)
- **Connection degree** (1st or 2nd — from "• 1st" or "• 2nd" text)
- **Title** (job title / headline)

**Preferred: JavaScript evaluation** in the browser context:

```javascript
JSON.stringify(
  Array.from(document.querySelectorAll('a[href*="/in/"]'))
    .map(a => ({ name: a.textContent.trim().split('•')[0].trim(), url: a.href.split('?')[0] }))
    .filter(a => a.url.includes('/in/') && !a.url.includes('/in/{target_slug}'))
    .reduce((acc, a) => { if (!acc.some(x => x.url === a.url)) acc.push(a); return acc; }, [])
)
```

**Fallback: Parse the accessibility tree / snapshot.** Each result entry contains name, degree, title, location. Profile URLs can be extracted by reading link hrefs.

## Step 5: Paginate

Check for "Next" or page number buttons. If they exist, click "Next", wait 2 seconds, repeat step 4.

Continue until no more pages.

## Step 6: Deduplicate and Format

Combine all pages. Deduplicate by LinkedIn URL. Sort: 1st degree first, then 2nd, alphabetical within each group.

## Step 7: Post to Slack

Use `mcp__slack__slack_post_message` to post results to the specified Slack channel. Use the **exact format** below — do not add extra fields like connection status.

### Slack Message Format

```
*{Target Name}*
{Title} | {Location}
{linkedin_url}

*1st Degree*
- <{url}|{Name}> — {Title}
- <{url}|{Name}> — {Title}

*2nd Degree*
- <{url}|{Name}> — {Title} (via {mutual name} + {N} other mutuals)
- <{url}|{Name}> — {Title} (via {mutual name} + {N} other mutuals)
```

**Rules:**
- First line is the target's name in bold, followed by their title, location, and LinkedIn URL
- Group connections under `*1st Degree*` and `*2nd Degree*` headers
- Each connection is: `- <linkedin_url|Name> — Title`
- For 2nd degree connections, append `(via {mutual name} + {N} other mutuals)` if mutual connection info is available from the search results
- Do NOT include a status line (e.g. "Connect button available") — just the connections
- Include LinkedIn URLs for every connection that has one
- Split into multiple messages if over ~4000 chars

If Slack MCP is not available, print results to terminal and suggest running the `setup-slack` workflow.

## Error Handling

- **Login wall** — stop, tell user to log in
- **No mutual connections link** — target may have restricted visibility, inform user
- **Empty results** — report "No mutual connections found", still post to Slack
- **Slack MCP unavailable** — print to terminal, suggest setup-slack
- **Rate limit / CAPTCHA** — stop immediately, alert user
