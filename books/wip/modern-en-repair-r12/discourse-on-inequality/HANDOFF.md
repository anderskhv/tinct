# discourse-on-inequality — r12 content handoff

Status: content repair staged; whole-book similarity gate PASS. Not integrated or published. Inherited style conflicts in retained REAL prose are explicitly recorded below.

## Ownership and baseline

Repository: anderskhv/tinct. Branch: content/modern-en-repair-r12.
Instruction and source revision: c268646674fed34ef73cf8ecf32d7c54ebabce40 (remote main).
Owned path: books/wip/modern-en-repair-r12/discourse-on-inequality/ only.
Both live editions were copied byte-for-byte from app/public/data/editions/ at the pinned revision, matching the local live files. The prior modern edition is preserved separately as discourse-on-inequality-modern-en.before.json. No alternative source substituted.

## Changed coordinates

All coordinates use 1-based chapter and paragraph array positions.

- ch4 p1–67: Part 2 repaired sentence by sentence. Latin quotations in p35 and p62 restored verbatim to the original, rather than translated or paraphrased; both are under 40 words. All other paragraphs freshly rendered. The complete quoted edict in p48 is modernised within its quotation marks, preserving its entire argument, Plato, the exclamation and note marker.
- ch3 p22: punctuation only. The prior modern had two exclamation marks against one in the original. The added exclamation after “heavens” is restored to the source period. No prose changes in this REAL chapter.
- Chapters 1 and 2 unchanged. All other chapter 3 paragraphs unchanged. No identical paragraph over 40 words existed in the other chapters.

68 changed paragraph coordinates are recorded in changed-paragraphs.json. No chapter or paragraph merging, splitting, dropping or reordering.

## Gates and checks

| Measure | Before | After |
|---|---:|---:|
| Weighted similarity | 0.798 | 0.616 |
| LIGHT + MECHANICAL | 1/4 (25.0%) | 0/4 (0.0%) |
| Identical long paragraphs (classifier >=80 characters) | 0/166 (0.0%) | 2/166 (1.2%) |
| Wrapped scaffolding | 0 | 0 |
| Truncated quotations | 0 | 0 |
| Whole-book gate | FAIL | PASS |

The two identical paragraphs are the preserved Latin quotations, ch4 p35 and p62; neither exceeds 40 words. Part 2 similarity is 0.408. All 4 chapters and 170 paragraphs align. Every paragraph has at least 75% of its source word count (minimum 0.750). Exclamation counts match the original in every paragraph. Bracket counts match in all changed paragraphs; no newly wrapped notes or editorial reading text. Original straight quotation marks/apostrophes and original spelling conventions are used in the rewritten Part 2. Full evidence: gate-before.txt, gate-after.txt and QA.json.

Gate command: `python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r12/discourse-on-inequality/discourse-on-inequality --gate`.
Candidate SHA-256: `e735a6c0be61bc7966c15aa5f3ba10a9093154b466930bd8cdcf8f007cf79b5e`. See SHA256SUMS for all JSON hashes.

## Three spot-reads

1. Dedication, ch1 p1–3: unchanged REAL prose retains the address to the sovereign lords, Geneva's combination of equality and inequality, and the argument for a wisely tempered democracy. Inherited American spelling observed and retained under the REAL-chapter restriction.
2. Part 1, ch3 p1–3: unchanged REAL prose retains Aristotle, the limits of comparative anatomy, the hypothetical human bodily form, and the contrast between animal instinct and human adaptability.
3. Part 2, ch4 p1–3 plus p33 and p67: the founding enclosure and its complete warning remain; the backward hypothetical reconstruction and instinctive account of reproduction remain; p33 preserves the landless becoming poor without losing possessions and the wolf comparison; p67 retains both deductions and all three closing examples of unjust inequality.

Additional changed-text review: agriculture/metallurgy and deer/hare cooperation examples preserved; Grotius/Ceres/Legislatrix/Thesmophoria preserved; Locke, Sidney, Pliny, Trajan, Brasidas, the Satrap and Persepolis retained; final Diogenes/Cato/Caribean comparisons and two exclamations in p66 retained. The p61 introduction to Lucan now ends with a complete sentence, followed by the Latin in its unchanged separate paragraph.

## Known issues and decisions

- The instruction to leave REAL prose alone conflicts with whole-book source spelling consistency: the retained chapters use inherited American forms such as “honors”, “labor”, “organized” and “ax”, while the original and repaired Part 2 use British forms. No prohibited dictionary/regex spelling pass was used, and the retained REAL prose was not rewritten. Whole-book spelling consistency is therefore NOT claimed.
- The original's Part 2 contains apparent typographical defects. Rendering restores the evident readings in context: p4 “vigorous in light” becomes strength in fighting; p25 “very fang” becomes a very long time; p56 “longs of kings” becomes kings of kings; p59 “growing equality” is read as growing inequality, matching the paragraph's argument. The original staging file remains unchanged. These explicit source-reading decisions should be checked in any later source-edition audit.
- The original has a multi-paragraph formal valediction (ch1 p24–26) and standalone heading paragraphs in the Preface. Their structure is retained, not merged or converted into new prose. Reference markers are preserved; absent source apparatus is not invented.
- books/characters/discourse-on-inequality/ does not exist in this checkout. No character content changed. Integration must use the changed coordinates to check mentions and exact-text narration cache identity.
- No app, registry, live edition, scripts or configuration edited; no deploy; no narration generation; zero Anthropic API calls.
