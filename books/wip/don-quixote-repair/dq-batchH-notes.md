# Don Quixote — Batch H Content-Fidelity Review

**Scope:** `dq-batchH-current-modern-en.json` (11 chapters, Part II chapters 26–36 / global numbers 78–88) checked paragraph-by-paragraph against `dq-batchH-source.json` (locked ground truth).

**Method:** Every paragraph in every chapter was read side by side, source vs. modern-English rendering (330 paragraph pairs total). Checked for dropped/invented clauses, meaning inversions, compression of detail, factual/plot distortions (names, places, objects), and any other fidelity break. Paragraph counts were verified programmatically to match the source before and after (all 11 chapters, exact per-chapter counts: 39, 11, 19, 27, 24, 46, 45, 28, 27, 24, 25 — all match source, all match `dq-batchH-corrected.json`).

**Result: no fidelity defects found in any of the 11 chapters.** The modern-English rendering is a faithful, complete, line-for-line modernization throughout. Consequently `dq-batchH-corrected.json` is byte-identical to `dq-batchH-current-modern-en.json` — no edits were needed.

## Per-chapter verdicts

| # | Title | Paragraphs | Verdict |
|---|-------|-----------|---------|
| 78 | Part 2, Ch. 26 — Puppet-showman adventure concludes | 39 | Clean. Every clause of the Don Gaiferos/Melisendra puppet narration, the Don Quixote rampage, and the itemized damages negotiation (four reals and a half for Marsilio, five and a quarter for Charlemagne, two reals twelve maravedis for noseless Melisendra, sixty maravedis for the "waiting-maid," forty reals three-quarters total, two more for the ape) is preserved intact and in the correct amounts. |
| 79 | Part 2, Ch. 27 — Master Pedro/Gines de Pasamonte revealed; braying adventure | 11 | Clean. Backstory of Gines de Pasamonte, the Brunello/Sacripante allusion, Don Quixote's full speech on when communities may take offense (five causes for taking up arms), and the fight/retreat all preserved with no compression. |
| 80 | Part 2, Ch. 28 — Aftermath of the braying adventure | 19 | Clean. Sancho's tirade about wages (two ducats/month at Tom Carrasco's, the "twenty years" joke, the arithmetic exchange) and Don Quixote's rebuke are complete and undistorted. |
| 81 | Part 2, Ch. 29 — The enchanted bark | 27 | Clean. All of Don Quixote's pseudo-cosmography (equinoctial line, lice test, Ptolemy), the capsizing at the mill wheels, and the 50-real settlement with the fishermen are intact. |
| 82 | Part 2, Ch. 30 — The Duchess and the hunt invitation | 24 | Clean. Full dialogue preserved, including Sancho's message to the duchess and the fall from Dapple/Rocinante. |
| 83 | Part 2, Ch. 31 — Arrival at the ducal castle | 46 | Clean. Full exchange with Doña Rodriguez over Dapple, Sancho's rambling story about the two gentlemen and the seat of honor, and the ecclesiastic's angry rebuke of Don Quixote are all complete, including every proverb and aside. |
| 84 | Part 2, Ch. 32 — Don Quixote's reply to the churchman | 45 | Clean. Don Quixote's full defense-of-chivalry speech, the offense-vs-insult disquisition, the beard-washing prank (both on Don Quixote and, reciprocally, on the duke), and Don Quixote's long disquisition on Dulcinea's enchantment/lineage are all preserved in full, with no compression of the reasoning chains. |
| 85 | Part 2, Ch. 33 — Duchess and damsels' conversation with Sancho | 24 | Clean. Sancho's confession that he invented the Dulcinea deception, his proverb-strings, and the duchess's counter-theory that Sancho himself was deceived are intact. |
| 86 | Part 2, Ch. 34 — Learning how to disenchant Dulcinea | 27 | Clean. The boar hunt, Sancho's fall from the oak, and the full staged "infernal" procession (the devil-courier, the three enchanter carts — Lirgandeo, Alquife, Archelaus) are preserved with all names and details correct. |
| 87 | Part 2, Ch. 35 — Merlin's instructions; the 3,300 lashes | 24 | Clean. Merlin's verse speech (reformatted with line breaks in the modern-en, which is a formatting choice, not a fidelity issue — every line of content is present), the exact lash count (three thousand three hundred), the terms Sancho negotiates (self-administered, no fixed schedule, no blood required, fly-swatter blows count, Merlin keeps the tally), and Dulcinea's/the nymph's speech are all complete and unaltered in substance. |
| 88 | Part 2, Ch. 36 — The Distressed Duenna (Trifaldi) arrives; Sancho's letter | 25 | Clean. Sancho's full letter to Teresa Panza (with all specific details: green hunting suit, "Aldonza Lorenzo," 3,300-minus-5 lashes, the missing second valise of a hundred crowns, the 20 July 1614 dateline) and Trifaldin's speech introducing the Countess Trifaldi are complete and accurate. |

## Notes on scope

This batch (global chapters 78–88 / Part II chapters 26–36) covers: the end of the puppet-show adventure, the braying-town adventure, the enchanted-bark adventure, the arrival at the Duke and Duchess's castle, the Merlin/Dulcinea-disenchantment masque (establishing the 3,300-lashes premise), and the opening of the Distressed Duenna (Trifaldi) episode. **Sancho's actual governorship of Barataria and its series of judicial riddles occurs later in the novel** (Part II, chapters 42 onward) and is not part of this batch — there was nothing of that material to check here. No defects of any kind (dropped clauses, inversions, compression, factual/plot distortions, or comic-content softening) were found anywhere in these 11 chapters.

## Output files

- `dq-batchH-corrected.json` — identical to `dq-batchH-current-modern-en.json` (no changes required); paragraph counts verified to match source programmatically (11 chapters, counts 39/11/19/27/24/46/45/28/27/24/25).
- `dq-batchH-notes.md` — this file.
