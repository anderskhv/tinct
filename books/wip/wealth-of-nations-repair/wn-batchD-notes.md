# Wealth of Nations — Batch D Content-Fidelity Repair Notes

**Scope:** `wn-batchD-current-modern-en.json` (Book II, Chapters 1–3 / global chapter numbers 12–14) checked paragraph-by-paragraph against `wn-batchD-source.json`.

## Method

1. Verified structural parity: 3 chapters, paragraph counts 32 / 108 / 43, matching the source exactly (chapter numbers 12, 13, 14).
2. Ran automated anomaly detection across all 183 paragraphs:
   - Numeral/number-word extraction and diff (digits plus spelled-out number words, word-boundary matched) to catch dropped, invented, or altered quantities, prices, dates, and historical figures.
   - Sentence-count diffing (source vs. modern) to flag paragraphs where sentences might have been merged/dropped/split in a way suggesting lost content.
   - Negation-word count diffing (`not/never/no/none/nothing/neither/nor/cannot/without`) to catch possible meaning inversions.
3. Manually read every paragraph flagged by the above heuristics, in full, side-by-side with source.
4. As a final pass, read **every** paragraph in all three chapters in full side-by-side with source (not just flagged ones), including all the historical Bank of England / Bank of Scotland figures (paragraphs with dense £/per-cent/date data — e.g. Ch.2 paras 41–46, 54–56, 74, 80–86, 101), to confirm fidelity on the passages where Smith's argument depends most heavily on precise numbers.

## Verdicts

### Chapter 1 (source-numbered "Chapter 1" / global ch. 12 — "Of the Division of Stock")
**Verdict: PASS — no defects found.** All 32 paragraphs are faithful modern-English renderings. Structural/definitional content (fixed vs. circulating capital, the three-way division of a farmer's capital, the four components of fixed capital, the four components of circulating capital) is fully preserved with no dropped clauses, no compressed examples, and no numerical alterations.

### Chapter 2 (source-numbered "Chapter 2" / global ch. 13 — "Of Money, Considered as a Particular Branch of the General Stock of the Society...")
**Verdict: PASS — no defects found.** All 108 paragraphs are faithful. This chapter carries the heaviest numerical load in the batch (Bank of Scotland/Bank of England historical figures, exchange rates, coinage costs, dates of charters and acts of parliament, Pennsylvania currency examples). Every figure checked against source matches exactly, including:
- £411,117:10:9 sterling (Scottish silver recoinage value, para 42)
- £1,200,000 / £100,000 / £96,000 / £4,000 / 8% (Bank of England original 1694 charter terms, para 80)
- £1,001,171:10s / £2,201,171:10s (1697 capital enlargement, para 81)
- £400,000 / £1,600,000 / £1,775,027:17:10½d / £4,402,343 / £3,375,027:17:10½d (1708/1703 figures, para 82)
- £656,204:1:9d / £501,448:12:11d / £5,559,995:14:8d (1709/1710 calls, para 83)
- £5,375,027:17:10d / £4,000,000 / £3,400,000 / £9,375,027:17:10½d / £8,959,995:14:8d / £11,686,800 / £10,780,000 / £110,000 (1720s–1746 figures, para 84)
- £1,600,000 (1763 emergency advance, para 86)
- £100 → £130 / £1100 colony currency exchange examples (para 101)
- Bank of England gold coinage figures (£800,000–£1,000,000/yr, avg. £850,000; £4 vs £3:17:10½ per ounce; 2.5–3% loss) — para 54
- Dates: 1694, 1695, 1696, 1697, 1703, 1708, 1709, 1710, 1715, 1722, 1727, 1745, 1746, 1688, 1701, 1742, 1756, 1707, 1722 (Pennsylvania), 1759, 1751–52, 1762–64 — all preserved correctly throughout.

No inversions, no dropped sentences, no compressed/summarized passages, no altered place names (Glasgow, Edinburgh, Dumfries, Carlisle, Hamburg, Holland, Pennsylvania, etc. all correct).

### Chapter 3 (source title "OF THE ACCUMULATION OF CAPITAL, OR OF PRODUCTIVE AND UNPRODUCTIVE LABOUR" / global ch. 14)
**Verdict: PASS — no defects found.** All 43 paragraphs are faithful. The productive/unproductive labour argument, the parsimony/prodigality argument, and the historical survey (Restoration, Elizabeth, Wars of the Roses, Norman Conquest, Saxon Heptarchy, Julius Caesar's invasion) are all preserved intact, including the £145,000,000 / £200,000,000 war-debt figures (para 35) and the list of wars/rebellions (Fire and Plague of London, two Dutch wars, war in Ireland, French wars of 1688/1701/1742/1756, rebellions of 1715/1745).

**Note (non-blocking, out of task scope):** The `title` field for this chapter reads `"Chapter 3"` in the source file but `"OF THE ACCUMULATION OF CAPITAL, OR OF PRODUCTIVE AND UNPRODUCTIVE LABOUR."` in the modern-en file (source uses a generic placeholder title for this chapter while chapters 1–2 use "Chapter 1"/"Chapter 2" in both files). This is a title-field inconsistency, not a paragraph-content fidelity defect, so it was left untouched per the task's restriction to paragraph content and "do not touch paragraph count." Flagging here in case the pipeline wants to reconcile chapter titles separately.

## Defects found and fixed

**None.** After full paragraph-by-paragraph review of all 183 paragraphs across the three chapters (cross-checked against source text for dropped/invented clauses, meaning inversions, compressed passages, dropped numerical examples, and factual/numerical distortions), no content-fidelity defects were identified. The modern-English rendering in `wn-batchD-current-modern-en.json` is a faithful, complete modernization of the source — it consistently preserves clause structure, logical steps, historical dates, proper names, and (critically, given Smith's number-dependent arguments) every numeric figure, sum of money, percentage, and date checked.

## Output

`wn-batchD-corrected.json` is a byte-identical copy of `wn-batchD-current-modern-en.json` (same 3-chapter array shape, same paragraph counts as source: 32/108/43), since no in-place edits were required.
