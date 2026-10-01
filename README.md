# n8n-nodes-dialnote

This is an n8n community node. It lets you use [dialnote](https://dialnote.com) in your n8n workflows.

dialnote is a business phone system for calls, SMS and AI call notes. This node works with your dialnote contacts, messages, notes, call logs and conversations, and can start a workflow when a call completes or a recording is ready.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Example workflows](#example-workflows)
[Resources](#resources)
[Version history](#version-history)

## Installation

On a self-hosted n8n, open **Settings > Community Nodes > Install** and enter `n8n-nodes-dialnote` (the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) covers the details and the environment variable that allows community nodes). Releases are published to npm by GitHub Actions in the public repository [heaplabs/n8n-nodes-dialnote](https://github.com/heaplabs/n8n-nodes-dialnote) with a provenance attestation, and the node has been submitted to n8n for verification; until that is approved it does not appear in the nodes panel or on n8n Cloud.

## Operations

**dialnote** node

- Contact: create, update, get, find (by name, phone number, email or company)
- Message: send an SMS from one of your dialnote channels
- Contact Note: create
- Conversation Note: create
- Call Log: get many, get
- Conversation: get many, get, get messages

**dialnote Trigger** node

- Call Completed
- Call Recording Completed

Both triggers deliver the same body the dialnote Zapier app receives: `{ id, event_type, contact_id, timestamp, call }`. Triggers register a webhook with dialnote when the workflow is activated and remove it when the workflow is deactivated.

## Credentials

1. In dialnote, an admin opens **Settings > API Keys** and creates a key. Use a **full-access** key if you want triggers; a read-only key can run reads and searches but cannot subscribe to events.
2. In n8n, create a **dialnote API** credential and paste the key (it starts with `dn_live_`).

The key is sent as a Bearer token on every request. Deliveries to trigger webhooks are signed by dialnote with a key the n8n account does not hold, so the trigger cannot verify the signature: **anyone who learns a workflow's webhook URL can post a forged event to it.** Treat the URL as a secret (n8n's own convention) and rotate it by recreating the trigger if it leaks. Deliveries are at-least-once (dialnote retries a failed delivery for up to two days), and the trigger hands the workflow the body only, so deduplicate on the item's `id` (the call SID) together with `event_type` if a repeat would matter downstream.

## Compatibility

Depends only on the stable `n8n-workflow` API (declared as a `*` peer dependency) and has no runtime dependencies. Developed and tested against n8n 2.x (`n8n-workflow` 2.40); earlier majors are untested.

## Usage

- Phone numbers are E.164 (`+14155551234`).
- List operations return the API's `data` array; `find` returns the matching contacts. `Find` pages with **Page** (1 or greater) and **Limit**; a page past the last one returns no items, which is indistinguishable from "no matches", so stop paging on the first empty page. Conversation > Get Messages can follow the cursor for you with **Return All**.
- To test a trigger, activate the workflow (or use **Listen for test event**) and place a call in dialnote. Test URLs are registered like any other webhook and removed when you stop listening. There is no polling and no sample data: the first item arrives with the first real event.
- Triggers need a **full-access** key; with a read-only key activation fails with the API's 403 message.
- Each activated trigger appears in dialnote under **Settings > Webhooks** as `n8n Webhook - <event>`. Deleting it there is harmless: the next activation re-registers it.

## Example workflows

Three recipes you can build in the editor in a few minutes. Field names are the ones the trigger body carries (`id`, `event_type`, `contact_id`, `timestamp`, `call.*`).

**1. Post every finished call to Slack**

1. **dialnote Trigger** → Event: *Call Completed*.
2. **Slack** → *Send a message* to a channel. Message text, for example:
   `{{ $json.call.direction }} call with {{ $json.call.from_number }} → {{ $json.call.to_number }}: {{ $json.call.status }}, {{ $json.call.duration }}s`.
3. Activate the workflow. The first message arrives when the next call ends.

**2. Log recording summaries to a Google Sheet**

1. **dialnote Trigger** → Event: *Call Recording Completed*.
2. **Google Sheets** → *Append row*. Map columns: `Call SID` ← `{{ $json.id }}`, `When` ← `{{ $json.timestamp }}`, `From` ← `{{ $json.call.from_number }}`, `Summary` ← `{{ $json.call.transcription_summary }}`, `Recording` ← `{{ $json.call.recording_url }}`.
3. Activate. Each recording adds one row once its transcription summary is ready; the SID column lets you spot a redelivered event.

**3. Text a contact you looked up by phone number**

1. **Manual Trigger** (or any trigger that yields a phone number).
2. **dialnote** → Resource: *Contact*, Operation: *Find*, Search: `+14155551234`.
3. **dialnote** → Resource: *Message*, Operation: *Send*. Send From Channel Name or ID: pick one of your channels; To: `{{ $json.phoneNumber }}`; Message: `Hi {{ $json.firstName }}, thanks for calling dialnote today.`
4. Run once from the editor to see the sent message's id, then wire your own trigger in front.

## Source

The code lives in the dialnote monorepo (`n8n-nodes-dialnote/`), which is private. [heaplabs/n8n-nodes-dialnote](https://github.com/heaplabs/n8n-nodes-dialnote) is its public release mirror, one commit per version; issues and questions are welcome there.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [dialnote webhooks guide](https://dialnote.com/docs/integrations/webhooks/)
- [dialnote API reference](https://api.dialnote.com/api/docs)

## Version history

- 0.1.1 — published from the public mirror with a provenance attestation; repository and issue links point there.
- 0.1.0 — the dialnote API credential, the dialnote node (contacts, messages, notes, call logs, conversations) and the dialnote Trigger node (call completed, call recording completed).
