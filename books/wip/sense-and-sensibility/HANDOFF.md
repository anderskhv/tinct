# Sense and Sensibility — READY, content accepted

Repository: `anderskhv/tinct`.
Branch: `content/sense-and-sensibility-codex`.
Package: `books/wip/sense-and-sensibility/`.
Source archive: `books/raw/sense-and-sensibility/`.
Working checkout: `/tmp/tinct-sense-and-sensibility`; the pushed branch is the durable copy.
Acceptance: complete content independently reviewed, all findings resolved, all gates passed. No remaining content work. Application integration and publication are separate assignments.

## Revisions and ownership

Initial instruction/start-main revision: `ab3cc43f2687e6682833db6a66182d150788ffa4`.
Current instructions rechecked against fetched main: `13608e50e27096e5755e83c20861be22f0b9b9c7`; applicable policy files are unchanged from previously checked `6dd90ae199a4fff7fc4692c0776158d73cbe171c`. Read books/BOOK-TASK-WORKFLOW.md, books/README.md, STRATEGY.md, root/books AGENTS.md, books/CLAUDE.md and docs/workflow-boundaries.md. No main merge or other stream’s work was imported.

Independent review began at `367e4849d6d3b26d365a98c302fa41f754b45b85`, with modern hash `c86c2708f95b94c9bd8eecb54873cfe988f00ede3853a10c42c04a28316df512`. Nine paragraph corrections and two character-disclosure corrections were then independently rechecked. The accepted text is identified by the exact hashes below and in SHA256SUMS.json. Use the final pushed package commit supplied in the task handoff.

The user explicitly assigned Codex content authorship and authorized independent reviewer agents. Writes are confined to the two owned paths. No application, registry, live edition/onboarding, shared tracker, script, configuration or runtime character file changed. No deployment, publication, narration generation or Anthropic API calls. The ChatGPT project’s synced sources were not edited.

## Accepted editions and provenance

- Original-en: 50 numbered flat chapters; 1,806 paragraphs; 118,639 whitespace-delimited words. SHA-256 `26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0`.
- Modern-en: all 50 chapters; 1,806 exactly aligned paragraphs; 106,057 words (89.39% of original). SHA-256 `1a90844c9fc047e9cdc5a6e4e27a6c9a7fcd25bfacf786ea1afbde62e35e4f6c`.
- Raw Gutenberg #161: verified Title Sense and Sensibility / Author Jane Austen. SHA-256 `22272ec4d4da2f50cda51edf34ab8486b325c4a99580120db565fb8917228a22`. SOURCE.md supplies retrieval URL and Denmark/EU/US rights evidence. No other ebook text was mixed in.
- Original prose matches all 50 raw chapter bodies after whitespace unwrapping and exclusion of headings/apparatus. Three end markers are excluded. Volume markers at chapters 22 and 36 were removed after initial source commit `f7a0bc38`; original reading-prose coordinates are unchanged. The source comparison and provenance were independently verified.
- English-original edition structure follows the existing Pride and Prejudice format: chapters with number/title/paragraphs; sections empty.

## Independent acceptance and gates

Three read-only reviewers compared every paragraph: `/root/review_01_17` reviewed 474 pairs, `/root/review_18_34` reviewed 711, and `/root/review_35_50` reviewed 621. Total coverage: all 1,806 pairs. All three accepted the final modern hash after checking corrections and verifying every other paragraph unchanged. The first reviewer also accepted supporting content, all 24 character identities/source anchors/disclosure gates, and source/rights evidence. See `qa/independent-reviews.json` for scope, final verdicts and all resolved findings. No unresolved findings remain.

Corrections from review: 2:3 redundant phrase; 20:20 reciprocal dining etiquette; 31:26 and 31:28 period religious/moral judgments; 31:30 dangling modifier; 36:2 professed eagerness versus actual regard; 42:9 solitary walks during a stay; 42:15 Epicurean allusion; 46:34 speaking rather than deciphering words. Coordinates are one-based. Exact before/after paragraphs and hashes are in `qa/independent-review-corrections.json`.

Whole-book classifier PASS after corrections: similarity 0.475 <= 0.75; light/mechanical chapters 0%; identical long paragraphs 0%; wrapped scaffolding 0; flagged truncated quotations 0. Every individual paragraph meets the 75% word floor, including brief speech; minimum ratio 0.75000. Existing truncation audit: zero flags. Complete alignment and JSON checks pass.

All batch gates pass: 1–10, expanded 1–12, interim 13–16, 13–22, 23–32, 33–42 and final 41–50. The final batch intentionally overlaps chapters 41–42 to keep ten chapters. Slice files match the final accepted candidate; every slice and the whole book were gated again after review corrections. The classifier’s displayed chapter indices are slice positions; stored numbers/titles preserve actual chapter numbers.

`qa/REVIEW.md` separates author checks from independent acceptance. Author spot-reads include the first three paragraphs of chapters 1, 25 and 50; independent reviewers subsequently read the whole book. The 18 paragraphs under 20 characters are complete short utterances, letter signatures/closing or transitions. `qa/review-01-10.md` and `qa/truncation-01-16.txt` are historical checkpoints, superseded for current status by the complete reports.

`qa/changed-paragraphs.tsv` lists all 1,806 source/modern coordinate pairs with hashes, including unchanged short utterances. `qa/alignment-and-length.json` records every paragraph length/hash. The source and modern boundary reports provide all openings/endings. Mapping is one-to-one by chapter and paragraph.

## Supporting content

Onboarding: About, exactly three whyItMatters entries with one brief contemporary line each, four reading angles and eleven cast members. Acclaim is omitted. Opening excerpt is original-en; reading time is an estimate. Independently accepted.

Characters: 24 proposed identities with literal source evidence, aliases and introductory copy. Final proposal SHA-256 `10e08abc048a966621a0639a716689366d2e9a88ad657480598c88514d2a3ac6`. The reviewer accepted the corrected copy at hash `db838e34ac0f5fe9f8c489c8e3f462c7c36a8591e07185e45d1d4786762308ad`; only reviewStatus metadata changed afterwards, expressly covered by that acceptance.

Marianne’s chapter-1 copy describes intelligence and temperament. Fanny’s Ferrars disclosure waits through chapter 3. Anne/Nancy is one identity; the two Elizas are distinct. Miss Williams is the early display name, with Eliza Williams/history held until chapter 31. Mrs. Jennings’s chapter-13 paternity gossip is not fact. Mr. Willoughby is the early display name; John Willoughby is held until after chapter 30 (disclosure 30:37). Mrs. Brandon is the elder Eliza in the retrospective story and Marianne at the ending. Bare Dashwood/Ferrars titles need local scene/time disambiguation. Proposed card gates require completed chapters; earlier runtime reveal needs paragraph-level verification. No mention offsets were generated.

Taxonomy and metadata remain proposals: house novel, shelf english-novels, form novel, era modern (19th Century). No unsupported acclaim, featured status or canon/list membership. No Danish/audio content is in scope.

## Reproduce content checks

Use an absolute prefix into this package, never a live edition:

`python3 books/classify-modern-en.py /tmp/tinct-sense-and-sensibility/books/wip/sense-and-sensibility/editions/sense-and-sensibility --gate --per-chapter`

`python3 books/audit-truncation.py /tmp/tinct-sense-and-sensibility/books/wip/sense-and-sensibility/editions/sense-and-sensibility en`

Gate outputs may show `/private/tmp/`, the resolved macOS path of the same checkout. No validation tool was modified.

## Later integration — separate assignment

Proposed primary edition: modern-en. Compare: original-en. Verify the accepted hashes against the package revision and current main; integrate approved onboarding/metadata/taxonomy; generate edition-specific character mentions; enforce exact disclosure gates; run applicable app checks. Original-en offsets cannot be reused in modern-en.

Verify runtime narration eligibility and exact text/language/provider/model/voice/settings cache identity during integration. No audio was generated or claimed available. Changed text must not use stale speech chunks. App integration, main merge, release, deployment and publication remain outside this assignment.
