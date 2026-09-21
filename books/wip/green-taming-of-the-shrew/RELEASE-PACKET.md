# Release Packet — The Taming of the Shrew (Shakespeare)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-taming-of-the-shrew/candidate.json`
- **Target live path:** `app/public/data/editions/taming-of-the-shrew-modern-en.json`
- **Accepted sha256:** `51ef8f1b346059713de284d3247c104b5eea7f7294c2ad5e192b64360583462b`
- **Structure:** 12 chapters, 1021 paragraphs, matches `source.json`
  exactly.

## Validation / review evidence

All evidence lives in `books/wip/green-taming-of-the-shrew/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `PARKED-RESOLVED.md` | Full park history (rounds 1-4) and how it was resolved |
| `ACCEPTANCE-RECORD.md` | Full 5-round coverage table, defect list, deliberately-preserved items, final hash, model/settings notes |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

Five rounds, the longest of any book in this batch. Rounds 1-2 fixed 9
defects (silent name/case corrections, a dropped negation, softened
content, a doubled-word loss). Round 3 fixed 2 more (a quantity drift,
"half a dozen knaves" for source's "half a score," and a first pass at
consistency for the recurring "Katherine the curst" epithet, then
rendered three inconsistent ways across the book). Round 4 (independent
Opus verification) confirmed those fixes but found a 5th, previously
unnoticed occurrence of the same epithet (Hortensio's line) that had
fallen through an indexing mismatch between review rounds' notes —
parked rather than folded into an open-ended fix cycle. That single
narrow, mechanical, zero-judgment-risk gap was fixed directly (this
batch's established judgment-call pattern for such cases) and confirmed
by a final round-5 independent Opus pass, which re-derived the fix from
source, re-verified the adjacent Grumio echo, and ran a third exhaustive
epithet sweep — extracting every "curst"/"cursed"/"shrew" occurrence
with chapter/paragraph coordinates from both files and matching 1:1 by
location, not by count or by the most quotable instance. Zero unmatched
title-class occurrences in either direction; "cursed" no longer appears
anywhere in the candidate.

## Relationship to currently-live text

A paragraph-level diff against the current live
`taming-of-the-shrew-modern-en.json` shows the accepted text differs in
11 of 1021 paragraphs (the 9 round-1/2 fixes, the round-3 quantity fix,
and the round-3/5 epithet-consistency fixes across 5 locations, one of
which — Hortensio's line — was only completed in round 5).

## Audio invalidation

No English audio currently exists for `taming-of-the-shrew`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`. Of
note: the archaic adjective sense of "curst" (= ill-tempered, distinct
from the fixed epithet "Katherine the curst") is deliberately modernized
to "vicious"/"shrewish"/"play the shrew"/etc. at 7 further locations —
documented explicitly so a future pass does not mistake the resulting
count asymmetry (12 "curst" tokens in source vs. 5 in candidate) for a
missed fix.

## Process lesson carried forward

Sweeping a recurring fixed epithet/phrase for consistency must extract
every occurrence with chapter/paragraph coordinates from both source and
candidate and match 1:1 by location — keying on the most quotable or
memorable instance (as rounds 1-3 effectively did) can hide a
neighboring occurrence for multiple rounds even when the reviewer
believes the sweep was exhaustive.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
