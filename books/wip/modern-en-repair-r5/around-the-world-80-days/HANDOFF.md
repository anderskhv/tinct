# Around the World in Eighty Days — r5 content handoff

Status: whole-book classifier PASS; staged content only, not published.

## Ownership and provenance

Repository: anderskhv/tinct. Branch: content/modern-en-repair-r5.
Only books/wip/modern-en-repair-r5/around-the-world-80-days/ is owned by this package.
Instructions read from origin/main ab3cc43f2687e6682833db6a66182d150788ffa4, including the book workflow, README, strategy, AGENTS files, CLAUDE content guide and workflow boundaries. The user's explicit content-authoring assignment and path restrictions govern this work.
Working baseline: 70defe6ef; its parent is 221d6b78d. The baseline includes an earlier Magna Carta staging commit, not authored in this assignment. No other stream's files were included in this package commit. Another active task changed the shared checkout branch during authoring; this package is committed through a private Git index directly to r5, without switching or altering that task's branch.
The two edition inputs were copied byte-for-byte from app/public/data/editions/. Their contents matched origin/main at the instruction revision above. No new source was downloaded; original-en is the pinned live English source. This package does not independently certify an upstream translator or source edition because no books/raw/around-the-world-80-days/ provenance folder exists in this checkout.

## Repair scope and coordinates

Sentence-level prose was authored directly, without regex/dictionary rewriting or content-generation API calls.
All 20 initially LIGHT chapters were rewritten: 2–10, 14, 16, 18, 19, 31–37. There were no MECHANICAL chapters.
The 17 REAL chapters were left exactly unchanged: 1, 11–13, 15, 17, 20–30.
All five initially identical paragraphs exceeding 40 words were in rewritten chapters: 3:28, 6:7, 9:30, 33:38, 33:60.
Exact changed coordinates and word counts are in changed-paragraphs.json, using 1-based chapter and paragraph numbers. There are 745 changed paragraphs; unchanged short responses, signatures and names inside repaired chapters were retained where already natural.
Chapter titles and all non-paragraph metadata remain unchanged. There are still 37 chapters and 1,613 paragraphs, with identical counts in every chapter. No paragraph was merged, split, dropped or reordered.

## Gate evidence

| Measure | Live before | Staged after |
|---|---:|---:|
| Weighted similarity | 0.835 | 0.625 |
| LIGHT + MECHANICAL | 20/37 (54.1%) | 0/37 (0.0%) |
| Identical long paragraphs (classifier: >=80 characters) | 70/1006 (7.0%) | 4/1006 (0.4%) |
| Wrapped scaffolding | 0 | 0 |
| Truncated quotations | 0 | 0 |
| Gate | FAIL | PASS |

before-gate.txt and after-gate.txt contain the full per-chapter reports. The final whole-book command used the absolute staged prefix with the unmodified books/classify-modern-en.py and --gate. No threshold was altered.
There are zero remaining identical source paragraphs over 40 words. Every changed paragraph is at least 75% of its source word count; the minimum is exactly 0.75. Exclamation-mark counts match the source in every changed paragraph. JSON loads and structural checks passed. See validation.json.

## SHA-256

- Original: e23ae1708c6e03657d0f542e70465cc32ba772fd21a6936d9cf7f1a63b5417d9
- Live modern before: 13b90c0526762af96d550fa512941dff043473c31c55efa877bb9465770745af
- Staged modern: 834deaf955b4642198f078c721910e65c4f4a77da19131f913cd13d0c40d46d3

SHA256SUMS repeats the file-specific hashes. live-modern-en.before.json is the immutable pre-repair comparison copy.

## Spot-reads and editorial checks

- 1:1–3: untouched REAL opening; Saville Row, Sheridan, Byron, the institutions and Reform membership retained.
- 2:3, 2:6–7: appearance, Leroy chronometer, Minerva's eighteen hairstyles and Longferry's conduct retained; no biographical details dropped.
- 3:1, 3:11, 3:27–28, 3:59–64: meals, bank-theft anecdote, complete eight-leg itinerary and durations, wager sums and deadline retained. The timetable remains one paragraph with its closing quotation.
- 7:30–39 and 8:19–27: every itinerary entry retained; London-time watch joke and source's contradictory weekday references preserved.
- 10:6, 10:17–19: named sights, festival clothing and music, religious restrictions and temple fight retained.
- 14:8–10: Ucaf Uddaul's quotation fully rendered, retaining Kama, Himalaya, Ceylon, Golconda, Vicvarcarma and every successive bodily/poetic comparison. 14:23–25 retains deities and the train's named places.
- 19:1–3: middle-book opening read against source; Treaty of Nankin, trading rivalry, urban features, harbour vessels and yellow-clothing anecdote retained. 19:10–11 and 19:53–70 preserve opium-house description, accusation, refusal, and drugging, without sanitising the narrator's historical judgments.
- 31:14, 31:20–28: sailing-sledge construction, rigging, route, fifth/octave observation and wolf danger retained.
- 33:15–24, 33:38–61: coal problem, purchase price, residual hull/engine, destruction sequence and Queenstown shortcut retained.
- 34:9–11 and 34:23: source's watch/clock anomaly and translator's footnote remain rather than silently correcting the baseline.
- 35:25–44: proposal, reciprocal gratitude, Fogg's isolation and declaration retained in full.
- 36:7–18: source timing discrepancy retained (twenty minutes asserted at 8:20 versus an 8:45 deadline).
- 37:1–3: final chapter opening spot-read against source. 37:21–26 preserves the 360 × four-minute explanation, eighty versus seventy-nine meridian passages, profits, reward division and gas charge. 37:32–41 preserves wedding, seventy-eight-day possibility and closing ironic question.

This is the authoring agent's review, not a claimed independent editorial review.

## Known issues and integration boundary

Five pre-existing short paragraphs in untouched REAL chapters fall below the user's 75% word floor: 12:20 (5/8 words), 20:33 (1/3), 20:44 (4/6), 22:15 (3/5), 23:4 (8/11). These short statements retain their basic meaning; they were not edited because the user explicitly required REAL chapters to remain alone. Thus the 75% assertion applies to the repaired text, not every inherited paragraph. Do not report an exception-free global word-floor audit.
Historical assertions and source inconsistencies were preserved, including the contradictory weekdays, clock arithmetic, geographic/historical claims, and the narrator's period judgments. No factual corrections or extra commentary were inserted into the edition.
books/characters/around-the-world-80-days/ does NOT exist. No character data was created or changed; integration must check any existing live character references against the supplied paragraph coordinates.
No app files, registry, live editions, scripts, configuration, audio or deployment were modified. Zero Anthropic API calls. Any later integration/publication is a separate assignment; changed text must not reuse incompatible narration cache entries.
