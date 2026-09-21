# Wealth of Nations — Batch B (Chapter 10) Fidelity Review

**Verdict: PASS — no content-fidelity defects found.**

Chapter 10, "Of Wages and Profit in the Different Employments of Labour and
Stock," 119 paragraphs. Every paragraph in `wn-batchB-current-modern-en.json`
was read side-by-side against the corresponding paragraph in
`wn-batchB-source.json`, in full, from paragraph 0 through paragraph 118.

## Method

1. Full side-by-side read of all 119 paragraphs (source vs. current
   modern-en), checking for dropped/invented clauses, meaning inversions,
   compression of the enumerated "five circumstances" argument, dropped
   numerical examples, and factual/numerical distortions (wages, prices,
   dates, statute citations, place names, proper names).
2. Programmatic paragraph-count check: both files have exactly 119
   paragraphs in chapter 10 (number/title also match: "10" /
   "Chapter 10").
3. Programmatic length-ratio scan (flag any paragraph where modern-en length
   is <75% or >130% of source length, as a proxy for compression/expansion).
   Only one paragraph flagged (index 23), which is a one-sentence topic
   header ("Fifthly, the wages of labour in different employments vary
   according to the probability or improbability of success in them.") that
   is simply shorter in modern phrasing — not a compression of content.
4. Programmatic numeric-literal scan (digit sequences) comparing source vs.
   current across all paragraphs — only formatting difference found was
   "3335" vs "3,335" (comma-grouping) in paragraph 94, not a value change.
5. Programmatic scan of spelled-out number words (one..hundred, thousand,
   dozen) per paragraph — all discrepancies traced to pronoun use of "one"
   ("someone," "no one," "each one") or synonymous phrasing ("three times"
   vs. "triple," "seven-pence" vs. "sevenpence"), not numeric distortions.
6. Programmatic negation-density scan (not/never/no/none/cannot/nor/without)
   to catch possible meaning inversions — the handful of paragraphs with a
   count delta of 2+ (64, 69, 85, 110) were manually re-checked; in each
   case the difference was because the modern rendering used equivalent
   constructions the regex doesn't catch as negations (e.g., "has no
   tendency" → "do[es] nothing to," a double negative "cannot ... but by"
   → "can ... only by," "not being sufficient" → "insufficient"). Meaning
   was preserved intact in every case.

## Specific checks on data-dense passages

Given Smith's argument here rests on enumerated lists and precise figures,
the following numerically dense paragraphs were checked value-by-value
against the source and confirmed correct:

- Para 15 (mason/bricklayer vs. common-labourer wage ratios: 4–5s → 7–8s;
  6s → 9–10s; 9–10s → 15–18s).
- Para 18 (collier vs. coal-heaver wages: double/triple common labour;
  coal-heavers 6–10 shillings/day; six shillings ≈ 4x common labour).
- Para 33 (sailor wages: London vs. Edinburgh/Leith differential; guinea to
  27 shillings/month merchant service; common labourer 9–10s/week ≈
  40–45s/month).
- Para 52–54 (cottar/Shetland-stocking economics: 2 pecks oatmeal/week ≈
  16d; Shetland stockings 5d–7d/pair imported to Leith; Lerwick 10d/day
  common labour; worsted stockings from a guinea/pair; spinner 20d/week).
- Para 62 (Sheffield 1 apprentice/cutler; Norfolk/Norwich 2
  apprentices/weaver, £5/month forfeit; hatters 2 apprentices, £5/month
  forfeit split king/informer).
- Para 89 (curate pay history: 5 merks ≈ £10; master mason 4d/day ≈ 1
  shilling present money; journeyman mason 3d/day ≈ 9d present money;
  Statute of Labourers 25 Ed. III; Queen Anne c.12 stipend range £20–£50;
  present curate pay ~£40/year, some curacies <£20; London shoemakers
  £40/year).
- Para 94 (Isocrates fee economics: 4 minae = £13:6:8; 5 minae = £16:13:4;
  10 minae = £33:6:8; 100 scholars; 1,000 minae = £3,335:6:8 didactron).
- Para 111–113 (William III certificate statute citations: 8th & 9th Will.
  III; Queen Anne 12th, stat. 1, c.18).
- Para 117–118 (8th George III tailors' wage cap 2s 7½d/day; 31st George II
  assize of bread; 3rd George III remedy).

All figures, statute citations, dates, and place names match the source
exactly (accounting only for spelled-out vs. numeral formatting, which is a
legitimate modernization choice, e.g. "5th of Elizabeth" → "fifth year of
Elizabeth," "43d of Elizabeth, c. 2" → "forty-third year of Elizabeth,
chapter 2").

## Conclusion

No dropped clauses, no invented content, no meaning inversions, no
compressed/summarized passages, and no numerical or factual distortions
were found anywhere in the 119 paragraphs of this chapter. The existing
modern-English rendering already carries full content fidelity to the
source alongside its modernized register.

`wn-batchB-corrected.json` is therefore identical to
`wn-batchB-current-modern-en.json` (same 119-paragraph, single-chapter
array shape; chapter number 10 verified programmatically to match the
source's paragraph count).
