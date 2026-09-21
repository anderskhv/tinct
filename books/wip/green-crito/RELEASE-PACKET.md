# Release Packet — Crito (Plato)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-crito/candidate.json`
- **Target live path:** `app/public/data/editions/crito-modern-en.json`
- **Accepted sha256:** `511340f43167c290d35cfe89618a07a3afca812412b6b7eefcd69b67f8012ac5`
- **Structure:** 3 chapters, 25/61/9 paragraphs, matches `source.json`
  (Jowett translation) exactly. Registry entry for `crito` was not
  confirmed present in `app/src/data/bookRegistry.ts`'s live `BOOKS`
  export during screening (unlike the original ten candidates) — the
  release owner should verify registry status before publishing.

## Validation / review evidence

All evidence lives in `books/wip/green-crito/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review (full 95-paragraph coverage) |
| `round2-fidelity-verification.md` | Round-2 independent fidelity re-check (11 fixed paragraphs + full chapter-2 recheck) |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts by round, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: 1 blind accessibility review + 1 packeted fidelity
review with whole-book re-read (round 1); fidelity fix + independent
re-verification including a full non-sampled chapter-2 content-level
recheck for dropped/duplicated paragraphs (round 2); accessibility fix
pass; final whole-book non-sampled fidelity + accessibility pass. No
sampling at any review stage.

## Notable finding

Round-1 fidelity review caught one isolated instance of the same
dropped/duplicated-paragraph defect family that disqualified a sibling
book (Apology) from this programme — source paragraph 2.9 was replaced
with a duplicate of 2.11. A full chapter-2 content-level recheck (all 61
paragraphs, not just speaker-tag alignment) confirmed this was an
isolated defect, not systemic, so it was fixed rather than disqualifying
the book. The release owner does not need to take any action on this —
it's noted here as this book's most significant defect history for
context.

## Relationship to currently-live text

A paragraph-level diff against the current live `crito-modern-en.json`
shows the accepted text differs in 14 of 95 paragraphs. This is a
partial-update profile (most of the book was already sound), unlike The
Manual's near-total replacement.

## Audio invalidation

No English audio currently exists for `crito` (`app/public/audio/` has
no directory for this book id). Nothing to invalidate — audio generation
from the accepted text will be a first-time generation.
`accepted-paragraph-hashes.tsv` is the baseline hash set for detecting
future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `crito-modern-en.json` has not been touched —
the release owner performs the actual file swap and confirms/adds the
registry entry and taxonomy classification (House/Shelf/form/era) if not
already present.

## Known, deliberately-preserved limitations

- Ch1 P14's Delos-ship religious/mythological significance is not
  explained (practical consequence is still clear).
- Ch2 P6's Simmias/Cebes names are unframed.
- Ch3 P2's nested quotation structure (Socrates narrating / the Laws'
  quoted words / Socrates' imagined reply) requires attentive reading.
- Editorial cross-reference policy: Jowett's own scholarly
  cross-references (`compare Apol.`, etc.) are dropped throughout as
  translator apparatus, not part of the dialogue itself.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
