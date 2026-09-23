# Re-verification r2-1 (chapters 1-33)

**Coverage:** the input has 35 changed paragraphs, and all 35 were verified against SOURCE, BASELINE and CANDIDATE with their context (see `reverify-r2-1.json`). Each DEFECT `old` string was checked with python3 to occur exactly once in `candidate.json`.

**Counts:** CLEAN 29, DEFECT 5, REVERT 1.

## Non-CLEAN items

- **10.10 REVERT**: 'fix' -> 'mend' is a wording preference with no change in meaning. It now clashes with 10.11 ("I always fix my own"). Restore 'fix'.
- **16.15 DEFECT**: the edit dropped the source's pointed "he or any man". Fix: "when he or any man is valued no higher than he deserves".
- **29.37 DEFECT**: 'impertinence' became 'rudeness', which loses the irony of calling Lady Catherine's prying 'impertinence'. Fix: "so much dignified impertinence".
- **30.5 DEFECT**: "not many ... whom she did not prefer" means nearly all, and 'most' understates it. Fix: "she preferred nearly all of her acquaintances to him".
- **31.2 DEFECT**: "soon" reverses the source's "after a while", which contrasts Lady Catherine with Darcy's 'soon'. Fix: "and her Ladyship, after a while, showed the same curiosity more openly".
- **31.28 DEFECT**: the edit dropped the emphasis on _her_ and turned "just as likely to marry" into "might just as well have married". Fix: "that he might have been just as likely to marry _Miss Bingley_, had she been his relative."

## Notes on CLEAN items

- The glosses are accurate and brief: Cheapside as "the merchants' part of London" (8.15), "an urgent messenger" (8.58), "Nicholls, the housekeeper" (11.6), "card game of lottery tickets" (15.10), the card games quadrille and casino (29.40), and "with such ceremony" (31.12). The Cheapside gloss gives the trade association without spelling out the sisters' snobbery.
- The attributions and referents are correct: Mrs. Bennet speaks 13.17, Miss Bingley is the one "desperate to know" in 11.11, and the referents in 16.56, 23.15 and 31.28 are right. "Saturday of the following week" (13.14) correctly gives Saturday, November 30th.
- There is one minor pre-existing inaccuracy that is not serious: in 29.40, "thanking her for every hand he won" should be every counter or chip, because 'fish' were game counters.

**Overall:** the round is largely sound. Apply the 5 fixes and the 1 revert above.
