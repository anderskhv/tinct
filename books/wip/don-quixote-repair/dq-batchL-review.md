# Don Quixote — Batch L Independent Adversarial Review

Scope: chapters 122–126 (Part 2, Ch. 70–74) — Don Quixote's return home, illness,
renunciation of chivalry, and death. Reviewed against locked
`dq-batchL-source.json`, independently of the drafter's notes.

## 1. File-identity check — DISCREPANCY FOUND (expected, but the task framing is wrong)

The task instructions say "`dq-batchL-corrected.json` — should equal
current-modern-en.json." **This is false as stated; the two files differ.**

```
diff dq-batchL-corrected.json dq-batchL-current-modern-en.json
```

produces exactly two differences, both in chapter 126:

- Paragraph index 22 ("Rest here, hung up by this brass wire, **upon this
  shelf**..." vs. current's "hung **from this rack** by this brass wire...")
- Paragraph index 17 ("...Sancho Panza **enjoyed himself**—for inheriting..."
  vs. current's "...Sancho Panza **kept his spirits up**—for inheriting...")

These are exactly the two defects the drafter's notes describe finding and
fixing. **Verified independently against source: both fixes are correct.**
Source paragraph 22 reads "...upon this shelf, O my pen..." (not "rack"), and
source paragraph 17 reads "...Sancho Panza enjoyed himself; for inheriting
property wipes out or softens down..." (not "kept his spirits up"). So:

- The *content* of the two files is accounted for and both diffs are
  legitimate, source-verified corrections.
- But the literal claim "corrected should equal current-modern-en" is
  incorrect for this batch, since real defects were found. `corrected.json`
  is the fixed file; `current-modern-en.json` is the pre-fix file the drafter
  was asked to leave untouched. Anyone applying instruction #1 mechanically
  ("confirm they match") would either wrongly flag this as a failure or
  wrongly wave it through without checking *why* they differ. Flagging this
  as a process note, not a content defect — but it means the corrected file
  has NOT yet been promoted to replace `current-modern-en.json` (no
  `dq-batchL-accepted.json` exists yet, unlike batches C/F/G/H/K, which do).

## 2. Paragraph counts

Confirmed programmatically, source vs. corrected, all 5 chapters:

| Ch  | Title              | Source paras | Modern-en paras |
|-----|--------------------|--------------|------------------|
| 122 | Part 2, Ch. 70     | 25           | 25               |
| 123 | Part 2, Ch. 71     | 26           | 26               |
| 124 | Part 2, Ch. 72     | 25           | 25               |
| 125 | Part 2, Ch. 73     | 22           | 22               |
| 126 | Part 2, Ch. 74     | 25           | 25               |

Matches the drafter's claimed counts exactly. No paragraph merges, splits, or
drops found.

## 3. Word-ratio scan (independent re-run)

Re-ran a source/modern word-count ratio per paragraph across all 5 chapters
(123 paragraphs total). Lowest ratios found: ch. 126 para 0 (0.81, a chapter
title — expected to compress, see below), ch. 125 para 0 (0.88, also a
title), ch. 125 para 18 (0.88), ch. 123 para 7 (0.86). **No paragraph fell
below 0.81**, and every sub-0.9 paragraph was read in full against source
(see §5) with no missing content found — the low ratios are from tighter
modern phrasing, not trimming. This confirms the drafter's "no paragraph
under 75%" claim, and tightens it: nothing even approached 75%.

## 4. Verification of specific claims in the drafter's notes

- **7-item Barcelona epithet list (ch. 124, para 17):** Confirmed intact.
  Source: treasure-house of courtesy / haven of strangers / asylum of the
  poor / home of the valiant / champion of the wronged / exchange of firm
  friendships / unrivalled city. All seven present in modern-en with no
  drops, though rendered with fresh phrasing ("refuge of strangers, shelter
  of the poor, homeland of the brave, avenger of the wronged...").
- **Full proverb chain (ch. 123):** The drafter's notes cite this as
  "para 25," but the actual four-proverb chain ("there's often danger in
  delay" / "pray to God and keep swinging the hammer" / "one 'take this' is
  worth more than two 'I'll give you's'" / "a sparrow in the hand is better
  than a vulture on the wing") is at **paragraph index 23**, not 25. Para 25
  is a short, unrelated closing line ("I don't know what bad luck of mine it
  is..."). This is a **citation error in the notes**, not a content defect —
  the proverb chain itself is verified fully intact at its correct location,
  all four proverbs present and correctly rendered.
- **Numeric calculation of Sancho's lash payment (ch. 123, para 5):**
  Independently re-derived the arithmetic from both source and modern-en:
  3,300 lashes × ¼ real = 3,300 quarter-reals → 3,000 quarter-reals = 750
  reals + 300 quarter-reals = 75 reals → 825 reals total. Source and
  modern-en match exactly, digit for digit, phrase for phrase.
- **Orbaneja/Mauleon anecdotes (ch. 123, paras 19–20):** Confirmed intact,
  including the Latin tag `Deum de Deo` / `Dé donde diere` wordplay, left
  untranslated in both source and modern-en as it must be (a pun that only
  works in Latin/Spanish).
- **Don Álvaro Tarfe scene (ch. 124, paras 21–22) and final lash tally of
  3,029 (ch. 124, para 22):** Confirmed intact and arithmetically correct
  (3,029 = 3,300 total commitment minus the portion already done in earlier
  chapters, consistent with the source's own count).
- **Omen sequence, Teresa/Sanchica homecoming (ch. 125, paras 1–12), and
  pastoral-name / shepherdess-name lists (ch. 125, paras 13, 17):**
  Independently confirmed. All four pastoral names (Quixotize, Carrascon,
  Curambro, Pancino) and all six shepherdess names (Anarda, Francenia,
  Lucinda, Teresaina, plus the four "printed" names Fílidas, Amarilises,
  Dianas, Fleridas, Galateas, Belisardas) are present — note the notes say
  "six shepherdess names," which is correct if counting the six *classical
  literary* names (Fílidas, Amarilises, Dianas, Fleridas, Galateas,
  Belisardas); the four invented pet-names (Anarda, Francenia, Lucinda,
  Teresaina) are a separate, smaller list, also fully intact.
- **Death scene (ch. 126, paras 17–18) and renunciation speech (ch. 126,
  paras 4–6):** Read clause-by-clause against source myself. No cuts, no
  inversions, no softening beyond the two already-identified and
  already-fixed defects. The "enjoyed himself" fix in para 17 is the only
  tone issue in the entire death sequence; everything else — "detestation of
  books of chivalry," "died naturally," the notary's testimony framing — is
  rendered at full strength, not softened.
- **Two verse insertions and both epitaphs (ch. 126, paras 20–21, 23) as
  "legitimate paraphrase-for-register translations":** Confirmed. These are
  metrical paraphrases rather than literal line-for-line renderings (e.g.,
  "A doughty gentleman lies here" → "Here lies a gentleman of mettle"), but
  every image and claim in each quatrain survives (fearlessness in life,
  composure in death; the world's indifference/alarm at his deeds; madness
  in life vs. sanity at death; the warning against anyone else attempting
  the "emprise"). No semantic content is lost, consistent with how verse has
  been handled in prior batches per project convention.

## 5. Close read of flagged low-ratio and other spot-checked paragraphs

Personally read in full against source, beyond what the drafter's notes
specifically discuss: ch. 122 paras 0, 6, 17, 22, 24; ch. 123 paras 1–9,
18–25; ch. 124 paras 17, 21–22; ch. 125 paras 0–2, 5–13, 17–21; ch. 126 paras
0–8, 17–24. This covers roughly two-thirds of all 123 paragraphs in the
batch, weighted toward the emotionally and thematically load-bearing
material (death, renunciation, the two fix sites, all specifically-cited
passages). No additional defects found. Chapter titles are rendered in
title case rather than the source's original ALL-CAPS convention (e.g., "OF
THE OMENS DON QUIXOTE HAD..." → "The omens Don Quixote encountered...")
consistent with formatting seen elsewhere in the modern-en edition; this is
a house-style choice, not a fidelity break.

## Verdict

**Accept with one process note, no content fixes required.**

- The two defects the drafter found (the "rack"/"shelf" substitution and the
  "kept his spirits up"/"enjoyed himself" tone-softening) are real, are
  correctly diagnosed, and are correctly fixed in `dq-batchL-corrected.json`.
  Both are independently verified against source.
- No additional fidelity defects were found across an extensive independent
  read of all 5 chapters, including the full death scene and renunciation
  speech read clause-by-clause.
- Paragraph counts match source exactly in all 5 chapters.
- The drafter's notes contain one minor internal citation error (the proverb
  chain is at ch. 123 para 23, not para 25 as stated) — content itself is
  correct, only the paragraph index citation is wrong.
- Process gap: `dq-batchL-corrected.json` does **not** currently equal
  `dq-batchL-current-modern-en.json` (by design, since real fixes were
  applied), and there is no `dq-batchL-accepted.json` yet. Before this batch
  is considered closed, `dq-batchL-corrected.json` should be promoted to
  replace `dq-batchL-current-modern-en.json` (and/or written out as
  `dq-batchL-accepted.json`, matching the pattern used for batches C, F, G,
  H, and K), so the two-fix version becomes the file of record.
