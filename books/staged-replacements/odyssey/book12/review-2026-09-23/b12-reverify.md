# Book 12 re-verification — candidate-v1 → candidate-v2

**Verdict: DEFECTS FOUND** (3 findings, all non-blocking; see b12-reverify.json)

## 1. Replay
- candidate-v2.json sha256 04702b98706cef6c7534dc75195cf0b32adbdbd5e1963832a8ff7cd221729874 (matches).
- All 18 edits from b12-v1-edits.json applied in order to candidate-v1.json: every `old` exact and unique; result equals candidate-v2 paragraphs exactly; number/title unchanged.
- Changed paragraphs: 0, 6, 7, 9, 10, 11, 19, 21, 26, 33, 34, 35, 36, 37. No other paragraph differs.

## 2. Changed paragraphs vs Butler (read in full with neighbours)
- P0 "the Aeaean island": matches Butler and B10/B11 accepted. OK.
- P6 "In the middle of it": Butler exact. OK.
- P7 "vomits her waters up": Butler's "vomit forth", consistent with P19 "vomited it up". OK.
- P9 "(bad luck to her!)": restores Butler's "bad luck to her" in place of the added "curse her"; the parentheses lower the aside and the "she will keep Scylla…" clause now reads cleanly. OK.
- P10 "whose father was … whose mother was Neaera": faithful gloss of "children of … by Neaera". OK.
- P11 "At that she returned inland": GLOSSARY `whereon` → `at that`, same new-sentence shape as B04-P035/P047. "great and cunning goddess Circe" matches B10-P11 and B11-P0. OK.
- P19 "land these panting creatures on her rock and munch them up": Butler verbatim. OK.
- P21 "in despair" and "you are cruel": Butler exact. The splits and the one em dash (at Butler's semicolon) read well aloud. OK.
- P26 "fishing with hook and line, snaring birds, and taking whatever else": the split is right, but "snaring" is not Butler's ("catching birds"), and the edit grew an existing over-50 sentence (D20). Findings 1–2.
- P33 "at once": Butler exact. OK.
- P34 "raised our masts" and "fell on the head of the helmsman in the ship's stern": Butler exact. OK.
- P35 "seagulls", P37 "seawater": D15; compound_drift.py now clean (v1 failed on both).
- P36 "(which drifted about by itself)": Butler's parentheses and wording restored (ODY-RULES / PUNCTUATION §6). "ox hide" matches B02/B10. The edit grew Butler's 68-word sentence to 71 (D20). Finding 3.

## 3. Conventions and structure
- 39 paragraphs (source 39), none empty.
- Frame: every paragraph opens with one “; nested speech uses ‘ ’; the only ” closes P38. No straight quotes.
- No spaced em dashes. No "sea-gull"/"sea water"/"Aeaea" left. Every Circe epithet in the Book is "cunning", none "clever".
- scripts/checks.py 12 --version 2: gates still fail. Manifest absent (expected before freeze). Paragraphs below 0.90: 1-based P1–4 and P9, which is pre-existing and none of them edited; v2 fixes P10. D20 growth: P016, P027, P031, P037. P016 and P031 are pre-existing and unedited. P027 (57→59) and P037 (70→71) were made worse by edits; P022 was fixed by the P21 split.

## Findings (b12-reverify.json)
1. P26 "snaring birds" → "catching birds" (meaning, non-blocking).
2. P26 period at "hungry as they were; but when" to break the 59-word sentence (aloud/D20, non-blocking).
3. P36 period at "keel; but there was a backstay" to break the 71-word sentence (aloud/D20, non-blocking).

---

# Addendum: candidate-v2 → candidate-v3

**Verdict: VERIFIED CLEAN**

- The candidate-v3.json hash matches: fef04e2968ad52ce698c767a7b0df8c75c6920fb1acbc8ee6ca09ac1839517fe.
- Applying the 3 findings in b12-reverify.json to v2 gives v3's paragraphs exactly. The title and number are unchanged. Only ¶26 and ¶36 differ from v2.
- ¶26 matches Butler, read against ¶25 and ¶27. The wording is "catching birds". The full stop at "hungry as they were. But when" leaves every event and connective in place, and the sentences run 21/20/39/18/47 words.
- ¶36 matches Butler, read against ¶35 and ¶37. Butler's parenthesis "(which drifted about by itself)" is kept. The full stop falls at his semicolon, giving sentences of 33 and 38 words. No words were changed.
- Structure: 39 paragraphs, none empty. Every paragraph opens with exactly one “. Nested speech uses ‘ ’. The only ” closes ¶38. There are no straight quotes and no spaced em dashes.
- checks.py gates were not used as acceptance criteria, per the coordinator.
