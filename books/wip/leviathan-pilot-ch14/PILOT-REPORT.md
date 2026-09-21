# Leviathan Batch 2 — edition ch14 (Hobbes ch13) Report

**Chapter:** edition chapter 14 / Hobbes's own Chapter 13, "Of the Naturall
Condition of Mankind, as Concerning Their Felicity, and Misery" — his most
famous chapter, containing the "solitary, poor, nasty, brutish, and short"
line and the "war of every man against every man" argument. Identity
verified directly against the live files before drafting: source title
"Chapter 13. Of the Naturall Condition of Mankind, as Concerning Their
Felicity, and Misery," opening "Nature hath made men so equall..."; 14
paragraphs confirmed matching between `-original-en.json` and
`-modern-en.json`. Selected as the batch's "different difficulty" chapter —
a different argumentative mode than ch18/24/40/10/27 (psychological/
empirical premises about human nature rather than definitional or legal-
taxonomic content), and a genuine test case for the citation-transparency
requirement via its "savage people in many places of America" passage (see
`books/wip/leviathan-batch2-selection.md`).

**Final file:** `leviathan-ch14-final.json`
```
sha256: 0bf1de2f5e2b9097cb36cbc99776582df5ff01a19787446811b6a737291cda82
source sha256: 5f6920eb8bcd8cce030505927cb3eacd52dc9771b284f206854830d69c922be5
```

## Process (6 rounds + 2 gap closures)

1. **Round 0 — drafting.** Sonnet drafted against the locked source
   (REAL-classified, sim 0.614).
2. **Round 1 — full independent review.** Blind accessibility + Opus
   fidelity, all 14 paragraphs. One blocking fidelity defect found: a
   meaning-inversion at paragraph 3 ("for as long as he sees" instead of
   "until he sees," which flips the terminal condition on the anticipation/
   self-defense argument).
3. **Round 2 — fixes + re-verification.** Blocking fix applied plus several
   accessibility/gloss items. A candidate "natural lust" gloss ("that is,
   instinctive desire, not romance") was independently confirmed by the
   round-2 Opus fidelity reviewer to be licensed by the source's own
   hedging asymmetry (the "peradventure"/"I believe" hedge before the
   America sentence vs. its own flat, unhedged assertion) — the America
   passage itself was deliberately left unsoftened.
4. **Round 3 — fixes + re-verification.** Fidelity found the "natural
   lust... not romance" gloss to be a **blocking regression**: the "not
   romance" exclusion was an unlicensed claim the source never makes.
   Fixed to an exclusion-free "that is, natural appetite." Also applied ~10
   archaic-syntax accessibility fixes across the chapter. The restructure
   of paragraph 10 (the America paragraph) introduced two small mechanical
   defects (a stray comma, a dangling "and live") — caught by round-3
   fidelity, fixed same-round.
5. **Round 4 — one mechanical fidelity fix + more accessibility.** "no
   commodious building" had been modernized to "no convenient building,"
   which collided with this rendering's own use of "convenient" for the
   source's actual word "convenient" elsewhere in the chapter (and drifted
   from "commodious"'s comfort/spaciousness sense) — fixed to "comfortable
   building," matching paragraph 13's already-correct treatment of the
   same source word.
6. **Round 5 — the highest-risk edit of the batch.** Paragraph 3's most
   overloaded sentence was split into two, with its actors named explicitly
   ("these men" for the aggressors, "others" for the modest-bounds
   moderates) to resolve a genuine pronoun-antecedent ambiguity. This was
   flagged for maximum fidelity scrutiny given the risk of accidentally
   swapping which group the "cannot survive on defense alone" claim
   attaches to — verified correct on all five checks (correct antecedents,
   survival clause still on the moderates, causal/conditional logic
   intact, and the "must also increase their own power" language checked
   against overstatement — licensed because Hobbes asserts the same
   necessity explicitly one sentence later in his own text).
7. **Round 6 — two more targeted fixes, explicit stop point.** Paragraph
   9's three-clause "until...until...nor" chain was split for clarity
   (logic order verified unchanged); paragraph 11's residual "it" ambiguity
   was resolved with an explicit "that same posture." At this point,
   accessibility rounds had narrowed from ~10-11 items (round 3) to 5
   (round 4-5) to 2 explicitly-taste-level items (final round) — a clear
   convergence pattern, not an open-ended list. Two items flagged mid-batch
   (paragraph 1's Prudence parenthetical, paragraph 7's own round-5 fix
   itself being re-flagged as slightly awkward) were deliberately **not**
   chased further: the second case in particular is a concrete example of
   the whack-a-mole risk in over-polishing already-acceptable prose, and
   is recorded here as a judgment call, not silently dropped.
8. **Final — full non-sampled pass + title gap closure.** Fidelity: full
   read of all 14 paragraphs, **ACCEPT AS-IS**. Accessibility: full read,
   **substantially accessible**, with the two remaining paragraph-1 items
   explicitly characterized as taste-level tightening, not comprehension
   stumbles. The final fidelity reviewer flagged (non-blocking, but
   requiring "an explicit decision before pinning") that the title still
   carried the source's archaic spelling "Naturall"; checked against
   `current-modern-en.json` (which already reads "Natural") and every
   other accepted chapter's title-modernization pattern, and fixed. This
   post-verdict edit got its own dedicated gap-closure check, same pattern
   as ch24's D9 and ch10's idx10 gaps.

## Final verdicts

- **Fidelity: ACCEPT AS-IS.** Full non-sampled read of all 14 paragraphs:
  no content loss, no actor swaps, no dropped/altered negation, no
  invented claims, no silent historical corrections. The one blocking
  regression this batch introduced (round 2's "not romance" gloss) was
  caught by round-3 fidelity before it could propagate further and fixed
  immediately.
- **Accessibility: substantially accessible.** Every avoidable wording
  issue raised across six rounds of independent review has been resolved
  or, in two cases, explicitly judged to have crossed from "defect" into
  "taste" and left alone on that basis (documented below, not silently
  dropped).

## Deliberately preserved / explicitly judged non-blocking, not fixed

- **America passage (paragraph 10): unsoftened, per round-1 decision.**
  "Savage people," "no government at all," "brutish manner" all retained.
  The hedging asymmetry between the preceding sentence (hedged: "I
  believe," "peradventure") and this one (flat, unhedged) is preserved
  faithfully — independently confirmed accurate by the round-1 Opus
  fidelity reviewer, not silently corrected.
- **Paragraph 1's remaining minor density** (the "nor is it acquired, as
  Prudence is..." parenthetical; the "either by reputation, or because
  those others agree with them" attachment): flagged twice across rounds
  5-6, resolved correctly on a careful read both times, and explicitly
  characterized by the final accessibility reviewer as taste-level
  tightening rather than a comprehension defect, after six rounds of
  fixes elsewhere in the chapter. Not fixed further.
- **Paragraph 7's "the will to fight by battle is plain to see":** this
  is itself a round-5 fix (replacing "the will to contend by battle is
  sufficiently known"), which the round-5 accessibility reviewer then
  flagged as a "slightly redundant collocation." Left as-is rather than
  attempting a third variant — the round-5 fidelity reviewer confirmed it
  is faithful and called it a style nit only, "not worth another round."
  Recorded here as a deliberate stop, not an oversight.

## Review coverage (exact)

| Round | What | File | Verdict |
|---|---|---|---|
| 1 | Accessibility + fidelity, blind, all 14 paragraphs | `accessibility-review-1.md`, `fidelity-review-1.md` | ACCEPT WITH FIXES REQUIRED |
| 2 | Fidelity, changed-passage re-check | `fidelity-review-2.md` | ACCEPT WITH FIXES REQUIRED (blocking) |
| 3 | Accessibility, blind, all 14 paragraphs | `accessibility-review-3.md` | needs targeted fixes |
| 3 | Fidelity, changed-passage re-check | `fidelity-review-3.md` | ACCEPT WITH FIXES REQUIRED (2 mechanical) |
| 4 | Accessibility, blind, all 14 paragraphs | `accessibility-review-4.md` | needs targeted fixes |
| 4 | Fidelity, changed-passage re-check | `fidelity-review-4.md` | ACCEPT WITH FIXES REQUIRED (1 word) |
| 5 | Accessibility, blind, all 14 paragraphs | `accessibility-review-5.md` | needs targeted fixes |
| 5 | Fidelity, changed-passage re-check (max scrutiny on paragraph 3) | `fidelity-review-5.md` | ACCEPT AS-IS |
| final | Accessibility, blind, all 14 paragraphs | `accessibility-review-final.md` | substantially accessible |
| final | Fidelity, FULL non-sampled, all 14 paragraphs | `fidelity-review-final.md` | **ACCEPT AS-IS** |
| gap | Fidelity, title-edit isolation check | `fidelity-review-title-gap.md` | ACCEPT AS-IS |

Every reviewer stated exact coverage in their own file.

## Defect counts by stage

- **Introduced by drafting (round 0):** 1 blocking (the "for as long as
  he sees" meaning-inversion at paragraph 3).
- **Introduced by revision (rounds 2-6):** 1 blocking (round 2's "not
  romance" gloss, caught and fixed round 3), 2 mechanical (round 3's
  stray comma / dangling "and live," caught same-round), 1 word-choice
  (round 4's "convenient"/"commodious" collision). All caught by the
  hardened `safe_replace`/`validate_structure`/`diff_report` protocol and
  independent re-verification before propagating further.
- **Inherited/pre-existing:** none identified.

## Status

Nothing has been published. `leviathan-ch14-final.json` is a staged
candidate only, not copied into any live edition file. Verified final hash
(identical for `candidate-sonnet.json` and `leviathan-ch14-final.json`):
`0bf1de2f5e2b9097cb36cbc99776582df5ff01a19787446811b6a737291cda82`.
