# Walden repair r9 — incomplete checkpoint, not publication handoff

## Scope and provenance

- Repository: anderskhv/tinct.
- Branch: `content/modern-en-repair-r9`.
- Only owned content path: `books/wip/modern-en-repair-r9/walden/`.
- Pinned main/instruction revision: `ab3cc43f2687e6682833db6a66182d150788ffa4`.
- Source: live `app/public/data/editions/walden-original-en.json`; English original by Henry David Thoreau. Its bytes matched pinned remote main before staging.
- Initial target: live `app/public/data/editions/walden-modern-en.json`; its bytes also matched pinned remote main. Preserved unmodified in `walden-modern-en.before.json`.
- `walden-original-en.json` is an exact source copy; `walden-modern-en.json` is the partial candidate.
- Source and target were copied only after running the requested `python3 books/classify-modern-en.py walden --per-chapter`.
- Current remote instruction differences were inspected. Explicit user authorization controls authorship and prohibits integration/deployment.
- Existing shared checkout and its active branch/index were preserved. The content branch is assembled on the previous r9 checkpoint (whose base is pinned main) using an isolated index, adding only this package. No checkout switch or unrelated changes enter the commit.
- No Anthropic or other generation API, no automatic text replacement, no code/script artifact, no deployment, and no live-path write.

## Completed and changed coordinates

Chapter and paragraph coordinates below are 1-based. `changed-paragraphs.json` also supplies the 0-based paragraph index, source/candidate word counts, and word ratio for every changed coordinate.

| Chapter | Changed paragraphs | Gate similarity | Status |
|---|---|---|---|
| 1 — Economy | 1–111, 113–134, 136 | 0.423 | PASS |
| 2 — Where I Lived, and What I Lived For | 1–26 | 0.482 | PASS |
| 3 — Reading | 1–12 | 0.479 | PASS |
| 4 — Sounds | 1–27 | 0.431 | PASS |
| 5 — Solitude | 1–19 | 0.473 | PASS |
| 6 — Visitors | 1–27 | 0.409 | PASS |
| 7 — The Bean-Field | 1–21 | 0.401 | PASS |
| 8 — The Village | 1–6 | 0.450 | PASS |
| 9 — The Ponds | 1–35 | 0.415 | PASS |
| 10 — Baker Farm | 1–10, 12–17 | 0.465 | PASS |
| 11 — Higher Laws | 1–18 | 0.446 | PASS |
| 12 — Brute Neighbors | 1–18 | 0.418 | PASS |
| 13 — House-Warming | 1–22 | 0.464 | PASS |
| 14 — Former Inhabitants and Winter Visitors | 1–26 | 0.423 | PASS |
| 15 — Winter Animals | 1–15 | 0.447 | PASS |

Chapter 10 paragraph 11, “O Baker Farm!”, remains intact. Chapter 2 paragraph 3 and chapter 8 paragraph 4 retain the original quotation wording with restored verse line breaks. No unchanged paragraph over 40 source words remains in these fifteen chapters. No paragraph has been merged, split, reordered, or omitted. Chapters 16–18 are unchanged. Inherited exclamation-count mismatches at 22 coordinates were corrected using individually reviewed punctuation edits; see `punctuation-corrections.json`.

## Gates and structure

| Metric | Before | Checkpoint | Required |
|---|---:|---:|---:|
| Weighted similarity | 0.970 | 0.521 | ≤0.750 |
| LIGHT + MECHANICAL chapters | 18/18, 100.0% | 3/18, 16.7% | ≤5% |
| Identical long paragraphs (classifier: ≥80 characters) | 82/484, 16.9% | 12/484, 2.5% | ≤5% |
| Detected truncated quotations | 0 | 0 | 0 |
| Wrapped scaffolding | 0 | 0 | 0 |
| Whole-book acceptance | FAIL by thresholds | FAIL | PASS |

All 18 chapters and 502 paragraphs align with the original. All candidate paragraphs meet the requested 75% source-word minimum; the minimum in completed chapters is 75.1524% (chapter 1 paragraph 74). 9 paragraphs over 40 source words remain byte-identical to the original, all in unfinished chapters; their coordinates are recorded in `qa-checkpoint.json`. Every paragraph’s exclamation count now exactly matches the original.

The fifteen individual gate reports and `gate-after.txt` were generated with the absolute staged prefix, not the live book ID. Whole-book command:

```
python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r9/walden/walden --gate --per-chapter
```

The classifier detects one kind of quotation truncation; its zero count is not a substitute for editorial review. Completed paragraphs were read against their source during rendering; full-book editorial acceptance remains pending.

## Verse and quotation handling

The live JSON has flattened the verse into single lines. For the completed chapters, verified line boundaries were restored within the existing paragraph strings, preserving paragraph identity. Line counts: 2:3 = 2; 2:15 = 4; 5:5 = 3; 8:4 = 2; 8:5 = 2; 10:4 = 6; 10:6 = 4; 10:12 = 2; 10:13 = 2; 10:14 = 4; 10:15 = 6. Additional verified line counts: 1:6 = 2; 1:8 = 2; 1:55 = 3; 1:67 = 6; 1:105 = 2; 1:136 = 28 (27 verse lines and attribution); 4:6 = 3; 4:15 = 2; 4:17 = 7; 6:6 = 4; 6:10 = 4; 6:23 = 2; 6:25 = 2; 7:18 = 2. Newly restored verse line counts: 9:26 = 10; 11:4 = 2; 11:14 = 8 (seven verse lines and the asterisk separator). Further verse line counts: 13:17 = 10; 13:21 = 4; 13:22 = 14; 14:22 = 1. Existing asterisk separators remain. Financial tables in Economy and The Bean-Field are laid out within the existing paragraphs.

Layout was checked against [Project Gutenberg ebook 205](https://www.gutenberg.org/cache/epub/205/pg205.txt), retrieved 2026-09-30 and 2026-10-01; the exact relevant passages are in `verse-line-reference.txt`. This reference does not replace the pinned live original as the content baseline. Dated English verse wording is lightly rendered; the Latin quotation is retained. Quotations remain full, either retained verbatim where clear or rendered completely into contemporary English. No new omission ellipses were introduced.

## Spot-reads

- 1:1–3: origins, reader questions, Brahmins, Hercules and Iolas preserved. 1:35–45 retain the basket seller and clothing/fashion arguments. 1:46–69 retain Gookin, New Netherland, full housing quotations, measurements, dates, Collins purchase and animal aftermath. 1:74–103 retain architectural analogies, all financial line items and totals, education/knife/navigation, oxen, Pyramids, and Cato's full Latin recipe and translation. 1:114–118 preserve the entire Mucclasse busk quotation; 1:133 preserves Sadi's cypress passage; 1:136 retains all 27 Carew verse lines and attribution.
- 4:1–3: morning, furniture and botanical details retained. 4:13 keeps the full cargo inventory and places, including John Smith and Cuttingsville. 4:22–27 retain bird timing, owl and frog calls, and domestic/sound inventory.
- 6:1–3: chairs and conversational metaphors preserved. 6:7 keeps Winslow and Massasoit's complete episode. 6:9–17 preserve the Canadian woodcutter's observations and the four-line Homer quotation. 6:18–21 retain the pauper's direct statement, fugitive slave and hospitality pun. 6:22–27 retain the visitor inventory and harriers.
- 7:1–11: seven-mile rows, Antæus, childhood landscape, arrowheads, fieldwork, Virgil, martial irony, Pythagoras, Evelyn and Digby retained. 7:13 and 7:15 preserve every financial item and total. 7:17–21 preserve moral crops, Ceres, Jove, Plutus, Cato, Varro and seed etymologies.

- 2:1–3: imaginary farm purchases, word/deed and seat puns, ten-cent/ten-dollar arithmetic, retained landscape, and the survey quotation remain. 2:17–20 retain Aurora, Tching-thang, mosquito/Homer, the deliberate-life argument, and the railway sleepers double meaning. 2:25–26 preserve the Realometer, scimitar, stream/eternity, and mining sequence.
- 3:1–3: Egyptian/Hindoo philosopher, Mîr Camar Uddîn Mast’s entire quotation, Homer/Æschylus, Delphi/Dodona, and the distinction between spoken and written language remain. 3:8 and 3:12 retain Zebulon/Sephronia, the mock novel advertisement, the monetary amounts, Abelard, and the bridge over ignorance.
- 5:1–3: evening sounds, signs left by visitors, all distances, and the fishermen in their inward Walden remain. 5:6 retains the lightning dimensions and eight-year interval. 5:17–19 preserve Goffe/Whalley, Nature’s elderly gardener, Acheron/Dead Sea, old Parr, and Hygeia/Æsculapius/Hebe/Juno/Jupiter/Aurora.
- 8:1–3: village gauntlet, Redding & Company, Etesian winds, Orpheus, navigation in darkness, the two fishermen, arrest, Fair-Haven Hill, unlocked house, and Pope’s Homers remain. Final Latin, English verse, and wind/grass quotation are complete.
- 10:1–3: botanical inventory, measurements, Flint’s Pond/Valhalla, Cellini’s St. Angelo halo, and Pleasant Meadow remain. 10:7–10 retain the Field family details, $10/acre and one-year terms, labor/food arithmetic, well and water episode, and Good Genius speech. 10:12–17 retain all verse units, Guy Faux, changed boat seats, and the talaria image.

- 9:1–3, 5, 18, 30, 33, 35: fishing and boating observations, pond colors, precise dimensions and dates, named species and Latin names, the sandy-bank echo, Flint’s ownership satire, and the concluding jewel image retained. 9:26 retains ten verse lines.
- 11:1–3, 7, 10–14, 18: the opposed higher and animal instincts, hunting and diet arguments, Thseng-tseu, Mencius, the Vedas and Vedant, and John Farmer’s entire closing episode retained. Chaucer’s two lines and the beast poem preserve their line counts and all exclamations.
- 12:1–3, 12–18: Hermit/Poet dialogue, ant-battle participants and historical allusions, full Kirby and Spence quotation, winged-cat measurements, and the loon’s dive-and-pursuit observations retained.

- 13:1, 11, 12: ground-nut revival and Indian Ceres/Minerva retained; every ice-bubble measurement, observed melting layer, freeze date and wood-hauling detail retained. 13:6 preserves Cato’s complete Latin and English quotation; 13:17 and 13:21–22 preserve the poems’ 10/4/14 lines with lightly modernized diction.
- 14:2–4, 7–13, 21–26: Cato, Zilpha, Brister and Fenda, the fire and Gondibert jokes, Wyman, Quoil’s Waterloo and death, cellar/well/lilac observations, philosopher conversation and Vishnu Purana hospitality quotation retained. All three exclamations in 14:24 remain.
- 15:2, 5, 9–11, 14–15: owl/goose exchange and Concord pun, squirrel’s whole corn journey, both hound narratives, Burgoyne/Bugine, ledger dates and exact prices, and the hare’s transformation from frailty to vigor retained.

These are author spot-reads, not an independent editorial review. Required whole-book first/middle/last-chapter acceptance reads remain pending, since the last chapter is not yet repaired.

## Characters and integration

`books/characters/walden/` exists, including `characters.v1.json`, locally and at the pinned remote revision. It was not modified. Future integration must review character-reference compatibility at changed paragraph coordinates and exact text/cache identity. No narration was generated and no application or registry work is included.

## Known issues and resume point

This is not a completed repair. Chapters 16–18 remain MECHANICAL and retain the live target text. Their verse formatting and quotations still need full review. Similarity and identical-paragraph rates pass numerically; chapter-classification still fails. Full semantic and independent review remain outstanding. Do not publish or promote this candidate.

At the start of this resume: similarity 0.686, 9/18 LIGHT + MECHANICAL chapters (50.0%), 25/484 identical long paragraphs (5.2%). After chapters 9, 11 and 12: 0.591, 6/18 (33.3%), 19/484 (3.9%). After chapters 13–15: 0.521, 3/18 (16.7%), 12/484 (2.5%). There are 422 changed paragraphs across 425 completed aligned paragraphs. Economy 1:112 (short Shakespeare quotation), 1:135 (title), and Baker Farm 10:11 remain unchanged from the initial modern text. The source and pre-repair target copies remain byte-identical.

Checkpoint is at a chapter boundary; no unfinished paragraph or partial chapter is presented as repaired. Resume at **chapter 16, The Pond in Winter, paragraph 1 (index 0)**, then chapters 17–18 and all remaining identical paragraphs over 40 words. Preserve completed chapters 1–15. Obtain whole-book PASS before rewriting this as an accepted handoff.

Requested fetch succeeded. Requested checkout was blocked by unrelated local modifications and existing staging files. These were preserved; the checkpoint commit uses an isolated index on the existing r9 branch. The shared active checkout is unchanged.

## SHA-256

- `walden-original-en.json`: `880a909fb8da73db303b4b2ea43be64a1800bdafd82ffcac7cb2847232ed5cb3`
- `walden-modern-en.before.json`: `d2d20614cb168f7dac5413213f98d41a9d21bd90ac3126fa592e52b58571f8ec`
- `walden-modern-en.json`: `31cb53044909762dedd43a2e42c7d3f206d1ee91e00e51da443b782bf26cf80f`
