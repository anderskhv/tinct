# Brothers Karamazov — Verse Review: Report & Recommendation

## What was done

Targeted verse review (not a full-novel pass): inventoried every genuine
rhymed/metrical verse or song passage in the live `modern-en` edition
against `-original-en.json` (see `inventory.md` for method and full
table), then reviewed each for the specific failure class Codex flagged
— rhyme-driven additions, changed imagery, unnecessary retained
archaism.

Confirmed and staged (not applied — this is a published edition file,
out of scope to edit directly) corrections for the three defects
originally reported:

- ch. 33 P11/P12 (Smerdyakov's song + the dialogue commenting on it) —
  reviewed together, since the dialogue is commentary on the song and a
  fix to one without the other would leave them inconsistent.
- ch. 36 P1 (Grand Inquisitor epigraph) — archaism retained
  inconsistently with the very next paragraph's prose.

Full before/after text and rationale: `correction-ledger.md`. Exact
staged JSON: `staged-corrections.json`.

## What was found but not corrected

Chapter 16's Schiller "Ode to Joy" quotation (P41, P43, P45 — a 4-line
and an 18-line stanza) is completely unmodernized: identical archaic
diction throughout ("fostereth," "'Tis at her beck," "hath turned,"
"cling for ever"), while the surrounding prose in the same chapter is
correctly modernized. This is the same underlying pattern as ch. 36's
issue (archaism surviving in verse while prose around it is fixed) but
at much greater scale and difficulty — an 18-line philosophical stanza,
not a couplet.

## Recommendation

**Next bounded batch: draft and run through the full acceptance
procedure (accessibility + fidelity review) a corrected `modern-en`
rendering of Brothers Karamazov chapter 16, paragraphs 41/43/45 only**
(the Schiller quotation) — not the whole chapter, and not the whole
book. This is a self-contained, well-scoped unit: one poem, three
paragraphs, a clear failure mode already established by this review.

Do not treat this finding as license to re-open Brothers Karamazov as a
full-novel retranslation job. The rest of the book (outside this
targeted verse review and outside any future targeted batches Anders
authorizes) should remain "existing repair to verify against updated
criteria" — i.e., something to re-check with the new acceptance
procedure if and when it comes up for review, not something to
proactively rewrite.

## Status

Nothing in this review has been applied to the published edition file.
The three staged corrections and the ch. 16 finding are ready for Anders
to decide: apply the three staged fixes directly (they are small,
already fully specified with source/current/corrected text), and/or
authorize the ch. 16 Schiller batch as the next piece of work.
