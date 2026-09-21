# Brothers Karamazov — Verse Review: Report & Recommendation

## What was done

Targeted verse review (not a full-novel pass): inventoried every genuine
rhymed/metrical verse or song passage in the live `modern-en` edition
against `-original-en.json` (see `inventory.md` for method and full
table), then reviewed each for the specific failure class Codex flagged
— rhyme-driven additions, changed imagery, unnecessary retained
archaism.

**All six flagged/inventoried paragraphs are now staged, corrected, and
independently reviewed (accessibility + fidelity) with a verdict of
ACCEPT AS-IS on every one** — none applied to the live edition file,
per this task's scope (Brothers Karamazov is published; content-only
work stays in `books/wip/**`).

- **ch. 33 P11/P12** (Smerdyakov's song + the woman's dialogue commenting
  on it, reviewed together since the dialogue is commentary on the exact
  wording of the song): the rhyme-driven "treasure/leisure" and invented
  "and gay" additions are gone, replaced with wording that restores the
  source's own "wealth/health" rhyme and preserves the specific
  dear-one/darling distinction the dialogue depends on.
- **ch. 36 P1** (Grand Inquisitor epigraph): "doth say" modernized to
  "says," matching how the identical phrase is already handled one
  paragraph later in prose.
- **ch. 16 P41/P43/P45** (Schiller's "Ode to Joy" quotation, flagged in
  the previous round as completely unmodernized): the clearly archaic
  constructions ("fostereth," "'Tis at her beck...hath turned," "cling
  for ever") are now modernized. "The foaming must" was deliberately
  left as-is — a documented judgment call, not an oversight — because it
  rhymes with "lust" two lines later and modernizing it would silently
  destroy that rhyme for a word that reads as merely odd, not unclear,
  in context. Independent review agreed with the call while flagging
  "must" as worth a second look in any future full pass on this stanza.

Full before/after text and rationale for all six: `correction-ledger.md`.
Exact staged JSON: `staged-corrections.json`. Independent review write-up:
`independent-review.md`.

## What remains open (not a defect — a scope boundary)

Chapter 16's correction is narrow by design: it fixes the constructions
that were genuinely archaic and cheap to fix without cost to rhyme or
meaning. It does not attempt a full re-rendering of the stanza's denser,
more purely poetic phrasing (e.g. "It is her secret ferment fires / The
cup of life with flame"), which isn't actually archaic, just dense — the
protocol doesn't require rewriting clear-but-dense prose/verse, only
archaic constructions and rhyme-driven distortions. A full modernization
pass on that stanza (if Anders wants one, trading off rhyme/meter against
full modernization of every word, including "must") remains legitimate
future work, not something this review left broken.

## Recommendation

No further Brothers Karamazov verse work is required to close this
review — **the verse review is complete**, with zero unresolved defects
across all five inventoried passages (ch. 16, 33, 36, 50, 53).

If Anders wants to go further on this book specifically, the next
reasonable increment would be a full re-rendering of ch. 16's remaining
dense phrasing (optional, not required by the current standard) — but
this is not being recommended as the next batch; see the top-level
report (`books/wip/MODERN-EN-PROCEDURE-PILOT-2026-09-21.md` and its
follow-up) for the actual next-batch recommendation, which weighs this
against the Leviathan pilot's own next-batch candidates.

Per this task's brief, the rest of Brothers Karamazov (outside this
targeted verse review) remains "existing repair to verify against
updated criteria" — not something to proactively rewrite.

## Status

Nothing in this review has been applied to the published edition file.
All six staged corrections are ready for Anders to apply directly — they
are small, fully specified with source/current/corrected text, and
independently reviewed.
