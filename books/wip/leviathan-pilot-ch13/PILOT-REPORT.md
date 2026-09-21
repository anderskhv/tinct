# Leviathan Batch 3 — edition ch13 (Hobbes ch12) Report

**Chapter:** edition chapter 13 / Hobbes's own Chapter 12, "Of Religion."
Identity verified directly against the live files before drafting: source
title "Chapter 12. Of Religion," opening "Seeing there are no signes, nor
fruit of Religion, but in Man onely..."; 32 paragraphs confirmed matching
between `-original-en.json` and `-modern-en.json`. Selected as the batch's
"different difficulty" chapter — an anthropological/psychological argument
about the origin of religion, unlike anything in earlier batches, and a
genuine test case for the editorial-transparency requirement given Hobbes's
sweeping claims about "the heathen" and religion's origin (see
`books/wip/leviathan-batch3-selection.md`).

**Final file:** `leviathan-ch13-final.json`
```
sha256: 42bc1e301272084321689dd3a30d4c013081e26adb6d33574e5977ca61d0478a
source sha256: 0de98b80e63d49b5ea9686c71e6f760dd920358f9c0565e77c08c3acf553203d
```

## Process (4 rounds)

1. **Round 0 — drafting.** An independent rendering (not a light edit of the
   existing modern-en), used only for register calibration. All named
   terms in the paragraph-20/23 divination catalogue restored after an
   initial over-compression was caught by the drafter's own fidelity check
   before submission. No softening applied to Hobbes's sweeping claims.
2. **Round 1 — full independent review.** Blind accessibility (all 32
   paragraphs) + Opus fidelity (5 overlapping packets + whole-chapter
   cross-boundary re-read). Seven term-level blocking fidelity defects
   found — none thesis-level — where the draft had unintentionally hedged
   or softened Hobbes's own blunt or loaded word choices (e.g. "the
   Leiturgy of Witches" flattened to "the standard practice of witches,"
   losing the anticlerical jab; an unlicensed "almost" inserted before
   "any religion whatsoever"). Accessibility flagged the ~300-word
   divination-survey sentence and two other dense passages.
3. **Round 2 — fixes + re-verification.** All 7 fidelity fixes applied,
   each checked against source before landing (e.g. "jugling between
   Princes" was verified to mean manipulating *between multiple* rulers,
   not simple collusion with one, before choosing the replacement
   wording). The divination-survey sentence was split into four sentences
   with an independent 27-term ordered scan confirming zero items dropped
   or reordered. Full independent re-verification: fidelity ACCEPT AS-IS,
   accessibility substantially accessible with 3 small remaining items.
4. **Round 3 — two light accessibility touches.** "Thumomancy, or presage"
   (an obscure gloss word) → "or foreboding"; "the schoolmen" glossed as
   "the scholastic theologians." Left the Larvae/Lemures/"ghosts of the
   dead" near-redundancy untouched — any gloss attempt either drops a
   named term (against this chapter's established completeness rule) or
   adds clumsy repetition, and the item was independently rated genuinely
   minor.
5. **Final — full non-sampled pass + one gap closure.** Fidelity: full
   read of all 32 paragraphs, **ACCEPT AS-IS**, including explicit
   re-verification of the two round-3 edits and a full re-scan of every
   proper-noun/divination-term catalogue. Accessibility: full read,
   **substantially accessible**, with one last genuine (small) stumble
   found — a stacked double-"that" construction in the closing paragraph
   — fixed and independently gap-verified before pinning.

## Final verdicts

- **Fidelity: ACCEPT AS-IS.** No actor swaps, no negation drops/inversions,
  no causal inversions, no omissions across either of the chapter's two
  longest paragraphs (the divination catalogue and the closing
  Roman-claims series). None of Hobbes's blunt theses (fear-origin of
  religion, the deification catalogue, religion-as-statecraft,
  necromancy-as-fraud, the closing priests indictment) is softened.
- **Accessibility: substantially accessible.** Every genuinely fixable
  wording issue found across 4 rounds resolved.

## Deliberately preserved, not fixed

- **Hobbes's own factual oddity** (paragraph 7): attributing "the war at
  Lepanto" to the Athenians and Phormio — a historical/geographic
  inconsistency in Hobbes's own text (the actual battle context involves
  Naupactus). Left exactly as Hobbes wrote it, per the protocol's rule
  against silently correcting source-level errors — independently
  confirmed correct behavior by the final fidelity reviewer.
- **Larvae, Lemures, and the ghosts of the dead** (paragraph 15):
  genuinely near-synonymous classical terms for restless spirits of the
  dead. Assessed for a clarifying gloss but left unglossed — any fix
  either drops a named term or adds clumsy repetition of "ghosts of the
  dead," and the item was independently rated the mildest on its own
  reviewer's list.
- **Six passages flagged during drafting as candidates for
  editorial-transparency review** (contested historical/anthropological
  claims presented as flat fact by Hobbes: the fear-thesis origin of
  religion, a psychological-universal claim about incorporeal spirits,
  the Gentile-religion survey as flat ethnography, Roman-religious-policy
  motive claims, the biblical narrative's causal claims, and the closing
  monocausal priests thesis) — noted for the record per the task's
  editorial-transparency instruction; not altered in the text itself,
  since Hobbes's own claims, however contestable, are what the rendering
  is required to convey faithfully.

## Review coverage (exact)

| Round | What | File | Verdict |
|---|---|---|---|
| 1 | Accessibility, blind, all 32 paragraphs | `accessibility-review-1.md` | needs targeted fixes |
| 1 | Fidelity, 5 packets + whole-chapter re-read, all 32 paragraphs | `fidelity-review-1.md` | ACCEPT WITH FIXES REQUIRED (7 blocking) |
| 2 | Accessibility, blind, all 32 paragraphs | `accessibility-review-2.md` | substantially accessible (3 items) |
| 2 | Fidelity, full re-check incl. 27-term catalogue scan | `fidelity-review-2.md` | ACCEPT AS-IS |
| final | Fidelity, FULL non-sampled, all 32 paragraphs | `fidelity-review-final.md` | **ACCEPT AS-IS** |
| final | Accessibility, blind, all 32 paragraphs | `accessibility-review-final.md` | substantially accessible (1 item) |
| gap | Fidelity, paragraph-31 edit isolation check | `fidelity-review-para31-gap.md` | ACCEPT AS-IS |

Every reviewer stated exact coverage in their own file.

## Defect counts by stage

- **Introduced by drafting (round 0):** 7 blocking term-level softenings/
  hedges (none thesis-level), all fixed round 1→2.
- **Introduced by revision:** 0 content-loss or actor-swap regressions —
  every edit across 4 rounds was applied via `safe_replace()` and
  independently re-verified; the one large restructure (the divination
  sentence split) was checked with an independent term-by-term scan
  before acceptance.
- **Inherited/pre-existing:** none — no prior modern-en repair history for
  this chapter before this session.

## Status

Nothing has been published. `leviathan-ch13-final.json` is a staged
candidate only, not copied into any live edition file. Verified final hash
(identical for `candidate-sonnet.json` and `leviathan-ch13-final.json`):
`42bc1e301272084321689dd3a30d4c013081e26adb6d33574e5977ca61d0478a`.
