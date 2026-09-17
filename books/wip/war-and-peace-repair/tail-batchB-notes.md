# Tail Batch B — Modern-EN Rendering Notes

Source: `tail-batchB-source.json` (Aylmer & Louise Maude, chapters 341–352, First Epilogue chs. 4–15)
Candidate: `tail-batchB-candidate.json`

## 1. Paragraph-count confirmation

Verified programmatically: every chapter in the candidate has the same `number`, the same `title` (exact string match), and the same paragraph count as the source. No merges, splits, reorders, or drops. Chapter/paragraph counts:

| Ch. | Title | Paragraphs |
|-----|-------|-----------:|
| 341 | First Epilogue (1813 - 20) — Chapter 4  | 20 |
| 342 | First Epilogue (1813 - 20) — Chapter 5  | 14 |
| 343 | First Epilogue (1813 - 20) — Chapter 6  | 46 |
| 344 | First Epilogue (1813 - 20) — Chapter 7  | 14 |
| 345 | First Epilogue (1813 - 20) — Chapter 8  | 25 |
| 346 | First Epilogue (1813 - 20) — Chapter 9  | 54 |
| 347 | First Epilogue (1813 - 20) — Chapter 10 | 21 |
| 348 | First Epilogue (1813 - 20) — Chapter 11 | 36 |
| 349 | First Epilogue (1813 - 20) — Chapter 12 | 33 |
| 350 | First Epilogue (1813 - 20) — Chapter 13 | 22 |
| 351 | First Epilogue (1813 - 20) — Chapter 14 | 52 |
| 352 | First Epilogue (1813 - 20) — Chapter 15 | 33 |

All match source exactly (confirmed by script, not eyeballing).

## 2. Question-mark parity

Counted per paragraph in source and candidate; every paragraph in the candidate matches the source's `?` count exactly (script-verified, zero mismatches).

| Ch. | Total `?` in chapter |
|-----|----:|
| 341 | 3 |
| 342 | 1 |
| 343 | 7 |
| 344 | 1 |
| 345 | 6 |
| 346 | 9 |
| 347 | 0 |
| 348 | 7 |
| 349 | 5 |
| 350 | 9 |
| 351 | 14 |
| 352 | 10 |

## 3. Argumentative/philosophical passages — extra preservation care

- **Chapter 341 (all 20 paragraphs)** — Tolstoy's closing meditation on historical causation: the "flood of nations" image, Napoleon's return and stage-manager metaphor (paras 1–10), the analysis of what qualities Alexander I's historical role required (paras 11–17, including the direct quotes "See what you believed in!..." and "Not unto us, not unto us..."), and the full bee-teleology parable (paras 19–20) — the six explanations for why the bee exists (child/stinging, poet/fragrance, first beekeeper/honey, second beekeeper/rearing a queen and perpetuating the race, botanist/fertilization, second botanist/plant migration) are all retained as distinct named examples, in order, with none collapsed or paraphrased away.
- **Chapter 344, paragraph 5** — the long exposition of Nicholas's farming philosophy (nitrogen/oxygen/manure/plow vs. the peasant laborer as the real agent; the staged account of how he learned to manage serfs) is essayistic and was rendered clause-by-clause rather than compressed.
- **Chapter 347, paragraphs 6–14** — the classic Tolstoyan logical argument about the purpose of marriage vs. the purpose of dinner. All four numbered steps of the analogy are preserved intact and in sequence: (1) dinner's purpose is nourishment, eating two dinners doesn't serve that purpose; (2) marriage's purpose is the family, multiple spouses don't serve that purpose; (3) the synthesis — one wife/one husband, no more than needed for a family, just as one shouldn't eat more than one can digest; (4) the conclusion applied to Natasha specifically. Nothing was cut or reordered; this is the paragraph range most exposed to the "summarize instead of translate" defect pattern described in the audit, so it got the closest sentence-by-sentence check.
- **Chapter 347, paragraph 5** — "We know that man has the faculty of becoming completely absorbed..." (the general observation about absorption in trivial subjects) — kept as a full standalone claim, not folded into the surrounding narrative.
- **Chapter 349, paragraph 19 (the long paragraph on the old countess's psychology)** — the enumeration of her bodily "needs" and their pretexts (anger/Belova's deafness, thought/patience, tears/the dead count, agitation/Nicholas's health, spite/Countess Mary, talk/retelling old stories) is preserved as a full list, not summarized to "she found excuses to feel things."

All other chapters (342, 343, 345, 346, 348, 350, 351, 352) are narrative/dialogue-driven (family life at Bald Hills, the Nicholas–Mary courtship and marriage, Pierre and Natasha's household, Denisov's visit, the Nicholas/Pierre secret-society argument, Mary's diary) and were translated at normal fidelity — full dialogue, no compression, but without the extra line-by-line argument-preservation pass needed for the philosophical material above. Chapter 351's Pierre/Nicholas/Denisov debate on the secret society is dialogue, not authorial argument, but was still checked closely paragraph-by-paragraph since it's dense with named references (Tugendbund, Magnitsky, Arakcheev, Pugachev, Schwartz, the Semyonovsky regiment) that are easy to drop in a looser pass.

## 4. Character/relationship consistency notes

- **Nicholas Rostov** marries **Princess Mary (Bolkonsky)** in winter 1813 (ch. 344), after his father Count Ilya Rostov's death (ch. 342) leaves him with the family debts, which he pays off over the following years partly with a loan/gift from his brother-in-law **Pierre Bezukhov**. Nicholas and Mary live at Bald Hills with his mother (the old countess) and **Sonya** (his cousin, once his fiancée, who released him from the engagement — referenced explicitly in ch. 342 and again in ch. 345's "sterile flower" conversation between Natasha and Mary).
- **Natasha Rostov** marries **Pierre Bezukhov** in 1813 (ch. 342, 347) — this is her second engagement after Prince Andrew Bolkonsky's death; Prince Andrew is consistently referred to as "Prince Andrew" throughout (never "Andrei"), and Natasha's continued private grief for him, plus her care not to mention him to Pierre out of a (mistaken) belief he's jealous, is preserved in ch. 347.
- **Nicholas Bolkonsky** ("little Nicholas" / "young Nicholas") is Prince Andrew's son by his first wife (Lise), being raised by his aunt **Countess Mary** (his father's sister, now married to the other Nicholas — Rostov) — the text is careful to distinguish "Nicholas" (Rostov, the uncle by marriage) from "Nicholas Bolkonsky" (the nephew); I kept "young Nicholas Bolkonsky" / "little Nicholas" as distinguishing tags exactly where the source does, and "Nicholas" alone refers to Rostov by default in the domestic scenes.
- Nicholas and Mary Rostov's own children include **Andrew** (eldest, named for Prince Andrew), little **Natasha**, and **Mitya**, per the diary entries in ch. 352 (Andrusha, Mitya) and the nursery scene in ch. 346 (Andrew, three-year-old Natasha).
- Pierre and Natasha's children include a delicate first child, then further children, and by ch. 348 a new baby son (unnamed there but referred to as "Petya" in ch. 348, "her only boy," a name that echoes Natasha's late brother Pyotr/Petya Rostov who died in the war) plus three daughters including eldest **Masha**.
- **Sonya** remains unmarried, living with Nicholas and Mary at Bald Hills as a devoted but somewhat sidelined member of the household — her status as the "sterile flower" (Natasha's Gospel-quotation metaphor in ch. 345) is preserved verbatim as a named literary reference, not softened.
- **Denisov** appears as a retired general, visiting the Rostov household for St. Nicholas's day (chs. 346, 350–352); his speech impediment (r → w) is preserved in the modern rendering exactly as in the source's phonetic spelling, since it's characterization, not translator artifact.
- The dinner/marriage logical argument in ch. 347 and the secret-society debate in ch. 351 both bear on Pierre's post-war political activity (the society founded with **Prince Theodore**, discussion of Arakcheev, the Bible Society, the Tugendbund) — kept consistent with ch. 350's mention of the same circle (Magnitsky, Golitsyn, Gossner, Tatarinova).

No relationship contradictions found across the twelve chapters; family lines (Rostov/Bolkonsky/Bezukhov) are internally consistent with the rest of the epilogue as given in the source.
