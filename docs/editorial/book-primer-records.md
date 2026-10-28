# Book primer editorial records

Public editorial records live in `app/public/data/book-primers/<work>/<edition>/<language>/<book-or-chapter-N>.json`. These version-controlled assets are read by the existing chapter-notes endpoint before its generated cache. They are shared by the catalogue opening and the reader. They do not apply to private uploads, including uploads with matching titles.

Each record has `identity`, `resources`, and an optional `primer`. Identity must match the actual work, edition, source SHA-256, unit, type and language. The source hash uses the ordered unit map and normalized source passages; a display-title change does not invalidate it. Changed source text does invalidate it. Quotes must match their exact source paragraphs. A mismatched or malformed record is ignored.

For human copy, `primer` uses the existing SavedPrimer shape: identical identity, structured content, `origin: manual` (or `approved` after explicit approval), `createdAt`, and an editorial revision in `promptVersion`. This copy takes precedence over generated caches and does not consume AI allowance or require a provider key. Generation never writes editorial assets. Updating a record is a normal reviewed repository change, not a new dashboard or editing service. Do not label generated drafts as human or approved copy.

A resources-only record adds links to generated content without changing its origin. Resources are read afresh even on generated-cache hits, so a withdrawn resource is not retained by that cache. Each link needs a direct HTTPS URL, title, creator, format, relevance, spoiler note, and verification date. Duration is optional and must be verified. The schema checks metadata and URL safety; it does not itself prove a destination was inspected.

The initial Frankenstein resources were opened and inspected on 2026-10-28: the Shelley-Godwin Archive's manuscript collection and Charles E. Robinson's notebook introduction. Both expose material from throughout the novel and carry explicit spoiler notes. No duration is claimed. No private-book external lookup is performed.

The 105 previous prefaces remain unchanged in their original source and in `preserved-prefaces-2026-10-28/`. They have not been automatically promoted into the new primer schema: some include plot developments that need deliberate adaptation for a spoiler-safe opening. There is currently no committed human primer override; precedence is covered by endpoint tests using synthetic human records.
