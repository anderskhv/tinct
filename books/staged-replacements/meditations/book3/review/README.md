# Book III — independent review (step 4 of `../../WORKFLOW.md`)

This directory holds the independent review of `../candidate-v1.json` (Long
1862 → modern English, Meditations III.1–III.16). The reviewer was a separate
subagent spawned by the coordinator; it did not draft the candidate and did
not consult the drafter. Nothing outside this directory was changed.

## Files

- `findings-v1.md` — one entry per paragraph B03-P001…B03-P016, in order,
  each a finding or "No material issue found."; summary table; chapter-level
  findings from the continuous read; flow judgement; verdict; coverage and
  limitations. Candidate hash `7079d32b…` recomputed with `sha256sum` and
  confirmed against `../provenance.json` and the package check in
  `../README.md`.

## Result

**Accept after corrections.** 0 substantive, 12 minor (5 "worth improving":
4.1, 6.1, 6.2, 7.1, 15.1; 7 "optional preference": 2.1, 4.2, 5.1, 6.3, 11.1,
16.1, 16.2), 8 paragraphs with no material issue (III.1, III.3, III.8, III.9,
III.10, III.12, III.13, III.14). The three dagger-marked clauses (III.3,
III.4, III.11) stand verbatim.

## What the drafter does next (steps 5–8)

1. Read `findings-v1.md`. For each of the 12 findings decide apply / decline;
   a declined finding needs a one-line reason. The "also noted, optional"
   points inside entries are not numbered findings and need no reason if
   left.
2. Write `../candidate-v2.json` (and `candidate-v2-readable.md`) from
   `candidate-v1.json` via a change script in the Book II / Book I pattern
   (`../../scripts/build_book2_v2.py`, `build_book1_v2.py`: each old string
   asserted to occur exactly once in its paragraph; per-paragraph word diff
   printed). Record every change, old and new text side by side with the
   finding ID it answers, in `../changes-v1-to-v2.md`. `candidate-v1.json`
   stays frozen.
3. Re-check each changed passage against `../source-book3.json`; confirm 16
   paragraphs, numbering intact, and that the three dagger clauses still
   stand as Long has them. Update `../continuity.md` where a finding asks for
   a recorded exception (6.1 if "contentment" is kept; 6.3 either way) or
   where a recorded decision is reversed (5.1, 16.1, III.8 "chastened").
4. Read `candidate-v2-readable.md` straight through for flow; note any
   chapter-level change made from that read in `changes-v1-to-v2.md`.
5. Write `../ACCEPTANCE.md` with the accepted file's sha256, the review
   round applied, findings applied / declined with reasons, the flow-read
   note, and what remains open. A second review round is only needed if the
   corrections change more than the quoted clauses.
6. Update `../../00-progress-ledger.md` and push. No merge, no deploy, no
   changes under `app/**`.
