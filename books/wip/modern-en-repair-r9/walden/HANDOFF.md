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
- Existing shared checkout and its active branch/index were preserved. The content branch is assembled against pinned main using an isolated index, adding only this package. No checkout switch or unrelated changes enter the commit.
- No Anthropic or other generation API, no automatic text replacement, no code/script artifact, no deployment, and no live-path write.

## Completed and changed coordinates

Chapter and paragraph coordinates below are 1-based. `changed-paragraphs.json` also supplies the 0-based paragraph index, source/candidate word counts, and word ratio for every changed coordinate.

| Chapter | Changed paragraphs | Gate similarity | Status |
|---|---|---|---|
| 2 — Where I Lived, and What I Lived For | 1–26 | 0.482 | PASS |
| 3 — Reading | 1–12 | 0.478 | PASS |
| 5 — Solitude | 1–19 | 0.473 | PASS |
| 8 — The Village | 1–6 | 0.450 | PASS |
| 10 — Baker Farm | 1–10, 12–17 | 0.465 | PASS |

Chapter 10 paragraph 11, “O Baker Farm!”, remains intact. Chapter 2 paragraph 3 and chapter 8 paragraph 4 retain the original quotation wording with restored verse line breaks. No unchanged paragraph over 40 source words remains in these five chapters. No paragraph has been merged, split, reordered, or omitted. No changes were made to the other 13 chapters.

## Gates and structure

| Metric | Before | Checkpoint | Required |
|---|---:|---:|---:|
| Weighted similarity | 0.970 | 0.888 | ≤0.750 |
| LIGHT + MECHANICAL chapters | 18/18, 100.0% | 13/18, 72.2% | ≤5% |
| Identical long paragraphs (classifier: ≥80 characters) | 82/484, 16.9% | 69/484, 14.3% | ≤5% |
| Detected truncated quotations | 0 | 0 | 0 |
| Wrapped scaffolding | 0 | 0 | 0 |
| Whole-book acceptance | FAIL by thresholds | FAIL | PASS |

All 18 chapters and 502 paragraphs align with the original. All candidate paragraphs meet the requested 75% source-word minimum; the minimum in completed chapters is 81.5981% (chapter 2 paragraph 22). 41 paragraphs over 40 source words remain byte-identical to the original, all in unfinished chapters; their coordinates are recorded in `qa-checkpoint.json`.

The five individual gate reports and `gate-after.txt` were generated with the absolute staged prefix, not the live book ID. Whole-book command:

```
python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r9/walden/walden --gate --per-chapter
```

The classifier detects one kind of quotation truncation; its zero count is not a substitute for editorial review. Completed paragraphs were read against their source during rendering; full-book editorial acceptance remains pending.

## Verse and quotation handling

The live JSON has flattened the verse into single lines. For the completed chapters, verified line boundaries were restored within the existing paragraph strings, preserving paragraph identity. Line counts: 2:3 = 2; 2:15 = 4; 5:5 = 3; 8:4 = 2; 8:5 = 2; 10:4 = 6; 10:6 = 4; 10:12 = 2; 10:13 = 2; 10:14 = 4; 10:15 = 6. Existing asterisk separators remain.

Layout was checked against [Project Gutenberg ebook 205](https://www.gutenberg.org/cache/epub/205/pg205.txt), retrieved 2026-09-30; the exact relevant passages are in `verse-line-reference.txt`. This reference does not replace the pinned live original as the content baseline. Dated English verse wording is lightly rendered; the Latin quotation is retained. Quotations remain full, either retained verbatim where clear or rendered completely into contemporary English. No new omission ellipses were introduced.

## Spot-reads

- 2:1–3: imaginary farm purchases, word/deed and seat puns, ten-cent/ten-dollar arithmetic, retained landscape, and the survey quotation remain. 2:17–20 retain Aurora, Tching-thang, mosquito/Homer, the deliberate-life argument, and the railway sleepers double meaning. 2:25–26 preserve the Realometer, scimitar, stream/eternity, and mining sequence.
- 3:1–3: Egyptian/Hindoo philosopher, Mîr Camar Uddîn Mast’s entire quotation, Homer/Æschylus, Delphi/Dodona, and the distinction between spoken and written language remain. 3:8 and 3:12 retain Zebulon/Sephronia, the mock novel advertisement, the monetary amounts, Abelard, and the bridge over ignorance.
- 5:1–3: evening sounds, signs left by visitors, all distances, and the fishermen in their inward Walden remain. 5:6 retains the lightning dimensions and eight-year interval. 5:17–19 preserve Goffe/Whalley, Nature’s elderly gardener, Acheron/Dead Sea, old Parr, and Hygeia/Æsculapius/Hebe/Juno/Jupiter/Aurora.
- 8:1–3: village gauntlet, Redding & Company, Etesian winds, Orpheus, navigation in darkness, the two fishermen, arrest, Fair-Haven Hill, unlocked house, and Pope’s Homers remain. Final Latin, English verse, and wind/grass quotation are complete.
- 10:1–3: botanical inventory, measurements, Flint’s Pond/Valhalla, Cellini’s St. Angelo halo, and Pleasant Meadow remain. 10:7–10 retain the Field family details, $10/acre and one-year terms, labor/food arithmetic, well and water episode, and Good Genius speech. 10:12–17 retain all verse units, Guy Faux, changed boat seats, and the talaria image.

These are author spot-reads, not an independent editorial review. Required whole-book first/middle/last-chapter acceptance reads remain pending, since those chapters are not yet repaired.

## Characters and integration

`books/characters/walden/` exists, including `characters.v1.json`, locally and at the pinned remote revision. It was not modified. Future integration must review character-reference compatibility at changed paragraph coordinates and exact text/cache identity. No narration was generated and no application or registry work is included.

## Known issues and resume point

This is not a completed repair. Chapters 1, 4, 6, 7, 9, 11–18 remain LIGHT or MECHANICAL and retain the live target text. Their verse formatting and quotations still need full review. Whole-book similarity, chapter-classification, and identical-paragraph gates fail. Full semantic and independent review remain outstanding. Do not publish or promote this candidate.

Stop is at a chapter boundary for the turn budget; no unfinished paragraph or partial chapter is presented as repaired. Resume at **chapter 1, Economy, paragraph 1 (index 0)**. Preserve completed chapters 2, 3, 5, 8, 10. After the remaining chapters and all identical paragraphs over 40 words are repaired, rerun all checks and obtain a whole-book PASS before rewriting this as an accepted handoff.

## SHA-256

- `walden-original-en.json`: `880a909fb8da73db303b4b2ea43be64a1800bdafd82ffcac7cb2847232ed5cb3`
- `walden-modern-en.before.json`: `d2d20614cb168f7dac5413213f98d41a9d21bd90ac3126fa592e52b58571f8ec`
- `walden-modern-en.json`: `5db1b0f0bcf5d46839da702b51bce945da7b362867a7524b8fc36616231fad06`
