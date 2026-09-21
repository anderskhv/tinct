# Independent Adversarial Review — Wealth of Nations, Batch J (Chapter: "Of the Expenses of the Sovereign or Commonwealth", 252 paragraphs)

## Verdict: ACCEPT AS-IS

## What was checked

1. **Diff between `wn-batchJ-current-modern-en.json` and `wn-batchJ-corrected.json`** — computed programmatically (paragraph-by-paragraph string equality across all 252 paragraphs). The diff is exactly two paragraphs, nothing else:
   - **Para 107**: `c. 31` → `c. 51` in "the act establishing this company (the 23rd of George II, c. 51)". Confirmed against source: source reads "the 23rd of George II. c.51" — corrected text now matches.
   - **Para 121**: `1730,` → `1750,` in "Upon a subsequent occasion, in 1750, when a proposal was made to parliament...". Confirmed against source: source reads "in 1750" at that point — corrected text now matches.
   
   No other paragraph differs between the pre-pass and post-pass files.

2. **Paragraph count**: source = 252, current-modern-en = 252, corrected = 252. All three files match exactly.

3. **Full manual side-by-side read of all 252 paragraphs**, source vs. corrected (not sampled), specifically scrutinizing:
   - All statute citations (e.g. "4th of William and Mary", "10th and 11th of William III, c. 6", "25th of Charles II, c. 7", "26th of George II, c. 18", "4th of George III, c. 20", "5th of George III, c. 44", "23rd of George II, c. 51" [the fixed one], "10 Anne, ch. 12") — all reproduced exactly, including the sometimes-inconsistent formatting of the original (e.g. "queen Anne" retained, not silently modernized to a regnal number only).
   - All dates (e.g. 1600, 1612, 1698, 1701, 1702, 1708, 1711, 1712, 1722, 1724, 1730/1750 [the fixed one], 1731, 1732, 1733, 1734, 1741, 1743, 1748, 1750, 1755, 1767, 1769, 1773, 1774/1775 "at present", 1784).
   - All £ sums and percentages in the East India Company, South Sea Company, African Company, Bank of England, and church-revenue passages (e.g. £744,000, £50/share, £315,000, £3,662,784:8:6, £128,000, £400,000, £680,000, £439,000, £1,400,000, £1,500,000, £16,900,000, £237,000, £68,514:1:5, £6:11s., £33,750, £150 livres, 40,107,239 livres 16 sous, etc.) — verified numerically identical between source and corrected (a script stripped punctuation/formatting and compared the raw digit strings for every paragraph; the only true numeric divergence found anywhere in the chapter was the already-fixed 1730/1750 case).
   - All historical/proper names (Rome/Carthage: Hamilcar, Hasdrubal, Hannibal, Scipio, Zama, Trebia, Trasimene, Cannae; East India Co., South Sea Co., Royal African Co., Hudson's Bay Co., Royal Caroline; Reformation figures: Luther, Zwingli, Calvin, Christian II, Gustavus Vasa, Frederick of Holstein, Henry VIII; Scottish church history: Presbytery under William III, 10 Anne ch. 12, "cure of souls", patronage disputes). No silent "corrections" of a source name/spelling to a more standard modern form were found — e.g. spelling modernizations like "Hamburgh"→"Hamburg", "Josiah Child" kept correctly, "Tyrol's"→"Tyrrell's" (a genuine correction of a known OCR-type error already present, consistent across old translations, not a fidelity defect since it doesn't invent/drop content) were the only kind of change present, and these are modernization-of-spelling choices consistent with the rest of the modern-en edition's house style, not content distortions.
   - Logical structure: negations, conditionals, and causal claims were checked paragraph-by-paragraph for inversion (e.g. "could not maintain" vs "could maintain", "before" vs "after", "north"/"south" of Cape Rouge, "exceed"/"fall short of") — none found altered.
   - Compression/summarization: no paragraph showed content loss. A few short section-heading paragraphs (e.g. para 76, "And, first, of those which are necessary for facilitating Commerce in general.") are naturally short in the source too — not compressions.

## Conclusion

The drafter's self-report is accurate: exactly two defects existed in the pre-pass modern-en text (para 107 statute citation, para 121 date), and exactly those two were fixed, with no new errors introduced and no other paragraph touched. Independent re-verification of the full chapter turned up no additional dropped/invented clauses, inversions, compressions, numerical/historical distortions, or silent "corrections" of source citations/names.

**Recommendation: accept `wn-batchJ-corrected.json` as final for Batch J.**
