# A Little Princess — repair r6

Content candidate: whole-book similarity gate PASS. Not integrated or published.

## Provenance and scope

Repository: anderskhv/tinct. Policy and live-edition baseline: origin/main `ab3cc43f2687e6682833db6a66182d150788ffa4`. Read current book workflow, README, STRATEGY, root/books AGENTS, books/CLAUDE, and workflow boundaries. The explicit user assignment authorizes this content rendering and limits writes to `books/wip/modern-en-repair-r6/a-little-princess/`.

Copied `app/public/data/editions/a-little-princess-original-en.json` and `a-little-princess-modern-en.json` byte-for-byte into this package. The latter snapshot is retained as `a-little-princess-live-modern-en.json`; the candidate retains the normal modern-en filename. Both live baselines were verified equal to the pinned remote main files. No new source or mixed translation was used.

## Changes

Coordinates are one-based chapter and paragraph positions. Fully rendered chapters: 1 (1–74), 2 (1–44), 4 (1–56), 9 (1–91), 10 (1–59), 11 (1–46), 12 (1–58), 13 (1–96), 14 (1–35), 19 (1–45). Necessary short labels and brief speech may remain verbatim. The exact 603 changed coordinates are in `changed-paragraphs.json`.

REAL chapters 3, 5–8, 16–18 remain unchanged. Chapter 15 remains unchanged except paragraph 28, the sole paragraph exceeding 40 words that was identical to the original within a REAL chapter. No identical paragraph exceeding 40 source words remains anywhere in the candidate. Chapter metadata and all 19 chapter/1,701 paragraph boundaries are preserved.

Prose was composed paragraph by paragraph in the agent conversation. No dictionary or regex modernization pass, generation script, or Anthropic API was used.

## Gate evidence

| Metric | Before | After | Limit |
|---|---:|---:|---:|
| Weighted similarity | 0.852 | 0.632 | ≤0.75 |
| LIGHT + MECHANICAL | 10/19 (52.6%) | 0/19 (0.0%) | ≤5% |
| Identical long paragraphs (classifier: ≥80 characters) | 46/1224 (3.8%) | 20/1224 (1.6%) | ≤5% |
| Wrapped scaffolding | 0 | 0 | 0 |
| Truncated quotations flagged | 0 | 0 | 0 |

Reports: `gate-before.txt`, `gate-after.txt`. Final command used an absolute staged prefix:

`python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/middlemarch-mm-f/books/wip/modern-en-repair-r6/a-little-princess/a-little-princess --gate --per-chapter`

Exit status 0. All changed paragraphs meet ≥75% of the corresponding source word count; minimum is exactly 0.75. Source exclamation-mark counts match in every changed paragraph. JSON parses; chapter/paragraph counts and metadata agree. `validation.json` records the checks. The classifier detects a limited ellipsis-based truncation pattern; its zero does not stand in for editorial reading.

## Spot-reads

Read original and candidate openings, chapter 1 paragraphs 1–3: winter fog, gaslit windows, cab, posture, seven-year-old Sara and her unusually mature thoughts remain. Read middle chapter 10 paragraphs 1–3: weather, solitary errands, clothing, all eight Montmorency names, family activity, and narrative irony remain. Read closing chapter 19 paragraphs 1–3: nursery excitement, ironic delight in attic stories, banquet account, and Uncle Tom transition remain.

Additional checks during rendering: chapter 1 school sign, Missee Sahib, ayah, Lady Meredith, and Barrow & Skipworth; chapter 2 French phrases and Mariette's French quotations; chapter 4 heaven's lilies, pearl/gold walls and all dialogue exclamations; chapter 9 rat family and complete Bastille knocking messages; chapter 10 complete invented family names and sixpence transaction; chapter 11 Marie Antoinette/Widow Capet and Alfred the Great; chapter 12 Carew/Crewe uncertainty, Moscow, Eton, Little Missus; chapter 13 fourpence, six buns, five given away, and Moscow departure; chapter 14 skylight logistics and silent nails; chapter 19 Boris's collar, bread scheme, and Anne's recognition. Corrected the chapter 10 arrival to say up the steps, not upstairs.

## SHA-256

- Original: `db6f42f1bdcc817ab8762339790b40606fd6512e95464ef4222af6e86aed1cdb`
- Live modern baseline: `5e359e936c37e8e79ea7738597da244b7356369558e59ada48fc0f32fde8a020`
- Repaired modern candidate: `0c85e130eb972dc490e337dc6e11a8c35930b29b6b34ea1c9740d80821e85b1e`

Also recorded in `SHA256SUMS`.

## Known issues and integration notes

- Two existing word-floor exceptions are retained to obey “leave REAL chapters alone”: 15:80 is 5/9 words (source includes an editorial variant note); 18:7 is 10/15 words (existing compact equivalent). Neither was introduced by this repair. Thus the ≥75% guarantee covers all newly rendered paragraphs, not every inherited REAL paragraph.
- No independent editorial review is claimed. The rendering and spot-reads were performed in this task.
- `books/characters/a-little-princess/` does **not** exist. No character files were created or changed. Publication must check existing runtime character mentions against the attached changed coordinates and use exact new text identity for speech caches.
- The 20 remaining classifier-identical long paragraphs are all 40 words or fewer and occur in preserved REAL chapters. Their aggregate is below the gate threshold.
- No app, registry, live editions, scripts, configuration, deployment, or narration changes are included. This is a staging-only content handoff.
