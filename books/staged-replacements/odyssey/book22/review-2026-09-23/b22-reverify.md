# Book 22 re-verification (candidate-v1 → candidate-v2)

**Verdict: DEFECTS FOUND** (2 defects, both non-blocking; details in b22-reverify.json)

## 1. Replaying the edits
- candidate-v2.json sha256 is 0408b9155d370d974aaf93e8a48c57cd19f5baecb052348cc297ee3124ba787f, which matches the hash given.
- I applied all 34 edits from b22-v1-edits.json to candidate-v1 in order. Every `old` string was present and unique in its paragraph.
- The result is byte-identical to candidate-v2's paragraphs. All other keys (number and title) are unchanged.
- The edits touch 22 paragraphs: 0, 1, 4, 5, 10, 11, 13, 14, 15, 18, 19, 20, 23, 25, 26, 28, 29, 33, 34, 42, 47 and 49.
- The accessibility edits add only the names: "at Odysseus" at ¶25 and "Agelaus, " at ¶29.
- One formatting slip in the edits file: edit 33 uses the category "consistency", which is not in the ODY-RULES list. It has no effect on the text.

## 2. Reading against the source
- **¶47 "vitals":** restored. The text now reads "drew out his vitals and gave them raw to the dogs". It follows Butler's verbs, is not softened, and the sentence is grammatical.
- **¶23 speech tag:** restored as "“Odysseus,” she said, “your strength". "very angrily" is back. The quote count is 2/2, matching Butler.
- **¶29 vultures:** now "eagle-beaked, crook-taloned vultures", which is Butler's wording. "Agelaus, Damastor’s son" correctly names the man introduced at ¶25, and the killing is confirmed by ¶32. Butler's one dash, before "so", is kept.
- **¶20 Oceanus:** now "the streams of Oceanus". It is the only use in the Book.
- **¶33 "thought it best":** now "In the end he thought it best", the fixed formula.
- **Dashes Butler lacks:**
  - ¶15 is now a full stop.
  - ¶18 is now a comma ("Tell me, should I kill him").
  - ¶20 is now a comma ("in the other, one that Laertes had carried").
  - ¶29 is now a comma ("and kill them, for they cannot fight or fly").
  - ¶34 is now "innocent. Don’t harm him!"
  - All five are resolved. The other dashes Butler lacks (¶5, ¶6, ¶40) replace his semicolons, not commas. They come from v1 and are outside this list.
- **Other restorations:** I checked each one against Butler and each is correct:
  - "two-handled gold cup"
  - "one of the Achaeans … hack at him"
  - "make an end of this man and his shooting"
  - "pointed shaft of another struck the wall" (¶26 and ¶28 now match)
  - "four hides thick"
  - "The mighty contest … another target"
  - "chief man in Ithaca"
  - "we will spare Medon"
  - "entrance to the outer court"
  - "go up to the trap door"
  - "noose" (¶19 and ¶20)
  - "straps now come unstitched"
  - "armor for the swineherd"
  - "my son"
  - "lamentably less valiant"
  - "much wrong"
  - "toppled over"
  - "is true"
  - "brains were battered in … seethed"
- **Grammar and reading aloud:** the changed paragraphs are clean, apart from defect 1 below. "its straps now come unstitched" is an old-fashioned participle but grammatical, and it is Butler's sense.
- **Sentence length:** in every changed paragraph, the longest sentence is no longer than Butler's longest sentence in that paragraph. The largest are ¶29 at 48 words (Butler 52) and ¶47 at 30 words (Butler 34).

## Defects
1. **¶15 (aloud, non-blocking).** Edit 20 created "The entrance to the narrow passage is dangerously close to the entrance to the outer court". The repeated "entrance" blurs the two places. Butler says "the mouth of the narrow passage". Suggested fix: "The mouth of the narrow passage…".
2. **¶1 (omission, non-blocking).** "they rebuked Odysseus angrily" drops Butler's "very", from "rebuked Ulysses very angrily". This round restored the same intensifier at ¶23 as a softening, and ¶1 was also edited this round, so the two paragraphs are now inconsistent. Suggested fix: "they rebuked Odysseus very angrily."

## 3. Structure
- 52 paragraphs, the same as the source, and none are empty.
- In every paragraph, the counts of “ and ” match the source. There are no straight quotes.
- Every dash is unspaced.
- Both suggested fixes keep the quote counts at 2/2.

---

# Re-check of candidate-v3 (built from v2)

**Verdict: VERIFIED CLEAN**

- candidate-v3.json sha256 is 7331ba71c65c487408a1626703c54d7ecfe03129d5da08247868adfd1cfa48d8, which matches the hash given.
- I applied the 2 findings in b22-reverify.json to v2. The result is byte-identical to v3's paragraphs.
- Only ¶1 and ¶15 differ from v2. The number and title are unchanged.
- **¶1:** now "they rebuked Odysseus very angrily", which is Butler's "rebuked Ulysses very angrily". It is consistent with ¶23. It reads cleanly next to ¶0 and ¶2.
- **¶15:** now "The mouth of the narrow passage is dangerously close to the entrance to the outer court", which is Butler's "the mouth of the narrow passage is dangerously near the entrance to the outer court". "Entrance" no longer repeats. It follows on correctly from ¶14 (the narrow passage) and leads into ¶16.
- **Structure:** 52 paragraphs, the same as the source, and none are empty. In every paragraph, the “ and ” counts match the source. There are no straight quotes, and every dash is unspaced.
