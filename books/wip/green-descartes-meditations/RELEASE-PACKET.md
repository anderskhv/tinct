# Release Packet — Meditations on First Philosophy (Descartes)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-descartes-meditations/candidate.json`
- **Target live path:** `app/public/data/editions/descartes-meditations-modern-en.json`
- **Accepted sha256:** `8eb4d6b5409f23a2355d39a8cb712937b54876a34afae96e05b0fe40dd33c490`
- **Structure:** 9 chapters (Letter of Dedication, Preface, Synopsis,
  Meditations 1-6), paragraph counts 7/7/6/12/16/39/17/16/24, matches
  `source.json` (John Veitch translation, 1853/1901, public domain)
  exactly. This book was already live in `app/src/data/bookRegistry.ts`'s
  `BOOKS` export pre-programme (confirmed during screening).

## Validation / review evidence

All evidence lives in `books/wip/green-descartes-meditations/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1-ch1-5.md` | Round-1 fidelity, chapters 1-5 |
| `fidelity-review-1-ch5-9.md` | Round-1 fidelity, chapters 5-9 |
| `fidelity-review-2.md` | Round-2 independent fidelity re-check (all 16 fixed defects) |
| `accessibility-fix-fidelity-check.md` | Fidelity re-check of the 10-paragraph accessibility fix pass |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, S1-S7 editorial-repair decisions, scripture-quotation policy, deliberately-preserved items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: 2 packeted fidelity reviews + 1 blind accessibility
review (round 1); fidelity fix + independent re-verification (round 2,
ACCEPT AS-IS); accessibility fix pass + independent fidelity re-check
(ACCEPT AS-IS, clean); final whole-book non-sampled fidelity +
accessibility pass. No sampling at any stage.

## Notable findings requiring release-owner awareness

- **Seven silent source repairs (S1-S7)**, documented in
  `ACCEPTANCE-RECORD.md`, fix printer's errors/typos/an unclosed bracket
  in the locked Veitch source (e.g. a dropped "not" at Ch7 P14, a typo'd
  "assert"->"assent" at Ch8 P6). All independently verified correct and
  intentionally kept — not an error to flag downstream, just documented
  editorial judgment.
- **Scripture-quotation policy**: two Biblical quotations in Ch1 P2 (Book
  of Wisdom 13, Romans 1) are kept in traditional/archaic wording while
  surrounding prose is modernized. This is a deliberate, book-specific
  choice, documented in the acceptance record — flagging in case the
  release owner wants a book-series-wide policy on this for future
  scripture-quoting titles.

## Relationship to currently-live text

A paragraph-level diff against the current live
`descartes-meditations-modern-en.json` shows the accepted text differs in
22 of 144 paragraphs — a partial-update profile.

## Audio invalidation

No English audio currently exists for `descartes-meditations`
(`app/public/audio/` has no directory for this book id). Nothing to
invalidate — audio generation from the accepted text will be a
first-time generation. `accepted-paragraph-hashes.tsv` is the baseline
hash set for detecting future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `descartes-meditations-modern-en.json` has not
been touched — the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

- Ch7 P8 and Ch8 P11 are long, dense single-block paragraphs (paragraph
  count is locked to source, so no split is possible); sentence-level
  clarity is good despite paragraph-level density.
- Ch9 P6 is a long additive/inventory paragraph — low-risk density.
- "Hippogryphs" (Ch6 P7) is unglossed but context-supported.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
