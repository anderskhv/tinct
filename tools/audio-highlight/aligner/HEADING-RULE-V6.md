# Helper v6 — unspoken chapter/section headings

Acoustic-only, cue-strip style. The 0.85 gate, timestamps and emitted source
words do not change. No GPU run ships with this pin.

## Rule

A paragraph is dropped from the scoring denominator only when the **whole
paragraph** is a short heading-like label (≤ 12 words). A heading that shares
a paragraph with prose is left in the comparison.

Accepted shapes:

- numbered ALL-CAPS section labels: `1. REACTIONARY SOCIALISM`
- lettered italic / title-case subsections: `_C. German, or “True,” Socialism_`
- short Roman-numeral titles without sentence punctuation
- `Chapter` / `Part` / `Section` / `Book` / `Canto` / `Volume` labels
- short unquoted ALL-CAPS title lines (3+ words, no `.?!` ending)
- short whole-paragraph italic titles

Rejected (stay in the denominator):

- numbered manifesto prose: `I. Communism is already acknowledged…`
- ordinary short sentences
- spoken slogans: `WORKING MEN OF ALL COUNTRIES, UNITE!`
- letter signatures and single ALL-CAPS names
- heading text followed by prose in the same paragraph

## Manifesto fixture (canary #15 / 35321419398)

`communist-manifesto/modern-en/4` paragraph 21 is

`_C. German, or “True,” Socialism_`

Under v5 that is five comparison tokens. A 4/5 near-miss scores **0.80** and
fails the 0.85 gate. Under v6 the heading is unspoken, `expected_words` is 0,
`match_ratio` is 1.0, and source tokens are restored as zero-span words. No
timestamp is invented outside a recogniser span.

See `test_normalisation_v3.py` class `UnspokenHeadings`.
