# Kant Groundwork — READY in staging

Branch: `content/modern-en-repair-r1`. Baseline and instruction revision: `221d6b78d950e36ed2b18fbe6fd800cdd7d44abc`.
Owned folder: `books/wip/modern-en-repair-r1/kant-groundwork/`.
Original copied byte-for-byte from the live original-en at the pinned revision. Modern candidate started as a live modern-en copy. Chapters 3 and 4 now have complete direct sentence-by-sentence modern renderings; their section headings and external quotations retain their content. No external generation API or dictionary/regex rendering pass was used. Chapters 1 and 2 remain exactly equal to the live modern chapter objects; neither has an identical paragraph over 40 words requiring the exception.

## Changed paragraphs (one-based, versus live modern-en)
- Chapter 1: unchanged (REAL).
- Chapter 2: unchanged (REAL).
- Chapter 3: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 95, 98, 101, 102, 103, 104, 105, 106, 107, 108, 109
- Chapter 4: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 44
Unchanged short headings and split heading paragraphs retain their original positions. No paragraphs were combined, divided, dropped, reordered, or added.

## Before and after gates
Before: similarity 0.860; LIGHT/MECHANICAL 2/4 (50%); identical long paragraphs 2/180 (1.1%); scaffolding 0; truncated quotations 0; FAIL.
After: absolute-path whole-book PASS; final metrics and chapter buckets in `gate-after.txt`. Similarity 0.546; LIGHT/MECHANICAL 0/4 (0%); identical long paragraphs 1/180 (0.6%); scaffolding 0; truncated quotations 0.
Structure: 4 chapters, paragraphs 17/23/109/44, matching original-en. All paragraphs meet the 75% source word floor; minimum ratio 0.750. Exclamation-mark counts match source paragraph by paragraph. Chapter 3 and 4 classifications are REAL-HEAVY.

## SHA-256
- `kant-groundwork-modern-en.json`: `57c821d775792c3950f94a6d394e0d556310b21422e2c3bb2e6b63e77b249a9d`
- `kant-groundwork-original-en.json`: `39baa06718f8c7378638c7b389876fae8f5e089aa9774ed8495b6203285e1ae7`

## Spot-read notes
- Chapter 1 paragraphs 1–3: retained existing REAL rendering. Greek division into physics/ethics/logic, formal/material knowledge, nature/freedom, and empirical/pure distinctions remain. Not rewritten.
- Chapter 3 paragraphs 1–3: ordinary practical reason does not make duty empirical; conformity to duty is distinguished from acting from duty; hidden self-love, the difficulty of motive knowledge, and sincere friendship as an a priori demand survive. Every stage of the lengthy third-paragraph argument remains.
- Chapter 4 paragraphs 1–3: freedom explains autonomy; rational will as causality is contrasted with externally determined non-rational causality; the negative definition leads to a positive concept. No empirical proof of freedom is claimed.
Also reviewed the four duty examples, the Juno/cloud allusion, the distinction between spring and motive, market/fancy value versus dignity, the kingdom of ends, autonomy/heteronomy, and the conclusion’s comprehension of incomprehensibility. Preserved quoted formulations and Gospel passage. Terminology follows preserved chapters: metaphysics of morals, good will, duty, maxim, inclination, practical reason; distinctions among analytical/synthetical, hypothetical/categorical, subjective/objective, and a priori/empirical remain explicit.

## Known source issues and integration impact
The baseline has evident textual defects. Chapter 3 paragraph 14 says metaphysics “does allow itself to be checked by anything empirical”; its affirmative polarity is preserved, rather than silently inserting a negation, despite tension with the surrounding argument. Chapter 3 paragraph 92 has a duplicated/broken sentence about actions and will; the candidate expresses its surviving content as actions’ relation to the will’s autonomy and potential universal legislation. Repeated “precepts” and “ourselves”, and unambiguous typographical errors such as “ana” and “motion” for “notion”, are not duplicated in the rendering. Original preface paragraph 7 is damaged; its existing REAL modern rendering remains untouched. This is modernization of the supplied English baseline, not a corrected critical edition.
`books/characters/kant-groundwork/` exists: true. Existing character/reference wording may require a later cross-check against the new wording. No character files edited.
Staging only: no app, registry, script, test, configuration, publication, or deployment changes. Anthropic API spend: zero.
