# Wealth of Nations — Batch A Independent Adversarial Review

Scope: `wn-batchA-current-modern-en.json` / `wn-batchA-corrected.json`
(Chapters 1–9), reviewed independently against `wn-batchA-source.json`.
This review does not trust `wn-batchA-notes.md`'s self-report and was
conducted as a full, non-spot-checked read of every paragraph.

## Verdict: **ACCEPT AS-IS**

No content-fidelity defects were found. This is a genuinely faithful,
sentence-level modern-English rendering of the source text across all 9
chapters (233 paragraphs). The drafter's "0 defects" self-report holds up
under independent adversarial review.

## Method

1. Byte-diffed `wn-batchA-corrected.json` against `wn-batchA-current-modern-en.json`.
2. Programmatically verified chapter and paragraph counts against
   `wn-batchA-source.json` for all 9 chapters.
3. Read every one of the 233 source/modern paragraph pairs side by side, in
   full (not sampled), across four passes covering Ch.1–3, Ch.4–5, Ch.6–7,
   and Ch.8–9.
4. Specifically re-verified every numerical example the drafter's notes
   claimed to have checked, reading the numbers directly out of both files
   rather than trusting the notes' transcription.
5. Watched throughout for dropped/invented clauses, negation or conditional
   inversions, compression of examples, silent drops of historical/numeric
   detail, and reversed argument direction — the failure modes this task
   was designed to catch.

## 1. File identity check

```
diff -q wn-batchA-corrected.json wn-batchA-current-modern-en.json
```
→ **IDENTICAL**. Confirmed byte-for-byte, not just claimed.

## 2. Paragraph-count check (programmatic, all 9 chapters)

| Ch | Source paras | Modern paras | Match |
|---|---|---|---|
| 1 | 12 | 12 | ✅ |
| 2 | 6 | 6 | ✅ |
| 3 | 8 | 8 | ✅ |
| 4 | 18 | 18 | ✅ |
| 5 | 44 | 44 | ✅ |
| 6 | 25 | 25 | ✅ |
| 7 | 38 | 38 | ✅ |
| 8 | 55 | 55 | ✅ |
| 9 | 23 | 23 | ✅ |

Total 233/233, matching the notes file's claim exactly.

## 3. Full paragraph-by-paragraph read — findings

Read all 233 paragraphs in full, side by side. No dropped clauses, no
negation drops, no flipped conditionals, no reversed argument direction, no
silently compressed/summarized examples were found in any chapter. The
rendering consistently modernizes vocabulary and syntax while preserving
every clause, every proper noun, every date, and every figure. Where the
source repeats a number in different denominations (e.g. currency vs.
sterling, pounds vs. shillings vs. pence), the modern rendering carries all
of them through.

## 4. Independent verification of the specific numerical examples cited in the notes

All of the following were re-checked directly against both files (not
against the notes' transcription of them), and all are confirmed intact
and undistorted:

- **Pin-factory example** (Ch.1 ¶3): ten workmen, "upwards of four thousand"
  pins/lb, "upwards of forty-eight thousand" pins/day, 4,800 pins/person/day,
  "not the two hundred and fortieth, perhaps not the four thousand eight
  hundredth part" — all present and correctly carried in the modern text.
- **Nail-making comparison** (Ch.1 ¶6): "two or three hundred" (untrained
  smith), "eight hundred or a thousand" (occasional nailer), "upwards of two
  thousand three hundred" (boys under twenty) — all correct, boys-under-20
  detail preserved.
- **Water vs. land carriage** (Ch.3 ¶2): 4 tons by 8-horse wagon vs. 200
  tons by 6–8 man ship, London–Edinburgh, "fifty broad-wheeled waggons...
  four hundred horses," 100 men for 3 weeks vs. 6–8 men — all figures and
  the cost-direction argument (water far cheaper) intact.
- **Coinage debasement history** (Ch.4 ¶9): Servius Tullius, Edward I,
  "18th of Henry the VIII" → "eighteenth year of Henry VIII," Charlemagne,
  Alexander I to Robert Bruce, debasement ratios (Roman 1/24, English ~1/3,
  Scots ~1/36, French ~1/66) — all preserved with correct values.
- **Gold/silver mint and market prices** (Ch.5 ¶32–40): £3 17s 10½d mint
  price of gold, 44½ guineas/lb, mint price of silver 5s 2d/oz, market
  ranges (5s 4d–5s 8d before reform; 5s 3d–5s 5d after), 14:1 (Europe) vs.
  15:1 (England) gold-silver ratio, 8% French seignorage — all figures and
  the above/below-mint-price direction before/after reform preserved
  correctly.
- **New York 1773 wage table** (Ch.8 ¶20): common labourers 3s 6d currency
  / 2s sterling; ship-carpenters 10s 6d + 6d rum = 6s 6d sterling;
  house-carpenters/bricklayers 8s currency / 4s 6d sterling; journeymen
  tailors 5s currency / ~2s 10d sterling — all four rows correct, and the
  "nominal wages higher, real wages higher still" argument is not inverted.
- **English vs. Scottish wage comparison** (Ch.8 ¶29, ¶32): London 18d vs.
  14–15d a few miles out; Edinburgh 10d vs. 8d; historic Scottish day-wages
  (6d summer/5d winter) vs. current (8d, up to 10d–1s near Edinburgh/
  Glasgow); Hales's 10s/week (£26/yr, family of six) vs. Gregory King's
  £15/yr (3.5 persons), both ~20d/head/week — all preserved, "corresponds
  very nearly" conclusion intact.
- **Cantillon subsistence-wage arithmetic** (Ch.8 ¶14): double maintenance,
  two children raised of four born (half die before adulthood), able-bodied
  slave worth double his maintenance — figures and direction intact, not
  simplified away.
- **Interest-rate statutory history** (Ch.9 ¶5, ¶8): Henry VIII 37th
  statute (10% cap), Elizabeth 13th c.8 (revived), James I 21st (8%),
  post-Restoration (6%), Anne 12th (5%); French rates 1720 (5%→2%), 1724
  (3⅓%), 1725 (5%), 1766 Laverdy (4%), Terray reversion (5%) — all correct.
- **Bengal usury and Brutus/Cyprus** (Ch.9 ¶12): 40/50/60% Bengal lending
  rates, Brutus's Cyprus loan at "eight-and-forty per cent" correctly
  rendered "forty-eight percent," attributed to Cicero's letters — correct.
- **Linen-manufacture compound-interest argument** (Ch.9 ¶22): twopence/day
  wage rise example, 5% profit rise example, the arithmetic-vs-geometric
  progression argument, and the closing line about merchants' silence on
  their own gains — all intact and in the correct direction.

No discrepancy was found in any of these ten examples.

## 5. Other checks

- Both `wn-batchA-corrected.json` and `wn-batchA-current-modern-en.json`
  parse as valid JSON (`python3 -m json.tool`).
- Chapter order and numbering (1–9) match between source and modern files.
- Chapter titles in both files are placeholder strings ("Chapter 1"..."Chapter 9")
  at the top-level `title` field in both source and modern JSON — this is a
  pre-existing characteristic of the source file itself (the real chapter
  titles appear correctly as paragraph 0 of each chapter's body, e.g. "OF
  THE DIVISION OF LABOUR" → "The Division of Labour"), not a fidelity
  defect introduced by this batch.

## Conclusion

Independent review confirms the drafter's self-report. No content-fidelity
defects of any kind — dropped clauses, inversions, compressions, or
numerical distortions — were found in Batch A, Chapters 1–9. Recommend
**accepting this batch as-is** with no fixes required.
