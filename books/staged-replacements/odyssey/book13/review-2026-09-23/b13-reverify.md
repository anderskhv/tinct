# Book 13 re-verification (candidate-v1 → candidate-v2)

**Verdict: DEFECTS FOUND** (2 defects, both non-blocking; details in `b13-reverify.json`)

## 1. Replay
- I applied all 24 edits in `b13-v1-edits.json` to `book13/candidate-v1.json` (sha256 541ee0d3…). Each `old` string occurs exactly once in its paragraph.
- The result is identical to `book13/candidate-v2.json` (sha256 d4bc1f51c22d967b…, confirmed). `number` and `title` are unchanged.
- Changed paragraphs: 1, 3, 5, 6, 7, 8, 9, 10, 18, 19, 20, 24, 25, 27, 31, 33, 36. This is exactly the set the edits touch, so nothing else changed.

## 2. Structure
- 38 paragraphs, none empty. The source also has 38.

## 3. Changed paragraphs read against Butler
Formulas and conventions checked against the accepted Books:
- "the weary sea" (¶8, ¶24): "both on the field of battle and on the waves of the weary sea" is word for word the accepted B08 ¶13.
- "the sounding sea" (¶20) matches accepted B06 ¶15.
- "escort" (¶3, ¶19) matches Books 6, 7, 8 and 11. It also matches B13 ¶7 ("escort him to his ship").
- "mixing-bowls" (¶9) matches PUNCTUATION.md §compounds and Books 1–4, 9 and 11.
- "drink offerings" stays open, as PUNCTUATION.md allows.
- "the old merman Phorcys" is now the same in ¶9 and ¶27.
- "me, who have always been with you" (¶25): the verb agrees with "me" and is Butler's construction.
- Em dashes are unspaced. No spaced dashes or en dashes were introduced. The edits add no parentheses and none were needed. There are no straight quotes, and the quotation structure is intact.
- No edit made a sentence noticeably longer than Butler's. The ¶18 split shortens one.
- These edits are faithful: ¶1 "worked gold"; ¶6 "lay their hands on you"; ¶7 "the pierced stone it had been tied to"; ¶8 "racing over the course"; ¶9 "there is always water within"; ¶10 "half her own length"; ¶25 "Bear everything and endure"; ¶27 "shifty" and "grieving for you in vain"; ¶31 "lay hands on" and "lording it in your house"; ¶33 "beech nuts"; ¶36 "a bag all in holes" and "an untanned deerskin".

## Defects
1. **¶5, aloud, non-blocking.** Edit 9 inserted "that live in heaven" in front of "from where they sat". Read aloud, it sounds as if the gods are the ones sitting. Fix: move "from where they sat" in front of "to the blessed gods".
2. **¶18, addition, non-blocking.** Edit 21 split the sentence into "She wanted to tell him everything herself, without…". "herself" is not in Butler, and the new sentence is no longer tied to the fog, which is the purpose of both of Butler's clauses. Fix: "She also wanted to tell him everything without…".

## Observation (not a defect)
- ¶33 now says "beech nuts". The accepted Book 10 v4 (¶17) keeps "beech mast". The word is not on GLOSSARY's list of recurring words the edition holds steady, and the gloss is accurate. Harmonise later only if the edition wants one term.

---

# Addendum: candidate-v3 (built from v2, edits in b13-reverify2.json)

**Verdict: VERIFIED CLEAN**

- The sha256 of `book13/candidate-v3.json` is 6c33bc2d965f4dcd6dea69de2f1d06880d80e3f36473b85771e2b9a4e985cc3f, which matches the stated hash.
- I replayed the 3 edits in `b13-reverify2.json` on v2. Each `old` string occurs exactly once in its paragraph, and the result is identical to v3. Only ¶5, ¶18 and ¶33 differ from v2. `number` and `title` are unchanged.
- There are 38 paragraphs, none empty, which matches the source.
- **¶5:** "The others poured their drink offerings from where they sat to the blessed gods that live in heaven," now attaches the seats to the people pouring, as Butler's "each from his own seat" does. Butler's epithet for the gods is kept, and the paragraph reads cleanly after ¶4 (Alcinous's order to Pontonous) and before ¶6.
- **¶18:** "She also wanted to tell him everything without his wife, fellow citizens, or friends recognizing him…" ties this purpose back to the fog, as Butler does. The added "herself" is gone. The paragraph reads naturally after ¶17 and before ¶19.
- **¶33:** "beech mast" (two words, open) matches the accepted Book 10 v4 ¶17 exactly and renders Butler's "beechmast" faithfully. The sentence is otherwise unchanged.
- No dashes, quotation marks or parentheses changed. No new defects.
