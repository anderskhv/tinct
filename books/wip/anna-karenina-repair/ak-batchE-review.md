# Anna Karenina — Batch E Independent Adversarial Review

Chapters 93–113 (Part 3 chs. 24–32; Part 4 chs. 1–12). Independent re-check of
the drafter's "0 defects found" claim in `ak-batchE-notes.md`, performed
without trusting that file's account.

## Verdict: ACCEPT AS-IS

No fidelity defects found. This confirms (does not merely repeat) the
drafter's PASS verdict, based on an independent full read of all 21 chapters,
paragraph by paragraph, against the Garnett source.

## What was checked

1. **File identity.** `ak-batchE-corrected.json` is byte-identical to
   `ak-batchE-current-modern-en.json` (verified via JSON-normalized diff,
   `sort_keys=True`). Confirmed.

2. **Paragraph counts.** Programmatically compared every one of the 21
   chapters' paragraph counts, source vs. modern-en. All 21 match exactly
   (5, 23, 18, 58, 34, 13, 24, 28, 33, 8, 10, 64, 35, 46, 28, 34, 44, 48, 40,
   15, 46 — total 606 paragraphs). No merges, splits, drops, or invented
   paragraphs anywhere in the batch.

3. **Full paragraph-by-paragraph read, all 606 paragraphs, all 21 chapters**
   (not spot-checked). Read every source/modern-en pair side by side for:
   dropped or invented clauses/sentences, negation or conditional inversions,
   compression/summarization, factual/plot/relationship distortions, and any
   other fidelity break. None found.

4. **Word-count ratio screen** (modern-en / source per paragraph) as a
   compression flag: only one paragraph in the entire batch fell under 0.75
   with source length >10 words (ch. 100 / Part 4... actually Part 3 ch. 31,
   p15: "His brother listened, but evidently he was not interested by it." →
   "His brother listened, but plainly wasn't interested."). Checked in context
   — this is a legitimately terse source sentence rendered proportionally
   tersely in modern English; not a content drop. No other outliers.

5. **Drafter-cited passages, verified directly against source, in full:**
   - **Karenin's cruelty toward Anna** (ch. 105 / Part 4 ch. 4, the
     portfolio-seizure scene): present and complete, including the violent
     detail of him gripping her arm "so violently that red marks were left
     from the bracelet he was squeezing" — carried through unsoftened, and
     his line "what is base is to forsake husband and child for a lover,
     while you eat your husband's bread" is intact.
   - **The divorce-lawyer scene** (ch. 106 / Part 4 ch. 5): read in full,
     all 46 paragraphs. Complete and faithful down to small business (the
     moth-catching, "we don't haggle over fees," the "Italian bookkeeping"
     exchange later in ch. 96). No softening of the transactional, faintly
     grotesque tone of the scene.
   - **Karenin's "I hate her" confession** (ch. 113 / Part 4 ch. 12, to
     Dolly): present and complete — "I am not a spiteful man, I have never
     hated anyone, but I hate her with my whole soul, and I cannot even
     forgive her, because I hate her too much for all the wrong she has
     done me!" renders with full force, "tones of hatred" → "notes of
     hatred" (a legitimate lexical modernization, not a softening). Also
     confirmed the adjacent "I even hate my son" line (ch. 113 p28) is
     intact.
   - **Nikolay Levin's decline** (ch. 100–101 / Part 3 ch. 31–32): the
     "skeleton covered with skin" description, the night-of-death-terror
     interior monologue, and the brother-to-brother quarrel and parting
     ("Anyway, don't remember evil against me, Kostya!") are all present and
     complete, unsoftened.

6. **General scan across the rest of the batch** (Levin's farming-reform
   arc chs. 93–99/101, Sviazhsky's dinner-table debates ch. 95–97, Vronsky's
   week with the foreign prince ch. 102, Anna's dream of the peasant
   ch. 103–104, Karenin's political defeat and the deputation ch. 107–109,
   the Oblonsky dinner party ch. 109–112): no dropped content, no meaning
   inversions, no compressed passages, no factual or relationship
   distortions found anywhere.

## Notes on the drafter's account

The drafter's notes (`ak-batchE-notes.md`) claim a PASS with zero defects
and cite the same four passage clusters checked above. On independent
re-check, those citations are accurate — the passages exist where claimed,
in this chapter range, and are rendered without softening. I found no
reason to distrust the notes' substantive claims, only that they should not
have been taken at face value without independent verification (which is
what this review provides).

## Conclusion

Batch E (chapters 93–113) is ready to ship as-is. No edits required.
