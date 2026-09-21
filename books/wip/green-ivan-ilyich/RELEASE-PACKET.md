# Release Packet — The Death of Ivan Ilyich (Tolstoy)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-ivan-ilyich/candidate.json`
- **Target live path:** `app/public/data/editions/ivan-ilyich-modern-en.json`
- **Accepted sha256:** `2132e58a400175fa679ecd5e811d66d4bd89fa9ce3b1f12270f004a62b311cbc`
- **Structure:** 12 chapters, 298 paragraphs, matches `source.json`
  (a public-domain English translation, likely Maude's, no explicit
  credit in the file) exactly. `ivan-ilyich-original-ru.json` (Russian
  original) and `ivan-ilyich-threads.json` also exist; the English
  translation was the sole locked fidelity anchor, per programme rules
  on non-English sources.
- Old, unreviewed draft chunks exist at `books/wip/ivan-ilyich-en/` and
  `-da/` — confirmed NOT used as a source for this work.

## Validation / review evidence

All evidence lives in `books/wip/green-ivan-ilyich/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `ACCEPTANCE-RECORD.md` | Full 3-round coverage table, defect counts, deliberately-preserved items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

**This book took 3 rounds.** Round 1's "whole-book proper-noun audit"
was count-based (checking a name appears N times total) rather than
location-based (checking every occurrence's specific spot matches
source), which let one instance of the very defect class it claimed to
fix survive undetected. Round 3's verification built a genuine
location-by-location occurrence map for 30+ recurring names/terms before
accepting — that method is worth reusing for future books in this
programme, since a total-count match does not prove nothing moved.

## Content note for release owner

This novella depicts physical and psychological decline toward death
with deliberate, unflinching honesty — every review round specifically
checked this content for softening (following the Gilgamesh failure
pattern elsewhere in this batch) and confirmed it renders at full force
throughout, including the three-days-of-screaming climax.

## Relationship to currently-live text

A paragraph-level diff against the current live `ivan-ilyich-modern-en.json`
shows the accepted text differs in 43 of 298 paragraphs.

## Audio invalidation

No English audio currently exists for `ivan-ilyich`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`:
several French social-register phrases left untranslated (period
upper-class code-switching, the point is inaccessibility to servants/
lower classes); one diacritic gap-fill; the son's Vasya/Vladimir naming
inconsistency reproduced as-is (matches source); a handful of unglossed
period proper nouns; source's own typos preserved rather than silently
corrected.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
