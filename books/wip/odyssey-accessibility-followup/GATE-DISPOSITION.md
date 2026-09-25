# Similarity gate — result, evidence, and the decision left open

**Result: GATE FAIL.** No waiver was granted, and this package does not claim one.

## The unchanged gate

The gate is `books/classify-modern-en.py`, byte-identical to main `1a7d89eb`. It was run with original-en = option A `0cc76350…` against each modern-en candidate.

| | Accepted candidate `bd05c7f4…` | This successor `db6bfd23…` | Gate |
|---|---|---|---|
| Weighted similarity | 0.784 | **0.783** | ≤ 0.75 |
| LIGHT + MECHANICAL Books | 10/24 (41.7%) | **10/24 (41.7%)** | ≤ 5% |
| Identical long paragraphs | 0/1019 | 0/1019 | ≤ 5% |
| Wrapped scaffolding / truncations | 0 / 0 | 0 / 0 | 0 |

Full outputs: `gate/similarity-gate-accepted-bd05.txt` and `gate/similarity-gate-successor.txt`.

## What the review found, Book by Book

- **Barriers** are those the blind reader flagged on the modern text, split into misread / unsure / pause.
- **Reader matches Butler** comes from each adjudicator's paragraph-by-paragraph comparison of the reader's paraphrase with Butler.
- **Edits** counts the edits applied in the Book, including consistency edits.

| Book | ¶ | sim before → after | Barriers (misread / unsure / pause) | Reader matches Butler | Edits |
|---|---|---|---|---|---|
| 3 | 38 | 0.853 → 0.852 | 1 / 22 / 84 | 37 of 37 content ¶ (¶37 is Butler's half-sentence) | 5 |
| 4 | 81 | 0.937 → 0.934 | 3 / 36 / 99 | 81 of 81 (one reader slip, ¶43, not caused by the text) | 13 |
| 5 | 37 | 0.898 → 0.896 | 1 / 20 / 76 | 37 of 37 | 10 |
| 6 | 26 | 0.891 → 0.891 | 0 / 10 / 36 | 26 of 26 | 3 |
| 7 | 29 | 0.886 → 0.884 | 1 / 11 / 49 | 29 of 29 | 4 |
| 8 | 50 | 0.901 → 0.898 | 0 / 7 / 73 | 50 of 50 | 11 |
| 9 | 44 | 0.895 → 0.894 | 0 / 9 / 77 | 44 of 44 | 2 |
| 10 | 49 | 0.900 → 0.900 | 0 / 18 / 51 | 49 of 49 | 3 |
| 23 | 29 | 0.870 → 0.869 | 3 / 18 / 35 | 27 of 29 (2 reader errors; see note) | 4 |
| 24 | 45 | 0.852 → 0.850 | 2 / 15 / 66 | 45 of 45 | 5 |

The two Book 23 reader errors are not caused by the text. One is Eurycleia's identity, which earlier Books establish. The other is a small slip at ¶22.

Consistency edits outside these Books: 1.4, 2.23, 12.26 and 17.10. At the gate's precision only Book 2 moves (0.844 → 0.843), and all four Books stay REAL.

## What the evidence shows

1. **Comprehension is intact.** Blind readers who saw only the modern text reconstructed Butler's actions, relationships, arguments and images correctly in essentially every paragraph.
   - Every misreading the wording actually caused was repaired. So was every word or construction a present-day reader cannot decode or will take the wrong way.
   - That is 60 edits in the ten Books, plus 4 consistency edits elsewhere. Examples: "do their business in the waters", "mixed a mess", "He took nothing by it", "should have founded" read as regret, "made sure" meaning felt sure, "taken in water" read as a leak, "had had enough … of his wife", "gold and substance", "of an alien speech", "corn" for grain, "stouter", "couch", "shingle", and the reversible "not one … but has" constructions.
2. **The gate measures closeness to Butler, not comprehension.** The targeted repairs moved each Book's similarity by at most 0.003.
   - In these Books, 219 of 428 paragraphs are at least 0.90 similar to Butler. In 152 of those the reader recorded no misread and no unsure.
   - Example, 4.4 (similarity 0.937). The modern text reads: "They took their sweating horses from under the yoke, made them fast to the mangers, and gave them a feed of oats and barley mixed. Then they leaned the chariot against the end wall of the courtyard…". The reader paraphrased it exactly: "they unyoke the sweating horses, tie them at the feeding troughs and feed them oats and barley, prop the chariot against the courtyard wall…".
   - Example, 8.4 (similarity 0.898). The paraphrase is exact apart from the dated "presently".
3. **What remains is Butler's Victorian register, not misunderstanding.**
   - The readers logged 646 "pause" items across the ten Books: places where reading slowed but the meaning was recovered.
   - Several words from the review's own example list are dated but were decoded with high confidence. They are kept, with their reasons recorded:

     | Where | Word | Reader's reading |
     |---|---|---|
     | 9.25 | "gobbets" | "lumps of human flesh" |
     | 9.25 | "besmirched with gore" | "covered in blood" |
     | 4.0 | "bondwoman" | "a slave woman" (the edition's settled family is "bondservant") |
     | 4.6 | "Fall to" | "start eating" |
     | 10.24 | "fared onward" | "went on" (the word was restored earlier to avoid a collision) |

   - "presently" is kept wherever the verb is past tense, which fixes its sense. The one present-tense use (4.8) was repaired.
4. **Passing the gate would take a full re-rendering of these Books.** Their syntax and register would have to move off Butler's throughout, as Moby-Dick's round-4 modernization-depth pass did.
   - This review was instructed not to rewrite merely to reach the threshold, and it did not.

## Decision left explicit

**Needs Anders's decision.** Publish this successor under a recorded exception for Books 3–10, 23 and 24, or hold for a modernization-depth pass?

**Recommendation: grant a recorded, bounded exception now, and schedule the depth pass separately.** The reasons:

- **Now:** the successor corrects the 1,011 live paragraphs that PR #163 exists to fix (live errors include the invented "Helios", the wrong suitor at 15.1 and the Book 3 splice). It is comprehension-verified and strictly better than both the live text and `bd05c7f4`. Keeping the flawed live text while the depth pass is done would leave readers with the known errors.
- **Later:** your featured-ten rationale rates the Odyssey's modernization value "High with our current source". Ten Butler-close Books do not deliver that, so a depth pass on these Books (register and syntax, faithful, independently reviewed) should follow. It must pass the unchanged gate, and this successor is its base.

If you prefer no exception, hold PR #163. The successor stays the correct base for the depth pass.
