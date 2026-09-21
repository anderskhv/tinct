# Release Packet — Oedipus Rex (Sophocles)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-oedipus-rex/candidate.json`
- **Target live path:** `app/public/data/editions/oedipus-rex-modern-en.json`
- **Accepted sha256:** `0d6ab07adf4ef49de09d9ae8234b9be973568c55400ab06a83c91a67e80f9998`
- **Structure:** 11 chapters (Prologue, Parodos, four Episodes, four
  Stasima, Exodos), 474 paragraphs, matches `source.json` exactly. This
  book was already live in `app/src/data/bookRegistry.ts`'s `BOOKS`
  export pre-programme. `oedipus-rex-threads.json` already exists —
  unlikely to be affected (all 7 changed paragraphs are choral-ode
  glosses, no plot/character changes).

## Validation / review evidence

All evidence lives in `books/wip/green-oedipus-rex/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 packeted fidelity review with cross-boundary re-read |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: structural check; 1 blind accessibility review + 1
packeted fidelity review with full 474-paragraph coverage and a
cross-boundary re-read (round 1, fidelity ACCEPT AS-IS with zero
blocking defects); accessibility glossing fix pass (7 paragraphs) +
independent fidelity re-check; final whole-book non-sampled fidelity +
accessibility pass. No sampling at any stage.

## Book-specific note for release owner

This is verse tragedy built on dramatic irony — every review round was
specifically instructed to check that hedges, partial knowledge, and
withheld information (Jocasta's false confidence, Oedipus's foreboding
language, Teiresias's fate-hedges) are preserved rather than flattened.
All rounds confirm this is intact. Accessibility glosses added are
purely factual mythological identifications (which god an epithet
refers to) — none touch plot-relevant uncertainty.

## Relationship to currently-live text

A paragraph-level diff against the current live `oedipus-rex-modern-en.json`
shows the accepted text differs in only 7 of 474 paragraphs — all light
glosses for unglossed mythological references in the choral odes; round-1
fidelity was ACCEPT AS-IS from the start, no fidelity fixes needed.

## Audio invalidation

No English audio currently exists for `oedipus-rex` (`app/public/audio/`
has no directory for this book id). Nothing to invalidate — audio
generation from the accepted text will be a first-time generation.
`accepted-paragraph-hashes.tsv` is the baseline hash set for detecting
future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `oedipus-rex-modern-en.json` has not been
touched — the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

- Ch1 P2's unnamed Sphinx ("that cruel songstress") — deliberate dramatic
  economy, not resolved.
- Ch1 P40's counterfactual parenthetical and Ch3 P2's "if...but if...but
  if" legal-conditional structure — dense but coherent, not simplified.
- Ch3 P116's "mountebank"/"tricksy" — uncommon but inferable vocabulary.
- Ch3 P132's stacked kinship terms — deliberately riddle-like by design,
  not simplified.
- Ch7's long autobiographical paragraph and Ch11's apostrophe passage —
  paragraph-structure density; paragraph count is locked to source, so
  no restructuring is possible.
- Ch10 P2's "the vulture-maid" (the Sphinx) left unglossed — by that
  point in the play she has already been named/alluded to twice; naming
  her again would flatten a deliberate choral device.
- Two non-blocking hedge-word softenings from round-1 fidelity, neither
  affecting plot fact or the irony mechanism.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
