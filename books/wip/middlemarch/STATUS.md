# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Branch: `content/middlemarch-codex-a`

Validated Gutenberg 145 Title/Author. Complete original: Prelude + 86 chapters + Finale, 88 flat units, 4,674 paragraphs. Book ranges and source SHA-256 in SOURCE.md. Source CRLF/trailing whitespace retained byte-for-byte in raw download.

Modern-en: NOT READY. Session A owns Prelude and chapters 1–12 in `parts/modern-en.mm-a.json`; rendering begins next. No other session files edited. Nothing published.

## Session mm-e — checkpoint, 2026-09-30

PARTIAL — chapters 55–60 complete. Resume at chapter 61; remaining assigned range: 61–68. Stopped at a complete chapter boundary for the token-limit checkpoint, before the usual 10–12-chapter gate interval. No placeholder chapters included.

- Branch: `content/middlemarch-codex-mm-e`, based on session A commit `d67f0de0906b674e0a66487a54776676ad88a567` after confirming `ORIGINAL READY`.
- Owned edition file: `books/wip/middlemarch/parts/modern-en.mm-e.json`. This status checkpoint is the explicitly requested exception to the single-output-file restriction. No other session's part file changed.
- Source: committed original edition and SOURCE.md. Real chapter numbers 55–60; source titles, empty sections array, and original paragraph boundaries preserved. Counts: 55=27, 56=126, 57=69, 58=98, 59=23, 60=45; total 388 paragraphs.
- Read-only gate PASS: committed `books/classify-modern-en.py`, loaded by absolute path, with original chapters 55–60 selected in memory and candidate loaded from its absolute path. Gate positions 1–6 map to real chapters 55–60. No baseline or gate code edited; no temporary edition files or reports created.
- Weighted similarity 0.473; LIGHT/MECHANICAL 0/6; identical long paragraphs 0/353; wrapped scaffolding 0; truncated quotations 0. All six chapters classified REAL-HEAVY. Chapter/paragraph alignment and nonempty string checks passed.
- Candidate SHA-256: `f5253c4351039f86bdf6bdaa07018d8f3f2eda326e805d217206f12c645cc8a4`.
- Workflow skimmed at the assigned base revision. No onboarding, characters, taxonomy, integration, merge, or publication performed. This is a partial content checkpoint, not completion of chapters 55–68.
