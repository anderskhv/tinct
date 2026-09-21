# Acceptance Record — Cymbeline (modern-en)

Book id: `cymbeline`. Green-library second batch, pool item #14.
Procedure: `books/TRANSLATION_PROTOCOL.md` steps A–D.

## Files covered

- `source.json` — copied unmodified from
  `app/public/data/editions/cymbeline-original-en.json`.
- `candidate.json` — copied from
  `app/public/data/editions/cymbeline-modern-en.json`, **no edits were
  required or made** during this review (see verdict below).

## Structure check

29 chapters, all real Act/Scene units (Act 1 Scene 1 through Act 5 Scene
5) — no apparatus/stub/editorial chapters. 1133 paragraphs total.
Paragraph count and order match source exactly in every chapter
(`content_edit_helpers.validate_structure`, run per chapter, 0
failures). No empty/whitespace-only paragraphs either side.

## Coverage table

| Step | What | Coverage | Result |
|---|---|---|---|
| A. Accessibility review | `accessibility-review-1.md` | All 29 chapters, all 1133 paragraphs, candidate-only, blind to source | Substantially accessible; only non-blocking notes (inherent content density, classical allusions in source's own words) |
| B. Fidelity review | `fidelity-review-1.md` | All 29 chapters, all 1133 paragraphs, source vs. candidate, full continuous read (no sampling) | 0 defects found |
| C. Whole-chapter/whole-book cross-boundary re-read | folded into `fidelity-review-1.md` "Whole-book cross-boundary re-read" section | Full book reread for name consistency (mixed-case + ALL-CAPS), recurring motifs (ring/bracelet, drug, Fidele identity) | 0 defects found |
| D. Verify in final file, pin hash | This record | sha256 computed against the actual `candidate.json` in this directory | See below |

## Defect counts by round

- **Round 1 (accessibility + fidelity + cross-boundary):** 0 blocking
  defects found across the entire book. No correction rounds were
  needed — this book did not hit the recurring failure pattern this
  batch has seen elsewhere (silent name/spelling correction, softened
  frank content, dropped detail).
- Automated cross-checks run as corroborating evidence, not as the
  quality bar itself:
  - `classify-modern-en.py cymbeline`: similarity 0.648, 1
    REAL-HEAVY/28 REAL buckets, 0 LIGHT/MECHANICAL, 0 wrapped
    scaffolding, 0 truncated quotations, 0.2% identical long
    paragraphs.
  - Proper-noun sweep (both mixed-case and ALL-CAPS forms) for every
    named character: no drift from source's own spellings anywhere.
    Specifically checked for the two known textual-crux alternate
    spellings named in the task brief — "Innogen"/"INNOGEN" and
    "Jachimo"/"JACHIMO" — zero occurrences of either, in either case,
    in `candidate.json`. Source itself uses "Imogen" and "Iachimo"
    consistently (confirmed by direct count against `source.json`),
    so the candidate correctly reproduces the source's own choice
    rather than "correcting" it to a form the drafter might have
    recognized from another edition.
  - Speaker-tag set comparison (regex-extracted ALL-CAPS labels):
    identical sets between source and candidate — no case-sensitivity
    gap of the kind flagged in the tracker's carried-forward lessons.
  - `word_count_ratios` flagged 10 short single-line paragraphs as
    outliers; all 10 individually read and confirmed faithful (short
    archaic lines naturally compress/expand differently when
    modernized; none dropped or added content).

## Deliberately-preserved non-blocking items (reader-centered reasons)

- **Ch9 "Cytherea"** (epithet for Venus, unglossed): source's own word;
  the surrounding imagery (praising Imogen's beauty as she sleeps)
  carries the sense without requiring the reader to know the
  mythological name. Adding an explanatory gloss risks the kind of
  invented interpretation the standing instructions warn against; the
  allusion's difficulty is inherent to the source, not a wording
  defect.
- **Ch29 "mollis aer" / "mulier" Latin wordplay** (soothsayer's
  etymological pun resolving Imogen's identity): left in Latin because
  the scene's own dialogue immediately explains the pun in-text — the
  soothsayer walks through the derivation step by step as part of the
  play's own resolution. Simplifying or removing the Latin would break
  the mechanism the scene is built on.
- **Ch1 [11] dense genealogical paragraph** and **Ch27 [6] long battle
  narration**: both already rebuilt into shorter sentences than source's
  single continuous periods; remaining density reflects the amount of
  information packed into one speech in the source itself, not unclear
  phrasing. A reader will need to slow down for content reasons, which
  a structural constraint (locked paragraph count, one speech = one
  paragraph) cannot avoid without cutting content.

## Model/settings note

This pass (drafting review, both reviewer roles, and this acceptance
record) used Claude Sonnet 5 (`claude-sonnet-5`) in this session. Per
programme process, an independent Opus verification pass is expected to
follow separately before this book is queued for release-packet assembly
or registry work.

## Final hash

`candidate.json` sha256:

```
9fbacf6307e227a64ec6ccb4624a1afc4b41b890f045904eb2ca1276040580b0
```

No edits were made after this hash was computed — it is the same file
read throughout accessibility review, fidelity review, and the
cross-boundary re-read, and it is unchanged from the live
`app/public/data/editions/cymbeline-modern-en.json` this session started
from.

**Date:** 2026-09-21

**Verdict: ACCEPTED.**
