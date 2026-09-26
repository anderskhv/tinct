# Independent Review — Paradise Lost Frontmatter Repair

**Reviewer:** independent audit (fresh source fetch, no reliance on package's own CHANGELOG)
**Date:** 2026-09-26
**Files reviewed:**
- `books/wip/paradise-lost-frontmatter-repair/editions/paradise-lost-original-en.json`
- `books/wip/paradise-lost-frontmatter-repair/editions/paradise-lost-modern-en.json`
- Compared against live: `app/public/data/editions/paradise-lost-original-en.json`, `paradise-lost-modern-en.json`
- Sources fetched fresh: Standard Ebooks single-page edition (`https://standardebooks.org/ebooks/john-milton/paradise-lost/text/single-page`) for the 12 Arguments; Wikisource raw wikitext (`.../Paradise_Lost_(1674)/The_Verse?action=raw`) for "The Verse"

## Verdict: **ACCEPT**

No paragraph-level defects found. All six checks in the task pass.

## 1. JSON validity / structure

Both candidate files parse as valid JSON, each with exactly 12 chapters (`Book 1`–`Book 12`), and per-chapter paragraph counts are identical between original-en and modern-en in every chapter:

| Book | original-en | modern-en |
|---|---|---|
| 1 | 76 | 76 |
| 2 | 91 | 91 |
| 3 | 93 | 93 |
| 4 | 125 | 125 |
| 5 | 103 | 103 |
| 6 | 95 | 95 |
| 7 | 73 | 73 |
| 8 | 77 | 77 |
| 9 | 157 | 157 |
| 10 | 123 | 123 |
| 11 | 111 | 111 |
| 12 | 78 | 78 |

Insertion counts vs. live match spec exactly: Book 1 +3 paragraphs (Verse ×2 + Argument), Books 2–12 +1 paragraph each (Argument only).

## 2. Pre-existing poem text unchanged and correctly shifted

Programmatically diffed the tail of every candidate chapter (`paragraphs[insert_count:]`) against the corresponding live chapter's full paragraph list, for both editions, all 12 chapters. **Every tail is byte-for-byte identical to the live file** — same strings, same order, just shifted to new indices by the insertion count. No wording, punctuation, or Unicode-character drift anywhere in the pre-existing poem text.

## 3. Original-en Arguments and "The Verse" verified against source

Fetched the 12 `<section id="argument-N" epub:type="preamble">` blocks from Standard Ebooks and normalized whitespace/HTML. Compared each against the candidate's Argument paragraph (chapter 1 index 2; chapters 2–12 index 0, with the "The Argument " label prefix stripped for comparison). **All 12 match verbatim**, word-for-word, no truncation, no alteration, no added/omitted clauses.

Fetched "The Verse" raw wikitext from Wikisource and normalized. Compared against the candidate's two "The Verse" paragraphs (chapter 1, indices 0–1, concatenated). Content matches in full; the only diffs are trivial typographic-convention differences consistent with Standard Ebooks' house style (which the rest of this book's text also follows), not content changes:
- `THE` (all-caps, wikitext convention) vs `The` (sentence case)
- straight apostrophes (`grac't`, `esteem'd`, `recover'd`) vs curly (`grac't`→`grac't`... i.e. `’`) — cosmetic quote-style only
- two minor comma placements (`Rime,` / `defect,` vs no comma) — punctuation-only, no wording change

No dropped or invented text anywhere in either the Verse or the 12 Arguments.

## 4. Modern-en Arguments and "The Verse" — faithfulness check

Read all 12 modern-en Arguments and both modern-en "Verse" paragraphs in full, alongside their original-en counterparts. Findings:
- Character-length ratios (modern/original) range 0.95–1.17 across all 12 Arguments — no summarization, no padding.
- Every plot point, name, and causal clause in the original Arguments is present in the modern versions (spot-checked in full: Books 1, 2, 3, 4, 5, 7, 8, 10, 11; skimmed 6, 9, 12 — consistent quality throughout).
- Register matches the rest of the book's modern-en: present-day-clear prose, contractions where natural ("Man's," "God's"), no invented plot details, no anachronisms.
- "The Verse" modern-en is a clean, complete modernization of Milton's own note on blank verse — nothing about the rhyme argument is lost or added.

## 5. Chapter 1 paragraph order

Confirmed in both editions, in order:
1. "The Verse" — part 1 (labelled, starts "The Verse The measure is..." / "The Verse This poem is written...")
2. "The Verse" — part 2 (unlabelled continuation, starts "Not without cause..." / "It is not without reason...")
3. Book 1's Argument (labelled "The Argument This First Book proposes...")
4. Unchanged original opening line — original-en: "Of Man's first disobedience, and the fruit..."; modern-en: "Sing, Heavenly Muse, of the first disobedience of Man..." — verified byte-identical to the live file's existing paragraph 0 in each edition.

## 6. Chapter titles

All 12 chapter titles unchanged ("Book 1" through "Book 12") and `number` fields (1–12) unchanged, in both editions.

## Minor observations (not defects, no action required)

- The "The Argument " / "The Verse " label is embedded inline as the first words of the paragraph string rather than as a separate structured field — this matches the file format (plain string arrays, no per-paragraph metadata) and is applied consistently across all 12 chapters and both editions, so it is a reasonable, consistent choice rather than a defect.
- The source-text apostrophe/typography convention (curly quotes, sentence-case "The") used in "The Verse" differs cosmetically from raw 1674 Wikisource wikitext but is internally consistent with the rest of the book's punctuation style and with the Standard Ebooks-sourced Arguments in the same file.
