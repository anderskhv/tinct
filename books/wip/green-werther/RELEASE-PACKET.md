# Release Packet — The Sorrows of Young Werther (Goethe)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-werther/candidate.json`
- **Target live path:** `app/public/data/editions/werther-modern-en.json`
- **Accepted sha256:** `a87ec745866e26592189703bd0ef6cc13c957040ccc6c96ffef87ec8b602ada3`
- **Structure:** 84 chapters (Preface, 82 dated epistolary letters, "The
  Editor to the Reader" closing narrative), 354 paragraphs, matches
  `source.json` (public-domain English translation) exactly. This book
  was already live in `app/src/data/bookRegistry.ts`'s `BOOKS` export
  pre-programme. `werther-original-de.json` (German original) also
  exists but was not the review anchor — the English translation served
  as the locked fidelity source per `books/AGENTS.md`'s non-English-
  source rule. `werther-threads.json` already exists — unlikely to be
  affected (all 11 changed paragraphs are wording-level fixes, no plot/
  character changes).

## Validation / review evidence

All evidence lives in `books/wip/green-werther/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review (all 84 chapters) |
| `fidelity-review-1-partA.md` through `-partD.md` | Round-1 packeted fidelity review (all 354 paragraphs, 4 parts, part D includes whole-book summary) |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: structural check; 1 blind accessibility review + 1
four-part packeted fidelity review with full 354-paragraph coverage
(round 1, ACCEPT WITH FIXES REQUIRED — 1 blocking + 3 non-blocking
defects, all fixed); accessibility glossing fix pass (7 paragraphs,
independently spot-checked); final whole-book non-sampled fidelity +
accessibility pass. No sampling at any stage. Note: this is the largest
book in the batch (84 chapters), and one of the cleanest otherwise — the
review found no actor swaps, negation/causality errors, or silent
factual corrections anywhere outside the 4 flagged locations.

## Notable finding — read before publishing

The one blocking defect (ch84 p87) was an unlicensed simile in Werther's
final letter ("...as the feeling of his God's grace slowly fades from
the heart of the believer... through holy and visible signs") that is
**not** in the locked English-translation source but **does** appear in
the fuller original German text and in some other translations —
evidence the drafter imported wording from outside the chosen anchor.
This has been removed and the passage restored to the locked source's
plainer ending. This is a useful signal for the release owner: if other
books share this drafting history, they may be worth a similar check for
imported-translation content.

## Relationship to currently-live text

A paragraph-level diff against the current live `werther-modern-en.json`
shows the accepted text differs in only 11 of 354 paragraphs — 4
fidelity fixes, 7 accessibility glosses.

## Audio invalidation

No English audio currently exists for `werther` (`app/public/audio/` has
no directory for this book id). Nothing to invalidate — audio generation
from the accepted text will be a first-time generation.
`accepted-paragraph-hashes.tsv` is the baseline hash set for detecting
future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `werther-modern-en.json` has not been
touched — the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

- Klopstock (Ch.12) left unglossed — the reference's ambiguity is likely
  intentional and the text already glosses it one clause later.
- The Emilia Galotti reference (Ch.84) is glossed only as "a tragedy" —
  its deeper significance to Werther's state of mind is deliberately not
  spelled out, matching the source's own indirection.
- A source-inherited Ossian recitation (Ch.84) is a deliberately more
  archaic register within the story, correctly not flattened to match
  surrounding prose.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
