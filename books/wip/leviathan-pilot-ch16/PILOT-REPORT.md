# Leviathan Batch 3 — edition ch16 (Hobbes ch15) Report

**Chapter:** edition chapter 16 / Hobbes's own Chapter 15, "Of Other Laws of
Nature." Identity verified directly against the live files before
drafting: source title "Chapter 15. Of Other Lawes of Nature," opening
"From that law of Nature, by which we are obliged to transferre to
another..."; 43 paragraphs confirmed matching between `-original-en.json`
and `-modern-en.json`. Selected as the batch's long/scale-test chapter —
substantial (43 paragraphs, 5,008 words) and a different rhetorical mode
than any prior chapter (a long enumerated list of numbered maxims with
worked examples, rather than continuous argument). Drafted in 3 bounded
packets of ~14-15 paragraphs each with cross-boundary context and a running
terminology list, per the "bounded packets" instruction (see
`books/wip/leviathan-batch3-selection.md`).

**Final file:** `leviathan-ch16-final.json`
```
sha256: 81049aadf46b3c513989d25d6e316bca7f2375930c885967e0926a3d8bcd7fc7
source sha256: bb2df2a26f2c37ce2e9a3c94e447f78a00717e42d14e800ce668228fe5c26cc3
```

## Process (3 rounds + a packaging fix)

1. **Round 0 — drafting.** Three independently-drafted packets (paragraphs
   0-14, 15-28, 29-42), each tracking a running terminology list
   (equity, complaisance, contumely, pleonexia, kleronomia, in foro
   interno/externo, commutative/distributive justice), assembled and
   re-read once for cross-packet consistency before validation.
2. **Round 1 — full independent review.** Blind accessibility (all 43
   paragraphs, explicitly asked to check numbered-maxim structure) + Opus
   fidelity (6 overlapping packets + explicit packet-boundary check at
   both seams). Three blocking fidelity defects found: a narrowed premise
   that made a sentence self-refuting ("by any way" → "by breaking one's
   word"), a referent flip that gutted the ninth law's argument ("them
   who distrust their owne wisdome" — the modest party doubting
   *themselves* — flipped to doubting the wise men instead), and a
   reversed causal connective. Accessibility flagged an inconsistent
   numbered-ordinal scheme (laws 3-9 explicitly numbered, then several
   unnumbered, then "the eighteenth law" resurfacing abruptly) — but
   fidelity's packet-boundary check independently confirmed this mirrors
   Hobbes's own inconsistent numbering exactly, so it was correctly
   **not** renumbered.
3. **Round 2 — fixes + re-verification.** All 3 blocking fixes applied,
   each checked against source before landing (the referent-flip fix in
   particular was flagged for maximum scrutiny, since it was the load-
   bearing argument for the ninth law of nature). Two accessibility fixes
   applied: completed an incomplete sentence ("...and so could not have
   wronged" — missing its object), and added inline glosses for
   "arithmetical proportion"/"geometrical proportion." Full independent
   re-verification: fidelity ACCEPT AS-IS. The reviewer also caught that
   this session's own dispatch prompt had transposed two paragraph-number
   labels — verified by content/diff regardless, no impact on the review.
4. **Final — full non-sampled pass.** Fidelity: full read of all 43
   paragraphs, **ACCEPT AS-IS**. Confirmed the numbering scheme's fidelity
   (all 8 numbered laws present with correct content at correct ordinals,
   all 9 unnumbered laws correctly left unnumbered, the eighteenth-law
   anomaly preserved without regularization) and found exactly 2 silent
   corrections, both repairing genuinely defective/elliptical source
   sentences at paragraphs 38-39 with the standard scholarly reading — not
   arbitrary edits, documented rather than silently made. Accessibility:
   full read, **substantially accessible**, with two minor sentence-level
   items the reviewer explicitly recommended not holding the chapter for.
   The final fidelity pass also caught a packaging gap: the candidate JSON
   was missing the `"section": "Part I — Of Man"` metadata key that
   `source.json` and `current-modern-en.json` both carry. Fixed by copying
   the field verbatim from source — a structural/metadata correction, not
   a translation edit, revalidated (43/43 paragraphs, no ratio outliers,
   no paragraph text touched).

## Final verdicts

- **Fidelity: ACCEPT AS-IS.** Every numbered law's actual
  prohibition/requirement verified against source (these are
  load-bearing definitional claims, not illustrative prose). No actor
  swaps, no dropped/altered negation, no invented content.
- **Accessibility: substantially accessible.** Two remaining minor items
  (one overloaded sentence, one triple-qualifier) explicitly judged
  taste-level, not comprehension-blocking.

## Deliberately preserved, not fixed

- **The "eighteenth law" numbering anomaly.** Source itself jumps from
  unnumbered laws straight to a bracketed "the eighteenth law" marginal
  heading with no signpost for the gap. Independently verified against
  source twice (round-1 fidelity, and again in the final pass) to be
  Hobbes's own inconsistent numbering, not a drafting or packet-assembly
  error. Left exactly as rendered.
- **Two remaining minor accessibility items** (paragraph with an
  overloaded nested aside; a triple-qualifier construction), both
  explicitly flagged by the final accessibility reviewer as not worth
  holding the chapter for another round.

## Review coverage (exact)

| Round | What | File | Verdict |
|---|---|---|---|
| 1 | Accessibility, blind, all 43 paragraphs + numbering check | `accessibility-review-1.md` | needs targeted fixes |
| 1 | Fidelity, 6 packets + explicit boundary check | `fidelity-review-1.md` | ACCEPT WITH FIXES REQUIRED (3 blocking) |
| 2 | Accessibility, blind, all 43 paragraphs | `accessibility-review-2.md` | substantially accessible |
| 2 | Fidelity, full re-check | `fidelity-review-2.md` | ACCEPT AS-IS |
| final | Fidelity, FULL non-sampled, all 43 paragraphs | `fidelity-review-final.md` | **ACCEPT AS-IS** |
| final | Accessibility, blind, all 43 paragraphs | `accessibility-review-final.md` | substantially accessible |

Every reviewer stated exact coverage in their own file.

## Defect counts by stage

- **Introduced by drafting (round 0):** 3 blocking (narrowed premise,
  referent flip, reversed connective) — none from packet-boundary
  assembly; the explicit boundary check at both seams (paragraphs 14/15,
  28/29) found no terminology drift or continuity break.
- **Introduced by revision:** 0 content-loss regressions.
- **Inherited/pre-existing:** none — no prior modern-en repair history for
  this chapter before this session.
- **Packaging/metadata (not a translation defect):** 1 — a missing
  top-level `section` key, caught by the final fidelity pass and fixed.

## Status

Nothing has been published. `leviathan-ch16-final.json` is a staged
candidate only, not copied into any live edition file. Verified final hash
(identical for `candidate-sonnet.json` and `leviathan-ch16-final.json`):
`81049aadf46b3c513989d25d6e316bca7f2375930c885967e0926a3d8bcd7fc7`.
