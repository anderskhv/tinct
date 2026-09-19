# Don Quixote — Batch H Independent Adversarial Review

**Scope:** Chapters 78–88 (Part II, chs. 26–36) of `dq-batchH-current-modern-en.json`, checked against `dq-batchH-source.json`. This is an independent re-check of the drafter's self-reported "0 defects found" — the drafter's notes and verdicts were treated as an unverified claim, not evidence.

## Verdict: ACCEPT AS-IS

No fidelity defects were found. The modern-English rendering is complete, accurate, and faithful across all 11 chapters. The drafter's "0 defects" claim holds up under independent re-verification.

## What was checked

1. **File identity.** `dq-batchH-corrected.json` and `dq-batchH-current-modern-en.json` are byte-identical (`diff` returns no output). Confirmed.

2. **Paragraph counts.** All 11 chapters match the source exactly, paragraph-for-paragraph:

   | Ch | Source paras | Modern-en paras | Match |
   |----|-----|-----|-----|
   | 78 | 39 | 39 | yes |
   | 79 | 11 | 11 | yes |
   | 80 | 19 | 19 | yes |
   | 81 | 27 | 27 | yes |
   | 82 | 24 | 24 | yes |
   | 83 | 46 | 46 | yes |
   | 84 | 45 | 45 | yes |
   | 85 | 28 | 28 | yes |
   | 86 | 27 | 27 | yes |
   | 87 | 24 | 24 | yes |
   | 88 | 25 | 25 | yes |

3. **Programmatic compression scan.** Computed a word-count ratio (modern-en words / source words) for all 315 non-empty paragraph pairs. Not one paragraph with 15+ source words fell below a 0.6 ratio; the lowest ratios found were in the 0.80–0.90 range and occurred only in very short paragraphs (5–40 words), which is expected noise from idiomatic modern phrasing, not compression. No paragraph shows the kind of steep word-count collapse that would indicate a dropped clause, summarized passage, or skipped sentence.

4. **Full manual paragraph-by-paragraph read of the four passages flagged as highest-risk in the task brief**, plus additional spot-checks:
   - **Ch. 78, puppet-show damages negotiation (paras 20–38):** every itemized amount checked against source — four reals and a half for Marsilio, five and a quarter for Charlemagne, two reals twelve maravedis for the noseless Melisendra, sixty maravedis for the "waiting-maid" figure, forty reals three-quarters as the running total, two more reals for catching the ape, and Don Quixote's closing offer of "two hundred" for news of the real Melisendra and Gaiferos. All figures, all clauses, all dialogue beats preserved exactly.
   - **Ch. 79, full text (all 11 paragraphs) read side by side:** Gines de Pasamonte backstory, the Brunello/Sacripante allusion, Don Quixote's full five-cause speech on when a community may take offense (Don Diego Ordoñez/Zamora example, the "clock town"/Cazoleros/Berengeneros/Ballenatos/Jaboneros catalogue), Sancho's bray demonstration, and the retreat — nothing compressed or dropped.
   - **Ch. 84, full text (all 45 paragraphs) read side by side:** Don Quixote's defense-of-chivalry speech to the churchman, the offense-vs-insult disquisition (both worked examples — the ten-against-one street beating and the coward who strikes from behind — fully intact), the double beard-washing (Don Quixote, then reciprocally the duke), and the long Dulcinea-enchantment/lineage exchange with the duchess and duke. Every proverb, every rhetorical turn present.
   - **Ch. 87, full text (all 24 paragraphs) read side by side:** Merlin's verse speech is reformatted with line breaks in the modern-en (a legitimate formatting choice — Ormsby's source also prints this as verse, just run together as prose text in this particular JSON) but every line of content is present, including "three thousand three hundred lashes." The exact negotiation terms are all preserved: self-administered and voluntary, no fixed schedule, permission to commute half the count to another (heavier) hand — which Sancho refuses, no blood required, fly-swatter-weight blows still count, Merlin keeps the tally and will notify only of shortfall not excess. Sancho's "6,600 lashes" threat from Don Quixote and the Dulcinea-nymph's full reproach speech are both complete.
   - **Ch. 88, Sancho's letter to Teresa Panza (paragraph 16), read in full:** every specific detail confirmed — the green hunting suit to be made into a petticoat/bodice for their daughter, "Aldonza Lorenzo" as Dulcinea's home-town name, "three thousand three hundred lashes, less five" (matching the five lashes Sancho reports giving himself the night before, in paragraph 2), the missing second valise with a hundred crowns, and the "20th of July, 1614" dateline. Trifaldin's introduction speech and the duke's reply (paras 21–24) also read in full and confirmed complete.

5. **Named-entity check.** Confirmed by exact string match (not just skim) that ch. 86's three enchanter names — Lirgandeo, Alquife, Archelaus — appear correctly and identically in both source and modern-en, each tied to the correct cart/speech.

6. **Additional spot-checks of the longest remaining paragraphs** in chapters 80, 81, 82, 83, 85, and 86 (11 paragraphs, 245–602 source words each) — Sancho's wages tirade and "twenty years" exchange (ch. 80), the enchanted-bark launch and the mill-wheel capsizing (ch. 81), the Dapple stirrup mishap on arrival (ch. 82), the dressing-room scolding and the ecclesiastic's tirade (ch. 83), the duchess's doubt about Dulcinea and the "ant got wings" proverb string (ch. 85), and the full infernal-procession passage (ch. 86) — all read clean, with no inversions, no dropped clauses, and no altered facts (names, numbers, places all correct).

## Notes on scope claim

The batch H notes' claim that Sancho's actual governorship of Barataria is not in this batch, and only appears from Part II ch. 42 onward, is correct — this batch ends with the arrival of Trifaldin and the setup of the Distressed Duenna episode (ch. 88), well before the governorship narrative begins. This scope note is accurate and does not obscure or paper over anything in the batch that was actually skipped.

## Conclusion

No defects — of any category (dropped clauses, compression, meaning inversions, factual/name/number distortions, or comic-content softening) — were found anywhere in the 11 chapters after an independent, adversarial re-read that did not rely on the drafter's notes. `dq-batchH-corrected.json` requires no changes. Recommend accepting batch H as-is.
