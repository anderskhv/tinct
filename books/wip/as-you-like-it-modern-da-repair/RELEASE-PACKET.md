# Release Packet — As You Like It, modern-da structure and completeness repair

Status: candidate, awaiting independent whole-edition review. Not
published. Explicitly authorized (Danish repair for As You Like It named
directly in the assignment).

## What this fixes

The live Danish `modern-da` had the same three defects the accepted
English repair (`books/wip/as-you-like-it-completeness-repair/`) fixed in
`original-en`/`modern-en`:

1. **Act 1 Scene 1 entirely missing** (47 paragraphs never translated).
2. **Mislabeled/merged 17-chapter structure** (should be 23: 22 scenes +
   separated Epilogue) — every chapter title read "Akt 1, Scene 2/3" etc.
   regardless of actual content, a labeling bug inherited from the same
   parse defect as the English editions.
3. **World Library commercial-notice boilerplate served as reading text**
   — present in 4 places, two left entirely untranslated (English,
   chapters 2 and 12 of the old structure) and two translated into Danish
   (chapters 14 and 17), plus 4 merged "ACT N. SCENE I." heading lines
   folded into paragraphs.

## Method

- Used `books/wip/as-you-like-it-completeness-repair/PARAGRAPH-MAP.json`
  (the same old→new coordinate map built for the English repair) to
  relocate all 880 of the live Danish file's paragraphs that carry over
  into the new structure unchanged — pure relocation, no retranslation of
  existing correct Danish text.
- Identified and dropped the 21 live paragraphs not present in the map
  (the notice text in both its untranslated-English and Danish-translated
  forms, plus the 4 merged heading lines).
- Translated the 51 paragraphs that don't exist in Danish yet: the new
  Act 1 Scene 1 (47 paragraphs, from the accepted English `original-en`),
  and 4 scene-location captions (chapters 4, 11, 16, 19) — these captions
  were not invented; they're taken verbatim from the Danish wording
  already present in the dropped heading lines themselves (e.g. "Ardens
  Skov", "Paladset", "Skoven"), so they match the file's own established
  place-name convention exactly rather than introducing a new one.

## Candidate

| Item | Value |
|---|---|
| `editions/as-you-like-it-modern-da.json` | sha256 `62386b6037f23ee775ecad7f83fdc3f009ab2bc5d44449f0a5b87a9453937d5b` — 23 chapters, 931 paragraphs, matching the accepted `original-en`/`modern-en` structure exactly |
| Replaces live sha256 | `80064e115bd31f194fa60e16f1ec08ee4b99efc5f1cc199ec7a4ac34dd52d8ef` (17 chapters, 901 paragraphs) |

Per-chapter paragraph counts verified programmatically to match the
accepted English structure exactly across all 23 chapters (47, 120, 51,
12, 6, 12, 38, 25, 4, 43, 5, 151, 35, 27, 27, 84, 12, 61, 33, 50, 17, 67,
4 — total 931).

## Verification performed (by the author, before independent review)

- Valid JSON.
- 12 randomly sampled relocations (old coordinate → new coordinate)
  confirmed byte-identical Danish text — pure relocation, not accidental
  retranslation.
- Zero occurrences of "WORLD LIBRARY", "ELECTRONIC VERSION", "ETEXT"
  (case-insensitive) anywhere in the file.
- All 4 caption insertions confirmed at the correct chapter/index-0
  position, with the following paragraph correctly shifted to index 1.
- Act 1 Scene 1's 47 paragraphs re-read against English for completeness
  (1:1, no merges/splits/drops).

## What independent review should check

This package's own verification was done by the same process that
produced the translation, so independent review should re-derive the
relocation map's correctness independently (not just trust the 12-sample
spot-check), read Act 1 Scene 1 in full against the English baseline
paragraph-by-paragraph, confirm the 4 caption placements and index shifts
are correct throughout their chapters (not just at the seam), and — since
this assignment requires whole-edition fidelity review, not just
structural correctness — sample a substantial portion of the *relocated*
(not just newly-translated) Danish text against the corrected English
baseline for the same drop/fabrication defect class the English repair
targeted, in case the pre-existing Danish translation (produced
independently of this session, from an unknown prior process) has its own
undiscovered fidelity issues at the paragraph level, separate from the
structural defects this package fixes. Also confirm the Danish scene
titles ("Akt N, Scene M") are consistent with the corrected chapter
boundaries throughout, not just at the relocated seams.

## Scope note

This package only relocates and completes Danish text against the new
structure; it does not attempt the rights question the English package
flagged (whether continuing to serve the World-Library-transcription's
underlying wording, notice removed, is sufficient, or whether a larger
PG #1523/#100 re-base is wanted) — that remains open per the English
package's `RELEASE-PACKET.md` and is Anders'/Codex's decision, not
resolved here or by this Danish repair.
