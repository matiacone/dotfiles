---
name: setup-slack-mcp
description: Walk the user through setting up a Slack MCP server in Claude Code from scratch — creating a Slack app, configuring OAuth scopes, installing the bot, adding the MCP server, and verifying two-way communication in a channel. Use when the user wants to connect Claude Code to Slack, set up Slack integration, configure a Slack MCP server, or mentions wanting to send/read Slack messages from Claude Code.
---

# Set Up Slack MCP Server

Walk the user through every step interactively. Do each step one at a time — confirm it worked before moving on. Do NOT dump all steps at once.

## Step 1: Create the Slack App

Tell the user:

1. Go to **https://api.slack.com/apps** and click **Create New App** → **From scratch**
2. Name it (suggest "Claude Code") and select their workspace
3. Confirm they've created it before proceeding

## Step 2: Add OAuth Scopes

Guide them to **OAuth & Permissions** in the left sidebar, then scroll to **Scopes** → **Bot Token Scopes** and add:

| Scope | Purpose |
|---|---|
| `chat:write` | Send messages |
| `channels:read` | List public channels |
| `channels:history` | Read message history |
| `reactions:write` | Add emoji reactions (optional but nice) |
| `users:read` | Look up user profiles (optional) |

Minimum required: `chat:write` and `channels:read`. The others are recommended.

Ask the user to confirm they've added the scopes.

## Step 3: Install to Workspace

Tell them:

1. Scroll up on the same **OAuth & Permissions** page
2. Click **Install to Workspace**
3. Authorize when prompted
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`)
5. Send you the token

**IMPORTANT:** Also ask for the **Workspace/Team ID**. They can find it in any Slack URL: `https://app.slack.com/client/TXXXXXXXX/...` — the `T`-prefixed segment is the team ID.

## Step 4: Add the MCP Server

Once you have both the bot token and team ID, run:

```bash
claude mcp add --transport stdio slack \
  --env SLACK_BOT_TOKEN={token} \
  --env SLACK_TEAM_ID={team_id} \
  -- npx -y @modelcontextprotocol/server-slack
```

Then tell the user to run `/mcp` in Claude Code to verify the server status shows as connected.

If it fails, check:
- Is the token correct? (starts with `xoxb-`)
- Is `npx` available? (run `which npx` to verify)
- Try `npx -y @modelcontextprotocol/server-slack` directly to see error output

## Step 5: Create or Pick a Channel

Ask the user if they have an existing channel or want to create a new one.

**To create a new channel:** Tell them to go to Slack, click the **+** next to Channels, create a public channel, and give you the channel name.

**Then invite the bot:** The user must type `/invite @BotName` in the channel (using whatever they named the app in Step 1, e.g. `/invite @Claude Code`). If `/invite` doesn't find the bot, they can go to **Channel Settings** → **Integrations** → **Add apps**.

The bot MUST be in the channel or posting will fail with `not_in_channel`.

## Step 6: Verify Two-Way Communication

Once the bot is in a channel:

1. Use `mcp__slack__slack_list_channels` to find the channel and get its ID
2. Use `mcp__slack__slack_post_message` to send a test message to the channel
3. Ask the user to reply in the channel
4. Use `mcp__slack__slack_get_channel_history` to read their reply
5. Confirm to the user that you can see their message

If `slack_post_message` returns `not_in_channel`, the bot hasn't been invited yet — remind the user to do Step 5.

## Done

Once you've confirmed two-way communication, tell the user:

- The channel ID (so they can reference it later)
- What you can do: post messages, read history, list channels, add reactions
- Remind them the bot needs to be invited to any new channels they want you to access
