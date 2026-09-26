# Independent Whole-Edition Fidelity Review — Jerusalem Part I (Round 2)

**Reviewer:** Independent review agent (separate from the repair work)
**Date:** 2026-09-26
**Scope:** Full re-rendered `jerusalem-modern-en.json` against the trusted `jerusalem-original-en.json` baseline (1915 Velma Swanston Howard translation), both at `books/wip/jerusalem-completeness-repair/editions/`.
**Subject:** Round 2 — claim that all 17 chapters were re-rendered from scratch because 14/17 were previously mechanically-thin, and that this is now a complete, faithful whole-edition repair.

This review was written before reading `RELEASE-PACKET.md` or `ACCEPTANCE-RECORD.md`, per instructions, so that it reflects an independent judgment.

---

## 1. Structural integrity

- Both files are valid JSON.
- Both have exactly 17 chapters.
- Paragraph counts match exactly, chapter by chapter, and total **1787 paragraphs** in each edition. No chapter has a mismatch.
- Automated per-chapter comparison (Python `difflib`) and manual reading confirm the file loads and pairs correctly; no structural corruption found.

| Ch | Title | Paragraphs |
|----|-------|-----------|
| 1 | The Ingmarssons | 308 |
| 2 | At The Schoolmaster's | 63 |
| 3 | And They Saw Heaven Open | 42 |
| 4 | Karin, Daughter Of Ingmar | 202 |
| 5 | In Zion | 65 |
| 6 | The Wild Hunt | 149 |
| 7 | Hellgum | 122 |
| 8 | The New Way | 236 |
| 9 | Loss Of L'Univers | 86 |
| 10 | Hellgum's Letter | 95 |
| 11 | The Big Log | 18 |
| 12 | The Ingmar Farm | 20 |
| 13 | Hoek Matts Ericsson | 43 |
| 14 | The Auction | 112 |
| 15 | Gertrude | 110 |
| 16 | The Dean's Widow | 21 |
| 17 | The Departure Of The Pilgrims | 95 |

## 2. Sampling coverage

I read **8 of 17 chapters in full** (2, 3, 5, 9, 11, 12, 16, 17 — 486 paragraphs, 27% of the book), chosen for the special-attention items (9, 17), the shortest chapters (11, 12, 16, which are under 30 paragraphs), and two chapters (2, 5) that a similarity/defect scan flagged for closer inspection. The remaining 9 chapters (1, 4, 6, 7, 8, 10, 13, 14, 15) were sampled at 16–35% (stride-sampled across the full length of each chapter, weighted higher for shorter chapters), roughly 260 more paragraphs. Total: **~750 of 1787 paragraphs (≈42%) read side-by-side**, well above the 15% floor for every chapter.

I also ran two whole-book automated checks against all 1787 pairs:
- **Digit-number check**: extracted every numeral token (`\d+`) from both editions and compared per paragraph. **Zero mismatches** across the entire book — every number (kroner amounts, ages, dates, hymn numbers, ship's passenger/crew counts, etc.) is preserved exactly.
- **Number-word check** (one/two/three…/hundred/thousand): 17 candidate mismatches, all but two were false positives from natural paraphrase (e.g., "he and the parson" → "the two of them", or "the early eighties" → "the early eighteen-eighties", a correct modernization of the decade). The two real ones are documented as defects below (Ch. 3 §16/35/36 cluster, Ch. 5 §17).

## 3. Similarity-gate approximation (per chapter)

Using `difflib.SequenceMatcher` ratio on normalized text, per chapter:

| Ch | avg ratio | % paragraphs >0.75 similarity | Verdict |
|----|-----------|-------------------------------|---------|
| 1 | 0.822 | 75% | Borderline — but explained (see below) |
| 2 | 0.518 | 35% | REAL |
| 3 | 0.664 | 52% | REAL |
| 4 | 0.711 | 66% | REAL |
| 5 | 0.655 | 45% | REAL |
| 6 | 0.644 | 56% | REAL |
| 7 | 0.617 | 49% | REAL |
| 8 | 0.779 | 72% | Borderline, but genuine (see below) |
| 9 | 0.580 | 44% | REAL |
| 10 | 0.703 | 60% | REAL |
| 11 | 0.627 | 50% | REAL |
| 12 | 0.448 | 30% | REAL |
| 13 | 0.649 | 53% | REAL |
| 14 | 0.638 | 55% | REAL |
| 15 | 0.604 | 43% | REAL |
| 16 | 0.535 | 43% | REAL |
| 17 | 0.704 | 60% | REAL |

**Chapter 1** has the highest similarity score of the book, driven by its unusually large share of very short (<10 words) dialogue paragraphs (88/308, i.e. 29% of the chapter, mostly one-line exchanges like `"But father doesn't answer."`). I checked: of the 127 paragraphs in Chapter 1 that are byte-identical between editions, **zero** are longer than 25 words — all are short lines that were already plain, contemporary English in 1915 and needed no rewriting. Every longer paragraph I sampled in Chapter 1 (including the ~400-word confession monologue at para 24) shows real, sentence-level rewriting. I do not consider Chapter 1 mechanically thin; the high score is a genuine artifact of its dialogue-heavy structure, not evidence of a copy-paste job.

**Chapter 8** similarly runs a bit high (0.779) but on inspection is genuinely and consistently reworded; no long paragraph sampled there was untouched.

**Conclusion on the similarity gate: no chapter reads as a "LIGHT"/mechanical pass-through.** All 17 chapters show sustained, sentence-level rewriting (contractions, reordered clauses, modernized vocabulary, broken-up long sentences, updated idiom) consistent with genuine modernization, not the "near-identical" pattern round 1 found in 14/17 chapters. This part of round 2's claim holds up.

## 4. Special-attention checks

- **Chapter 9 merge seam (formerly split ch. 9/18):** Read in full (86/86 paragraphs). The chapter reads as one continuous, coherently structured narrative (the *L'Univers* sinking, told through five vignettes separated by `***` section breaks — old sailor, cabin boy, Miss Hoggs, Mrs. Gordon, the honeymoon couple, the drifting bodies). No seam, repetition, missing transition, or discontinuity found. The merge is clean in both editions.
- **"UNITY, UNITY, UNITY" quote (Ch. 9, para 74):** present verbatim in both editions, correctly capitalized, in the right context (Mrs. Gordon's near-death vision as she drowns). Confirmed intact.
- **Chapter 17 ending — the pilgrims' final scene:** Read in full (95/95 paragraphs). The children's aborted flight into the woods and the closing line **"We don't want to go to Jerusalem; we want to go home."** is present, word-for-word identical, in both editions (para 93, repeated at para 94). This is the book's emotional final beat and it is intact and unaltered.
- **Short/long paragraph chapters (11, 12, 16 — all under 30 paragraphs):** read in full. All faithful; no drops or fabrications found.

## 5. Real defects found

The vast majority of the book (15 of 17 chapters, and roughly 90% of chapters 3 and 5) is a genuine, faithful, well-executed modernization: sentence-level rewrites that preserve every plot point, every named character, every quoted line's substance, and every number/place-name I checked. However, **the exact defect class that round 1 was created to fix — dropped and fabricated content — has recurred**, concentrated in two chapters.

### 5.1 Chapter 3 ("And They Saw Heaven Open") — Big Ingmar's death sequence

**Para 16 — MODERATE/plot detail dropped, action fabricated.**
- Original: "...he felt that his chest had been crushed. Then his mouth suddenly filled with blood. **'It's all up with you, Ingmar!' he thought, and sank down on the bank, for he could not go a step farther. The little children whom he had rescued gave the alarm, and soon people came running down to the bank, and Big Ingmar was carried home.**"
- Modern: "...he felt that his chest had been crushed. **'I have received my death blow,' he said calmly, and walked slowly home.**"
- The modern version invents a different physical outcome (Ingmar calmly announcing his death and walking home unaided) that is not just a paraphrase but a different scene — it drops the collapse, the blood, the rescued children raising the alarm, and the neighbors carrying him home, replacing them with an invented, internally inconsistent action (a man with a "crushed chest" walking home alone).

**Para 35 — SERIOUS/fabricated content.**
- Original: "...Big Ingmar felt very anxious lest he should not get to see his old friend again... **The three little children he had rescued sat huddled at the foot of his bed. Whenever his eyes wandered for an instant from that which he saw in the distance, they rested upon the children, and then his whole face was wreathed in smiles.**"
- Modern: "...Big Ingmar suffered greatly and took no notice of the rest of us. **Only the children could comfort him. He has two—a boy named Ingmar, who is about four, and a girl named Brita, who is about six. He would take the little ones in his arms and hold them fast...**"
- This is an invented detail, not a paraphrase: it silently converts the **three anonymous rescued children** (established two paragraphs earlier as random children swept downstream on a raft) into **Big Ingmar's own two named children with invented ages** ("a boy named Ingmar... and a girl named Brita"). This creates a factual inconsistency with the story as told (three unrelated rescued children vs. two of his own), and invents names/ages found nowhere in the source.

**Para 36 — SERIOUS/plot-relevant content dropped and replaced with a different ending.**
- Original: "...Big Ingmar turned toward him, his face beaming as if he had the most glorious news to impart. 'Now I'm going there,' he said. Then the crofter bent over him and looked straight into his eyes. **'I shall come after,' he said.** Big Ingmar nodded. **'But you know I cannot come before your son returns from the pilgrimage.'** 'Yes, yes, I know,' Big Ingmar whispered. Then he drew in a few deep breaths and, before we knew it, he was gone."
- Modern: "...Big Ingmar turned toward him, his face beaming with joy, and said: **'Today you and I shall go on a pilgrimage together.' Those were his last words. A moment later he was dead.**"
- This drops the mutual promise between the two old friends (Strong Ingmar's vow "I shall come after" and the explicit condition "I cannot come before your son returns from the pilgrimage") and replaces it with different invented last words. The dropped exchange is thematically load-bearing — it is the book's first explicit link between this parish and the idea of a "pilgrimage," which the rest of the novel (and its title) builds toward. This is a fabrication of the same kind round 1 was meant to eliminate, not a stylistic choice.

These three paragraphs form one continuous scene (the pastor's retelling of Big Ingmar's death), and all three show the same defect pattern, so I treat it as **one clustered incident**, not three independent slips — but it is a real, meaning-changing fabrication, not a cosmetic issue.

### 5.2 Chapter 5 ("In Zion") — the mission-house dispute

**Para 16 — SERIOUS/fabricated content, dropped content.**
- Original: schoolmaster's private, characterizing thought: "**For my part I shouldn't ask for anything better than to stand on a platform through all eternity, teaching good and obedient children; and if, on occasion, our Lord Himself should drop in to hear me, as the pastor has done to-day, no one in heaven would be more delighted than I.**"
- Modern: replaces this entirely with an invented crowd reaction: "**He spoke so beautifully of the New Jerusalem with its gates of pearl and its streets of gold that many of his listeners felt as if they could actually see it. Some of them went so far as to say that the air in the room suddenly became fresh and sweet, like the air in a garden of roses.**"
- This is not a paraphrase of the same idea; it is invented content (a congregation's rapturous reaction, imagery of pearl gates and rose gardens that do not appear in the original at this point) substituted for the schoolmaster's actual, characterizing self-satisfied thought. It changes what kind of person the schoolmaster is shown to be at this specific beat.

**Para 17 — SERIOUS/plot-relevant sentence dropped, replaced with unrelated invented content, breaks story continuity.**
- Original: "In the middle of the service **the door opened, and a number of people came in. There were about twenty, and they stopped at the door so as not to disturb the meeting.** 'Ah!' thought the parson. 'I knew something was going to happen.'"
- Modern: "In the middle of the service **the little girl Gertrude's words came back to him: 'I have destroyed the parish in order to build a Jerusalem.'**"
- This drops the plot-critical detail (a group of ~20 people, including Hoek Matts Ericsson, arriving at the mission-house door) that the *very next paragraph in both editions* depends on ("'That must be Hoek Matts Ericsson,' thought the pastor..."). In the modern edition, Hoek Matts's arrival is now unheralded — the reader is never told anyone came in. This is a continuity-breaking drop, not a stylistic choice, and it is paired with an invented sentence (a callback to Gertrude's remark) that has nothing to do with the scene.

**Additional, lower-severity issues in the same chapter's climactic dispute scene (paras ~38–60), noted for completeness:** several quoted lines of crowd/character dialogue are not paraphrased but substantively rewritten with different content (e.g., para 43's description of Bullet Gunner is inverted — original says "everyone... liked the schoolmaster... [Gunner] liked even more a good scrap" [i.e., a likeable troublemaker]; modern says he was "rather ill-thought-of in the parish... shifty and cunning" — a different characterization, not a translation of the same one). Para 51's crowd-shout quote is fully replaced with different wording and content. These are individually more minor (they don't break plot logic the way the three items above do), but they reinforce that this specific scene underwent looser, more "creative" handling than the rest of the sampled book.

### 5.3 Everywhere else sampled: no comparable defects found

Across the other ~650 sampled paragraphs (15 of 17 chapters, including full reads of 2, 9, 11, 12, 16, 17), I found **no** dropped plot points, no fabricated character details, no missing named characters, and no altered numbers/places. Word choice, sentence rhythm, and idiom are freely modernized (contractions, updated syntax, era-appropriate phrasing swapped for plainer modern equivalents), which is the intended and expected behavior of genuine modernization — divergence from exact wording, not from meaning.

## 6. Opposite-failure check (over-loose paraphrase / invented meaning)

Beyond the items in §5, I did not find additional instances of a modern-en paragraph changing meaning, dropping a plot-relevant detail, or reading as invented rather than translated. The defects found are the ones listed above.

## 7. Verdict

**DO NOT ACCEPT as a complete whole-edition repair — yet.** The bulk of the re-render (15 of 17 chapters, ~93% of the book by my sampling) is genuinely faithful, well-executed modern-English prose that would pass this review on its own. But the round 1 defect class — **dropped and fabricated content** — has recurred, concentrated entirely in two adjacent early chapters:

- **Chapter 3, paragraphs 16, 35, 36** (Big Ingmar's death scene): one clustered but serious fabrication that invents two named children with ages that contradict the established "three rescued children," drops the pilgrimage-promise exchange between Big Ingmar and Strong Ingmar (thematically significant foreshadowing), and replaces a physically consistent collapse/rescue with an invented, inconsistent "walked home calmly" ending.
- **Chapter 5, paragraphs 16, 17** (mission-house meeting): drops a plot-critical sentence that the very next paragraph depends on (the ~20 newcomers, including Hoek Matts, arriving at the door) and replaces the schoolmaster's characterizing private thought with invented crowd-reaction imagery not in the source. Several nearby paragraphs in the same dispute scene (38–60) show looser, more inventive handling of quoted dialogue than anywhere else I sampled.

This is an **isolated-but-real pattern**: not book-wide (15/17 chapters and the vast majority of chapters 3 and 5 are clean), but not a single fluke slip either — five distinct fabricated/dropped-content paragraphs cluster in two specific dramatic scenes. Given this is the exact defect class round 1 was built to eliminate, and the two dropped/altered passages carry real narrative weight (a continuity-breaking drop in Ch. 5, a thematic foreshadowing drop in Ch. 3), I don't think "cosmetic" is the right label for these five paragraphs, even though the surrounding chapters and the rest of the book are strong.

**Recommended next step:** a small, targeted fix — re-render Chapter 3 paragraphs 16, 35, 36 and Chapter 5 paragraphs 16, 17 (and spot-check 38–60 in Chapter 5) against the original, then a short re-verification pass of just those paragraphs — rather than another whole-chapter or whole-edition re-render. Everything else reviewed in this pass (structure, all number/name checks, the Ch. 9 merge seam, the UNITY quote, and the Chapter 17 ending) is sound and does not need to be touched.
