# Leviathan Batch 3 — edition ch2 (Hobbes ch1) Report

**Chapter:** edition chapter 2 / Hobbes's own Chapter 1, "Of Sense." Identity
verified directly against the live files before drafting: source title
"Chapter 1. Of Sense," opening "Concerning the Thoughts of man..."; 5
paragraphs confirmed matching between `-original-en.json` and
`-modern-en.json`. Selected as the batch's short/calibration chapter — the
second-shortest unrepaired chapter in the book, and the first substantive
chapter after the Introduction (see `books/wip/leviathan-batch3-selection.md`).

**Final file:** `leviathan-ch2-final.json`
```
sha256: 46c4171f315c7f4fda1533b5ea27eac31f1389fac1d90cb716046aa338b1f663
source sha256: 9c6c70f60025e64a756f139ce795e5526616f9d6e674a9d43cad2b90e88b658f
```

## Process (2 rounds)

1. **Round 0 — drafting.** Sonnet drafted against the locked source
   (REAL-classified, sim 0.569).
2. **Round 1 — full independent review.** Blind accessibility + Opus
   fidelity, all 5 paragraphs. Two blocking fidelity defects found, both in
   the long sense-mechanism paragraph: a dropped identity claim ("produce
   their effects on us" for source's "produce the same," breaking the
   analogy the whole mechanistic argument rests on) and an unlicensed
   "mental image" gloss on *Fancy* that would have narrowed a term the
   same sentence-chain immediately applies to odor, savour, heat, and
   hardness — none of which are images.
3. **Round 2 — fixes + re-verification.** Both blocking fixes applied,
   plus accessibility fixes (an ambiguous pronoun, two sentence splits, a
   register-softened metaphor). One round-1 non-blocking note ("lenses"
   silently dropping the mirror sense of source's actual word "glasses")
   was also resolved — checked against source directly, confirmed the
   source word is "glasses," and restored it with a "mirrors and lenses"
   gloss rather than either the narrow modern mistranslation or a bare
   "glasses" (which would misread as spectacles). Full independent
   re-verification found both blocking items closed and no new defects;
   verdict ACCEPT AS-IS with two non-blocking micro-fix suggestions the
   reviewer explicitly said were not worth reopening the file for.
4. **Final — full non-sampled pass.** Fidelity: full read of all 5
   paragraphs, **ACCEPT AS-IS**. Accessibility: full read, **substantially
   accessible**, with two marginal, self-resolving items the reviewer
   explicitly said were not worth holding the chapter for.

## Final verdicts

- **Fidelity: ACCEPT AS-IS.** No actor swaps, no negation drops/inversions,
  no causal inversions, no omissions, no silent corrections. Both
  round-1 blocking defects fully closed and independently re-verified
  twice more (round 2, then the final full pass).
- **Accessibility: substantially accessible.** All genuinely fixable
  wording issues resolved. What remains (two marginal, self-resolving
  pronoun/word-choice notes in paragraph 3, and the intentional Scholastic
  "Being Seen" jargon parody in paragraph 4) is explicitly non-blocking.

## Deliberately preserved, not fixed

- **"Audible Being Seen" / "Intelligible Being Seen"** (paragraph 4):
  Hobbes's own intentional parody of the confused Scholastic vocabulary he
  is arguing against — "Being Seen" applied to hearing and to
  understanding is meant to sound absurd, setting up the paragraph's
  closing jab at "speech that means nothing." Independently confirmed by
  every round's fidelity reviewer as correctly reproduced, not tidied.
- **Two round-2 non-blocking notes never taken**, explicitly flagged as
  optional and not worth reopening the file for: paragraph 2's "produced
  by the organs" (source: "begotten upon," a mild causal-direction
  softening) and paragraph 5's "to disparage" (source: closer to "as
  disapproving of").

## Review coverage (exact)

| Round | What | File | Verdict |
|---|---|---|---|
| 1 | Accessibility + fidelity, blind, all 5 paragraphs | `accessibility-review-1.md`, `fidelity-review-1.md` | ACCEPT WITH FIXES REQUIRED |
| 2 | Fidelity, full clause-by-clause re-check of the changed paragraph | `fidelity-review-2.md` | ACCEPT AS-IS |
| 2 | Accessibility, blind, all 5 paragraphs | `accessibility-review-2.md` | substantially accessible |
| final | Fidelity, FULL non-sampled, all 5 paragraphs | `fidelity-review-final.md` | **ACCEPT AS-IS** |
| final | Accessibility, blind, all 5 paragraphs | `accessibility-review-final.md` | substantially accessible |

## Defect counts by stage

- **Introduced by drafting (round 0):** 2 blocking (dropped identity claim,
  unlicensed narrowing gloss), both in paragraph 4.
- **Introduced by revision:** 0. Every round-2 edit was independently
  verified faithful; the only undeclared change (an incidental "but" →
  "though" swap alongside a declared edit) was checked and found to be an
  improvement, not a regression.
- **Inherited/pre-existing:** none identified — this chapter had no prior
  modern-en repair history before this session.

## Status

Nothing has been published. `leviathan-ch2-final.json` is a staged
candidate only, not copied into any live edition file. Verified final hash
(identical for `candidate-sonnet.json` and `leviathan-ch2-final.json`):
`46c4171f315c7f4fda1533b5ea27eac31f1389fac1d90cb716046aa338b1f663`.
