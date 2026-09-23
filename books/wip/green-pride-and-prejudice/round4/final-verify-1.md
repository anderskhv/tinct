# Final verify, batch 1 (final-1.txt)

**Coverage:** The input has 74 changed paragraphs, and all 74 were verified (chapters 1 to 24). Each has one entry in `final-verify-1.json`.

**Verdicts:** 73 CLEAN, 1 DEFECT, 0 REVERT. No pre-existing defects were flagged.

## Non-CLEAN items
- **[16.20] DEFECT.** The repair produced "disappointing his father's hopes and disgracing his memory". Here "his memory" can be read as Darcy's own memory. The baseline was clear ("his father's memory"). Fix: "disappointing the hopes and disgracing the memory of his father", which is also the source's own construction.

## Notes on checked edge cases (all CLEAN)
- **7.0.** The single em dash runs to the end of the sentence, so it is balanced. The entail gloss is brief.
- **8.15.** The Cheapside gloss and the [6.8] "card game" gloss are brief and faithful.
- **13.17.** The added "said Mrs. Bennet" is needed. The previous paragraph is Mr. Bennet speaking, and without it the line reads as his.
- **13.14.** "until Saturday of the following week" is a correct reading of "Saturday se'nnight following".
- **18.58.** "a week ago yesterday" is correct for "yesterday se'nnight".
- **21.2.** The `_had_` italics are balanced.
- **22.1.** Removing the scare quotes matches the source.
- **15.10.** "card game of lottery tickets" is slightly heavy but correct.
- No doubled words or doubled punctuation were found at any splice.

**Overall:** The batch passes once the one-line fix at 16.20 is applied.
