# Setup Slack Workflow

Walk the user through setting up a Slack MCP server in Claude Code. Do each step interactively — confirm it worked before moving on.

## Step 1: Create the Slack App

Tell the user:

1. Go to **https://api.slack.com/apps** → **Create New App** → **From scratch**
2. Name it (suggest "Claude Code") and select their workspace
3. Confirm they've created it

## Step 2: Add OAuth Scopes

Guide them to **OAuth & Permissions** → **Scopes** → **Bot Token Scopes** and add:

| Scope | Purpose |
|---|---|
| `chat:write` | Send messages |
| `channels:read` | List public channels |
| `channels:history` | Read message history |
| `reactions:write` | Add emoji reactions (optional) |
| `users:read` | Look up user profiles (optional) |

Minimum required: `chat:write` and `channels:read`.

## Step 3: Install to Workspace

1. Scroll up on **OAuth & Permissions**
2. Click **Install to Workspace** and authorize
3. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
4. Also get the **Workspace/Team ID** — found in any Slack URL: `https://app.slack.com/client/TXXXXXXXX/...` (the `T`-prefixed segment)

## Step 4: Add the MCP Server

```bash
claude mcp add --transport stdio slack \
  --env SLACK_BOT_TOKEN={token} \
  --env SLACK_TEAM_ID={team_id} \
  -- npx -y @modelcontextprotocol/server-slack
```

Tell the user to run `/mcp` to verify the server is connected.

If it fails:
- Check token starts with `xoxb-`
- Verify `npx` is available (`which npx`)
- Run `npx -y @modelcontextprotocol/server-slack` directly for error output

## Step 5: Create or Pick a Channel

Ask the user for an existing channel or have them create one.

**Invite the bot:** User must type `/invite @BotName` in the channel. If that doesn't work: **Channel Settings** → **Integrations** → **Add apps**.

The bot MUST be in the channel or posting fails with `not_in_channel`.

## Step 6: Verify

1. `mcp__slack__slack_list_channels` — find the channel ID
2. `mcp__slack__slack_post_message` — send a test message
3. Ask the user to reply
4. `mcp__slack__slack_get_channel_history` — read their reply
5. Confirm two-way communication works

## Done

Tell the user:
- The channel ID for future reference
- What you can do: post messages, read history, list channels, add reactions
- Bot must be invited to any new channels
