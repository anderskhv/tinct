# Wealth of Nations — Batch F Independent Adversarial Review

**Scope:** Book IV, chapters 21–24 (164 paragraphs: 46 + 46 + 55 + 17), reviewed independently
against `wn-batchF-source.json`, without trusting the drafter's notes or diff claim.

## Step 1 — Diff verification

Programmatically diffed `wn-batchF-corrected.json` against `wn-batchF-current-modern-en.json`
paragraph-by-paragraph across all four chapters. Result: **exactly one paragraph differs** —
chapter 21 (source `number: 21`), paragraph index 10 — and the only textual change within that
paragraph is `"England's Treasure by Foreign Trade"` → `"England's Treasure in Foreign Trade"`.
No other paragraph, title, or chapter number differs anywhere in the file. The drafter's claim
that this is the only change made is confirmed.

## Step 2 — Paragraph-count verification

Counted paragraphs per chapter in both `wn-batchF-source.json` and `wn-batchF-corrected.json`:

| Chapter | Source title | Source count | Corrected count |
|---|---|---|---|
| 21 | Chapter 1 | 46 | 46 |
| 22 | Chapter 2 | 46 | 46 |
| 23 | Chapter 3 | 55 | 55 |
| 24 | Chapter 4 (source) / "OF DRAWBACKS." (modern-en) | 17 | 17 |

Total 164/164, matches exactly. (Note: chapter 24's `title` field differs between source,
"Chapter 4," and modern-en, "OF DRAWBACKS."/"Drawbacks." — this is a heading-label difference
present in the pre-existing `current-modern-en.json` baseline itself, not something introduced
by the corrected file, and is not a content-fidelity defect in the paragraph text.)

## Step 3 — Full independent close-read (all 164 paragraphs)

Read every paragraph in all four chapters side by side against source, chapter by chapter, with
particular attention to the areas flagged in the task: the Bank of Amsterdam digression (ch. 23
idx 13–36), Navigation Act provisions (ch. 22 idx 24–30), war-finance figures (ch. 21 idx 26–28),
and statutory citation dates (ch. 23 and ch. 24 throughout).

**Chapter 21** ("Of the Principle of the Commercial or Mercantile System"): Faithful throughout
except the already-fixed idx 10 book-title preposition. Verified war-expense figures
(£90,000,000 total, £75,000,000 new debt, "2s. in the pound" land tax, £18,000,000 circulating
coin, £30,000,000 exaggerated estimate, £19,000,000 for 1761, £6,000,000 Spain/Portugal bullion)
all carried through unchanged. Anecdotes (Plano Carpino/Tartars, Locke, Spartans/Lycurgus,
Mazepa/Cossacks, Merovingian kings, Dercyllidas on Persia) all intact with no dropped or invented
clauses, no inversions.

**Chapter 22** ("Restraints on Importing Foreign Goods That Can Be Produced at Home"): No
defects. The invisible-hand passage (idx 9) is rendered completely and accurately, with no
softening or inversion of "led by an invisible hand." Navigation Act's four numbered provisions
(idx 25–28) all faithfully preserved (three-fourths-mariners rule, double aliens duty, salt-fish
provision). Anglo-Dutch/French tariff dates (1667, 1671, 1672, 1678, 1697, 1700) all verified
against source. The 23,728-quarters / "five hundredth and seventy-first part" statistic (idx 20)
is preserved with correct numeric value (modern-en renders it as "one five-hundred-and-
seventy-first," mathematically identical to source's "five hundredth and seventy-first part").

**Chapter 23** ("Extraordinary Restraints... / Digression on Banks of Deposit, particularly the
Bank of Amsterdam"): No defects. This is the densest chapter numerically. Verified: 1692/1696
French-goods imposts and percentages (25%, second 25%, £25/ton wine duty, £15/ton vinegar duty);
1609 Bank of Amsterdam founding date and the 600-guilder bill threshold; the full bullion/coin
price table (idx 22–24: Mexico dollars 22, French crowns 22, English silver 22, new Mexico
dollars 21-10, ducatoons 3-0, rix-dollars 2-8, gold at 310/300/4-19-8, bar gold at 340) all
reproduced with correct figures; the 1672 French invasion of Amsterdam and the fire-scorched
coins anecdote; the "about 2,000 accountholders / £1,500 average / £3,000,000 sterling /
33,000,000 guilders" bank-treasure estimate; the 4%/5% agio-band resolution; the France
(24,000,000 inhabitants) vs. North American colonies (3,000,000) population comparison and the
"eight times more extensive… twenty-four times more advantageous" market-size claim; the 1775
footnote on the North American disturbances. All numbers and the logical structure of Smith's
argument (including the alehouse/sobriety digression, idx 45) are intact.

**Chapter 24** ("Of Drawbacks"): No defects. Statutory citations verified: 7 Geo. I, c. 21, s.
10 (idx 3); 15 Charles II, c. 7 and 4 Geo. III, c. 15, s. 12 (idx 10). Duty-history date list
(1667 old subsidy, 1692, 1745, 1763, 1778, 1779, 1780, 1781) intact (idx 9). Tobacco monopoly
figures (96,000 hogsheads imported vs. 14,000 home consumption) and the £3 10s. wine-duty figure
(idx 10) both correct.

## Additional targeted checks

- No negation/conditional inversions found (e.g., no "not" dropped or added that reverses a
  claim; no "if...then" flipped).
- No compressions that silently drop a clause of substantive content — modern-en paragraphs
  consistently carry the same propositional content as source, just modernized in diction and
  often split into more, shorter sentences.
- No other silent "correction" of a proper name, spelling, or citation to a more standard modern
  form was found. Names checked include: Mun, Locke, Plano Carpino, Genghis Khan (source's
  "Gengis Khan" is modernized to "Genghis Khan" in idx 2 — but this is a spelling modernization
  of a common name, not a misquoted title or citation, and was already present, unchanged, in
  the baseline `current-modern-en.json` before this pass; it was not introduced or altered by
  the drafter's corrected file and falls outside the drafter's single edit). Mazepa, Dercyllidas,
  Lowndes, Colbert, and place names (Koningsberg/Königsberg — also a pre-existing spelling
  normalization in the baseline, not touched by this pass) were all checked and are consistent
  between the two candidate files (current-modern-en and corrected); neither introduces a new
  discrepancy relative to the other beyond the single confirmed fix.

## Verdict

**ACCEPT AS-IS.**

The drafter's single fix (chapter 21, paragraph index 10: restoring "in" for "by" in the quoted
title "England's Treasure in Foreign Trade") is correct, precisely scoped, and is confirmed to
be the only difference between `wn-batchF-current-modern-en.json` and `wn-batchF-corrected.json`.
An independent, complete, non-sampled re-read of all 164 paragraphs across all four chapters
against the locked source found no additional defects of any of the specified categories
(dropped/invented clauses, negation/conditional inversions, compressed/summarized passages,
dropped numerical/historical data, factual/numerical distortions, or silent "correction" of a
source citation, name, or spelling). `wn-batchF-corrected.json` is ready to accept.
