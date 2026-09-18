# Blind drafting comparison — War and Peace ch 355 (Second Epilogue, ch 2)

Date: 2026-09-18. Same prompt (`books/prompts/modern-en-repair/draft.md`), same inputs (source, baseline, CONVENTIONS.md). Reviewers saw only "A" or "B" and reviewed one candidate each; they did not know the model. Key in `BLIND-KEY.md` (A = Sonnet, B = Opus), sealed until the reviews were written.

| | Candidate A (Sonnet) | Candidate B (Opus) |
|---|---|---|
| Paragraphs changed | 6 of 13 | 11 of 13 |
| Longest sentence after | 50 words (from 118) | 50 words (from 118) |
| Gate A accessibility (Sonnet, candidate-only) | 8 clear / 5 hard / 0 unclear — REVISE | 9 clear / 4 hard / 0 unclear — REVISE |
| Root cause of "hard" | unglossed proper nouns, Le Contrat Social untranslated, resultant-force metaphor unframed | same, plus the "drown one another" example unanchored |
| Gate B fidelity (Opus) | 0 MAJOR / 2 MODERATE / 22 MINOR / 1 COSMETIC — REVISE | 0 MAJOR / 2 MODERATE / 28 MINOR / 3 COSMETIC — REVISE |
| Worst fidelity finding | ¶9 "not confirmed by" upgraded to "contradicted by" (more definite than source) | ¶2 gloss imports the summation step from ¶5 into an earlier paragraph |
| Characteristic fault | added intensifiers in nine paragraphs; spaced em dashes | softened two sneers; dropped causal "for" three times; over-glossing |
| Named historians, examples, numbered considerations, negations, conditionals | all preserved | all preserved |

## Verdict

No clear winner. Both drafts are faithful at the MAJOR level, both need the same kind of accessibility revision, and the amount and seriousness of correction needed is comparable (A slightly fewer minor findings, B slightly better on the accessibility read). Per the agreed rule ("if Opus wins clearly, use it for the difficult essays"), **Sonnet remains the drafting baseline for dense philosophical prose as well.** Candidate A was taken forward to correction and accepted after two rounds (see `ch355-ACCEPTED.md`).

## What the comparison also showed

- Neither model glosses references unless told to; the drafting prompt's "explain essential unfamiliar concepts briefly" was under-applied by both. The correction rulings (minimal identifying tags, no claims) should be folded into the drafting prompt.
- Both models add small intensifiers or connectives when restructuring long sentences. The fidelity review catches them reliably; the drafting prompt should name the habit.
- Sentence splitting alone did not produce a PASS on accessibility. Readability of this chapter is limited by unexplained references more than by syntax.
- The mechanical sentence splitter in `edition_checks.py` miscounts sentences ending inside a closing quotation mark (both drafters noted it); flag-only, harmless, but worth fixing.
