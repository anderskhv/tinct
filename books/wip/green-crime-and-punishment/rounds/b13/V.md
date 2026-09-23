# b13 verification: chapters 39–41 (Part 6 ch 8, Epilogue 1–2)

## Coverage
- Ch 39: 31 changed paragraphs checked
- Ch 40: 9
- Ch 41: 15
- Total: 55, which matches `view.py changed 39 41`

All paragraphs were compared against the source. Result: 51 verified clean, 4 with defects.

- **Accessibility items:** all 8 in `A.json` screened.
- **Epilogue:** 41.17–41.29 were also read side by side, including the unchanged 41.22, 41.23, 41.26 and 41.29, to check how the conversion is handled.
- **39.42:** checked for its label only, as instructed.

## Defects
All four are non-blocking.

1. **39.15:** "He was beginning to feel for himself that" should become "He himself was beginning to feel that".
   - "Feel for himself" reads in modern English as self-pity.
   - Source: "He began to feel himself that…"
2. **39.50:** "all the pleasures of life are _nihil est_ -- nothing --" should become "are nothing -- _nihil est_ --".
   - The current wording doubles the verb ("are is nothing").
   - The fix keeps the italic Latin and the gloss.
3. **40.9:** add the missing comma before "but" after the parenthesis "(perhaps she saw that they were pretending)".
   - The source has the comma.
4. **41.16:** "good; could not decide whom to blame" should become "good; they could not decide whom to blame".
   - The restored clause left a clause with no subject after the semicolon.

Every other restoration is faithful and grammatical. These include:
- the omissions in 39.0, 39.7, 39.8, 39.22, 39.46 and 40.3
- the hesitations in 39.41, 39.63 and 39.65
- the certainty fixes: 39.74 "It seemed to him", 40.1 "not quite like", 40.3 "perhaps partly", 41.8 "dimly aware", 41.10 "would never have admitted" and 41.24 "It had even seemed to him"
- the italics in 39.83, 41.0, 41.3, 41.5, 41.15, 41.25 and 41.28

The names are in Garnett forms throughout.

**Epilogue:** the conversion is neither earlier nor more certain than in the source.
- **41.21:** the invented "loved her, loved her" is gone and the sentence trails off as in the source.
- **41.24:** "fancied" is now rendered as "It had even seemed to him".
- **41.25:** "could not think about anything for long" (duration) replaces "coherently".
- **41.27:** keeps the question, "Can't her convictions be mine now?", and the sentence trails off.
- **41.28:** keeps "_only_" and the cost still to come.
- **41.29:** keeps "might be the subject of a new tale".
- **41.23:** "he had risen again, and he knew it" matches the source.

## Accessibility verdict summary
- **Accepted (5):**
  - #2: 39.42 becomes "Translator's note:". It is Garnett's footnote and stays for alignment; the new label marks it clearly as editorial.
  - #4: 40.3 names the student who supported his father.
  - #5: 40.9 names Dounia as the sleep-talker.
  - #6: 40.11 reorders the sentence to remove the garden-path reading.
  - #7: 41.20 glosses "burnous" as "burnous cloak".
- **Modified (1):**
  - #1: 39.21 becomes "turned off his path, and crossed the bridge toward the Hay Market". "Crossed it" would still point "it" at "his path".
- **Rejected (2):**
  - #0: 39.18 "Couldn't he…" is the source's own shift to "he"; the proposal changes it to "I".
  - #3: 39.75 "peasant" versus the earlier "porter" is an inconsistency in the source and should not be corrected.

All defect `old` strings and the accepted and modified `old` strings apply cleanly together: `apply.py … check --dry` applied 10 and rejected 0. None of them overlap.

## Verdict
CLEAN AFTER CORRECTIONS
