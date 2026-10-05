# Sherlock Holmes release assets: staged handoff (2026-10-05)

- **Branch:** `claude/sherlock-adventures-content`, from `origin/main` at `df9f6d40f96bb4153285cf601fe4e4a7b1e30a7c`.
- **Instruction revision:** the same `origin/main`. Workflow: `books/BOOK-TASK-WORKFLOW.md`, `books/README.md`, `books/CLAUDE.md`, `docs/workflow-boundaries.md`.
- **Character standard:** the six editorial checks are from `books/characters/AUTOMATION-QUEUE.md`. It is not on `main`; it was read from `origin/claude/tinct-character-content-1n5iqq` at `8427f5a62`. The King Lear package format is used as the model.
- **Status:** content ACCEPTED after independent editorial review (see below). STAGED, not published. No deploy, merge, PR, narration, provider call or Anthropic API use.
- **Source editions:** both live English editions on `main`, unchanged.
  - original-en SHA-256 `7e9fd4f88f86853ca0428b45fb64ea0e410b37dea5c190711d217cb8fd71e2ed`
  - modern-en SHA-256 `ab3db4de18d6e7ba480e4c325e952a4c9c904546e7c51d751d0a464df6b25b5b`
  - Both: 12 stories, 2,527 paragraphs. The whole-book gate on the live files still passes (similarity 0.484, 0/12 light or mechanical).

## Characters

- 160 recognition cards in each edition, bound as exact UTF-16 spans: 1,870 original and 1,863 modern mentions. No entity is omitted from either edition.
- Content version / revision `2026-10-05.2`. Asset `books/characters/adventures-of-sherlock-holmes/characters.v1.json`, SHA-256 `e21054b8fc033c8862a237350079cf124f066ae2d1a7d7256f335c7c5c2e30d3`.
- Authored from complete readings of both editions, story by story. Inventory evidence, namesakes, concealments, deliberately unbound phrases and edition divergences are in `books/characters/adventures-of-sherlock-holmes/source-notes.json`, which contains spoilers.
- Gates are at paragraph end. Disguise names and aliases are separate cards until their reveal: Count Von Kramm, the youth in the ulster, Hosmer Angel, Black Jack of Ballarat, Hugh Boone, John Robinson, F. H. M. and the man in the road. Culprits' role labels are hidden until the solution, and Holmes's disguises are unbound. The README gives every gate and binding decision.
- **Left unresolved, by design:**
  - Dr. Becher's role (story 9), because the text does not settle it.
  - Archie is not merged with Duncan Ross (story 2).
  - Watson's "James" (6:8) is unbound.
  - Ambiguous generic references are listed as unbound in `source-notes.json`.
- **Rebuild:** `python3 books/characters/entities/adventures-of-sherlock-holmes.py`; add `--check` for a byte-identical rebuild. The entity module is data-driven: it reads `editorial.json` and uses the unchanged `build_reviewed.compile_package`.
- **Verification:**
  - The app's `verifyCharacters` and `releasedCard` were run in memory with a temporary release entry, outside the repository. Both editions pass, drift is rejected, and 1,036 gate checks pass.
  - `npx vitest run src/services/characters src/reviewedIntroductions.test.ts` passes 514/514. No test or app file was edited.

## Threads

- `adventures-of-sherlock-holmes-threads.json`: 106 characters and 129 story summaries, keys 1–12. The IDs are a subset of the card IDs, and each epithet equals the card subtitle.
- The app's `spoilerSafeCast` shows the current chapter's thread as a cast list when the story opens. Every summary is therefore written as a setup-only introduction for the whole story, with no culprit, disguise, true identity or outcome.
- Figures whose mere listing would point to a solution have no thread: John Clay, the Bristol barmaid, Black Jack of Ballarat, the Ballarat Gang, Dr. Becher, the man in the road, Mr. Fowler, Archie, William Morris, Calhoun and the Lone Star.

## Introduction, onboarding, snippets

- **`onboarding.json`:** the proposed replacement for the live onboarding file. It adds:
  - `openingText`: modern-en 1:0, verbatim; note that it contains `_the_`.
  - One acclaim entry from a primary source: Robert Louis Stevenson's letter to Doyle of 5 April 1893, quoted verbatim from Gutenberg #637, *The Letters of Robert Louis Stevenson*, Vol. 2, lines 8955–8963.
  - Recalibrated `whyItMatters` (three items, each ending in one brief contemporary line, no first-person plural).
  - Corrections to angle card 2 ("our view") and to Mary Sutherland's cast entry, which hinted at the motive.
- **`preface.txt`:** the onboarding `about` text, verbatim, plus a newline. 160 words; SHA-256 `e94dfde2d01ccc445e3ca7f6a967bb4a970ab23409871b7add2028387cc84a0c`, matching `manifest-entry.json`.
- **`intro-data.json`:** follows the shape of the existing intro-data files: author, hook, four preface paragraphs, orientation. The hook matches `reviewedHooks-entry.txt`.
- **`audioAvailability-entries.txt`:** English Grok streaming eligibility for both editions. These are not prerecorded-audio claims.
- **`characterReleases-entry.txt`:** revision `2026-10-05.2`.

## Integration (Codex; not done here)

1. Copy `books/characters/adventures-of-sherlock-holmes/characters.v1.json` to `app/public/data/characters/adventures-of-sherlock-holmes.v1.json`, then add the `characterReleases` entry.
2. Copy `adventures-of-sherlock-holmes-threads.json` to `app/public/data/editions/`.
3. Copy `onboarding.json` over `app/public/data/onboarding/adventures-of-sherlock-holmes.json`.
4. Copy `preface.txt` to `app/src/data/prefaces/adventures-of-sherlock-holmes.txt`, and `intro-data.json` to `app/public/lab/library_2/intro-data/adventures-of-sherlock-holmes.json`.
5. Append `manifest-entry.json` to `docs/design/library-prefaces/manifest.json`, and the hook to `reviewedHooks` in `app/public/lab/library_2/reviewed-introductions.js`.
6. Add the audio eligibility entries.
7. Carry forward the open items from `../INTEGRATION.md`:
   - The taxonomy house rename and cover placeholders.
   - The 8 straight single quotation marks in modern-en.
   - Story 5:48, where the modern text uses straight quotes; a reviewer noted it.
8. Run the app build, browser and reader checks: card taps, gallery cutoffs, cast list and onboarding. Then release through the serialized owner.

If the live edition bytes change, the character asset must be rebuilt and reviewed: it fails closed on a source hash mismatch.

## Independent acceptance (2026-10-05)

ACCEPTED. The full record is in `../EDITORIAL-FIXES.md` ("Character, thread and intro review — 2026-10-05") and `../qa/character-review/`.
