# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Branch: `content/middlemarch-codex-a`

Validated Gutenberg 145 Title/Author. Complete original: Prelude + 86 chapters + Finale, 88 flat units, 4,674 paragraphs. Book ranges and source SHA-256 in SOURCE.md. Source CRLF/trailing whitespace retained byte-for-byte in raw download.

Modern-en: NOT READY. Session A owns Prelude and chapters 1–12 in `parts/modern-en.mm-a.json`; rendering begins next. No other session files edited. Nothing published.

## Session mm-d — checkpoint 2026-09-30

Branch: `content/middlemarch-codex-mm-d`.
Base: `content/middlemarch-codex-a` at `d67f0de0906b674e0a66487a54776676ad88a567`, after its STATUS.md declared ORIGINAL READY.
Owned edition file: `books/wip/middlemarch/parts/modern-en.mm-d.json`.

Chapters 41–48 COMPLETE in modern English: 8 chapters, 354 paragraphs. Original chapter numbers, titles, paragraph counts, epigraphs, and empty sections preserved. SOURCE.md confirms the numbering; assignment remains chapters 41–54. No other session's content edited.

GATE PASS: existing `books/classify-modern-en.py`, unmodified, using an absolute temporary book prefix with baseline and target slices for completed chapters. Temporary fixtures removed after the read-only gate. Weighted similarity 0.465; LIGHT/MECHANICAL 0/8; identical long paragraphs 0/316; wrapped scaffolding 0; truncated quotations 0. Additional schema, number, title, nonempty paragraph, and per-chapter paragraph-count checks passed. Gate display positions 1–8 correspond to real chapters 41–48.

Candidate SHA-256: `3bb193c7450f82793813250d93537a0605f13269872d269b0f98db37ce6aa811`.

TOKEN-LIMIT CHECKPOINT: stopped at the end of chapter 48 with the gate passing, before the normal 10–12-chapter batch size. RESUME AT CHAPTER 49; chapters 49–54 remain unwritten. No placeholders or source copies stand in for unfinished chapters. No onboarding, characters, taxonomy, integration, or publication performed.
