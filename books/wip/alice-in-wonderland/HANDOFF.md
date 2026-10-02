# Alice — content handoff

- Branch: `content/alice-in-wonderland-codex`.
- Exact content payload commit: `8b10b39864a41de81ee86946fc4166927c24b0be`.
- Package: `books/wip/alice-in-wonderland/`; pinned sources: `books/raw/alice-in-wonderland/`.
- Instruction revision: `37876e623fd7bb69cce705a5fe14dfde9e8500d3`.
- This document is a subsequent report-only commit pointing to the immutable payload above; its own containing commit can be obtained from Git history. No self-referential commit hash is claimed.
- Content accepted: **ACCEPTED (independent editorial review, 2026-10-02)** — all review findings resolved; see “Independent acceptance” below. Hashes in “Pinned hashes” are the historical candidate; accepted hashes are below.
- Published: **NO**. No app, registry, live assets, production characters, audio, shared tracker, tool, test or config edits.

## What is complete

Original English: 12 chapters, 789 paragraphs, 26,298 whitespace-delimited words. Modern English: 12 chapters, 789 paragraphs, 23,561 words. Paragraph counts: **24, 26, 48, 42, 75, 80, 105, 71, 92, 81, 74, 71**. All units are real narrative chapters, numbered 1–12, with `sections: []`. No rendering remains to be written.

Also included: About; one verified primary-source acclaim with attribution/context; exactly three why-it-matters entries, each ending with one brief contemporary observation; four reading angles; introductory cast; 31-identity character/alias proposal; proposed House/Shelves/form/era/list metadata; source rights evidence; changed-paragraph coordinates; batch and whole-book reports.

## Pinned hashes

- `editions/alice-in-wonderland-original-en.json`: `aec5399bf14ddb6c6e84aadda4ada12a36201f48fc1f12f992e1f60b4e88f226`
- `editions/alice-in-wonderland-modern-en.json`: `9d620ae4fc97d6b3d16891e8535894b915aaf98d5148e768af16d14d6c3f3601`
- `onboarding/alice-in-wonderland.json`: `1e71bae7af8c1bdbfd409e9c9917c066593e454cb9ed3ddf846accbb1b8ff385`
- `characters/identity-proposal.json`: `1c80a813cad103fab50a10ba2def9c369c5978b8a00d17e2f013426262e2555f`

Raw Alice SHA-256: `01b38ea4c710a84bc18d0bd41271a5a1a92b94e97b2812f4dece97d4a694725e`.

All payload files, including raw acclaim source and review artifacts, are listed in `review/SHA256SUMS.txt`. The manifest excludes itself and this later handoff document to avoid recursive hashing. Verify from the repository root with `shasum -a 256 -c books/wip/alice-in-wonderland/review/SHA256SUMS.txt`.

## Gates and provenance of execution

Existing `books/classify-modern-en.py` is unchanged. It hardcodes live app paths for a bare book id. Supplying an absolute edition stem uses its existing Path handling and permits WIP input without touching app paths:

```sh
python3 books/classify-modern-en.py "$PWD/books/wip/alice-in-wonderland/editions/alice-in-wonderland" --gate
python3 books/classify-modern-en.py "$PWD/books/wip/alice-in-wonderland/editions/alice-in-wonderland" --gate --chapters 1-4
python3 books/classify-modern-en.py "$PWD/books/wip/alice-in-wonderland/editions/alice-in-wonderland" --gate --chapters 5-8
python3 books/classify-modern-en.py "$PWD/books/wip/alice-in-wonderland/editions/alice-in-wonderland" --gate --chapters 9-12
```

All four invocations pass with exit code 0 on the final candidate. Early batch runs used explicit, aligned review excerpts containing only completed chapters. No unfinished chapter was padded or substituted with original prose in modern-en.

Whole-book output:

```
  ch    1  sim 0.593  REAL        Down the Rabbit-Hole
  ch    2  sim 0.588  REAL        The Pool of Tears
  ch    3  sim 0.529  REAL        A Caucus-Race and a Long Tale
  ch    4  sim 0.517  REAL        The Rabbit Sends in a Little Bill
  ch    5  sim 0.561  REAL        Advice from a Caterpillar
  ch    6  sim 0.498  REAL-HEAVY  Pig and Pepper
  ch    7  sim 0.511  REAL        A Mad Tea-Party
  ch    8  sim 0.473  REAL-HEAVY  The Queen’s Croquet-Ground
  ch    9  sim 0.495  REAL-HEAVY  The Mock Turtle’s Story
  ch   10  sim 0.585  REAL        The Lobster Quadrille
  ch   11  sim 0.507  REAL        Who Stole the Tarts?
  ch   12  sim 0.499  REAL-HEAVY  Alice’s Evidence
/private/tmp/tinct-three-book-content/books/wip/alice-in-wonderland/editions/alice-in-wonderland original-en -> modern-en  (12 chapters)
  weighted similarity : 0.528   (gate: <= 0.75)
  light+mechanical    : 0/12 = 0.0%   (gate: <= 5%)
  identical long paras: 25/546 = 4.6%   (gate: <= 5%)
  buckets: REAL-HEAVY 4  REAL 8  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS
```

Each JSON was validated with `python3 -m json.tool`. Every paragraph meets at least 75% of its source word count (minimum exactly 0.75). Full structural/completeness results and all 759 changed paragraph coordinates are in `review/alignment-and-completeness.json`. Original paragraph identities were checked exhaustively against the pinned raw text after the documented exclusions, not just sampled.

Checkpoint commits: original `62514d33`; modern 1–4 `48407bb0`; modern 5–8 `a170496e`; source apparatus correction `d87c8716`; complete modern/gate checkpoint `728aa212`. Final payload commit above adds companion content and the final punctuation review.

## Editorial notes and remaining acceptance work

Read `review/final-review.md` and the three batch notes. The author compared each paragraph while rendering and reread the first three paragraphs of chapters 1, 6 and 12 side by side. Names, French accents, erroneous calculations/geography, meaningful punctuation, puns, allusions, narrative asides and the complete closing frame survive. No Anthropic or other generation API was called.

The final gate initially failed on retained verse, despite passing all prose measures. Six verse paragraphs then received genuine local modern renderings: 10:25, 10:26, 10:59, 10:70, 12:45, 12:46. Stanzas, refrains, images, rhyme anchors and later quoted phrases remain. Independent review should pay particular attention to these passages. Gate success is not claimed as independent semantic approval.

Known issues/choices:
- No independent accessibility reviewer has approved this text yet. Claude should perform that read before marking content accepted.
- This is Gutenberg’s Millennium Fulcrum Edition 3.0, including its two later-edition verse continuations. It is not a diplomatic transcription of the 1865 first impression.
- Two inline apparatus labels were removed while keeping their complete verse; chapter 10’s hard wrap within “pennyworth” was repaired. Source corrections did not alter paragraph counts.
- Authorial references to a picture at 9:43 and a frontispiece at 11:3 remain. No illustrations are included. Decide display treatment during integration without silently deleting authorial text.
- ~~Source “Shy” at 4:25 is preserved~~ Superseded 2026-10-02: emended to “Why” per the 1866 Macmillan text / *Annotated Alice* (documented in `SOURCE.md`).
- Original text retains source hard wraps and underscore emphasis. Verify stanza/line-break and emphasis display in the reader.
- The raw sources intentionally retain original CRLF/trailing whitespace to preserve download hashes.

## Later integration requirements — Claude

1. Independently review the completed candidate and record accepted edition hashes. No per-chapter rendering is outstanding.
2. Register the actual editions and agreed taxonomy only after acceptance. Proposed primary: modern-en; Compare: original-en. Preserve existing reader preferences.
3. Derive runtime character cards and mentions from the proposal and exact accepted text; check every delayed reveal. No runtime mention files are supplied.
4. Verify chapter navigation, paragraph comparison, onboarding, verse display and the authorial illustration references. No sections hierarchy is intended.
5. Respect narration cache identity for the exact accepted text; this package authorizes no narration generation or prewarming. The new book has no recorded audio promise.
6. Run the integration/release checks under Claude’s separately assigned scope. Nothing on this content branch has been merged or published.

The other two books remain separate queued assignments at this handoff checkpoint; this branch contains Alice content only.

## Independent acceptance — 2026-10-02

Status: **ACCEPTED** — independent editorial review complete; every finding resolved (list with coordinates in `EDITORIAL-FIXES.md`, “Independent editorial review fixes — 2026-10-02”). Published: still **NO**.

- Verse: all 31 verse paragraphs in modern-en are verbatim (10:25, 10:26, 10:59, 10:70, 12:45, 12:46 restored). The six earlier gate-driven verse renderings are withdrawn.
- 4:25 source variant “Shy” → “Why” in original-en; modern matches.
- Modern 12:20, 12:71, 5:18, 4:20 corrected; onboarding `whyItMatters[0]` misattribution (Gryphon 9:88; Hatter 7:17) fixed; `about`/preface “nursery rhyme becomes an accusation” (11:12); intro ¶1 and three thread summaries corrected.

Accepted hashes (SHA-256):
- `app/public/data/editions/alice-in-wonderland-original-en.json`: `eb5d6211341148faa3ccc5784d4416ee498dabbb0b23aae052530958f3e6c6a8`
- `app/public/data/editions/alice-in-wonderland-modern-en.json`: `ce04a1b4bae3fdaeb2fd8ca8881ccc2815dba76fc1dbf24b92757e88682a6ff7`
- `app/public/data/editions/alice-in-wonderland-threads.json`: `63d1d51a867c027833fdb70aa80941fd76d986daba8b60d01f959d08656ae600`
- `app/public/data/onboarding/alice-in-wonderland.json`: `cfc6a467f83a70a3f021fdfa9f0e8c647cd19466956494be4767972265b73e8e`
- `app/src/data/prefaces/alice-in-wonderland.txt`: `552e803aa5b4fbb075f40698de2448b52c6097c000e798409e394a4bb6d1bd0f` (214 words)
- `app/public/lab/library_2/intro-data/alice-in-wonderland.json`: `55ca1ba06e651288a2e3027e58785cb214e969a6c1e2277f9bf7070192e27529`
- `app/public/data/characters/alice-in-wonderland.v1.json` (= `books/characters/alice-in-wonderland/characters.v1.json`): `6da66fa9d2b4744101e4058826b22b11d81b8e9e1eeab91cf34ef9bc32517436`, contentVersion `2026-10-02.1`

Gates (2026-10-02, live paths, `python3 books/classify-modern-en.py alice-in-wonderland --gate`): weighted similarity 0.532, light/mechanical 0/12, wrapped 0, truncated 0; identical long paragraphs 31/546 = 5.7% → tool prints GATE FAIL (exit 1) solely on that measure; all 31 are verse, prose identical 0/515 = 0.0%, accepted under the documented verse exemption (`EDITORIAL-FIXES.md`). Batches 1–4 and 5–8 PASS; 9–12 fails only on identical verse (16/205). Structure 12/789 aligned; minimum paragraph word ratio 0.75. Character rebuild via `build_reviewed.compile_package`: 31 cards per edition, 1,090 original / 1,093 modern mentions, 13 delayed snapshots per edition, first mentions match the proposal, offsets/paragraph hashes verified; `books/characters` unittest 12/12; `npx vitest run src/services/characters src/reviewedIntroductions.test.ts src/lab/labSource.test.ts` 502/502.

Remaining integration items unchanged: picture/frontispiece references at 9:43 / 11:3, verse line-break/indent and underscore emphasis visual QA in the reader, `spoilerSafeCast` whole-chapter thread exposure, and the classifier’s lack of a verse exemption (tool change for Codex).
