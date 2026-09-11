# Book V — independent review (step 4 of `../../WORKFLOW.md`)

This directory holds the independent review of `../candidate-v1.json` (Long
1862 → modern English, Meditations V.1–V.36). The reviewer was a separate
subagent spawned by the coordinator; it did not draft the candidate and did
not consult the drafter. Nothing outside this directory was changed.

## Files

- `findings-v1.md` — one entry per paragraph B05-P001…B05-P036, in order,
  each a finding or "No material issue found."; a rulings section on the
  five base-text defects (V.1, V.5, V.15, V.29, V.32) and the V.28 bracket;
  summary table; chapter-level findings from the continuous read; flow
  judgement; verdict; coverage and limitations. Candidate hash `9b061974…`
  recomputed with `sha256sum` and confirmed against `../provenance.json` and
  the package check in `../README.md`; the seven dagger marks (V.9, V.12 ×4,
  V.28 ×2) and the five defects located by line in
  `../../source/pg15877-long-1862.txt`.

## Result

**Accept after corrections.** 0 substantive, 5 minor (3 "worth improving":
1.1, 26.1, 36.1; 2 "optional preference": 10.1, 33.1), 31 paragraphs with
no material issue. All four named dagger clauses stand verbatim. No short
section is expanded; the two new glossary rows (feelings; form / matter) and
the two extended rows are applied consistently and read naturally.

Rulings: V.15 "snowed", V.29 "them art" and V.32 "though all time" are plain
scan/printing errors and the evident word is right in each; V.5 "formed from
them" → "for them" is the right call though the error's nature is open;
V.1 "rather than to perfect" is **not** a defect (read as "prefer neither X
nor Y to Z") and the `continuity.md` note should say so; V.28's bracketed
fragment is Long's literal translation of a corrupt passage (his footnote
says so), is text and not D11 apparatus, and is correctly kept verbatim
without the brackets.

## What the drafter does next (steps 5–8)

1. Read `findings-v1.md`. For each of the 5 findings decide apply / decline;
   a declined finding needs a one-line reason. The "also noted" points inside
   entries are not numbered findings and need no reason if left.
2. Write `../candidate-v2.json` (and `candidate-v2-readable.md`) from
   `candidate-v1.json` via a change script in the Book I–IV pattern (each old
   string asserted to occur exactly once in its paragraph; per-paragraph word
   diff printed; the four dagger clauses and the V.29 ellipsis asserted
   present in source and candidate). Record every change, old and new text
   side by side with the finding ID it answers, in `../changes-v1-to-v2.md`.
   `candidate-v1.json` stays frozen.
3. Re-check each changed passage against `../source-book5.json`; confirm 36
   paragraphs, numbering intact, dagger clauses verbatim. Update
   `../continuity.md`: the V.1 "rather than to perfect" note (rulings), and
   any line a finding reverses (1.1 reverses the "vain man" line; 36.1 needs
   a line either way).
4. Read `candidate-v2-readable.md` straight through for flow; note any
   chapter-level change made from that read in `changes-v1-to-v2.md`.
5. Write `../ACCEPTANCE.md` with the accepted file's sha256, the review
   round applied, findings applied / declined with reasons, the flow-read
   note, and what remains open. A second review round is only needed if the
   corrections change more than the quoted clauses.
6. Update `../../00-progress-ledger.md` and push. No merge, no deploy, no
   changes under `app/**`.
