# Acceptance Record — The Epic of Gilgamesh (`gilgamesh`), modern-en

Programme: green-library second batch (`books/wip/SECOND-BATCH-TRACKER.md`,
book #2). Procedure: `books/TRANSLATION_PROTOCOL.md` steps A-D.

**Model note:** this entire repair/acceptance pass (drafting checks,
review, and all corrective edits) was performed by Claude Sonnet 5 in this
session, acting in sequence as accessibility reviewer, fidelity reviewer,
and corrections author. No other model or paid API call was used
(zero Anthropic API spend, per `books/AGENTS.md`).

## Files

- `books/wip/green-gilgamesh/source.json` — staged, unmodified copy of
  `app/public/data/editions/gilgamesh-original-en.json`.
- `books/wip/green-gilgamesh/candidate.json` — staged copy of
  `app/public/data/editions/gilgamesh-modern-en.json`, then repaired in
  place per the fidelity review below. **Not yet copied back** to
  `app/public/data/editions/` — this book work is staged-only per scope
  (no app/registry/deploy changes made).
- `accessibility-review-1.md` — Reviewer A pass (post-fix candidate).
- `fidelity-review-1.md` — Reviewer B pass, full non-sampled coverage,
  round 1 (packeted) + round 2 (whole-book cross-boundary re-read).

## Structure verification (step B pre-check)

- 12 chapters/tablets in both source and candidate, matching numbers.
- 253 paragraphs total, matching count and order per chapter (no
  merge/split/drop/invent) — verified with
  `content_edit_helpers.validate_structure` after every edit round.
- No empty/whitespace-only paragraphs on either side.
- Source contains 17 explicit lacuna/damage markers (bracketed notes and
  ellipsis runs) across 6 tablets, consistent with a fragmentary ancient
  text — confirmed present and checked one-by-one that none were
  papered over with invented content (see fidelity review items 9-10 for
  the 7 that had been eroded, now restored).

## Coverage table

| Step | What | Coverage |
|---|---|---|
| Structure check | chapter/paragraph counts, order, emptiness | All 12 chapters / 253 paragraphs |
| A. Accessibility review | candidate-only, blind, fresh read | All 12 chapters / 253 paragraphs, full (not sampled) |
| B. Fidelity review, packeted | source vs. candidate, ~5-10 para packets + 1-para context each side | All 12 chapters / 253 paragraphs, full (not sampled) |
| Corrections (step D) | safe_replace + validate_structure + diff_report per edit | 33 paragraphs touched across 3 rounds (see below) |
| C. Whole-book cross-boundary re-read | source vs. final candidate, full linear re-read + full-book proper-noun frequency sweep | All 12 chapters / 253 paragraphs, full (not sampled) |
| Independent re-verification | every fixed paragraph re-checked against source directly; every touched name/epithet grepped for other book-wide occurrences | 33 paragraphs + 9 distinct name/term patterns swept book-wide |

## Defect counts by round

**Round 1 (packeted fidelity read):**
- Silent name "corrections" to a historically-standard spelling: 3
  (Bel→Enlil, Imini→Irnini, Niir→Nisir)
- Systematic chapter-scoped name harmonization erasing source's own
  internal inconsistency: 1 pattern, 17 paragraph-level occurrences
  (Sirudi/Urshinabi in Tablet X)
- Systematic word substitution erasing a proper noun used 13 times: 1
  pattern, 12 paragraph-level occurrences (Hades)
- Proper noun genericized: 1 pattern, 4 occurrences (Asakku)
- Proper place names dropped: 4 occurrences (Ekur, Ur, Eridu, Ebabbara)
- Character self-reference name dropped: 2 occurrences (Atra-hasis)
- Lacuna markers erased or filled with invented text: 7 occurrences
  (one of which, Tablet V §3, was also a genuine content omission — "in
  my belly" — not just a marker loss)
- Pre-existing data-generation artifact (stray `',` on paragraph ends,
  unrelated to translation fidelity): 10 occurrences, all in Tablet XI

**Round 2 (whole-book cross-boundary re-read + proper-noun sweep):**
- 0 new defects; sweep is what originally surfaced the Hades, Asakku,
  Ekur/Ur/Eridu, and Ebabbara findings credited to round 1 above (the
  sweep was run as part of the same corrective session before fixes were
  finalized, then re-run clean after fixes).

**Round 3:** not needed — book was clean after round 1 fixes were
verified in round 2.

## Non-blocking items (deliberately preserved)

See `fidelity-review-1.md`, "Non-blocking items" section, for the full
list and reader-centered reasoning for each:
- Untranslated ancient units ("gar," "double-hour")
- One dropped bracketed translator's footnote (unit conversion, not
  narrative content)
- "Heaven-Bull" → "Bull of Heaven" reordering
- Isolated single-letter-dropped typos in source names normalized to the
  book's dominant spelling (distinguished from the genuine multi-instance
  Sirudi/Siduri and Urshinabi/Urshanabi source variation, which was
  preserved, not normalized)

## Final verification (step D)

- All 33 touched paragraphs individually re-derived from `source.json`
  after the fix was applied (not trusted from the fix's own stated
  rationale).
- `validate_structure` run after every edit round; final run confirms 12
  chapters, 253 paragraphs, matching order, on the fully-fixed file.
- Word-count ratio tripwire (`word_count_ratios`) run on the final file:
  11 paragraphs flagged outside the 0.7-1.6 range; each was individually
  re-read against source and found to be legitimate compression of
  repetitive/formulaic source phrasing (e.g. the Tablet IX §12
  "double-hour" march refrain, repeated "opened his mouth and spoke"
  speech tags) with no content loss — none required further edits.
- No stray data artifacts remain (final scan for the `',`-suffix bug and
  for untrimmed whitespace: 0 hits).

## Final hash

```
sha256(candidate.json) = 8e8d1cb7cdb7d553083cd4d08fc6825fd436e4a7545fb2b2089e19d26f6bd9f5
```

Computed 2026-09-21, after the last edit and after that edit's
verification, on `books/wip/green-gilgamesh/candidate.json`.

## Verdict

**ACCEPTED.**

This acceptance record covers `books/wip/green-gilgamesh/candidate.json`
at the hash above. It has not been copied into
`app/public/data/editions/gilgamesh-modern-en.json` or registered/
deployed — per scope, this session touches only files under
`books/wip/green-gilgamesh/`. Copying the accepted file into the public
edition path, if desired, is a separate, explicit follow-up step outside
this session's authorization.
