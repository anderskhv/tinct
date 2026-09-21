# Release Packet — The Winter's Tale (Shakespeare)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-winters-tale/candidate.json`
- **Target live path:** `app/public/data/editions/winters-tale-modern-en.json`
- **Accepted sha256:** `4c6ee62fec2b1c65230f378574a7c5b6551169e5824e1c9e012fbdea10f6da3d`
- **Structure:** 15 chapters, 911 paragraphs, matches `source.json`
  exactly. `winters-tale-threads.json` already exists — unlikely
  affected.

## Validation / review evidence

All evidence lives in `books/wip/green-winters-tale/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, deliberately-preserved items, final hash, independent-verification note |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

Two rounds. Fixed 2 blocking defects in Act 1 Sc.2: an invented
"Judas's" naming a figure source deliberately leaves unnamed ("his that
did betray the Best"), and an unlicensed addition "with the horns of a
cuckold" not present in source. Independent Opus verification
re-derived both fixes, ran a location-level case-form check on 41
proper nouns, and did its own word-for-word reads of the bear scene,
trial scene, and peddler/sheep-shearing scene's bawdy content — all
confirmed unsoftened.

## Relationship to currently-live text

A paragraph-level diff against the current live `winters-tale-modern-en.json`
shows the accepted text differs in only 2 of 911 paragraphs.

## Audio invalidation

No English audio currently exists for `winters-tale`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`: a
handful of minor word-choice items (a verb added to "the wench tumbling
in the dale," "aunts"->"girls" for period slang, "Affection"->
"Suspicion" narrowing Shakespeare's broader term) — none affect meaning,
names, or content, flagged by the independent verifier as worth noting
but not blocking.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
