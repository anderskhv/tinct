# Book 19 re-verification (candidate-v1 → candidate-v2)

**Verdict: DEFECTS FOUND.** There is 1 blocking defect and 4 non-blocking ones. The findings are in `b19-reverify.json`.

## 1. Replaying the edits
- All 39 edits from `b19-v1-edits.json` were applied to `book19/candidate-v1.json`. Each `old` string occurred exactly once. The result equals `candidate-v2.json` (sha256 9ace0c4f48fd…) paragraph for paragraph.
- The title and keys did not change. Only `paragraphs` differs, so AFTER is BEFORE plus exactly these edits.

## 2. The changed paragraphs, read against Butler
Paragraphs checked: 0, 1, 7, 8, 9, 10, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 24, 25, 27, 33, 35. Each was read in full with its neighbours.
- **¶0.** The passage from "Make some excuse" to "tempts people to use them" is character-for-character identical to accepted B16-P27. OK.
- **¶8.** Butler's two warnings stay separate: falling out of favor with her mistress, and Odysseus coming home ("beware of Odysseus coming home"). The earlier misreading, where she was told to prevent his return, is gone. The paired dashes stand where Butler has a semicolon, and they help the listener. One gap is left: Butler's "lest you **too** come to lose that pride" has no "too". This is non-blocking.
- **¶13. BLOCKING.** The edits aligned the frame, the needlework, "the hero Laertes" and the pall. The quoted speech still differs from accepted B02-P005's rendering of the same Butler words:
  - "is dead, it's true" where B02 has "is indeed dead"
  - "because I wouldn't want … to perish" where B02 has "for I would not have … perish"
  - "ready for when death comes to take him" where B02 has "ready for the time when death takes him"
  - "the women here would talk if he were laid out" where B02 has "the women of the place will talk if he is laid out"

  The proposed fix is the B02 text verbatim, keeping Butler's Book 19 "my skill". ¶0 was made to match B16 verbatim in the same way.
- **¶12.** The dangling "sitting here in your house, ask me…" now attaches to Penelope; Butler has "as I sit". Separately, "learn my family and my homeland" should render Butler's "race and family". Both are non-blocking.
- **Formulas.**
  - Dawn at ¶27 matches the edition form.
  - "Furthermore I say—and take my words to heart—" at ¶16 and ¶35 matches B11-P37 and B16-P27.
  - ¶30 has an unchanged instance of the same formula in Butler ("furthermore let me say, and lay my saying to your heart"). It is rendered "and let me say this too, and take it to heart:". Non-blocking consistency finding.
- **Possessive.** "Odysseus's" appears at ¶21 and ¶27. No bare "Odysseus'" is left anywhere in the Book.
- **Other edits.** These are all accurate and read naturally aloud:
  - "do good deeds", "would dare", "you are like some blameless king" and "his virtues" (¶12)
  - "of all men, you are the only one" (¶22)
  - "cauldron", "perjurer" and the Autolycus/Hermes pronouns (¶24)
  - "am called Aethon", "So it was", "contributions" and the split Amnisus sentence (¶14)
  - "Odysseus had enough of it" and "the crew was found" (¶18)
  - "props a ship is built on" and "empty" (¶35)
  - "forsworn" (¶20), "briefly" (¶33) and "came by the scar" (¶27)
  - "Penelope. "If" (¶19), "waiting woman" (¶10), "room" (¶1)
- **Sentence length.** No changed paragraph has a longest sentence longer than Butler's, except ¶10, at 37 words against 36, which is trivial.
- **Conventions.**
  - No Roman names, straight quotes, spaced dashes or British spellings remain.
  - "gallery" is used for the cloister, as the glossary requires.
  - "finer sacrifices" for hecatombs follows the D3 form.

## 3. The whole Book
All 39 paragraphs were read against the source. The Book reads as natural, idiomatic modern English and suits reading aloud. Register and contractions are consistent. There is no summarising or softening; "sluts" and "hussies" are kept, as is the threat to kill the other women. Apart from the items above, there are no fidelity defects.

## 4. Structure
- There are 39 paragraphs, matching the source, and none is empty.
- For every paragraph, the counts of “ ” ‘ (opening single quotes) match the source.
- ¶25 keeps ‘Odysseus,’.

---

# Re-verification of candidate-v3 (sha256 6c6fdf17…)

**Verdict: DEFECTS FOUND.** There is one blocking punctuation defect, and my own ¶30 proposal caused it. The finding is in `b19-reverify-v3.json`.

- **Diff.** Applying the 5 findings from `b19-reverify.json` to v2 gives exactly v3. Only ¶8, ¶12, ¶13 and ¶30 changed. Only `paragraphs` differs; the title and keys are unchanged.
- **¶13.** From "Odysseus is indeed dead" to "without a pall." the quoted speech is identical to B02-P005, apart from Butler's Book 19 "my skill". The formal register reads correctly as Penelope quoting what she once told the suitors.
- **¶8.** "be careful that you too don't lose" restores Butler's "too". The two warnings stay separate, and the paragraph reads well with ¶7 and ¶9.
- **¶12.** "as I sit here in your house" and "my lineage and my family" are both correct and read naturally.
- **¶30. DEFECT.** The v3 text is "furthermore let me say—and take my words to heart— when heaven…". The closing em dash is followed by a space because my `old` string ended at the colon, and the space after the colon survived. The fix is "heart—when heaven". Apart from this, the formula matches ¶16 and ¶35. There is no other spaced dash anywhere in the Book.
- **Structure.** There are 39 paragraphs and none is empty. The counts of “ ” ‘ match the source in every paragraph, and ¶25 keeps ‘Odysseus,’.

---

# Re-verification of candidate-v4 (sha256 06a6c113…)

**Verdict: VERIFIED CLEAN.**

- **Diff.** Applying the single finding in `b19-reverify-v3.json` to v3 gives exactly v4. Only ¶30 changed, and only `paragraphs` differs; the title and keys are unchanged.
- **¶30.** It now reads "…furthermore let me say—and take my words to heart—when heaven has delivered…". The dashes are unspaced, and the formula matches ¶16 and ¶35.
- **Dashes.** No paragraph has a spaced em dash, en dash or hyphen. The only spaced dash is in the title's "Book 19 — …" heading, which the check excludes.
- **Structure.** There are 39 paragraphs and none is empty. The counts of “ ” ‘ match the source in every paragraph, and ¶25 keeps ‘Odysseus,’.
