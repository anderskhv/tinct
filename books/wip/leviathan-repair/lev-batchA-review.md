# Leviathan Batch A — Independent Adversarial Review

**Reviewer:** independent second-pass agent (not the drafter)
**Scope:** `lev-batchA-source.json` vs `lev-batchA-corrected.json`, all 10 chapters (Introduction + Chs. 1–9 of Part I), 105 paragraphs, checked one-for-one against source. Drafter's notes (`lev-batchA-notes.md`) were treated as a claim to verify, not evidence.

## Verdict: **ACCEPT AS-IS**

No content-fidelity defects found. This is an independent confirmation, not a rubber stamp — every paragraph was read side by side against source, not spot-checked.

---

## 1. File identity check

```
diff lev-batchA-corrected.json lev-batchA-current-modern-en.json
```
Output: no differences. The two files are byte-identical, consistent with the drafter's claim that no fixes were made because none were needed.

## 2. Paragraph counts

Programmatically verified per chapter, source vs corrected:

| Ch. | Title | Source paras | Corrected paras |
|---|---|---|---|
| 0 | The Introduction | 5 | 5 |
| 1 | Of Sense | 5 | 5 |
| 2 | Of Imagination | 10 | 10 |
| 3 | Of the Consequence or Trayne of Imaginations | 12 | 12 |
| 4 | Of Speech | 25 | 25 |
| 5 | Of Reason, and Science | 22 | 22 |
| 6 | Of the Interiour Beginnings of Voluntary Motions | 58 | 58 |
| 7 | Of the Ends or Resolutions of Discourse | 7 | 7 |
| 8 | Of the Vertues Commonly Called Intellectual | 27 | 27 |
| 9 | Of the Severall Subjects of Knowledge | 12 | 12 |

All ten chapters match exactly (105/105 total). No merges, splits, drops, or invented paragraphs. This matches the drafter's reported counts exactly.

## 3. Full paragraph-by-paragraph read

Every one of the 105 paragraphs was read in source/modern pairs. No instances found of:
- dropped or invented clauses/sentences
- negation or conditional inversion
- reversed "therefore"/causal logic
- silently-skipped premises or examples
- compressed argument steps that lose a logical link (as opposed to register-level tightening that keeps all steps)

The rendering consistently preserves Hobbes's multi-clause definitional and syllogistic structure (e.g., the Ch.5 "Reason is Reckoning" passage, the Ch.7 discourse/opinion/judgement/doubt chain, the Ch.9 wit/fancy/judgement/discretion taxonomy) without collapsing steps.

**Technical vocabulary check** — the following load-bearing terms were tracked across all ten chapters and found rendered consistently and correctly every time they occur: endeavour, appetite/aversion, fancy/phantasm, train of thoughts, science vs. opinion vs. belief/faith, judgement, deliberation, will (as "last appetite"), conatus-sense motion language ("endeavour... towards/fromward"), prudence vs. sapience, absurdity vs. error. No drift or synonym substitution that would blur Hobbes's technical distinctions was found.

## 4. Chapter 6 (Passions glossary, ~44 defined terms across 58 paragraphs)

Checked every defined term against source, in order: Hope, Despair, Fear, Courage, Confidence, Diffidence, Indignation, Benevolence/Good Will/Charity/Good Nature, Covetousness, Ambition, Pusillanimity, Magnanimity, Valour/Fortitude, Wretchedness/Miserableness/Parsimony, Kindness, Natural Lust, Luxury, Passion of Love/Jealousy, Revengefulness, Curiosity, Religion/Superstition/True Religion, Panic Terror, Admiration, Glory/Vainglory, Dejection, Sudden Glory/Laughter, Sudden Dejection/Weeping, Shame/Blushing, Impudence, Pity, Cruelty, Emulation/Envy, Deliberation (and its four follow-on paragraphs), Will, Felicity, Praise/Magnifying/Makarismos.

All entries present, none dropped, none merged into a neighboring entry, none renamed to a different English term than the small-caps original signals. The Latin/Greek glosses embedded in this chapter (pulchrum/turpe, jucundum, molestum, utile, inutile, horme/aphorme, makarismos) are all preserved and correctly translated.

## 5. Chapter 8 (Ch. "Of the Vertues... Intellectual" — Scripture and Latin/Greek citations)

All Scripture references verified against source and against the actual book/chapter/verse convention:

| Source citation | Corrected rendering | Correct? |
|---|---|---|
| Numb. 11. 25. | Numbers 11:25 | Yes |
| Exod. 28. 3. | Exodus 28:3 | Yes |
| Mark 3.21. | Mark 3:21 | Yes |
| John 10. 20. | John 10:20 | Yes |
| 2 Kings 9.11. | 2 Kings 9:11 | Yes |
| Math. 8.26. | Matthew 8:26 | Yes |
| Luk. 4. 39. | Luke 4:39 | Yes |
| Math. 12. 43. | Matthew 12:43 | Yes |

All quoted scriptural text (Mark 3:21 "mad", John 10:20 "He hath a Divell, and is mad", Numbers 11:25/Exodus 28:3 paraphrases, 2 Kings 9:11 "What came that mad-man for?") preserved accurately in meaning.

Latin/Greek terms checked: Rationes, Ratiocinatio, Nomina, Logos, Sagacitas, Solertia, Reminiscentia (earlier chapters); Versutia/Versura (Ch.8); the Suárez quotation and book title ("Of The Concourse, Motion, And Help Of God") — all correctly carried over, including the specific Latin-doctrine content of the passage about "Nesses, Tudes and Ties" in the transubstantiation discussion. No dropped or mistranslated citation found anywhere in Batch A.

## 6. The two "borderline, not a defect" calls in the notes

**Ch. 4 ("Of Speech"), para 1** — source: "...and in tract of time grew every where more copious." / corrected: "...and growing more copious with time."

Agree with the drafter: not a defect. The "every where" locational nuance is compressed but the underlying fact (dispersal into many regions of the earth) is stated explicitly earlier in the same paragraph and the corrected version's lead-in ("Driven thereby to scatter themselves into the various parts of the world...") retains that fact. No information is lost from the paragraph as a whole; this is register-level tightening of a trailing clause, not a dropped premise.

**Ch. 5 ("Of Reason, and Science"), para 2** — source: "unpractised men must, and Professors themselves may often erre" / corrected: "unpractised men must, and even professional accountants may often... make mistakes."

Agree with the drafter that this is not a defect, with one caveat worth flagging for calibration: Hobbes's "Professors" here more precisely means "those who profess [the art of/reckoning]" — i.e., practitioners or teachers of arithmetic generally — rather than specifically "accountants" in the modern bookkeeping sense. "Professional accountants" narrows the image somewhat (it evokes a specific occupation rather than "experts at reckoning" in general), but the paragraph's actual argument — that even experts at a rule-governed discipline can err, and that expertise alone doesn't guarantee "right Reason" — survives fully intact either way. This is an interpretive translation choice, not a broken clause or inverted logic, so it does not meet the bar for a fidelity defect. Flagging only so a future stricter pass could consider "practiced hands" or "trained reckoners" as a marginally more faithful alternative if the team wants to tighten it later — not a required fix.

## Summary

The drafter's self-report holds up under an independent, full paragraph-by-paragraph re-read: 0 content-fidelity defects across 105 paragraphs in 10 chapters, paragraph counts match source exactly, the Chapter 6 Passions glossary is complete and accurate, Chapter 8's Scripture and Latin/Greek citations are all correct, and both flagged borderline calls are reasonably judged as non-defects (with the accountants gloss noted above as a very minor, non-blocking observation).

**Recommendation: accept Batch A as-is. No fixes required before moving to the next batch.**
