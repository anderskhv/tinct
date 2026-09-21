# Independent Adversarial Review — Batch L (Chapter 32, "Of Public Debts")

## Verdict: ACCEPT AS-IS

No content-fidelity defects found after an independent full paragraph-by-paragraph
read of all 97 paragraphs against source, plus independent re-computation of every
cited figure. The original drafter's self-report is confirmed, not merely trusted.

## What was independently verified

**1. File identity.** `wn-batchL-corrected.json` is byte-identical to
`wn-batchL-current-modern-en.json` (`diff` returns no output). Confirmed.

**2. Paragraph count.** Source has exactly 97 paragraphs (index 0–96); modern-en
has exactly 97 paragraphs, 1:1 aligned. Confirmed programmatically.

**3. Full paragraph-by-paragraph read.** I read every one of the 97 paragraphs
side-by-side against source (not sampled). No dropped clauses, no invented
clauses, no negation/conditional inversions, no compressed passages, no dropped
numerical examples or historical data anywhere in the chapter. This includes the
dense numerical stretches (paras 15–24, 30, 42–50, the Pelham-administration
figures in para 45, the Ireland/America union revenue projection in para 80,
the Roman As-debasement passage in para 65) and the chapter's famous closing
paragraph (para 96, "This empire, however, has hitherto existed in imagination
only... a project of a gold mine...") which is present in full and undistorted.

**4. Word-count compression check (programmatic, independent of the drafter's
notes).** Computed word-count ratio (modern/source) for all 97 paragraphs.
Zero paragraphs fall below a 0.75 ratio floor for paragraphs of substantive
length (>15 words) — i.e., no paragraph shows the word-count signature of a
silently compressed/summarized rendering.

**5. Formatting-only claim, spot-checked and reconfirmed for every paragraph the
drafter flagged (paras 15, 16, 17, 18, 19, 20, 21, 22, 24, 30, 42, 43, 44, 45,
46).** Read each one directly: source's colon notation (e.g. `£5,160,459: 14: 9½`)
and modern-en's spelled-out shilling/pence notation (e.g. `£5,160,459 14s 9½d`)
carry identical numeric values in every instance — pounds, shillings, and pence
all match digit-for-digit. Para 34's word→digit rendering ("twenty-four hundred
millions" → "2,400 million"; "three hundred millions" → "300 million"; "thirty
millions" → "30 million"; "one hundred and twenty millions" → "120 million")
is likewise confirmed as a faithful numeral conversion with the eighth-part and
quarter-part relationships preserved in both versions.

**6. Independent re-derivation of the cross-check arithmetic cited in the
notes** (I did not take the notes' arithmetic on faith — recomputed from
scratch with exact fractional arithmetic):

- Paras 47–49 table: `£690,449:18:9 + £670,000:0:0 + £95,500:0:0`. Computed
  independently using exact £/s/d fractions: sum = `£1,455,949:18:9` exactly.
  Matches the "Total" row printed in both source (para 49) and modern-en
  (para 49) exactly, digit for digit.
- Para 65 Roman As-debasement ratios, recomputed independently:
  - First Punic War reduction (12oz → 2oz copper, a 1/6 factor): `£128,000,000 / 6
    = £21,333,333.333...` = `£21,333,333:6:8` exactly (0.333... £ = 6s 8d).
    Matches source and modern-en exactly.
  - Combined three-operation reduction (12oz → 0.5oz, a 1/24 factor):
    `£128,000,000 / 24 = £5,333,333.333...` = `£5,333,333:6:8` exactly. Matches
    source and modern-en exactly.
  Both figures are correct Roman-history arithmetic on Smith's own terms and are
  rendered identically (not altered) in modern-en.

**7. Historical/place-name spot-check.** Re-verified against the read: Treaty of
Ryswick 1697 (para 41), Treaty of Utrecht (para 43), Treaty of Aix-la-Chapelle
1748 (para 44), King William's recoinage (para 11), Henry IV of France's death
in 1610 (para 3), the Roman First/Second Punic Wars' As debasement sequence
12oz→2oz→1oz→½oz (para 65), Cape Finisterre (para 76), and the island list
Jamaica/Barbados/Antigua/St Christopher's/Grenada/Tobago/St Vincent's/Dominica
(para 90) — all present, correctly spelled, correctly dated, with no
substitutions, in both source and modern-en.

**8. Directional/meaning-inversion spot-check.** Re-confirmed: "Spain... been
still more enfeebled" (para 61) reads the same direction in both; "no
oppressive aristocracy has ever prevailed in the colonies" (para 94) is
preserved as a direct, unnegated statement in both; the multi-paragraph history
of the six "general mortgages" (paras 15–21) preserves the correct sequence and
direction of dates, amounts, and prolongation terms in both versions.

## Conclusion

This is the strongest possible test case for this kind of repair chapter —
maximally numerical, maximally consequential (book's final chapter) — and the
modern-en rendering holds up under an independent, from-scratch check that did
not defer to either the drafter's notes or the automated numeric-token diff.
No edits are required. Batch L is fit to publish as-is.
