# Montaigne Batch A — Independent Adversarial Review

Scope: `mt-batchA-current-modern-en.json` → `mt-batchA-corrected.json`, chapters
1–11, checked against `mt-batchA-source.json` (locked ground truth). This is
an independent re-check; the drafter's `mt-batchA-notes.md` was read only
after my own pass was complete, and its claims were treated as unverified
until confirmed against the source myself.

## Verdict: **Accept as-is**

Both claimed fixes are real, correctly diagnosed, and correctly applied. The
diff between `current` and `corrected` is exactly those two fixes and nothing
else. Independent paragraph-by-paragraph re-reading of all 11 chapters
(2 × 155 paragraphs, source vs. corrected) turned up no further dropped
clauses, meaning inversions, compressions, invented content, or citation
errors. The judgment calls the drafter left unfixed are, in my independent
judgment, correctly left unfixed.

## 1. Diff scope — confirmed exact

Programmatic diff of `mt-batchA-current-modern-en.json` vs.
`mt-batchA-corrected.json`, paragraph by paragraph, all 11 chapters:

- Paragraph counts: source / current / corrected all match exactly per
  chapter (7, 22, 24, 14, 13, 11, 2, 13, 10, 5, 34 — 155 total).
- Exactly 2 paragraphs differ between current and corrected: ch1 paragraph
  index 1, and ch11 paragraph index 20. No other paragraph in any of the 11
  chapters was touched. This matches the drafter's claim precisely.

## 2. Both claimed fixes verified correct against source

**Ch1 P1 — invented epithet.** Source has no "Black Prince" language at all:
"Edward, Prince of Wales (the same who so long governed our Guienne, a
personage whose condition and fortune have in them a great deal of the most
notable and most considerable parts of grandeur)...". The pre-fix text
inserted "— the Black Prince, who long governed our Guienne —", an
interpolation not present in source. Confirmed invented; confirmed removed
cleanly in the corrected version with no collateral change to the rest of
the sentence.

**Ch11 P20 — citation locator.** Source's bracketed gloss for the Horace
quotation "Laetus in praesens animus; quod ultra est, / Oderit curare." is
cited `--Ibid., ii. 25`. The pre-fix modern-en had silently changed this to
"Horace, Odes, ii. 16" — which happens to be the real-world correct locator
for this line (Odes II.16), i.e. an uncredited "correction" of the source's
own apparatus. The corrected version restores "ii. 25" to match source
exactly, while reasonably keeping the modern edition's house style of
spelling out "Horace, Odes" instead of reproducing "Ibid." (which only
resolves relative to the prior citation and isn't used elsewhere in this
edition). Confirmed correct: this is fidelity-to-source, not
fidelity-to-reality, and the task is the former.

## 3. Independent full read of all 11 chapters — no further defects found

I read every one of the 155 paragraphs against source, chapter by chapter,
including all Latin/Italian/French epigraph blocks and their bracketed
glosses, every proper name, every citation locator, and every anecdote.
Chapter 3 (24 paragraphs, the longest and most citation-dense — du
Guesclin/d'Alviano, Edward I's bones, John Zizka's drum, Captain Bayard,
Emperor Maximilian's modesty, the Arginusae/Diomedon execution, Chabrias at
Naxos, five separate Latin epigraphs) got particular scrutiny given the
brief's flag. No dropped clauses, no negation/conditional inversions, no
compressed passages, no dropped citations or anecdotes, and no
factual/historical distortions were found anywhere in the batch beyond the
two already fixed.

Specific checks performed:

- **All ~35 classical citation locators** (Cicero De Divinatione /
  De Natura Deorum, Lucretius, Lucan, Virgil, Horace, Livy, Seneca, Ovid,
  Martial, Ariosto, Petrarch, Pliny, Cicero De Officiis, Ennius-in-Cicero)
  checked book/chapter/line numerals one by one against source. All match
  source exactly, including the one that was fixed. Author names are
  routinely expanded from source's abbreviations (e.g. "Hor." →
  "Horace", "De Divin." → "De Divinatione") but the substantive
  numeral/locator is never altered anywhere else in the batch.
- **Historical/narrative fidelity spot-checks**: the Edward/Limousins
  clemency story, Scanderbeg, Emperor Conrad III at Guelph's siege, the
  Dionysius/Phyton torture-and-drowning scene, the Alexander/Betis
  mutilation scene (ch1); the Psammenitus/Cambyses story and the Trent
  prince's delayed grief (ch2); the du Guesclin/d'Alviano/Edward I/Zizka
  relic stories, the Maximilian bathroom-modesty passage, the
  Arginusae/Diomedon mass execution and Chabrias's superstition at Naxos
  (ch3); the Xerxes/Cyrus/Caligula tantrums (ch4); the Eumenes/Antigonus and
  Henri de Vaux/Commercy sieges (ch5); the Phocaea, Casilinum, Capua and
  Genoa parley-treachery cases (ch6); the Henry VII/Philip/Suffolk and
  Egmont/Horn Brussels executions (ch7); the Merveille/Francesco Taverna
  assassination-and-excuse story and the Pope Julius II ambassador story
  (ch9); the Severus Cassius and Monsieur Poyet/Pope Clement anecdotes
  (ch10); the Francesco of Saluzzo defection and Joachim/Leo prophecy books
  (ch11) — all check out point for point against source: names, numbers,
  sequence of events, and causal claims are all preserved.
- **No sanitizing**: the frank body/violence/death material the drafter
  flagged (Betis's mutilation, Phyton's drowning, the Maximilian and Cyrus
  bodily-privacy passages) is rendered in full, not softened or trimmed.

## 4. Judgment calls left unfixed — independently evaluated, agreed

- **Independent Latin/Italian/French retranslations of epigraph glosses**
  (Catullus, Petrarch, Pliny, Ariosto, Ovid, Seneca, Ennius, Lucan, Horace,
  etc.), rather than reuse of source's own bracketed English gloss: I
  checked several of these against the original-language text directly
  (Catullus 51's "gemina...nocte" → correctly rendered "double darkness";
  Ariosto's "per fortuna" → correctly rendered "by fortune", where source's
  own gloss had mistranslated it as "by valour"; Lucan's she-bear passage;
  Ennius's tomb fragment; Horace Odes iii.29 and ii.25). In every case
  checked, the modern-en retranslation is an accurate and sometimes more
  literal rendering of the Latin/Italian than source's own 19th-century
  gloss was. These are legitimate independent-but-equivalent translations,
  not fidelity breaks, and in at least one case (Ariosto) the modern
  rendering is more faithful to the original-language text than source's own
  bracketed translation. Agree with drafter: no fix needed.
- **Name-spelling normalizations** (Zisca→Zizka, Juliano→Giuliano Romero,
  Fabricio→Fabrizio Colonna, Ottaviano Fregosa→Fregoso, AEmilius→Aemilius,
  Bertrand de Guesclin→du Guesclin): all confirmed to refer to the same
  historical figures named in source, with no identity confusion or
  attribution change. Agree with drafter: standard orthographic variants,
  not fidelity breaks.
- **Ch5 pronoun disambiguation** ("he himself" resolved to Monsieur de
  l'Escut rather than Count Guido di Rangone, and "he himself" in the
  Guicciardini aside resolved to "Guicciardini himself"): re-read the full
  surrounding passage independently. The source sentence is genuinely
  ambiguous/garbled ("but he himself follow the Count..."), and the
  narrative logic (l'Escut's party is described as "much the weaker" during
  the disrupted parley, immediately before the pronoun) supports reading "he
  himself" as l'Escut retreating to safety near Rangone, not Rangone
  himself. Agree with drafter: a defensible resolution of ambiguous source
  syntax, not an invented distortion.

## 5. Paragraph counts — verified exactly matching source for all 11 chapters

| Chapter | Source | Current | Corrected |
|---|---|---|---|
| 1 | 7 | 7 | 7 |
| 2 | 22 | 22 | 22 |
| 3 | 24 | 24 | 24 |
| 4 | 14 | 14 | 14 |
| 5 | 13 | 13 | 13 |
| 6 | 11 | 11 | 11 |
| 7 | 2 | 2 | 2 |
| 8 | 13 | 13 | 13 |
| 9 | 10 | 10 | 10 |
| 10 | 5 | 5 | 5 |
| 11 | 34 | 34 | 34 |

No paragraph was merged, split, dropped, or invented anywhere in the batch.

## 6. Minor observations (not fidelity breaks, not blocking)

Two very small register/word-choice notes for awareness only — neither
changes meaning, sequence, or content, and neither warrants a fix:

- Ch1 P3: source's "facility, effeminacy, and over-tenderness" is rendered
  as "weakness, softness, and over-tenderness." "Effeminacy" → "softness" is
  a period-appropriate word modernized/softened rather than literally
  carried over; the underlying claim (that yielding wholly to compassion is
  a mark of weak natures) is unchanged.
- Ch7 P1: source's clause "less to their the power, even out of to make
  their malice die with them" is itself garbled 19th-century OCR/typesetting
  in the source file. The modern-en resolves it as "little [regard] for
  their conscience, by being unable, even out of respect for death itself,
  to let their malice die with them," which is a sensible, non-inventive
  resolution of corrupted source text consistent with the sentence's overall
  argument (posthumous grudge-bearing shows disregard for both honour and
  conscience).

## Conclusion

Accept `mt-batchA-corrected.json` as-is. The self-reported repair is
accurate and complete: exactly two real defects were found and correctly
fixed, nothing else was altered, and no additional fidelity breaks exist
anywhere in the 11-chapter, 155-paragraph batch on independent re-check.
