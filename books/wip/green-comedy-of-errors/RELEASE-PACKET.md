# Release Packet — The Comedy of Errors (Shakespeare)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-comedy-of-errors/candidate.json`
- **Target live path:** `app/public/data/editions/comedy-of-errors-modern-en.json`
- **Accepted sha256:** `5d00ae65df86709d93c51a10f8d6643a29344641ec467f421e7bf69df7574bcd`
- **Structure:** 11 chapters (acts/scenes), 690 paragraphs, matches
  `source.json` exactly. This book was already live in
  `app/src/data/bookRegistry.ts`'s `BOOKS` export pre-programme.
  `comedy-of-errors-threads.json` already exists — release owner should
  confirm it's still consistent with any changed lines (unlikely to be
  affected; the 2 changed paragraphs are minor phrasing fixes, not
  plot/character changes).

## Validation / review evidence

All evidence lives in `books/wip/green-comedy-of-errors/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1-acts-1-3.md` | Round-1 fidelity, chapters 1-6 |
| `fidelity-review-1-acts-4-5.md` | Round-1 fidelity, chapters 7-11 |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: structural apparatus-pollution check; 1 blind
accessibility review + 1 packeted fidelity review with full 690-paragraph
coverage across both acts-1-3 and acts-4-5 packets (round 1); fix pass (2
paragraphs); final whole-book non-sampled fidelity + accessibility pass,
including a specific check that the play's twin-pair speaker attribution
(the whole plot depends on two sets of identical twins) stays correct
throughout. No sampling at any stage.

## Notable finding

Round-1 fidelity review caught a directional inversion in a wordplay line
(Ch9 P4/index 3): the candidate had Dromio ask whether Antipholus had
"gotten rid of" a figure representing the arresting officer, when the
source line asks whether he'd *encountered* him — inverting the joke's
logic. Fixed and independently re-verified against the immediate
follow-up dialogue, which confirms the encounter reading.

## Relationship to currently-live text

A paragraph-level diff against the current live
`comedy-of-errors-modern-en.json` shows the accepted text differs in only
2 of 690 paragraphs — this book's live modern-en was already close to
accept-ready; only the two fidelity defects found in review needed
correction.

## Audio invalidation

No English audio currently exists for `comedy-of-errors`
(`app/public/audio/` has no directory for this book id). Nothing to
invalidate — audio generation from the accepted text will be a
first-time generation. `accepted-paragraph-hashes.tsv` is the baseline
hash set for detecting future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `comedy-of-errors-modern-en.json` has not been
touched — the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

8 optional-polish spots noted in round-1 accessibility review, all
reconfirmed non-blocking on the final pass: Ch1 P6 (pronoun tracking
across two twin pairs), Ch2 P30 ("permissive sins" slightly awkward
grammar), Ch6 P50/P52 (unglossed historical allusions), Ch8 P22 (idiom
pileup in a sergeant description), Ch11 P146 (extended childbirth
metaphor needs a beat to parse), Ch6 P68 ("vain"->"silly", a defensible
modernization avoiding the false-friend modern sense of "vain").

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
