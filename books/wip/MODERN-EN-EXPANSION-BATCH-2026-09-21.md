# Modern-English Procedure — Bounded Expansion Batch (2026-09-21, part 2)

Continues from `MODERN-EN-PROCEDURE-PILOT-2026-09-21.md` (the original
Leviathan ch18 + Brothers Karamazov verse pilot). This file covers the
follow-up work: closing the "foaming must" accessibility question, and
running two more Leviathan chapters (edition ch24, ch40) through the
full procedure as a bounded expansion test — not a full-book rewrite.

## 1. The "foaming must" question — resolved

The prior pilot's ch16 Karamazov correction deliberately kept "the
foaming must" unchanged to preserve its rhyme with "lust" two lines
later, reasoning it was odd but not actually unclear in context. On
reconsideration, that was the wrong tiebreaker: "must" sitting
immediately after "the foaming" risks being **misparsed as the modal
verb** ("must"), not just recognized as an obscure noun — a
comprehension failure, not mere unfamiliarity.

**Revised:** "The wreath, the foaming must," → "The wreath, the foaming
new wine," — keeps the image (Dionysian festivity, active fermentation)
and pairs naturally with "foaming," at the cost of the must/lust rhyme.
Independently re-reviewed (accessibility + fidelity together):
**ACCEPT AS-IS**. "New wine" confirmed as the best of the plausible
alternatives (checked against "cider," "grape juice," "fresh wine").
Meaning and clarity outrank rhyme, and this rhyme was never worth
risking a misreading for.

Full writeup: `books/wip/brothers-karamazov-verse-review/correction-ledger.md`
(item 5) and `must-revision-review.md`. Still staged only — not applied
to the published edition file.

## 2. Leviathan expansion batch — edition ch24 and ch40

Two more chapters run through the full procedure, chosen to test
different difficulties than ch18 (dense abstract philosophy, no verse,
worst case: two in-text quoted formulas):

- **Edition ch24 / Hobbes ch23**, "Of the Publique Ministers of
  Soveraign Power" — concrete administrative/legal taxonomy (offices,
  courts, English legal history), 13 paragraphs.
- **Edition ch40 / Hobbes ch39**, "Of the Signification in Scripture of
  the Word Church" — dense with **external** scripture citation (as
  opposed to ch18's test of the author's own formulas) and an argument
  that turns on the precise senses of untranslated Greek/Latin terms, 5
  paragraphs.

Both identities verified directly against the live files before any
drafting — title, opening text, and paragraph count checked, not
assumed from array position (edition chapter number ≠ Hobbes's own
chapter number in either case).

**Final results — both ACCEPT AS-IS on fidelity, substantially
accessible:**

| | ch24 | ch40 |
|---|---|---|
| Final file | `leviathan-pilot-ch24/leviathan-ch24-final.json` | `leviathan-pilot-ch40/leviathan-ch40-final.json` |
| Final hash | `791e117aa5ef698e7cc7ef87b4a0ecf0eaeaa48f9f280518c2b7bed98b8abd68` | `52277a34efaf708d0befa21c37dc076b3a298ad1dbd933460329fa16de404fc7` |
| Source hash | `daf8a0a595741be412801c3226b4bb0c1b60174636a9627d46f51d4b933dbc64` | `2a10ce856850c8cedf542d8b0e5b065cd273a3d8184a765426d7344de5f987d8` |
| Fidelity rounds | 5 (draft + 3 fix cycles + 1 polish) | 4 (draft + 2 fix cycles + 1 final check) |
| Fidelity verdict | ACCEPT AS-IS (full non-sampled final pass) | ACCEPT AS-IS (full non-sampled final pass) |
| Accessibility verdict | substantially accessible | substantially accessible |

Full per-round history, exact review coverage, and every defect caught
in each round: `books/wip/leviathan-pilot-ch24/PILOT-REPORT.md` and
`books/wip/leviathan-pilot-ch40/PILOT-REPORT.md`.

### Substantive defects caught, by round (both chapters combined)

This is the honest accounting the task asked for — round count and what
each round actually caught, not just "accepted."

| Round | ch24 | ch40 |
|---|---|---|
| 1 (independent review of the draft) | 1 blocking (unmodernized title) + 5 recommended fixes; 3 source-level historical-claim questions flagged, not corrected | 0 blocking; 1 worth-applying stylistic note |
| 2 (re-check after round-1 fixes) | **1 new blocking defect**: an invented, factually wrong gloss (misattributing ch22's content) | **1 new defect**: a sentence restructuring accidentally made "the Roman commonwealth" call a speaker by a Greek term (false) — plus 2 more content-altering additions |
| 3 (re-check after round-2 fixes) | **1 new blocking regression**: ~two-thirds of a paragraph silently deleted by an editing-script bug (caught by a word-count ratio check, confirmed by direct reading) — plus 3 smaller regressions from the same round's fixes | **1 new defect**: a gloss broke the chapter's first-person voice and misattributed a standard term to Hobbes as his own coinage |
| final (full non-sampled pass) | 0 blocking; several documented non-blocking notes | 0 blocking; certified clean |

**Pattern worth naming plainly:** in both chapters, every blocking
defect after round 1 was introduced by a *revision* edit, not left over
from the original draft. This is exactly why the procedure mandates
re-verification after every round rather than trusting that a listed
fix was applied correctly — a self-report or an unverified diff would
have missed real content loss and a real factual error in this batch.

### Historical citation questions (source-level, not candidate defects)

Per the task's instruction to distinguish modernizing language from
correcting a citation/claim: three items were flagged in ch24 as
possible errors in **Hobbes's own text**, verified against available
historical knowledge, and left exactly as Hobbes wrote them — not
silently corrected, not silently accepted as unquestionably right. Full
detail in `leviathan-pilot-ch24/PILOT-REPORT.md`; summary:

- Hobbes's claim that a peer's judges under English law were "such as
  they had themselves desired" likely overstates how consensual
  trial-by-peers actually was (out-of-session peers were tried before
  Crown-selected Lords Triers, not judges of their own choosing) — this
  is load-bearing for his own argument, so flagged as the
  highest-confidence item.
- A related overstatement about an unlimited right to challenge jurors.
- A low-confidence question about whether one Latin formula
  (`Dei Providentia et Voluntate Regis`) is an attested historical style
  or an illustrative construction of Hobbes's own.

ch40 additionally investigated and **resolved** one apparent citation
question rather than leaving it open: Hobbes's paraphrase of Matt 18:17
using "Gentile" (rather than the more common "heathen man") was checked
against the underlying Greek and confirmed to be a defensible direct
rendering, not a citation error — documented, not silently assumed
either way.

## 3. Model policy actually used

Full detail: `books/wip/leviathan-expansion-model-settings.md`. Summary:
Sonnet for all drafting/fixing, a fresh candidate-only session for every
accessibility review, an independent Opus session for every fidelity
review. Same honest caveat as the ch18 pilot: this environment cannot
independently re-verify after the fact which model actually served a
background subagent, only that the override was requested and accepted.
No paid API calls made.

## 4. Terminology consistency

`books/wip/leviathan-terminology-note.md` was built from ch18 before
this batch and updated afterward with what ch24/ch40 confirmed
(the "bear the person" gloss is reusable verbatim across chapters; the
word-count-ratio tripwire and the assignment-vs-replace scripting
lesson from the ch24 regression, worth keeping for any future batch).

## 5. Remaining uncertainties

1. **ch24's three source-level historical-claim questions (S1-S3)** are
   flagged, not resolved — Anders's call whether the edition ever wants
   a short editorial endnote on them. Recommended handling: leave the
   text exactly as rendered either way.
2. **A handful of non-blocking stylistic notes** remain undone in both
   chapters (documented in each PILOT-REPORT.md) — deliberately not
   chased further, per "do not keep endlessly revising satisfactory
   prose for taste."
3. **Neither final candidate has been published.** Applying either to
   the live edition file is Anders's decision, not made here.
4. **The Karamazov "must" revision** is staged but not applied to the
   published edition, same as the rest of that book's corrections.

## 6. Recommendation: proceed chapter-by-chapter with Leviathan repair?

**Yes, cautiously — with the regression-catching discipline kept
mandatory, not optional.** Three chapters in (ch18, ch24, ch40) across
genuinely different material (abstract philosophy, administrative/legal
taxonomy, scripture-heavy argument), the procedure has now:

- Produced a clean final result each time.
- **Caught real, substantive defects at every single round after the
  first** — not just style nitpicks. Two of those defects (ch24's
  content-loss bug, ch40's actor-misattribution) would have shipped
  silently under a lighter process that trusted a "these fixes were
  applied" self-report instead of independently re-deriving the file's
  content each round.
- Not required a full re-draft at any point — every defect found was a
  local, patch-level fix.

This is evidence the procedure is working as designed, not just
producing another "accepted" label — it is specifically the
re-verification discipline (full independent re-reads, word-count
tripwires, diff-derived coverage claims) that is catching real problems,
and that discipline held up under increased scope (going from 1 to 3
chapters) without becoming a rubber stamp.

**Recommended next bounded batch:** continue chapter-by-chapter, not a
full-book run. Leviathan has 49 chapters total; three are now done. A
reasonable next batch is **2-3 more chapters**, chosen again for
difficulty diversity — for example: one of the very long chapters (ch27
"Of Civil Laws," ~7,900 words, or the 138-paragraph/29,000-word ch42
"Of Power Ecclesiastical" — likely worth breaking into its own
sub-batch given its length) to test the procedure's behavior at scale
within a single chapter, plus a short chapter from early in the book
(e.g. ch7 "Of the Ends or Resolutions of Discourse," 1,224 words) to
keep at least one small, fast-turnaround chapter in every batch as a
calibration check.

**Not recommended:** switching to a full-book pass, or loosening the
per-round re-verification discipline to move faster — this batch is
direct evidence that doing so would let real defects through.
Confessions and War and Peace remain untouched and are not part of any
recommended next batch.

## 7. What this task did not do (by design)

- Did not publish either candidate, or the revised Karamazov
  correction, to any live edition file.
- Did not regenerate audio.
- Did not touch app code, the registry, or landing-page code.
- Did not call a paid model API.
- Did not start a third book or a full-book run.
- Did not touch Confessions or War and Peace.
