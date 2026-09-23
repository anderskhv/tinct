# Independent re-verification of changed paragraphs — Pride and Prejudice (modern-en)

You are an independent verifier. A source-based review of Tinct's Modern English edition
of *Pride and Prejudice* produced repairs, which the lead screened and applied. You did
not make them; do not trust them. For EVERY changed paragraph in your input file, compare
SOURCE (Austen 1813, the sole fidelity anchor), BASELINE (before) and CANDIDATE (after),
with the neighbouring paragraphs given as context.

The edition is light touch: it should be faithful and accessible, and it keeps Austen's
irony, rhythm, social distinctions (rank, money, marriage, reputation, manners) and the
characters' voices. It uses American spelling, straight quotes and em dashes. Already-clear
prose should not be polished.

For each changed paragraph, decide:

- **CLEAN**: every difference between BASELINE and CANDIDATE moves the text toward the
  source's meaning, irony, attribution or qualification, or removes a real obstruction. The
  new wording is grammatical, fits its sentence and the edition's register, and adds nothing
  unlicensed. No new defect was introduced anywhere in the paragraph.
- **DEFECT**: an edit got the source wrong (wrong reading, wrong referent, over- or
  under-correction), introduced an addition or omission, broke grammar or punctuation (such
  as unbalanced dashes), made the text archaic or obstructive, or inconsistent with nearby
  paragraphs. Give the exact fix.
- **REVERT**: the edit is pure stylistic preference with no fidelity or accessibility value.
  Recommend restoring the baseline wording.

Also report any serious pre-existing fidelity defect you notice in the same paragraph that
the repair missed, but mark it as `"pre-existing": true`.

Input: `{{FILE}}`. Read ALL of it with the Read tool in chunks (it is large; be complete).
Wider context, if needed: `/home/user/tinct/books/wip/green-pride-and-prejudice/source.json`
and `candidate.json` (`chapters[n-1].paragraphs[i]`). Do not edit any repo file except your
outputs.

## Output (write exactly these two files)

A. `/home/user/tinct/books/wip/green-pride-and-prejudice/round4/final-verify-{{K}}.json`: a
JSON array with ONE entry for EVERY changed paragraph in your input (use this to prove
coverage):
```json
{"ch": 3, "idx": 5, "verdict": "CLEAN|DEFECT|REVERT",
 "issue": "for DEFECT/REVERT: what is wrong", "old": "exact substring now in the CANDIDATE (DEFECT only)",
 "new": "exact replacement (DEFECT only)", "pre-existing": false}
```
For DEFECT, `old` must occur exactly once in the current candidate paragraph. Check this
with python3 against `candidate.json`.

B. `.../round4/final-verify-{{K}}.md`: a coverage statement (the number of changed paragraphs
in the input and the number you verified), a list of the non-CLEAN items with reasons, and an
overall verdict.

Final message: counts per verdict and the paths.
