---
name: create-mcp
description: Set up an MCP server with comprehensive configuration instructions
---

Set up an MCP (Model Context Protocol) server for $ARGUMENTS.

## Recommended Setup Strategy

### Simple MCP Servers (Basic CLI)
For servers with no environment variables or complex configuration:
```bash
claude mcp add <server-name> npx <package-name>
# Example: claude mcp add sequential-thinking npx @modelcontextprotocol/server-sequential-thinking
```

### Complex MCP Servers (Direct Config Editing) - RECOMMENDED
For servers requiring API keys, environment variables, or complex configurations, **edit `~/.claude.json` directly**:

1. **Open your Claude config file:**
   ```bash
   code ~/.claude.json  # or nano ~/.claude.json
   ```

2. **Find the `mcpServers` section** and add your server:
   ```json
   {
     "mcpServers": {
       "your-server-name": {
         "type": "stdio",
         "command": "npx",
         "args": ["-y", "package-name"],
         "env": {
           "API_KEY": "your-api-key-here",
           "OTHER_VAR": "value"
         }
       }
     }
   }
   ```

3. **Save and restart Claude Code** for changes to take effect

### Common MCP Server Templates

**Figma Context MCP:**
```json
{
  "Framelink Figma MCP": {
    "type": "stdio",
    "command": "npx",
    "args": ["figma-developer-mcp", "--stdio"],
    "env": {
      "FIGMA_API_KEY": "your-figma-api-key"
    }
  }
}
```

**GitHub MCP:**
```json
{
  "github": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "your-github-token"
    }
  }
}
```

**Database MCP (PostgreSQL):**
```json
{
  "postgres": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-postgres"],
    "env": {
      "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/db"
    }
  }
}
```

**Search Omnisearch MCP:**
```json
{
  "mcp-omnisearch": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "mcp-omnisearch"],
    "env": {
      "TAVILY_API_KEY": "your-tavily-key",
      "BRAVE_API_KEY": "your-brave-key",
      "KAGI_API_KEY": "your-kagi-key"
    }
  }
}
```

### Server Type Examples

**stdio servers (local executables):**
```json
{
  "my-server": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "package-name"],
    "env": {}
  }
}
```

**SSE servers (Server-Sent Events):**
```bash
claude mcp add --transport sse <server-name> <url>
# Example: claude mcp add --transport sse api-server https://api.example.com/mcp --header "X-API-Key: your-key"
```

**HTTP servers:**
```bash
claude mcp add --transport http <server-name> <url>
# Example: claude mcp add --transport http secure-server https://api.example.com/mcp --header "Authorization: Bearer your-token"
```

### 2. Choose Server Scope

Use the `-s` flag to specify scope:
- `local` (default): Available only to you in current project
- `project`: Shared with team via .mcp.json file
- `user`: Available to you across all projects

```bash
claude mcp add my-server -s project /path/to/server
```

### 3. Set Environment Variables

Use `-e` flag for environment variables:
```bash
claude mcp add server-name -e API_KEY=value -e TIMEOUT=30000 -- command args
```

### 4. Configure Server Timeout

Set MCP server startup timeout:
```bash
MCP_TIMEOUT=10000 claude mcp add server-name command
```

## Server Management Commands

```bash
# List all configured servers
claude mcp list

# Get details for specific server
claude mcp get <server-name>

# Remove a server
claude mcp remove <server-name>

# Check server status in Claude Code
/mcp
```

## Authentication Setup

For servers requiring OAuth 2.0:

1. Add the server normally
2. In Claude Code, run `/mcp` command
3. Select "Authenticate" for your server
4. Complete OAuth flow in browser
5. Tokens are stored securely and auto-refreshed

## Using MCP Resources

- Type `@` to see available resources from all servers
- Reference with format: `@server:protocol://resource/path`
- Example: `@github:issue://123` or `@docs:file://api/auth`

## Using MCP Prompts as Slash Commands

- Type `/` to see available commands including MCP prompts
- Format: `/mcp__servername__promptname`
- Examples: `/mcp__github__list_prs` or `/mcp__jira__create_issue "Bug title" high`

## Import from Claude Desktop

```bash
# Import existing Claude Desktop MCP configurations
claude mcp add-from-claude-desktop
```

## Add from JSON Configuration

```bash
claude mcp add-json <name> '<json-config>'
# Example: claude mcp add-json weather '{"type":"stdio","command":"/path/to/weather-cli","args":["--api-key","abc123"]}'
```

## Use Claude Code as MCP Server

```bash
# Start Claude Code as an MCP server for other applications
claude mcp serve
```

Then add to other MCP clients with config:
```json
{
  "command": "claude",
  "args": ["mcp", "serve"],
  "env": {}
}
```

## Best Practices

- Use `local` scope for personal/sensitive servers
- Use `project` scope for team-shared tools (creates .mcp.json)
- Use `user` scope for cross-project utilities
- Set appropriate timeouts for slow-starting servers
- Use minimum required permissions for database connections
- Test server connectivity with `/mcp` command before use
- Reset project choices if needed: `claude mcp reset-project-choices`

## Security Notes

- MCP servers have access to tools and data - only use trusted servers
- Be cautious with internet-connected servers (prompt injection risk)
- Project-scoped servers require approval before first use
- Authentication tokens are stored securely and auto-managed
