# Montaigne Batch F — Content Fidelity Review Notes

Scope: `mt-batchF-current-modern-en.json` checked paragraph-by-paragraph against
`mt-batchF-source.json` (ground truth, public-domain English translation).
Chapters 56–66 (11 chapters, 351 paragraphs total). This range does **not**
include the "Apology for Raymond Sebond" (that essay falls outside chapters
56–66 in the standard numbering).

Method: every paragraph in every chapter was read side by side against its
source counterpart (word-count ratio was also computed as a sanity check —
no paragraph fell outside a 0.55–1.8 ratio band, and the manual read confirmed
no hidden compression or padding). Checked specifically for: dropped or
invented clauses/sentences, meaning inversions, compressed passages, dropped
classical citations/anecdotes, factual/historical distortions (names, dates,
attributions), and any other fidelity break.

## Result: CLEAN — no defects found in any chapter

No fixes were required. `mt-batchF-corrected.json` is therefore an exact,
verified copy of `mt-batchF-current-modern-en.json`. Paragraph counts and
chapter numbers were verified programmatically to match `mt-batchF-source.json`
exactly (38/12/40/55/61/5/23/44/11/43/19 paragraphs per chapter, chapters
56–66).

## Per-chapter verdicts

- **Ch. 56 — Of prayers** (38 paragraphs): Clean. All citations (Plato's
  Laws, Juvenal, Persius, Horace, Lucan, Marguerite of Navarre anecdote,
  Oedipus/his sons, Xenophon, Chrysostom, Andronicus/Lapodius anecdote,
  bishop's account of the isle of Dioscorides, Euripides' *Menalippus*) all
  present and accurate. All Latin/Greek epigraphs and their bracketed
  translations intact.

- **Ch. 57 — Of age** (12 paragraphs): Clean. Cato's age (forty-eight),
  Augustus's legal reforms, Servius Tullius/Augustus knight-age figures,
  Hannibal/Scipio comparison, and the Cotton/Florio variant-translation note
  all preserved accurately.

- **Ch. 58 — Of the inconstancy of our actions** (40 paragraphs): Clean.
  Marius, Pope Boniface VIII, Nero anecdote, Augustus, the Cato/Demosthenes
  quotations, Empedocles on the Agrigentines, the soldier-girl/Lucretia
  anecdote, Antigonus/Lucullus soldier anecdotes, Mahomet/Chasan anecdote,
  Alexander/Clytus, the Parians/Milesians anecdote, and all Latin epigraphs
  (Horace, Lucretius, Cicero, Seneca, Tibullus, etc.) all faithfully
  rendered with correct names, numbers, and attributions.

- **Ch. 59 — Of drunkenness** (55 paragraphs): Clean. Attalus/Pausanias/
  Philip of Macedon/Epaminondas anecdote, the Bordeaux widow anecdote,
  Cato the Elder, Cyrus vs. Artaxerxes, the physician Silvius anecdote,
  Montaigne's account of his own father (age at marriage, 1528, thirty-third
  year), Plato's *Laws* on wine-drinking ages, Stilpo/Arcesilaus, Anaxarchus/
  Nicocreon, the Josephus child-martyr passage, Antisthenes/Sextius/Epicurus
  — all details, names, and numbers intact.

- **Ch. 60 — A custom of the isle of Cea** (61 paragraphs, the longest in the
  batch): Clean. This chapter is essentially a catalogue of classical and
  contemporary suicide anecdotes and was checked with particular care given
  its density of names/numbers (Damidas, Agis, the Lacedaemonian boy,
  Antipater, Boiocalus, Servius the grammarian, Hegesias, Diogenes/
  Speusippus, Plato's *Laws* on suicide, the Milesian virgins, Therykion/
  Cleomenes, Josephus, Brutus/Cassius, Monsieur d'Anguien at Cerisoles,
  Pliny's three diseases, Democritus of Aetolia, Antinous/Theodotus at
  Epirus, the Gozzo/Sicilian-father anecdote, the Jewish women under
  Antigonus, Razis/Nicanor from the biblical Apocrypha, Pelagia/Sophronia,
  Lucius Aruntius, Granius Silvanus/Statius Proximus, Spargapises/Tomyris/
  Cyrus, Boges at Eion, Ninachetuen of Malacca, Sextilia/Paxaea, Cocceius
  Nerva, the wife of Fulvius, Vibius Virrius and the 27 senators of Capua,
  Jubellius Taurea/Fulvius, Alexander's siege in India, Astapa, the
  Abydeans/Philip, the Tiberius-era law on the condemned, St. Paul,
  Cleombrotus/Plato's *Phaedo*, bishop Jacques du Chastel, the Marseilles
  hemlock custom, and the long Sextus Pompeius/isle-of-Cea death narrative).
  All figures, numbers (e.g., "twenty-seven senators," "fifty young men,"
  age "ninety"), and outcomes match the source precisely. Note: at [59] the
  source's archaic "nephews" (Elizabethan-English rendering of Latin
  *nepotes*) is rendered as "grandchildren" in the modern text — this is a
  legitimate modernization of an archaism, not a fidelity break, since
  "nephews" in the 17th-century translation actually means descendants/
  grandchildren, not siblings' children. No change made.

- **Ch. 61 — To-morrow's a new day** (5 paragraphs): Clean. Amyot,
  Xenophon/Rusticus anecdote, Boutières at Turin, Julius Caesar's
  assassination-day note, Pelopidas/Archias of Thebes anecdote — all intact.

- **Ch. 62 — Of conscience** (23 paragraphs): Clean. Sieur de la Brousse
  anecdote, Bessus the Paeonian, Apollodorus's dream, Scipio's three
  anecdotes (senate speech, victory-thanksgiving, and the account-book
  scene with Petilius/Cato), and the countrywoman/soldier torture anecdote
  all faithfully preserved, including all Latin citations and their
  attributions (Juvenal, Lucretius, Ovid, Seneca, Publius Syrus, Terence).

- **Ch. 63 — Use makes perfect** (44 paragraphs): Clean. Julius Canus/
  Caligula anecdote, and Montaigne's lengthy first-person account of his
  near-fatal riding accident (with all physical detail: blood, swoon,
  duration, his father-in-law/family reactions) rendered with full fidelity
  — no compression of this famously detailed passage. All Latin/Italian
  citations (Lucretius, Lucan, Tasso, Ovid, Virgil, Horace) intact.

- **Ch. 64 — Of recompenses of honour** (11 paragraphs): Clean. Augustus's
  military-honours policy, the Order of St. Michael discussion, and the
  etymological discussion of *vaillance*/*valeur* all preserved accurately.

- **Ch. 65 — Of the affection of fathers to their children** (43
  paragraphs, dedicated "To Madame d'Estissac"): Clean. This is
  Montaigne's longest and most personal essay in the batch, including his
  discussion of his own daughter Léonor, his father's biography, the
  Muley Hassan/Mahomet anecdote, Charles V's abdication, the Poitiers dean
  who confined himself for 22 years, the Marshal de Monluc/his dead son
  anecdote (with the Madame de Sévigné editorial note preserved), the
  goat-wet-nurse anecdotes from Montaigne's own neighborhood, the Heliodorus/
  Labienus/Cassius Severus/Cremutius Cordus/Lucan-at-death anecdotes on
  "children of the mind," and the closing Epicurus/St. Augustine/
  Epaminondas/Phidias/Pygmalion passage — all names, ages, sums of money
  (fifty thousand crowns, etc.), and citations preserved accurately.

- **Ch. 66 — Of the arms of the Parthians** (19 paragraphs): Clean.
  Livy citation on Gallic soldiers, Alexander's disregard for armor,
  Scipio's caltrops/buckler anecdotes, Caracalla, Roman infantry
  provisioning (sixty pounds, five leagues in five hours), the Spartan
  soldier-under-a-roof anecdote, Marcellinus's detailed description of
  Parthian cataphract armor, and Demetrius/Alcimus's suits of armor
  (120 lbs vs. the ordinary 60 lbs) — all figures and attributions intact.

## Summary

This batch (chapters 56–66) shows no evidence of the content-fidelity
defects the review was checking for. Every classical citation, anecdote,
proper name, number, and argumentative turn in the source is present and
correctly rendered in the modern-English text, simply modernized in
register. No corrections were necessary.
