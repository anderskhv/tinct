# Mechanical screening pass — 2026-09-11

Methodology, coverage, and known artifacts for the Phase 1 mechanical check.
This pass is a screening instrument only. Per the audit brief and
`books/AGENTS.md`, none of these numbers establish semantic completeness or
omission by themselves — every book below still requires Phase 2 editorial
sampling before a recommendation is made.

## What was run

`run_mechanical_checks.py`, run once against the current `bookRegistry.ts`
and the edition files on disk as of commit `cdb6d8b9ee90f0c1d2e6cbab1f4c55b371cd0611`
(2026-09-11). For every book:

- Parsed `BOOKS` (public, 100 entries) and the remaining `Book` constants
  (staged, 1 entry: `treasure-island`) directly from
  `app/src/data/bookRegistry.ts`.
- For every edition file present on disk (registry-declared or not), recorded
  chapter/paragraph/word counts and a truncated sha256 (first 16 hex chars)
  as a snapshot identifier — see `summary.csv` and the per-book JSON files
  for the exact hash inspected.
- Where a core English-language source (`original-en`, or `kjv-en` for the
  Bible) and `modern-en` both exist, computed a length-weighted, word-token
  `SequenceMatcher` similarity per chapter (same method as
  `books/classify-modern-en.py`, so numbers are comparable to the 2026-05/06
  calibration in `books/MODERN-EN-REPAIR-STATUS.md`), plus:
  - chapter-count mismatch
  - per-chapter paragraph-count mismatch (would indicate merged/split/dropped
    paragraphs)
  - % of long (≥80 char) source paragraphs that are byte-identical in modern-en
  - paragraphs where modern-en word count is <60% of the source paragraph's
    word count, source ≥20 words (truncation-ratio flag)
  - empty modern-en paragraphs where the source paragraph was non-empty
  - a "suspiciously short final chapter" flag (last chapter <15% of the mean
    word count of the other chapters) — a fast check for cut-off endings
- Checked whether all EN-language editions of a book (modern-en plus any
  `*-en`/`kjv-en`/`web-en` editions) agree on paragraph-count-per-chapter
  (`en_editions_aligned`).

Output: one JSON per book (`<book-id>.json`) plus `summary.csv` (one row per
book, all 101 rows).

## Coverage

101/101 books processed: 100 public (`BOOKS` array) + 1 staged
(`treasure-island`). Every public book has a `modern-en` file — the "books
without a modern-en file" bucket from the audit brief is empty for the
published inventory.

## Known artifacts / data-hygiene notes (not editorial findings)

- **Stray Bible chunk files.** `app/public/data/editions/` contains
  `bible-modern-en-ch2.json`, `-ch3.json`, `-ch4.json`, `-ch5.json`,
  `-ch34.json`, `-ch37.json` alongside the real `bible-modern-en.json`. These
  are leftover batch-generation working files (the convention-based loader
  used by the app reads `bible-modern-en.json` as a whole; per-chapter files
  matching `{id}-{key}.json` are not a recognized edition key and are not
  loaded by the app). They were picked up by this script's disk-glob probe
  and are recorded in `bible.json` under those literal keys for completeness,
  but they are **not treated as a real edition** anywhere else in this audit
  and are excluded from the Bible's mechanical comparison and from the CSV.
  Recommend deleting them as dead files in a future housekeeping pass — no
  action taken here per the audit's no-modification scope.
- No prior BSB (Berean Standard Bible) research was found anywhere in the
  repository (`BOOK-ONBOARDING-REVIEW.md` and `SESSION.md` do not actually
  mention BSB despite an initial filename-level false-positive grep hit).
  Phase 3 Bible research starts fresh rather than rechecking an existing
  trail.
- `books/AGENTS.md`'s own convention ("ignore `* 2.json` and `.bak`") was
  followed; no such files were found under `app/public/data/editions/` in
  this pass.

## How to read `summary.csv`

- `mean_weighted_similarity`: word-token similarity, core-English vs.
  modern-en, length-weighted by paragraph. Same metric/scale as
  `books/classify-modern-en.py`. Historical calibration (2026-06-10, that
  script): known-mechanical ≈0.95–0.997 → FAIL; verified real modernizations
  land ≈0.60–0.75 (a faithful modernization of an already-readable
  Victorian translation lands higher in that band, ≈0.65–0.75; early-modern
  prose lands lower). **This is a screening prior, not a verdict** — see
  Phase 2 per-book notes for the editorial read.
- `pct_identical_long_paragraphs`: % of ≥80-char source paragraphs that
  are byte-for-byte identical in modern-en. High values (Confession's 74.1%,
  Jungle Book's 46%, Jerusalem's 32%, Awakening's 36.9%, Vindication's
  33.4%) are the strongest mechanical signal of unmodernized passages and
  were prioritized for Phase 2 sampling, but compression/identity in short
  or already-plain passages is not automatically a defect — several of
  these books use already-accessible 19th/early-20th-century English, where
  some sentences may legitimately need no change. Phase 2 makes the actual
  call.
- `truncated_paragraphs_total`: paragraphs where modern-en fell under 60% of
  source word count (source ≥20 words). High counts (moby-dick 78,
  bible 71, the-art-of-war 31, faust-part-1 25, war-and-peace 21) were
  prioritized as outlier/difficult-passage picks for Phase 2, but natural
  compression of repetitive or list-like source prose can produce false
  positives — each flagged paragraph requires human inspection before it
  counts as a confirmed omission.
- `last_chapter_suspiciously_short`: true for `the-tempest`, `symposium`,
  `beyond-good-and-evil`, `social-contract`. Investigated in Phase 2 as a
  possible cut-off-ending signal; in several cases a short final scene/coda
  is simply how the source ends (e.g. Tempest's Epilogue), so this is a flag
  to check, not evidence of truncation on its own.
- `chapter_count_mismatch` / `para_count_mismatch_total`: 0 across the board
  in this pass — no book showed chapter-count or per-chapter paragraph-count
  drift between its core English source and modern-en.
- `en_editions_aligned`: true everywhere checked — all EN-language editions
  of a given book agree on paragraph-count-per-chapter.

## 33 books flagged for closer Phase 2 attention by this pass

(similarity ≥0.90, or ≥5% identical long paragraphs, or >5 truncation flags,
or a chapter/paragraph mismatch, or a suspiciously short final chapter —
screening thresholds, not verdicts): ulysses, war-and-peace, bible,
the-tempest, the-art-of-war, the-republic, divine-comedy, jane-eyre, apology,
symposium, poetics, moby-dick, niels-lyhne, jerusalem, the-awakening,
brothers-karamazov, iliad, beyond-good-and-evil, democracy-in-america,
genealogy-of-morals, on-liberty, aristotle-politics, communist-manifesto,
social-contract, faust-part-1, confessions, magna-carta, jungle-book,
around-the-world-80-days, heart-of-darkness, jekyll-and-hyde, walden,
vindication-rights-of-woman.

Every one of these still gets the same 5-passage minimum as every other
book; the flag just directs where the "mechanical outlier" sample (Phase 2's
5th required passage) is drawn from.

Books previously identified as needing full re-render in the 2026-05-23
`books/MODERN-EN-REPAIR-STATUS.md` (`wealth-of-nations`, `leviathan`,
`don-quixote`, `essays-montaigne`, `anna-karenina`) now show similarity in
the 0.62–0.71 range — consistent with the "verified repair" calibration
band in `books/classify-modern-en.py`, not the ≥0.95 mechanical-failure
band they were flagged at in May. This matches the audit brief's warning
that historical audits are not current verdicts: something changed between
May and September. Phase 2 confirms or disconfirms this with an actual
editorial read rather than trusting the number.
