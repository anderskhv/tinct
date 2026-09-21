# Wealth of Nations — Batch G Content-Fidelity Review

**Scope:** `wn-batchG-current-modern-en.json` checked paragraph-by-paragraph against `wn-batchG-source.json` (LOCKED ground truth).

- Chapter 25 — "Of Bounties" (source title `OF BOUNTIES.`) — 97 paragraphs
- Chapter 26 — "Of Treaties of Commerce" (source title `OF TREATIES OF COMMERCE.`) — 33 paragraphs

Note: Chapter 26's source paragraphs 18–32 are Smith's digression on mint seignorage/coinage
(triggered by the preceding discussion of Portugal's gold exports), not a mismatch — the
modern-en text correctly follows the same digression.

## Method

1. Full manual paragraph-by-paragraph read of all 130 paragraphs, source vs. current modern-en,
   checking clauses, logical steps, examples, and every number/date/place name.
2. Automated word-count ratio check per paragraph (flag anything outside 0.55–1.6x length ratio)
   to catch compression/expansion — no paragraphs flagged.
3. Automated extraction and set-comparison of all numeric tokens per paragraph pair (prices,
   percentages, statute years/chapters, quantities, dates) — no real mismatches; the only
   deltas were trailing-period artifacts (`378347.` vs `378347`, `6.` vs `6`, `500000` vs
   `500000.`) from the regex, not actual content differences.
4. Paragraph-count parity verified programmatically for both chapters (97/97, 33/33).

## Verdict

**Chapter 25 (Of Bounties): PASS — no defects found.**
**Chapter 26 (Of Treaties of Commerce): PASS — no defects found.**

Every numerical figure was checked and confirmed correct, including:
- The corn-bounty tax-burden arithmetic in para 8 (5s./6d./4s./£6:4s./one-in-thirty-one).
- The herring-buss bounty statistics in paras 30–35 (378,347 barrels; 252,231¼ merchantable
  barrels; £155,463 11s total bounty; 8s 2¼d and 12s 3¾d per-barrel rates; salt-duty and
  salt-import figures; £113 15s / £159 7s 6d for the 1759 season; £500,000 joint-stock capital;
  £10,000 per chamber; 3 pounds per £100 for 14 years).
- All statute citations and their price thresholds throughout the corn-law digression (paras
  63, 74–76, 80, 89–95): Edward VI cap. 14, Charles II statutes (12th, 15th, 22nd), William and
  Mary 1st, William III 11th/12th c.20, and the 13th of the present king c.43, with all
  associated shilling thresholds (20s/24s/32s/40s/44s/48s/53s4d/£4) and duty amounts.
- The Portugal-trade gold figures in Chapter 26 (£50,000/week, £2,600,000/year) and the Methuen
  Treaty's three articles (translated verbatim, matching the source's legal wording and the
  one-third customs abatement on Portuguese wine vs. French wine).
- The seignorage/coinage arithmetic in paras 18–31 (£800,000 annual coinage; 2%/8% degradation
  figures; £46:14:6 mint price vs £47:14s–£48 market price; the French livre/denier/carat
  figures in para 20; the full seignorage-percentage worked examples in paras 21–26; £850,000
  average annual coinage and £21,250 annual loss; £14,000 parliamentary allowance).

No dropped clauses, no meaning inversions, no compressed/summarized passages, and no
factual/numerical distortions were found anywhere in either chapter. The modern-English
register (verb choices, sentence splitting, "shall"→"will," etc.) is consistently applied
without sacrificing any of Smith's argumentative steps or supporting data.

## Action taken

No corrections were required. `wn-batchG-corrected.json` is a byte-for-byte content copy of
`wn-batchG-current-modern-en.json` (same chapter-array shape, same paragraph counts: 97 for
ch. 25, 33 for ch. 26), produced and verified programmatically.
