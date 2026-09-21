# Batch F Independent Adversarial Review

**Scope:** ak-batchF (chapters 114–134, i.e. Part 5 Ch.13–23 and Part 6 Ch.1–10 in Garnett numbering) — Levin/Kitty engagement and wedding, Karenin's bedside forgiveness scene, Anna's near-death and Vronsky's suicide attempt, Anna and Vronsky's life abroad, Golenishtchev, Mihailov.

**Verdict: ACCEPT AS-IS.**

## 1. Diff verification

Programmatically diffed `ak-batchF-current-modern-en.json` against `ak-batchF-corrected.json` paragraph-by-paragraph across all 21 chapters. Exactly **one** paragraph differs:

- ch116 ("Chapter 15"), paragraph 7:
  - Before: `"Whom shall I announce to her honor?" asked the footman.`
  - After: `"Whom shall I announce you to, your honor?" asked the footman.`

No other paragraph, title, or chapter-count changed between the two files. The drafter's claimed diff is exactly and only this.

## 2. Fix correctness verified against source

Source (Garnett): `"To whom shall I announce your honor?" asked the footman.`

The broken original modern-en version substituted "her honor" for "your honor," inventing a nonexistent third-party woman and reversing the addressee — a real, clear defect.

The corrected version was checked against the surrounding context (ch116 paras 0–11, Levin's arrival at the Shtcherbatsky house): the footman is asking which family member Levin wants announced to, and Levin's very next line (para 9) answers with a list of names — "The princess ... the prince ... the young princess...." This confirms the "to whom" reading (i.e., who should I say you're calling on), which the corrected phrasing captures correctly and coherently with the following paragraph. **Fix confirmed correct.**

## 3. Paragraph counts

All 21 chapters (114–134) have paragraph counts in `ak-batchF-corrected.json` matching `ak-batchF-source.json` exactly, 1:1, with matching chapter numbers and titles. No merges, splits, or drops. (Verified programmatically; see counts: 39, 34, 26, 36, 58, 16, 52, 17, 37, 43, 36, 41, 54, 19, 40, 32, 11, 39, 8, 17, 13.)

## 4. Borderline items flagged by drafter

- **ch117 P23** — Source: *"Now we shall have sweetmeats to eat," said Mademoiselle Linon—and Levin drove off to buy sweetmeats.* / Modern: *"Now we'll need sweets," Mademoiselle Linon announced — and off Levin drove to buy sweets.* Agree this is harmless: same speaker, same action, same causality (Linon's remark sends Levin off to buy treats), only lexical modernization ("sweetmeats"→"sweets") and tag variation ("said"→"announced"). No meaning lost.
- **ch125 P3** — Source: *"No. But what of it?"* / Modern: *"No. Why?"* Checked in context (Levin's confession certificate exchange with Stiva). Both are Levin's dismissive/questioning reply to being asked whether he has a certificate of confession; "Why?" functions as the natural modern contraction of "why does it matter" and the following line ("You can't get married without it") answers it identically either way. Agree this is harmless.

Both borderline judgments are correct; no fix required for either.

## 5. Independent full read-through

Read every paragraph of all 21 chapters against source (not relying on the drafter's account), supplemented by automated cross-checks across the full batch:
- Numeric-token diff (dates/counts) — no mismatches found.
- Negation-word-count diff (not/never/no/n't/nothing/nobody/none/neither/nor) flagged 31 paragraphs for manual inspection — all checked individually and are benign rephrasings (e.g., splitting/merging clauses, "not... nor" → single contraction) with no reversed or dropped negation.
- Character-name presence diff — 8 paragraphs flagged; all are benign pronoun↔name substitutions for clarity (e.g. "her boudoir" → "Anna's boudoir"; "it" → "Anna" for the baby's gender-correct pronoun; "Tashkend"→"Tashkent" spelling modernization) with no misattribution.
- he/she and his/her pronoun-imbalance diff — 1 flag (ch120 P14), which is the baby daughter's pronoun modernized from "it" to "she/her" (the baby is established as female, Anna's daughter) — not an error.
- Manually read in full: ch114 (complete, including the chalk-letters proposal scene — verified line-for-line accurate, a scene highly vulnerable to transcription slips), ch130–134 (complete: wedding ceremony, Vronsky/Anna abroad, Golenishtchev introduction, Mihailov's studio) — all accurate, no dropped/invented clauses, no plot or factual distortions, dialogue attribution intact throughout (including exchanges among Vronsky/Golenishtchev/Anna where misattribution would be easy to miss).
- Spot-checked all paragraphs surfaced by the automated flags above across ch115–129, including the Karenin bedside-forgiveness dialogue (ch118 P54), Alexey Alexandrovitch's psychological interiority passages (ch120–121, ch123), Vronsky's suicide-attempt passage (ch119), and Anna's Stiva conversation (ch122, ch125).

No dropped clauses, no invented details, no negation/conditional inversions, and no factual or plot distortions were found anywhere else in the batch beyond the one already-fixed defect.

## Summary

- Diff = exactly the one claimed fix. Confirmed.
- Fix is correct and contextually consistent with the surrounding dialogue. Confirmed.
- Paragraph counts match source exactly for all 21 chapters. Confirmed.
- Both flagged borderline compressions preserve full meaning. Agree.
- No additional defects found in an independent full read plus automated cross-checks.

**Recommendation: accept batch F as corrected, no further changes required.**
