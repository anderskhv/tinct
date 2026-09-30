# Middlemarch — session A

ORIGINAL READY

Original commit: `57bc3147ee91befe5385eb31bbde0a55bc0c58ad`
Branch: `content/middlemarch-codex-a`

Validated Gutenberg 145 Title/Author. Complete original: Prelude + 86 chapters + Finale, 88 flat units, 4,674 paragraphs. Book ranges and source SHA-256 in SOURCE.md. Source CRLF/trailing whitespace retained byte-for-byte in raw download.

Modern-en: NOT READY. Session A owns Prelude and chapters 1–12 in `parts/modern-en.mm-a.json`; rendering begins next. No other session files edited. Nothing published.

## Session mm-f — DONE, 2026-09-30

Branch: `content/middlemarch-codex-mm-f`
Prior part revision: `a3feefd246e698e60641e54f8e8053e0b7fd98a1`.

Modern-en mm-f: DONE — chapters 69–86 and Finale (source chapter 87), 19 reading units, 792 paragraphs in `parts/modern-en.mm-f.json`. Appended chapters 75–87: exactly 482 paragraphs. Chapters 69–74 remain unchanged against the prior committed part; schema unchanged. Actual source chapter numbers, titles, paragraph counts/order, and all epigraphs for 75–86 preserved. No resume point remains for mm-f.

Requested gates run once each using the absolute-path prefix and owned source slice/relative candidate symlink:
- `review/mm-f/gate-75-87.txt`: PASS, weighted similarity 0.503; slice positions 7–19 correspond to actual chapters 75–87.
- `review/mm-f/gate-69-87.txt`: PASS, weighted similarity 0.487; slice positions 1–19 correspond to actual chapters 69–87.
- Both: no LIGHT/MECHANICAL chapters, wrapped scaffolding, or truncated quotations. Identical long paragraphs are preserved epigraphs (11; 2.7% of new batch, 1.6% of whole part).

JSON, exact source alignment, nonempty paragraphs, unchanged prior chapters, and epigraph checks passed. Existing truncation audit saved as `review/mm-f/truncation-69-87.txt`: 18 inherited flags in untouched 69–74 and three new short-paragraph flags (77:26, 84:6, 84:53; zero-based paragraph indices). All three new flags were compared with their sources and preserve their full meaning. No content edits were made after the two passing gates. Candidate/source hashes, paragraph coordinates, and verification limits are in `review/mm-f/completion-69-87.json`.

`taxonomy.md` now proposes House, Shelf, form, era, literary canon description, and explicit named-list metadata without unsupported membership claims. Proposal only; nothing registered. Existing onboarding and character proposals remain unchanged. No other session files edited.

Owned changes: this mm-f status section, `parts/modern-en.mm-f.json`, `review/mm-f/**`, and `taxonomy.md`, all under `books/wip/middlemarch/`. Historical 69–74 checkpoint and gate reports retained. No app changes, publication, or narration work. Independent semantic review and acceptance of the assembled book, including character anchors/hashes, remain integration work.
