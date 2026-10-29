# Book primer editorial records

Public editorial records live in `app/public/data/book-primers/<work>/<edition>/<language>/<book-or-chapter-N>.json`. These version-controlled assets are read by the existing chapter-notes endpoint before its generated cache. They are shared by the catalogue opening and the reader. They do not apply to private uploads, including uploads with matching titles.

Each record has `identity`, `resources`, and an optional `primer`. Identity must match the actual work, edition, source SHA-256, unit, type and language. The source hash uses the ordered unit map and normalized source passages; a display-title change does not invalidate it. Changed source text does invalidate it. Quotes must match their exact source paragraphs. A mismatched or malformed record is ignored.

For human copy, `primer` uses the existing SavedPrimer shape: identical identity, structured content, `origin: manual` (or `approved` after explicit approval), `createdAt`, and an editorial revision in `promptVersion`. This copy takes precedence over generated caches and does not consume AI allowance or require a provider key. Generation never writes editorial assets. Updating a record is a normal reviewed repository change, not a new dashboard or editing service. Do not label generated drafts as human or approved copy.

A resources-only record adds links to generated content without changing its origin. Resources are read afresh even on generated-cache hits, so a withdrawn resource is not retained by that cache. Each link needs a direct HTTPS URL, title, creator, format, relevance, spoiler note, and verification date. Duration is optional and must be verified. The schema checks metadata and URL safety; it does not itself prove a destination was inspected.

The initial Frankenstein resources were opened and inspected on 2026-10-28: the Shelley-Godwin Archive's manuscript collection and Charles E. Robinson's notebook introduction. Both expose material from throughout the novel and carry explicit spoiler notes. No duration is claimed. No private-book external lookup is performed.

The 105 previous prefaces remain unchanged in their original source and in `preserved-prefaces-2026-10-28/`. They have not been automatically promoted into the new primer schema: some include plot developments that need deliberate adaptation for a spoiler-safe opening. There is currently no committed human primer override; precedence is covered by endpoint tests using synthetic human records.

## Local readiness evidence — 2026-10-29

The feature is implemented on the unpublished primer branch. Local verification does not establish production or real-provider acceptance. No generated draft has been promoted to a human editorial override.

| Requirement | Evidence and limit |
| --- | --- |
| Same book content in catalogue and reader | Both mount `PrimerContentView` and use the structured endpoint with edition/language identity. Catalogue/reader browser checks cover matching content, quote jumps and resume. |
| Chapter/source-unit and whole-book scope | Public and private EPUB paths provide actual source units and complete bounded text. Chapter requests exclude later section titles. Missing, mismatched or oversized sources produce explicit errors. |
| Existing margin and phone interaction | Public Chromium/WebKit checks and four private-browser cases passed. Discuss focuses the existing margin follow-up field; replies retain shared chat history. Phone viewport-resize coverage is not a native iPhone keyboard test. |
| Cache and editorial ownership | Source hashes, language/type/unit identity, private owner/upload identity and human-copy precedence have regression coverage. Tests for human overrides use synthetic records. |
| Verified outside resources | Frankenstein and Meditations have resource-only runtime assets. Metadata includes attribution, relevance and spoiler notes; no duration is invented. Private books perform no automatic outside search. |
| Preserve previous editorial work | All 105 prefaces remain in their original source and Markdown archive. They have not been bulk-adapted or assigned new approval. |
| Candidate semantic review | Frankenstein: all 28 units, 764 paragraphs, 74,919 split words. Meditations: all 12 books, 487 paragraphs, 46,058 split words. These are AI self-reviews, not independent editorial approval. Three chapter candidates were reviewed against their complete selected units. |
| Candidate presentation | Five actual staged drafts passed local desktop/phone previews. After the final Frankenstein edit, its 75-word opening and all expanded topics passed again on Chromium desktop and WebKit phone; the phone screenshot was inspected. API responses were fixtures containing the actual draft. |

The full runtime suite recorded 7,690 passes and six skips before the final resource-only addition; the final resource-focused run recorded 48 passes. Build and bundle verification passed for `index-Du8Kav1Q.js`. Later changes are confined to staged editorial copy and this evidence record, so those unchanged runtime checks were not repeated.

Remaining acceptance limits:

- Real-provider structured output quality, truncation frequency and response time have not been tested. The current task prohibits development provider calls; synthetic responses cannot close this gap.
- Candidate prose remains unapproved and outside runtime assets. Publishing the feature would not make these five drafts the default served copy. Any decision to use them as editorial overrides requires separate, explicit approval and correct provenance.
- An earlier intermittent WebKit navigation access-control error was not reproduced by the final passing run; its root cause remains unproven.
- No push, PR, merge or publication has been performed for this feature. Publication still requires Anders’s instruction.
