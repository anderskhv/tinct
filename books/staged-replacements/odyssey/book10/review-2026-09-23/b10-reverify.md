# Book 10 candidate-v2: independent re-verification

**Verdict: DEFECTS FOUND.** Two are blocking and one is non-blocking. The findings are in `b10-reverify.json`.

## 1. Diff and replay
- The candidate-v2.json sha256 is 573655551b0f68ad1123d270c1aa58093fdaa6f09a67eda672ab0e0ff91a8734, which matches the expected 57365555… prefix.
- All 22 `old` strings in b10-v2-edits.json are exact and occur once in candidate-v1.json. Applying them in order gives paragraphs identical to candidate-v2.json.
- The changed paragraphs are exactly ¶0, 1, 3, 7, 11, 12, 13, 21, 22, 28, 29, 37, 38, 39, 42, 43 and 45: 17 paragraphs and 22 edits. `number` and `title` are unchanged, and nothing else differs.

## 2. Fidelity, glosses, flow and conventions
- ¶12 has "a fathom or so—about six feet—of". The gloss is correct and uses unspaced dashes. "carry on my shoulder while steadying him with one hand" keeps Butler's sense and Homer's: a one-handed shoulder carry was impossible, so he carried the stag round his neck.
- ¶43 has "a cubit or so—roughly eighteen inches—in length". The gloss is correct and matches the GLOSSARY and WORKFLOW model.
- ¶13 prints the dawn formula as "When Dawn, the rosy-fingered child of morning, appeared,". This is identical to book09/candidate-v2.json (for example "When Dawn, the rosy-fingered child of morning, appeared, I told my men…") and to book05/candidate-v3.json ("When Dawn, the rosy-fingered child of morning, appeared, Odysseus put on…"), and it matches the GLOSSARY Book 2 row.
- ¶0 restores "(as it were)" as PUNCTUATION §6 requires. "with an iron-bound wall that encircles it" is faithful.
- These edits are faithful and read naturally aloud: ¶1 (paths; stir up or calm), ¶3 (the evil advice won out), ¶7 "the one leaving" (the one driving his flock out), ¶29 (mute), ¶28 (pitcher, as B01 and B04 print it), ¶45 (belt, told).
- These edits match the conventions and fixed formulas: ¶11 (thought it best, GLOSSARY row), ¶37 (woolen), ¶39 (the covered gallery, GLOSSARY row).
- ¶38 "a whole year" is accurate and reads well with the next sentence, "when the year had passed". The edit's stated reason cites the accepted rendering "twelve months" but applies "year". This is not a defect, because the GLOSSARY bans only the dead form.
- ¶22 "strip you of your manhood and leave you helpless" keeps the sexual threat. "helpless" moves Butler's "fit for nothing" (useless) slightly toward powerless. It is within the range of the Greek, so it is noted here but not raised as a defect.

### Defects
1. **¶7 (blocking, convention).** "double wages — one wage as a herdsman of cattle, another as a shepherd" adds a dash where Butler has a comma and spaces it. No other text paragraph in Books 1–10 uses a spaced em dash; every file's single spaced dash is the title's. The added "wage" already removes the two-men misreading. Fix: "double wages, one wage as a herdsman of cattle and another as a shepherd".
2. **¶42 (blocking, convention).** Butler's "(which is a branch of the river Styx)" became " — a branch of the river Styx — ". The dashes are spaced, and the aside is cut down to a phrase, which PUNCTUATION §6 says keeps its parentheses. This is the rule this same round used to restore ¶0. Fix: "Cocytus (which is a branch of the river Styx) flow into the river Acheron", which keeps the accurate "the river" gloss.
3. **¶21 (non-blocking, voice).** "in the first bloom of his youth and beauty, with the first soft beard just coming on his face" says "first" twice, and Butler does not. Suggested: "with a soft young beard just coming on his face".

## 3. Structure
- There are 49 paragraphs, the same count as source-book10.json, and none is empty.
- The JSON is valid, and the title "Book 10 — Aeolus, the Laestrygones, Circe" is unchanged.

---

# Book 10 candidate-v3: re-verification of the three fixes

**Verdict: VERIFIED CLEAN.**

- The candidate-v3.json sha256 is 529e49dddfeef32d43b65a2c691d3d4d086b4422a3a6cb20b32b2616dd6fa151, which matches the expected 529e49dd… prefix.
- **Diff:** applying the three findings in b10-reverify.json to v2 reproduces v3 exactly. The changed paragraphs are only ¶7, ¶21 and ¶42. `number` and `title` are unchanged.
- **¶7** now reads "might earn double wages, one wage as a herdsman of cattle and another as a shepherd, for they work…". This restores Butler's comma, keeps the two-jobs clarification and reads well with ¶6 and ¶8.
- **¶21** now reads "with a soft young beard just coming on his face". The doubled "first" is gone, and the meaning matches Butler's "the down just coming upon his face". Minor observation, not a defect: "young" now appears in "young man", "youth" and "young beard". The first two are Butler's own.
- **¶42** now reads "Cocytus (which is a branch of the river Styx) flow into the river Acheron". Butler's parentheses and wording are restored, which is consistent with PUNCTUATION §6 and ¶0. The gloss "the river" is accurate.
- **Whole book:** no paragraph has a spaced em dash or a double space.
- **Structure:** there are 49 paragraphs, the same as the source, with none empty. The JSON is valid.
