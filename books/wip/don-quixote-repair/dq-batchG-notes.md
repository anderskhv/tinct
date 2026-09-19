# Don Quixote — Batch G Content-Fidelity Repair Notes

**Scope:** `dq-batchG-current-modern-en.json` vs. `dq-batchG-source.json` (locked ground truth), Part II, Chapters 15–25 (numbered 67–77), 11 chapters, 325 paragraphs total.

**Method:** Every paragraph of every chapter was read side by side against the source, in full (no skimming/sampling), checking for dropped or invented clauses/sentences, meaning inversions, compression of the elaborate set-piece descriptions (lion adventure, Camacho's wedding feast, the allegorical dance, the cave of Montesinos narration, the braying-town tale), factual/plot distortions (names, places, objects, numbers), and any other fidelity break. This was followed by an automated cross-check comparing every numeral token (ages, counts of items, distances, sums of money, fathoms of rope, etc.) between source and current text, paragraph by paragraph.

## Result: No content-fidelity defects found in any of the 11 chapters.

This batch's modern-English rendering is a comprehensive, high-fidelity paraphrase of the source. Register/wording choices differ throughout (e.g. "Isn't it odd" → "Isn't it strange", contractions added, "thou/thee" replaced with "you", chapter titles turned into sentence case), which is expected and correct for a modern-English edition — but at the clause and sentence level, nothing is dropped, nothing is added, no meaning is reversed, and no names, numbers, places, or objects are altered. This includes the passages most at risk of trimming:

- The keeper's lion-cage standoff (Ch. 69/source 17) retains every beat: the yawn, the stretch, the tongue "nearly two palms' length," the lion presenting its hindquarters, the keeper's refusal to prod it, and Don Quixote's demand for a written certificate of the non-event.
- Camacho's wedding feast inventory (Ch. 72/source 20) keeps the full catalogue: the whole spitted ox, the six half-wine-jar stewpots swallowing whole sheep, "more than sixty wineskins of over six gallons each," the cheese wall, the two oil cauldrons for fritters, "over fifty" cooks, and the dozen suckling pigs sewn into the ox's belly.
- The allegorical "speaking dance" of Cupid vs. Interest (Ch. 72/source 20) preserves all eight nymph names (Poetry, Wit, Birth, Valour / Liberality, Largess, Treasure, Peaceful Possession), all four verse speeches, and the castle mechanism (boards collapsing, gold chain, wild men repairing it).
- Basilio's staged suicide and revival (Ch. 73/source 21) keeps every staging detail: the hollow rapier sheath, the concealed iron tube of non-clotting blood, the sequence of the forced marriage vow before the "wound" is examined, and Camacho's men drawing swords afterward.
- The cave of Montesinos narration (Ch. 75/source 23) — by far the longest and most digression-prone passage in the batch — preserves the full genealogy of enchanted figures (Durandarte, Belerma, Guadiana, Ruidera and her seven daughters and two nieces), the heart-extraction backstory, Dulcinea's begging-messenger episode with the four reales, and all the verse insertions.
- The braying-town tall tale (Ch. 77/source 25) keeps the full comic back-and-forth between the two regidors, including the countersign of doubled brays and the punchline that the ass had already been eaten by wolves.

A supplementary automated check comparing every numeral appearing in each source paragraph against its counterpart (ages, distances in leagues, sums of reales/crowns, counts of dancers/liveries/lakes/fathoms of rope, etc.) found zero mismatches across all 325 paragraphs.

## Chapter-by-chapter verdicts

| Ch. # | Title | Paragraphs | Verdict |
|---|---|---|---|
| 67 | Part 2, Ch. 15 — Knight of the Mirrors revealed | 7 | Clean |
| 68 | Part 2, Ch. 16 — Don Diego de Miranda | 28 | Clean |
| 69 | Part 2, Ch. 17 — Adventure of the lions | 44 | Clean |
| 70 | Part 2, Ch. 18 — Castle of the Knight of the Green Gaban | 47 | Clean |
| 71 | Part 2, Ch. 19 — The enamoured shepherd (Basilio/Quiteria setup) | 24 | Clean |
| 72 | Part 2, Ch. 20 — Camacho's wedding | 36 | Clean |
| 73 | Part 2, Ch. 21 — Camacho's wedding continued (Basilio's trick) | 19 | Clean |
| 74 | Part 2, Ch. 22 — Cave of Montesinos (approach) | 29 | Clean |
| 75 | Part 2, Ch. 23 — Cave of Montesinos (the vision) | 40 | Clean |
| 76 | Part 2, Ch. 24 — Trifling matters / the braying town | 26 | Clean |
| 77 | Part 2, Ch. 25 — Braying adventure / Master Pedro's ape | 25 | Clean |

## Defects found and fixed

None. No edits were made to any paragraph. `dq-batchG-corrected.json` is a verified byte-identical copy of `dq-batchG-current-modern-en.json` (paragraph counts and content unchanged), produced to satisfy the deliverable format.

## Verification

Programmatic check confirms `dq-batchG-corrected.json` has exactly 11 chapters with paragraph counts matching `dq-batchG-source.json` exactly (7, 28, 44, 47, 24, 36, 19, 29, 40, 26, 25 — total 325).
