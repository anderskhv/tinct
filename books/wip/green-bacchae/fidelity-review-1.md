# Fidelity Review — The Bacchae (`bacchae`), modern-en candidate vs. source

**Reviewer:** Claude Sonnet 5 (`claude-sonnet-5`), independent fidelity
pass against the locked `source.json` (Gilbert Murray's public-domain
English verse translation of Euripides), per
`books/prompts/fidelity-review-prompt.md`. This is the sole fidelity
anchor; no other translation of the play was consulted.

**Coverage:** Full, non-sampled. Every one of the 11 chapters / 336
paragraphs was read against its source counterpart, working in packets of
roughly 5-10 paragraphs with one paragraph of context on each side, followed
by a whole-chapter re-read for cross-boundary issues (actor identity across
the play, the Dionysus/Bacchus/Bromius naming convention, recurring
formulaic phrases). The climactic recognition/dismemberment sequence (final
third of the play — Third Episode's cattle-massacre messenger speech
through the Exodos's messenger speech, Agave's return with the head, and
the Cadmus recognition scene) received individual word-for-word scrutiny
beyond the packet pass, given this batch's known failure pattern of
softening graphic content.

## Method notes specific to this book

- Paragraph structure matches source exactly: 11 chapters, same titles
  (Prologue, Parodos, First Episode, First Stasimon, Second Episode, Second
  Stasimon, Third Episode, Third Stasimon, Fourth Episode, Fourth Stasimon,
  Exodos), same paragraph count per chapter (3, 9, 26, 4, 53, 19, 69, 4, 30,
  8, 111 = 336 total), same order. No merges, splits, drops, or invented
  paragraphs.
- **Naming convention (documented, not a silent correction).** Source uses
  Gilbert Murray's idiosyncratic transliterations: Teiresias, Kithaeron,
  Dionyse, Bromios, Bacchios. The candidate consistently modernizes these to
  the now-standard English spellings Tiresias, Cithaeron, Dionysus,
  Bromius, Bacchus throughout — verified by full-book grep: zero leftover
  instances of the old spellings, and no mixed forms anywhere. This is the
  same underlying name in every case (not a homogenization of genuinely
  different source variants, which is the defect class that caused
  book-wide harm in this batch's Gilgamesh pass) and is applied uniformly,
  which is what `AGENTS.md`'s "documented, context-aware name convention"
  allows. Judged non-blocking.
- A book-wide term-frequency sweep was run for violence/body vocabulary
  (pierce, sever, tear/tore/torn, rend, wound, blood, gore, flesh, cleave,
  cleft, stab, slay/slain, slaughter) to catch the softening pattern
  documented in this batch's Gilgamesh PARKED.md before trusting a
  packet-level "looks fine."

## Defects found (Round 1)

All defects were confined to a single paragraph — the Exodos messenger's
description of the dismemberment (source paragraph index 10 of chapter 11,
the long "We climbed beyond the utmost habitings..." speech) — and all were
graphic-content softenings, the specific failure class this batch has
already parked one book over.

1. **BLOCKING — softened verb, dismemberment.** Source: "Drew . . . and the
   shoulder **severed**!--Not by might / Of arm, but easily, as the God
   made light / Her hand's essay." Candidate (before fix): "...and pulled .
   . . and the shoulder **came away**! — Not by strength of arm, but
   easily, as the God made her hand's effort light." "Came away" is a
   materially softer, more passive description of Agave tearing her son's
   shoulder from his body than the source's "severed." Fix: restored
   "severed."
2. **BLOCKING — softened verb, ×2 in one sentence, the impaled head.**
   Source: "his mother hath it, **pierced** upon a wand, / As one might
   **pierce** a lion's." Candidate (before fix): "his mother holds,
   **fixed** upon a wand as one might **fix** a lion's." "Fixed" erases the
   physical violence of the image (a severed head driven onto a pole) in
   favor of a neutral, almost administrative verb, at the single most
   graphic visual beat of the play's climax. Fix: restored "pierced"/
   "pierce" at both occurrences.

Both defects were in the same paragraph and were part of the same softening
pattern (blunting the physical violence of the recognition scene). A
full-book grep sweep for "pierc" and "sever" (not just the two flagged
sentences) confirmed these were the only two instances of either term in
the source, and that both were softened — i.e., the sweep found the full
extent of the pattern, not just the initially-noticed instance, and
confirmed no other paragraph independently reproduces the same softening
with different vocabulary.

## What verified clean

- The Third Episode's cattle-massacre messenger speech (ch. 7): "a live
  steer riven asunder" → "a living steer ripped asunder"; "flesh upon the
  branches, and a red rain" → "flesh hanging on the branches, and red rain
  dripping down"; "Bellowing in sword-like hands that cleave and tear" →
  "bellowing in sword-like hands that cleaved and tore." Full intensity
  preserved, no distancing.
- The rest of the Exodos dismemberment paragraph: "the torn flesh cried,"
  "all the crowd of ravening arms," "groans that faded into sobbing
  breath, / Dim shrieks, and joy, and triumph-cries of death," "a severed
  arm," "a hunter's booted foot," "white bones lay bare" → "bare bones lay
  open," "swift hands ensanguined" → "swift hands red with blood," "tossed
  as in sport the flesh of Pentheus dead" — all preserved at full
  intensity with only ordinary modernization (word order, "ensanguined" →
  "red with blood"), no euphemism.
- Agave's exultant head-carrying and recognition dialogue (ch. 11): "the
  swift hand that slaughters / Is mine" → "the swift hand that slaughters
  is mine"; "held, and tare / The limbs of him" → "held him, and tore the
  limbs of him"; "torn limb from limb" preserved exactly; the
  question-and-answer recognition sequence (Cadmus walking Agave back to
  sanity) checked line-by-line for actor/certainty accuracy — no swaps, no
  softened admissions, no added hedging where the source has none.
- Pentheus's cross-dressing/humiliation scene (ch. 9) and the earlier
  voyeuristic mockery of Dionysus's appearance (ch. 5): sneering,
  eroticized content preserved at the same register as source (e.g. "with
  women worshipping? It is a craft and a rottenness!"; "Would you rather
  draw the sword and spill men's blood?").
- Zeus's self-mutilation to hide the infant Dionysus (ch. 2, Parodos):
  "he tore his own flesh open to hide him" — preserved, not softened to
  something like "he made a place for him."
- Cadmus's grief speech and the final recognition dialogue (ch. 11):
  checked for negation/certainty/causality — no inversions found; Cadmus's
  "It was you. — You and your sisters wrought his death" (actor
  attribution to Agave, not evaded) matches source "'Twas thou.--Thou and
  thy sisters wrought his death" exactly in force.
- Word-count ratio sweep: only 4 of 336 paragraphs flagged
  (ratio outside 0.7-1.6), all single-line dialogue exchanges where the
  variance is normal English phrasing, not omission (checked individually,
  no content loss).
- No unnamed source figure was given an invented name or identity by any
  gloss — the candidate adds no explanatory glosses at all in this book
  (unlike prose works, the verse-drama source has no glossable technical
  terms requiring one), so this defect class does not arise here.

## Verdict

**ACCEPT WITH FIXES REQUIRED** (Round 1). The two defects above (both part
of one softening pattern in one paragraph) required fixing before
acceptance. No other blocking defects found across the full 336-paragraph,
non-sampled comparison, including the individually-scrutinized climactic
final third of the play.

---

## Round 1 fix verification (step D)

Both fixes were applied to `candidate.json` with
`books/content_edit_helpers.py`'s `safe_replace()` (exact-match, single
occurrence). `diff_report`/manual diff confirmed exactly one paragraph
changed (chapter 11, paragraph index 10) and no other paragraph was
touched. `validate_structure()` was re-run against `source.json` after the
edit: chapter numbers, paragraph counts (336 total), and paragraph order
all still match; no empty/whitespace-only paragraph introduced.

A full-book grep sweep for "pierc" and "sever" after the fix shows
source/candidate counts now matching exactly (pierc: 2/2, sever: 2/2),
confirming the pattern was closed everywhere it appeared, not just at the
two flagged sentences.

The fixed paragraph was independently re-read in full against the source
paragraph immediately after the edit (not just the two changed
sub-strings) to confirm no adjacent content was disturbed by the
replacement — confirmed clean.

## Whole-chapter cross-boundary re-read (step C)

After the fix, chapter 11 (Exodos) was re-read start to finish once more,
specifically for cross-boundary issues: the Leader/Agave/Cadmus three-way
recognition dialogue's actor consistency, the recurring
"Dionysus/Bromius/Bacchus" naming across the chapter (consistent), and
whether the restored "pierced"/"severed" register now matches the
surrounding sentences it sits inside (it does — the rest of the paragraph
was already at that intensity; the fix brings these two clauses in line
with, not out of line with, their neighbors). No new issues found.
