# Montaigne Batch F — Independent Adversarial Review

**Scope:** Chapters 56–66 (11 chapters, 351 paragraphs), `mt-batchF-current-modern-en.json`
checked against `mt-batchF-source.json`. This review does not trust the original drafter's
"0 defects" self-report; every paragraph in every chapter was read side by side against its
source paragraph, independently, in this session.

## Verdict: ACCEPT AS-IS

No fidelity defects were found in any of the 351 paragraphs across the 11 chapters. The
drafter's self-report is corroborated by an independent full read, not merely a spot check.

## 1. File-identity check

`diff mt-batchF-corrected.json mt-batchF-current-modern-en.json` → **byte-identical**.
Confirmed programmatically (`diff` returned no output).

## 2. Paragraph-count check (all 11 chapters)

| Ch. | Title | Source paras | Modern paras | Match |
|---|---|---|---|---|
| 56 | Of prayers | 38 | 38 | ✓ |
| 57 | Of age | 12 | 12 | ✓ |
| 58 | Of the inconstancy of our actions | 40 | 40 | ✓ |
| 59 | Of drunkenness | 55 | 55 | ✓ |
| 60 | A custom of the isle of Cea | 61 | 61 | ✓ |
| 61 | To-morrow's a new day | 5 | 5 | ✓ |
| 62 | Of conscience | 23 | 23 | ✓ |
| 63 | Use makes perfect | 44 | 44 | ✓ |
| 64 | Of recompenses of honour | 11 | 11 | ✓ |
| 65 | Of the affection of fathers to their children | 43 | 43 | ✓ |
| 66 | Of the arms of the Parthians | 19 | 19 | ✓ |

Confirmed both programmatically (chapter/paragraph count script) and by direct enumeration
while reading every paragraph pair.

## 3. Full paragraph-by-paragraph read — method and result

Every paragraph in every chapter (351 total) was extracted into source/modern pairs and read
in full, in this session. A word-count-ratio sanity pass was also run first as an outlier
flag (ratio < 0.55 or > 1.9): it returned only 7 hits, all of them short single-line epigraph
or transition paragraphs (e.g. ch60 P14/P17 "And as another says:" / "Or as this:", ch62 P4/P7
short Latin tags, ch65 P0/P11/P24 short salutation/citation lines) — not compression, just
naturally short source paragraphs rendered at matching length. No genuine outliers.

The full manual read confirmed no dropped clauses, no invented content, no negation or
conditional inversions, and no silently compressed passages anywhere in the batch.

### High-risk passages given specific scrutiny (per task instructions)

- **Ch. 60, "A custom of the isle of Cea" (61 paragraphs)** — the full suicide catalogue was
  read start to finish: Damidas/Agis/the Lacedaemonian boy/Antipater/Boiocalus (P3),
  Servius the grammarian/Hegesias/Diogenes-Speusippus (P6–P7), Plato's *Laws* on suicide and
  the Milesian virgins/Therykion-Cleomenes (P31, P35), Josephus/Brutus-Cassius/Monsieur
  d'Anguien at Cerisoles (P38), Pliny's three diseases (P43–P45), Democritus of
  Aetolia/Antinous-Theodotus at Epirus/the Gozzo Sicilian father/the Jewish women under
  Antigonus (P45), Razis/Nicanor from the Apocrypha (P46), Pelagia/Sophronia (P47),
  Lucius Aruntius/Granius Silvanus/Statius Proximus/Spargapises-Tomyris-Cyrus/Boges at
  Eion (P50), Ninachetuen of Malacca (P51), Sextilia/Paxaea/Cocceius Nerva/the wife of
  Fulvius/Vibius Virrius and the 27 senators of Capua/Jubellius Taurea (P52), Alexander's
  siege in India (P53), Astapa (P54), the Abydeans/Philip (P55), the Tiberius-era law on the
  condemned (P56), St. Paul/Cleombrotus-Plato's *Phaedo*/bishop Jacques du Chastel (P57), the
  Marseilles hemlock custom (P58), and the Sextus Pompeius/isle-of-Cea death narrative (P59).
  All names, ages ("twenty-seven senators," "fifty young men," "ninety"), sums, and outcomes
  are present and accurate in the modern rendering. No omissions found.

- **Ch. 63, "Use makes perfect" (44 paragraphs)** — the riding-accident narrative (P9, P12,
  P15, P16, P19, P22, P26–P27, P30, P33–P34, P37) was read in full: horse strength/mouth
  quality, the German horse rider's collision, distance figures ("ten or twelve paces"), the
  two-hour swoon, vomiting clotted blood, the family's reactions, his wife's difficult ride,
  the concealment of the cause of the fall from him, and the delayed return of memory — all
  physical and emotional detail present with no compression or softening.

- **Ch. 65, "Of the affection of fathers to their children" (43 paragraphs)** — read in full,
  including Léonor (Montaigne's daughter), his own upbringing and corporal-punishment
  practice, Muley Hassan/Mahomet (P17), Charles V's abdication (P18), the Poitiers dean's
  22-year self-confinement (P22), the Marshal de Monluc anecdote with the Madame de Sévigné
  editorial note preserved verbatim (P29–P30), the goat-wet-nurse anecdotes (P38), and the
  Heliodorus/Labienus/Cassius Severus/Cremutius Cordus/Lucan-at-death "children of the mind"
  sequence (P39) through to the closing Epicurus/St. Augustine/Epaminondas/Phidias/Pygmalion
  passage (P40). All names, sums ("fifty thousand crowns" region — actually "above fifty
  thousand crowns yearly revenue," correctly rendered), and citations intact.

- **Ch. 66, "Of the arms of the Parthians" (19 paragraphs)** — read in full: Livy on Gallic
  soldiers (P0–P2), Alexander's disregard for armor (P6), Scipio's caltrops/buckler anecdotes
  (P7), Caracalla (P11), Roman infantry provisioning figures ("sixty pounds," "five leagues in
  five hours," "sometimes... six") (P13), the Spartan soldier-under-a-roof anecdote (P14),
  Marcellinus's Parthian cataphract-armor description (P15–P17), and Demetrius/Alcimus's
  armor weights — correctly rendered as "one hundred and twenty pounds... whereas the ordinary
  suits weighed only half as much" against source's "six score pounds weight... whereas the
  ordinary suits weighed but half as much" (P18). All figures and attributions intact.

Remaining chapters (56, 57, 58, 59, 61, 62, 64) were likewise read in full, not sampled; no
defects were found in any of them either. All Latin/Italian/Greek epigraphs and their
bracketed translations are present and correctly paired with their source citations.

## 4. Evaluation of the "nephews" → "grandchildren" choice (Ch. 60, P59)

**Agree: this is a legitimate disambiguation, not a meaning change.**

Source paragraph 59 (the Sextus Pompeius / isle-of-Cea death scene) has the dying woman say
she is "leaving behind two daughters of my body and a legion of nephews." The modern rendering
gives "leaving behind two daughters of my body and a legion of grandchildren."

Reasoning for agreement:

- Cotton's 17th-century translation regularly uses "nephew" in its older, broader sense
  (reflecting Latin *nepos*/*nepotes*, "grandson/descendant"), not the modern narrow sense of
  "sibling's child." This is a well-documented archaism in period English translations,
  including this one.
- Context confirms the reading: the woman explicitly pairs "two daughters of my body" with "a
  legion of [nepotes]" in the same breath, as the two categories of descendants she leaves
  behind — daughters, then their children. Reading "nephews" in its modern sense (her own
  siblings' children) would be a non sequitur next to "daughters of my body"; "grandchildren"
  is exactly what the sentence needs and exactly what the Latin sense of *nepotes* would give
  a modern reader without requiring a footnote.
- A modern-English reader given "nephews" here would either misread it as her siblings'
  children (wrong) or be confused by an apparently archaic word with no gloss. "Grandchildren"
  preserves Montaigne's actual claim (she has descendants through her daughters) while
  updating the vocabulary — which is exactly what a modern-en rendering is supposed to do per
  the project's translation rules ("Rewrite sentence by sentence for present-day clarity while
  preserving the source's claims").

This is a defensible, correct disambiguation. It does not change what is being claimed about
the woman's family.

## 5. Other fidelity checks

- No dropped or invented clauses/sentences found anywhere in the batch.
- No negation or conditional inversions found.
- No compressed passages found (word-count ratios stayed in a normal band; the full read
  confirmed no silent summarization).
- No dropped classical citations or anecdotes — every named figure, anecdote, and citation
  enumerated in the drafter's notes was verified present in both source and modern text.
- No factual/historical distortions (names, dates, numbers, attributions) found. Latin epigraph
  attributions were spot-checked against the source's own citations (e.g. ch60 P33's Lucretius
  citation, mis-attributed as "Idem, ibid." in the source's own apparatus but correctly expanded
  to "Lucretius, ibid., 874" in the modern text — an improvement, not a defect) and found
  consistent.

## Summary

This is a clean batch. The original drafter's "0 defects found" self-report holds up under
an independent, full (not sampled) paragraph-by-paragraph re-read of all 351 paragraphs across
all 11 chapters, including deliberately close scrutiny of the four passages flagged as
highest-risk (the ch60 suicide catalogue, the ch63 riding accident, the ch65 father/daughter
material, and the ch66 Parthian-armor description). The one flagged translation choice
("nephews" → "grandchildren" in ch60 P59) is judged correct on independent review.

**Recommendation: accept `mt-batchF-corrected.json` / `mt-batchF-current-modern-en.json` as-is.
No fixes required.**
