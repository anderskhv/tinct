# Release Packet — Faust Part I, English edition replacement (Bayard Taylor)

Status: `original-en` independently reviewed and ACCEPTED (see
`INDEPENDENT-REVIEW.md`, both defects it found have since been fixed —
hashes below reflect the fixed version). `modern-en` candidate assembled
and independent review in progress (see `MODERN-EN-INDEPENDENT-REVIEW.md`
once it lands). Not published. Authorized under the 2026-09-26
assignment's Faust instruction: "proceed with the Taylor replacement
recommendation after validating that source's identity, provenance and
completeness... keep attribution accurate, preserve the German original,
and document that replacing the existing human translation requires
explicit edition-identity and reader-coordinate handling by Codex."

## What this replaces

See `books/wip/faust-part-1-source-decision/DECISION.md` for the full
finding. Summary: the live `original-en` is mislabeled — served as "Bayard
Taylor (1870)" but is actually Abraham Hayward/C. A. Buchheim's prose
translation, OCR'd from a bilingual scan, with ~1,873 words missing
(whole skipped OCR pages) and ~2,500 words of German facing-page text
bled into the English body across 55 positions. `modern-en`/`modern-da`
silently bridge those gaps and, at the German-bleed positions, either
duplicate adjacent English or invent lines with no source counterpart at
all.

This package replaces both `original-en` and `modern-en` with a fresh
parse and rendering of Bayard Taylor's actual, complete 1870/71
translation (Project Gutenberg #14591) — the translation the live edition
was already mislabeled as being. This satisfies the "establish the
correct source" instruction without a relabeling of defective text: Taylor
is complete (no OCR gaps, no German-bleed, monolingual).

## Source verification (validated this session)

| Item | Value |
|---|---|
| Source | Project Gutenberg #14591, Bayard Taylor's translation (1870/71; the 1918 World Publishing "Illustrated Edition" text) |
| Raw file | `books/raw/faust-part-1/raw-en.txt` |
| sha256 | `840e94c5694ce6b66ad6e2ebd2ffabea845297bc0cd50604d2587b5c6079791b` |
| Independently re-downloaded and confirmed byte-identical | `https://www.gutenberg.org/files/14591/14591-0.txt`, this session |
| Completeness | Runs from PG START to PG END, 28 scenes, correct opening ("Again ye come, ye hovering Forms!") and correct ending ("VOICE (from within, dying away). Henry! Henry!" — matching the German original's ending exactly). No missing scenes, no OCR gaps, no German-bleed. |

## Candidate — original-en

| Item | Value |
|---|---|
| `editions/faust-part-1-original-en.json` | sha256 `e36200c60fe9e763555461ea2d65f9772058aa737635688e7b79ad4010bee79d` — 28 chapters, 1,060 paragraphs |
| Replaces live sha256 | `bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395` (28 chapters, 895 paragraphs — the mislabeled Hayward/Buchheim OCR) |

Independently reviewed (`INDEPENDENT-REVIEW.md`): 12 scenes spread across
the whole play were deep-diff-checked word-for-word against the raw
source, structural/schema checks passed, opening and ending confirmed
present and correct. Two defects were found and have since been fixed in
this final candidate:
1. A leaked PG illustration caption at chapter 28 (Dungeon) paragraph
   index 40 — removed (paragraph count is now 58 for chapter 28, was 59).
2. Six stray footnote-marker digits glued into chapter 4's long Faust
   monologue (paragraph index 33) with no corresponding footnote text
   anywhere in the source file — removed.
Also fixed as a cosmetic consistency item: chapter 6/7 titles now read
"The Study, Part 1" / "The Study, Part 2" (Arabic numerals, matching the
live edition's existing convention) rather than the reviewer-noted "Part
I"/"Part II" Roman-numeral inconsistency.

## Candidate — modern-en

| Item | Value |
|---|---|
| `editions/faust-part-1-modern-en.json` | sha256 `7c7b27df8c77e069e8641b8154f67f26d57afab36d73072865d061998d201dfe` — 28 chapters, 1,060 paragraphs, same structure as `original-en` |
| Replaces live sha256 | `9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b` |

Fresh, full paragraph-by-paragraph modern-English rendering of the
corrected `original-en` (not built on the old defective text at any
point). Assembled from 5 batches (F1: ch1-6; F2: ch7-8; F3: ch9-13; F4:
ch14-19; F5: ch20-28), each self-verified for exact paragraph-count match
and word-ratio floor before merging; chapter 28's batch was generated
against the already-corrected 58-paragraph `original-en` (the illustration
caption was stripped from the input before that batch was rendered, so no
post-hoc reconciliation was needed). All 1,060 paragraph counts verified
programmatically against `original-en`, chapter by chapter — exact match
throughout. No paragraph flagged by an automated word-ratio truncation
check (≥8-word source paragraphs rendered at <60% length: zero flagged).
Independent review of this candidate is in progress; see
`MODERN-EN-INDEPENDENT-REVIEW.md` once complete, and this packet's status
line will be updated to reflect the verdict.

## Edition-identity and reader-coordinate handling required by Codex

This is a full replacement of both `original-en` and `modern-en` with a
**different underlying source text** (Taylor's complete translation
instead of the mislabeled, incomplete Hayward/Buchheim OCR), not a content
patch to the existing paragraphs at their existing coordinates. Paragraph
counts differ from the live files (1,060 vs. live's 895 for both
`original-en` and `modern-en`), so:

1. **No coordinate-preserving migration is possible.** Any reader
   currently mid-book in `faust-part-1` (position, highlights, notes,
   journal entries, in-book chat history keyed to chapter/paragraph) will
   have stale coordinates once this replaces the live files — there is no
   old→new paragraph map the way there was for the Jerusalem chapter
   merge, because the entire text is different at the source level, not
   reorganized at fixed content.
2. **Registry/edition-label implications**: the registry should continue
   to label this "Bayard Taylor (1870)" — that label was already present
   and false; this package makes it true. No new edition key or rights
   question is introduced (Taylor is public domain, same as the previous
   mislabeled text).
3. **Character-card and threads impact**: not assessed in this package.
   `app/public/data/characters/faust-part-1.v1.json` exists live; Codex
   should check whether it has any chapter/paragraph-anchored mentions
   that need re-deriving against the new 1,060-paragraph structure before
   integration (this package did not attempt that remap, since the
   underlying text — not just structure — has changed, so any existing
   anchors may need re-reading against the new text rather than a
   mechanical index shift).
4. **Onboarding**: `app/public/data/onboarding/faust-part-1.json` and
   `.da.json` exist live; not inspected here. Given the source and
   paragraph-count change, Codex should check for any chapter-count or
   paragraph-coordinate references.
5. Recommend Codex treat this as equivalent to a full re-publication of
   the book's English editions (in terms of the migration/compatibility
   work required), not a routine text-repair merge, even though the
   package format is the same isolated content-artifact handoff.

## Scope note on German (original-de) and Danish (modern-da)

`original-de` is a separate, already-accepted small fix (see
`books/wip/faust-part-1-original-de-fix/`) and is untouched by this
package — the German original is preserved exactly as instructed.

`modern-da` is not addressed by this package. Faust Part I is not among
the five books this assignment's Danish carve-out names, and in any case
`modern-da` would need to be rendered fresh from this new `modern-en`
baseline (the live `modern-da` is built on the old, defective English and
inherits its gaps/inventions) — a separate, future content assignment if
Danish scope is reopened for this book.

## What independent review should check (modern-en)

See the dispatch brief in `MODERN-EN-INDEPENDENT-REVIEW.md`'s own header
once written: paragraph-count/structure match against `original-en`,
fidelity across the play's darkest and most important scenes (Prologue in
Heaven, the Bible-translation passage, Auerbach's Cellar, Witch's Kitchen,
Gretchen's song, Walpurgis-Night and its Dream interlude, Valentine's
death, the Cathedral scene, and the full unsoftened Dungeon ending), no
invented content, and no mechanical pass-through (the opposite failure).
