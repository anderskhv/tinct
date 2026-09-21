# Acceptance Record — Narrative of the Life of Frederick Douglass, an American Slave (`frederick-douglass`), modern-en

Model/session note: this repair pass (staging, blind accessibility review,
packet/full-context fidelity review, correction, re-verification) was
performed by Claude Sonnet 5 (model id `claude-sonnet-5`), the same model
performing the drafting/repair, in a single working session on
2026-09-21. No other model or human reviewer was involved. This is
recorded per instruction not to claim a different reviewing model than
was actually used.

## Scope

- Book: Frederick Douglass, *Narrative of the Life of Frederick Douglass,
  an American Slave* (1845), id `frederick-douglass`.
- Editions: `frederick-douglass-original-en.json` (source/fidelity
  anchor, staged unmodified as `source.json`) and
  `frederick-douglass-modern-en.json` (candidate, staged as
  `candidate.json` and edited in place in this directory only).
- 12 chapters (11 numbered chapters + Appendix as chapter 12), 162
  paragraphs total. Structure verified sound before any review work:
  chapter numbers match 1:1, paragraph counts match exactly per chapter,
  chapter titles match ("Chapter 1"–"Chapter 11", "Appendix").
- No file outside `books/wip/green-frederick-douglass/` was touched. No
  app, registry, deploy, or audio work was performed.

## Coverage table

| Step | Description | Result |
|---|---|---|
| A | Blind accessibility review, candidate only, full book (162/162 paragraphs, all 12 chapters), no sampling | `accessibility-review-1.md` — 1 blocking finding (Appendix para 2) |
| B | Packet fidelity review, candidate vs. source, full book, every paragraph shown with complete chapter context (exceeds the 5–10-paragraph + 1-paragraph-context minimum — full chapters were used as packets) | `fidelity-review-1.md` — 1 blocking finding (same paragraph), 2 documented non-blocking verse/song preservations |
| C | Whole-chapter/whole-book cross-boundary re-read for recurring terms and relationships (Great House Farm, abolition/abolitionist, class-leader, "the root", withheld-name passages) | No cross-boundary defects found |
| D | Fix applied to the actual candidate.json via `content_edit_helpers.safe_replace`; structure re-validated; diff scoped to exactly the intended paragraph; independent re-read of the fixed paragraph with full chapter context; hash computed on the post-fix file | Fix applied and verified — see below |

## Defect counts by round

**Round 1 (initial accessibility + fidelity review of the as-staged candidate):**
- Blocking defects: 1 — Appendix (chapter 12) paragraph index 2 contained
  a ~200-word quotation from Matthew 23 reproduced verbatim in King James
  Version wording, left completely unmodernized while all surrounding
  prose in the same paragraph and chapter was modernized. This is a
  defect under `TRANSLATION_PROTOCOL.md`/`AGENTS.md`'s explicit rule that
  quotation marks are not an exemption from modernization for quoted
  formulas/definitions/epigraphs, and this quotation is plain prose with
  no meter/rhyme constraint that would justify leaving it archaic.
  Independently flagged by both the accessibility pass and the fidelity
  pass.
- Non-blocking, deliberately preserved (documented below): 2 — the "Just
  God!" verse quotation (Appendix para 1) and the "A PARODY" song
  (Appendix para 7), both left in period diction/dialect.
- All other 160 of 162 paragraphs: no defects of any kind. No actor
  misattribution, negation flip, causality reversal, dropped hedge,
  altered condition, omission, unlicensed addition, or silent
  name/spelling/quotation "correction" found anywhere else in the book.
  No instance found of the candidate supplying a name/identity/fact that
  the source deliberately withholds (checked with particular care at
  every point the narrator explicitly declines to name someone, per the
  standing risk flagged for this specific title).

**Round 2 (correction and re-verification):**
- Fix applied: `apply_fix_round1.py` used
  `content_edit_helpers.safe_replace()` to replace only the Matthew 23
  quotation inside Appendix paragraph 2 with an original modern-English
  rendering that preserves every accusation and image in the source
  quotation (heavy burdens/not lifted; done to be seen; best
  seats/titles; shutting the kingdom's door; widows' houses devoured
  under cover of long prayer → harsher judgment; crossing land and sea
  for one convert → made twice the child of hell; tithing mint/dill/
  cumin while neglecting justice, mercy, faithfulness; straining a gnat,
  swallowing a camel; clean cup outside, greed and excess inside;
  whitewashed tombs — beautiful outside, full of dead men's bones and
  impurity inside; righteous outside, hypocrisy and wickedness inside).
  Nothing was imported from an existing modern Bible translation; the
  rendering is an original paraphrase built to preserve the source's
  specific content, matching the "modernize like prose, but never
  substitute another translation's wording" rule.
- `content_edit_helpers.validate_structure()` passed before and after
  the edit (chapter numbers, paragraph counts, no empty paragraphs).
- `content_edit_helpers.diff_report()`/`assert_only_changed()` confirmed
  exactly one paragraph (Appendix index 2) changed across the entire
  162-paragraph book — no unintended edits anywhere else.
- The fixed paragraph was independently re-read against the source with
  full surrounding chapter context (all of chapter 12, paragraphs 0–10)
  to re-derive that every accusation survives and no actor/negation/
  causality defect was introduced by the edit itself. Confirmed clean.
- No other correction rounds were needed. Blockers cleared in round 2
  (1 of the allotted 3 correction rounds used).

**Round 3:** not needed.

## Non-blocking items deliberately preserved (reader-centered reasons)

1. **Appendix paragraph 1 — "Just God!" verse** (quoted from another
   author, reproduced by Douglass as documentary evidence): left in
   period diction ("thine altar," "thy own afflicted poor," etc.).
   Reason: this is rhymed, metered verse; the word "thine" in the final
   stanza is the rhyme partner for "combine" two lines earlier.
   Modernizing the pronoun would break an existing rhyme the source
   itself relies on, and the protocol explicitly forbids changing an
   image or adding content to preserve/repair a rhyme — the safer,
   more faithful choice is to leave the quoted verse exactly as
   Douglass quoted it, rather than force a rewrite that either breaks
   the rhyme or risks altering the accusation to save it. Archaic
   second-person pronouns ("thee/thy/thine") are also widely recognized
   by general contemporary readers through common exposure to historical
   verse and scripture, so the accessibility cost of preserving them is
   low relative to the fidelity risk of rewriting a rhymed quotation.

2. **Appendix paragraph 7 — "A PARODY" song**: left in period
   diction and invented folk dialect ("dona like goats," "gewgaws,"
   "sable sons of grief," the repeated "heavenly union" refrain).
   Reason: this is a quoted satirical hymn parody, explicitly labeled as
   such, whose entire rhetorical function is its folk-hymn voice and
   rhyme scheme — that voice is the evidence Douglass is presenting, not
   incidental phrasing. Modernizing the vocabulary would not just
   update word choice but would erase the literary device itself
   (a recognizable revival-song parody), which is a different kind of
   loss than an archaic word a reader might momentarily stumble on.
   This is a structural constraint (verse form + attributed quotation of
   a specific satirical artifact), not merely "the source did it."

Both items were flagged independently by the accessibility reviewer pass
(candidate-only) and confirmed by the fidelity reviewer pass (source
comparison) before being classified as non-blocking; neither is a
by-default carryover.

## Final verification

- `content_edit_helpers.validate_structure()`: PASS (12 chapters,
  paragraph counts match source exactly per chapter, 162 total, no
  empty/whitespace-only paragraphs on either side).
- `python3 -m json.tool candidate.json`: valid JSON.
- Whole-book paragraph-count/order check against source: all 12
  chapters match 1:1 in both count and order; no merge/split/reorder
  anywhere.

## Final hash

File: `books/wip/green-frederick-douglass/candidate.json` (staged copy;
not yet copied back to `app/public/data/editions/frederick-douglass-modern-en.json`
— this repair pass is content-only per scope; publication back to the
live edition path is a separate, later step outside this task).

```
sha256(candidate.json) = dd2ab81dc08c74210ad50a28a722a5c9ec6a72aa995e15d4b2d5a9c22cf7c372
```

Computed on 2026-09-21, after the round-1 fix and its independent
re-verification — this hash covers exactly what shipped, not a
pre-fix snapshot.

## Verdict

**ACCEPTED.**
