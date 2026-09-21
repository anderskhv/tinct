# Wealth of Nations — Batch C (Chapter 11, "Of the Rent of Land") — Independent Adversarial Review

## Verdict: ACCEPT WITH FIXES REQUIRED

The drafter's claimed fix (paragraph 207) is verified correct and complete, the
diff is exactly what was claimed, and the chapter is otherwise a faithful,
complete rendering. However, independent numeric auditing turned up **one
pre-existing, unflagged factual deviation from source** (paragraph 43, a
footnote page citation) that survives unchanged in both the pre-fix and
post-fix files. It should be corrected before this batch is signed off as
fully fact-checked, even though it predates this pass's edit and is not part
of the truncation defect.

---

## 1. Diff scope — CONFIRMED

Programmatic paragraph-by-paragraph diff of `wn-batchC-current-modern-en.json`
vs `wn-batchC-corrected.json` (298 paragraphs each):

```
diff indices (cur vs cor): [207]
```

Exactly one paragraph changed, matching the drafter's claim. Chapter `number`
(11) and `title` ("Chapter 11") are unchanged and identical across
current/corrected/source.

## 2. The claimed fix (paragraph 207) — CONFIRMED CORRECT AND COMPLETE

- **Current (defective) file** does cut off mid-word: "...The plenty not only
  forces him to sell cheaper but, as a result of these im" — confirmed by
  direct read of `wn-batchC-current-modern-en.json` paragraph 207.
- **Source paragraph 207** (the poultry-feeding-economics paragraph) contains
  the full two sentences about diminishing production costs and the claim
  that clover/turnips/carrots/cabbages helped push London butcher's-meat
  prices "somewhat below what it was about the beginning of the last
  century." Confirmed by direct read of `wn-batchC-source.json`.
- **Corrected paragraph 207** restores this content in matching modern-English
  register, faithful to source meaning, with no invented facts, no dropped
  clauses, and no numeric content in this segment to corrupt. The rest of the
  paragraph (everything before the truncation point) is untouched and matches
  the current file exactly — only the missing tail was appended.

This part of the drafter's report is accurate.

## 3. Full-chapter independent read — 298/298 paragraphs checked

Method (deliberately different from the drafter's, to avoid rubber-stamping):
1. Paragraph-count check: source = current = corrected = **298**. Confirmed.
2. Terminal-punctuation scan across all 298 corrected paragraphs: only 21
   flagged, and all 21 are section headers or price-table rows that
   legitimately don't end in sentence punctuation (e.g. "PRICES OF WHEAT",
   table row fragments). No prose paragraph other than the fixed 207 shows a
   truncation signature.
3. Length-ratio scan (corrected/source character length) across all
   paragraphs >20 chars: lowest ratios (~0.80–0.87) all manually verified
   (paragraphs 189, 112, 163, 50, 8, 9, 6, 94, 128, 100, 104, 147, 167, 28, 29,
   141, 144, and others) — in every case the shorter modern-English rendering
   is simply tighter 21st-century prose (18th-century Smith is highly
   redundant/legalistic); no clauses, facts, or figures are missing in any of
   these.
4. Numeric-token extraction and cross-check (every digit-string in every
   paragraph, source vs corrected): 15 paragraphs flagged a difference; 14 of
   15 are pure formatting artifacts (spelled-out ordinals like "1st"→"first",
   trailing comma vs period after a year, "5-7ths" → "five-sevenths", etc.)
   with no numeric value actually altered. **One genuine value discrepancy
   found — see Section 4 below.**
5. Sentence-count heuristic (regex-based) flagged 12 paragraphs where the
   corrected version merges sentences via semicolons/dashes; all 12 manually
   read in full (28, 29, 35, 100, 104, 141, 144, 147, 148, 167, 174, 220) —
   confirmed faithful merges, no content loss.
6. Section-header/subheading check: all structural headers present and in
   correct order in both files (Part I, "After food, clothing and lodging...",
   "The great market for silver...", Digression opening/conclusion, "Effects
   of the Progress of Improvement upon the Real Price of Manufactures",
   "Conclusion of the Chapter", "PRICES OF WHEAT", Book II heading,
   "INTRODUCTION"). Nothing dropped or reordered.

No second truncation, no other silently dropped sentence, and no meaning
inversion was found anywhere in the chapter outside paragraph 207.

## 4. Price-table appendix (paragraphs 275–289) and other historical data

- Paragraphs 275–289 (the grain-price table rows) are **byte-for-byte
  identical** between `wn-batchC-source.json` and `wn-batchC-corrected.json`
  — confirmed programmatically, not just spot-checked. (Paragraph 274, the
  "PRICES OF WHEAT" header, differs only by a stripped leading `#` markdown
  character — cosmetic, not a content change.) This is the strongest possible
  fidelity result for the table: no digit anywhere in the 16-paragraph table
  block was altered, dropped, or reformatted.
- Spot-checked historical data points outside the table, all confirmed exact
  matches to source: 1309 Canterbury feast prices (53 quarters wheat @ 7s 2d,
  58 quarters malt @ 6s, 20 quarters oats @ 4s); 1350 Statute of Labourers
  (tenpence/bushel, half ounce silver Tower weight); 1262 assize of bread and
  ale (ten shillings, six ounces silver); 1595–1620 and 1637–1700 Eton College
  wheat-price averages (£2 1s 6d 9/13, £2 11s 0⅓d) with all fractional
  shilling/pence figures intact; 1695 coin-debasement figure ("near
  five-and-twenty per cent" / "near twenty-five per cent" — same value,
  reworded); 1688 corn-export bounty threshold (48 shillings/quarter); 1487
  Henry VII sumptuary law (16 shillings/yard, 24 shillings present-money
  equivalent); 1463 Edward IV sumptuary law (2 shillings/yard, 4 shillings
  present-money equivalent); 1750 Spanish American silver/gold registration
  figures (8,029,156 / 1,514,962 / 324,176) — all exact.

## 5. Defect found — paragraph 43 (footnote page citation)

**Not part of the claimed fix, and present identically in both the pre-fix
current file and the corrected file** — i.e. this is a **pre-existing,
unaddressed** fidelity error in the modern-en text, not something introduced
or caught by this repair pass.

- **Source paragraph 43** (tobacco cultivation in Virginia/Maryland), closing
  citation: `{Douglas's Summary, vol. ii. p. 379, 373.}`
- **Both current and corrected paragraph 43** render this as: `vol. ii, pp.
  372, 373` — the first page number has been changed from **379 to 372**.

This is a minor, isolated citation-numeral error (not economic data, not a
price/date/quantity central to the chapter's argument), but it is a genuine,
unflagged numeric deviation from the locked source that the drafter's notes
claimed did not exist anywhere in the chapter ("no numbers were altered,
dropped, or invented anywhere else in the chapter"). That claim is not quite
accurate.

**Recommendation:** correct `wn-batchC-corrected.json` paragraph 43 to read
"pp. 379, 373" to match source, or flag it for the books-content owner as a
known pre-existing citation typo if "372" is intentionally preferred (e.g. if
a prior fact-check determined 379 was itself a source-transcription error) —
but that determination should be explicit, not silent.

## Summary

| Check | Result |
|---|---|
| Diff scope matches claim (only ¶207 changed) | Confirmed |
| ¶207 fix accurate/complete vs source | Confirmed |
| Paragraph count (298) matches source | Confirmed |
| Full 298-paragraph independent read | Complete, no new truncations found |
| Price table ¶275–289 vs source | Byte-identical |
| Other historical data spot-checks | All exact |
| Additional defect found | ¶43 footnote page citation: source "379" → modern-en "372" (pre-existing, not introduced by this pass) |

**Verdict: accept with fixes required** — ship the paragraph-207 fix as-is (it
is correct), but correct or explicitly adjudicate the paragraph 43 citation
discrepancy before marking Batch C as fully fact-checked complete.
