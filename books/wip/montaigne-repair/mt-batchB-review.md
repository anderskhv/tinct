# Montaigne Batch B — Independent Adversarial Review

Scope: `mt-batchB-current-modern-en.json` / `mt-batchB-corrected.json` (chapters
12–22, 266 paragraphs across 11 chapters) checked against locked ground truth
`mt-batchB-source.json`. This review does **not** take the drafter's
"0 defects" self-report at face value; every paragraph in all 11 chapters was
independently read side-by-side against source, not spot-checked.

## Verdict: ACCEPT AS-IS

I independently confirm the drafter's conclusion. No content-fidelity defects
found anywhere in the batch: no dropped or invented clauses, no meaning
inversions, no compressed/summarized passages, no dropped classical
citations or anecdotes, and no factual/historical distortions. This includes
full paragraph-by-paragraph verification of both flagged high-risk chapters.

## 1. corrected.json vs current-modern-en.json

Confirmed byte-identical via `diff` — no discrepancy. The notes' claim that
`mt-batchB-corrected.json` is a straight copy (no edits made) is accurate.

## 2. Full paragraph-by-paragraph read — all 11 chapters

Read every paragraph of chapters 12–22 in full, source against modern-en,
including all embedded Latin/Greek/Italian citations and their bracketed
English glosses + attributions. Findings by chapter:

- **Ch. 12 (Of constancy, 8 paras):** Faithful. Stoic/Peripatetic distinction,
  Plataea/Scythian/Darius anecdotes, Marquis del Guasto and Lorenzo de'
  Medici cannon anecdotes, Virgil citation — all intact.
- **Ch. 13 (interview of princes, 4 paras):** Faithful. Clement/Francis and
  Pope/Emperor precedence anecdotes preserved with correct logic (greater
  arrives first as deference to lesser's territory).
- **Ch. 14 (obstinate defence, 4 paras):** Faithful. Montmorency/Pavia,
  Villano, San Buono anecdotes and the Portuguese-in-India law intact.
- **Ch. 15 (punishment of cowardice, 6 paras):** Faithful except for the one
  flagged judgment call (Fulvius — see §4 below), which is not a defect.
  Charondas legislation, Julian/Ammianus Marcellinus, Cannae, and
  Frauget/Fuenterrabia anecdotes all correct.
- **Ch. 16 (proceeding of ambassadors, 11 paras):** Faithful. Archidamus/
  Periander jeer, Caesar's bridge-building vs. military modesty, Charles
  V's Consistory speech (including the specific insult about the rope
  around his neck and the rapier-and-dagger boat challenge), P. Crassus/
  Greek-engineer mast anecdote — all intact and correctly attributed.
- **Ch. 17 (Of fear, 11 paras):** Faithful. Bourbon/Rome siege, Giulio's
  ensign, Germanicus, Emperor Theophilus, Pompey's-friends-at-Tyre, and the
  Carthage panic-terror anecdotes all preserved with correct outcomes.
- **Ch. 18 (happiness till after death, 14 paras):** Faithful. Croesus/
  Solon/Cyrus, Agesilaus/Priam, Pompey, Ludovico Sforza (ten years captive
  at Loches), the beheaded queen, Scipio/Pompey's father-in-law, and
  Epaminondas/Chabrias/Iphicrates all correct.
- **Ch. 19 (learn to die, 124 paras — highest scrutiny):** Faithful across
  all 124 paragraphs. Every classical citation checked against source
  (Cicero, Seneca, Horace, Virgil, Lucretius, Quintus Curtius, Claudian,
  Ovid, Catullus, Manilius, Silius Italicus, Propertius, Maximian) matches
  attribution and line reference exactly. All anecdotes intact: the
  Alexander/Christ death-age-33 comparison, the "curious deaths" catalogue
  (Aeschylus/tortoise, grape-seed choking, comb-scratch emperor, Aemilius
  Lepidus, Aufidius, the "between women's thighs" deaths list including
  Cornelius Gallus/Tigillinus/Ludovico Gonzaga/Speusippus and a Pope,
  Bebius, Caius Julius, and the author's own brother Captain St. Martin's
  tennis-ball death), the Caesar/old-soldier "you think you're still
  alive" anecdote, the long personified-Nature monologue (paras 78–122),
  and the closing reflection on death-in-war vs. death-at-home. No
  softening, no dropped anecdotes, no compression.
- **Ch. 20 (force of imagination, 26 paras):** Faithful, including the frank
  content the notes specifically flagged: Mary/Germain sex-change anecdote,
  Amasis/Laodice impotence anecdote with the Pythagoras daughter-in-law
  quote, the Count's wedding-night impotence-cure anecdote (full detail:
  ribbon, medal, nightgown, "more venereal than solar"), and the extended
  digression on the penis's "indocile liberty" as compared to farting,
  bowel movements, and involuntary bodily reflexes (including the man who
  "for forty years together made his master vent with one continued and
  unintermitted outbursting" and the man who could "break wind in tune") —
  all rendered without euphemism or omission, matching source register.
- **Ch. 21 (one man's profit, 3 paras):** Faithful. Demades anecdote and
  Lucretius citation intact.
- **Ch. 22 (Of custom, 55 paras — highest scrutiny):** Faithful across all
  55 paragraphs, including the full catalogue-of-customs passage (para 16
  — the longest paragraph in the batch by far). Verified line-by-line that
  every custom listed in source appears in modern-en in the same order with
  no drops: virgin/married-woman dress-exposure inversion, premarital
  prostitution + public abortifacients, tradesmen's-guild droit-du-seigneur-
  style bedding custom, wife-swapping/common wives, nose/lip/cheek/nipple/
  buttock piercings, cannibalizing and drinking the pulped bodies of the
  dead, being eaten by dogs/birds as honored burial, priests blinding
  themselves, circumcision of both sexes, mother-son and father-
  daughter/son incest without scandal, inter-family child-lending at
  feasts, human flesh-eating, ritual patricide at a certain age, infant
  culling, tassel-count-of-lovers as honor marker, and the women's-republic/
  army passage — all present, unsoftened, matching source wording register
  for register. The bodily-function digression at the end of paragraph 12
  (farting "in tune," forty-year unintermitted breaking wind) is likewise
  fully preserved. No content was trimmed or euphemized anywhere in this
  chapter.

## 3. Citation spot-checks

Beyond the full read (which already checks every citation), I specifically
re-verified attribution strings character-by-character for a sample across
the batch: Virgil *Aeneid* iv.449 and ii.774; Horace *Odes* ii.3.25,
iii.1.18, ii.13.13, ii.16.17, iii.3.3, and *Epistles* i.4.13, i.14.43,
i.16.76, ii.2.126; Lucretius ii.752, iii.57, iii.911, iii.914, iii.928,
iii.951, iii.957, iii.981, iii.985, iii.1093, iii.1103, iv.474, v.579,
ii.1027; Cicero *De Finibus* i.18, *Tusculans* iv.8 and ii.17, *De Natura
Deorum* i.30 and iii.2, *De Divinatione* i.40; Seneca *Ep.* 91 and 117,
*Hercules Furens* 874, *Oedipus* 686; Ovid *Metamorphoses* iii.135, *Amores*
ii.10.36, *Epistle of Phyllis to Demophoon* v.48; Manilius i.529 and iv.16;
Claudian *In Rufinum* ii.137; Propertius iii.18; Silius Italicus xi.51;
Livy x.6 and xxxiv.54; Pliny *Natural History* xxvi.2; Tertullian
*Apologetics*; Quintus Curtius ii.11. In every case the author, work, and
book/line reference in modern-en is identical to source — no misattribution,
no swapped line numbers, no invented citation.

## 4. The Fulvius judgment call — AGREE, correctly left unchanged

Source (ch. 15, para 4 — not ch. 19 or 22 as the task brief's summary of the
drafter's account implied; confirmed the actual location by direct
inspection) reads "those who ran away with **Aeneius** Fulvius at his
defeat." Modern-en has "**Cnaeus** Fulvius." I agree this is not a
fidelity defect, for two independent reasons:

1. **It doesn't change the referent.** This is the same historical figure
   and the same anecdote (the Roman commander associated with a Cannae-era
   defeat and subsequent flight-punishment tradition) in both versions —
   only the praenomen spelling changes, correcting an evident scanning/
   transcription artifact in the public-domain source text.
2. **Project precedent supports this, not the alternative.** I checked the
   other batch notes files available in this directory. Batch E's notes
   explicitly establish the applicable precedent: "Spelling modernizations
   that do not change meaning or reference" are treated as non-defects and
   left as the corrected/modern spelling — e.g. "Montmorenci" →
   "Montmorency," "Massilians" → "Massylians," "Argian" → "Argive," all
   flagged and deliberately left unchanged in that batch. Cnaeus vs.
   Aeneius Fulvius is the same category of change: a same-referent spelling
   correction, not a distortion of meaning, attribution, or anecdote
   content. I found no batch-note precedent in this project of the opposite
   policy (deliberately reverting a corrected proper name back to source's
   garbled spelling to preserve a "wrong" citation verbatim) — if such a
   precedent exists in other books outside this directory, it was not
   available for me to check, but nothing in the batches I could inspect
   (B, E, F) supports it, and B/E are internally consistent with each
   other on this exact question.

**Recommendation:** No change needed. If Tinct's style guide wants
maximal consistency, the alternative fix (reverting to source's "Aeneius")
would also be defensible and is not a fidelity error in either direction —
but the current state is correct per established project precedent and
requires no action.

## 5. Paragraph counts — verified exact match, all 11 chapters

Programmatically confirmed source vs. current-modern-en paragraph counts are
identical for every chapter: ch.12=8, ch.13=4, ch.14=4, ch.15=6, ch.16=11,
ch.17=11, ch.18=14, ch.19=124, ch.20=26, ch.21=3, ch.22=55 (266 total). No
paragraph was split, merged, added, or dropped.

## Summary

The drafter's "0 defects found" self-report holds up under an independent,
full (not sampled) re-read of all 266 paragraphs, including exhaustive
verification of the two flagged high-risk chapters (19 and 22) and their
most exposed content (the extended catalogue-of-customs passage in ch. 22
para 16, and the bodily-function/impotence digressions in ch. 20 and ch.
22). Citation attributions spot-checked as exact matches throughout. The
one disclosed judgment call (Fulvius spelling) is correctly resolved per
this project's own established precedent (batch E). **Recommendation:
accept the batch as-is; no fixes required.**
