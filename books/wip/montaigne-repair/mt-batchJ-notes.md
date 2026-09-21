# Montaigne Batch J — Content Fidelity Repair Notes

**Scope:** Chapters 100–107 (Of coaches; Of the inconvenience of greatness; Of the art of
conference; Of vanity; Of managing the will; Of cripples; Of physiognomy; Of experience).
This is the final batch of the Essays.

**Method:** Every paragraph of `mt-batchJ-current-modern-en.json` was read side-by-side
against the corresponding paragraph in `mt-batchJ-source.json` (locked ground truth),
chapter by chapter, in full — all 1,044 paragraphs across all 8 chapters (paragraph
counts: 70, 14, 95, 300, 123, 60, 142, 240). Word-count ratios per paragraph pair were
also computed as a compression/expansion screen before the manual read (min 0.57, max
1.40, mean 1.02, median 1.00 — no outliers suggesting silent compression or padding).

## Verdict: CLEAN. No content-fidelity defects found in any of the 8 chapters.

Every paragraph — including all classical citations (Latin/Greek quotations and their
translations), historical anecdotes (Socrates' trial, Cyrus and Croesus, the Mexican and
Peruvian conquest narratives, the Spartan/Athenian exempla, the plague of 1585-86, the
"Of Experience" material on kidney stones, sleep, diet, dress, old age, and pleasure),
proper names, numbers, and argumentative structure survived the modernization intact.
No dropped clauses, no invented content, no meaning inversions, no compressions of
anecdotes, no factual/historical distortions were found. The modern-English register
choices are consistently faithful paraphrases at the sentence and clause level — closer
to a careful one-to-one transposition than a loose retelling — and frank material
(death, the body, sex, the passage on scratching/itching, the graphic account of the
king of Mexico's torture, the "make children before sleep... not standing" passage,
etc.) is rendered without softening or omission.

### Per-chapter notes

**Ch. 100 — Of coaches** (70 paragraphs): Clean. Long digressions on chariots, Roman/
Mexican/Peruvian excess, and the conquest of the New World (including the frank
condemnation of Spanish atrocities) all check out faithfully, including all numeric
figures (e.g., "one million three hundred and twenty-five thousand five hundred
[pounds'] weight of gold," "four hundred and sixty men," "twenty-five paces wide").

**Ch. 101 — Of the inconvenience of greatness** (14 paragraphs): Clean. Citations
(Cicero De Finibus, Plutarch, Horace, Livy) and anecdotes (Otanes, Alexander/Brisson,
Carneades on princes' sons, Tiberius refusing the eloquence prize, Hadrian/Favorinus,
Dionysius/Philoxenus) all accurate.

**Ch. 102 — Of the art of conference** (95 paragraphs): Clean. The long discussion of
disputation, Socratic method, Tacitus criticism, and the closing self-deprecating
passage on "judgments in gross" are all faithfully rendered.

**Ch. 103 — Of vanity** (300 paragraphs, the largest chapter): Clean. This chapter
covers travel, household management, Paris, friendship-at-a-distance, preparations for
death, publishing motives, and the extended defense of his mayoralty and civil-war
conduct — all checked paragraph by paragraph with no defects. All Latin epigraphs and
their bracketed translations match.

**Ch. 104 — Of managing the will** (123 paragraphs): Clean. Covers his civic service as
mayor of Bordeaux, moderation in political engagement, the plague/civil-war material
(shared in part with ch. 106), and the extended discussion of ambition and moderate
glory-seeking (Bion, Cyrus, Scipio, etc.) — all faithful.

**Ch. 105 — Of cripples** (60 paragraphs): Clean. Includes the frank discussion of the
proverb about "lame mistresses" and sexual folk-physiology, witch trials, and
epistemological skepticism about miracles — rendered without sanitizing.

**Ch. 106 — Of physiognomy** (142 paragraphs): Clean. Includes the extended Socrates
encomium, the account of the 1585-86 plague and civil war ravaging Montaigne's
region, and the two autobiographical anecdotes of being spared by armed men because of
his "face" — all faithful, including Socrates' full courtroom speech (paraphrased
in-text from Plato's Apology) reproduced in full and accurately.

**Ch. 107 — Of experience** (240 paragraphs, Montaigne's famous closing essay): Clean.
This is the book's final chapter and was given particular scrutiny given its
importance. Covers epistemology and law, self-knowledge, his habits of diet/sleep/
dress/health, the extended meditation on the kidney stone ("nature's" reassuring
speech to him is reproduced in full and accurately), the soldier's life, old age, and
the closing celebration of living according to nature and enjoying bodily and mental
life together ("When I dance, I dance; when I sleep, I sleep"). No softening of the
frank material (bodily functions, the itch, sexual reference, "to voluptuously beget
them with our fingers and heels," etc.). The closing Horace ode translation and the
Pompey/Athenians inscription passage are both accurate.

## Output

`mt-batchJ-corrected.json` is byte-for-byte a copy of
`mt-batchJ-current-modern-en.json` (no edits were needed). Paragraph counts verified
programmatically to match `mt-batchJ-source.json` for all 8 chapters (70, 14, 95, 300,
123, 60, 142, 240 — total 1,044 paragraphs).
