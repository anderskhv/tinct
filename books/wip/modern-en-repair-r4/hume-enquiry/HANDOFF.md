# Hume Enquiry — modern English repair r4

Status: READY — staged content only; whole-book gate PASS. Not published.

Branch: content/modern-en-repair-r4. Baseline and instruction revision: 221d6b78d950e36ed2b18fbe6fd800cdd7d44abc (remote main confirmed at task start).
Owned path: books/wip/modern-en-repair-r4/hume-enquiry/ only.
The supplied task overrides broader workflow reading and publication instructions. Read a workflow skim and Modern English rules. No Anthropic API usage or other generation API calls.

## Baselines and changes

Copied both live editions from app/public/data/editions/. The staged original is byte-identical to the live original. The staged modern began as the live modern, then received paragraph-by-paragraph authored replacements. No dictionary or regex rendering passes.

One-based chapter and paragraph coordinates below; the exact list is also in changed-paragraphs.json.

- Chapter 7: paragraphs 9.
- Chapter 10: paragraphs 1, 2, 3, 4, 5, 6, 7.
- Chapter 11: paragraphs 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27.
- Chapter 12: paragraphs 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11.
- Chapter 13: paragraphs 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18.
- Chapter 14: paragraphs 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16.
- Chapter 15: paragraphs 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41.
- Chapter 16: paragraphs 1, 2, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34.
- Chapter 17: paragraphs 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17.
- Chapter 18: paragraphs 1, 2, 3, 4, 5, 6, 7, 8, 9.
- Chapter 19: paragraphs 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12.

All LIGHT chapters (10–19) were rendered. Citation-only paragraphs remain verbatim: 14:10; 15:29,39; 16:3–5. Chapters 1–9 remain unchanged except 7:9, the sole source-identical paragraph over 40 words outside the LIGHT group. That paragraph is a Latin quotation: the quotation is preserved verbatim and a full sentence-by-sentence English translation follows within the same paragraph. This preserves the quotation without leaving the reading note untranslated. No chapter or paragraph was merged, split, reordered, dropped, or added. Chapter metadata is unchanged.

## Verification

Absolute-path gate command:

`python3 books/classify-modern-en.py <absolute-checkout>/books/wip/modern-en-repair-r4/hume-enquiry/hume-enquiry --gate --per-chapter`

| Measure | Before | After |
|---|---:|---:|
| Weighted similarity | 0.850 | 0.609 |
| LIGHT + MECHANICAL | 10/19 (52.6%) | 0/19 (0.0%) |
| Identical long paragraphs (gate: >=80 characters) | 5/304 (1.6%) | 0/304 (0.0%) |
| Wrapped scaffolding | 0 | 0 |
| Truncated quotations | 0 | 0 |
| Whole-book gate | FAIL | PASS |

Full classifier output is in gate-before.txt and gate-after.txt. All 19 chapter paragraph counts match the original. No paragraph is below 75% of source word count; no source exclamation count is reduced; no source-identical paragraph over 40 words remains. The minimum whole-book word ratio is 0.750000. Preserved quotations include Cato, Bacon, Hume's miracle maxim and definitions, Latin testimony, and mathematical examples. Impressions, ideas, and custom retain their technical roles.

## Spot reads — first three paragraphs of three chapters

- Chapter 1, paragraphs 1–3: retained live REAL text. The active versus speculative approaches, virtue's attractions, general principles, and ordinary life's dispersal of abstract philosophy remain present. No edits made.
- Chapter 10, paragraphs 1–3: checked against the original. Preserves the separate body/body, mind/body, and will/faculties difficulties; the single-experiment restriction; repetition, custom and the felt transition; billiard balls; and conjoined versus connected. The sceptical conclusion and rhetorical questions remain.
- Chapter 19, paragraphs 1–3: checked against the original. Preserves mitigated/academical scepticism, criticism of dogmatism, learned and unlearned audiences, imagination versus judgment, practical limits, the stone/fire example, and the restriction of inquiry.

## SHA-256

- `changed-paragraphs.json`: `23effcd258a905897b32060571503a351b9a5cc1219ad7982525245661fce249`
- `hume-enquiry-modern-en.json`: `cd8a4daab2bed38c816b79ca74c7d464bbcce9bcc2ef8e1a9ee1f374f0977633`
- `hume-enquiry-original-en.json`: `49ce7d94889fd07f4cad5b5a8e81f15d3fb2c6707c33a6444e961d61d511f8b9`
- `live-modern-en-baseline`: `8b9b306e32e35f9047f4f5247d07562b601024e014d9e93a373e6104204d3290`

## Known issues and integration impact

- No known blocking content issue. The gate is a similarity/structure/scaffolding screen, not independent semantic certification; the prose and listed spot reads were reviewed in this task.
- Source peculiarities remain rather than being silently corrected: chapter 12 paragraph 7 says “evitable” (rendered “avoidable”); chapter 15 paragraph 25 retains the source spellings “Due de Chatillon” and “Amaud”; Latin quotations and bibliographic abbreviations are preserved.
- The Latin quotation at 7:9 now includes its English translation in the same paragraph and is consequently longer; no maximum-length rule was imposed.
- `books/characters/hume-enquiry/` does not exist. No character assets were edited. Any later integration must separately check existing runtime character references and changed-text compatibility; this absence is not repaired by this package.
- Changed text needs its own exact-text narration/cache identity at future integration. No narration, publication, deployment, registry, app, scripts, tests, or configuration changes were made.
