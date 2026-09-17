# War and Peace — Tail Batch C (Chapters 353–365) — Repair Notes

Source: `tail-batchC-source.json` (Maude translation, public domain)
Candidate: `tail-batchC-candidate.json`

This zone covers the end of the First Epilogue (ch. 353, the Natasha/Pierre/
little Nicholas scene) and the entire Second Epilogue (ch. 354–365, Tolstoy's
essay on historical causation, power, and free will) — flagged by the prior
diagnostic audit as the single most damaged zone in the book. This batch is a
full from-scratch paragraph-for-paragraph rendering; nothing was carried over
from the old modern-en.

## 1. Paragraph-count confirmation (source vs. candidate)

All 13 chapters match exactly, verified programmatically:

| Chapter | Paragraphs |
|---|---|
| 353 | 46 / 46 |
| 354 | 24 / 24 |
| 355 | 13 / 13 |
| 356 | 9 / 9 |
| 357 | 32 / 32 |
| 358 | 19 / 19 |
| 359 | 20 / 20 |
| 360 | 23 / 23 |
| 361 | 30 / 30 |
| 362 | 27 / 27 |
| 363 | 34 / 34 |
| 364 | 10 / 10 |
| 365 | 13 / 13 |

No paragraphs were merged, split, reordered, dropped, or invented. Total: 300 paragraphs in, 300 out.

## 2. Question-mark parity per chapter

Per-paragraph "?" counts were checked programmatically against the source and
match exactly, paragraph by paragraph, in every chapter. Chapter totals:

| Chapter | "?" count (src = candidate) |
|---|---|
| 353 | 18 |
| 354 | 8 |
| 355 | 2 |
| 356 | 3 |
| 357 | 14 |
| 358 | 3 |
| 359 | 0 |
| 360 | 5 |
| 361 | 4 |
| 362 | 0 |
| 363 | 2 |
| 364 | 0 |
| 365 | 0 |

**Total: 59 question marks, source = candidate, exact per-paragraph match** (not
just chapter-level totals — every individual paragraph's count was diffed).

## 3. Worst-documented chapters — explicit content checks

**Chapter 355** (documented as the worst chapter in the book):
- Thiers/Lanfrey contrast: present in full (para 2 of 13) — "Thiers, a
  Bonapartist, says Napoleon's power rested on his virtue and his genius.
  Lanfrey, a Republican, says it rested on his trickery and his deception of
  the people."
- Gervinus/Schlosser example and the closing chiasmus: present (para 4) —
  "The ideas of the Revolution and the general temper of the age produced
  Napoleon's power. But Napoleon's power suppressed the ideas of the
  Revolution and the general temper of the age."
- The "contradict themselves" ending (para 7, the Stein/Metternich/Mme de
  Staël/Talleyrand/Fichte/Chateaubriand paragraph): rendered as "they
  contradict not only the specialist historians but themselves" — direct,
  no inversion to "which is precisely what X said."
- The two-part satirical explanation for why historians overrate
  intellectual/cultural history (para 12): rendered in full with both
  numbered points — (1) history is written by learned men, so it flatters
  their own class's importance; (2) "spiritual activity, enlightenment,
  civilization, culture, ideas" are vague enough to be worked into any
  theory. Nothing here was deleted or replaced with an invented sentence.

**Chapter 357**:
- The "historians reply / historians have no answer" structure (para 25,
  the "obscure, impalpable, and general abstraction" paragraph): rendered
  as historians *devising* an abstraction (freedom, equality, enlightenment,
  progress, civilization, culture) and studying leaders by that yardstick —
  not as "historians have no answer." No inversion.
- The 50-year chronological list of power transfers and its conclusion
  (para 19): rendered in full — "passes to the Convention, to the Directory,
  to Napoleon, to Alexander, to Louis XVIII, to Napoleon again, to Charles X,
  to Louis Philippe, to a Republican government, and to Napoleon III" —
  followed by the full conclusion about historians being forced to treat
  some transfers as "accidents resulting from cunning, from mistakes, from
  craft, or from the weakness of some diplomat, ruler, or party leader," and
  the closing point that this makes such historians see exceptions to their
  own theory.

**Chapter 361**:
- The four-domain paragraph sequence (theology / jurisprudence / ethics /
  history, paras 22–25) is rendered with each domain's question kept in its
  original logical assignment: sin → theology; social responsibility →
  jurisprudence; conscience/right-and-wrong → ethics; whether the past life
  of nations is free or constrained activity → history. No paragraph's
  logical role was swapped or substituted with another's content.

**Chapter 362**:
- All 7 illustrative examples of the freedom/necessity paradox are present
  in the long "when we do not at all understand the cause of an action..."
  paragraph (para 25 of 27), verified programmatically:
  1. the criminal reared among malefactors ("raised among criminals")
  2. parental self-sacrifice vs. self-sacrifice with hope of reward
  3. the founder of a sect or party / an inventor
  4. the dishonest son of a dishonest father
  5. the fallen woman ("fallen in with bad company")
  6. the drunkard's relapse into drinking
  7. the child, the madman, the simpleton
  No invented replacement sentence was substituted for any of these.

## 4. Hard calls made while rendering

- **Ch. 353, para 45** (the closing paragraph): the source's Russian-style
  interior monologue uses no quotation marks around Nicholas's thoughts in
  places; kept as unquoted italicized-in-spirit interior monologue (plain
  text, no quote marks) to match the source's own presentation, consistent
  with how it renders elsewhere in the chapter (e.g. para 40–42).
- **Ch. 354, para 17** (the long Louis XIV/Napoleon satirical chronicle):
  this is the single densest paragraph in the batch. Rendered as one
  continuous quoted "voice" paragraph exactly as in source (a single block,
  not split into multiple quoted lines), preserving every event in
  sequence: Louis XIV → weak descendants → pamphleteers → the Revolution →
  regicide → Napoleon's rise → the killing described plainly ("he killed a
  great many people," "killed them so thoroughly") without softening into
  euphemism → Egypt/Africa → Italy/Austria/Prussia → Alexander →
  1807 alliance → 1811 rupture → the 600,000-man invasion → the retreat →
  Stein → the coalition → Elba → Louis XVIII → the Hundred Days →
  Waterloo-era defeat → St. Helena → the post-1815 reaction. Nothing in
  this chain was compressed or summarized.
- **Ch. 355, paras 3 and 6** (the algebraic "component forces" argument):
  Tolstoy's math metaphor ("component forces equal to one A gave a
  resultant equal to a thousand times A") was kept literal rather than
  paraphrased away, since the argument's force depends on the arithmetic
  absurdity being visible.
- **Ch. 357, para 19**: this paragraph runs long in the source (Louis XIV/
  Louis XVI, the 50-year list, and the diplomatic-accident explanation all
  in one block) — kept as a single paragraph per the 1:1 rule rather than
  splitting it, even though it reads as several distinct moves; sentence
  boundaries were adjusted for modern readability but no content was moved
  across the paragraph boundary.
- **Ch. 363, para 4** (the "can I lift my arm?" time-freedom argument):
  Tolstoy's argument here turns on tense and the irrevocability of the
  already-lifted arm versus the not-yet-lifted arm a moment later. Kept the
  argument's circular, almost tongue-twisting structure intact rather than
  smoothing it into more linear prose, since the paradox is the point.
- **General**: dropped all Cyrillic-derived diacritics (Natásha → Natasha,
  Mítya → Mitya, Pétya → Petya, Platón → Platon, Iván → Ivan, Bolkónski →
  Bolkonski, Kúrbski → Kurbsky) for modern-en house style; applied the
  project's standardized character-name spellings (Andrew, Nicholas, Mary)
  throughout. "Le Contrat Social" (ch. 355) was kept in French per the
  source rather than translated, since Tolstoy names the actual book title.

## 5. Chapter titles

All 13 chapter titles were preserved exactly as given in the source file,
including the apparent mislabeling noted in the task (chapter 353 is titled
"Second Epilogue — Chapter 16" despite being First Epilogue content) — this
is a pre-existing artifact in the source and was left untouched per
instructions.
