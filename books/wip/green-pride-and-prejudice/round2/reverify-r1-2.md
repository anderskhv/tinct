# Re-verification r1-2: chapters 32-46

**Coverage:** The input (`reverify-r1-2.txt`) has 54 changed paragraphs, and all 54 were verified. The JSON has 54 entries. The CANDIDATE text in the input matches `candidate.json` for all 54 paragraphs. Every BASELINE/CANDIDATE difference was listed with a word-level diff and checked against the 1813 source. This includes the four edits inside Darcy's letter (35.4): the stray `_wanted_` emphasis removed, "not ideal" changed to "objectionable", "took scarcely a moment", and "this concealment, this disguise" restored.

**Verdicts:** 52 CLEAN, 2 DEFECT, 0 REVERT. No serious pre-existing fidelity defects were found.

## Non-CLEAN items

- **42.0: DEFECT (minor, readability).** The added "the disappointment his own poor judgment had brought on" is faithful to the source ("the disappointment which his own imprudence had brought on"). But it runs straight into "in the pleasures", so the reader can misparse it as "brought on in the pleasures".
  Fix: `seek comfort for the disappointment his own poor judgment had brought on in the pleasures` → `seek comfort, for the disappointment his own poor judgment had brought on, in the pleasures`
- **44.10: DEFECT (minor, style introduced by the repair).** "ventured to accept on her niece's behalf" correctly replaces the wrong "say yes for all of them". However, it makes "accept" appear three times in two lines. The source reads "engage for her attendance".
  Fix: `ventured to accept on her niece's behalf` → `ventured to promise her niece's attendance`

Both `old` strings occur exactly once in the current candidate paragraph (checked with python3).

## Notes (no action required)

- Several repairs fix real misreadings in the baseline:
  - 34.15: "self-serving" misread the source's "civil reflection".
  - 34.27: the baseline made the dislike cause the one-month judgment.
  - 34.29: the cruelty is Darcy's.
  - 36.0: the source says "no regret that satisfied her", not "the regret didn't satisfy".
  - 36.11: the family brought the contempt on themselves.
  - 40.5: "warmly in Wickham's favor", not "harshly".
  - 41.21: the baseline inverted the meaning of "hardly have found expression in their united volubility".
  - 41.25: a missing clause is restored.
  - 44.7: a missing verb is restored.
  - 44.9: the disdain is Darcy's, not his companions'.
  - 45.7: "either of them" means Darcy and Elizabeth.
  - 45.9: "his sister's own" means Georgiana.
  - 46.4: Kitty "has anger", meaning she is scolded.
- 46.4: in "After making every possible inquiry ... anxiously repeating them", "them" refers back to a singular noun. Austen's own construction is the same and it reads acceptably, so it is left as is.
- 39.13, 40.34 and 43.58 drop some of the source's italic emphasis (_his_, _could_, _I_, _surprised_). This is pre-existing and minor, so it is not flagged.

## Overall verdict

The repair set for chapters 32-46 is sound. 52 of 54 edits are clean and move the text toward the source. The two defects are small wording problems that the repairs introduced, and both have exact one-line fixes.
