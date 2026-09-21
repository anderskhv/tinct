# Wealth of Nations — Batch L (Chapter 32, "Of Public Debts") — Fidelity Repair Notes

## Verdict: PASS — no content-fidelity defects found

All 97 paragraphs of `wn-batchL-current-modern-en.json` were read against the
corresponding 97 paragraphs of `wn-batchL-source.json`, paragraph by
paragraph, in full (not skimmed/sampled). This chapter is the book's final
chapter and is extremely dense with numerical data (pound-shilling-pence
figures, dates, percentages, French livre figures, population estimates,
historical Roman coinage ratios). Given the stakes noted in the task
(the book's ending; numbers matter as much as anywhere), verification
included both:

1. A full manual paragraph-by-paragraph read comparing every clause,
   argument step, and numerical example between source and modern-en.
2. A programmatic numeric-token extraction/diff pass across all 97
   paragraphs to catch any silently altered figures.

## What was checked

- Dropped or invented clauses/sentences — none found. Every argument step
  present in the source (e.g. the multi-paragraph history of "general
  mortgages" 1–6 in paras 15–21, the Roman As-debasement arithmetic in
  para 65, the Pelham-administration debt figures in para 45, the Irish/
  American union revenue projection in para 80) is fully present in the
  modern-en version with no compression or omission.
- Meaning inversions/reversals — none found. Directional claims (e.g. "the
  reduction of the debt... went so slowly," "Spain... been still more
  enfeebled," "no oppressive aristocracy has ever prevailed in the
  colonies") all read the same direction in both versions.
- Numerical/factual distortions — none found. All pound-shilling-pence
  figures, percentages, dates, and place names were checked and match
  exactly. The apparent mismatches surfaced by the automated numeric-token
  diff (e.g. paras 15, 17-22, 24, 30, 42-46) are **formatting-only**: the
  source uses colon notation for money (`£5,160,459: 14: 9½`) while the
  modern-en rendering uses spelled-out shillings/pence (`£5,160,459 14s
  9½d`) — the underlying values are identical in every instance checked.
  Para 34's mismatch is the source spelling amounts in words ("twenty-four
  hundred millions," "three hundred millions") which the modern-en
  version renders as digits ("2,400 million," "300 million") — same
  values, same eighth-part/quarter-part relationships preserved.
  Table totals in paras 47-49 (£690,449:18:9 + £670,000:0:0 + £95,500:0:0
  = £1,455,949:18:9) were independently verified to sum correctly and
  match in both versions.
- Historical/place-name accuracy — spot-checked: Treaty of Ryswick 1697,
  Treaty of Utrecht, Treaty of Aix-la-Chapelle 1748, king William III's
  recoinage, Henry IV of France's death in 1610, the Roman First/Second
  Punic Wars' As debasement (12oz→2oz→1oz→½oz), Cape Finisterre, Jamaica/
  Barbados/Antigua/St Christopher's/Grenada/Tobago/St Vincent's/Dominica —
  all preserved correctly with no place-name substitutions or date shifts.

## Defects found and fixed

None. No edits were required.

## Files produced

- `wn-batchL-corrected.json` — identical in content to
  `wn-batchL-current-modern-en.json` (same 97-paragraph chapter array,
  same paragraph count as source, verified programmatically).
