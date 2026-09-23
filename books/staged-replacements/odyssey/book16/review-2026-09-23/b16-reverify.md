# Book 16: independent re-verification of the v1 to v2 edits

**Verdict: DEFECTS FOUND.** There is 1 defect. It does not block, and it is at ¶22. Everything else is clean.

## 1. Replay
- I applied all 36 edits from `b16-v1-edits.json` to `candidate-v1.json`, one after another. Each `old` string matched exactly once in its paragraph.
- The result is byte-identical to `candidate-v2.json` in `number`, `title` and all 45 paragraphs. The sha256 is 012649f564241e17d4b0666a3dccd42fea62ee6d55bca2a26a9e4996aa6af069.
- No other paragraph changed. The changed paragraphs are ¶1, 7, 8, 9, 10, 11, 17, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31, 33, 34, 35, 37, 38, 39, 43 and 44.
- The ¶39 text is "that man’s blood", which is the lead's adjusted version.

## 2. Structure
- The file has 45 paragraphs, the same as the source. None is empty. The order is unchanged.
- It has no straight quotes, no spaced em dashes and no double spaces.

## 3. Fidelity, grammar and consistency
I read every changed paragraph in full against Butler's text, together with its neighbours. All the edits restore Butler's sense and read grammatically aloud. I checked these recurring phrases against the accepted Books:

| Phrase | Location in Book 16 | Accepted precedent | Result |
|---|---|---|---|
| "by land" | ¶7 "He certainly didn’t come here by land."; ¶22 "for you can’t have come here by land" | B01-P012 "for you cannot have come by land"; B14-P009 "for you can’t have come here by land" | consistent |
| "Furthermore I say—and take my words to heart—" | ¶27 | B11-P037, same wording and dashes | consistent |
| "chiefs" | ¶11 | B01-P016 "The chiefs from all our islands" | consistent |
| "shirt" | ¶9 "a good cloak and shirt" | B03, B08, B10, B14; this Book's ¶16 | consistent |
| "boon of sleep" | ¶44 | B04-P022 "the blessed boon of sleep" (Butler has "blessed" there) | consistent |
| "worked gold" | ¶17 | B13-P001 | consistent |
| "council", "outer court" | ¶30 | B01, B02, B04, B06, B07, B15 | consistent |
| "armor" | ¶29, ¶33 | B04-P071 | consistent |
| "My friends," | ¶31, ¶35 | B10-P013, B11-P029, B12-P012 | consistent |
| "formidable" | ¶21 | B03-P029, B13-P028 | consistent |

Other paragraphs I checked:
- ¶1 "wagging their tails at him" now repeats ¶0's "wagged their tails at him".
- ¶17 "your color is not the same" now echoes ¶16's "She restored his color".
- ¶10's two edits read cleanly. "even with a man like you present" and "If I stood alone against so many" both keep Butler's sense, and the longest sentence is 52 words against Butler's 59.
- ¶23's longer request keeps Butler's "who, and how many" and "turn the matter over in my mind". It has no repeated count, and the longest sentence is 30 words against Butler's 32.
- ¶38 restores "you break my heart" in a sentence that is still grammatical.
- ¶39 "that man’s blood" removes the reading in which the threat is aimed at Telemachus, and adds nothing.

**Sentence length.** Apart from ¶22, no edit leaves a sentence longer than Butler's longest in that paragraph. ¶22 is described in section 4.

## 4. The ¶21 recognition speech and the ¶22 question

**¶21 is clean.** The paragraph now reads:

> "There is no other Odysseus to come after this one. Such as I am, it is I who, after long wandering and great hardship, have come home in the twentieth year to my own country."

- The two edits meet at a sentence break and do not overlap or duplicate each other.
- The tautology "I am who I am" is gone, and the sentence follows Butler's "Such as I am, it is I, who…".
- The sentence reads naturally aloud.

**¶22 is faithful, but it has the one defect.**
- The edit correctly restores Butler's question about nationality and the "by land" wording used in the accepted Books.
- The problem is that it joins Butler's two questions ("…to Ithaca? Of what nation…") with "and". The result is a single sentence of about 46 words, counting the narrative lead-in, against Butler's 34. It also puts a question mark followed by a dash ("?—") in the middle of the sentence.
- The fix is to restore Butler's break: "…did your crew bring you to Ithaca? And what people did they say they were?—for you can’t have come here by land." The "?—for" can stay, because accepted B04-P011 has "?—but".
- This defect does not block. It is recorded in `b16-reverify.json`.

## 5. Observation, not a defect
¶27, which the edits did not change, renders Butler's "collect all the armour that is in the house" as "gather all the weapons". It then keeps "the sight of weapons" for Butler's "the sight of arms". This is defensible, because the armour stored in the hall is the arms. However, ¶29 and ¶33 now use "armor" for the servants' gear. Book 19 repeats this storeroom scene, so it should render the passage the same way ¶27 does.

---

## 6. Re-verification of candidate-v3.json (sha256 89b3ee4af61c0f97405d4c0dccf67c70767163417888ff947675ae9aaa23c93b)

**Verdict: VERIFIED CLEAN.**

- **Diff against v2:** only ¶22 differs. `number`, `title` and the key set are unchanged. The new ¶22 is identical to v2 ¶22 with the fix from `b16-reverify.json` applied: "…to Ithaca, and what people…" becomes "…to Ithaca? And what people…".
- **Structure:** 45 paragraphs, none empty, in the source order.
- **Against the source:** ¶22 now asks two questions, as Butler does ("did your crew bring you to Ithaca? Of what nation did they declare themselves to be—for you cannot have come by land?").
  - The first sentence ends at "Ithaca?" and is about the length of Butler's (34 words).
  - The second question is short and keeps the accepted "what people … they were—for you can’t have come here by land" wording (B01-P012, B14-P009).
  - "?—for" follows the precedent in B04-P011.
- **With its neighbours:** ¶22 follows ¶21's recognition speech naturally, and Odysseus's reply in ¶23 ("I’ll tell you the truth, my son… The Phaeacians brought me here") answers both questions.
- **Outstanding:** nothing. The ¶27 "weapons" note in section 5 still applies to Book 19; it is not a Book 16 defect.
