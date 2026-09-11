# Book VI — independent review (step 4 of `../../WORKFLOW.md`)

This directory holds the independent review of `../candidate-v1.json` (Long
1862 → modern English, Meditations VI.1–VI.59). The reviewer was a separate
subagent spawned by the coordinator; it did not draft the candidate and did
not consult the drafter. Nothing outside this directory was changed.

## Files

- `findings-v1.md` — one entry per paragraph B06-P001…B06-P059, in order,
  each a finding or "No material issue found."; a rulings section on the
  base-text points (VI.27, VI.34, VI.41, VI.49) and every bracket decision
  the drafter flagged (VI.39, VI.41, VI.43, VI.45, VI.50 ×3); summary table;
  chapter-level findings from the continuous read; flow judgement; verdict;
  coverage and limitations. Candidate hash `78fbe619…` recomputed with
  `sha256sum` and confirmed against `../provenance.json` and the package
  check in `../README.md` (re-run, all assertions pass; staged original
  `b0ecf3da…`, source extract `2384b4d0…`, PG base text `6584df7e…`); the
  three dagger marks (VI.38, VI.41, VI.50) and the six base-text points
  located by line in `../../source/pg15877-long-1862.txt`; the text state of
  Standard Ebooks' Long at the eleven bracket/defect points fetched and
  confirmed (text state only, never wording).

## Result

**Accept after corrections.** 0 substantive, 3 minor (2 "worth improving":
9.1 VI.9 "comprehends / comprehended" now reads as "understands" in the
three-way distinction; 50.1 VI.50 "[men]" is a referent supplement of the
VI.6 / VI.47 class and should be folded, not dropped under D11; 1 "optional
preference": 15.1 VI.15 "breathing in" narrows Long's "respiration"), 56
paragraphs with no material issue. All three dagger clauses stand as the
instructions require. No short section is expanded; the new glossary row
(kind) and the two extended rows (resent; the whole) are applied
consistently and read naturally.

Rulings on the flagged items: VI.50 "[not]" — **fold** (as drafted; the
sentence's sense depends on it and the rule folds Long's supplements);
VI.43 "[the earth]" — **fold** (a referent supplied, the V.8 class);
VI.45 "[neither good nor bad]" — **fold** (Long's gloss of a term the
paragraph cannot otherwise resolve); VI.41 PG "wilt not blame" — base-text
error, rightly rendered without "not" (the second half of the meditation
requires it; Standard Ebooks agrees); VI.41 dagger-bearing bracket — D11
drop is right (Long's footnote shows it is a second rendering of the same
clause); VI.39 "[sincerely]" — D11 drop is right; VI.50 "[conditionally]" —
D11 drop is right; VI.49 full stop — rightly a comma; VI.27 "After" —
rightly lowered; VI.34 "patricides" — Long's word, a real one, rightly kept.

## What the drafter does next (steps 5–8)

1. Read `findings-v1.md`. For each of the 3 findings decide apply / decline;
   a declined finding needs a one-line reason. The "also noted" points inside
   entries (VI.3, VI.35, VI.40) are not numbered findings and need no reason
   if left.
2. Write `../candidate-v2.json` (and `candidate-v2-readable.md`) from
   `candidate-v1.json` via a change script in the Book I–V pattern (each old
   string asserted to occur exactly once in its paragraph; per-paragraph word
   diff printed; the three dagger clauses asserted present in source and
   candidate). Record every change, old and new text side by side with the
   finding ID it answers, in `../changes-v1-to-v2.md`. `candidate-v1.json`
   stays frozen.
3. Re-check each changed passage against `../source-book6.json`; confirm 59
   paragraphs, numbering intact, dagger clauses as specified. Update
   `../continuity.md`: the VI.50 "[men]" line must be reclassified either
   way (a supplement folded, or a supplement declined with a reason — not a
   D11 drop), and the "Alternative renderings and labels (D11)" list and the
   "supplements folded" list adjusted to match; VI.9 needs a line if 9.1 is
   applied; VI.15 needs a line either way.
4. Read `candidate-v2-readable.md` straight through for flow; note any
   chapter-level change made from that read in `changes-v1-to-v2.md`.
5. Write `../ACCEPTANCE.md` with the accepted file's sha256, the review
   round applied, findings applied / declined with reasons, the flow-read
   note, and what remains open. A second review round is only needed if the
   corrections change more than the quoted clauses.
6. Update `../../00-progress-ledger.md` and push. No merge, no deploy, no
   changes under `app/**`. (Record note for a later pass, outside this
   book: `../../PROVENANCE.md` §3's sentence that Standard Ebooks "removes"
   Long's brackets is imprecise — for Book VI it runs some as text, keeps
   some in brackets, and omits some; `continuity.md` reports each correctly.)
