# Acceptance Record — Macbeth completeness repair

**Status: ACCEPTED (content), ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/macbeth-completeness-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| Candidate original-en sha256 | `9df987bdf1a1a8c50d44e0c4c2ab6a18e2580f47114810232e8022eecca207c6` |
| Candidate modern-en sha256 | `c597a985ce096a923b03a5072e52f6d8bd5bbc44c0c11fd924ff4e0019351bec` |
| Replaces live sha256 | original-en `2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608`; modern-en `0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1` |
| Author (this package) | Claude, this session, 2026-09-26 |
| Independent reviewer | A separate Claude agent instance, spawned with no visibility into this package's build notes or reasoning, working only from the Gutenberg source and the candidate/live JSON |
| Review evidence | `INDEPENDENT-REVIEW.md` (this folder) |
| Review verdict | **ACCEPT. No defects found.** |

## Independent review summary

The reviewer independently downloaded PG #1533, verified its sha256, and
re-derived all 34 restorations from the source rather than trusting this
package's own claims. Findings:

- Both candidate JSON files are valid, all 28 chapters present, and every
  chapter has equal paragraph counts between `original-en` and `modern-en`
  (Compare alignment holds).
- All 34 restorations (1,320 words, matching the audit's ~1,300-word
  estimate) were independently traced to the Gutenberg source and confirmed
  verbatim, correctly attributed, and correctly placed — including both
  soliloquies (the dagger soliloquy and "the raven himself is hoarse...
  unsex me here") checked clause by clause.
- A full independent word-for-word re-scan of all 28 chapters (not just the
  known 34 gaps) found no other missing, extra, or reordered content.
  Sequence-match ratios were ≥0.94 everywhere; all residual diffs were
  cosmetic (stage-direction bracket formatting, ACT-division headers).
  Several exact-duplicate paragraphs within chapters were checked and
  confirmed to be legitimate repeats in the actual play (e.g. the witches'
  chant, "[Descends.]"), not repair artifacts.
- 14 of the new/changed modern-en paragraphs were spot-checked in full,
  including both soliloquies: faithful, complete, no summarization or
  invention.
- The two paragraphs re-segmented from an existing merged modern-en
  paragraph (5.1 and 15.6/15.40→15.41) were confirmed correctly split with
  no content lost or duplicated.
- One cosmetic, pre-existing, out-of-scope observation: modern-en 15.6/15.7
  carries a bracketed stage direction, "[Goes to the door.]", not present in
  the Gutenberg source. This predates this repair (it was already in the
  served modern-en, merged into a different paragraph boundary before this
  repair split it out) and is not a defect this repair introduced. Left
  as-is; noted for a future editorial pass if Anders wants it addressed.

## Open items handed to Codex (not resolved by content authoring)

1. **Danish scope decision** (`RELEASE-PACKET.md` "Scope note on Danish"):
   `modern-da` becomes paragraph-misaligned in the 16 touched chapters once
   this repair integrates. Needs Anders' decision: reopen Danish scope for
   Macbeth specifically, or hide `modern-da` Compare-pairing for the
   affected chapters per the audit's D-9 guidance.
2. **Character-card re-anchoring**: `CHARACTER-CARD-IMPACT.json` gives the
   exact bulk remap (614/623 mentions) and the 16 special-cased mentions in
   the 3 split paragraphs, computed and verified against the actual
   candidate text.
3. **Reading-position migration**: `PARAGRAPH-MAP.json` gives the complete
   old→new map for all 508 surviving paragraphs across the 16 touched
   chapters.
4. **Narration cache invalidation**: the 34 changed/added paragraphs across
   16 chapters need their cached speech invalidated on integration; no audio
   generation was performed or requested by this package.

## What "accepted" does not mean

This content is accepted for integration. It is not published, not live, not
deployed. Codex owns registry/character-card/threads integration, the
Danish-scope decision above, app verification, and the serialized release
process per `books/BOOK-TASK-WORKFLOW.md`.
