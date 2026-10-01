# READY — content package

Repository: anderskhv/tinct
Branch: content/sherlock-adventures-codex
Checkout/base revision: ab3cc43f2687e6682833db6a66182d150788ffa4
Instruction revision: 13608e50e27096e5755e83c20861be22f0b9b9c7 (origin/main fetched 2026-10-01; required workflow/policy files unchanged from the previously read revision).
Original source checkpoint: 8f8427c9
Accepted complete text / final batch checkpoint: 437cfd15
Acceptance: complete content package; not integrated or published.

Owned paths only:
- books/wip/adventures-of-sherlock-holmes/
- books/raw/adventures-of-sherlock-holmes/

## Accepted content

Both editions contain the complete twelve stories as flat chapters, from A Scandal in Bohemia to The Copper Beeches, in the existing English-original jekyll-and-hyde JSON format. Original: 2,527 paragraphs / 104,347 words. Modern: 2,527 paragraphs / 88,823 words. Paragraph counts, titles and numbers align exactly. Every modern paragraph retains at least 75% of source words.

Original SHA-256: `7e9fd4f88f86853ca0428b45fb64ea0e410b37dea5c190711d217cb8fd71e2ed`
Modern SHA-256: `06c86bf1984363f278cccfedd66c8da1acaf8ae845f8b739d6cd377e20c0142f`

MANIFEST.json pins every package artifact except itself. qa/alignment-and-length.json records all changed paragraph coordinates, minimum lengths and the sole unchanged long paragraph (1:22, the royal letter whose word order Holmes analyses). This is a new book ID with no live reader positions to migrate. Authored chunks under rendering/ exactly mirror the accepted edition.

## Source and rights

Project Gutenberg #1661, not #48320. Exact downloaded bytes, verified Title/Author header, source SHA-256 and Denmark/EU/US rights evidence are in books/raw/adventures-of-sherlock-holmes/SOURCE.md. Source was committed and pushed before modernization. Doyle's own English text; no translation, illustration or adaptation included.

Only three standalone internal Roman-numeral divisions in story 1 were removed. Titles 7–12 omit the repeated “The Adventure of” prefix. SOURCE-REVIEW.json records literal headings and exact reading boundaries. All retained source paragraphs map one-to-one to original-en. No boilerplate or illustration captions remain.

## Acceptance evidence

- Independent original comparison: all twelve stories / all 2,527 reading paragraphs, including every opening and ending.
- Independent modern review: every paragraph pair, all length expansions and editorial repairs; accepted with no unresolved findings. See REVIEW.md.
- Mandatory batch gates passed; the final 10–12 gate has similarity 0.512 and no LIGHT/MECHANICAL or identical long paragraphs.
- Authoritative whole-book gate passed: similarity 0.484, zero LIGHT/MECHANICAL, 1/1,484 identical long paragraphs, no wrapped scaffolding or truncated quotations.
- All JSON parses; exact chapter structure, nonempty paragraphs, chunk mirrors and >=75% paragraph floors verified. All short paragraphs read in context; authentic dialogue/signatures, no stubs.
- Sentence-by-sentence prose was authored and revised manually, without regex/dictionary modernization or external generation APIs.
- Source chronology, period language, claims and factual oddities remain uncorrected, including story 5's Klan account, story 6's inconsistencies, story 8's snake biology and story 11's “small wooden thicket”.

Whole-book validation uses the absolute staged prefix:

`python3 books/classify-modern-en.py /tmp/tinct-sherlock-content/books/wip/adventures-of-sherlock-holmes/editions/adventures-of-sherlock-holmes --gate`

Adjust only the checkout prefix if moved. Historical QA snapshot pairs preserve earlier checkpoints, including pre-repair candidates; the authoritative editions and final 10–12 snapshot are current. Earlier incomplete scopes in REVIEW.md are explicitly superseded by final acceptance.

## Supporting proposals and separate integration

Onboarding supplies About, exactly three whyItMatters entries, four reading angles, seven cast entries and no invented acclaim. Characters/proposal.json supplies 23 selected identities with alias and spoiler decisions; it is not an exhaustive runtime mention inventory. Jephro Rucastle is source-attested at 12:64 and 12:122. Taxonomy.md proposes short-fiction/detective placement without changing shared taxonomy.

Content resume point: none. To integrate under separate authorisation:

1. Choose a supported taxonomy mapping for a short-story collection; do not silently classify it as a novel.
2. Complete and validate runtime character coverage, aliases and reveal points. No generated character or threads artifact is supplied; assess threads separately if useful.
3. Copy accepted editions and onboarding, register metadata/defaults and set truthful alignment flags. If openingText is required, derive it from the accepted opening; no placeholder is supplied.
4. Validate runtime narration eligibility and exact text/language/provider/model/voice/settings cache compatibility, using the changed coordinates supplied. Narration generation and provider checks require their own authorised scope.
5. Perform application checks and any separately authorised release. This package itself authorises neither publication nor deployment.

No Danish, narration generation, Anthropic API calls, app/registry edits, scripts/config changes, merge to main or production uploads were performed.
