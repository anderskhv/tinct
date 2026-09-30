# Jungle Book — modern English repair r3

**READY: whole-book gate PASS.** Staged content replacement, not published.

## Provenance and ownership

Repository: anderskhv/tinct. Source and instruction revision: `221d6b78d950e36ed2b18fbe6fd800cdd7d44abc`, verified against remote main at task start. Read the requested skim of BOOK-TASK-WORKFLOW.md and the Modern English section of books/AGENTS.md.

The staged original is byte-identical to the live original at that revision. The candidate began as a copy of its live modern edition. All seven baseline chapters were LIGHT or MECHANICAL; all seven have now been rendered sentence by sentence. No originally REAL or REAL-HEAVY chapter was changed.

Owned content: `books/wip/modern-en-repair-r3/jungle-book/` only. No app, registry, live edition, character, script, test, or configuration changes. No API generation, Anthropic spend, deployment, or publication.

Target branch: `content/modern-en-repair-r3`. The shared checkout belongs to other work on r4, so the content commit uses a separate temporary Git index and updates only the r3 ref. The shared index and checkout remain untouched. Publication and integration are outside this handoff.

## Changed chapter and paragraph list

One-based indexes, compared to the pinned live modern edition. Full explicit lists are in changed-paragraphs.json. Unlisted paragraphs are existing headings, labels, or already-current verse retained intact.

- Chapter 1, Mowgli's Brothers: paragraphs 1–149, 151–152, 154 (152 changed).
- Chapter 2, Kaa's Hunting: paragraphs 1–99, 101–175, 177–181 (179 changed).
- Chapter 3, "Tiger! Tiger!": paragraphs 1–119 (119 changed).
- Chapter 4, The White Seal: paragraphs 1, 3–107, 109–115 (113 changed).
- Chapter 5, "Rikki-Tikki-Tavi": paragraphs 1–114, 116–121 (120 changed).
- Chapter 6, Toomai of the Elephants: paragraphs 1–84, 86–89 (88 changed).
- Chapter 7, Her Majesty's Servants: paragraphs 1–150, 153, 155, 157–158, 160–161, 163, 165 (158 changed).

## Whole-book gate

| Measure | Before | After | Required |
| --- | --- | --- | --- |
| Weighted similarity | 0.972 | 0.433 | <=0.750 |
| LIGHT + MECHANICAL | 7/7 (100.0%) | 0/7 (0.0%) | <=5% |
| Identical long paragraphs | 374/812 (46.1%) | 3/812 (0.4%) | <=5% |
| Wrapped scaffolding | 0 | 0 | 0 |
| Truncated quotations flagged | 0 | 0 | 0 |
| Result | FAIL | PASS | PASS |

All seven chapters are REAL-HEAVY. The classifier defines long paragraphs as >=80 characters. It was run unchanged with the absolute staged prefix. Complete reports are before-gate.txt and after-gate.txt; earlier chapter-only reports are historical checkpoints.

```sh
python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r3/jungle-book/jungle-book --gate --per-chapter
```

## Validation

- Paragraph counts exactly match original-en: 154, 181, 119, 115, 121, 89, 165 (944 total).
- Every paragraph retains >=75% of its source's whitespace-delimited words. Minimum ratio: 0.750000, chapter 4, paragraph 7. Short candidates were individually reread and expanded, not processed through a word dictionary or regex renderer.
- Original exclamation-mark counts match in every paragraph. Candidate curly dialogue quotations balance in every paragraph.
- Every poem retains its source paragraph and embedded line divisions, including repeated refrains. The source's prose wrapping in chapter 3 paragraph 39 was normalized; it is not verse.
- Source paragraph 3.42's typo dhk is rendered dhâk, matching the same tree in source paragraph 3.39. Source paragraph 2.128's unclosed dialogue quotation is closed without omitting speech.
- Candidate non-paragraph metadata is unchanged from the pinned live modern edition. Original source copy is byte-identical.
- Editorial checks retained the Law's allowance for members of the Pack (including Baloo) to sponsor Mowgli, the bull buying his place in the Pack, the sea cows stopping travel to feed at night, full travel itineraries, named weapons and military units, religious and literary allusions, and period language. No historical claims were silently corrected.

## Spot reads: first three paragraphs of three chapters

1. **Chapter 1, paragraphs 1–3.** Nine-line Night-Song including attribution retained. The prose preserves seven o'clock, Seeonee, four cubs, Father's waking movements, the cave, Tabaqui's entry and complete blessing. The jackal description preserves Dish-licker, refuse, fear of madness, the tiger's flight, hydrophobia and dewanee.
2. **Chapter 2, paragraphs 1–3.** First maxim remains a single source paragraph, and the next retains five lines and Sister/Brother/Bear/first-kill details. The long lesson keeps the entire Hunting Verse and Tabaqui/Hyaena exception, Bagheera's visit, climbing/swimming/running comparison, Wood and Water Laws, hive fifty feet up, Mang at noon, water-snakes, and both Strangers' Hunting Call quotations.
3. **Chapter 3, paragraphs 1–3.** Eight-line call-and-response opening preserved. Nearly twenty miles, plain/ravines, hoe-cut forest boundary, cattle/buffaloes, pariah dogs, hunger and thorn gate remain. The food gesture, single street, priest's white clothes and red-and-yellow forehead mark, at least a hundred onlookers, and their reactions remain.

## SHA-256

- jungle-book-original-en.json: `f1a9afbb1c7ee5ab30915e4c394588f6537ed74adc0880d514ff850b61e17d0b`
- jungle-book-modern-en.json: `b6b99a55ce2c4bd26f8b43f45c02b56bc75ce24cbc7d9457b9db8b1cf9ee0823`

Also recorded in SHA256SUMS.

## Known issues and integration impact

No outstanding structural or similarity-gate failures. Automated quotation detection is heuristic; these checks are not a claim of independent literary certification. Poems retain some intentional poetic diction and period phrasing. This package has not been published.

`books/characters/jungle-book/` does not exist at the pinned revision. There is no character-source package at that requested path to reconcile with the replacement. Impact noted only; no character files were edited, and no claim is made about assets at other paths.

Genealogy of Morals is not started. It remains the next book in the original ordered assignment, after this accepted Jungle Book package is committed and pushed.
