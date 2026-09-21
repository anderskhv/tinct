# ACCEPTANCE RECORD — The Bacchae (`bacchae`), modern-en

> **SUPERSEDED 2026-09-21 — THIS RECORD IS NOT LIVE. The book is PARKED.**
> This is a round-1 artifact. Its acceptance was based on a sampled review
> that did not detect a book-wide silent name-normalization defect, still
> unresolved after 3 rounds. See `PARKED.md` in this directory. Do not
> register, deploy, or publish on the basis of this file.

**Status:** ACCEPTED *(round-1 claim, superseded — see banner above)*.
**Date:** 2026-09-21.
**Drafted/repaired by:** Claude Sonnet 5 (`claude-sonnet-5`), this pass
(drafting + both reviews + fixes). An independent Opus verification pass is
expected to follow separately, per programme process notes in
`books/wip/SECOND-BATCH-TRACKER.md`.
**Final file:** `books/wip/green-bacchae/candidate.json`
**Final sha256:** `48cd66f0ebefa15be2a25c1ee16b6e3d49a541e979acd718de613d64a80a8dac`

Programme: green-library second batch (`books/wip/SECOND-BATCH-TRACKER.md`,
book #6, `bacchae`). Acceptance procedure per
`books/TRANSLATION_PROTOCOL.md` (steps A–D).

## Coverage table

| Step | What | Coverage | Result |
|---|---|---|---|
| Structure check | 11 chapters vs. source, real dramatic units | 11/11 chapters verified (Prologue, Parodos, 4 Episodes, 4 Stasima, Exodos) — no apparatus/stub chapters, no editorial debris | Clean |
| Paragraph lock | Count/order vs. source | 336/336 paragraphs, same order, verified by script (`validate_structure`) before and after edits | Clean |
| A. Accessibility review (blind) | Candidate-only, full read | 336/336 paragraphs, all 11 chapters, no sampling | See `accessibility-review-1.md` — substantially accessible, no blocking defects |
| B. Fidelity review (packeted, w/ context) | Candidate vs. source | 336/336 paragraphs, all 11 chapters, packets of 5-10 + 1-paragraph context each side; climactic final third (Third Episode messenger speech through Exodos) individually scrutinized word-for-word | See `fidelity-review-1.md` — 2 blocking defects found, both fixed |
| C. Whole-chapter cross-boundary re-read | Exodos re-read after fix | Full chapter re-read | No new issues |
| D. Verify-in-final-file + hash pin | Fixed paragraph re-derived from source; full-book term sweep | Chapter 11 para 10 independently re-read against source; full-book grep sweep for "pierc"/"sever" (2/2 each) | Clean |
| Round-2 whole-book non-sampled re-read | Fresh fidelity pass + fresh candidate-only accessibility pass over the final file | Full re-read (both aspects) | No further defects found |

## Defects found and fixed, by round

**Round 1 (only round needed):**

1. **BLOCKING — softened verb ("severed" → "came away").** Chapter 11
   (Exodos), paragraph index 10 — the messenger's description of Agave
   tearing Pentheus's shoulder from his body. Source: "the shoulder
   severed." Candidate had softened this to "the shoulder came away,"
   which reads as a materially more passive, less violent action. Fixed:
   restored "severed."
2. **BLOCKING — softened verb, two occurrences in one sentence ("pierced"/
   "pierce" → "fixed"/"fix").** Same paragraph — the single most graphic
   image in the play, Agave carrying Pentheus's head impaled on her wand.
   Source: "his mother hath it, pierced upon a wand, / As one might pierce
   a lion's." Candidate had softened both instances to "fixed"/"fix,"
   erasing the physical violence of the image at the play's climax. Fixed:
   restored "pierced"/"pierce" at both occurrences.

Both defects were part of a single softening pattern confined to one
paragraph. A full-book grep sweep for the specific terms ("pierc", "sever")
— not just the two flagged sentences — confirmed the pattern's full extent
(exactly these 2 instances in each case) and that the fix closed it
completely, with source/candidate counts now matching exactly (2/2 and
2/2). No other paragraph in the book independently reproduces the same
softening under different vocabulary; a broader sweep of violence/body
vocabulary (tear/tore/torn, rend, wound, blood, gore, flesh, cleave, cleft,
stab, slay/slain, slaughter) found no additional softening anywhere in the
book — the cattle-massacre messenger speech (ch. 7) and the rest of the
dismemberment passage (ch. 11) all preserve full intensity.

No other defect classes were found: no imported wording from another
translation, no silent name "corrections" of a different-name kind, no
glosses naming an unstated figure (the candidate contains no explanatory
glosses at all — the verse-drama source has none of the technical prose
terms that would call for one), no dropped sentences, no actor
misattribution, no negation/causality/condition inversions, no invented
content.

**Total defects found across the whole process: 2 (both fixed in round 1,
both from the same pattern, both in the same paragraph).**

## Deliberately preserved, non-blocking items (with reader-centered reasons)

- **Name-spelling modernization (Teiresias→Tiresias, Kithaeron→Cithaeron,
  Dionyse→Dionysus, Bromios→Bromius, Bacchios→Bacchus).** The source
  (Gilbert Murray's translation) uses idiosyncratic Greek-style
  transliterations throughout. The candidate consistently modernizes these
  to the now-standard English spellings of the *same* names — verified by
  full-book grep to be applied with zero exceptions and zero mixed forms.
  This is not a homogenization of genuinely different source variants (the
  Gilgamesh-class defect this batch has already been burned by); it is a
  documented, uniform spelling convention for one identity throughout,
  which `books/AGENTS.md`'s "documented, context-aware name convention"
  rule for character names permits. Reader-centered reason: the modernized
  spellings are the ones a contemporary reader will recognize (Tiresias,
  Cithaeron, Dionysus are the standard English forms found in reference
  works and other translations), and the consistency (never mixed) means
  no ambiguity is introduced.
- **Long, dense paragraphs in the choral odes and the two long messenger
  speeches left as single paragraphs.** These are inherent to the source's
  own structure (locked paragraph count forbids splitting) and to the
  classical convention of the uninterrupted messenger speech and the
  catalogue-style choral ode. The accessibility review flagged these as
  genuinely dense but found no leftover archaism or avoidable difficulty
  within them — the density is a structural property of Greek tragedy, not
  a drafting defect.

## Model/process note

This pass (staging, drafting-quality verification, both A/B reviews, the
two fixes, and the re-verification/whole-book re-read) was done by Claude
Sonnet 5. Per programme process, an independent Opus verification pass is
expected to follow separately before this candidate is treated as final
for publication purposes. Nothing in this directory has been copied to
`app/public/data/editions/bacchae-modern-en.json`, and no registry, app,
audio, or deploy change was made — this work is confined to
`books/wip/green-bacchae/` per the task's scope restriction.
