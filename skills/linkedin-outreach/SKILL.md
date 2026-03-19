---
name: linkedin-outreach
description: >
  Automate sending LinkedIn connection requests with personalized notes via browser automation,
  driven by HubSpot tasks. Use this skill whenever the user wants to send LinkedIn connection requests,
  connect with people on LinkedIn, send LinkedIn invites with messages, or do any kind of LinkedIn
  outreach that involves visiting profiles and clicking Connect. Triggers on phrases like "connect with
  these people on LinkedIn", "send LinkedIn invites", "LinkedIn outreach", "send connection requests",
  "run LinkedIn outreach", or any mention of processing LinkedIn tasks from HubSpot. Also trigger
  when the user asks to process their LinkedIn outreach queue or run scheduled LinkedIn connections.
compatibility: mcp__Claude_in_Chrome (browser automation via Chrome extension), HubSpot CRM (mcp__c7c08d4c) for task retrieval and logging
---

# LinkedIn Connect & Message

Send personalized LinkedIn connection requests by automating the browser. Pull outreach tasks from HubSpot, visit each contact's LinkedIn profile, click Connect, add a personalized note from the task body, and send it — one at a time with pauses between requests.

**ZERO CONFIRMATION RULE**: When this skill is triggered, never ask the user to confirm, approve, preview, or verify before executing. The user invoking this skill IS the confirmation. Fetch the HubSpot tasks, open the browser, and start sending immediately. Only stop to talk to the user if something actually breaks (login wall, CAPTCHA, HubSpot API error, missing LinkedIn URL).

## Quick Start (`/linkedin-outreach`)

When this skill is invoked, DO NOT ask for confirmation at any point. No previews, no "ready to start?", no "are you logged in?" — just execute immediately. The user has already decided to run this by invoking the skill.

Startup sequence (all automatic, no user interaction):

1. **Identify the current user.** Call `get_user_details` to get the authenticated user's `ownerId`. If this fails, stop — do not proceed without knowing who the user is.
2. **Fetch HubSpot tasks (owned by current user only).** Search for tasks with the subject "connect on LinkedIn" **or** "Reach out on Linkedin" that are due today or earlier (overdue), filtered to the current user's `ownerId`. Pull the full list of matching tasks.
3. **Resolve contact details for each task.** For each task, get the associated contact and pull their LinkedIn URL.
4. **Open the browser and go** — get a tab ID, navigate to the first profile, and start sending.

## Prerequisites

Assume the user is logged into LinkedIn and ready to go. Do NOT ask for confirmation — just start executing. Use `tabs_context_mcp` to get a valid tab ID (create one with `createIfEmpty: true` if needed), then navigate to LinkedIn and begin.

Only stop and warn the user if you actually hit a problem — for example, LinkedIn shows a login page, the Chrome extension isn't responding, or there's no browser tab available. Don't pre-check, just go.

## Input: HubSpot Task Queue

This skill is driven by HubSpot tasks. There is no CSV or file input. On each run, the skill fetches its work queue directly from HubSpot.

### Step 1: Identify the Current User

Before fetching any tasks, call `get_user_details` to retrieve the authenticated user's `ownerId`. Store this value — it is used to filter tasks and to verify ownership at runtime.

If `get_user_details` fails or returns no `ownerId`, stop immediately and inform the user: "Could not determine your HubSpot identity. Cannot proceed — this safeguard prevents executing tasks assigned to other users."

### Step 2: Fetch Tasks (Owned by Current User Only)

Use `search_crm_objects` to find tasks where:
- **Owner** matches the current user's `ownerId` (from Step 1)
- **Subject** contains "connect on LinkedIn" **or** "Reach out on Linkedin" (case-insensitive match)
- **Status** is NOT completed (i.e., `hs_task_status` is `NOT_STARTED` or `WAITING`)
- **Due date** is today or earlier (overdue tasks are included)

HubSpot's `filterGroups` use OR logic between groups and AND logic within each group. To match either task title, use two filter groups — one per subject — each sharing the same owner/status/due-date conditions:

```
search_crm_objects(
  objectType="tasks",
  filterGroups=[
    {
      "filters": [
        { "propertyName": "hubspot_owner_id", "operator": "EQ", "value": "{owner_id}" },
        { "propertyName": "hs_task_subject", "operator": "CONTAINS_TOKEN", "value": "connect on LinkedIn" },
        { "propertyName": "hs_task_status", "operator": "NEQ", "value": "COMPLETED" },
        { "propertyName": "hs_timestamp", "operator": "LTE", "value": "{end_of_today_unix_ms}" }
      ]
    },
    {
      "filters": [
        { "propertyName": "hubspot_owner_id", "operator": "EQ", "value": "{owner_id}" },
        { "propertyName": "hs_task_subject", "operator": "CONTAINS_TOKEN", "value": "Reach out on Linkedin" },
        { "propertyName": "hs_task_status", "operator": "NEQ", "value": "COMPLETED" },
        { "propertyName": "hs_timestamp", "operator": "LTE", "value": "{end_of_today_unix_ms}" }
      ]
    }
  ],
  properties=["hs_task_subject", "hs_task_body", "hs_task_status", "hs_timestamp", "hubspot_owner_id"]
)
```

Replace `{owner_id}` with the `ownerId` returned by `get_user_details`. Replace `{end_of_today_unix_ms}` with the Unix timestamp in milliseconds for the end of today (23:59:59 of the current date).

If no tasks are found, inform the user: "No LinkedIn outreach tasks due today or earlier. Nothing to process."

### Step 3: Resolve Contact & LinkedIn URL for Each Task

For each task returned, get the associated contact:

1. Use `get_crm_objects` or `search_crm_objects` with an association filter to find the contact associated with the task.
2. From the contact record, retrieve the LinkedIn URL from the `linkedin_url` property.
3. Also retrieve the contact's `firstname`, `lastname`, `company`, and `jobtitle` for logging purposes.

If a task has **no associated contact** or the contact has **no LinkedIn URL**, add it to a `skipped_no_linkedin` list and move on. Do NOT stop the flow.

### Step 4: Extract the Message

The **message to send on LinkedIn** is the body of the HubSpot task (`hs_task_body`). This is the personalized connection note.

- Strip any HTML tags if the task body contains them (HubSpot sometimes stores rich text).
- Trim whitespace.
- If the resulting message is empty, skip that task and add it to a `skipped_no_message` list.

## LinkedIn-Specific Browser Rules

LinkedIn's DOM is heavily layered with dynamic elements, z-index stacking, and overlapping click targets. Coordinate-based clicking and `find`/`ref` clicking are unreliable on LinkedIn — buttons that look obvious visually often don't register clicks correctly, or the click lands on the wrong element entirely (e.g., hitting the "Learning" nav item instead of the "Connect" button).

**Always use JavaScript to click buttons on LinkedIn.** Use `javascript_tool` with `document.querySelectorAll('button')` to find the right button by its text content, then call `.click()` on it. This bypasses all coordinate/z-index issues and triggers the element directly.

**Screenshot discipline:** Take exactly two screenshots per profile — one after navigating to confirm page state, one after sending to verify the result. Do not take screenshots mid-flow to "check" button locations. You don't need to see the buttons — you're clicking them via JavaScript.

**Do NOT use the `find` tool to locate and click LinkedIn buttons.** The `find` tool's reference mapping is imprecise on LinkedIn's dynamic DOM and will misfire. Use it only if you need to read page content — never to click.

## Execution Flow

Process each person **sequentially** (never in parallel). For each:

### 0. Verify Task Ownership (Defense in Depth)

Before processing each task, confirm that the task's `hubspot_owner_id` matches the authenticated user's `ownerId` from Step 1. This is a runtime safety check — the query filter should already limit results to the current user's tasks, but this catches edge cases (API quirks, filter misconfiguration, etc.).

If the owner ID does not match, **do not execute**. Add the task to a `skipped_wrong_owner` list and move to the next task. Never send a LinkedIn connection request on behalf of another user's task.

### 1. Navigate to the Profile

Use the `navigate` tool to go to the LinkedIn profile URL from the contact record. Take one screenshot to confirm the page loaded and check the profile state.

### 2. Detect Profile State via JavaScript

Run JavaScript to check what action buttons exist on the page. Use something like:

```javascript
Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(t => t)
```

Check the results to determine the state:

- **"Connect" in the button list** — Proceed to step 3.
- **"Pending" in the button list** — Already sent. Log as skipped.
- **"Message" in the button list (no "Connect")** — Already connected. Log as skipped.
- **No "Connect" found** — Try clicking "More" via JavaScript first, then re-check for "Connect" in the dropdown. If still not found, log as failed.

### 3. Click "Connect" via JavaScript

```javascript
Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Connect').click()
```

Wait 1-2 seconds for the modal to appear.

### 4. Click "Add a note" via JavaScript

```javascript
Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Add a note').click()
```

### 5. Type the Message

Use the message extracted from `hs_task_body` (Step 4 of the Input section above).

Use `javascript_tool` to find the textarea in the modal and set its value, then dispatch an input event so LinkedIn registers the change:

```javascript
const textarea = document.querySelector('textarea[name="message"]') || document.querySelector('#custom-message');
if (textarea) {
  textarea.focus();
  textarea.value = 'YOUR MESSAGE HERE';
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
}
```

If the JavaScript approach to typing doesn't register (LinkedIn sometimes requires keystrokes), fall back to using the `form_input` tool or the `computer` tool's `type` action on the textarea — but try JavaScript first.

**Character limit**: LinkedIn caps connection notes at **300 characters**. Before typing, check the message length. If it exceeds 300 characters, truncate to 297 characters + "..." and warn the user which message was truncated.

### 6. Click "Send" via JavaScript

```javascript
Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Send').click()
```

### 7. Verify & Pause

Take one screenshot to confirm the request was sent (modal should be closed, button should show "Pending"). Log the result.

Wait **4 seconds** before starting the next person. This matters — LinkedIn monitors for automated behavior, and rapid-fire requests risk triggering rate limits or account restrictions.

### 8. Mark the HubSpot Task as Completed

After a successfully sent connection request, update the original HubSpot task to mark it as completed. This is how progress is tracked — completed tasks won't be picked up on the next run.

Use `manage_crm_objects` to update the task:

```
manage_crm_objects(
  confirmationStatus="CONFIRMATION_WAIVED_FOR_SESSION",
  updateRequest={
    "objects": [{
      "objectType": "tasks",
      "objectId": {task_id},
      "properties": {
        "hs_task_status": "COMPLETED",
        "hs_task_subject": "✅ LinkedIn Message Sent — {Original Subject}"
      }
    }]
  }
)
```

Replace `{task_id}` with the HubSpot task ID and `{Original Subject}` with the original task subject. Prepending "✅ LinkedIn Message Sent —" to the subject gives the user a quick visual indicator in HubSpot that this task was processed by automation.

**HubSpot update errors are non-blocking.** If the update fails for any reason, log the failure internally but do NOT stop the LinkedIn outreach flow. The LinkedIn send is the primary action.

## After All Tasks

Report a summary to the user. Always state whose tasks were processed to make ownership explicit.

```
Done! Here's how it went (tasks owned by {User's Full Name}):

Sent: Alex Otero, Jane Smith, Tom Chen
Skipped (already connected): Maria Garcia
Skipped (pending): David Park
Skipped (no LinkedIn URL): Sam Lee
Skipped (no message in task): —
Skipped (assigned to different owner): —
Failed: Pat Nguyen (Connect button not found)

HubSpot tasks marked complete: 3
HubSpot update failures: 0
```

If any tasks were skipped due to missing LinkedIn URLs or empty messages, list them so the user can fix the data in HubSpot.

Failed connection attempts leave the HubSpot task **incomplete** so they'll be picked up on the next run. Mention this to the user.

## Error Handling

Handle these situations gracefully — log the issue and move on to the next person rather than stopping entirely:

- **No HubSpot tasks found** — Inform the user and stop. This is not an error, just an empty queue.
- **Could not determine current user identity** — Stop immediately. Do not fetch or process any tasks.
- **Task assigned to a different owner** — Log as skipped (`skipped_wrong_owner`), continue to next task. Never execute another user's task.
- **Task has no associated contact** — Log as skipped, continue to next task.
- **Contact has no LinkedIn URL** — Log as skipped, continue to next task.
- **Task body is empty (no message)** — Log as skipped, continue to next task.
- **Profile 404 or page error** — Log as failed, continue to next person.
- **No Connect button found** — Check the "More" menu first. If still not found, log as failed.
- **Already connected or pending** — Log as skipped (this isn't an error, just a no-op). Still mark the HubSpot task as completed since the connection exists.
- **Modal doesn't appear after clicking Connect** — Wait 2 seconds and retry once. If still no modal, log as failed.
- **Rate limit warning from LinkedIn** — Stop all remaining requests immediately and alert the user. Do not attempt to continue.
- **CAPTCHA or verification prompt** — Stop immediately and alert the user. They need to handle this manually.
- **HubSpot task update fails** — Log the error internally, continue to next person. Do not retry or stop the flow.

## Important Guardrails

- **Never execute tasks assigned to another user.** Always verify `hubspot_owner_id` matches the authenticated user before processing any task. If ownership can't be confirmed, skip the task.
- **Always add a note.** Never click "Send without a note."
- **One at a time.** Process profiles sequentially with pauses — never batch or parallelize.
- **300-character limit is enforced by LinkedIn.** Validate before typing, truncate if needed.
- **If anything looks off, stop and ask.** Unusual page layouts, new LinkedIn UI elements, or unexpected modals — pause and check with the user rather than guessing.
- **Idempotent runs.** Because tasks are marked complete after processing, re-running this skill is safe — it won't re-send to anyone already processed.
