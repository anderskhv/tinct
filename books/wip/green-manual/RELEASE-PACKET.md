# Release Packet — The Manual (Epictetus, *Enchiridion*)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-manual/candidate.json`
- **Target live path:** `app/public/data/editions/the-manual-modern-en.json`
- **Accepted sha256:** `f2791351f992aca8951eca00aa33c636bc752edac66c08e87bedcc6b90de12a7`
- **Structure:** 52 chapters/sections, matches `source.json` (George Long
  translation) at every chapter and paragraph-count index. Registry entry
  for `the-manual` already exists in `app/src/data/bookRegistry.ts` (this
  book was already live pre-programme, using a different, pre-repair
  modern-en text — see "Relationship to currently-live text" below).

## Validation / review evidence

All evidence lives in `books/wip/green-manual/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1-sections1-18.md` | Round-1 fidelity, packet 1 |
| `fidelity-review-1-sections19-35.md` | Round-1 fidelity, packet 2 |
| `fidelity-review-1-sections36-52.md` | Round-1 fidelity, packet 3 |
| `fidelity-review-2.md` | Round-2 fidelity re-check (post round-2 fix) |
| `accessibility-review-2.md` | Round-2 fresh accessibility re-check |
| `round3-verification.md` | Round-3 independent re-verification (8 targeted sections) |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts by round, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: 3 independent packeted fidelity reviews + 1 blind
accessibility review (round 1); fidelity + accessibility re-check (round
2); targeted fix + independent re-verification (round 3); whole-book
non-sampled fidelity and accessibility re-read (final). No sampling at
any stage — every section was read in full at least once per review type.

## Relationship to currently-live text

`the-manual-modern-en.json` is **already live** in the app (registered in
`bookRegistry.ts`, published pre-programme) but its current live content
predates this repair effort and has **not** been through
`TRANSLATION_PROTOCOL.md`'s acceptance procedure. A paragraph-level diff
against the current live file shows the accepted text differs in 65 of 68
paragraphs (i.e. nearly the entire book) — this is a near-total-book
replacement, not an incremental patch. The release owner should treat this
as swapping in a new, fully-reviewed edition rather than merging a partial
change.

## Audio invalidation

No English audio currently exists for `the-manual` (`app/public/audio/`
has no directory for this book id). There is nothing to invalidate —
audio generation from the accepted text (once handed off) will be a
first-time generation, not a re-generation. `accepted-paragraph-hashes.tsv`
is provided regardless, as the baseline hash set for detecting future
text drift once audio does exist.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `the-manual-modern-en.json` has not been
touched — the release owner performs the actual file swap.

## Known, deliberately-preserved limitations (see ACCEPTANCE-RECORD.md for full reasoning)

- Section 47's "Do not embrace statues" is left unglossed (no accurate
  gloss constructible without inventing unverified historical specifics).
- Section 29 has one minor word-choice residual ("dislike things").
- A handful of proper names (Diogenes/Heraclitus, Polynices/Eteocles,
  Chrysippus, Anytus/Melitus/Crito) are left unglossed; each is judged to
  carry sufficient sense from context.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
