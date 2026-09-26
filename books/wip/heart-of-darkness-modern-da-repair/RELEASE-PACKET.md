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
| `editions/heart-of-darkness-modern-da.json` | sha256 `2bc45f4bf5a3280a1c86099e9f83357a9fdfdc09492b62f5936233d4e13074c9` — 3 chapters, same structure as live; only chapter 3's 87 paragraphs replaced |
| Replaces live sha256 | `b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444` (matches the audit's reported prefix) |

## Editorial note

Conrad's text uses a period racial slur once in chapter 3 (Marlow's "I had,
even like the niggers, to invoke him" passage). Independent review found
that the first draft of this translation rendered it as "de sorte" on the
mistaken assumption that the already-accepted chapters 1–2 (live,
unrepaired by this package) use that neutral wording throughout. They do
not: chapters 1–2 in fact use the direct calque "nigger"/"niggere" at 7
confirmed locations (ch1 paragraphs 43, 49, 55, 59, 70; ch2 paragraph 28).
This final candidate corrects chapter 3's single instance to match that
already-established, edition-wide convention ("niggerne"), so the served
book renders Conrad's vocabulary consistently across all three chapters
rather than introducing a new, inconsistent policy in this repair. This
package does not decide the underlying editorial-policy question (whether
to soften or retain the term book-wide) — it only avoids a new
inconsistency; that broader question is Anders'/Codex's to make if raised.

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
