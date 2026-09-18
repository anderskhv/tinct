Model: sonnet (round two)

# Chapter 97 — French pass log (round two)

## Paragraph 14

**Before:** "Andrew!" said Princess Mary imploringly. "You must know that this is a woman," * Prince Andrew said to Pierre.

**After:** "Andrew!" said Princess Mary imploringly. "You must know that this is a woman," Prince Andrew said to Pierre (in French).

**Finding answered:** Batch 4 review, Finding #4 (MODERATE, ch97 p14, rules 2/(b)); also the sole `footnote-orphan-marker` flag from the batch 4 `edition_checks.py` run. p14 is an ordinary `french-kept`-shaped paragraph and needed the same treatment as p19/p46 in this chapter: stripped the stray `*` marker and added the `(in French)` cue after the speech attribution.

**Footnote re-pairing note (also required by the review):** Maude's ch97 carries two footnotes off p14 and p15. Source p14 ends `"Il faut que vous sachiez que c'est une femme," *` and source p15 is `"Andrew, au nom de Dieu!" *(2)`; the footnotes follow as source p16 = footnote 1 (p14's French) and source p17 = footnote 2 (p15's French). The file's slots are p16 ← `* Il faut que vous sachiez que c'est une femme.` (paired to p14) and p17 ← `* Andrew, au nom de Dieu!` (paired to p15) — this re-pairing was already correct in `ch97-french.json` (round one) and is unchanged here. Only p14's dialogue paragraph needed the marker/cue fix; p15, p16, and p17 were not touched in this round.
