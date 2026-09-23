# Book 17 re-verification: candidate-v1 → candidate-v2

**Verdict: DEFECTS FOUND** (1 blocking, 1 non-blocking; see `b17-reverify.json`)

AFTER = `book17/candidate-v2.json`, sha256 `5b87f5421fb1ae4194a573be895e7f48a5026dabc700a466c5eb00caa3cb9806` (confirmed).

## 1. Replay
- I applied all 24 edits from `b17-v1-edits.json` to candidate-v1. Every `old` string occurs exactly once in its paragraph. All 63 replayed paragraphs are byte-identical to v2.
- The only other key that differs is `title`: "recognised" → "recognized", and nothing else in it changed. `number` is unchanged.
- **AFTER = BEFORE + exactly the 24 edits + the title change.** Confirmed.

## 2. Changed paragraphs, read against Butler with neighbours
All clean except where noted:
- ¶2, ¶8, ¶31: "pillar" matches B16-P037. The ¶8 "clean table" matches B01-P010, B04-P005, B07-P015, B10-P028 and B15-P010.
- ¶10: "By father Zeus, Athena, and Apollo" matches B04-P027. "the whole truth. At that he said" follows the GLOSSARY whereon→"at that" row. "short shrift and a sorry wedding" is fine.
  **Defect D1 (blocking):** the simile prints "grassy **dell**". Accepted B04-P027 renders the same repeated simile "grassy **hollow**", and this was a recorded decision (book04/continuity.md: "`dell` becomes `hollow`"). The edit's own reason cites B04's "hollow", but the text prints "dell". "dell" appears nowhere else in the edition. "newborn" against B04's "new born" is correct under D15, so it is not a B17 defect.
  - Observation only, not a defect: the unedited next sentence reads "he'll make short work of them both". B04 has "will make short work with the pair of them". The meaning is the same.
- ¶12 "that meant this": correct.
- ¶13 "congratulate you": matches B15-P044.
- ¶14 "Dinner is not a bad thing at dinnertime.": keeps the repetition. "dinnertime" is closed under D15.
- ¶15 and ¶17 "station": consistent with B16 and with this Book's ¶18.
- ¶19 "At this, as he passed,": keeps Butler's comma. Correct.
- ¶20 "roaming": a fair accessibility swap that loses no event.
- ¶25 "I understand and will obey.": matches B16-P012.
- ¶30 "seat … carver": matches Butler, and B01 and B04 use "carver".
- ¶36 "someone who can do public service": faithful.
  **Defect D2 (non-blocking, aloud):** "unless he were someone who can …" clashes the subjunctive with the present tense. Suggested fix: "unless he's someone who can …".
- ¶41 "people have who live well and are thought wealthy": faithful, and it reads aloud acceptably.
- ¶42 "soldiers, cavalry and infantry," and "a man named Dmetor, son of Iasus": clear and faithful.
- ¶43 "pestilence to plague us": Butler's exact wording.
- ¶60: "for he had explained everything" and "bring them to a bad end before they do us harm" are both faithful.
- Sentence length: no edit makes a sentence noticeably longer than Butler's. The longest edited sentence, the ¶10 simile, has 30 words against Butler's 31.

## 3. Structure
- The source and v2 both have 63 paragraphs, and none is empty.
- In every paragraph that has a quotation, the sequence of opening and closing curly quotes in v2 matches the source's, including the unclosed marks where a speech continues. There are no straight quotes. The 13 paragraphs without quotes have none in either file.

---

# Re-verification: candidate-v2 → candidate-v3

**Verdict: VERIFIED CLEAN**

- v3 sha256 is `c95b983d113c18dbe8ba14f944e8091da45daf4b9f87191db543fad04bf48de6`, as expected.
- I applied the 2 findings in `b17-reverify.json` to v2, and the result is byte-identical to v3. Only ¶10 and ¶36 differ. `number` and `title` are unchanged.
- ¶10 now reads "or in some grassy hollow.", which matches accepted B04-P027 and Butler's image. It reads well next to ¶9 and ¶11.
- ¶36 now reads "unless he's someone who can do public service—a seer, …". The tense clash is gone, it is faithful to Butler's "unless it be one of those who can do public service", and it reads well next to ¶35 and ¶37.
- Structure: 63 paragraphs, none empty. The curly quotes open and close in the same sequence as the source in every paragraph, and there are no straight quotes.
