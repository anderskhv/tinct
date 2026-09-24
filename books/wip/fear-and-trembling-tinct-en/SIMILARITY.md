# Similarity diagnostic (report only)

Metric: the word-token SequenceMatcher ratio from `books/classify-modern-en.py`, length-weighted. The served text is regrouped into matching units via `STRUCTURE-MAP.json`. Footnote-only served slots are grouped with nothing, so they are excluded. Buckets are ≥0.97 MECHANICAL, ≥0.85 LIGHT, ≥0.50 REAL, <0.50 REAL-HEAVY.

The candidate is a new translation from the Danish, so similarity to the served English is expected to be low. A high value in any unit would suggest the candidate was derived from the served text.

## Candidate vs served `original-en`

| Ch | Similarity |
|---|---|
| 1 | 0.597 |
| 2 | 0.604 |
| 3 | 0.550 |
| 4 | 0.598 |
| 5 | 0.560 |
| 6 | 0.614 |
| 7 | 0.601 |
| 8 | 0.526 |

Length-weighted overall: **0.591**. Units compared: 175. Byte-identical long units: 0. Units ≥0.85: [([(1, 3)], 1.0), ([(7, 60)], 0.873)].

## Candidate vs served `modern-en`

| Ch | Similarity |
|---|---|
| 1 | 0.642 |
| 2 | 0.679 |
| 3 | 0.630 |
| 4 | 0.685 |
| 5 | 0.645 |
| 6 | 0.655 |
| 7 | 0.649 |
| 8 | 0.653 |

Length-weighted overall: **0.658**. Units compared: 175. Byte-identical long units: 0. Units ≥0.85: [([(4, 3)], 0.917), ([(6, 4)], 0.945), ([(7, 60)], 0.873)].

## Reading the numbers

- **The drafters worked blind.** The drafting brief (`DRAFTING-BRIEF.md` rule 1) prohibited opening the served original-en and modern-en and any published translation. Drafters worked from the Danish only.
- **The overall level (about 0.6) is what two independent translations of one text produce.** Close English translations of the same Danish share most of their function words and the proper nouns. They also share the fixed terms: "the single individual", "the universal", "knight of faith", "teleological suspension of the ethical", "by virtue of the absurd". The book's own repetitions inflate the ratio further. None of the chapters falls in the LIGHT or MECHANICAL range.
- **The units at ≥0.85 are short and literal.**
  - 1.3 is the signature "Most respectfully, Johannes de silentio."
  - 7.40 opens "So Abraham did not speak. He did not speak to Sarah, not to Eliezer, not to Isaac".
  - 4.3 is a three-sentence paragraph that renders the Danish nearly word for word: *Blev derimod Synderen ikke overbeviist, saa er hans Stilling tragisk nok. Han blev da formodentlig henrettet eller sendt i Daarekisten …*.
  - 6.4 is one sentence from the accepted pilot.
  In each of these the Danish leaves one natural English rendering, so the match reflects the source, not derivation.
- This is a diagnostic, not a gate. The classify-modern-en gate measures a modernization against its own baseline; this edition has no English baseline, because it is translated from Danish. Independence from the copyrighted Lowrie and Hong translations was screened separately, part by part (`reviews/`, the screen lines in the `R*-applied-*.md` files). That screen is also a diagnostic and is not proof of legal clearance.
