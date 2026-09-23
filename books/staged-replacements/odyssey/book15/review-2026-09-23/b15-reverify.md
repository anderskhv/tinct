# Book 15 re-verification: candidate-v1 → candidate-v2

**Verdict: DEFECTS FOUND** (1 blocking defect at ¶9; the finding is in `b15-reverify.json`)

## 1. Replay
- candidate-v2.json sha256 `af8b505a75bcdb142a8ce286f1b6682ba009023513a69bacb2aed6c684871216`, which matches the stated `af8b505a…`.
- I applied all 29 edits from `b15-v1-edits.json` to candidate-v1 in order. Each `old` string occurred exactly once. The result is identical to candidate-v2 paragraph for paragraph, and the metadata (number, title) is unchanged.
- The paragraphs that differ between v1 and v2 are exactly the edited set: 0, 1, 9, 10, 12, 15, 17, 19, 21, 24, 37, 38, 40, 42, 43. No change was made outside the edits.

## 2. Changed paragraphs read against Butler
- **¶9: DEFECT.** Edit 25 changed "from Helen’s hand—it’s for your bride" to "from my own hand—the hand of Helen—it’s for your bride". The new dash combines with the existing one, so the two dashes read as a pair around "the hand of Helen". Without the aside, the sentence is "from my own hand it’s for your bride …", a run-on. Where Butler has a semicolon, the draft needs a full stop: "…from my own hand—the hand of Helen. It’s for your bride…". Keeping Helen's naming of herself is faithful.
- **¶19:** The gloss "Eos, goddess of the dawn, enthroned in gold" is accurate. Butler's Aurora becomes Eos under D5 (widened), and Eos appears in no other accepted Book, so this is its first use. "Polypheides quarreled with his father" correctly resolves Butler's "He": Polypheides left for Hyperesia after quarrelling with Mantius. "seer" ×2, "in great distress of mind" and "a woman’s gifts" all restore Butler's own words. The sentence lengths stay at or below Butler's.
- **¶21:** "as surely as he ever lived" restores Butler's oath.
- **¶15:** "lashed his horses" and "lashed his horses on, and they flew forward readily enough" agree with accepted Book 3 (B03-P036, "readily enough"). "The yoke swayed on their necks" keeps Butler's image. Accepted Book 3 has "swaying the yoke upon their necks", which is a different wording of the same image and a stylistic choice, not a defect. The dawn formula matches the accepted wording.
- **¶1 and ¶38:** "a fair wind" matches ¶24 and accepted Books 2–5 and 11–12. The other ¶1 edits ("in spite of you", "another matter you had better attend to", "I hardly think") are faithful and grammatical.
- **¶24:** "ropes of twisted ox hide" is word for word accepted B02-P033. "ox hide" is open, as in Books 10, 12 and 14. "At this he took" has no comma.
- **¶12, ¶38, ¶43:** the connectives follow the GLOSSARY rows: whereon → "At that" (¶12, ¶38) and On this → "At this" (¶24, ¶38, ¶43). Each Butler instance in the Book is rendered once, and none is followed by a comma. "his right" (¶12) correctly keeps Butler's his/their distinction. "as his attendants" (¶38) is accurate to "as being in attendance on him". "murdered" (¶37), "dinner" (¶40), "however" (¶42), "goblet" (¶10), "unhappy" (¶0) and dropping "himself" (¶17) all restore Butler's words.
- The em dashes are unspaced and the quotes are curly throughout. No edit makes a sentence longer than Butler's, and most are shorter.

## 3. Quotation structure, ¶32–38
¶32–37 each open with “ and have no closing outer quote, since Eumaeus's tale continues across the break (PUNCTUATION §2). The nested ‘…’ speeches in ¶34–37 each open and close within their paragraph, and ¶37 opens with “‘. ¶38 opens with “At this… and closes the tale with ”. The structure is correct.

## 4. Structure
48 paragraphs, the same as the source, and none is empty.

---

# Addendum: candidate-v2 → candidate-v3 (the ¶9 fix)

**Verdict: VERIFIED CLEAN**

- candidate-v3.json sha256 `804bc035dd8440e5457bf590e3cd8e1af9c74760f59bd6f90b6a430891d1cad5`, which matches the stated `804bc035…`. The metadata is unchanged from v2.
- Only ¶9 differs from v2. It equals v2 ¶9 with the proposed replacement applied exactly once: "from my own hand—the hand of Helen. It’s for your bride".
- I read ¶9 against Butler ("a keepsake from the hand of Helen; it is for your bride to wear upon her wedding day"). The full stop takes the place of Butler's semicolon, and the dash now opens a single aside that the full stop closes. The run-on is gone, and Helen still names herself. ¶8 (Helen stands ready with the robe) leads into it and ¶10 ("So saying, she gave him the robe") follows on without a break. The quotation marks are curly and the dash is unspaced.
- Structure: 48 paragraphs, the same as the source, and none is empty.
- The defect in b15-reverify.json is resolved in v3.
