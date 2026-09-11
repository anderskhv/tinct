# Book IV — independent review (step 4 of `../../WORKFLOW.md`)

This directory holds the independent review of `../candidate-v1.json` (Long
1862 → modern English, Meditations IV.1–IV.51). The reviewer was a separate
subagent spawned by the coordinator; it did not draft the candidate and did
not consult the drafter. Nothing outside this directory was changed.

## Files

- `findings-v1.md` — one entry per paragraph B04-P001…B04-P051, in order,
  each a finding or "No material issue found."; summary table; chapter-level
  findings from the continuous read; flow judgement; verdict; coverage and
  limitations. Candidate hash `d85924d1…` recomputed with `sha256sum` and
  confirmed against `../provenance.json` and the package check in
  `../README.md`; the ten dagger marks (IV.18, IV.19 ×3, IV.30, IV.34,
  IV.46 ×2, IV.50, IV.51) located in `../../source/pg15877-long-1862.txt`.

## Result

**Accept after corrections.** 0 substantive, 8 minor (2 "worth improving":
19.1, 33.1; 6 "optional preference": 1.1, 3.1, 4.1, 22.1, 40.1, 44.1), 43
paragraphs with no material issue. All nine named dagger clauses stand
verbatim. No short section is expanded; the five Book IV glossary rows are
applied consistently and read naturally.

## What the drafter does next (steps 5–8)

1. Read `findings-v1.md`. For each of the 8 findings decide apply / decline;
   a declined finding needs a one-line reason. The "also noted" points inside
   entries are not numbered findings and need no reason if left.
2. Write `../candidate-v2.json` (and `candidate-v2-readable.md`) from
   `candidate-v1.json` via a change script in the Book II / I / III pattern
   (each old string asserted to occur exactly once in its paragraph;
   per-paragraph word diff printed; the nine dagger clauses asserted present
   in source and candidate). Record every change, old and new text side by
   side with the finding ID it answers, in `../changes-v1-to-v2.md`.
   `candidate-v1.json` stays frozen.
3. Re-check each changed passage against `../source-book4.json`; confirm 51
   paragraphs, numbering intact, dagger clauses verbatim. Update
   `../continuity.md` where a finding asks for a recorded decision (22.1
   either way) or where a recorded decision is reversed (1.1, 33.1, 40.1,
   44.1 each reverse a line in the paragraph-level decisions).
4. Read `candidate-v2-readable.md` straight through for flow; note any
   chapter-level change made from that read in `changes-v1-to-v2.md`.
5. Write `../ACCEPTANCE.md` with the accepted file's sha256, the review
   round applied, findings applied / declined with reasons, the flow-read
   note, and what remains open. A second review round is only needed if the
   corrections change more than the quoted clauses.
6. Update `../../00-progress-ledger.md` and push. No merge, no deploy, no
   changes under `app/**`.
