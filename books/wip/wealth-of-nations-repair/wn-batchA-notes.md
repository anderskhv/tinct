# Wealth of Nations — Batch A Content-Fidelity Audit

Scope: `wn-batchA-current-modern-en.json` (Chapters 1–9: Of the Division of
Labour; Of the Principle Which Gives Occasion to the Division of Labour;
That the Division of Labour Is Limited by the Extent of the Market; Of the
Origin and Use of Money; Of the Real and Nominal Price of Commodities; Of
the Component Parts of the Price of Commodities; Of the Natural and Market
Price of Commodities; Of the Wages of Labour; Of the Profits of Stock),
checked paragraph-by-paragraph against `wn-batchA-source.json`.

## Method

Every paragraph in every chapter (233 paragraphs total across 9 chapters)
was read side-by-side against the corresponding source paragraph, checking
for: dropped or invented clauses/sentences; meaning inversions (dropped
negations, flipped conditionals, reversed argument direction); compression
or summarization of numerical examples and historical data; numerical/
factual distortions (prices, wages, quantities, dates, place names); and
any other fidelity break. This was supplemented by an automated numeral-
extraction cross-check (digits and number-words) across all paragraphs to
flag any paragraph where a number present in the source was missing (or
vice versa) in the modern-English rendering, as a second pass against
missed numerical errors.

The automated pass flagged ~40 "mismatches," all of which were verified by
hand to be false positives caused by the checker's regex limits — e.g.
"one another" / "someone" phrases, ordinals like "eighteenth" (not matched
as a digit "18"), and Roman numerals such as "tom. iii" being correctly
rendered as "volume 3" (an arabic "3" the digit-regex flagged as
"extra"). No true numerical discrepancy was found by either the manual
read or the automated cross-check.

## Per-Chapter Verdict

| Chapter | Title | Paragraphs | Verdict |
|---|---|---|---|
| 1 | Of the Division of Labour | 12 | Sound |
| 2 | Of the Principle Which Gives Occasion to the Division of Labour | 6 | Sound |
| 3 | That the Division of Labour Is Limited by the Extent of the Market | 8 | Sound |
| 4 | Of the Origin and Use of Money | 18 | Sound |
| 5 | Of the Real and Nominal Price of Commodities | 44 | Sound |
| 6 | Of the Component Parts of the Price of Commodities | 25 | Sound |
| 7 | Of the Natural and Market Price of Commodities | 38 | Sound |
| 8 | Of the Wages of Labour | 55 | Sound |
| 9 | Of the Profits of Stock | 23 | Sound |

**No content-fidelity defects were found in any of the 9 chapters.** This
batch's modern-English rendering is a faithful, sentence-for-sentence
modernization of Smith's original prose. Specifically verified as intact
and undistorted:

- **The pin-factory example** (Ch.1 ¶3): ten workers, ~4,000 pins/lb,
  ~48,000 pins/day, 4,800 pins/person/day, "certainly not the two hundred
  and fortieth, perhaps not the four thousand eight hundredth part" — all
  numbers carried through correctly.
- **Nail-making comparison** (Ch.1 ¶6): "two or three hundred," "eight
  hundred or a thousand," "upwards of two thousand three hundred" nails/day
  — all correct, and the boys-under-twenty detail preserved.
- **Water vs. land carriage example** (Ch.3 ¶2): 4 tons by 8-horse wagon
  vs. 200 tons by 6–8 man ship between London and Edinburgh, "fifty
  broad-wheeled waggons... four hundred horses" — all figures preserved
  exactly, including the cost-accounting logic (100 men for 3 weeks vs.
  6–8 men) and the direction of the argument (water carriage is far
  cheaper, which is why coastal/riverine regions industrialize first).
- **Roman/English/Scots/French coinage history** (Ch.4 ¶9): Servius
  Tullius, Edward I, Henry VIII "18th year," Charlemagne, Alexander I to
  Robert Bruce, debasement ratios (Roman as to 1/24, English to ~1/3,
  Scots to ~1/36, French to ~1/66) — all preserved.
- **Gold/silver mint and market prices** (Ch.5 ¶32–40): £3 17s 10½d mint
  price of gold, 44½ guineas per pound weight, mint price of silver 5s
  2d/oz, market-price ranges (5s 4d–5s 8d before reform; 5s 3d–5s 5d
  after), 14:1 vs 15:1 gold-silver ratio in Europe vs England, 8% French
  seignorage — all figures preserved with correct direction (market price
  above mint price before reform, below after).
- **New York 1773 wage table** (Ch.8 ¶20): common labourers 3s 6d currency
  / 2s sterling; ship-carpenters 10s 6d + a pint of rum (6d) = 6s 6d
  sterling; house-carpenters/bricklayers 8s currency / 4s 6d sterling;
  journeymen tailors 5s currency / ~2s 10d sterling — all preserved, and
  the argument (nominal wages higher, real wages higher still because
  provisions are cheaper) is intact, not inverted.
- **English vs. Scottish wage comparison** (Ch.8 ¶29, ¶32): London 18d
  vs. 14–15d a few miles out; Edinburgh 10d vs. 8d; historical Scottish
  day-wages (6d summer/5d winter) vs. current (8d, up to 10d–1s near
  Edinburgh/Glasgow); Judge Hales's 10s/week (£26/yr) for a family of six
  vs. Gregory King's £15/yr for 3.5 persons (both ~20d/head/week) — all
  numbers and the "correspond very nearly" conclusion preserved.
- **Cantillon's subsistence-wage arithmetic** (Ch.8 ¶14): double
  maintenance, two children raised of four born (half die before
  adulthood), slave-labour-worth-double comparison — direction and figures
  intact, not inverted or simplified away.
- **Interest-rate statutory history** (Ch.9 ¶5, ¶8): Henry VIII 37th
  statute (10% cap), Elizabeth 13th (revived), James I 21st (8%),
  post-Restoration (6%), Anne 12th (5%); French rates 1720 (5%→2%), 1724
  (3⅓%), 1725 (5%), 1766 Laverdy (4%), Terray reversion (5%) — all
  preserved with correct dates and percentages.
- **Bengal usury and Brutus/Cyprus** (Ch.9 ¶12): 40/50/60% Bengal lending
  rates and Brutus's 48% loan in Cyprus (Cicero's letters) — both correctly
  rendered ("eight-and-forty per cent" → "forty-eight percent").
- **Linen-manufacture compound-interest argument** (Ch.9 ¶22): the
  arithmetic-vs-geometric-progression argument for why high profits raise
  prices more than high wages is preserved intact, including the twopence
  and 5% figures and the polemical closing line about merchants' silence
  on their own gains.

No dropped clauses, no negation drops, no flipped conditionals, no reversed
argument directions, and no compressed/summarized numerical examples were
found anywhere in the batch.

## Fixes Applied

**None.** No defects were found requiring correction.

## Output

`wn-batchA-corrected.json` is a byte-for-byte copy of
`wn-batchA-current-modern-en.json` (no edits were needed). Paragraph counts
were verified programmatically to match `wn-batchA-source.json` exactly for
all 9 chapters (12, 6, 8, 18, 44, 25, 38, 55, 23 paragraphs respectively —
233 total).
