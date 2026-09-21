# Wealth of Nations — Batch I Content-Fidelity Repair Notes

Scope: `wn-batchI-current-modern-en.json` (Chapters 28–29: "Conclusion of the
Mercantile System" and "Of the Agricultural Systems...") checked paragraph-by-
paragraph against `wn-batchI-source.json`.

## Method

- Read every one of the 127 paragraphs (55 in Ch. 28, 72 in Ch. 29) side by
  side with its source paragraph.
- Cross-checked all statute citations (regnal year + chapter number), dates,
  monetary sums, weights/measures, and named places/persons for exact
  numerical/factual match.
- Ran a programmatic diff extracting every numeral token from each source
  paragraph and its modern-English counterpart to catch any silent figure
  changes across the whole batch (not just the passages read closely).
- Checked paragraph-length ratios across the batch to flag any paragraph
  compressed to less than half the source length (a signal of dropped
  clauses/summarization) for closer manual reading.
- Verified paragraph counts (55 / 72) match the source exactly, both before
  and after this pass.

## Chapter 28 — "Conclusion of the Mercantile System" (55 paragraphs)

**Verdict: PASS. No content-fidelity defects found.**

This chapter is dense with statute citations, dates, and bounty/duty figures
(wool export penalties, linen yarn duties, naval-stores and indigo/hemp/silk/
wood/beaver-skin/gum-senega bounty schedules, the Canal of Languedoc cost
figures, etc.). Every regnal-year/chapter citation, every shilling/pence/pound
figure, every date, and every place name in the modern-English rendering
matches the source exactly. No clauses, sentences, or numerical examples were
dropped; no meaning inversions were found; the extended quoted block (the
"whatever regulations tend to sink the price..." passage, para 25) is
reproduced verbatim as in the source, correctly kept in quotation marks.

## Chapter 29 — "Of the Agricultural Systems..." (72 paragraphs)

**Verdict: PASS. No content-fidelity defects found.**

Covers Quesnay's Économistes / Physiocratic system (Colbert critique, the
three-class model, "productive" vs. "barren" labour, the lace/flax and
six-months'-labour worked examples, Quesnay's Economical Table), the
comparison of Chinese/Egyptian/Indian vs. Greek/Roman agricultural policy
(with the Roman-price examples from Pliny — denarii, £3:6s:8d, £33:6s:8d,
£30,000/£300,000 triclinaria figures — and the shoemaker/50-families market-
size example), the "system of natural liberty" statement of the sovereign's
three duties, and the appendix (the herring-bounty tables for Scotland,
1771–1781, and the salt-import table, 1771–1782).

All numerical figures were checked, including the two full data tables in the
appendix (busses/barrels/bounty figures for each of the 11 years 1771–1781,
totals, and the salt bushel-weight/quantity figures for 1771–1782) — these are
reproduced digit-for-digit identical to the source, as they should be. The
three-duties-of-the-sovereign passage (para 51) and the "productive/
unproductive expense" distinctions (paras 6–14) — the most argument-critical,
error-prone passages in this chapter — preserve the source's logical structure
and conditionals without inversion (e.g., para 36's paraphrase of the
merchants'-parsimony conditional keeps the "if...then" structure intact rather
than asserting it as fact).

The only differences the numeral-diff pass surfaced were punctuation/OCR
artifacts in the source itself (e.g. a stray "1." for "l." in the Pliny
citation "Plin. l. ix. c. 39", and trailing periods on footnote page numbers),
which the modern-English edition correctly normalizes rather than distorts.

## Fixes made

**None.** No dropped clauses, meaning inversions, compressed passages,
dropped numerical examples, or factual/numerical distortions were found in
either chapter. `wn-batchI-corrected.json` is therefore byte-for-byte
identical in content to `wn-batchI-current-modern-en.json` (same JSON
structure, same paragraph text). Paragraph counts were verified
programmatically to match `wn-batchI-source.json` exactly (55 for Ch. 28, 72
for Ch. 29) both before and after this review.
