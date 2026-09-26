# Acceptance Record — Faust Part I, original-de apparatus repair (defects 15/16/17)

**Status: ACCEPTED, ready for Codex integration. Not published.** This is
a follow-up to the already-accepted `faust-part-1-original-de-fix`
package (which fixed the ch28 transcriber's-note only). This record
covers the three additional confirmed apparatus defects (G07-faust-
part-1-15, -16, -17) found during the assignment's audit reconciliation.

| Item | Value |
|---|---|
| Package | `books/wip/faust-part-1-original-de-fix/` |
| Branch | `claude/cool-clarke-ngd780` |
| Candidate sha256 | `1ecb93d97051475d628cb94a1dc487baa7d113665ff275e4df565439bf5e3b9b` (28 chapters, 1093 paragraphs, was 1056 before this pass) |
| Independent reviewer | A separate Claude agent instance, checks performed against raw source and the prior commit before reading the repair's own changelog |
| Review verdict | **ACCEPT — no defects found** |

## What this fixes

1. **G07-faust-part-1-15**: ~17-19 dropped speaker labels in the "Vor
   dem Thor" Easter-walk crowd scene (chapter 5), which had merged
   several different unnamed characters' lines under one speaker tag.
2. **G07-faust-part-1-16**: missing scene-opening stage directions/
   speaker labels in most chapters (2, 3, 5-8, 10-20, 22-24, 26-28).
3. **G07-faust-part-1-17**: heading fragments and PG markup ("#...#")
   served as body text (chapter 2's "lustige Person._" fragment, chapter
   3's "Der Tragödie" heading-bleed, chapter 25's duplicated title
   fragment and mislabeled "OBERONS. Intermezzo." subtitle, and stray
   "#" typographic markers throughout).

## Independent review summary

Confirmed 28 chapters, 1093 total paragraphs (+37 net from the prior
1056). Chapters 1, 4, 9 confirmed byte-identical to the starting point
(untouched). **Defect 1**: read raw source lines ~1140-1495 and checked
all 61 restored chapter-5 paragraphs speaker-by-speaker; independently
reran the concatenation self-check (strip labels, diff underlying
dialogue) — confirmed nothing dropped, duplicated, or altered, only
re-attributed/re-split. **Defect 2**: spot-checked 16 of the ~23 affected
chapters directly against the raw source; every restored opening
matches, dialogue unchanged. **Defect 3**: confirmed all three named
fragments fixed and zero "#" characters remain anywhere in the file.
Independently confirmed the repair's own flagged still-broken judgment
calls (chapter 16's two further un-fixed instances, chapter 21's
explicitly-out-of-scope gap, chapter 25's unlabeled "Orchester Tutti")
are genuine and correctly left unfixed, and confirmed the
"Mehpistopheles"→"MEPHISTOPHELES" typo normalization is correct and
consistent across all 307 speaker-label occurrences in the file.
Independently recomputed all 28 per-chapter paragraph deltas before
reading the changelog — every one matches exactly.

## Known remaining gaps (explicitly out of scope for this pass, not fixed)

- Chapter 16: two further missing-speaker-label instances at paragraphs
  4/5, same bug class as Defect 1/2 but not part of the three named
  defects this pass targeted.
- Chapter 21 (Zwinger): a GRETCHEN attribution gap at paragraphs 1-2 —
  explicitly excluded from this pass's scope.
- Chapter 25: "Orchester Tutti (Fortissimo.)" swallowed into TITANIA's
  speech with no surviving "#" marker to have caught it mechanically.

These are recorded here rather than silently left unaddressed, so a
future pass (or Codex, if in scope) can pick them up without
re-discovering them.

## What "accepted" does not mean

Accepted for integration; not published, not live. This package's
scope was strictly limited to editorial apparatus/attribution — no
genuine Goethe dialogue or verse was deleted, shortened, or altered
anywhere. Codex owns integration and the serialized release process per
`books/BOOK-TASK-WORKFLOW.md`.
