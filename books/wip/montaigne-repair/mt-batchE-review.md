# Montaigne Batch E — Independent Adversarial Review

Scope: chapters 45–55 ("Of the battle of Dreux" through "Of smells"),
`mt-batchE-*` files. This is an independent re-check of the drafter's
self-reported single fix; the drafter's notes file was treated as an
unverified claim throughout, not as evidence.

## Verdict: **ACCEPT AS-IS**

The batch is high-fidelity. The one claimed fix is real, correctly diagnosed,
and correctly applied, with no collateral changes. No additional defects
were found across all 11 chapters after an independent paragraph-count
audit, a full Latin-citation integrity check, named-author drop check,
per-paragraph word-ratio compression check, and manual close reads
(full ch. 45 and ch. 48 opening, plus targeted spot-checks in 46, 47, 49,
51, 55).

## 1. Diff scope (current vs. corrected)

Programmatic paragraph-by-paragraph diff of `mt-batchE-current-modern-en.json`
vs `mt-batchE-corrected.json` across all 11 chapters shows **exactly one**
paragraph changed: chapter 48, paragraph index 34 ("a musket-shot" →
"an arquebus-shot"). No other paragraph, chapter, title, or paragraph count
differs between the two files. The drafter's claim of a single, isolated
fix is confirmed independently.

## 2. Verification of the claimed fix

Source, ch. 48, paragraph 34 (exact): *"A pretty description of something
very like an **arquebuse**-shot."* The pre-fix modern-en read *"a
musket-shot."* Arquebus and musket are genuinely distinct 16th-century
firearm classes (arquebus: lighter, earlier, often unsupported; musket:
heavier, later, typically needed a rest/fork) — this is a real, non-trivial
factual substitution, not a stylistic quibble, and the fix correctly
restores the source's specific term (with the article correctly adjusted
"a"→"an"). Confirmed correct.

## 3. Independent full-batch read

- **Paragraph counts**: verified programmatically against source for all
  11 chapters — 3, 24, 24, 59, 46, 9, 13, 3, 9, 9, 16 — all match exactly
  between source, pre-fix, and corrected files. No merges, splits, drops,
  or invented paragraphs.
- **Word-count ratio check**: every paragraph in the batch (all 11
  chapters) checked for corrected-vs-source word-count ratio; none fell
  outside a 0.65–1.6 band, i.e. no compressed or padded paragraphs
  anywhere in the batch.
- **Classical-name drop check**: scanned every paragraph for 22 major
  classical-author names (Livy, Lucan, Juvenal, Lucretius, Virgil/Aeneid,
  Caesar, Plutarch, Xenophon, Cicero, Tacitus, Herodotus, Diodorus,
  Horace, Ovid, Seneca, Plato, Aristotle, Suetonius, Pliny, Quintilian,
  Homer). Zero instances of a name present in source but absent from the
  corrected paragraph.
- **Latin citation integrity**: extracted every short/Latin-flagged
  paragraph and diffed source vs. corrected after normalizing quote-mark
  style. All Latin quotation blocks are byte-identical in content (only
  curly→straight quote normalization). All bracketed English glosses were
  read in full; two citation abbreviations were silently expanded/fixed —
  "Mostel." → "Mostellaria" (ch. 55 p2, correct full title of the Plautus
  play) and "Libey" → "Liber" (ch. 48 p46, OCR-typo fix in a Martial
  citation) — both are accuracy improvements, not distortions.
- **Manual close read**: full paragraph-by-paragraph comparison of ch. 45
  (all 3 paragraphs) and the first 20 paragraphs of ch. 48 (the
  horses/war-horses chapter, citation-dense) found no meaning inversions,
  no dropped clauses, no negation/conditional flips, and correct
  preservation of all anecdotes (Artybius/Onesilus, Charles VIII at
  Fornova, Caesar's and Alexander's horses, Numidian cavalry, Parthian
  horseback customs, Roman dismounted-cavalry practice, etc.).

## 4. Near-miss items the drafter flagged as non-defects — independently checked, agree with drafter on all four

- **"Montmorenci" → "Montmorency"** (ch. 45, footnote para 0): confirmed
  by direct source comparison — same historical constable (Anne de
  Montmorency), correct modern spelling, no referent change. Agree: not a
  defect.
- **"Massilians" → "Massylians"** (ch. 48, para 36; source paras 36–38):
  source itself is internally inconsistent — the English prose paragraph
  reads "Massilians" while the accompanying Lucan citation and its gloss
  two paragraphs later both read "Massylia"/"Massylians" (the Numidian
  tribe, not the people of Massilia/Marseille). The modern-en rendering
  normalizes the prose spelling to match the citation it is directly
  glossing. Agree: correct normalization, not a substitution of a
  different referent.
- **"Argian" → "Argive"** (ch. 49, para 45): confirmed against source —
  "Argive" is the standard demonym for Argos; same referent (women of
  Argos mourning in white). Agree: not a defect.
- **Juvenal gloss rephrasing, "observes"/"relates" → "does it matter"/
  "does it tell"** (ch. 51, para 5): checked against the Latin
  ("...refert..."). "Refert" is the impersonal Latin verb literally
  meaning "it matters" — the corrected gloss is if anything a more
  literal rendering of the Latin than the source translation's
  "observes." Agree: not a defect, arguably an improvement.
- **"the powder, the stone, and the wheel" → "the powder, the flint, the
  wheel"** (ch. 48, para 21): checked in context — this is a wheel-lock
  firearm description (powder, ignition flint, striking wheel); "flint"
  is the correct technical term for the "stone" struck by a wheel-lock
  mechanism. Agree: accurate clarification, not a substitution.
- **"to fight him in Italy" → "fighting Hannibal in Italy"** (ch. 47,
  para 19): checked in context — "him" in "stay at home to defend his own
  and to fight him in Italy" unambiguously refers to Hannibal (the
  subject of the very next sentence, and Scipio's sole opponent in the
  Second Punic War African-strategy anecdote). Agree: correct referent
  clarification, no meaning change.

## 5. Other issues sought and not found

No dropped/invented clauses, no negation or conditional inversions, no
compressed passages, no dropped citations or anecdotes, and no other
factual/historical distortions were found anywhere in chapters 45–55
beyond the single confirmed and already-fixed arquebus/musket
substitution.

## 6. Paragraph counts (confirmed exact match, source vs. corrected)

| Ch | Title | Source paras | Modern-en paras |
|----|-------|--------------|------------------|
| 45 | Of the battle of Dreux | 3 | 3 |
| 46 | Of names | 24 | 24 |
| 47 | Of the uncertainty of our judgment | 24 | 24 |
| 48 | Of war horses, or destriers | 59 | 59 |
| 49 | Of ancient customs | 46 | 46 |
| 50 | Of Democritus and Heraclitus | 9 | 9 |
| 51 | Of the vanity of words | 13 | 13 |
| 52 | Of the parsimony of the ancients | 3 | 3 |
| 53 | Of a saying of Caesar | 9 | 9 |
| 54 | Of vain subtleties | 9 | 9 |
| 55 | Of smells | 16 | 16 |

## Conclusion

The single self-reported fix (arquebus for musket, ch. 48 para 34) is
correct, complete, and isolated — no collateral edits. The drafter's four
"considered and left unchanged" items all withstand independent scrutiny
and are correctly judged non-defects. No further defects were found in an
independent full read of the batch. **Recommend acceptance of
`mt-batchE-corrected.json` as the new content-of-record for chapters
45–55, with no further changes required.**
