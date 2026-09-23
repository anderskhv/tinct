# V-assembly: independent verification of the assembly edits

**Scope:** all 13 ledger entries in rounds `assembly-typography` (8), `assembly-2` (3) and `assembly-3` (1).
- Each was checked against `source.json` and its neighbouring paragraphs.
- Each entry's `new` text is present in `candidate.json`.
- The file also covers 39.42, which the brief names. Its note text was last changed in round b13-AV, not in an assembly round.

## Findings

| Item | Result |
|---|---|
| 12.79, 33.20, 39.42 translator's notes | **Clean.** All three use `Translator's note: <text>` and carry no `[*]`. The note text matches Garnett word for word; only the trailing "--TRANSLATOR('S NOTE)" attribution was dropped, as the convention requires. The referring paragraphs 12.78, 33.19 and 39.41 have no leftover `[*]`. |
| Chapter 8 dashes (8.121, 8.123, 8.124, 8.125) | **Clean.** Chapter 8 now has 64 spaced ` -- `, with no em dashes, en dashes or unspaced `--`. The character diff of 8.124 shows only dash replacements, so no words changed. |
| Chapter 17 dashes (17.5, 17.65) | **Clean.** Chapter 17 now has 44 unspaced `—`, with no `--` and no spaced em dashes. |
| 15.48 fiancée | **Clean as edited.** Both "fiancée" (Dounia) forms are correct, and the diff shows only é added. **Defect, not blocking:** the same paragraph still has `_fiance_` without the accent. The source has `_fiancé_`, and 12.25 and 17.86 in the edition use `_fiancé_`. |
| 25.23 `_c'est de rigueur_` | **Clean.** It matches the source's italics. |
| 19.158, 20.12 "flat" | **Clean.** The source uses "flat" in 19.158, 19.159 and 20.12, and all three now agree. |
| 7.34 | **DEFECT, blocking.** |

## 7.34 (blocking)

**Source:** "Now _he_ had passed the first floor... He could hear his heavy breathing. And now the third storey had been reached. Coming here!"

- The breathing belongs to the climber, whom the source marks with the italic _he_.
- The edit restored "his", which was right in intent. But in the modern sentence "He could hear his heavy breathing", the natural reading is Raskolnikov's own breath.
- The added subject in "he had reached the third floor" also points to Raskolnikov, who is already on the fourth floor.
- The source's passive has no subject, which is what avoided this problem.

**Proposed:** "He could hear the stranger's heavy breathing. And now the third floor had been reached. Coming here!" This fixes whose breathing it is and keeps the clipped, approaching rhythm.

## Out-of-scope observations (not in the defects list)

- 16.1 and 16.66 have `_fiance_` where the source has `_fiancé_`. This is the same fix as 15.48.
- 33.19 already glosses "Wanderers — members of a religious sect —" inline, so a listener hears "a religious sect" twice when the 33.20 note is read. This does not block.

## Validation

`apply.py <defects> check --dry` reported: applied 2, rejected 0.

## Verdict

- 11 of 13 edits are verified clean. 15.48 is clean as edited, but it is in the defects list for its unaccented `_fiance_`.
- **Not ready to close:** the 7.34 fix must be applied and re-verified first.
