# Wealth of Nations — Batch E Fidelity Repair Notes

**Scope:** `wn-batchE-current-modern-en.json` (chapters 15–20 of the source numbering,
covering Book II Ch.4–5 and Book III Ch.1–4), checked paragraph-by-paragraph against
`wn-batchE-source.json`.

## Method

1. Read every paragraph of all 6 chapters (18 + 39 + 10 + 22 + 21 + 28 = 138 paragraphs)
   side-by-side with the corresponding source paragraph.
2. Programmatic cross-check #1: paragraph-length ratio (modern/source character count)
   flagged for any paragraph under 0.6 — used to catch dropped clauses/compression.
   **Result: zero paragraphs flagged.**
3. Programmatic cross-check #2: extracted all numeric tokens (`\d[\d,]*`) from every
   source/modern paragraph pair and diffed the sets, to catch altered figures, dates,
   quantities. **Result: only cosmetic differences** — numbers spelled out in the
   modern edition (e.g. source "100,000" → modern "a hundred thousand acres", source
   "5000" → modern "five thousand", source "14th" → modern "fourteenth") and trailing
   punctuation artifacts from the source's OCR (e.g. "82,000," / "1745,"). No actual
   numeric distortions.
4. Spot-verified every load-bearing figure by eye: £1000 loan-chain example (ch.0/p5),
   interest-rate progression 10%→6%→5%→4%→3% and land-price years'-purchase progression
   10–12 / 20 / 25 / 30 (ch.0/p10, p17), the four-and-twenty (24×) home-vs-foreign-trade
   turnover ratio (ch.1/p27), the 96,000 / 14,000 / 82,000 hogshead tobacco example
   (ch.1/p34), the Earl of Warwick's 30,000 daily diners and Cameron of Lochiel's
   £500/year rent and 800 men in the '45 (ch.5/p5, p8), the £10,000-a-year household
   example (ch.5/p11), and the Lucca→Venice silk-manufacture migration figures
   (1310, 900 families, 31 families, 300 workmen — ch.4/p19).

## Per-chapter verdict

| # | Source ch. | Title | Paragraphs | Verdict |
|---|---|---|---|---|
| 0 | 15 | Of Stock Lent at Interest | 18 | **Clean** — no defects |
| 1 | 16 | Of the Different Employments of Capitals | 39 | **Clean** — no defects |
| 2 | 17 | Of the Natural Progress of Opulence | 10 | **Clean** — no defects |
| 3 | 18 | Of the Discouragement of Agriculture... | 22 | **Clean** — no defects |
| 4 | 19 | Of the Rise and Progress of Cities and Towns... | 21 | **Clean** — no defects |
| 5 | 20 | How the Commerce of Towns Contributed... | 28 | **Clean** — no defects |

## Defects found and fixed

**None.** Every paragraph in this batch preserves Smith's argument structure, logical
steps, numerical examples, historical data, place names, and dates with full fidelity.
No dropped clauses, no meaning inversions, no compressed/summarized passages, no
numerical distortions were found anywhere in the batch.

## Non-defect observation (not fixed, out of scope)

Chapters 19 and 20 (array indices 4 and 5) carry a `title` field in the modern-en file
that differs from the source's generic `"Chapter 3"` / `"Chapter 4"` — the modern file
uses the book's actual historical chapter titles ("OF THE RISE AND PROGRESS OF CITIES
AND TOWNS..." / "HOW THE COMMERCE OF TOWNS CONTRIBUTED...") instead. This is a title
metadata inconsistency between the two files, not a content-fidelity defect in any
paragraph, and the task scope is paragraph content only — left untouched.

## Output

`wn-batchE-corrected.json` is byte-for-byte the same content as
`wn-batchE-current-modern-en.json` (re-serialized), since no paragraph required
correction. Paragraph counts per chapter were verified programmatically to match
`wn-batchE-source.json` exactly (18, 39, 10, 22, 21, 28).
