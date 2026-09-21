# Wealth of Nations — Batch D Independent Adversarial Review

**Chapters:** 12–14 (source-numbered Book II, Chapters 1–3): "Of the Division
of Stock" (32 paragraphs), "Of Money, Considered as a Particular Branch of
the General Stock of the Society, or of the Expense of Maintaining the
National Capital" (108 paragraphs), "Of the Accumulation of Capital, or of
Productive and Unproductive Labour" (43 paragraphs). 183 paragraphs total.

**Reviewer:** Independent second-pass review. Does not take the drafter's
self-report (`wn-batchD-notes.md`) at face value.

**Files checked:** `wn-batchD-source.json`, `wn-batchD-current-modern-en.json`,
`wn-batchD-corrected.json`, `wn-batchD-notes.md`.

## Verdict: ACCEPT AS-IS

I read all 183 source/modern paragraph pairs in full and in sequence,
CH1 P0–P31, CH2 P0–P107, CH3 P0–P42, without skipping or sampling. I did not
find any content-fidelity defect (dropped/invented clause, negation or
conditional inversion, compressed/summarized passage, dropped numerical or
historical data, factual/numerical distortion, or silently "corrected"
source citation) that would block acceptance.

## Verification steps performed

1. **`corrected` vs `current-modern-en` byte identity.** `diff` on the two
   files returns no differences. Confirmed identical, consistent with the
   drafter's claim that no repairs were made because none were needed.

2. **Paragraph/chapter counts.** Source vs modern, per chapter:
   - Chapter 1 ("Of the Division of Stock"): 32 / 32 — match.
   - Chapter 2 ("Of Money..."): 108 / 108 — match.
   - Chapter 3 ("Of the Accumulation of Capital..."): 43 / 43 — match.
   Total 183 / 183 — match. (Note: in the modern file the `title` field for
   Chapter 3 holds the modernized chapter caption text instead of "Chapter 3"
   as it does for chapters 1–2 — a structural inconsistency in the data, not
   a content-fidelity defect; paragraph 0 in every chapter still carries the
   caption text in both source and modern files, as expected.)

3. **Full sequential paragraph-by-paragraph read**, checking specifically
   for: dropped/invented clauses, negation/conditional inversions,
   compression of arguments, dropped numerical/historical data, and
   factual/numerical distortion.

4. **Independent verification of every numerical/historical figure** in the
   dense Bank of England / Bank of Scotland passages (CH2 P41–P99), rather
   than trusting the notes file's summary:
   - Bank of Scotland est. 1695 (act of parliament); Royal Bank est. 1727
     (royal charter) — both preserved exactly (P41).
   - Silver recoined into the Bank of Scotland after the 1707 Union:
     £411,117:10:9 sterling — preserved exactly, including the shift from
     colon-separated to modern "10s. 9d." notation without changing the
     figures (P42).
   - New Scottish bank case study: £160,000 capital subscribed (2
     subscriptions), 80% paid up, £200,000 notes in circulation at
     stoppage, £600,000+ in London bills, £800,000+ total advanced, 5%
     interest on notes, 8%+ interest/commission paid on bills, >3% loss on
     >3/4 of dealings — every figure preserved exactly across P74 (a single
     dense paragraph with ~10 separate sums) (P74).
   - Bank of England charter: dated 27 July 1694; advanced £1,200,000 for
     an annuity of £100,000 (£96,000 interest at 8% + £4,000 management) —
     preserved exactly (P80).
   - 1697 ingraftment: £1,001,171:10s., bringing capital to £2,201,171:10s.;
     1696 tallies at 40/50/60% discount, bank notes at 20% discount,
     citation to "James Postlethwaite's History of the Public Revenue,
     p.301" preserved verbatim including the (real-world non-standard)
     spelling "Postlethwaite" — not silently corrected to "Postlethwayt"
     (P81).
   - 7 Anne c.7: £400,000 advanced, totaling £1,600,000 on the original
     £96,000+£4,000 annuity; 1708 borrowing at 6%; cancelled exchequer
     bills £1,775,027:17:10½d. at 6%; 1710 capital £4,402,343; total
     advanced £3,375,027:17:10½d. — preserved exactly (P82).
   - 1709 call of 15% → £656,204:1:9d.; 1710 call of 10% → £501,448:12:11d.;
     resulting capital £5,559,995:14:8d. — preserved exactly (P83).
   - 3 George I c.8: £2,000,000 exchequer bills cancelled, total advanced
     £5,375,027:17:10d.; 8 George I c.21: £4,000,000 South Sea stock
     purchased, 1722 capital increase £3,400,000; resulting totals
     £9,375,027:17:10½d. advanced vs. £8,959,995:14:8d. capital stock; 1746
     figures £11,686,800 advanced vs. £10,780,000 divided capital; 4 George
     III c.25: £110,000 charter renewal fee — every figure preserved
     exactly (P84).
   - Dividend history: 8% down to 3%, recently 5.5% — preserved exactly
     (P85).
   - 1763 emergency advance: about £1,600,000 in one week — preserved
     exactly, including Smith's own hedge ("I do not... pretend to warrant
     either the greatness of the sum, or the shortness of the time") (P86).
   - Coinage economics: bullion bought at £4/oz., issued at £3:17:10½/oz.,
     loss of 2.5–3% — preserved exactly (P54).
   - Drawing-and-redrawing economics: 5% legal interest, 0.5% minimum
     commission per draught repeated 6+ times/year, cost "something more
     than eight per cent." — preserved exactly, including the parallel
     footnote's separate arithmetic (3% Edinburgh–London exchange, 14%/year
     via the sight-bill method) (P68, P70).
   - £100,000 promissory-note example, £20,000 gold/silver reserve, £80,000
     spared from circulation, "fifth part" ratio — preserved exactly (P29).
   - £1,000,000 / £200,000 / £800,000 / £1,800,000 circulation-overflow
     example — preserved exactly (P30).
   - £40,000/£44,000/£4,000/£10,000/£11,000/£14,000 bank-circulation
     arithmetic example — preserved exactly (P52).
   - Pennsylvania colonial currency: 1722 first emission; 5s. sterling
     raised to 6s:3d. then 6s:8d.; >30% below £1 sterling — preserved
     exactly (P103).
   - £100/£130/£1,100 currency exchange-rate spread across colonies —
     preserved exactly (P101).
   - England war-debt figures: £145,000,000 debt from four French wars
     (1688, 1701, 1742, 1756) plus two rebellions (1715, 1745), total not
     less than £200,000,000 — preserved exactly (P35).
   All figures, dates, percentages, and named acts of parliament (7 Anne
   c.7; 3 George I c.8; 8 George I c.21; 4 George III c.25) check out
   digit-for-digit and word-for-word against source.

5. **Argument-structure and logic check** on every paragraph, watching in
   particular for the kind of silent inversion or compression that is easy
   to miss in Smith's long periodic sentences (e.g., the fixed/circulating
   capital definitions in CH1, the gross/net revenue distinctions in CH2,
   the productive/unproductive labour definitions in CH3, and the extended
   "drawing and redrawing" mechanism in CH2 P65–P79). All logical structure,
   conditionals, and causal claims are preserved with the same polarity and
   the same scope as the source.

## Notes on the drafter's self-report

The notes file's claim of 0 defects held up under independent re-verification.
I did not rely on its summary of which paragraphs were "dense" — I read
every paragraph in both chapters (not just the ones the notes called out)
and cross-checked the source independently.

## Cosmetic observations (not defects, no fix required)

- **Place-name spelling modernized in a few instances**, consistent with
  this edition's general modern-English mandate (most spelling elsewhere is
  otherwise left close to source, e.g. "waggon" is kept as-is): "Indostan"
  → "Hindustan" (CH1 P31); "Compeigne" → "Compiègne", "Fontainbleau" →
  "Fontainebleau", "Bourdeaux" → "Bordeaux" (×multiple), "Garronne" →
  "Garonne" (CH3 P12). This is the same pattern already flagged as
  cosmetic-only in the Batch H review ("Indostan"/"Hindustan" spelling
  inconsistency) and is not treated as a content-fidelity defect — no
  wording, meaning, or factual content is altered, only the transliteration
  of a place name to its standard modern spelling. Genuine source citations
  (e.g., "James Postlethwaite's History of the Public Revenue, p.301",
  "Mr Du Verney", "Mr Du Tot") are preserved verbatim, including Smith's
  own idiosyncratic/non-standard spellings, and were NOT silently
  "corrected." If a stricter policy is later adopted for place names too,
  these four instances are the ones to normalize back to source spelling.
- **Chapter 3 `title` field content differs in kind from Chapters 1–2**
  (see item 2 above) — a data-structure inconsistency worth flagging to
  engineering, not a content-fidelity issue.

## Conclusion

Batch D's modern-en edition is a faithful, high-fidelity rendering of the
source across all 183 paragraphs, including the numerically dense banking
history section. No fixes are required. Recommend: **ACCEPT AS-IS**.
