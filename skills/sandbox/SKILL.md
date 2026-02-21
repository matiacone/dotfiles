---
name: Sandbox
description: Documentation and capabilities reference for Sandbox
metadata:
    mintlify-proj: sandbox
    version: "1.0"
---

## Capabilities

Sandbox Agent provides a unified interface for orchestrating AI coding agents in isolated execution environments. Agents can write code, execute commands, read/write files, and interact with users through a standardized event stream. The platform normalizes different agent implementations into a consistent API, enabling multi-agent applications without special-casing. Agents run with human-in-the-loop controls for permissions and questions, and all activity streams in real-time via Server-Sent Events or polling.

## Skills

### Agent Management
- **List available agents**: `GET /v1/agents` - Retrieve installed agents (Claude Code, Codex, OpenCode, Amp, mock)
- **Install agents**: `POST /v1/agents/{agent}/install` - Pre-install agents for faster session startup
- **Get agent modes**: `GET /v1/agents/{agent}/modes` - Query available modes per agent (e.g., "code", "build")
- **Mock agent**: Test UI and workflows without external credentials using simulated responses

### Session Management
- **Create session**: `POST /v1/sessions/{sessionId}` - Start a new agent session with specified agent, mode, and permission settings
- **Send message**: `POST /v1/sessions/{sessionId}/messages` - Post a message to an active session
- **Stream turn**: `POST /v1/sessions/{sessionId}/messages/stream` - Send message and receive streamed response in single call
- **Terminate session**: `POST /v1/sessions/{sessionId}/terminate` - End a session and clean up resources
- **List sessions**: `GET /v1/sessions` - View all active sessions

### Event Streaming
- **Poll events**: `GET /v1/sessions/{sessionId}/events?offset=0&limit=50` - Retrieve events with pagination
- **Stream events (SSE)**: `GET /v1/sessions/{sessionId}/events/sse?offset=0` - Real-time Server-Sent Events stream
- **Event types**: item.started, item.delta, item.completed, session.started, session.ended, error events
- **Content parts**: text, tool_call, tool_result, file_ref, reasoning, status, image

### Human-in-the-Loop (HITL)
- **Handle questions**: `POST /v1/sessions/{sessionId}/questions/{questionId}/reply` - Answer agent questions with selected option
- **Reject questions**: `POST /v1/sessions/{sessionId}/questions/{questionId}/reject` - Decline to answer
- **Handle permissions**: `POST /v1/sessions/{sessionId}/permissions/{permissionId}/reply` - Approve/deny sensitive operations
- **Permission modes**: "default" (ask for each), "plan" (ask before execution), "bypass" (auto-approve)

### Content Handling
- **Text messages**: Send and receive markdown-formatted text
- **File attachments**: Include files in messages (supported by Claude Code, Codex)
- **Images**: Send image attachments in messages
- **Tool calls**: Visibility into agent tool invocations (file reads, command execution)
- **Tool results**: See outputs from tool execution
- **File references**: Track file changes with diffs and action metadata
- **Reasoning/thinking**: Access agent reasoning content (Claude Code)

### SDK Integration
- **TypeScript SDK**: Full-featured typed client with auto-spawn capability
  - `SandboxAgent.start()` - Auto-spawn server as subprocess
  - `client.createSession()` - Create session with options
  - `client.postMessage()` - Send messages
  - `client.streamEvents()` - Real-time event streaming
  - `client.getEvents()` - Polling-based event retrieval
  - `client.streamTurn()` - Combined send + stream operation
- **Python SDK**: HTTP API access via httpx or requests (native SDK on roadmap)
- **CLI**: `sandbox-agent api` commands mirror HTTP API for scripting

### Deployment Options
- **Local development**: Auto-spawn via TypeScript SDK or manual CLI server
- **E2B sandbox**: Deploy daemon inside E2B sandbox with network access
- **Daytona workspace**: Run in Daytona with port forwarding
- **Docker**: Container deployment (development only, not recommended for production)
- **Rivet Actors**: Managed solution with persistent state, real-time streaming, horizontal scaling

## Workflows

### Basic Chat Session
1. Create session: `POST /v1/sessions/my-session` with `{"agent": "claude", "permissionMode": "default"}`
2. Send message: `POST /v1/sessions/my-session/messages` with `{"message": "Your prompt"}`
3. Stream events: `GET /v1/sessions/my-session/events/sse` to receive real-time updates
4. Handle HITL: Listen for permission.requested and question.requested events
5. Reply to HITL: `POST /v1/sessions/my-session/permissions/{id}/reply` or questions endpoint
6. Terminate: `POST /v1/sessions/my-session/terminate` when done

### Building a Chat UI
1. Create session and store session ID
2. Listen to item.started events to create message containers
3. Accumulate item.delta events for streaming content
4. On item.completed, finalize the message with full content
5. Render content parts based on type (text, tool_call, file_ref, etc.)
6. Show loading state while item.status === "in_progress"
7. Handle permission.requested and question.requested for HITL flows
8. Persist events to database with sequence numbers for recovery

### Multi-Agent Application
1. List available agents: `GET /v1/agents`
2. Get modes for each agent: `GET /v1/agents/{agent}/modes`
3. Create sessions with different agents: `POST /v1/sessions/{sessionId}` with different agent values
4. Use universal schema to render responses consistently across agents
5. Switch agents mid-workflow by creating new sessions and transferring context

### Event Persistence and Recovery
1. Store each event to database as it arrives with sequence number
2. On reconnect, query last event sequence from database
3. Request events with `offset=lastSequence` to avoid duplicates
4. Resume streaming from last known position
5. Replay events from database for session history

## Integration

Sandbox Agent integrates with multiple AI coding agents through a universal schema, enabling seamless switching between implementations. The HTTP API works with any HTTP client (curl, httpx, requests, fetch). TypeScript SDK provides native integration with Node.js applications and can auto-spawn the server. The CLI enables scripting and automation in shell environments. Events can be persisted to any database supporting the universal schema format. CORS configuration allows browser-based clients to communicate with the daemon. Rivet Actors provide managed infrastructure for production deployments with built-in observability and scaling.

## Context

**Universal Schema**: All agents (Claude Code, Codex, OpenCode, Amp) emit events in a normalized format. This allows building agent-agnostic UIs and persistence layers. Each agent has different native capabilities; the daemon fills gaps with synthetic events where possible.

**Feature Matrix**: Claude Code and Codex are stable; OpenCode and Amp are experimental. Text messages work across all agents. Tool calls, results, questions, and permissions vary by agent. Images and file attachments supported by Claude Code and Codex. Reasoning/thinking, command execution, file changes, and MCP tools available on select agents.

**Permission Modes**: "default" mode asks for each sensitive operation. "plan" mode asks before execution begins. "bypass" mode auto-approves all operations. Choose based on your trust model and user experience requirements.

**Session Lifecycle**: Sessions exist only in memory. Restart or sandbox destruction loses all data. Persist events to your database for recovery. Session.started marks beginning; session.ended marks completion with reason (completed, error, terminated).

**Event Streaming**: SSE (Server-Sent Events) recommended for real-time UIs. Polling suitable for batch processing or unreliable connections. Both support offset-based recovery to prevent duplicate processing.

**Agent Modes**: Different agents support different modes (e.g., "code", "build"). Query available modes before creating sessions. Mode affects agent behavior and capabilities.

**Content Parts**: Items contain typed content parts. Text parts use markdown. Tool calls include name, arguments, and call_id. Tool results contain output. File refs include path, action, and optional diff. Images reference file paths. Status parts provide progress updates.

**Telemetry**: Anonymous telemetry enabled by default in release builds. Disable with `--no-telemetry` flag. Sends startup payload and periodic updates every 5 minutes.

---

> For additional documentation and navigation, see: https://sandboxagent.dev/docs/llms.txt