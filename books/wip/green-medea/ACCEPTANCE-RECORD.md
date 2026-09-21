# Acceptance Record — Medea (Euripides), modern-en

**Book / id:** Medea, `medea`
**Source (fidelity anchor):** `app/public/data/editions/medea-original-en.json`
(Gilbert Murray's public-domain verse translation), staged unmodified as
`books/wip/green-medea/source.json`.
**Candidate origin:** `app/public/data/editions/medea-modern-en.json`,
staged as `books/wip/green-medea/candidate.json`, repaired in place per
`books/TRANSLATION_PROTOCOL.md` steps A–D.
**Repair/reviewer model:** Claude Sonnet 5 (claude-sonnet-5). All roles in
this pass (drafter-repair, blind accessibility reviewer, packet-based
fidelity reviewer) were performed by this same model/session — recorded
here per the task's instruction, not claimed as a separate independent
model.
**Date:** 2026-09-21

## Structure

7 chapters (Prologue, Parodos, First Episode, Second Episode, Third
Episode, Fourth Episode, Exodos) — real dramatic units, not apparatus.
Paragraph counts match source exactly per chapter (20/8/25/79/10/32/67 =
241 total) and paragraph order/indices are unchanged throughout the whole
repair pass.

## Review coverage

| Step | What | Coverage | Result |
|---|---|---|---|
| A | Blind accessibility review (candidate only, no source) | All 7 chapters, all 235 paragraphs, full read, no sampling | 1 archaism, 1 staging question (see below) — `accessibility-review-1.md` |
| B | Packet fidelity review (candidate vs. source, packets w/ context) | All 7 chapters, all 241 paragraphs, full read, no sampling | 3 blocking, 1 non-blocking — `fidelity-review-1.md` |
| C | Whole-chapter/whole-book cross-boundary re-read | Full second read of entire book, both fidelity and accessibility angles | No new defects |
| D | Fixes applied, independently re-verified against source, structure re-validated, hash pinned | 4/4 fixed paragraphs re-derived from source directly (not from the fix's own stated rationale) | Confirmed correct |

## Defects found and fixed, by round

**Round 1 (only round needed):**

1. **Ch.1 "Prologue," paragraph 1** — certainty/timing overstatement.
   Candidate asserted Medea was already "locked out from any home" at a
   point in the play where the exile order hadn't been issued yet; source
   is more hedged. Fixed to "Not being entirely shut out from a home —
   alas, she knows now how rare a thing even that was."
2. **Ch.3 "First Episode," paragraph 0** — one unmodernized archaic word,
   "forsooth," inside otherwise fully modern prose (not a nested
   quotation, so not exempt). Removed.
3. **Ch.5 "Third Episode," paragraph 9** — tone/connotation reversal. The
   Chorus's hopeful "'Twill be well!" (predicting Medea will relent) had
   become the colder "you will fail" (framing it as Medea's personal
   failure), inconsistent with the Chorus's sympathetic register
   throughout the stanza. Restored to "it will be well."
4. **Ch.6 "Fourth Episode," paragraph 14** — non-blocking clarity fix. A
   redundant "I would rather... than that — I would rather..."
   construction, source direction (blood over gold) preserved but
   confusingly worded. Tightened to "I would rather it were blood spent
   than gold, before that comes."

All four fixes applied with `content_edit_helpers.safe_replace()`,
verified with `validate_structure()` (source vs. post-edit candidate,
per touched chapter) and `assert_only_changed()` (exactly the intended
paragraph index changed in each of the 4 touched chapters, nothing else).
Each fixed paragraph was then independently re-read in full context
against `source.json` a second time (not just checked against the fix's
own stated intent) — confirmed correct. No second correction round was
needed.

## Deliberately preserved, non-blocking (reader-centered reasons)

- **Ch.1 "dark Symplegades" (candidate) vs. "blue Symplegades" (source),
  paragraph 1.** Not a fabricated detail: the source itself elsewhere
  calls the same landmark "the Dark Blue Rocks" (Ch.4 §1) and "the dark
  blue seas" (Ch.7 §11). A reader encountering "dark" here is not being
  given information the source doesn't support elsewhere in the same
  text. Left as-is rather than force an exact color match that would gain
  nothing for the reader.
- **Ch.2 "Parodos," paragraph 3, "the faith men have sworn" vs. source's
  "man's faith forsworn."** The source's own phrase is genuinely
  ambiguous archaic syntax; both readings point to the same referent
  (Themis/Zeus as guardians of the broken marriage oath) and neither adds
  or removes a claim a reader would act on. Rewriting further in either
  direction would manufacture false precision the source doesn't have.
- **Ch.3 "First Episode," paragraphs 21/22 — "[Exit CREON with his
  suite.]" immediately followed by Creon speaking again.** Verified this
  exact sequencing exists in `source.json` itself (not introduced by the
  modern-en draft). A reader momentarily unsure whether Creon has left
  is experiencing the same ambiguity the source's own stage-direction
  placement creates; "fixing" it would mean second-guessing a 241-year
  dramatic text's own blocking rather than translating it.
- **Unnamed figures kept unnamed** — Medea's murdered brother is referred
  to only as "a brother" throughout (Ch.2 §2, Ch.7 §31), never supplied a
  name (Absyrtus) the source itself withholds. This is a compliance
  confirmation, not a defect: checked specifically per the standing
  instruction against naming what the source leaves unnamed.
- **Classical epithets left unglossed** ("the Cyprian" for Aphrodite,
  Erechtheus, Cephisus, Pandion's son Aegeus, etc.) — these function as
  period color and allusion the way the genre requires; none obstruct
  following the plot, and glossing them would risk adding identifying
  information (a specific deity's name, a specific historical claim)
  beyond what the source's own words state.

## Final file

- **File:** `books/wip/green-medea/candidate.json` (post-fix, final state)
- **sha256:** `cef9d2e057255cc78842bcc4e7126665cb5462d4a4d52f7856232329882ad629`
- **Paragraph count:** 241, matching `source.json` exactly, chapter by
  chapter, order preserved throughout.

## Verdict

**ACCEPTED.**
