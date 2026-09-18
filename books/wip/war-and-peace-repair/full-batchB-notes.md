# War and Peace — Batch B Fidelity Check (Chapters 27–55, 20 chapters)

Source: `full-batchB-source.json` (Maude translation, ground truth)
Candidate reviewed: `full-batchB-current-modern-en.json`
Corrected output: `full-batchB-corrected.json`

**Summary: 17 of 20 chapters sound as-is. 3 chapters defective** (27, 37, 43), plus two chapters (38–42, five chapters as a block) had a naming-consistency defect layered on top of otherwise-sound prose. Overall defective-chapter count (any genuine defect found): **6 of 20** — 27, 37, 38, 39, 40, 41, 42 for the naming issue (7 chapters touched for that one systemic issue), plus 43 for an invented-content defect. Treating the naming defect as a single systemic issue and 43 as a separate content issue, the practical defect count is **2 systemic issues affecting 8 chapters** (27, 37, 38, 39, 40, 41, 42, 43); the remaining 12 chapters (28, 30, 31, 32, 34, 35, 44, 46, 47, 48, 54, 55) were sound and left unchanged.

## Chapter-by-chapter verdicts

### Ch 27 — Book One, Chapter 27 — **DEFECTIVE (name inconsistency)**
Content/fidelity otherwise sound — close paragraph-by-paragraph match to Maude. Defect: the candidate used **"Prince Andrei"** throughout (7 instances) instead of the project's normalized **"Prince Andrew"** (matching the Maude source's own naming and every other chapter in this batch except 37). Example: source "Prince Andrew was looking at a large gilt frame..." vs candidate "Prince Andrei was studying a large gilt frame..."
**Fix:** replaced all 7 instances of "Andrei" → "Andrew" in this chapter. No other changes.

### Ch 28 — Book Two, Chapter 1 (titled "Chapter 28" in source data) — SOUND
Close, faithful rendering throughout (Prince Andrew's departure, the icon scene, the farewell to the old prince). No defects found. No changes.

### Ch 30 — Book Two, Chapter 3 (source titled "Chapter 2") — SOUND
Kutuzov's review of the regiment, Dolokhov, Zherkov exchange — faithful, no omissions/inventions/inversions found. No changes.

### Ch 31 — Book Two, Chapter 4 (source titled "Chapter 3") — SOUND
Kutuzov/Austrian general scene, Mack's arrival, Zherkov's tactless joke — faithful. No changes.

### Ch 32 — Book Two, Chapter 5 (source titled "Chapter 4") — SOUND
Rostov/Denisov/Telyanin purse-theft episode — long chapter, checked in full; dialogue, sequence of events, and outcome (Telyanin's confession and Rostov's disgust) all match. No changes.

### Ch 34 — Book Two, Chapter 6 — SOUND
Crossing of the Enns, Nesvitski and the officers, artillery test-shot — faithful. No changes.

### Ch 35 — Book Two, Chapter 7 — SOUND
The bridge crossing crush, Denisov's hussars forcing a path — faithful, including all the soldier byplay lines. No changes.

### Ch 37 — Book Two, Chapter 9 — **DEFECTIVE (name inconsistency)**
Content/fidelity otherwise sound (retreat along the Danube, victory at Krems, Prince Andrew's ride to Brünn, the cold reception from the Minister of War). Defect: same systemic issue as Ch 27 — **"Prince Andrei"** used throughout (13 instances) instead of "Prince Andrew."
**Fix:** replaced all 13 instances of "Andrei" → "Andrew." No other changes.

### Ch 38 — Book Two, Chapter 10 — **DEFECTIVE (name accents not normalized)**
Content/fidelity sound (Bolkonsky's stay with Bilibin, the "victory not very victorious" exchange). Defect: this chapter (and 39–42, see below) retained the accented Maude-style spellings **Bolkónski, Kutúzov, Bilíbin** instead of the project's unaccented normalized forms used consistently everywhere else in this batch (Bolkonsky, Kutuzov, Bilibin — matching the explicit project rule "Kutuzov no accent").
**Fix:** de-accented all three names throughout the chapter (3 name types, multiple instances). No content changes.

### Ch 39 — Book Two, Chapter 11 — **DEFECTIVE (name accents not normalized)**
Content sound (the diplomatic corps gathering at Bilibin's, Hippolyte Kuragin's comic political speech). Same accent-normalization defect: **Bolkónski, Bilíbin, Kurágin**.
**Fix:** de-accented all instances → Bolkonsky, Bilibin, Kuragin.

### Ch 40 — Book Two, Chapter 12 — **DEFECTIVE (name accents not normalized)**
Content sound (the imperial audience, the Thabor Bridge deception story). Same defect: **Bolkónski, Kutúzov, Bilíbin**.
**Fix:** de-accented all instances.

### Ch 41 — Book Two, Chapter 13 — **DEFECTIVE (name accents not normalized)**
Content sound (the chaotic retreat, the doctor's-wife-and-drunken-officer scene, Kutuzov's farewell to Bagration). Same defect, largest instance count in the batch: **Bolkónski, Kutúzov, Bilíbin, Kozlóvski, Bagratión, Nesvítski**.
**Fix:** de-accented all six name types throughout.

### Ch 42 — Book Two, Chapter 14 — **DEFECTIVE (name accents not normalized)**
Content sound (Kutuzov's strategic dilemma, Bagration's forced march, Napoleon's letter to Murat). Same defect: **Kutúzov, Bagratión**.
**Fix:** de-accented both.

### Ch 43 — Book Two, Chapter 15 — **DEFECTIVE (invented content)**
Content otherwise sound and closely faithful (Bagration's camp, Captain Tushin without his boots, the flogging of a soldier for theft, Dolokhov's exchange with the French grenadier). Defect: the candidate **inserted a sentence not present in the source** during the flogging scene:
- Source: "...Two soldiers held him while two others were flourishing their switches and striking him regularly on his bare back. The man shrieked unnaturally. A stout major was pacing up and down the line..."
- Candidate (before fix): "...Two soldiers held him down while two others lashed his bare back with switches. The man screamed in an unnatural, animal way. **A bullet had clearly not caused this—it was punishment.** A heavy-set major paced up and down the line..."

The inserted sentence is invented editorializing not in Maude's text — it also oddly implies the reader might have mistaken this for a battle casualty, which is not a claim the source makes or needs.
**Fix:** removed the invented sentence; left the surrounding text (already a legitimate modern rendering) intact.

### Ch 44 — Book Two, Chapter 16 — SOUND
Prince Andrew's survey of the battery position, the "what lies beyond death" conversation with Tushin overheard — faithful. No changes.

### Ch 46 — Book Two, Chapter 18 — SOUND
Bagration's advance into the fighting, the wounded, the charge — faithful, long and checked in full. No changes.

### Ch 47 — Book Two, Chapter 19 — SOUND
Zherkov's failure to deliver the retreat order, the German colonel dispute, Rostov's cavalry charge and near-capture — faithful, checked in full including all dialogue. No changes.

### Ch 48 — Book Two, Chapter 20 — SOUND
The infantry panic, Timokhin and Dolokhov's counterattack, Tushin's battery holding its ground — faithful, checked in full. No changes.

### Ch 54 — Book Three, Chapter 5 — SOUND
Princess Mary's night of dread, the old prince's jealous fury, the marriage proposal scene, Mademoiselle Bourienne and Anatole — faithful, checked in full. No changes.

### Ch 55 — Book Three, Chapter 6 — SOUND
Nicholas's letter home, the Rostov household's reactions, Sonya's declaration to Natasha — faithful, checked in full. No changes.

## Fixes applied (summary)

| Chapter | Defect type | Fix |
|---|---|---|
| 27 | Character-name inconsistency | "Andrei" → "Andrew" (7×) |
| 37 | Character-name inconsistency | "Andrei" → "Andrew" (13×) |
| 38 | Character-name inconsistency (accents) | Bolkónski→Bolkonsky, Kutúzov→Kutuzov, Bilíbin→Bilibin |
| 39 | Character-name inconsistency (accents) | Bolkónski→Bolkonsky, Bilíbin→Bilibin, Kurágin→Kuragin |
| 40 | Character-name inconsistency (accents) | Bolkónski→Bolkonsky, Kutúzov→Kutuzov, Bilíbin→Bilibin |
| 41 | Character-name inconsistency (accents) | Bolkónski→Bolkonsky, Kutúzov→Kutuzov, Bilíbin→Bilibin, Kozlóvski→Kozlovsky, Bagratión→Bagration, Nesvítski→Nesvitsky |
| 42 | Character-name inconsistency (accents) | Kutúzov→Kutuzov, Bagratión→Bagration |
| 43 | Invented content | Removed fabricated sentence "A bullet had clearly not caused this—it was punishment." |

All other paragraphs in all 20 chapters were left exactly as in the reviewed candidate. No paragraph was merged, split, reordered, or dropped in any chapter.

## Paragraph-count verification (script-checked)

| Ch# | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|
| 27 | 34 | 34 | ✓ |
| 28 | 97 | 97 | ✓ |
| 30 | 86 | 86 | ✓ |
| 31 | 61 | 61 | ✓ |
| 32 | 129 | 129 | ✓ |
| 34 | 29 | 29 | ✓ |
| 35 | 50 | 50 | ✓ |
| 37 | 24 | 24 | ✓ |
| 38 | 44 | 44 | ✓ |
| 39 | 29 | 29 | ✓ |
| 40 | 63 | 63 | ✓ |
| 41 | 63 | 63 | ✓ |
| 42 | 15 | 15 | ✓ |
| 43 | 52 | 52 | ✓ |
| 44 | 13 | 13 | ✓ |
| 46 | 14 | 14 | ✓ |
| 47 | 24 | 24 | ✓ |
| 48 | 40 | 40 | ✓ |
| 54 | 49 | 49 | ✓ |
| 55 | 63 | 63 | ✓ |

**ALL 20 CHAPTERS MATCH — verified via script (`python3` paragraph-count comparison against source).**

## Note on chapter titles (not treated as a fidelity defect, out of scope)

The `title` field's embedded chapter-relative numbering (e.g. "Book Two (1805) — Chapter X") is inconsistent between the source and candidate files for several chapters (27→28 titled differently, 30, 31, 32). This appears to be pipeline/book-relative-numbering metadata rather than translated prose content, and the candidate's numbering is internally consistent with itself (Book Two chapter N = original chapter 27+N). This was left untouched since it falls outside the paragraph-fidelity scope of this check; flagging here in case it's relevant to the broader repair project.
