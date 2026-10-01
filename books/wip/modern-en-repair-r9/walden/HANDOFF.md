# Walden modern-en repair r9 — completed staging handoff

## Result and provenance

Whole-book gate PASS. All 18 chapters are REAL-HEAVY. This is a content-only staging result; live editions are unchanged.

- Repository: `anderskhv/tinct`; branch: `content/modern-en-repair-r9`.
- Only written content path: `books/wip/modern-en-repair-r9/walden/`.
- Pinned source/instruction revision: `ab3cc43f2687e6682833db6a66182d150788ffa4`.
- `walden-original-en.json` is the exact staged live original. `walden-modern-en.before.json` preserves the original live modern target. Both source copies retain their original bytes.
- The initial staging followed the requested live classifier run. This resume also ran `python3 books/classify-modern-en.py walden --per-chapter` and used the staged candidate for all repair gates.
- Resume base: `9ed7f6609f94995cf4820916d85310ec7181ed58`; it already contained chapters 1–8 and 10. This resume authored all 211 paragraphs in chapters 9 and 11–18.
- Pushes after three-chapter batches: `decd2b2c5bd83851492d3503169d09c554e4e10e` (9, 11, 12); `27c6f5daf632735f71cda01b59ab5afcbe54ccb4` (13–15). The final batch contains 16–18 and final validation.
- `git fetch origin` succeeded. Checkout of r9 was blocked by unrelated modified and untracked files. They were preserved. Commits are assembled on the existing r9 branch with an isolated index; the shared active checkout and its index are unchanged.
- No app, registry, live-edition, script, or configuration write. No deployment, narration, or Anthropic/generation API. No regex/dictionary modernization passes.

## Changed coordinates

Coordinates are 1-based. `changed-paragraphs.json` lists all 499 paragraphs changed from the initial live modern text, including 0-based paragraph indices, source/candidate word counts, and ratios. Paragraphs were never merged, split, dropped, or reordered.

| Chapter | Changed paragraphs | Final similarity | Chapter gate |
|---|---|---:|---|
| 1 — Economy | 1–111, 113–134, 136 | 0.423 | PASS |
| 2 — Where I Lived, and What I Lived For | 1–26 | 0.482 | PASS |
| 3 — Reading | 1–12 | 0.479 | PASS |
| 4 — Sounds | 1–27 | 0.430 | PASS |
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
| 16 — The Pond in Winter | 1–23 | 0.426 | PASS |
| 17 — Spring | 1–30 | 0.392 | PASS |
| 18 — Conclusion | 1–24 | 0.425 | PASS |

The three paragraphs unchanged from the initial modern target are 1:112 (short Shakespeare quotation), 1:135 (title), and 10:11 (“O Baker Farm!”). No paragraph over 40 source words remains identical to the original.

The inherited completed chapters received only individually reviewed corrections: 22 paragraph coordinates for exact exclamation counts, recorded in `punctuation-corrections.json`, and 16 for sentence boundaries around tables and verse, recorded in `sentence-boundary-corrections.json`. Their prose was otherwise preserved. Each correction record gives its exact before/after excerpt.

## Gates and invariants

| Metric | Initial live target | Before resume | Final | Required |
|---|---:|---:|---:|---:|
| Weighted similarity | 0.970 | 0.686 | 0.432 | ≤0.750 |
| LIGHT + MECHANICAL | 18/18, 100.0% | 9/18, 50.0% | 0/18, 0.0% | ≤5% |
| Identical long paragraphs | 82/484, 16.9% | 25/484, 5.2% | 0/484, 0.0% | ≤5% |
| Detected truncated quotations | 0 | 0 | 0 | 0 |
| Wrapped scaffolding | 0 | 0 | 0 | 0 |
| Whole-book gate | FAIL | FAIL | PASS | PASS |

Intermediate results: after 9/11/12, 0.591 similarity, 6/18 LIGHT + MECHANICAL, 19/484 identical long; after 13–15, 0.521, 3/18, 12/484. The classifier defines a long paragraph as at least 80 characters. A separate check found zero identical paragraphs over 40 source words.

All 18 chapter numbers/titles and all 502 paragraph counts match. Every paragraph retains at least 75% of the original’s whitespace-delimited word count; the minimum is exactly 75% at 9:22. Every paragraph has exactly its source count of exclamation marks (154 in each whole book). No bracket-count differences, no newly bracketed notes, and no straight quotation marks or apostrophes occur in the candidate. Original curly typography is used throughout. Existing note content is not newly wrapped or replaced by editorial text.

All eighteen chapter reports and `gate-after.txt` use the absolute staged prefix. Final command:

```
python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r9/walden/walden --gate --per-chapter
```

The classifier’s zero quotation-truncation count is supplemented by source comparison during authorship and a final paragraph-ending review. Introductions to quotations and financial tables retain their original paragraph boundaries; incomplete prose around inherited tables/verse was made grammatical without moving content between paragraphs.

## Verse and source presentation

The live JSON flattens verse. Verified line breaks were restored inside existing paragraph strings, preserving each paragraph’s identity. English verse receives only light diction and necessary punctuation changes; Latin is preserved. Asterisk separators already in the original remain. Financial tables stay inside their original paragraphs.

Verified line counts: 2:3 = 2; 2:15 = 4; 5:5 = 3; 8:4 = 2; 8:5 = 2; 10:4 = 6; 10:6 = 4; 10:12 = 2; 10:13 = 2; 10:14 = 4; 10:15 = 6; 1:6 = 2; 1:8 = 2; 1:55 = 3; 1:67 = 6; 1:105 = 2; 1:136 = 28; 4:6 = 3; 4:15 = 2; 4:17 = 7; 6:6 = 4; 6:10 = 4; 6:23 = 2; 6:25 = 2; 7:18 = 2; 9:26 = 10; 11:4 = 2; 11:14 = 8; 13:17 = 10; 13:21 = 4; 13:22 = 14; 14:22 = 1; 16:8 = 3; 17:19 = 2; 17:20 = 2; 17:21 = 4; 17:25 = 11; 18:3 = 4; 18:5 = 2; 18:6 = 2.

Line counts include an existing asterisk separator where present and Carew’s attribution at 1:136. The source layout was checked against [Project Gutenberg ebook 205](https://www.gutenberg.org/cache/epub/205/pg205.txt), retrieved 2026-09-30 and 2026-10-01; passages and coordinates are recorded in `verse-line-reference.txt`. This supplements layout only and does not replace the pinned source baseline.

## Three final spot-reads

1. **Beginning — 1:1:** compared original and candidate. The self-built house, one-mile isolation, Walden Pond, Concord, Massachusetts, manual livelihood, two years and two months, and provisional return to civilized life all remain. This inherited paragraph was not changed in the resume.
2. **Middle — 9:18:** compared the complete long paragraph. The inverted-head gossamer image, doubled sun, swallows/duck/skaters, three- or four-foot fish leap, thistle-down, water-nymph boom, piscine murder, six-rod ripples, quarter-mile _Gyrinus_, two diverging wake lines, vase analogy, pleasure/pain equivalence, dew-like light, and final oar echo remain. Both source exclamations are retained.
3. **End — 18:16:** compared the whole Kouroo staff narrative. The artist’s purpose, rejected sticks and departing friends, Time, ruined Kouroo, dynasty of the Candahars and final ruler’s name, Kalpa, Brahma’s waking and sleeping, ferrule and precious stones, new world, fresh shavings, and single spark kindling a mortal mind remain in sequence.

Additional author checks covered the ant battle and full Kirby/Spence quotation (12:12–14); the ice-bubble measurements and dated freeze records (13:11–12); Cato, Zilpha, Brister/Fenda, Wyman and Quoil (14:2–11); the entire hound narrative and exact ledger figures (15:9–11); Walden/White Pond soundings and ice-harvest accounting (16:6–23); thaw temperatures/dates, sand/leaf anatomy and etymology, all bird calls and Golden Age quotations (17); and the exploration, castles, drummer, poverty, truth, insect-resurrection and dawn arguments (18). These are author spot-reads, not an independent third-party review.

## Known issues and integration scope

- The original’s 17:7 contains two corrupted source-language strings, `?e?ß?` and `??ß??`; the consulted Gutenberg text has the same corruption. They are retained exactly, without conjectural replacement or editorial notes in reading text. The surrounding etymological argument is fully rendered.
- No gate or structural issue remains. No chapter or paragraph is pending. The original’s historical claims, dates, names, terminology and numerical observations are preserved rather than factually revised.
- `books/characters/walden/` exists, including `characters.v1.json`, and was not modified. Integration, character-reference/cache updates, narration and deployment are outside this handoff and were not performed.

## SHA-256

- `walden-original-en.json`: `880a909fb8da73db303b4b2ea43be64a1800bdafd82ffcac7cb2847232ed5cb3`
- `walden-modern-en.before.json`: `d2d20614cb168f7dac5413213f98d41a9d21bd90ac3126fa592e52b58571f8ec`
- `walden-modern-en.json`: `e6bfb94a075f25c959e1e97da77200aef84e40cec89dd9450f4a8f26c0a6ab01`

`SHA256SUMS` covers all package files except itself.
