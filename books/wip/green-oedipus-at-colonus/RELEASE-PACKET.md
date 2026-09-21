# Release Packet — Oedipus at Colonus (Sophocles)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-oedipus-at-colonus/candidate.json`
- **Target live path:** `app/public/data/editions/oedipus-at-colonus-modern-en.json`
- **Accepted sha256:** `5da99c2a47365f578fd45d5d930b8aff3dfd57f50f987b11e950a320887862ff`
- **Structure:** 11 chapters, 566 paragraphs, matches `source.json`
  exactly. This book was already live in
  `app/src/data/bookRegistry.ts`'s `BOOKS` export pre-programme.
  `oedipus-at-colonus-threads.json` already exists — unlikely to be
  affected (all 8 changed paragraphs are minor fidelity/glossing fixes,
  no plot/character changes).

## Validation / review evidence

All evidence lives in `books/wip/green-oedipus-at-colonus/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 packeted fidelity review with whole-play cross-boundary re-read |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: structural check; 1 blind accessibility review + 1
packeted fidelity review with full 566-paragraph coverage and a
whole-play cross-boundary re-read (round 1, ACCEPT WITH FIXES REQUIRED —
2 minor non-blocking defects, both fixed); accessibility glossing fix
pass (7 paragraphs) + independent fidelity re-check of all 9 fixed
paragraphs; final whole-book non-sampled fidelity + accessibility pass.
No sampling at any stage.

## Book-specific note for release owner

This play's central device is a withheld mystery: the exact manner of
Oedipus's death/disappearance is never shown or fully described in the
source, and every review round specifically checked that no edit
resolves or adds detail to that mystery. All rounds confirm it remains
genuinely open in the accepted text ("no one knows except Theseus... he
was simply taken... or else some gentle, painless opening of the
earth").

## Relationship to currently-live text

A paragraph-level diff against the current live
`oedipus-at-colonus-modern-en.json` shows the accepted text differs in
only 8 of 566 paragraphs — 2 fidelity fixes, 7 accessibility glosses (one
paragraph carried both a fidelity fix and content already counted).

## Audio invalidation

No English audio currently exists for `oedipus-at-colonus`
(`app/public/audio/` has no directory for this book id). Nothing to
invalidate — audio generation from the accepted text will be a
first-time generation. `accepted-paragraph-hashes.tsv` is the baseline
hash set for detecting future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `oedipus-at-colonus-modern-en.json` has not
been touched — the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

- Ch2's manuscript-lacuna markers ("[Text lost in manuscript.]") are
  inherited from the source and not resolved with invented text.
- Ch9's Seven-Against-Thebes-style catalogue density is treated as
  deliberate rhetorical effect, same as the sibling Oedipus Rex play's
  kings-list, not simplified.
- Ch3/Ch5's speaker-label anomaly (consecutive identical speaker tags
  that don't quite match sense) is inherited from the source and
  correctly reproduced as-is — fidelity-anchor behavior, not a candidate
  defect.
- Ch11's kommos (lament) stichomythia is a deliberate Greek dramatic
  convention, not a translation flaw.
- One softened image, two likely-OCR-typo place-name normalizations, and
  one minor nuance shift remain from round-1 fidelity's non-blocking
  notes.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
