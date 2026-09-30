# The Communist Manifesto — READY in staging

Branch: `content/modern-en-repair-r1`. Baseline and instruction revision: `221d6b78d950e36ed2b18fbe6fd800cdd7d44abc`.
Owned path: `books/wip/modern-en-repair-r1/communist-manifesto/`.
The original is a byte-for-byte copy of the live original-en at that revision. The modern candidate began as a copy of live modern-en. Chapters 2–5 received direct sentence-by-sentence rendering, without external generation APIs or replacement passes. Chapter 1 remains byte-equivalent as a chapter object; no identical paragraph over 40 words there required an exception.

## Changed paragraphs (one-based, compared with live modern-en)
- Chapter 1: unchanged (REAL).
- Chapter 2: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50
- Chapter 3: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83
- Chapter 4: 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62
- Chapter 5: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
Unchanged headings in chapter 4 retain technical category names. Source quotations in chapter 3 paragraphs 61–62 are retained in full, verbatim; they are the two identical long paragraphs after repair. These exceptions preserve quotations rather than leave unrendered prose.

## Whole-book gates
Before: similarity 0.911; LIGHT/MECHANICAL 4/5 (80.0%); identical long paragraphs 27/194 (13.9%); scaffolding 0; truncated quotations 0; FAIL.
After: similarity 0.491; LIGHT/MECHANICAL 0/5 (0.0%); identical long paragraphs 2/194 (1.0%); scaffolding 0; truncated quotations 0; PASS. Raw results: `gate-before.txt`, `gate-after.txt`; after uses the absolute staged prefix.
Structure: 5 chapters, paragraph counts 6/50/83/62/12, identical to original-en. Every paragraph meets the 75% word-count minimum; smallest ratio 0.750. Every paragraph retains its source exclamation-mark count.

## SHA-256
- `communist-manifesto-modern-en.json`: `5cccffe12e998383856f3d80ba64eddfb5371bbfe0b01cf04d0df503fe6760eb`
- `communist-manifesto-original-en.json`: `8b5b839176167eefeff135ee6e2a66d631af44293367540d09fa92e18cbdd5d3`

## Spot-read notes
- Chapter 2, paragraphs 1–3: class-struggle thesis intact; all opposed social pairs and both possible outcomes retained; Roman and medieval ranks and their subordinate gradations retained.
- Chapter 3, paragraphs 1–3: question about the whole proletariat preserved; Communists are not a separate opposing party and claim no distinct interests. No new qualification added.
- Chapter 4, paragraphs 1–3: both category headings retained; French and English aristocracies, July 1830, English reform agitation, defeat by the upstart, the narrowing to literary struggle, and the obsolete restoration slogans all remain.
Also reviewed the extended crisis argument in chapter 2 paragraph 25; all ten measures in chapter 3; names, quoted philosophical terms, New Jerusalem/Icaria allusions, and reactionary/Utopian distinctions in chapter 4; alliances and concluding imperatives in chapter 5.

## Known issues and integration impact
Source chapter 3 paragraph 67 has damaged wording (“position of ruling as to win”); the candidate renders its recoverable claim, ruling position and victory in the battle of democracy, without importing extra source text. Source chapter 4 paragraph 25 says “world”, not “work”; the candidate keeps “world”. Historical polemic, derogatory descriptions, and the treatment of women remain the authors’ claims. Technical terms bourgeoisie, proletariat, capital, wage-labour, appropriation, and relations/means of production are retained consistently. No known remaining gate or alignment failure; similarity scores alone are not proof of semantic completeness.
`books/characters/communist-manifesto/` exists: false. No character folder is present here to cross-check; later integration should assess character-reference impact. No character files edited.
Staging only: no app, registry, scripts, tests, configuration, publication, or deployment changes. Anthropic API spend: zero.
