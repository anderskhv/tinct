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
fidelity review with full 254-paragraph coverage (round 1); **four
successive independent proper-noun/quoted-wording sweeps**, each
catching instances the prior sweep(s) missed (8 + 15 + 3 + 5 = 31
total silent-correction instances found and fixed, per
`ACCEPTANCE-RECORD.md`; an earlier "five sweeps / 33" figure here was
unsupported by any record and was corrected 2026-09-23); accessibility
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

## Publication status — 2026-09-23 (supersedes earlier status lines in this packet)

**State: Publication handoff. NOT published.** The live
`app/public/data/editions/the-prince-modern-en.json` and
`https://tinct.app/data/editions/the-prince-modern-en.json` still serve the old
text. Both were verified at the pre-programme hash on 2026-09-23.

- **Candidate:** `books/wip/green-the-prince/candidate.json`
- **Destination:** `app/public/data/editions/the-prince-modern-en.json`
- **Accepted sha256 (publish exactly this):** `fbdf701292f34f01d5c0af0aad55975853de0157a3260ad3ebde164cfb7d1589`

### Verification of the accepted candidate (2026-09-23)

- `candidate.json` sha256 is `fbdf7012…d1589`. It is byte-identical to the file committed in `330fc010` ("TEXT ACCEPTED"), and no later commit touched it. The acceptance therefore covers this exact file.
- Structure: 27/27 chapters and 254/254 paragraphs. Per-chapter counts, numbers and titles match `source.json`. `source.json` is byte-identical to the served `the-prince-original-en.json`.
- All 254 entries in `accepted-paragraph-hashes.tsv` match the file.
- Every round-4 correction is present and matches the source's printed form:
  - 9.7 "crudelta"
  - 21.6 `," wrote Fortunati, "` restored
  - 22.8 "rotisya" and "tribu"
  - 18.3 and 18.5, the Latin epigraph and Pitt's verse: no slashes, "pow'rs", ". . ." restored, no added quotes
  - 27.12 Petrarch: "Virtu … Furore Prendera … cuor non e", no slashes
  - 27.13 "valour … brests"
- Earlier rounds' reversions are all present: Sinigalia, Forli, Vaila, Sclavonia, Tribu, Domnia/Bernabo, Nicolo, Ætolians, Amilcar, Citta, and the Allesandria/Alessandria per-paragraph split.
- The 6 accessibility glosses are present: sanjaks, condottieri, Guelph/Ghibelline, hectic fever, Soldan, Praetor.
- An independent re-sweep found zero remaining proper-noun normalizations and zero added diacritics. It used a per-paragraph capitalized-token set-difference with fuzzy matching, plus a scan for non-ASCII letters not present in the aligned source paragraph.
- **Tracker inconsistency resolved.** The tracker and this packet said "33 instances across 5 sweeps (8+15+3+5+2)". `ACCEPTANCE-RECORD.md` and the commit history document four sweeps and four fix commits (`832a9388`, `70b0fc70`, `d3894dc7`, `0d56e333`) totalling 31 instances; the 5th round-4 item spans two paragraphs. No fifth sweep exists, so the acceptance record's 31/4 is authoritative. The accepted file contains every recorded correction.
- **Correction to the "Audio invalidation" section above:** English audio does exist. It is served from R2, not `app/public/audio/`.
- No additional repairs were needed. The accepted text is preserved unchanged.

### Why it is not published: blocking dependency outside the content remit

The candidate cannot be published by swapping the edition file alone. The
book has a released character package, `app/public/data/characters/the-prince.v1.json`,
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
3. Bump `characterReleases['the-prince'].revision` in `characterCards.ts`.
4. `npm test` must be green, especially `characterReleases.test.ts`. Then
   merge to `main`, which runs the Deploy workflow with `npm run deploy` and
   the smoke test.
5. Verify live: the sha256 of
   `https://tinct.app/data/editions/the-prince-modern-en.json` must equal the
   accepted hash, and the chapter and paragraph counts must match.
6. Audio: English Kokoro audio exists in R2 for this edition. For example,
   `/api/audio-manifest?path=the-prince/modern-en/ch1/manifest.json` returns 200.
   Per `books/AGENTS.md` (QA Gates → audio), the changed paragraphs below
   need regenerated audio and manifests before the book counts as final.
   That work needs GPU spend and the audio lane, and neither was done here.

**Character-package impact:** 139 mentions sit in the 31 changed paragraphs. Of those, 10 have `text` that no longer occurs: 'Bernabò Visconti', 'Countess of Forlì', 'Donnina', 'Hamilcar', 'Messer Bernabò of Milan', 'Messer Niccolò Vitelli', 'Niccolò Machiavelli', 'lady of Forlì'. The new text uses the source's forms Bernabo, Forli, Domnia, Amilcar and Nicolo. Card names or bodies using the old forms: bernabo, donnina, hamilcar, machiavelli, nicolo-vitelli, pitigliano, caterina, girolamo. The card content itself is an editorial call.

**Changed paragraphs relative to live (for audio regeneration and
re-anchoring):** ch4: 9,10,15; ch5: 2; ch8: 4,7,8; ch9: 1,5,7; ch13: 7,10,12,13; ch14: 7,8; ch18: 3,5; ch19: 9; ch20: 17,21; ch21: 2,5,6; ch22: 1,3,8; ch27: 7,8,12,13 (31 paragraphs, 0-based)
