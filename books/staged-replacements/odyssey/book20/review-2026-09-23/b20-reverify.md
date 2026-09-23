# Book 20 re-verification (independent) — v1 → v2

**Verdict: DEFECTS FOUND** (1 blocking, 2 non-blocking). The defects are in b20-reverify.json. Every "old" string was checked to be exact and unique in candidate-v2.

## 1. Replay
- candidate-v2.json sha256 `e90d4044cb59ee782169dfada5575d9036c70f483bb49530dc3f1ede2f40418c` (matches).
- All 16 edits in b20-v1-edits.json apply to candidate-v1, and each `old` occurs exactly once. The replayed result is **identical** to candidate-v2 (the whole JSON: number, title and paragraphs).
- The paragraphs that differ between v1 and v2 are exactly {0,1,3,5,6,11,16,17,18,24,27,28,29}, which is the set of edited paragraphs. Nothing else changed.

## 2. Structure
- 36 paragraphs, the same count as the source. No paragraph is empty.

## 3. Stockman / herdsman
- "herdsman" and "herdsmen" appear **nowhere** in v2.
- "stockman" appears at ¶16 ("made me his stockman"), ¶17 (the vocative "Stockman,") and ¶18 ("the stockman replied"). These are all the places where Butler uses "stockman".
- Philoetius is named at ¶15 and ¶21 with no title. Butler also gives no title there. "herds" at ¶14 and ¶16 refers to herds, not the man.
- This check passes.

## 4. Paragraph-by-paragraph read of the changed paragraphs against Butler, with neighbours
- **¶0 — DEFECT (blocking, convention).** The fidelity fix for the simile is right: "so his heart growled with anger at the evil deeds being done" restores what the anger is aimed at. However, the edit put a colon where Butler wrote ", and". PUNCTUATION §6 allows an added colon only to introduce a list. Fix: "His heart growled within him, and as a mother dog …". The sentence is 33 words; Butler's is 87.
- ¶1 "forced it to endure": fine.
- **¶3 — DEFECT (non-blocking, meaning).** "fifty bands of men" is correct. The accessibility rewrite changed v1's "Anyone else" to "Someone else". Butler has "any one else", and the claim is universal, so the change weakens it and has no stated reason. Restore "Anyone". The rest of the rewrite reads well aloud.
- ¶5 "In the same way, I wish …" renders Butler's "Even so" faithfully.
- ¶6: "from the lips of someone now waking" restores Butler's "out of the mouth of", and "recognized … at his side" is faithful ("knew him and was by his side"). **Note, not a defect:** the prayer sentence grows from 49 to 52 words, which crosses the D20(c) 50-word line. Butler's aligned sentence is 70 words, so there is no growth against him. It is reported under D20(c)'s absolute report and is reasonable as it stands. Also not from this round: the dash in "it puzzled him—it seemed" replaces Butler's ", for" and was already in v1.
- ¶11 "left the court": fine, and consistent with ¶30 and ¶35.
- ¶16–18 stockman: fine (see §3).
- ¶24 "the holy sacrifice": follows the GLOSSARY D3 hecatomb row and keeps "holy".
- **¶27 — DEFECT (non-blocking, convention).** "At this Telemachus spoke angrily" is correct. The restored clause "understand what's going on" is correct, but the edit adds a semicolon where Butler has no mark. D21/D27 count this as an added dividing mark. Suggested wording: "I'm grown up now, I know good from evil, and I understand what's going on, instead of …".
- ¶28 "the best man, the one who makes her the most advantageous offer": the appositive correctly presents both qualities as belonging to one man, as in Butler's "and the one".
- ¶29 "By Zeus, Agelaus, and by …": the vocative is restored and the sentence flows well.

## 5. Sentence length
In every changed paragraph, the longest candidate sentence is shorter than Butler's longest sentence in that paragraph:

| ¶ | Butler's longest (words) | Candidate's longest (words) |
|---|---|---|
| 0 | 87 | 33 |
| 1 | 89 | 39 |
| 3 | 34 | 30 |
| 5 | 76 | 50 (sentence unchanged by this round) |
| 6 | 70 | 52 |
| 16 | 91 | 41 |
| 27 | 47 | 32 |
| 28 | 49 | 43 |
| 29 | 78 | 31 |

No edited sentence is longer than Butler's.

## 6. Other conventions
- All new text uses curly quotes and apostrophes and American spelling.
- Greek names are correct.
- The em dashes are unspaced.

---

# Addendum: candidate-v3 (built from v2)

**Verdict: VERIFIED CLEAN**

## Replay and structure
- sha256 `620c69bfc396f1c8a66fb5383bdf106d0a8e7826200656ee7a06befa6902be66` (matches the coordinator's).
- Applying the 3 findings in b20-reverify.json to v2 gives a file identical to v3.
- Only ¶0, ¶3 and ¶27 differ between v2 and v3. The number, title and other paragraph text are unchanged.
- v3 has 36 paragraphs and none is empty.

## Reading against Butler, with neighbours
- **¶0:** the sentence now reads "His heart growled within him, and as a mother dog … so his heart growled with anger at the evil deeds being done." This follows Butler's pointing and keeps his repetition. The sentence is 36 words; Butler's is 87. It leads naturally into "But he struck his chest".
- **¶3:** "Anyone else would trust an ally weaker than me" restores Butler's universal "any one else". The rest of the paragraph is unchanged.
- **¶27:** "I’m grown up now, I know good from evil, and I understand what’s going on, instead of being the child I was before." The added semicolon is gone, and every part of Butler's clause survives. The sentence reads cleanly aloud and fits with the "unseemly behavior" sentence before it and the "I’ve long watched" sentence after it.

No new defects were found.
