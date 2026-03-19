# Outreach Workflow

Send personalized LinkedIn connection requests by automating the browser, driven by HubSpot tasks.

**ZERO CONFIRMATION RULE**: When this workflow is triggered, never ask the user to confirm, approve, preview, or verify before executing. The user invoking this IS the confirmation. Fetch tasks, open the browser, start sending. Only stop if something actually breaks.

## Startup Sequence (All Automatic)

1. **Read [browser-automation-reference.md](browser-automation-reference.md).** This is mandatory — do not skip it. It contains DOM tips, selector patterns, and timing guidance that prevent known failures.
2. **Identify the current user.** Call `get_user_details` to get the authenticated user's `ownerId`. If this fails, stop.
3. **Fetch HubSpot tasks.** Search for tasks owned by the current user with subject "connect on LinkedIn" or "Reach out on Linkedin", status NOT completed, due today or earlier.
4. **Resolve contact details.** For each task, get the associated contact's LinkedIn URL (`hs_linkedin_url`), `firstname`, `lastname`, `company`, `jobtitle`.
5. **Open the browser and go.**

## Step 1: Fetch Tasks

Use `search_crm_objects` with two filter groups (OR logic between groups, AND within):

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

If no tasks found: "No LinkedIn outreach tasks due today or earlier. Nothing to process."

## Step 2: Resolve Contacts

For each task, use `search_crm_objects` with an association filter to find the contact. Retrieve `hs_linkedin_url`, `firstname`, `lastname`, `company`, `jobtitle`.

Skip tasks with no associated contact or no LinkedIn URL.

## Step 3: Extract the Message

The message is `hs_task_body`. Strip HTML tags, trim whitespace. Skip if empty.

LinkedIn caps connection notes at **300 characters**. Truncate to 297 + "..." if needed.

## Step 4: Process Each Profile (Sequential)

For each person, one at a time:

### 4a. Verify Task Ownership

Confirm `hubspot_owner_id` matches the current user. Skip if it doesn't.

### 4b. Navigate to Profile

Open the LinkedIn profile URL. Check the page loaded correctly.

### 4c. Detect Profile State

Look for action buttons on the profile:

- **"Connect" visible** — proceed to send
- **"Pending"** — already sent, skip
- **"Message" (no Connect)** — already connected, skip
- **No Connect found** — click "More actions" dropdown, check again. If still not found, log as failed.

### 4d. Send Connection Request

1. Click "Connect"
2. Wait 1-2 seconds for modal
3. Click "Add a note"
4. Type the message from `hs_task_body` into the textarea
5. Click "Send"
6. Verify the button now shows "Pending"

### 4e. Mark HubSpot Task Complete

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

HubSpot update errors are non-blocking — log but don't stop.

### 4f. Pause

Wait **4 seconds** before the next person.

## Summary Report

After all tasks:

```
Done! (tasks owned by {User's Full Name}):

Sent: Alex Otero, Jane Smith, Tom Chen
Skipped (already connected): Maria Garcia
Skipped (pending): David Park
Skipped (no LinkedIn URL): Sam Lee
Skipped (no message): —
Skipped (wrong owner): —
Failed: Pat Nguyen (Connect button not found)

HubSpot tasks marked complete: 3
HubSpot update failures: 0
```

Failed attempts leave the HubSpot task incomplete for the next run.

## Error Handling

- **No HubSpot tasks** — inform and stop (not an error)
- **Can't identify user** — stop immediately
- **Wrong owner** — skip, never execute another user's task
- **No contact / no LinkedIn URL / no message** — skip, continue
- **Profile 404** — log as failed, continue
- **No Connect button** — check "More" menu first, then fail
- **Already connected or pending** — skip, still mark HubSpot task complete
- **Modal doesn't appear** — wait 2s, retry once, then fail
- **Rate limit / CAPTCHA** — stop everything, alert user

## Guardrails

- Never execute tasks assigned to another user
- Always add a note — never "Send without a note"
- Process sequentially with pauses — never parallel
- Idempotent: completed tasks won't be re-processed
