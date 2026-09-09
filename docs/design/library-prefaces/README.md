# Library prefaces — September 9, 2026

Status: integrated, deployed and verified on tinct.app on 2026-09-09. See [release evidence](../../library-prefaces-release-2026-09-09.md).

[Read all 100 prefaces](INDEX.md) · [Import package](prefaces.json) · [Manifest](manifest.json) · [Coverage checks](qa.json) · [Research and scope review](research/reference-checks.md)

Anders authorised generation for all published books using light effort and the established research-first approach. The frozen inventory was rechecked against the current `BOOKS` registry: 100 titles, comprising six previously approved texts and 94 remaining texts. Staged and unpublished books are excluded.

## Editorial status

The six files in [approved-prefaces](../approved-prefaces/README.md) are unchanged and match the existing application text. The second Notes from Underground comparison draft is preserved from the user's acceptance of both comparisons. The other 93 texts are agent-reviewed publication candidates under the whole-library authorisation, not individually approved by Anders. New/retained comparison prose totals 26,264 words, ranging from 231 to 549 words per book. Shorter works and documents generally receive shorter introductions.

Reddit was searched before drafting each new work. Relevant reader observations informed the approach; comments, votes, promotional outlines and snippets were not treated as scholarly authority. Some works have sparse useful Reddit material. The research files distinguish that limitation and preserve search excerpts, including rejected results. They do not imply every returned link was opened. The prose is original writing produced in this agent conversation, without model-generation APIs.

The editorial pass checked work-specific premises, form, character names, argumentative claims, spoilers and repetitive framing. It revised 39 drafts to remove mechanical concluding judgments, and removed an unnecessary Macbeth outcome implication. No new preface uses direct reader address (the word “You” in the title As You Like It is a title). No repeated complete sentence longer than eight words was found across new texts. These are useful checks, not an objective guarantee of literary quality.

## Authoritative files and import

- Individual Markdown files contain reader-facing body text only. The original six retain their existing authoritative paths under `../approved-prefaces/`.
- `prefaces.json` is a frozen release export of all 100 exact texts, with canonical IDs, source paths, language, review provenance, word counts and SHA-256 hashes. Hashes include the trailing newline.
- `manifest.json` contains the same metadata without duplicating prose. `qa.json` records registry coverage, hash and JSON round-trip checks, and protection of the six approved texts.
- The implementation owner is **Move coding to Codex**, task `01a07ff0-a87f-7031-8b2f-d050d06d52bd`. Existing app support is `app/src/data/bookPrefaces.ts`, loading `app/src/data/prefaces/<canonical-id>.txt`. Import exact text; do not regenerate or summarise it.
- Keep the existing preview behaviour: excerpt from the opening text. No new marketing copy, runtime generation, character gallery, navigation changes or reading-position changes belong to this batch.
- Keep research, metadata and this documentation out of the reader UI and application content bundle. Only the body text belongs in a preface.

## Handoff checks

Use the clean/reconciled shipping checkout. Preserve concurrent changes. Copy only this content package and necessary source/verification documentation. The previous test treating Democracy in America as unsupported is now superseded; unsupported IDs should still return no preface, including the noncanonical `the-bible` and `the-odyssey` aliases. Test all published IDs against the frozen exact text while retaining explicit protection for the original six.

Follow AGENTS.md tests, build, verify-bundle, deployment and production-verification requirements. Check representative short/long prefaces, phone and desktop, fresh/resumed covers, Compare and audio return. Report the actual deploy separately; completion of this editorial batch is not evidence that all 100 are live.
