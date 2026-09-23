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

## Publication status — 2026-09-23 (supersedes earlier status lines in this packet)

**State: Publication handoff. NOT published.** The live
`app/public/data/editions/julius-caesar-modern-en.json` and
`https://tinct.app/data/editions/julius-caesar-modern-en.json` still serve the old
text. Both were verified at the pre-programme hash on 2026-09-23.

- **Candidate:** `books/wip/green-julius-caesar/candidate.json`
- **Destination:** `app/public/data/editions/julius-caesar-modern-en.json`
- **Accepted sha256 (publish exactly this):** `be475cf9c2b8ed2b85be22d8a1f8cb9bb1a89332e31bf390e1272323c02f52b9`

### Verification of the accepted candidate (2026-09-23)

- `candidate.json` sha256 is `be475cf9…2f52b9`. It is unchanged since the file was committed in `da0018d4`, and the acceptance was recorded afterwards in `656fdbfe`.
- Structure: 18/18 chapters and 997/997 paragraphs. Numbers, titles and sections match `source.json`, which is byte-identical to the served original-en.
- All 997 entries in `accepted-paragraph-hashes.tsv` match the file.
- The diff against the live edition is exactly the 5 recorded paragraphs: 2.6, 2.8, 2.52, 3.6 and 8.99. They contain "Antonius" (and the vocative restored at 2.8), "quartered with the hands of war" and "carrion men".
- An independent re-sweep found no remaining proper-noun normalization. The residual flags were only possessive and contraction modernization and ordinary spelling ("Honorable").
- **Tracker inconsistency resolved.** `SECOND-BATCH-TRACKER.md` had two rows for Julius Caesar: "#8 … queued / Screening done" and a trailing "#7 … Text accepted". The first is stale, from the pool selection before work started. The second collides with #7 Taming of the Shrew. The acceptance is supported by `ACCEPTANCE-RECORD.md`: Sonnet repair, then independent Opus verification with a location-keyed Antonius/Antony map, a word-for-word read of the assassination and the Act 5 deaths, and a check of more than 60 proper nouns. The tracker now has one row, #8, marked Text accepted.
- No additional repairs were needed. The accepted text is preserved unchanged.

### Why it is not published: blocking dependency outside the content remit

The candidate cannot be published by swapping the edition file alone. The
book has a released character package, `app/public/data/characters/julius-caesar.v1.json`,
listed in `characterReleases` in `app/src/services/characters/characterCards.ts`.
The package's `editions["modern-en"]` block is pinned to the served edition's
bytes: `sourceSha256`, per-chapter `paragraphHashes`, and UTF-16 mention
offsets whose `text` must match the served paragraph exactly.

`verifyCharacters()` fails closed on any mismatch, so swapping the edition
alone removes every character card from the modern-en reader. It also turns
`src/services/characters/characterReleases.test.ts` red, and the Deploy
workflow runs that test. This was confirmed by running the suite on
2026-09-23 with the candidate in place.

The established process for re-publishing a package (the Meditations
precedent, 2026-09-12.2) has two parts:
- re-anchoring the package with a script, which would be new tooling;
- bumping `characterReleases[bookId].revision`, which is an application-code
  change.

Both are outside this lane, so the publication step stopped here, as
instructed.

**Outstanding actions for the release owner, in order:**

1. Copy the candidate byte-for-byte to the target path.
2. Re-anchor `editions["modern-en"]` in the character package against the
   new bytes. Set `sourceSha256` to the accepted hash. Recompute
   `paragraphHashes` using `normalizeParagraph` (runs of spaces collapsed,
   newlines turned into spaces) and sha256. Recompute the offsets of
   mentions in the changed paragraphs, and handle the mention texts that no
   longer occur (listed below). Card descriptions and figures stay unchanged.
   Under-anchor rather than guess.
3. Bump `characterReleases['julius-caesar'].revision` in `characterCards.ts`.
4. `npm test` must be green, especially `characterReleases.test.ts`. Then
   merge to `main`, which runs the Deploy workflow with `npm run deploy` and
   the smoke test.
5. Verify live: the sha256 of
   `https://tinct.app/data/editions/julius-caesar-modern-en.json` must equal the
   accepted hash, and the chapter and paragraph counts must match.
6. Audio: English Kokoro audio exists in R2 for this edition. For example,
   `/api/audio-manifest?path=julius-caesar/modern-en/ch1/manifest.json` returns 200.
   Per `books/AGENTS.md` (QA Gates → audio), the changed paragraphs below
   need regenerated audio and manifests before the book counts as final.
   That work needs GPU spend and the audio lane, and neither was done here.

**Character-package impact:** 12 mentions sit in the 5 changed paragraphs. Of those, 4 have `text` "Antony" at the locations where the source reads "Antonius" (2.6, 2.8, 2.52, 3.6). They need re-anchoring to "Antonius" or dropping.

**Changed paragraphs relative to live (for audio regeneration and
re-anchoring):** ch2: 6,8,52; ch3: 6; ch8: 99 (5 paragraphs, 0-based)
