# Brothers Karamazov — Verse Correction Ledger

Staged corrections only. **None of these have been applied to the live
edition file** (`app/public/data/editions/brothers-karamazov-modern-en.json`)
— Brothers Karamazov is a published book (in `bookRegistry.ts` `BOOKS`),
and this task's scope is staged candidates/review artifacts, not published
edition files. Exact JSON is staged at `staged-corrections.json` in this
directory, keyed by chapter and paragraph index, alongside `source`,
`current_modern_en`, and `corrected` for each.

All three defects were previously accepted by a reviewer despite not
matching the source — confirmed by Codex's report and independently
re-verified against the source here before drafting any fix.

## 1. Chapter 33, paragraph 11 (Smerdyakov's sung verse)

- **Source:** "What do I care for royal wealth If but my dear one be in
  health? Lord have mercy / On her and on me! ..."
- **Current modern-en (defective):** "What do I care for royal treasure
  If my dear one's well, at leisure? Lord have mercy / On her and on
  me! ..."
- **Corrected:** "What do I care for royal wealth, if only my dear one is
  in health? Lord have mercy / On her and on me! ..."
- **Why:** "Treasure"/"leisure" is a rhyme-driven substitution for
  "wealth"/"health" that drops the concept of *health* entirely and
  replaces it with an unrelated idea ("at leisure" — having free time).
  Health is the whole point of the couplet (a folk verse wishing a loved
  one well); losing it is a meaning change, not a paraphrase. The fix
  keeps the source's own rhyme pair (wealth/health), which already works
  in plain modern English — no invented rhyme was needed.

## 2. Chapter 33, paragraph 12 (dialogue quoting the remembered lyric)

- **Source:** "'It was even better last time,' observed the woman's
  voice. 'You sang "If my darling be in health"; it sounded more tender.
  I suppose you've forgotten to-day.'"
- **Current modern-en (defective):** "'It sounded even better last
  time,' the woman's voice observed. 'You sang "If my darling's well and
  gay"—it sounded more tender. I suppose you've forgotten it today.'"
- **Corrected:** "'It sounded even better last time,' the woman's voice
  observed. 'You sang, "If my darling is in health" — it sounded more
  tender. I suppose you've forgotten it today.'"
- **Why:** "And gay" is invented — not in the source at all — and it also
  contradicts the modern-en text's *own* P11, which sings "well, at
  leisure," not "well and gay." The dialogue is supposed to quote a
  *different, more tender* prior phrasing of the same wish (still about
  health, just "darling"/"be in health" instead of "dear one"/"but ...
  be in health") — the two lines are meant to rhyme with each other
  thematically, not to introduce a third, unrelated idea. The corrected
  version restores that relationship: both lines are now about health,
  phrased slightly differently, matching the source's actual contrast.
  This pair (P11/P12) must be corrected together — reviewing one without
  the other misses that the dialogue is commentary on the song.

## 3. Chapter 36, paragraph 1 (Grand Inquisitor epigraph)

- **Source:** "No signs from heaven come to-day To add to what the heart
  doth say."
- **Current modern-en (defective, retained archaism):** "No signs from
  heaven come today / To back up what the heart doth say."
- **Corrected:** "No signs from heaven come today / To back up what the
  heart says."
- **Why:** Not a rhyme-driven addition, but unnecessary retained
  archaism: "doth say" is left untouched in the verse epigraph while the
  *identical* phrase ("what the heart doth say") is correctly modernized
  to "what the heart says" one paragraph later, in prose (ch. 36 P2,
  already correct in the live edition, confirmed unchanged). The
  epigraph's rhyme is "today"/"say" — "doth" is not load-bearing for
  meter or rhyme, so dropping it costs nothing and removes an
  inconsistency within the same chapter.

## Not corrected in this pass (flagged for next batch)

**Chapter 16** (Schiller's "Ode to Joy" quotation, an 4-line stanza at P41
and an 18-line stanza at P43, echoed at P45) is completely unmodernized —
"fostereth," "'Tis at her beck," "hath turned," "cling for ever," etc.,
identical to source throughout. This is not a small couplet-level fix like
the three above; a faithful modern rendering of an 18-line rhymed
philosophical stanza is real drafting work of its own, and speculatively
drafting it here would exceed this pilot's "targeted verse review, not a
new full-novel rewrite" scope. Recorded in `inventory.md` and
`PILOT-REPORT.md` as the concrete next-batch recommendation.
