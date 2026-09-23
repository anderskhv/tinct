# b09 verification: chapters 26–29

## Coverage
- Changed paragraphs checked against the source, all of them with no sampling: ch 26: 27, ch 27: 41, ch 28: 14, ch 29: 17. **Total 99**, which equals `view.py changed 26 29`.
  - 98 are verified clean.
  - 1 has a defect.
- Accessibility items screened: **10 of 10**.

### Lead-policy checks
- **27.2:** "Why on earth was I such a Jew?" matches the source ("why on earth was I such a Jew?"), which restores the period language. The surrounding restorations match the source: "look at them! Foo!", "better and... stronger!" and "?... H'm!".
- **Porfiry's and Luzhin's "he-he":** every restored instance is in the source, one for one. There are 16 occurrences in 15 paragraphs:
  - 26.38, 26.43, 26.60, 26.62 (×2)
  - 27.12, 27.14, 27.16, 27.18, 27.24, 27.31, 27.33, 27.35, 27.41, 27.44, 27.72

  The ledger has 17 he-he reason lines for these, because 26.62 carries two and 27.12's reason cross-lists the others. No he-he in the candidate lacks a source counterpart in ch 26–29.
- **28.34 "_gold_" / "_Geld_":** the source reads "_gold_", so it stays. Accessibility item 5 is rejected.
- **27.90 (the Pushkin expression):** the candidate's "That hateful, military, Pushkin expression" matches Garnett ("That horrid, military, Pushkin expression"). Garnett's 27.88 says "to be made a fool of" and never mentions horns, so adding "horns" (item 2) goes beyond the fidelity anchor and is rejected. For information: the Russian original's 27.88 does say "wear horns", which Garnett softened.

## Defects
1. **27.21 (syntax, blocking).** The hesitation repair left a doubled word: "left her family and and... devoted... herself". Correction: "left her family and... devoted... herself". This matches the source: "when she left her family and... devoted... herself".

There are no other defects. Every other restoration matches the source. This covers the hesitations and ellipses, the italics, "Ach"/"Tfoo"/"Pfoo", the repetitions, the qualification and certainty repairs, and the invented material that was removed:
- "caught himself" (26.34)
- "a real risk" (26.68)
- "notorious" (27.5)
- "degrading" (27.30)
- "beneath me" (29.8)
- "clearly" (29.52)

Each repair keeps the surrounding sentences grammatical.

## Accessibility verdict summary
| # | Where | Verdict | Note |
|---|---|---|---|
| 0 | 26.67 | accept | The "he" who showed his hand is Porfiry in the source. |
| 1 | 27.4 | accept | Madame Lippevechsel is Amalia Ivanovna; both names are in the source paragraph. |
| 2 | 27.90 | reject | "horns" is not in Garnett. |
| 3 | 28.28 | modify | New text: "always went with his hands in pockets", the source's exact words, which set up the joke. |
| 4 | 28.29 | reject | The source's plain wording works once item 3 is applied; the proposal adds an explanation. |
| 5 | 28.34 | reject | The source's word is "_gold_". |
| 6 | 29.32 | modify | New text: "You — took it? How stupid". This keeps the source's words and makes the incredulity audible without adding "As if you would". |
| 7 | 29.32 | modify | New text: "She has the yellow passport", the source's word (compare 2.15). |
| 8 | 29.64 | modify | New text: "...your room, and that consequently on that very same day", the source's construction. |
| 9 | 29.70 | accept | The speaker is Lebeziatnikov, which is factual and helps listeners. |

Totals:
- accept: 3
- modify: 4
- reject: 3

None of the accessibility items overlaps the defect. The one defect and all 7 accepted or modified items pass a dry run with `apply.py ... check --dry`, with 0 rejected.

## Verdict
**CLEAN AFTER CORRECTIONS.** One blocking correction is needed, at 27.21.
