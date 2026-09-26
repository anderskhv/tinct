# Release Packet — Jerusalem, heading-fragment removal (G07-jerusalem-04)

Status: independently reviewed, ACCEPTED. Not published. This is a
follow-up fix to the already-accepted `jerusalem-completeness-repair`
and `jerusalem-modern-da-repair` packages, applied in place to those
packages' candidate files (not a new separate edition).

## What this fixes

Confirmed audit finding G07-jerusalem-04: 5 paragraphs across
`original-en`, `modern-en` and `modern-da` were bare structural-heading
fragments served as if they were reading-text paragraphs:

- Chapter 1 (old index 55): "II" — a genuine internal section-break
  marker within Book One's single long chapter, present in the source
  at raw line 681.
- Chapter 1 (old index 87): "III" — raw line 817.
- Chapter 1 (old index 132): "IV" — raw line 1046.
- Chapter 1 (old index 307, chapter's last paragraph): "BOOK TWO" (Danish
  "ANDEN BOG") — the genuine in-body Book Two heading (raw line 1679, not
  the table-of-contents occurrence at line 64).
- Chapter 8 (old index 235, chapter's last paragraph): "BOOK THREE"
  (Danish "BOG TRE") — the genuine in-body Book Three heading (raw line
  6021, not the table-of-contents occurrence at line 74).

All 5 are real headings in Selma Lagerlöf's/Howard's source text, not
parser garbage or invented — but they duplicate information the file's
existing `sections` array and chapter structure already carry, and have
no reading content of their own, matching the same "apparatus served as
reading text" defect class this project's other repairs (As You Like
It's licence notice, Macbeth's stage-direction cleanup) have already
addressed.

## Method

Removed all 5 paragraphs from all three editions (`original-en`,
`modern-en`, `modern-da`), verified each removal seam reads as one
continuous, non-duplicated narrative, and confirmed no other paragraph
anywhere in any file was added, removed, reordered, or altered.

## Candidates (updated in place)

| File | New sha256 | Structure |
|---|---|---|
| `jerusalem-completeness-repair/editions/jerusalem-original-en.json` | `20d0ed3ecce5e4b440fec2e4373b337222c6a734f37f9cf769d94cecc248c48a` | 17 chapters, 1782 paragraphs (was 1787) |
| `jerusalem-completeness-repair/editions/jerusalem-modern-en.json` | `47c0c1c78ef4b342c793f7ffd07dabbbe96334c67d7ca85dbfa9aafdf9f521b0` | 17 chapters, 1782 paragraphs |
| `jerusalem-modern-da-repair/editions/jerusalem-modern-da.json` | `702f29c4e1ee0785c7cbf72f29b29315154ff2ca82e769fc3ae6d2475449dc2c` | 17 chapters, 1782 paragraphs |

Chapter 1: 308→304 paragraphs. Chapter 8: 236→235 paragraphs. All other
15 chapters unchanged. All three editions confirmed to have IDENTICAL
per-chapter paragraph counts after the fix:
`[304, 63, 42, 202, 65, 149, 122, 235, 86, 95, 18, 20, 43, 112, 110, 21, 95]`.

## Coordinate mapping

`PARAGRAPH-MAP.json` (this folder) gives the complete old→new map for
chapters 1 and 8 (539 entries covering every surviving paragraph in
those two chapters; all other chapters are unchanged, 1:1). This map
supersedes the original whole-edition repair's own `PARAGRAPH-MAP.json`
for these two chapters only — anyone re-deriving Jerusalem's full
old(pre-this-fix)→new coordinate history should apply this map AFTER
that one for chapters 1 and 8.

## Character-card note for Codex

`app/public/data/characters/jerusalem.v1.json` has changed format since
the earlier Jerusalem packages were written — it is now a
content-hash-based normalization (`paragraphHashes` keyed by chapter,
`offsetUnit: utf16`), not the simple chapter/paragraph mention-coordinate
format the earlier packages' `CHARACTER-CARD-IMPACT.json` files assumed.
A manual coordinate table is therefore not the right artifact for this
specific fix — Codex should re-run its hash-based character-card
generation against the corrected paragraph arrays once integrated,
rather than trying to hand-patch the existing hash index.

## Independent review

`INDEPENDENT-REVIEW.md` (this folder): re-fetched the source
independently (hash match confirmed), verified all 5 headings are
genuine and correctly identified, confirmed via programmatic diff
against `git show HEAD:<path>` that ONLY the 5 target paragraphs changed
in chapters 1 and 8 across all three files (chapters 2-7 and 9-17
byte-identical), confirmed clean seams at all 5 removal points, confirmed
cross-edition paragraph-count alignment, confirmed `PARAGRAPH-MAP.json`
correctness via spot-check. **Verdict: ACCEPT.**

## What "accepted" does not mean

Accepted for integration; not published, not live. This is a correction
to already-accepted candidates, not a new independent acceptance
decision about Jerusalem's other content (which remains as previously
accepted and documented in `jerusalem-completeness-repair/` and
`jerusalem-modern-da-repair/`). Codex owns integration, the
character-card re-generation noted above, and the serialized release
process per `books/BOOK-TASK-WORKFLOW.md`.
