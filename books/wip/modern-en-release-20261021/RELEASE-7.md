# Modern English repair release text-2026-10-22.1: History of the Peloponnesian War (names fixed)

Held from release `text-2026-10-21.5` (see `RELEASE-5.md`). Anders approved the fix on 2026-10-22 ("ok lets fix that").
The package comes from the 6 Oct batch (`bee1059ff5`) and is restored into `books/wip/peloponnesian-war-modern-en/`.
The method is the same as release 1 (`RELEASE.md`, which also covers narration and `edition_patches`).

## The name fix

The accepted candidate brought back source misprints of proper names that the live modern-en had already corrected.
Each one is now fixed with a single exact substitution, keeping the candidate's serialization:

| Place | Was (= source) | Now (= live) |
|---|---|---|
| 8:9 | Antichus | Antiochus |
| 8:14 | Bradidas | Brasidas |
| 8:32 | Amphiraus | Amphiaraus |
| 24:29 | Silenus (a different place) | Selinus |
| 24:33 | Onamacles | Onomacles |
| 20:46 | Phytodorus | Pythodorus |

20:46 is not a regression: source and live both print "Phytodorus". It is the same Athenian commander who appears as
Pythodorus 8 times elsewhere in the book (Thuc. 6.105), so it is corrected with the others.

**Name inventory.** I compared the capitalised tokens of the candidate with live and with the source, across the whole
book and paragraph by paragraph. Every name lost or gained was paired with its nearest spelling and checked against the
source text. Apart from the six above, the differences fall into three groups:
- Inflections changed by the rephrasing.
- Names swapped with pronouns.
- Correct source forms the candidate keeps on purpose:
  - the ethnics in 6:24 and 6:32 (live had used the place names);
  - `Messinese` for the people of Messina in 11:1 and 11:3, where live's "Messenians" was wrong;
  - `Mycenæans` in 1:8, which matches the edition's `Mycenæ` and `Potidæa`.

The only forms new to the book are Phliasian, Caulonia and Croton, all standard.

Spellings shared by source, live and candidate stay as Crawley prints them: Kitinium, Megabuzus, Prasiai, Phocia,
Larissa and Cephallonia. The full record is in the package's `ACCEPTANCE-RECORD.md`.

## Verification and results

| Book | Candidate | Baseline = live | Structure | Changed | Gate (similarity / identical long) | Card mentions |
|---|---|---|---|---|---|---|
| peloponnesian-war | `200accc13036976e…` (supersedes `7343a0ac…`) | yes, `c035038d032ca4ec…` | 26 ch, 998 paragraphs, 1:1 | 980 | PASS 0.714 / 0.4% | 394 -> 390 |

- The card pin equals live.
- The edition is sharded. All 26 shards were rebuilt and equal the edition chapter by chapter.
- The manifest keeps main's titles, paths and counts, and adds `wordCount`, as in release 6.
- Changed-paragraph scan: one flag. 6:47 is at 65% of the source's word count. It is the closing line of the Funeral
  Oration, "Now that you have finished lamenting your relatives, you may depart.", which is natural compression with
  nothing dropped.

`releasedAt` for this book is 2026-10-23T00:00:00Z. The Peloponnesian records written so far are unstamped. Per
`docs/replacement-release-2026-10-01.md`, `releasedAt` must not come before the deploy. If the release slips past that
time, move it later.

## Card rulings (`release-7-mention-mappings.json`)

Every dropped or occurrence-changed mention was read in context.

Mapped (the rulings prepared in `RELEASE-5.md`):
- **themistocles 4:1.** "the Athenians, on Themistocles' advice, dismissed them" is now "on the advice of Themistocles
  the Athenians immediately sent them away". Old occurrence 0 maps to new occurrence 0.
- **pausanias 5:10.** "any commission Pausanias might give him" is now "any commission he might receive from Pausanias".
  Old occurrence 1 maps to new occurrence 2.
  - The package proposed offset 337 instead: "Artabazus was to show Pausanias the royal signet". That "Pausanias" is
    new and replaces "show him", so it stays unmarked.
- **brasidas 14:7.** "with his army and Brasidas at the pass" keeps its occurrence (old 1 maps to new 1).
- **brasidas 8:14** no longer needs a ruling. With the misprint fixed, "Timocrates, Brasidas, and Lycophron" re-anchors
  by exact projection. It was the package's one "needs a ruling" mention.

Left dropped, because the repaired sentence uses a pronoun:
- themistocles 4:1 "Aware of this, Themistocles told them", now "he told them"
- themistocles 4:1 "as Themistocles had instructed", now "as his message had said"
- pausanias 5:9 "when Pausanias was first there", now "during his first stay there"
- brasidas 14:7 "had not brought Brasidas with him", now "had not brought him along"

Projection kept over the package proposal: nicias 12:35, gylippus 21:0 and 21:1, tissaphernes 24:28, phrynichus 25:7 (x2)
and theramenes 26:12. In each one the package's proposal picked the nearest occurrence and was flagged "needs a look".
The exact projection marks the same occurrence the old mention marked, in the same sentence, and the proposal lands one
name away.

The other 381 re-anchored mentions equal the package's proposals.

## Checks

- Gate, 1:1 alignment with original-en and live, and the changed-paragraph scan.
- `npm test`: 528 files passed and 2 failed in the full run. All 3 failures were 5-second timeouts on a machine at load
  average 11 on 4 cores, while other sessions were running:
  - `labContentMigration` "pins the published texts";
  - `reviewedIntroductions` (2 tests).
  Re-run on their own, both files pass (21/21). The first of these is the test that pins this release's hashes and maps.
- `CI=1 npm run build` and `npm run verify-bundle`.
- Playwright visual QA on the built reader, Chromium at phone 390x844 (touch) and desktop 1440x950, isolated, API mocked
  and muted. It covers the first, middle and last changed paragraph of all 26 chapters, the six name-fix paragraphs
  (checking that the corrected name is rendered) and the four ruled cards. Results: `release-7-visual-qa.json`.
  - 176 of 176 views pass. Every changed-paragraph view opens with the paragraph's first words on the page, and every
    name-fix view renders the corrected name.
  - Three views failed on the first run and passed when re-run alone: 14:0 (phone, a 90 s load timeout), 5:16 (desktop,
    a page crash) and the 4:1 card (phone). The machine was under heavy load at the time.
  - I spot-read the screenshots by eye.
- Ruled cards. Themistocles 4:1, Pausanias 5:10, Brasidas 14:7 and Brasidas 8:14 open in both layouts (a click on
  desktop, a press-and-hold on the phone), and the reading place stays where it was.

## Open issues carried forward

- These come from the acceptance record: review depth, per-batch gating not run, and other silent source corrections
  (listed there).
- modern-da does not track the new modern-en.
