# Wealth of Nations — Batch F Content-Fidelity Review

**Scope:** `wn-batchF-current-modern-en.json`, Chapters 21–24 (Book IV, chs. 1–4), checked
paragraph-by-paragraph against `wn-batchF-source.json` (locked ground truth).

**Method:** Every paragraph in all four chapters (46 + 46 + 55 + 17 = 164 paragraphs) was read
side by side against its corresponding source paragraph. In addition to close reading, automated
screens were run first to prioritize suspicious paragraphs: (1) numeric-token diff between
source and modern-en paragraphs, (2) word-count / sentence-break ratio outliers, and (3)
negation-word-count mismatches. Every paragraph flagged by any of these screens was manually
read in full, and every remaining paragraph was also read in full to complete full paragraph-by-
paragraph coverage, since the automated screens are heuristic and do not reliably catch
substitution-type errors (e.g. a swapped proper noun that doesn't change sentence length).

## Per-chapter verdict

- **Chapter 21 ("Of the Principle of the Commercial or Mercantile System"), 46 paragraphs** —
  1 defect found (paragraph 10). All other 45 paragraphs are faithful modern-English renderings:
  numbers (£90,000,000 / £75,000,000 / £18,000,000 / £30,000,000, "2s. in the pound" ↔ "two
  shillings in the pound", £19,000,000, £6,000,000), historical facts, and logical structure of
  Smith's arguments (bullion-export mercantilist arguments, the Spartan/Lycurgus anecdote, the
  Mazepa/Cossack treasure anecdote, the Merovingian kings, etc.) are all preserved intact.

- **Chapter 22 ("Restraints on Importing Foreign Goods That Can Be Produced at Home"),
  46 paragraphs** — No defects found. All numeric content (23,728 quarters / 1-in-571 of annual
  consumption, 100,000 soldiers and seamen, distances of twenty/thirty leagues, etc.), the
  Navigation Act provisions, and the invisible-hand passage (paragraph 9) are rendered faithfully
  and completely, with no dropped clauses or inversions of meaning.

- **Chapter 23 ("Restraints on Importing... / Digression on the Bank of Amsterdam"),
  55 paragraphs** — No defects found. This chapter carries the heaviest numeric and historical
  load in the batch (Bank of Amsterdam founding date 1609, the 600-guilders threshold, the
  1692/1696 imposts on French goods and their percentages, the 1667/1671/1672/1678/1697/1700
  Anglo-Dutch/French tariff-war chronology, the bullion price tables with guilder amounts, the
  2,000 accountholders / £1,500 average / £3,000,000 / 33,000,000-guilders bank-treasure
  estimate, the five/four per cent agio bounds, France's population of 24,000,000 vs. the
  colonies' 3,000,000, and the 1775 North-American-colonies footnote). All of these figures and
  the surrounding argument (including the price-list tables in paragraphs 22 and 24, and the
  alehouse-trade / wine-cheapness-and-sobriety digression in paragraph 45) are reproduced
  accurately in the modern-English text.

- **Chapter 24 ("Of Drawbacks"), 17 paragraphs** — No defects found. All statutory citations (7
  Geo. I c. 21 s. 10; 4 Geo. III c. 15 s. 12), duty figures (£3 10s.), the tobacco/sugar
  monopoly figures (96,000 hogsheads imported vs. 14,000 home consumption), and the 1667–1781
  duty-history list in paragraph 9 (1667, 1692, 1745, 1763, 1778, 1779, 1780, 1781) are all
  correctly and completely carried over.

## Defects found and fixed

### Chapter 21, paragraph index 10 (0-based)

- **Type:** Factual/textual distortion — misquoted book title.
- **Source text (exact):** "...The title of Mun's book, *England's Treasure in Foreign Trade*,
  became a fundamental maxim in the political economy..."
- **Defective text (exact, as found in `wn-batchF-current-modern-en.json`):** "...The title of
  Mun's book, *England's Treasure by Foreign Trade*, became a basic maxim of economic policy..."
- **Issue:** The preposition in the quoted book title was silently changed from "in" to "by,"
  altering a directly quoted proper title that must match the source verbatim (the source file is
  locked ground truth for this repair pass, regardless of the historically attested real-world
  title of Mun's work).
- **Fix applied:** Changed "England's Treasure by Foreign Trade" back to "England's Treasure in
  Foreign Trade" in `wn-batchF-corrected.json`, chapter 21 (source `number: 21`), paragraph index
  10. No other wording in the paragraph was altered.

No other dropped clauses, invented content, meaning inversions, compressed/summarized passages,
dropped numerical examples, or factual/numerical distortions were found anywhere else in the
164 paragraphs reviewed.

## Verification

Paragraph counts in `wn-batchF-corrected.json` were verified programmatically to match
`wn-batchF-source.json` exactly, chapter by chapter:

```
ch 21: OK, 46 paragraphs
ch 22: OK, 46 paragraphs
ch 23: OK, 55 paragraphs
ch 24: OK, 17 paragraphs
ALL PARAGRAPH COUNTS MATCH
```

`wn-batchF-corrected.json` is otherwise identical to `wn-batchF-current-modern-en.json` (same
chapter-array shape, same `title` fields, same paragraph text) except for the single fix in
Chapter 21 paragraph 10 described above.
