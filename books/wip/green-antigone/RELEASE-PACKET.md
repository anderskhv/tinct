# Release Packet — Antigone (Sophocles)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-antigone/candidate.json`
- **Target live path:** `app/public/data/editions/antigone-modern-en.json`
- **Accepted sha256:** `67d8ba62af31154733c3c6ccc8242f58d9f261e8738db4865e0ae91ff55b26ab`
- **Structure:** 11 chapters, 318 paragraphs, matches `source.json`
  exactly. This book was already live in
  `app/src/data/bookRegistry.ts`'s `BOOKS` export pre-programme.
  `antigone-threads.json` already exists — unlikely to be affected (all
  changed paragraphs are wording-level fidelity/glossing fixes, no plot/
  character changes).

## Validation / review evidence

All evidence lives in `books/wip/green-antigone/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 packeted fidelity review with whole-chapter re-reads |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, the caught-and-reverted gloss finding, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: structural check; 1 blind accessibility review + 1
packeted fidelity review with full 318-paragraph coverage and
whole-chapter re-reads (round 1, ACCEPT WITH FIXES REQUIRED — zero
blocking defects, 5 non-blocking notes, all fixed); a combined
fidelity+accessibility fix pass; **an independent re-verification pass
that caught 6 paragraphs where accessibility glosses had crossed into
inventing mythological identities the source deliberately withholds**
(reverted); a corrective fix pass; final whole-book non-sampled fidelity
+ accessibility pass. No sampling at any stage.

## Notable finding — read before publishing

An intermediate gloss pass named several classical figures (Niobe,
Lycurgus, the sons of Phineus, Cleopatra, Demeter) that Sophocles'
Chorus deliberately leaves unnamed as riddling allusions — a real
fidelity violation (inventing content / resolving deliberate ambiguity),
caught by independent verification before acceptance and reverted. This
is recorded in full in `ACCEPTANCE-RECORD.md`. The accepted text leaves
these figures unnamed, matching source, the same treatment this
programme gave the sibling Oedipus plays' unnamed-Sphinx references.

## Relationship to currently-live text

A paragraph-level diff against the current live `antigone-modern-en.json`
shows the accepted text differs in 16 of 318 paragraphs.

## Audio invalidation

No English audio currently exists for `antigone` (`app/public/audio/`
has no directory for this book id). Nothing to invalidate — audio
generation from the accepted text will be a first-time generation.
`accepted-paragraph-hashes.tsv` is the baseline hash set for detecting
future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `antigone-modern-en.json` has not been
touched — the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

- Several mythological figures in the choral odes remain deliberately
  unnamed, matching source's own riddling rhetorical choice (see
  "Notable finding" above).
- Ch10's CHORUS/CHORUS speaker-attribution oddity is inherited from the
  source and correctly reproduced as-is — fidelity-anchor behavior, not
  a candidate defect.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
