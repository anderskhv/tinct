# Release Packet — The Prince (Machiavelli)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-the-prince/candidate.json`
- **Target live path:** `app/public/data/editions/the-prince-modern-en.json`
- **Accepted sha256:** `fbdf701292f34f01d5c0af0aad55975853de0157a3260ad3ebde164cfb7d1589`
- **Structure:** 27 chapters, 254 paragraphs, matches `source.json`
  (English translation) exactly. This book was already live in
  `app/src/data/bookRegistry.ts`'s `BOOKS` export pre-programme.
  `the-prince-original-it.json` (Italian original) also exists but was
  not the review anchor — the English translation served as the locked
  fidelity source per `books/AGENTS.md`'s non-English-source rule.

## Validation / review evidence

All evidence lives in `books/wip/green-the-prince/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1.md` | Round-1 fidelity review (8 silent-correction defects found) |
| `fidelity-review-2-name-sweep.md` | Round-2 independent sweep (15 more instances) |
| `ACCEPTANCE-RECORD.md` | Full round-by-round coverage table, defect counts, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: structural check; 1 blind accessibility review + 1
fidelity review with full 254-paragraph coverage (round 1); **five
successive independent proper-noun/quoted-wording sweeps**, each
catching instances the prior sweep(s) missed (8 + 15 + 3 + 5 + 2 = 33
total silent-correction instances found and fixed); accessibility
glossing fix pass (6 terms); final whole-book non-sampled fidelity +
accessibility pass. No sampling at any stage.

## Notable finding — read before publishing

This book required unusually many review passes to fully catch its one
defect class: a systematic silent normalization of proper nouns and
quoted foreign-language wording toward modern standard spelling
(Sinigalia->Sinigaglia, Forli->Forlì, Vaila->Vailà, Nicolo->Niccolò,
Bernabo->Bernabò, Ætolians->Aetolians, and diacritic drift in two Italian
verse quotations — the Petrarch "Italia mia" excerpt and a Latin epigraph
with its English verse translation). Every instance was reverted to the
locked source's own printed form, per this programme's rule against
silently substituting wording from another source even for a name or
quotation the drafter recognizes. This is recorded in full, honestly, in
`ACCEPTANCE-RECORD.md` — the repeated-miss pattern is a real signal about
how this book was originally drafted (likely a global "correct historical
spellings" pass at some point), not a criticism of any single review
round. **If other books in this or a future batch share drafting
history with this one, the release owner may want to spot-check them for
the same defect class.**

## Relationship to currently-live text

A paragraph-level diff against the current live `the-prince-modern-en.json`
shows the accepted text differs in 31 of 254 paragraphs.

## Audio invalidation

No English audio currently exists for `the-prince` (`app/public/audio/`
has no directory for this book id). Nothing to invalidate — audio
generation from the accepted text will be a first-time generation.
`accepted-paragraph-hashes.tsv` is the baseline hash set for detecting
future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `the-prince-modern-en.json` has not been
touched — the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

- Footnote-style biographical asides interrupt narrative without warning
  — a structural/typographic pattern, not fixable by text edit within
  the locked paragraph structure; flagged as a formatting note for the
  release owner.
- Long clause-stacked sentences remain in the densest historical chapters
  (Ch.3's Roman-emperors catalogue, parts of "Chapter 19").
- ~6 period/technical terms (sanjaks, condottieri, Guelph/Ghibelline,
  hectic fever, Soldan, Praetor) are glossed at first occurrence only,
  per protocol norms against repetitive glossing.
- Source's own internal spelling inconsistency (e.g. "Allesandria" in one
  paragraph, "Alessandria" in another) is faithfully preserved
  per-paragraph rather than normalized across the book.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.
