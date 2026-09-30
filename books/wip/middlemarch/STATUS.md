# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Branch: `content/middlemarch-codex-a`

Validated Gutenberg 145 Title/Author. Complete original: Prelude + 86 chapters + Finale, 88 flat units, 4,674 paragraphs. Book ranges and source SHA-256 in SOURCE.md. Source CRLF/trailing whitespace retained byte-for-byte in raw download.

Modern-en: NOT READY. Session A owns Prelude and chapters 1–12 in `parts/modern-en.mm-a.json`; rendering begins next. No other session files edited. Nothing published.

## Session mm-f — partial checkpoint, 2026-09-30

Branch: content/middlemarch-codex-mm-f
Base: content/middlemarch-codex-a at d67f0de0906b674e0a66487a54776676ad88a567, after this file reported ORIGINAL READY.

Modern-en mm-f: PARTIAL — chapters 69–74 complete, 310 paragraphs, in parts/modern-en.mm-f.json. Original numbers, titles, paragraph counts and order preserved. No placeholders for unfinished chapters.

GATE PASS: review/mm-f/gate-69-74.txt. Weighted similarity 0.464; no LIGHT/MECHANICAL chapters, identical long paragraphs, wrapped scaffolding, or truncated quotations. The gate prints slice positions 1–6; these correspond to actual chapters 69–74, which remain unchanged in both JSON files. Gate invoked with an absolute file prefix against a source slice and a relative symlink to this session's part; no live edition paths modified.

This is the token-boundary exception to the normal 10–12 chapter cadence. Resume at chapter 75, paragraph index 0. Remaining: chapters 75–86 plus Finale (source number 87). Continue from the committed part, then gate the next 10–12 chapters and the final remainder. Do not treat this checkpoint as the completed mm-f assignment.

Also written:
- onboarding/middlemarch.json: exactly 3 whyItMatters, 4 reading angles, cast; acclaim omitted; opening quoted from the original Prelude.
- characters/middlemarch.proposal.json: proposed identities, aliases, spoiler constraints, and integration requirements. Production anchors/hashes remain pending the assembled edition.
- taxonomy.md: existing Novels / 19th-Century English Novels placement.

Validation details, original/candidate SHA-256, and changed paragraph indices: review/mm-f/checkpoint-69-74.json. Checks establish structural alignment and heuristic gate passage; independent semantic review and full assembled-book acceptance remain pending.

Owned changes only: this mm-f status section, parts/modern-en.mm-f.json, review/mm-f/**, onboarding/middlemarch.json, characters/middlemarch.proposal.json, taxonomy.md, all under books/wip/middlemarch/. No other session files edited. Workflow skimmed at the base revision under the explicit lean instruction. Nothing published.
