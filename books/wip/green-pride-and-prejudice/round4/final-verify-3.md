# Final verification — batch 3 (final-3.txt)

**Coverage:** 75 changed paragraphs in the input (45.14 – 61.12); 75 verified, and each has one entry in `final-verify-3.json`. Every CANDIDATE was checked to match `candidate.json` exactly. I also ran a mechanical scan for doubled words, doubled punctuation, double spaces, and unbalanced quotes and italics.

**Verdicts:** 74 CLEAN, 1 DEFECT, 0 REVERT.

## Non-CLEAN items

- **46.4 — DEFECT.** The repair of the turnpike clause produced "After making every possible inquiry … anxiously repeating them at all the turnpikes". Here "them" has no plural antecedent.
  Fix: `anxiously repeating them at all the turnpikes` → `anxiously repeating his inquiries at all the turnpikes`.

## Notes (not defects)

- Four paragraphs have an odd number of quote marks: 49.17, 50.18 and 52.3 (letters left open, as in the source), and 53.48 (the nested single quotes around the newspaper notice). All four are correct.
- The glosses are brief and faithful: "a London cab", "a planted grove", "Michaelmas, in the autumn", "debts of honor from gambling", "cab rank".
- The following restorations are all correct against the source: shrewish, "I hope there was", sly, Eastbourne/fifty pounds, "questioned by him", ignorance, "not quite so", "Upon my word".
- The referent fixes are correct: 46.30 Elizabeth, 53.17 Bingley, 55.20 Mr. Bennet and Bingley, 55.21 Jane, 60.27 Charlotte's, 61.12 Elizabeth's.

## Overall verdict

**ACCEPT with one fix.** After the 46.4 fix is applied, the batch passes.
