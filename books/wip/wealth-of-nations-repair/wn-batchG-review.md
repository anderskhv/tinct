# Batch G Independent Adversarial Review — "The Wealth of Nations", Chapters 25–26

Reviewer: independent adversarial pass (not the drafting agent). Re-verified from scratch against `wn-batchG-source.json`, without relying on `wn-batchG-notes.md`'s self-report.

## 1. Corrected vs. current-modern-en

`diff wn-batchG-current-modern-en.json wn-batchG-corrected.json` → **byte-identical, no differences.** The drafter made zero edits, consistent with its "0 defects found" claim (though that claim still had to be independently verified, not trusted).

## 2. Paragraph counts

- Chapter 25 ("Of Bounties"): source = 97 paragraphs, modern-en = 97 paragraphs. Match.
- Chapter 26 ("Of Treaties of Commerce"): source = 33 paragraphs, modern-en = 33 paragraphs. Match.
- Total 130/130, confirmed by direct count, not by trusting the notes file.

Structural note (not a defect): the modern-en JSON's chapter title fields read "Chapter 5" / "OF TREATIES OF COMMERCE." while source paragraph[0] of each chapter carries the actual title text ("OF BOUNTIES." / "OF TREATIES OF COMMERCE."), which the modern-en edition modernizes to "Bounties" / "Treaties of Commerce" as paragraph[0] of its own array. This is the same title-modernization convention used elsewhere in this series and is not a content-fidelity defect.

## 3. Full side-by-side read (all 130 paragraphs, not sampled)

Read every paragraph pair in full. Specific high-risk items called out in the task were individually checked:

- **Herring-buss bounty statistics** (¶0.30–0.35): 378,347 barrels over 1771–1781, 252,231¼ merchantable-herring conversion (3:2 ratio), £155,463 11s total bounty, 8s 2¼d/12s 3¾d per barrel, the 1759 single-year figures (4 barrels of sea-sticks, £113 15s and £159 7s 6d per barrel), the £500,000 joint-stock company and 23 Geo. II c. 24 citation — all figures, ratios, and citation numbers preserved exactly. Only cosmetic notation changed (e.g., "£155,463:11s." → "£155,463 11s", colon-separated shillings/pence replaced with space-separated), which is a consistent house style across the batch, not a numerical distortion.
- **Corn-bounty tax arithmetic** (¶0.8): the 5s bounty / 6d–4s home-price-rise / 1:31 export-to-consumption ratio / £6 4s second-tax derivation all check out arithmetically and match source exactly (31 × 4s = £6 4s).
- **Methuen Treaty's three articles** (¶1.4–1.6): all three articles translated in full, no dropped clauses, no altered terms (the 1/3 duty reduction on Portuguese wine vs. French wine, the reciprocal woollens admission, the ratification clause). "ART." was spelled out as "ARTICLE" — a translation-style choice, not a content change.
- **Portugal gold-trade figures** (¶1.8, 1.13): £50,000/week, "probably exaggerated," £2,600,000/year extrapolation — preserved intact. "Mr Barretti" spelling preserved as in source (not silently corrected to "Baretti," the more standard modern spelling of Giuseppe Baretti) — this is the correct behavior per the project's fidelity mandate (source spelling preserved even where it may be a historical inaccuracy/typo).
- **Coinage/seignorage worked examples** (¶1.19–1.26): all five scenarios (0%, 2%, 5%, 1%, and standard-weight cases) preserved with correct arithmetic in every case — each nets to "exactly two per cent" loss or no loss, matching source logic precisely. The French seignorage example (740 livres 9 sous 1/11 denier mint price, 21¾/2¼ carat fine/alloy split, 671 livres 10 deniers value, 30 louis d'ors × 24 livres = 720 livres, 48 livres 19 sous 2 deniers difference) is reproduced with all figures intact, including the footnoted citation to "Dictionnaire des Monnoies, tom. ii. article Seigneurage, p. 439, par 81. Abbot de Bazinghen..." verbatim.

No dropped/invented clauses, no negation/conditional inversions, no compression/summarization, no dropped or altered numerical/historical data, and no silent "correction" of any source citation, name, or spelling were found anywhere in the 130 paragraphs. Legal citations (5th & 6th of Edward VI c. 14; 15th of Charles II c. 7; 22nd of Charles II c. 13; 12th of Charles II c. 4; 13th of the present king c. 43; 11th & 12th of William III c. 20; 1st of William and Mary) are all preserved with correct chapter/statute numbers matching source. The full duties table in ¶0.75 is reproduced character-for-character identical (not modernized at all, correctly, since it's tabular data).

## Verdict: **ACCEPT AS-IS**

The drafter's "0 defects" self-report is confirmed by independent re-verification. `wn-batchG-corrected.json` is identical to `wn-batchG-current-modern-en.json`, paragraph counts match source exactly (97 + 33 = 130), and a full non-sampled read against source found no fidelity defects of any kind, including in the numerically dense passages (herring bounty accounts, corn tax arithmetic, Methuen Treaty text, Portugal gold trade, and the seignorage worked examples).
