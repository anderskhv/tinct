# Release Packet — Candide (Voltaire)

Prepared for handoff to the publication/release owner. This lane does not
make app code, registry, deploy, or audio-generation changes — see
`books/CLAUDE.md` and `books/AGENTS.md` scope rules. This packet is
everything the release owner needs to publish.

## Replacement artifact

- **Accepted file:** `books/wip/green-candide/candidate.json`
- **Target live path:** `app/public/data/editions/candide-modern-en.json`
- **Accepted sha256:** `e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25` (round 2, 2026-09-23; supersedes `a32b2555…`, see Publication status below)
- **Structure:** 30 chapters, 709 paragraphs, matches `source.json`
  exactly. This book was already live in
  `app/src/data/bookRegistry.ts`'s `BOOKS` export pre-programme.
  `candide-threads.json` already exists — release owner should spot-check
  it against the 11 changed paragraphs (all glossing edits, no plot/
  character changes, so unlikely to be affected).

## Validation / review evidence

All evidence lives in `books/wip/green-candide/`:

| File | Contents |
|---|---|
| `accessibility-review-1.md` | Round-1 blind accessibility review |
| `fidelity-review-1-packet-ch1-8.md` | Round-1 fidelity, chapters 1-8 |
| `fidelity-review-1-packet-ch9-16.md` | Round-1 fidelity, chapters 9-16 |
| `fidelity-review-1-packet-ch17-23.md` | Round-1 fidelity, chapters 17-23 |
| `fidelity-review-1-packet-ch24-30.md` | Round-1 fidelity, chapters 24-30 (+ whole-book summary) |
| `fidelity-review-2-name-sweep.md` | Round-2 (2026-09-23) proper-noun/printed-form sweep, repair list and independent verification |
| `ACCEPTANCE-RECORD.md` | Full coverage table, defect counts, deliberately-preserved non-blocking items, final hash |
| `accepted-paragraph-hashes.tsv` | Per-paragraph sha256 (first 16 hex chars) of the accepted text, keyed `chapter.paragraphindex` |

Full review coverage: structural check; 1 blind accessibility review +
1 four-packet fidelity review with full 709-paragraph coverage (round
1, fidelity ACCEPT AS-IS with zero blocking defects); accessibility
glossing fix pass (11 paragraphs) + independent fidelity re-check of
those paragraphs; final whole-book non-sampled fidelity + accessibility
pass, specifically checking that Voltaire's deadpan satirical tone holds
consistently across all 30 chapters (a book-specific risk: satire
flattened into sincerity). No sampling at any stage.

## Source note

No `candide-original-fr.json` exists in the editions directory — only
the public-domain English-translation baseline. Per `books/AGENTS.md`'s
non-English-source rule, that translation served as the sole locked
fidelity anchor throughout review. Flagged for awareness, not a defect.

## Relationship to currently-live text

A paragraph-level diff against the current live `candide-modern-en.json`
shows the accepted text differs in only 11 of 709 paragraphs — all light
in-line glosses for period vocabulary (quarterings, auto-da-fé,
sanbenito, Ottoman titles, cochineal, etc.), no fidelity fixes were
needed (round-1 fidelity was ACCEPT AS-IS from the start).

## Audio invalidation

No English audio currently exists for `candide` (`app/public/audio/` has
no directory for this book id). Nothing to invalidate — audio generation
from the accepted text will be a first-time generation.
`accepted-paragraph-hashes.tsv` is the baseline hash set for detecting
future text drift.

## What this lane did NOT do

No changes to `app/src/data/bookRegistry.ts`, no app code, no deploy, no
audio generation. The live `candide-modern-en.json` has not been touched
— the release owner performs the actual file swap.

## Known, deliberately-preserved limitations

- [3.10] chamber-pot ellipsis left as authorial delicacy, not clarified
  (judgment call — clarifying risked flattening the joke).
- [11.6]/[12.6] two Italian exclamations left untranslated — a later
  plot point depends on the Old Woman recognizing the language itself.
- [22.27] Fréron reference (a real historical critic Voltaire targeted)
  left unglossed — no further gloss possible without inventing
  biographical detail not in the source text.
- [30.25] Pangloss's list of assassinated kings — a deliberately
  overwhelming wall of names; the density is the joke, not a defect.

Review proves no *detected* material fidelity or accessibility defect
remains — it does not prove zero undetected errors.

## Publication status — 2026-09-23 (supersedes earlier status lines in this packet)

**State: Publication handoff. NOT published.** The live
`app/public/data/editions/candide-modern-en.json` and
`https://tinct.app/data/editions/candide-modern-en.json` still serve the old
text. Both were verified at the pre-programme hash on 2026-09-23.

- **Candidate:** `books/wip/green-candide/candidate.json`
- **Destination:** `app/public/data/editions/candide-modern-en.json`
- **Accepted sha256 (publish exactly this):** `e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25`

### Verification of the accepted candidate (2026-09-23)

- The 2026-09-21 hash `a32b2555…` matched the file on the review branch, but its acceptance was **not** fully supported. Round-1 fidelity had passed a whole class of silent proper-noun normalization, which `books/AGENTS.md` forbids.
- That class was repaired in round 2: 131 occurrences in 93 paragraphs. See `fidelity-review-2-name-sweep.md`. An independent verifier checked it twice and returned VERIFIED CLEAN.
- **The accepted hash is now `e7fd2a802ac233b8598ddccbb03cef8a4fc422fba2d67f6aa0387bee80ba2b25`**. It supersedes `a32b2555…`, which must not be published.
- The 11 round-1 accessibility glosses are present. The two `auto-da-fé` glossed sites now use the source's `auto-da-fe`, and the gloss wording is unchanged.
- Source used for fidelity review: `source.json`, the public-domain English translation. It is byte-identical to the served `candide-original-en.json`. No French original exists in the repo, so this translation is the sole locked anchor, per the `books/AGENTS.md` rule for non-English sources.
- Structure: 30/30 chapters and 709/709 paragraphs, titles unchanged. `accepted-paragraph-hashes.tsv` was regenerated for the new text.
- **Corrections to the sections above:**
  - The candidate now differs from live in 100 paragraphs, not 11: the 11 glosses plus the round-2 name restorations.
  - English audio does exist. It is served from R2, not `app/public/audio/`.
  - Candide does have a released character package.

### Why it is not published: blocking dependency outside the content remit

The candidate cannot be published by swapping the edition file alone. The
book has a released character package, `app/public/data/characters/candide.v1.json`,
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
3. Bump `characterReleases['candide'].revision` in `characterCards.ts`.
4. `npm test` must be green, especially `characterReleases.test.ts`. Then
   merge to `main`, which runs the Deploy workflow with `npm run deploy` and
   the smoke test.
5. Verify live: the sha256 of
   `https://tinct.app/data/editions/candide-modern-en.json` must equal the
   accepted hash, and the chapter and paragraph counts must match.
6. Audio: English Kokoro audio exists in R2 for this edition. For example,
   `/api/audio-manifest?path=candide/modern-en/ch1/manifest.json` returns 200.
   Per `books/AGENTS.md` (QA Gates → audio), the changed paragraphs below
   need regenerated audio and manifests before the book counts as final.
   That work needs GPU spend and the audio lane, and neither was done here.

**Character-package impact:** 388 mentions sit in the 100 changed paragraphs. Of those, 74 have `text` that no longer occurs: 'Abbé', 'Aeneas', 'Antichrist', 'Baasha', 'Biscayan', 'Elah', 'Friar Giroflée', 'Fréron', 'King of the Abarians', 'Leibniz', 'Marquise', 'Muhammad', 'Prince of Massa Carrara', 'Périgordian', 'Ragotski', 'Robeck', 'Saint James of Compostela', 'Theatine'. Their restored forms are listed in `fidelity-review-2-name-sweep.md`. 21 card name or body fields use a now-reverted spelling, for example abbe, giroflee, leibniz, muhammad, antichrist, saint-james, governor and alcalde. Whether card copy follows the edition's spelling is an editorial call for the release owner. `candide-threads.json` should be spot-checked for the same.

**Changed paragraphs relative to live (for audio regeneration and
re-anchoring):** ch1: 0; ch2: 18; ch3: 1,7,10; ch4: 9,15; ch5: 14,19; ch6: 0,1; ch7: 1; ch8: 6,7; ch10: 1,6; ch11: 1,3,5; ch12: 7,10,11,16,17; ch13: 1,2,4,8; ch14: 0,6,9,32; ch15: 0; ch16: 1,11; ch17: 7,16; ch18: 39; ch19: 12,14,16,33; ch21: 4; ch22: 2,7,9,16,17,19,23,25,27,28,30,32,34,37,39,40,41,43,44,54,57,60,66,67,69,71,73,74,80,86,90,91; ch24: 1,5,9,13,16,17,19,20,21,24; ch25: 12,14,24,39; ch27: 7,9; ch28: 1,3,5; ch30: 1,2,5,6,25,29 (100 paragraphs, 0-based)
