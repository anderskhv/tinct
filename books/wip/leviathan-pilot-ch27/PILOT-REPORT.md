# Leviathan Batch 2 — edition ch27 (Hobbes ch26) Report

**Chapter:** edition chapter 27 / Hobbes's own Chapter 26, "Of Civill
Lawes." Identity verified directly against the live files before drafting:
source title "Chapter 26. Of Civill Lawes," opening "By Civill Lawes, I
understand..."; 48 paragraphs confirmed matching between `-original-en.json`
and `-modern-en.json`. Selected as the batch's long/scale-test chapter —
substantial (48 paragraphs, 7,889 words) without being the book's extreme
outlier (ch42 is 138 paragraphs / 29,242 words and needs its own dedicated
multi-batch project). Drafted in 3 bounded packets of ~16 paragraphs each
with 1-2 paragraphs of cross-boundary context, per the "bounded packets,
don't enlarge batches to finish faster" instruction (see
`books/wip/leviathan-batch2-selection.md`).

**Final file:** `leviathan-ch27-final.json`
```
sha256: 81bc5757384809e4e28599eec1fcd7883d56b3220a0c14c85519fb61c14a7ba1
source sha256: f1618a6e742978aba56555d6b085ba2d48980a156d899552173a8b64a480529e
```

## Process (6 rounds)

1. **Round 0 — drafting.** Three independently-drafted packets (paragraphs
   0-15, 16-31, 32-47), assembled and validated as one 48-paragraph unit via
   `content_edit_helpers.validate_structure()`.
2. **Round 1 — full independent review.** Blind accessibility + Opus
   fidelity, all 48 paragraphs plus a whole-chapter re-read explicitly
   checking for packet-boundary (15/16, 31/32) terminology/continuity
   issues — found clean.
3. **Round 2 — fixes + re-verification.** Corrections applied to 7
   paragraphs (equity/Parlamentum/Rex In Parlamento glosses, a restored
   judicial sense, a modernized legal quotation, and two **inherited**
   blocking defects). Fidelity confirmed both inherited defects were
   present in the pre-existing `current-modern-en.json` before this
   session touched the chapter — not introduced by this batch's drafting
   or revision:
   - A logic-inversion at "the one who writes a commentary on them is not
     their interpreter" (the source denies commentators are interpreters;
     the inherited wording had it backwards).
   - A dropped-actor defect at "he shall procure ... that another be made
     judge" (the original judge's own action, needed for the argument
     about avoiding self-judgment as a witness).
4. **Round 3 — fixes + re-verification, including a caught-and-fixed
   process failure.** Applied 7 more accessibility items (unglossed legal
   terms, double negatives, an overloaded hypothetical). Fidelity found
   the paragraph-27 "tittle" gloss self-contradictory ("not one tittle —
   not the smallest stroke —" reads as denying tittle=smallest stroke) and
   found that a title-modernization fix claimed as done in the same round
   had **never actually landed**, due to a script bug (an unrelated
   assertion error aborted the fix script before the title-write block
   ran) — caught only because round-3's independent check re-verified the
   claim against the file instead of trusting the commit message. Both
   fixed.
5. **Round 4 — the largest single restructure.** A triple-negative,
   heavily-parenthetical sentence in paragraph 21 ("very few, perhaps none,
   who ... are not blinded") was split into two direct sentences. Verified
   with particular care that "almost everyone is blinded ... in at least
   some cases" preserves the exact scope of the source's near-universal
   double-negative quantifier, rather than silently upgrading it to an
   absolute claim. Also replaced "abrogate"/"abrogated" with "repeal"/
   "repealed" wherever it appeared unglossed alongside the plainer synonym
   already in use nearby (5 occurrences).
6. **Round 5-6 — closing residual accessibility items.** Two more rounds
   addressing narrower items: unglossed idioms ("ever so many, or ever so
   wise"), a recurring archaic subjunctive pattern ("that X be Y") checked
   against source and confirmed to be a literal rendering of Hobbes's own
   period grammar — modernized to indicative/modal phrasing since grammar
   modernization (unlike content) is squarely in scope. One genuinely
   ambiguous "namely" referent in paragraph 31 was resolved in the
   direction independently confirmed correct by checking it against the
   paragraph's own subsequent argument (the untrained Lords of Parliament
   and lay juries serving as judges — attaching "deep study of the laws"
   to the judge rather than the advocate would have inverted Hobbes's
   point). Accessibility review coverage narrowed from ~9 items (round 4)
   to ~9 (round 5, different items) to 2 explicitly-non-blocking items
   (round 6), a convergence pattern.
7. **Final — full non-sampled pass.** Fidelity: full read of all 48
   paragraphs, **ACCEPT AS-IS**, including explicit re-verification of four
   silent-correction spots inherited from before this session (title/
   tittle biblical allusion, a source typo, "Institutions"→"Institutes" of
   Justinian, and a reconstruction of a corrupt source clause). Accessibility:
   **substantially accessible** as of round 6.

## Final verdicts

- **Fidelity: ACCEPT AS-IS.** Full non-sampled read of all 48 paragraphs:
  no actor inversions, no dropped/reversed negations, no broken
  conditionals, no hedge distortions, no omissions, no invented content.
  The chapter's two highest-risk passages (the mutable/immutable-law
  concession in the precedent paragraph, and the full flight-and-forfeiture
  hypothetical with its embedded Coke quotation) both hold under full
  scrutiny.
- **Accessibility: substantially accessible.** What remains is unavoidable
  conceptual/structural density inherent to a 17th-century legal-
  philosophical treatise (nested legal distinctions, Roman-law taxonomy,
  the Abraham/Sinai divine-positive-law argument, multi-step conditional
  legal reasoning) plus two explicitly-flagged non-blocking cosmetic notes
  (an opaque Coke citation abbreviation, unglossed "Praetors"/"Aediles"
  already functionally explained in-sentence).

## Deliberately preserved / explicitly judged non-blocking, not fixed

- **Paragraph 31's "not only of the fact but of the right ... not only of
  the fact but also of the right" doubling.** Checked directly against
  `source.json` before deciding: Hobbes's own text has the identical
  restatement ("give Sentence, not onely of the Fact, but of the Right...
  that is to say, are Judges not onely of the Fact, but also of the
  Right"). Not a translation artifact — varying it would flatten an
  authorial gloss. Left unchanged across two independent flag-and-verify
  cycles (rounds 4-5).
- **Coke/Littleton citation abbreviation** ("lib.2, ch.6, fol.97.b"),
  paragraph 11: a genuine scholarly citation, not fixable by rewording
  without losing precision. Flagged by two reviewers, assessed as
  unavoidable both times.
- **"Lest we die"** inside the Exodus quotation, paragraph 43-44 region:
  a mild archaism inside a direct scripture quote, explicitly called
  "borderline, not a clear stumble" by its own reviewer.
- **"Judgments" vs. "judgement" spelling inconsistency**, paragraph 10:
  flagged as a cosmetic note only in the final pass; not worth reopening
  a pinned file for on its own.

## Review coverage (exact)

| Round | What | File | Verdict |
|---|---|---|---|
| 1 | Accessibility + fidelity, blind, all 48 paragraphs + boundary check | `accessibility-review-1.md`, `fidelity-review-1.md` | ACCEPT WITH FIXES REQUIRED |
| 2 | Fidelity, changed-passage re-check | `fidelity-review-2.md` | ACCEPT AS-IS |
| 3 | Accessibility, blind, all 48 paragraphs | `accessibility-review-2.md`, `-3.md` | needs targeted fixes |
| 3 | Fidelity, changed-passage re-check | `fidelity-review-3.md` | ACCEPT WITH FIXES REQUIRED (title never landed + tittle self-contradiction) |
| 4 | Accessibility, blind, all 48 paragraphs | `accessibility-review-4.md` | substantially accessible (6 items) |
| 4 | Fidelity, changed-passage re-check | `fidelity-review-4.md` | ACCEPT AS-IS |
| 5 | Accessibility, blind, all 48 paragraphs | `accessibility-review-5.md` | needs a small targeted pass (9 items) |
| 5 | Fidelity, changed-passage re-check | `fidelity-review-5.md` | ACCEPT AS-IS |
| 6 | Accessibility, blind, all 48 paragraphs | `accessibility-review-6.md` | substantially accessible |
| 6 | Fidelity, changed-passage re-check | `fidelity-review-6.md` | ACCEPT AS-IS |
| final | Fidelity, FULL non-sampled, all 48 paragraphs | `fidelity-review-final.md` | **ACCEPT AS-IS** |

Every reviewer stated exact coverage in their own file. No reviewer sampled
a full chapter without saying so.

## Defect counts by stage

- **Introduced by drafting (round 0):** 0 blocking. Packet-boundary
  continuity confirmed clean by round 1's explicit whole-chapter re-read.
- **Introduced by revision (rounds 2-6):** 1 blocking (round 3's
  self-contradictory "tittle" gloss, caught same-round). 1 process
  failure, not a content defect: round 3's title-modernization fix was
  claimed done but never applied due to a script bug — caught by round-3
  fidelity's practice of re-verifying claims against the file rather than
  trusting commit messages, fixed round 4.
- **Inherited/pre-existing** (present in `current-modern-en.json` before
  this session touched the chapter, surfaced by round-1/2 review but not
  introduced by this batch): 2 blocking — the commentary/interpreter
  logic-inversion and the dropped-actor defect in the letter-vs-intent
  paragraph. Both fixed round 2.

## Status

Nothing has been published. `leviathan-ch27-final.json` is a staged
candidate only, not copied into any live edition file. Verified final hash
(identical for `candidate-sonnet.json` and `leviathan-ch27-final.json`):
`81bc5757384809e4e28599eec1fcd7883d56b3220a0c14c85519fb61c14a7ba1`.
