# War and Peace — Tail Batch A (Chapters 333–340) — Rendering Notes

Source: `tail-batchA-source.json` (Aylmer & Louise Maude, public domain)
Output: `tail-batchA-candidate.json`

Re-rendered from scratch per instructions — the existing defective modern-en
for this zone was not consulted or referenced during this rendering.

## 1. Paragraph-count match (source vs. output)

| Chapter | Title | Source paragraphs | Output paragraphs | Match |
|---|---|---|---|---|
| 333 | Book Fifteen, Ch. 16 | 31 | 31 | ✅ |
| 334 | Book Fifteen, Ch. 17 | 56 | 56 | ✅ |
| 335 | Book Fifteen, Ch. 18 | 59 | 59 | ✅ |
| 336 | Book Fifteen, Ch. 19 | 9 | 9 | ✅ |
| 337 | First Epilogue, Ch. 20 | 21 | 21 | ✅ |
| 338 | First Epilogue, Ch. 1 | 17 | 17 | ✅ |
| 339 | First Epilogue, Ch. 2 | 11 | 11 | ✅ |
| 340 | First Epilogue, Ch. 3 | 16 | 16 | ✅ |

No paragraph was merged, split, reordered, or dropped. Total: 220/220 paragraphs, 8/8 chapters, all chapter titles preserved exactly as given in source.

## 2. Question-mark parity (per chapter, and verified per-paragraph)

| Chapter | Source "?" total | Output "?" total | Match |
|---|---|---|---|
| 333 | 8 | 8 | ✅ |
| 334 | 16 | 16 | ✅ |
| 335 | 35 | 35 | ✅ |
| 336 | 6 | 6 | ✅ |
| 337 | 8 | 8 | ✅ |
| 338 | 4 | 4 | ✅ |
| 339 | 3 | 3 | ✅ |
| 340 | 0 | 0 | ✅ |

Parity was checked and enforced **per paragraph**, not just per chapter total
(a script compared the exact `?`-count list for every paragraph in source vs.
candidate; all 220 paragraphs matched exactly). One early draft slip was
caught this way in Ch. 338 §11 (a single rhetorical question was accidentally
split into two sentences, producing 2 "?" instead of Tolstoy's 1) and in Ch.
338 §16 (a "?" was initially missed) — both were corrected and reverified
before finalizing.

Word-count ratio (candidate/source) per chapter ranged 0.99–1.06, consistent
with a full paragraph-for-paragraph rendering rather than compression.

## 3. Difficult paragraphs and approach

- **Ch. 338, the Alexander-I paragraphs (esp. the "substance of those
  reproaches" paragraph and the "circumstances of his birth, education, and
  life" paragraph)**: these are single, long periodic sentences stacking
  multiple appositive clauses (the historic-figure-on-a-pinnacle passage is
  one sentence in Russian/Maude). I split some of these into two or three
  sentences for modern readability, but kept every clause and every named
  qualifier (the intrigue/flattery/self-deception triad, the "not a
  fictitious but a live character" point, the "habits, passions, and
  impulses toward goodness, beauty, and truth" list, the present-day
  professor comparison). Where splitting a single rhetorical question would
  have changed the "?" count, I kept it as one sentence instead (see the
  "Don't the very actions..." paragraph) to preserve exact question-mark
  parity.
- **Ch. 339, the ram/herd metaphor**: this is Tolstoy's central illustration
  of "chance" and "genius" as empty labels for our own ignorance. Kept the
  full mechanism intact — the specific ram singled out by the herdsman, fed
  in a separate enclosure, growing twice as fat, appearing to the other rams
  as a "genius," and then being slaughtered — rather than compressing it to
  a one-line analogy, since cutting any step of it removes the argument's
  actual logic (the joke only lands if every step of the ram's specialness
  and its outcome is present).
- **Ch. 340, the Napoleon "chance" catalogue (paragraphs on his rise through
  Italy/Egypt/Brumaire and paragraphs 11–12 on Austerlitz and the 1811
  buildup)**: these are Tolstoy's densest enumerations — chain after chain
  of "chance" events and named incidents. These were the paragraphs I was
  most careful with, checking each named example against the source line by
  line before moving on (see spot-check below).

## 4. Confirmation that named examples and numbered lists were NOT compressed

Explicit spot-checks against the densest paragraphs:

- **Ch. 338 §8** (the historians' list of Alexander's "bad" decisions): all
  items preserved — granting Poland a constitution, forming the Holy
  Alliance, entrusting power to Arakcheev, favoring Golitsyn and mysticism,
  then Shishkov and Photius, meddling in the active army, and disbanding the
  Semyonov regiment. Nothing dropped.
- **Ch. 338 §5**: the named roll call of era figures — Alexander, Napoleon,
  Madame de Staël, Photius, Schelling, Fichte, Chateaubriand — all present,
  in source order.
- **Ch. 340 §1**: the three numbered preconditions for the westward invasion
  — (1) forming a military group large enough to collide with the eastern
  one, (2) discarding established traditions and customs, (3) having a
  leader able to justify the lies, robberies, and murders required — all
  three kept, numbered, in order.
- **Ch. 340 §4–6** (Napoleon's rise): checked off each concrete item against
  source — ignorance of colleagues, weakness/insignificance of opponents,
  bluntness of his lies, his self-confident limitations; the army sent to
  Italy, opponents' reluctance to fight; refusal from the Russian service,
  the failed Turkish appointment; near-destruction in Italy multiple times;
  the Russian armies arriving too late to damage his reputation; the
  dissolution of the Paris government; the African expedition; Malta's
  surrender without a shot; the enemy fleet letting his army through; the
  atrocities against the population; the Caesar/Alexander-the-Great
  self-comparison. All present — none summarized away.
- **Ch. 340 §11** (the Consulate/Austerlitz chain): verified all named
  "chances" are intact — the characters of France's rulers, Paul I of
  Russia recognizing his government, the plot against him that instead
  confirms his power, the Duc d'Enghien's killing as a show of might, the
  abandoned England expedition, the unexpected fall on Mack and the
  Austrians surrendering without battle, and the Austerlitz victory and its
  effect on all of Europe except England. All eight distinct "chance" beats
  are present in sequence, none merged or dropped.
- **Ch. 340 §12** (the 1805–1811 buildup): confirmed the specific years
  (1805, 1806, 1807, 1809, 1811), the named heads of state and their
  specific acts of self-abasement (the King of Prussia sending his wife, the
  Emperor of Austria giving a daughter of the Caesars, the Pope), and the
  named battles used for celebration (Jena and Auerstädt) are all present
  and not generalized into a vaguer summary sentence.

No named historical figure, numbered item, or concrete illustration found in
the source was cut, generalized, or merged into a paraphrase during this
rendering.

## Character-name normalization applied

- "Hélène" → "Helene" (1 occurrence, Ch. 336).
- "Marya Abrámovna" → "Mary Abramovna" (Ch. 334, applying the project's
  Marya→Mary rule).
- "Andrew," "Nicholas," "Mary" (Princess Mary) were already normalized in
  the source text and preserved as-is.
- No instances of "Andrei," "Nikolai," or "Kutuzov"-with-accent were
  introduced; none existed to normalize in this particular batch (Kutuzov
  does not appear by name in chapters 333–340).
- Other secondary names (Natasha, Sonya, Savelich, Rostov/Rostova, Sukharev,
  Oryol, Dessalles, Anna Semyonovna, Stepan Stepanych) were rendered without
  diacritics throughout, consistent with modern-English reading-edition
  style; this is a readability choice, not a project-mandated normalization,
  and is applied consistently across the batch.

## Dialogue formatting

Double quotes used throughout for dialogue; nested quotation (a speaker
quoting another speaker's words, e.g. Pierre imagining what Natasha would
say, or the "I shall look forward..." recollection in Ch. 335) uses single
quotes inside the double quotes, per house style.
