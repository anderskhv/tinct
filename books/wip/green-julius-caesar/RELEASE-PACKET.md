# Release Packet — Julius Caesar (Shakespeare)

Prepared for handoff to the publication/release owner. Content-only lane;
no app code, registry, deploy, or audio-generation changes.

## Replacement artifact

- **Accepted file:** `books/wip/green-julius-caesar/candidate.json`
- **Target live path:** `app/public/data/editions/julius-caesar-modern-en.json`
- **Accepted sha256:** `be475cf9c2b8ed2b85be22d8a1f8cb9bb1a89332e31bf390e1272323c02f52b9`
- **Structure:** 18 chapters, 997 paragraphs, matches `source.json`
  exactly. `julius-caesar-threads.json` already exists — unlikely
  affected.

## Validation / review evidence

All evidence lives in `books/wip/green-julius-caesar/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, deliberately-preserved items, final hash, independent-verification note |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 for audio invalidation |

One correction round only — a genuinely clean book. Fixed 5 paragraphs:
source's own real "Antonius"/"Antony" spelling variation (flattened to
"Antony" everywhere, including one spot where a vocative name was
dropped entirely) and softened violent imagery in Antony's funeral
prophecy ("infants cut to pieces" restored to "infants quartered with
the hands of war"; "bodies of the dead" restored to "carrion men").
Independent Opus verification built a location-keyed occurrence map for
the Antonius/Antony split (including checking for an all-caps
speaker-tag form, since a sibling book in this batch had exactly that
gap) and did its own word-for-word read of the assassination scene and
all of Act 5's deaths — found nothing further.

## Relationship to currently-live text

A paragraph-level diff against the current live `julius-caesar-modern-en.json`
shows the accepted text differs in only 5 of 997 paragraphs.

## Audio invalidation

No English audio currently exists for `julius-caesar`. Nothing to
invalidate. `accepted-paragraph-hashes.tsv` is the baseline hash set for
future drift detection.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation.

## Known, deliberately-preserved limitations

Documented with reader-centered reasons in `ACCEPTANCE-RECORD.md`:
allusion density in several set-piece speeches (Cassius's Tiber speech,
Brutus's serpent's-egg soliloquy, Antony's funeral oration) left as-is —
the difficulty is inherent to the content, not the wording, and
rebuilding it would mean adding explanatory content source doesn't
license. Frank/coarse period content preserved throughout.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
