# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Branch: `content/middlemarch-codex-a`

Validated Gutenberg 145 Title/Author. Complete original: Prelude + 86 chapters + Finale, 88 flat units, 4,674 paragraphs. Book ranges and source SHA-256 in SOURCE.md. Source CRLF/trailing whitespace retained byte-for-byte in raw download.

Modern-en: NOT READY. Session A owns Prelude and chapters 1–12 in `parts/modern-en.mm-a.json`; rendering begins next. No other session files edited. Nothing published.

## Session mm-b — checkpoint 1 — 2026-09-30

Branch: `content/middlemarch-codex-mm-b`, created from session A at `d67f0de0906b674e0a66487a54776676ad88a567` after verifying ORIGINAL READY.
Owned rendering: `books/wip/middlemarch/parts/modern-en.mm-b.json`. Status updates are the only other authored changes. Workflow skimmed at that revision; SOURCE.md boundaries followed; no parsing, onboarding, characters, or taxonomy work.

Chapters 13–22 rendered: 10 chapters, 549 paragraphs, original chapter numbers, titles, order, and paragraph counts preserved. Remaining assignment: chapters 23–26. Resume at chapter 23.

Absolute-path gate: PASS, using temporary paired editions containing only the rendered range and the unchanged `books/classify-modern-en.py`. Gate display indices 1–10 map to real chapters 13–22. Weighted similarity 0.514; light/mechanical 0/10; identical long paragraphs 0/489; wrapped scaffolding 0; truncated quotations 0. Separate assertions passed for schema, chapter numbers, titles, paragraph counts, and nonempty strings.
Candidate SHA-256: `89619b57b464690b2cd5a9adc8b5c7aa757bec7f76ed7b900cea302794f2c273`.
This is a partial content checkpoint, not a publication or complete-assignment claim.

## Session mm-b — COMPLETE — 2026-09-30

Completed assigned real chapters **13–26**, 14 chapters and **723 paragraphs**, in `books/wip/middlemarch/parts/modern-en.mm-b.json`. Chapter numbers, source titles, paragraph order and counts preserved; epigraphs rendered in their original paragraph positions. No remaining mm-b chapters; no resume point required.

Final absolute-path gate over the complete mm-b range: **GATE PASS**. Temporary paired editions only; unchanged repository classifier. Its display indices 1–14 correspond to actual chapters 13–26. Weighted similarity **0.508**; REAL 9; REAL-HEAVY 5; LIGHT/MECHANICAL 0/14; identical long paragraphs 0/642; wrapped scaffolding 0; truncated quotations 0. Schema, exact range, titles, counts, and nonempty paragraph assertions passed. Chapter word-count ratios range 0.819–0.934 of source.

Accepted candidate SHA-256: `c3cbad1c8c608751bae1dfb808b1a669dd7a6e6d036e9080bcc7b565f740d1f4`.
First gate checkpoint commit: `ec4251d` (chapters 13–22). Final checkpoint adds chapters 23–26. Only the mm-b part and this required status update are included in mm-b commits. Other sessions' content and original source remain unchanged. Ready for assembly with the other session parts and the complete-book gate; not published.
