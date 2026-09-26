# Acceptance Record — As You Like It, modern-da structure and completeness repair

**Status: ACCEPTED, ready for Codex integration. Not published.**

| Item | Value |
|---|---|
| Package | `books/wip/as-you-like-it-modern-da-repair/` |
| Branch | `claude/cool-clarke-ngd780` |
| Final candidate sha256 | `1229f6875d9177eff984f7ed40d57c883ba88c9844e63bb8154406bd6b8b25b5` |
| Replaces live sha256 | `80064e115bd31f194fa60e16f1ec08ee4b99efc5f1cc199ec7a4ac34dd52d8ef` |
| Independent reviewer | A separate Claude agent instance, verdict formed before reading `RELEASE-PACKET.md` |
| Review verdict | **ACCEPT**, with one non-blocking pre-existing defect logged and fixed below |

## Independent review summary

**Relocation map — full check, not sampled:** all 880 `PARAGRAPH-MAP.json`
entries verified programmatically (live Danish text at old coordinate vs.
candidate at new coordinate): 880/880 exact matches, zero mismatches.

**Act 1 Scene 1** (47 paragraphs, entirely new): read in full against
`original-en.json` — complete, no drops/merges/splits, no invented
content, correct speaker attribution throughout (Orlando/Oliver/Adam/
Dennis/Charles), register matches the already-translated chapter 2 with
no detectable seam.

**4 caption insertions** (chapters 4, 11, 16, 19): each confirmed correct
against the English baseline's own paragraph 0 and the file's existing
place-name convention; every subsequent paragraph in all four chapters
validated via the full relocation-map check.

**Whole-edition fidelity re-check of the relocated pre-existing Danish
text** (not previously reviewed by anyone before this package): sampled
every 5th paragraph across all 22 chapters with relocated content (182
of 880, ~20.7%), plus a whole-file compression heuristic (zero paragraphs
flagged under 50% of English word count across all 931) plus two fully-read
chapters (9 and 17).

**Found and fixed:** one pre-existing minor defect, not introduced by
this repair — chapter 16 (new coordinate), paragraph index 51 (old
coordinate 12.82) read "CELIA. Jeg kan ikke ordene." — missing the verb.
Confirmed this exact text already existed in the live file before this
repair; it was correctly relocated unchanged, so it's a prior-translation
slip surfaced for the first time by this review, not something this
repair introduced. **Fixed** to "CELIA. Jeg kan ikke sige ordene." in
this final candidate.

No other dropped content, compression, invention, or misattribution
found anywhere in the sampled/read portions. Zero occurrences of "WORLD
LIBRARY", "ELECTRONIC VERSION", "ETEXT" (case-insensitive). Exactly 23
chapters, 931 total paragraphs, per-chapter counts matching the English
structure exactly; titles/sections consistent throughout, not just at
seams. Valid JSON.

## Scope note

As with the English package, this Danish repair does not resolve the
open rights question (whether removing the World Library notice and
restructuring is sufficient, or a larger PG #1523/#100 re-base is
wanted) — that remains Anders'/Codex's decision, documented in the
English package's `RELEASE-PACKET.md`.

## What "accepted" does not mean

Accepted for integration; not published, not live. Codex owns
integration, the open rights and edition decisions above, and the
serialized release process per `books/BOOK-TASK-WORKFLOW.md`.
