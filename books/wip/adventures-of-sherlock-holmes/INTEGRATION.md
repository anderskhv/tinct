# The Adventures of Sherlock Holmes: integration notes (2026-10-01)

Branch `integration/release-candidate-3`, stacked on `integration/release-candidate-2`. Staged only: the `ADVENTURES_OF_SHERLOCK_HOLMES` constant is in `app/src/data/bookRegistry.ts` but not in `BOOKS`, so nothing is public. Source package: `origin/content/sherlock-adventures-codex` (HANDOFF.md, STATUS.md, MANIFEST.json, REVIEW.md and QA summaries are kept alongside this file; per-batch QA snapshots, rendering chunks and the raw Gutenberg text stay on that branch).

## What was integrated

- Live editions `app/public/data/editions/adventures-of-sherlock-holmes-{original,modern}-en.json`. 12 stories as flat chapters 1-12, 2,527 aligned paragraphs. Original is byte-identical to the package (SHA-256 `7e9fd4f8…71e2ed`). Modern is the package text plus the mechanical fixes in `EDITORIAL-FIXES.md` (curly apostrophes, 15 restored exclamation marks): SHA-256 `ab3db4de…5b5b` (package `06c86bf1…0142f`). Whole-book gate on the live files: PASS, similarity 0.485, 0/12 light or mechanical.
- Chapter shards under `app/public/data/editions-chapters/` via `node scripts/split-edition-chapters.cjs adventures-of-sherlock-holmes-original-en adventures-of-sherlock-holmes-modern-en --write-registry` (adds both ids to `editionShardRegistry.ts`).
- Onboarding `app/public/data/onboarding/adventures-of-sherlock-holmes.json`, unchanged (acclaim intentionally omitted by the package).
- Registry constant: year 1892, word count 104,347 (original-en whitespace words, from HANDOFF.md), original label "Doyle (Original)".
- Taxonomy (the package's primary proposal): House `novel` retitled "Fiction" (sub "Novels and stories, by tradition") so it can hold a short-story collection; new shelf `detective-fiction` ("Detective Fiction") added to that house; new form `short-stories` ("Short stories"); book entry era `modern`, no list memberships. Composition year 1892 added to `public/lab/library_2/browse-groups.js`.

## Choices the package did not specify

- Cover colours `#2a2e38` / `#c9a45c` and hue `265` (the shared English-fiction hue) are placeholders; no cover art exists.
- Themes: first three of the eight proposed (observation, inference, deception), matching the three-theme convention.
- `hasAudio: true` on both editions follows the other staged books; no audio availability entry exists, so nothing plays until one is added.
- The house label change from "Novels" to "Fiction" is visible in the public library once any Fiction shelf is shown. Revert it (and use the package's alternative, a "Short Fiction" house) if that is not wanted before release.

## Not done

Runtime character sidecar and `characterReleases` entry (23-identity proposal in `characters/proposal.json`, not a mention inventory; spoiler gates need exact verification), cover art, SEO pages, `audioAvailability.json` entries, narration, reading-list membership, and review by Anders. The 8 straight single quotation marks listed in `EDITORIAL-FIXES.md` are a known typography leftover.
