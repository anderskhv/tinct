# Handoff: around-the-world-80-days modern-en repair

Branch: `content/rerender-around-the-world` (cut from `origin/content/typography-apostrophes-pending`).
Candidate: `books/wip/rerender/around-the-world-80-days/around-the-world-80-days-modern-en.json`
SHA-256: `604ac1abf6b11bb2e05b11f3df1e526355ad8df8e40768d17e6355ca1788defb`

Integration (another agent): replace `app/public/data/editions/around-the-world-80-days-modern-en.json` with the candidate.

## Changed chapters (whole chapter rewritten, paragraph indexes 0-based)

| Ch | Paragraphs | Sim before | Sim after |
|----|-----------|-----------|-----------|
| 12 | p0-p46 (47) | 0.882 LIGHT | 0.558 REAL |
| 15 | p0-p75 (76) | 0.907 LIGHT | 0.627 REAL |
| 17 | p0-p34 (35) | 0.880 LIGHT | 0.623 REAL |
| 30 | p0-p66 (67) | 0.853 LIGHT | 0.673 REAL |

All other 33 chapters are byte-identical to the branch's current file. Paragraph counts identical per chapter.

## Gate (unchanged `books/classify-modern-en.py`, run on scratch copies via absolute prefix)

| | Before | After |
|---|---|---|
| weighted similarity | 0.645 | 0.612 |
| light+mechanical | 4/37 = 10.8% | 0/37 = 0.0% |
| identical long paras | 22/1006 = 2.2% | 11/1006 = 1.1% |
| truncated quotations / wrapped | 0 / 0 | 0 / 0 |
| result | FAIL | PASS |

Checks on the rewritten chapters: every paragraph >= 75% of source words; `!` count per paragraph equals the original (0 shortfall, 0 excess); no straight quotes or brackets; every paragraph ends on terminal punctuation. Typography is curly (’ ‘ “ ”), as in the original.

## Spot-reads (original -> new)

- ch12 p26: "Oh, the scoundrels!" cried Passepartout, who could not repress his indignation. -> same exclamation, "who could not hold back his outrage."; ch12 p46 keeps "Sometimes ... when I have the time."
- ch15 p71: Passepartout's "pretty dear shoes ... More than a thousand pounds apiece; besides, they pinch my feet" -> "pretty expensive shoes ... and they pinch my feet besides"; sums (1000 bail, 300/150 fines, 5000+ spent) all intact.
- ch30 p27: Fogg's offer of five thousand dollars, the carpet-bag handed to Aouda, and "It was then a little past noon" all kept; ch30 p66 "Ah!" ... "imperturbable gentleman".

## Known issues

- Chapter 13 (0.847) and 1, 27-29 (0.83-0.84) are REAL but near the LIGHT line; untouched as the gate does not flag them.
- Short dialogue paragraphs remain close to the original by necessity (11 identical long paragraphs book-wide, 1.1%).
- Hand-written rewrite; no regex/dictionary passes, no API use.
