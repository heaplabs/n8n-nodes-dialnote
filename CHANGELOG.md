# Changelog

## 0.1.4

- Verified by n8n: the README's Installation section now leads with installing from the nodes panel (self-hosted and n8n Cloud), keeping Settings > Community Nodes as the fallback for older self-hosted versions.

## 0.1.3

- Each codex file's `node` field is the fully-qualified identifier n8n expects, `n8n-nodes-dialnote.dialnote` and `n8n-nodes-dialnote.dialnoteTrigger`, instead of the bare package name (n8n manual review).

## 0.1.2

- The nodes' Docs links (codex `primaryDocumentation` and `credentialDocumentation`) point at the README on the public mirror instead of the private monorepo, which returned 404 outside the organisation (n8n manual review).

## 0.1.1

- Published from the public mirror repository `heaplabs/n8n-nodes-dialnote` by GitHub Actions with a provenance attestation (npm Trusted Publishing). `repository` and `bugs` point at the mirror; `homepage` stays on the dialnote webhooks guide.
- Credential form docs link and npm homepage point at a public page; the Send From Channel label no longer repeats a channel's number when its name is the number.

## 0.1.0

- Package scaffold, dialnote API credential, the dialnote action node (contacts, messages, notes, call logs, conversations) and the dialnote Trigger node (call completed, call recording completed).
