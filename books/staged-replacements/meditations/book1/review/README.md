# Book I — independent review (step 4 of `../../WORKFLOW.md`)

This directory holds the independent review of `../candidate-v1.json` (Long
1862 → modern English, Meditations I.1–I.17). The reviewer was a separate
subagent spawned by the coordinator; it did not draft the candidate and did
not consult the drafter. Nothing outside this directory was changed.

## Files

- `findings-v1.md` — one entry per paragraph B01-P001…B01-P017, in order,
  each a finding or "No material issue found."; summary table; chapter-level
  findings from the continuous read; flow judgement; verdict; coverage and
  limitations. Candidate hash `e1d816d3…` recomputed and confirmed.

## Result

**Accept after corrections.** 0 substantive, 19 minor (11 "worth
improving", 8 "optional preference"), 6 paragraphs with no material issue.

## What the drafter does next (steps 5–8)

1. Read `findings-v1.md`. For each of the 19 findings decide apply / decline;
   a declined finding needs a one-line reason.
2. Write `../candidate-v2.json` (and `candidate-v2-readable.md`) from
   `candidate-v1.json` via a change script in the Book II pattern
   (`../../scripts/build_book2_v2.py`: each old string asserted to occur
   exactly once in its paragraph; per-paragraph word diff printed). Record
   every change, old and new text side by side with the finding ID it
   answers, in `../changes-v1-to-v2.md`. `candidate-v1.json` stays frozen.
3. Re-check each changed passage against `../source-book1.json`; confirm 17
   paragraphs, numbering intact, and that the three dagger clauses (I.9,
   I.14, I.15) and the I.17 ellipsis stand as Long has them or are recorded
   in `../continuity.md` if touched. Update `../continuity.md` where a
   finding asks for a recorded exception (15.1, 15.3, 14.1) or where a
   recorded decision is reversed (6.1, 3.1).
4. Read `candidate-v2-readable.md` straight through for flow; note any
   chapter-level change made from that read in `changes-v1-to-v2.md`.
5. Write `../ACCEPTANCE.md` with the accepted file's sha256, the review
   round applied, findings applied / declined with reasons, the flow-read
   note, and what remains open. A second review round is only needed if the
   corrections change more than the quoted clauses.
6. Update `../../00-progress-ledger.md` and push. No merge, no deploy, no
   changes under `app/**`.
