# Independent Adversarial Review — Montaigne Batch H (Chapters 78–88)

**Reviewer:** independent second-pass agent (did not trust drafter's notes; re-read against
source directly)

**Verdict: ACCEPT AS-IS.**

---

## 1. Diff check: current-modern-en.json vs corrected.json

Loaded both files as JSON and compared chapter objects for exact equality (`a == b` for every
paragraph, every chapter). Result: **the two files are byte-for-byte identical** — all 11
chapters, all 184 paragraphs match exactly.

This is the *correct* state, not a sync bug. Per the task brief, `current-modern-en.json` is
already described as "the modern-English text AFTER this pass's fix," and `corrected.json` is
described as the file that "should equal current-modern-en.json." Since there is no third
"pre-fix" file in this batch to diff against, identical files here mean the fix was written to
both outputs consistently — not that a fix failed to propagate. (I confirmed this is unlike the
propagation-bug pattern the task warned about, where corrected.json and current-modern-en.json
diverge; here they do not.)

I independently confirmed the claimed fix is actually present in the text (not just claimed in
notes): ch. 78, paragraph index 7, reads "Moulay Abd al-Malik, king of Fez..." in both files.

## 2. Historical verification of the claimed fix

Source (locked ground truth), ch. 78 para 7: "**Mule Moloch**, king of Fez, who lately won
against Sebastian, king of Portugal, the battle so famous for the death of three kings..." —
this is the Battle of Alcácer Quibir / Battle of the Three Kings, 4 August 1578.

Historical fact-check against my own knowledge, independent of the notes file:

- **Abd al-Malik I Saadi (Moulay Abd al-Malik)** was the reigning Sultan of Morocco. He was
  gravely ill during the campaign and had himself carried in a litter, continuing to direct his
  army while dying; he died during the battle, and, per tradition, his death was concealed from
  his own troops to prevent panic (matching the paragraph's later detail about him signaling for
  silence with his finger to his lips). "Mule Moloch" is a period English rendering of "Moulay
  al-Malik."
- **Sebastian I of Portugal**, the young king who invaded, was killed in the battle (one of the
  "three kings" who died that day).
- **Abu Abdallah Mohammed II Saadi (Moulay Mohammed al-Mutawakkil)**, the deposed rival claimant,
  had allied himself with Sebastian's Portuguese invasion force in hopes of regaining his throne;
  he drowned in the Wadi al-Makhazine while fleeing the rout — the third of the "three kings."

This confirms the drafter's account is historically correct: "Mule Moloch" = Moulay Abd al-Malik
(the dying, litter-borne sultan the paragraph actually describes), not Moulay Mohammed (his
rival, on the opposite/Portuguese-allied side, who drowned fleeing). The claimed pre-fix defect
— substituting "Moulay Mohammed" — would have misattributed the entire anecdote to the wrong
historical figure, indeed reversing which side he was on. The fix to "Moulay Abd al-Malik" is
correct and necessary. **Confirmed independently, not merely trusted.**

## 3. Full independent paragraph-by-paragraph read, all 11 chapters

I read every paragraph of all 11 chapters (184 total) against source myself, not relying on the
notes file's claims. Method: programmatic length-ratio scan (flagged nothing outside normal
paraphrase variance — no ratio below 0.55 or above 1.8), a bracket/citation-count scan (one
formatting-only anomaly, see below), and full manual side-by-side reading of every paragraph,
with particular attention to the three graphic passages the notes file specifically claims were
checked:

- **Ch. 86, para 2–4 (castration by sickle / self-mutilation):** Fully present and unsoftened
  in both the peasant-with-the-sickle episode ("cut off then and there all those parts of
  himself that she was jealous of, and threw them in her face") and the young gentleman's
  self-castration ("cut off the offending member and sent it to his mistress as a cruel and
  bloody offering"). No euphemism, no omission, matches source in full anatomical/narrative
  detail.
- **Ch. 86, para 6–9 (sati / widow immolation):** The long, detailed description of the funeral
  ritual — including the widow's public speech, ritual bathing, immolation, and the alternative
  live-burial-with-neck-twisting for lower-status widows — is rendered in full, paragraph 9
  essentially clause-for-clause with source, with no detail dropped or softened.
- **Ch. 84, para 28–32 (torture / cannibalism):** Theoxena's mass filicide-and-suicide (para 28),
  the crucifixion/Josephus anecdote (para 30), Chalcondylas's account of Mehmed's bisection
  torture and the flaying of Epirot lords (para 31), and the Croesus/George Sechel
  cannibalism-and-torture passage — including forcing the captured leader's brother to drink his
  blood and twenty captains to eat his flesh, then boiling and forcing others to eat his remains
  (para 32) — are all present in full, unsoftened, matching source almost clause-for-clause.

I also read the remaining eight chapters (79, 80, 81, 82, 83, 85, 87, 88) paragraph-by-paragraph
in full. All are close, faithful modernizations. Notably verified:
- Ch. 87's graphic clinical description of the conjoined-twin infant and the intersex herdsman —
  full anatomical detail preserved, nothing sanitized.
- Ch. 88's Piso anecdote (para 15), where three men are executed after one is found to have been
  wrongly condemned — the double/triple-execution logic is preserved exactly, not softened or
  inverted.
- All Latin/Greek/Italian citations and their bracketed English glosses, with attributions,
  checked chapter by chapter — all present and correctly paired with their source lines.
- Numeric/quantitative details spot-checked (troop distances, monetary sums, time spans, ages,
  body counts) — no distortions found.

## 4. Other fidelity issues found

**One minor, non-content formatting slip** (not a fidelity break, but noting for completeness
since the task asks me to look for anything): Ch. 78, paragraph index 9. Source wraps the
English gloss of a Latin quotation in brackets: `["Piled up not only in slaughter but in
flight."]`. The modern-en rendering drops the enclosing brackets: `Piled up not only in
slaughter but in flight.` The text itself is unchanged and correctly translated; only the
bracket-as-gloss-marker convention (used consistently everywhere else in the batch for
citation translations) is missing in this one instance. This does not affect meaning, does not
misattribute anything, and does not warrant blocking acceptance — flagging only so the team can
optionally normalize formatting.

No dropped/invented clauses, no negation or conditional inversions, no compressed passages, no
dropped citations or anecdotes, and no other factual/historical distortions were found anywhere
in the batch besides the already-identified and already-corrected ch. 78 name misattribution.

I also independently reviewed the notes file's one "considered and rejected as false positive"
item — ch. 81 para 4, "king of England" (source) vs. "king of Britain" (modern-en) — and agree
with the drafter's judgment: this is a defensible anachronism fix (Roman-era Britain, not
England) that changes no fact Montaigne is making a point about, and does not need reverting.

## 5. Paragraph counts

Verified programmatically, chapter by chapter, cur vs. src:

| Ch. | Title | Paragraphs (cur) | Paragraphs (src) |
|---|---|---|---|
| 78 | Against idleness | 12 | 12 |
| 79 | Of posting | 9 | 9 |
| 80 | Of ill means employed to a good end | 23 | 23 |
| 81 | Of the Roman grandeur | 8 | 8 |
| 82 | Not to counterfeit being sick | 8 | 8 |
| 83 | Of thumbs | 12 | 12 |
| 84 | Cowardice the mother of cruelty | 33 | 33 |
| 85 | All things have their season | 17 | 17 |
| 86 | Of virtue | 20 | 20 |
| 87 | Of a monstrous child | 9 | 9 |
| 88 | Of anger | 33 | 33 |

All 11 chapters match exactly (184 total paragraphs both sides).

---

## Summary

The drafter's self-report is corroborated on independent, from-scratch verification: the single
claimed defect (ch. 78 para 7, "Moulay Mohammed" → "Moulay Abd al-Malik") is real, historically
correct as fixed, and correctly applied in both output files, which are identical to each other
(no propagation bug in this batch). No additional defects were found across all 184 paragraphs
of the batch. The three graphic/frank passages the notes file cites as checked-and-unsoftened
are confirmed independently to be complete and unsoftened. One trivial bracket-formatting
inconsistency (ch. 78 para 9) is noted but does not affect content fidelity.

**Recommendation: accept as-is.**
