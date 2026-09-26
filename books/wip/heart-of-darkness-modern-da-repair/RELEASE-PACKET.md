# Release Packet — Heart of Darkness, modern-da Part III translation

Status: candidate, awaiting independent review. Not published. Authorized
under the 2026-09-26 assignment's explicit Danish-repair carve-out.

## What this fixes

`CONFIRMED-DEFECTS.md` G07-heart-of-darkness-01 (S2): `modern-da` chapter 3
(Part III — the novella's climax and ending: Kurtz's death, "The horror!
The horror!", Marlow's return and his visit to Kurtz's Intended) was served
entirely in untranslated English, byte-identical to `modern-en`, across all
87 paragraphs — about 30% of the whole book.

## Baseline

The accepted `modern-en` chapter 3 (`original-en` for this book is
COMPLETE-VS-SOURCE per the audit; `modern-en`'s only flagged issue was a
quality note from an older, separate divergence audit, not a completeness
defect).

## Candidate

| Item | Value |
|---|---|
| `editions/heart-of-darkness-modern-da.json` | sha256 `ac2f680b9b73389395007b23041ffb75b851d695350ac7d0a1897cc4389c0407` — 3 chapters, same structure as live; only chapter 3's 87 paragraphs replaced |
| Replaces live sha256 | `b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444` (matches the audit's reported prefix) |

## Editorial note

Conrad's text uses a period racial slur once in chapter 3 (Marlow's "I had,
even like the niggers, to invoke him" passage). The translation renders
this as "de sorte" ("the Black people"/"the local people"), not a Danish
slur. This is not a new departure: the already-accepted Danish translation
of chapters 1–2 (live, unrepaired by this package) consistently uses
"sorte" throughout for the same original vocabulary, so this choice is
continuous with the book's own established Danish register, not a change
in editorial policy introduced here.

## Verification performed

- Valid JSON.
- Paragraph count (87) and chapter structure unchanged; only chapter 3's
  text changed.
- Confirmed no paragraph is byte-identical to the English baseline (i.e.
  none left untranslated) and none contains detectable leftover English.
- 19 paragraphs spot-checked against English, including the entire ending
  sequence (Kurtz's death, the manager's boy's line, the full Brussels
  scene with the Intended, the frame narrator's closing lines) — confirmed
  complete, faithful, not compressed.

## What independent review should check

Read a substantial sample against the English (this is Conrad's dense,
atmospheric prose — check restructuring into natural Danish clause order
didn't lose any imagery), confirm the racial-language handling is
consistent with chapters 1–2's established Danish text, and confirm the
ending lands with its full weight.
