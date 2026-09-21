# Release Packet — Twelfth Night (Shakespeare)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-twelfth-night/candidate.json`
- **Target live path:** `app/public/data/editions/twelfth-night-modern-en.json`
- **Accepted sha256:** `2388962f1d10a2619b72d9e47f74f4b695abe9eeb87bb9bd4d235c9e4c8b7374`
- **Structure:** 18 chapters, 1120 paragraphs, matches `source.json`
  exactly.

## Validation / review evidence

All evidence lives in `books/wip/green-twelfth-night/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `PARKED-RESOLVED.md` | Full park history (rounds 2-3) and how it was resolved |
| `ACCEPTANCE-RECORD.md` | Full 4-round coverage table, defect list, deliberately-preserved items, final hash, model/settings notes |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

Four rounds. Round 1 fixed 3 defects (an imported scholarly emendation,
a meaning reversal, a silently-corrected malapropism) and wrongly
self-certified clean. Round 2 (independent Opus verification) found
round 1's own paragraph-index citations were off-by-one throughout and
found 12 more defects in one recurring class: proper nouns replaced by
generic descriptors, source's own deliberate non-standard spellings
silently normalized to the "correct" form, and deliberate
malapropisms/coinages "corrected" to plain words — parking the book at
2 of 3 rounds. Round 3 fixed all 12 plus found and fixed 1 more of the
same class via a rare-word cross-reference method (Sir Toby's
"cubiculo" coinage). Round 4 (final independent Opus verification, the
book's confirming round after exhausting its 3 nominal correction
rounds) re-derived every fix from source fresh, ran its own
location-keyed sweep for the same defect class using an independent
methodology, an independent compression sweep, and a word-for-word read
of scenes not yet exhaustively covered by prior rounds — found nothing
further and accepted.

## Relationship to currently-live text

A paragraph-level diff against the current live
`twelfth-night-modern-en.json` shows the accepted text differs in 17 of
1120 paragraphs (3 round-1 fixes + 13 round-2/3 fixes + 1 round-3
additional find).

## Audio invalidation

No English audio currently exists for `twelfth-night`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`. Of
note: two borderline defects (Sir Toby's "Tilly-vally!" exclamation and
Feste's Latin "vox" wordplay) were restored to source's exact wording
after judgment calls documenting why each is load-bearing for its joke,
rather than defaulted to either restoration or modernization.

## Process lesson carried forward (see also Merchant of Venice, Coriolanus)

The "erasure of source's own printed forms" defect class — proper
nouns/spellings/malapropisms silently normalized to a standard form —
proved to need a higher-recall detection method (a rare-word or
capitalized-token cross-reference against the whole book) than a
proper-noun/epithet occurrence map alone, since not every instance is a
name or a repeated epithet (e.g. "cubiculo" is neither).

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
