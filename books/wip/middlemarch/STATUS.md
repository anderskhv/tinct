# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Branch: `content/middlemarch-codex-a`

Validated Gutenberg 145 Title/Author. Complete original: Prelude + 86 chapters + Finale, 88 flat units, 4,674 paragraphs. Book ranges and source SHA-256 in SOURCE.md. Source CRLF/trailing whitespace retained byte-for-byte in raw download.

Modern-en: NOT READY. Session A owns Prelude and chapters 1–12 in `parts/modern-en.mm-a.json`; rendering begins next. No other session files edited. Nothing published.

## Session mm-d — DONE 2026-09-30

Branch: `content/middlemarch-codex-mm-d`.
Owned edition file: `books/wip/middlemarch/parts/modern-en.mm-d.json`.

Chapters 41–54 COMPLETE: 14 chapters, 712 paragraphs. This continuation appended chapters 49–54 (358 paragraphs: 34, 53, 51, 86, 61, 73). Chapters 41–48 are unchanged against the starting commit. Same schema, real chapter numbers, exact source titles and paragraph counts preserved. New chapter epigraphs retained verbatim, including the three-paragraph Dante epigraph in chapter 54. No placeholders or source-copy body paragraphs. No other session files edited.

GATE PASS, run once for 49–54 and once for the whole part 41–54 using the existing unmodified `books/classify-modern-en.py --gate --per-chapter` with absolute temporary book prefixes and matching original/modern slices. Temporary fixtures removed automatically.

| Range | Weighted similarity | LIGHT/MECHANICAL | Identical long paragraphs | Wrapped scaffolding | Truncated quotations |
|---|---:|---:|---:|---:|---:|
| 49–54 | 0.496 | 0/6 | 7/323 (2.2%) | 0 | 0 |
| 41–54 | 0.480 | 0/14 | 7/639 (1.1%) | 0 | 0 |

Gate display positions 1–6 correspond to chapters 49–54; positions 1–14 in the whole-part run correspond to chapters 41–54. The identical long paragraphs are preserved epigraphs.

JSON/schema, chapter sequence, titles, nonempty paragraphs, paragraph alignment, epigraph preservation, and unchanged 41–48 checks passed. Reviewed all 14 new-paragraph word-count flags below 75% against their source: sentence-level compression, with the corresponding actions, arguments and details retained; no omitted content identified.

Candidate SHA-256: `bdaa1ae55aad5a299190c2107dd5bbf6ac5ad1b7bff3266282451ecc86e5eec8`.
Instruction reference: remote main `8a6cd1b220c4734386dc77d4b5f7ca179c0a09dd`; this user's explicit Codex content assignment controls authorship and scope.

No resume point remains for mm-d. Content branch only; no onboarding, characters, taxonomy, integration, narration or publication performed.
