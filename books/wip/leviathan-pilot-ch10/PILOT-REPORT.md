# Leviathan Batch 2 — edition ch10 (Hobbes ch9) Report

**Chapter:** edition chapter 10 / Hobbes's own Chapter 9, "Of the Severall
Subjects of Knowledge." Identity verified directly against the live files
before drafting (not assumed from array position): source title "Chapter 9.
Of the Severall Subjects of Knowledge," opening "There are of KNOWLEDGE two
kinds..."; 12 paragraphs confirmed matching between `-original-en.json` and
`-modern-en.json`. Selected as the batch's short/calibration chapter — the
shortest unrepaired chapter in the book by a wide margin (12 paragraphs,
372 words) — to confirm the hardened correction protocol doesn't add
unnecessary overhead to a small chapter (see
`books/wip/leviathan-batch2-selection.md`).

**Final file:** `leviathan-ch10-final.json`
```
sha256: 394b09485b8ef288af5409527d0fe050570e060ca6150f7d53b15500983ce445
source sha256: d3a73860c99b387326e20e20aae9c435af2525d879747d7fa9dce4c13982df5b
```

## Process (4 rounds)

1. **Round 0 — drafting.** Sonnet drafted against the locked source (already
   REAL-HEAVY classified, sim 0.460).
2. **Round 1 — full independent review.** Blind accessibility + Opus
   fidelity, all 12 paragraphs. Verdict: needs targeted fixes (title not
   modernized; a couple of glosses needed; one capitalization
   inconsistency).
3. **Round 2 — fixes + re-verification.** All round-1 items applied
   (title, P7/P8 wording, P6 gloss, P0 capitalization). Fresh full
   accessibility + fidelity re-check: ACCEPT AS-IS on fidelity, but
   accessibility found 6 more items — a stacked prepositional chain and a
   self-referential repeated-verb clause in paragraph 2, plus 4 items later
   assessed against source and found to be faithful reproductions of
   Hobbes's own numbering/phrasing inconsistencies (duplicate "a." outline
   labels, a "2)" numbering break, an inverted "qualities from liquid
   bodies" phrase, and the "body politic, or sovereign" apposition) — those
   4 were correctly **not** fixed, since "fixing" them would be exactly the
   silent source-correction the protocol forbids. Fidelity also flagged a
   non-blocking cross-chapter terminology gap (D5): ch18's already-accepted
   final keeps "institution" as the technical term for "commonwealth by
   institution vs. acquisition"; this chapter had drifted to "founding."
4. **Round 3 — fixes + re-verification, then a same-round follow-up
   fix.** Paragraph 2 rewritten to unpack the prepositional chain and drop
   the repeated verb. D5 resolved by glossing paragraph 10/11's
   institution/founding terminology to match ch18. A fresh round-3
   accessibility pass (still candidate-only, still blind) then flagged that
   the added gloss itself interrupted the "from X, to Y" clause — fixed in
   a same-round follow-up (`"the institution — that is, the founding —"` →
   `"the institution, or founding,"`, matching the paragraph's own existing
   "body politic, or sovereign" appositive pattern) — this edit landed
   *after* the round-3 fidelity check had already been dispatched against
   the prior wording, so it got its own dedicated gap-closure fidelity
   check (`fidelity-review-gap-idx10.md`), same pattern as ch24's D9 gap.
5. **Final — full non-sampled pass.** A full (not diff-based) fidelity
   read of all 12 paragraphs and a full accessibility read, both against
   the chapter's true final wording: fidelity **ACCEPT AS-IS**, accessibility
   **substantially accessible**.

## Final verdicts

- **Fidelity: ACCEPT AS-IS.** Full non-sampled read of all 12 paragraphs
  found zero defects: no content loss, no actor swaps, no dropped/altered
  negation, no invented claims, no silent historical/numbering corrections.
  All four of the source's own numbering/phrasing quirks are reproduced
  exactly, which the final reviewer flagged as positive evidence against
  silent regularization, not a defect.
- **Accessibility: substantially accessible.** Every genuinely fixable
  wording issue found across 3 rounds of independent review has been
  resolved. What's left is (a) unavoidable conceptual density inherent to
  a 17th-century taxonomy of the sciences, and (b) the documented,
  deliberately-preserved source quirks below.

## Deliberately preserved, not fixed (assessed against source each time)

- **Duplicate "a." outline labels** (paragraphs 6–7): source has "a."
  used twice consecutively at the same outline level. Mirrors Hobbes's own
  text exactly.
- **"2)" numbering break** (paragraph 8): source uses "2)" at exactly this
  spot while every other item uses a period-based scheme. Mirrors source.
- **Inverted "of the qualities from liquid bodies" phrase** (paragraph 8):
  source has this exact non-parallel preposition order (vs. paragraph 7's
  "from the qualities of..."), unlike every other item in the outline.
  Mirrors source.
- **"the rights and duties of the body politic, or sovereign" apposition**
  (paragraph 11): flagged as ambiguous by two independent accessibility
  reviewers (round 3 and final) — unclear whether "or" marks strict
  equivalence or two related concepts. This is a direct, unmodified copy of
  the source's own "Body Politique, or Soveraign." No independent fidelity
  basis exists for committing to one reading over the other without
  guessing at Hobbes's intent — exactly the risk that produced ch24's N1
  invented-gloss regression in a prior chapter. Left as rendered rather
  than resolved by assumption.

All four of the above were caught by a blind, candidate-only reviewer who
had no access to source and therefore correctly could not tell they were
source-faithful; each was independently checked against `source.json`
before the decision to leave it stood, and is recorded here rather than
silently dropped from consideration.

## Review coverage (exact)

| Round | What | File | Verdict |
|---|---|---|---|
| 1 | Accessibility + fidelity, blind, all 12 paragraphs | `accessibility-review-1.md`, `fidelity-review-1.md` | needs targeted fixes |
| 2 | Accessibility, blind, all 12 paragraphs | `accessibility-review-2.md` | needs targeted fixes |
| 2 | Fidelity, full non-sampled, all 12 paragraphs | `fidelity-review-2.md` | ACCEPT AS-IS (+ D5 non-blocking) |
| 3 | Accessibility, blind, all 12 paragraphs | `accessibility-review-3.md` | needs targeted fixes |
| 3 | Fidelity, targeted re-check of paragraphs 2/10/11 + neighbors | `fidelity-review-3.md` | ACCEPT AS-IS |
| 3.1 (gap) | Fidelity, targeted re-check of paragraph 10 (post-dispatch edit) | `fidelity-review-gap-idx10.md` | ACCEPT AS-IS |
| final | Fidelity, full non-sampled, all 12 paragraphs | `fidelity-review-final.md` | **ACCEPT AS-IS** |
| final | Accessibility, blind, all 12 paragraphs | `accessibility-review-final.md` | substantially accessible |

Every reviewer stated exact coverage in their own file; no reviewer sampled
a full chapter without saying so.

## Defect counts by stage

- **Introduced by drafting (round 0):** 1 blocking (unmodernized title), a
  handful of accessibility gloss gaps — all fixed round 1→2.
- **Introduced by revision (rounds 2–3):** 0 content-loss or actor-swap
  regressions (the hardened `safe_replace`/`validate_structure`/
  `diff_report` protocol was used for every edit this batch; no bare
  assignment was used at any point). One self-inflicted accessibility
  regression from a correction (the round-2 institution/founding gloss
  itself becoming an accessibility problem in round 3) — caught and fixed
  within the same round via the gap-closure pattern.
- **Inherited/pre-existing (present before this session touched the
  chapter):** none identified — this is a short chapter and round-1 review
  found only drafting-stage issues.

## Status

Nothing has been published. `leviathan-ch10-final.json` is a staged
candidate only, not copied into any live edition file. Verified final hash
(identical for `candidate-sonnet.json` and `leviathan-ch10-final.json`):
`394b09485b8ef288af5409527d0fe050570e060ca6150f7d53b15500983ce445`.
