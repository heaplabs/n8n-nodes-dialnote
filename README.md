# n8n-nodes-dialnote

This is an n8n community node. It lets you use [dialnote](https://dialnote.com) in your n8n workflows.

dialnote is a business phone system for calls, SMS and AI call notes. This node works with your dialnote contacts, messages, notes, call logs and conversations, and can start a workflow when a call completes or a recording is ready.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

[Installation](#installation)
[Operations](#operations)
[Credentials](#credentials)
[Compatibility](#compatibility)
[Usage](#usage)
[Resources](#resources)
[Version history](#version-history)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation. On n8n Cloud, search for **dialnote** in the nodes panel.

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

The key is sent as a Bearer token on every request. Deliveries to trigger webhooks are signed by dialnote with a key the n8n account does not hold, so do not try to verify the signature in n8n; use the `X-DialNote-Delivery-Id` header if you need to deduplicate retries.

## Compatibility

Built and tested against n8n 1.x. Uses only `n8n-workflow` as a peer dependency and no runtime dependencies.

## Usage

- Phone numbers are E.164 (`+14155551234`).
- List operations return the API's `data` array; `find` returns the matching contacts.
- To test a trigger, activate the workflow (or use **Listen for test event**) and place a call in dialnote. Test URLs are registered like any other webhook and removed when you stop listening.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
- [dialnote webhooks guide](https://dialnote.com/docs/integrations/webhooks/)
- [dialnote API reference](https://api.dialnote.com/api/docs)

## Version history

- 0.1.0 — package scaffold and credential
