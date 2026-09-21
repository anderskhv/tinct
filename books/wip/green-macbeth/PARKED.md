# Macbeth — PARKED (STRUCTURAL-SKIP)

**Book:** Shakespeare's Macbeth, id `macbeth`
**Status:** PARKED after round 1. No acceptance hash. Not ready for
independent verification.
**Model/settings:** Claude Sonnet 5, model id `claude-sonnet-5`.
**Date:** 2026-09-21.

## Why this is parked

`books/wip/green-macbeth/source.json` — the locked copy of
`app/public/data/editions/macbeth-original-en.json` — is **missing two
entire, iconic soliloquies** that exist in every standard edition of the
play:

1. Lady Macbeth's "unsex me here" soliloquy, canonically Act 1 Scene 5
   (source chapter 5), beginning "The raven himself is hoarse..."
   Also missing: Macbeth's immediate reply, "Great Glamis! worthy
   Cawdor! / Greater than both, by the all-hail hereafter!..."
2. Macbeth's "Is this a dagger which I see before me" soliloquy,
   canonically Act 2 Scene 1 (source chapter 8), the scene's closing
   speech.

Confirmed by direct text search across the full `source.json` (see
`fidelity-review-1.md` for the exact search terms and results — every
term unique to these two passages returns zero matches). A wider sweep
of ~60 other well-known lines and phrases spanning every act and scene
confirmed the rest of the play's text is present and intact; the loss is
confined to exactly these two passages, both of which share the same
structural signature (a single character's uninterrupted speech, alone
on stage, as the very last dialogue before the scene's closing exit) —
consistent with a specific parsing failure when `source.json` was
originally extracted from the public-domain text, not a translation-
stage loss (`modern-en` independently lacks the same content, and
source/candidate paragraph counts still match each other because the
loss happened upstream of both editions existing as a paragraph-aligned
pair).

This is the same failure class as `books/wip/green-henry-v/PARKED.md`
(missing Prologue chorus): **content loss in the locked source parse
itself**, not a candidate-translation defect. Per that precedent and per
this task's scope (content-only, no touching `source.json`, no
re-parsing/re-extracting original text), fixing this means:

- Re-parsing or re-extracting the original public-domain Macbeth text
  for these two passages.
- Inserting new paragraphs into the locked `source.json`.
- Inserting matching new paragraphs into `candidate.json` at the same
  positions, which shifts every subsequent paragraph index within
  chapters 5 and 8 and would invalidate any in-progress location-keyed
  fixes made under the old indexing.

That is structural source reconstruction, explicitly out of scope for
this content lane, exactly as it was for Henry V.

## What was and wasn't done

- **Structure check (task step 2):** chapters are real Act/Scene units,
  no apparatus/editorial/crosswalk chapters, and paragraph counts match
  between `source.json` and `candidate.json` (both 28 chapters, matching
  per-chapter paragraph counts). This check alone would have passed —
  the defect is a completeness problem in the source relative to the
  actual work, not a source-vs-candidate mismatch, which is why it
  needed the fidelity pass to surface.
- **Accessibility review (step A):** completed in full, all 28
  chapters, no sampling. See `accessibility-review-1.md`. No blocking
  accessibility defects found in the candidate text as it stands.
- **Fidelity review (step B):** run far enough to discover the
  structural blocker (see Methodology in `fidelity-review-1.md`),
  including a genuinely rebuilt-from-scratch read of chapters 1, 3, 10,
  and 18 (the witches' scenes, the Porter, and the cauldron scene named
  as this book's specific risk areas in the dispatch), plus a
  structure/completeness and targeted-sweep pass across the rest of the
  play. Found 2 real candidate-introduced fidelity defects along the way
  (documented in `fidelity-review-1.md`, not yet fixed):
  - Act 4 Sc 1 (chapter 18): "Liver of blaspheming Jew" rendered as
    "liver of a blasphemer" — "Jew" erased, same defect class as
    Merchant of Venice / Merry Wives / Richard III / Romeo and Juliet in
    this batch.
  - Act 2 Sc 3 (chapter 10), the Porter's scene: "Belzebub" in the setup
    replaced with generic "the devil," breaking the "other devil's name"
    payoff in the very next line — a structurally broken joke, the exact
    pattern named in this dispatch's instructions.
  - **Not certified as fidelity-clean:** chapters 11–17 and 19–28 got a
    structure/completeness pass and the targeted phrase/proper-noun
    sweeps, but not the same paragraph-by-paragraph line-level scrutiny
    given to chapters 1, 3, 10, and 18. This was a deliberate choice —
    running a full correction-and-certify pass now, on a source known to
    be missing content, risks producing a "verified clean" record for an
    incomplete book, which is worse than leaving it honestly unfinished.
- **Steps C and D:** not run. No corrections were applied to
  `candidate.json` in this round (the two found candidate defects above
  are documented but unfixed, since fixing and re-certifying now would
  produce a false "complete" impression while the source-level blocker
  remains).
- **No sha256 was computed for acceptance** because there is no
  acceptance. `candidate.json` in this directory is unchanged from the
  copy made at dispatch start.

## Recommended next step

This needs a structural-repair pass, not another translation-repair
round:

1. Re-fetch/re-parse the original public-domain Macbeth source (Project
   Gutenberg or another verified public-domain edition) specifically for
   Act 1 Scene 5's closing soliloquy and Act 2 Scene 1's closing
   soliloquy.
2. Validate the recovered text against the same source edition already
   used for the rest of `macbeth-original-en.json` (check title/author/
   edition markers per `books/AGENTS.md`'s source-validation rule) so
   the insertion doesn't import wording from a different edition.
3. Insert the recovered paragraphs into `app/public/data/editions/
   macbeth-original-en.json` at the correct positions in chapters 5 and
   8, and equivalent new paragraphs into `macbeth-modern-en.json`
   (drafted fresh under this same protocol, not copied from any other
   translation).
4. Re-run this book's full acceptance procedure (A–D) from scratch once
   the source is complete, including a fresh full read of every chapter
   — not just a patch-and-recheck of the two touched chapters, since
   paragraph indices in chapters 5 and 8 will have shifted.
5. Also carry forward and fix the two candidate defects noted above
   (the "Jew" erasure and the Belzebub joke-break) as part of that
   resumed round.

This book should not consume another round of this batch's 3-round
budget under its current framing — the blocker is not a translation
defect, it is a source-completeness defect discovered by translation
review. Per SECOND-BATCH-TRACKER.md's stated process, the next pool book
(The Tempest, `the-tempest`) or a backup (Oresteia / Nicomachean Ethics)
should be pulled in Macbeth's place for this batch.
