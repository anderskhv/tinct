# Book 14 re-verification: candidate-v1 → candidate-v2

**Verdict: DEFECTS FOUND** (1 blocking, 4 non-blocking). Findings are in `b14-reverify.json`.

## 1. Replay
- candidate-v2.json sha256 f90b65946cc0216aeb7ecf3e22de46d5b72226e0fe1e1b52a216fabf16a57ed2 (matches the given prefix).
- I applied all 28 edits from b14-v1-edits.json to candidate-v1 in order. Every "old" string was unique in its paragraph. The result is identical to candidate-v2 across all 35 paragraphs, and number/title are unchanged. So v2 = v1 + exactly these 28 edits.
- Edited paragraphs: 0, 1, 2, 3, 5, 8, 9, 11, 12, 13, 15, 16, 18, 20, 23, 26, 32.

## 2. Reading against Butler
- **Fidelity:** 21 of the 23 fidelity edits are correct restorations of Butler: thrifty, insult, "one or two victims", "comes from heaven", "is as rich", "young lords", "cunning enough", "sir", the straw and grain image, the protecting hand, "a holding and little else", "devised evil", no bronze, "sea and sky", "hate" with no "must", "a warning not to", "clubbed", "so far". The 2 exceptions are defects.
- **¶9 gloss:** "Arceisius—Odysseus’s grandfather" is accurate. Arceisius is the father of Laertes (Od. 4.755, 16.118). Butler's name is kept, the dashes are unspaced, and it reads cleanly aloud.
- **¶11 Castor:** "It is his lineage I claim" keeps Butler's "whose lineage I claim". The lead's split is allowed: Butler's aside is a whole clause, and PUNCTUATION §6 allows the conversion for that. The facts are complete (wealth, prosperity, the courage of his sons).
- **¶26 vocative:** "Listen to me, Eumaeus, and the rest of you," he said. This is the correct §3 regrouping.
- **Nested quotations:** ¶10–16 are left open and ¶17 closes, as Butler has them. ¶26 opens the outer quotation and ¶27, ¶29 and ¶30 carry the inner ‘…’ pairs, with the outer quotation closing only at ¶31. All match Butler's structure (PUNCTUATION §2). There are no straight quotes and no empty paragraphs.
- **¶15 against B12-P35 (accepted):** These parts match: "Then Zeus let fly with his thunderbolts, and the ship spun round and round and was filled with fire and brimstone as the lightning struck it" and "but the god soon deprived them of any chance of getting home again". This part does not: "The men all fell into the sea and were carried about in the water around the ship". Butler's clause there is identical in both Books, and Book 12 has "; they were carried about in the water round the ship" (non-blocking).
- **Sentence length:** No edit made a sentence longer than Butler's. The longest sentences in the edited paragraphs are all at or below Butler's maximum, except ¶12. There the longest sentence is 56 words against Butler's 52, but it is the unedited "For six days…" sentence.

## 3. Defects
1. **¶3 (blocking, convention):** Edit 23 put in a spaced em dash, "for him — for the gods". It is the only spaced dash in the Book, and the binding rule is unspaced.
2. **¶3 (non-blocking, addition):** Edit 23 adds "by now", which Butler does not have.
3. **¶12 (non-blocking, voice):** "Zeus planned evil" uses the same verb the Book already uses for Butler's "counselled" (the "terrible campaign" sentence two sentences earlier, and ¶15). Suggested fix: "devised evil".
4. **¶15 (non-blocking, convention):** The clause "they were carried about … round the ship" should match accepted Book 12 exactly, as noted in section 2.
5. **¶16 (non-blocking, aloud):** Edit 27 undid the inversion but kept the comma. The result is a comma splice in which "so much" no longer means Butler's "that much".

## 4. Structure
- 35 paragraphs, the same as the source, and none is empty. The "heaven" count is 6 in both the source and v2.

---

# Addendum: candidate-v3 check (built from v2)

**Verdict: VERIFIED CLEAN**

- **Hash:** the sha256 of candidate-v3.json is 48f13cc9e3d22a5ff71c8ea41ccd98ae293ce804155b3fa1ca698ce7788c274b.
- **Diff:** applying the 5 findings in b14-reverify.json to v2 gives exactly v3. Only ¶3, ¶12, ¶15 and ¶16 differ from v2, and number and title are unchanged.
- **¶3:** the dash is now unspaced ("for him—for the gods") and "by now" is gone. The sentence reads cleanly, and the colon still introduces the list.
- **¶12:** "Zeus devised evil against me" matches Butler's "devised", and "planned" is now used only for his "counselled".
- **¶15:** "The men all fell into the sea; they were carried about in the water round the ship, looking like so many seagulls, but the god soon deprived them of any chance of getting home again." This matches the accepted Book 12 (B12-P35) word for word.
- **¶16:** "…enough to support his family for ten generations; that was how much he had left in King Pheidon’s house." This is grammatical, gives Butler's "so much had he left" meaning, and reads well aloud.
- **Structure:**
  - 35 paragraphs, none empty.
  - No straight quotes, and the nested quotation structure is unchanged, because no quotation mark was touched.
  - The only spaced dash is in the title. That is the book-wide convention; the accepted Book 12's title has the same form.
