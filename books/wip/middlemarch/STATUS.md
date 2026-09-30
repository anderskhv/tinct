# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Branch: `content/middlemarch-codex-a`

Validated Gutenberg 145 Title/Author. Complete original: Prelude + 86 chapters + Finale, 88 flat units, 4,674 paragraphs. Book ranges and source SHA-256 in SOURCE.md. Source CRLF/trailing whitespace retained byte-for-byte in raw download.

Modern-en: NOT READY. Session A owns Prelude and chapters 1–12 in `parts/modern-en.mm-a.json`; rendering begins next. No other session files edited. Nothing published.

## Session mm-e — completed, 2026-09-30

DONE — chapters 55–68 complete. Appended chapters 61–68 (409 paragraphs); chapters 55–60 unchanged from commit `0e1d88fe` (chapter data and serialized prefix verified). No remaining assigned chapters.

- Branch: `content/middlemarch-codex-mm-e`.
- Owned edition file: `books/wip/middlemarch/parts/modern-en.mm-e.json`. This status update is the explicitly requested exception to the single-output-file restriction. No other session's files changed.
- Source: committed original edition and SOURCE.md. Same schema, source titles, real chapter numbers, empty sections array, and original paragraph boundaries retained. All appended epigraph paragraphs preserved verbatim, including both paragraphs in chapter 64.
- Counts: 55=27, 56=126, 57=69, 58=98, 59=23, 60=45, 61=70, 62=63, 63=53, 64=93, 65=25, 66=44, 67=34, 68=27. Whole part: 797 paragraphs.
- Read-only batch gate PASS, run once for chapters 61–68: weighted similarity 0.447; LIGHT/MECHANICAL 0/8; identical long paragraphs 7/359 (preserved epigraphs); all eight chapters REAL-HEAVY; wrapped scaffolding 0; truncated quotations 0.
- Read-only whole-part gate PASS, run once for chapters 55–68: weighted similarity 0.459; LIGHT/MECHANICAL 0/14; identical long paragraphs 7/712; all fourteen chapters REAL-HEAVY; wrapped scaffolding 0; truncated quotations 0.
- Both gates used committed `books/classify-modern-en.py`, loaded by absolute path, with original and candidate loaded from absolute paths and the matching ranges selected in memory. Gate positions 1–8 map to chapters 61–68; positions 1–14 map to chapters 55–68. No baseline or gate code edited; no temporary edition files or reports created.
- Chapter/paragraph alignment, schema, nonempty strings, appended epigraphs, and preservation of chapters 55–60 verified.
- Candidate SHA-256: `ceb331ef3263ca6181a6b280986ccf42edce582cfd6716a97d0e03b7f3f43823`.
- No onboarding, characters, taxonomy, integration, merge, or publication performed.
