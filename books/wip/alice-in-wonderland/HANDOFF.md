# Alice — content handoff

- Branch: `content/alice-in-wonderland-codex`.
- Exact content payload commit: `8b10b39864a41de81ee86946fc4166927c24b0be`.
- Package: `books/wip/alice-in-wonderland/`; pinned sources: `books/raw/alice-in-wonderland/`.
- Instruction revision: `37876e623fd7bb69cce705a5fe14dfde9e8500d3`.
- This document is a subsequent report-only commit pointing to the immutable payload above; its own containing commit can be obtained from Git history. No self-referential commit hash is claimed.
- Content accepted: **PENDING independent editorial acceptance by Claude**. Complete candidate; author QA and required automated gates pass.
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
- Source “Shy” at 4:25 is preserved as an unusual reading; no conjectural “Why” substitution was made.
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
