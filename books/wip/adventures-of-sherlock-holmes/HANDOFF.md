# NOT READY — resumable content package

Repository: anderskhv/tinct
Branch: content/sherlock-adventures-codex
Checkout/base revision: ab3cc43f2687e6682833db6a66182d150788ffa4
Current instruction revision: 6dd90ae199a4fff7fc4692c0776158d73cbe171c (origin/main fetched 2026-10-01; required policy files unchanged from the base).
Original source checkpoint: 8f8427c9
Nine-story text checkpoint: 209dae8a

Owned content paths only:
- books/wip/adventures-of-sherlock-holmes/
- books/raw/adventures-of-sherlock-holmes/

## Resume point

Resume modern-en at **story 10, The Noble Bachelor, paragraph 1**, followed by The Beryl Coronet and The Copper Beeches. Stories 1–9 are fully rendered. This is a token-limited checkpoint at a complete chapter boundary, not completion of the user's request to make the package ready. Stories 10–12 are absent from modern-en; do not fill them with original text or summaries.

Read each original paragraph in full and render sentence by sentence. Preserve one paragraph per source paragraph, every deduction, named detail, period assumption, allusion, and Watson's voice. The completed candidate meets >=75% of source words in every paragraph as well as every story. No regex or dictionary modernization. Authored JSON chunks under rendering/ mirror the authoritative edition and must stay synchronized during repairs.

Next milestone: complete and independently review stories 10–12, run their three-story gate and the actual whole-book gate, then push. The classifier checks full structure before applying --chapters, so partial candidates need exact completed-story QA snapshot pairs. Never report a snapshot pass as the full-book pass. Once all 12 stories exist, use the authoritative absolute prefix:

`python3 books/classify-modern-en.py /tmp/tinct-sherlock-content/books/wip/adventures-of-sherlock-holmes/editions/adventures-of-sherlock-holmes --gate`

Update the checkout prefix if using another directory; keep it absolute.

## Source and structure

Project Gutenberg #1661, not #48320. Exact bytes, verified Title/Author header, SHA-256 and Denmark/EU/US rights evidence are in books/raw/adventures-of-sherlock-holmes/SOURCE.md. Source was committed and pushed before modernization. Original has 12 flat stories, 2,527 paragraphs and 104,347 whitespace-counted words. JSON shape follows the existing English-original jekyll-and-hyde edition.

Only three standalone internal Roman-numeral divisions in story 1 were removed. Titles 7–12 omit the repeated “The Adventure of” prefix. SOURCE-REVIEW.json records literal headings and exact reading boundaries. All retained source paragraphs map one-to-one to original-en. This new ID has no live reader positions to migrate.

## Current evidence

- Original: independent comparison passed for all 12 stories and all 2,527 paragraphs.
- Modern: nine stories, 1,867 paragraphs. Detailed counts, lengths and changed coordinates in qa/alignment-and-length.json; independent editorial findings in REVIEW.md.
- Gates for 1–4, 3–6, 5–8 and 7–9 passed. Current cumulative 1–9 gate: weighted similarity 0.474, zero LIGHT/MECHANICAL, 1/1,079 byte-identical long paragraphs, no wrapped scaffolding or truncated quotations.
- The unchanged long paragraph is the royal letter at story 1 paragraph 22: Holmes analyses its precise word order.
- Whole-book gate fails honestly at 12 versus 9 stories. No whole-book accepted modern hash exists.
- Source chronology, period claims, stereotypes and factual oddities remain uncorrected. Examples include story 5's Klan account, story 6's names/date/levels and story 8's snake biology.
- All completed edition titles/counts, nonempty paragraphs, chunk mirrors and >=75% paragraph floors pass. All package JSON parses. Onboarding cardinalities pass.
- MANIFEST.json pins exact artifacts, excluding itself to avoid self-reference. Historic QA snapshots describe their checkpoints; ch01-09 is the current cumulative text snapshot.

## Supporting proposals

Onboarding supplies About, three whyItMatters entries, four reading angles, seven cast entries and no acclaim. Characters/proposal.json contains 23 selected identities and alias/spoiler decisions, not generated runtime data or an exhaustive mention inventory. Taxonomy.md proposes accurate short-fiction/detective placement; the existing Novels house and novel-only shelf labels require a separate integration decision. No invented canon/list membership.

## Remaining acceptance and integration

1. Render stories 10–12 and independently review all pairs and repairs. Complete final editorial checks and pass the whole-book gate.
2. Refresh hashes, coordinates, snapshots and acceptance records. Opening text, if required during integration, must come from the accepted opening; no scaffold is supplied.
3. Resolve taxonomy placement and complete/validate runtime character coverage and reveal points under a separate integration assignment. No threads artifact is supplied; assess its usefulness separately.
4. Only after full content acceptance may a separately authorised integration task copy editions/onboarding, register the book, set defaults and truthful alignment flags, validate character links and narration eligibility/cache compatibility, and run app/release checks.

No publication or deployment is authorised. No Danish, narration generation, provider calls, Anthropic API, app/registry edits, scripts/config changes, merge to main, or production uploads were performed.
