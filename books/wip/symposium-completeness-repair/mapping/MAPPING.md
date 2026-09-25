# Old → new paragraph mapping

`paragraph-map.tsv` lists all 217 baseline paragraphs and applies identically to `original-en` and `modern-en`. `inserted-paragraphs.tsv` lists the nine paragraphs that have no predecessor.

Coordinates are `chapter.index`: the chapter is 1-based and the paragraph index is 0-based. They match the reader's `chapterNumber` and `paragraphIndex`. Offsets are UTF-16 code units, the character cards' `offsetUnit`.

## Operations

| Chapter | Before | After | Operation |
|---|---|---|---|
| 1 | 40 | 49 | New 1.0–1.8 inserted (restored opening). Old 1.0–1.39 → new 1.9–1.48 (`renumber`, +9) |
| 2–6 | 8, 12, 10, 18, 13 | same | `keep`. The modern-en text of 3.3, 3.7 and 3.8 is corrected (C-06; see below). Chapter 5's original-en title changes (C-04), with no coordinate effect |
| 7 | 115 | 69 | Old 7.0–7.68 `keep`. Old 7.69–7.114 → new 8.0–8.45 (`move`, index − 69) |
| 8 | 1 | 47 | Old 8.0 → new 8.46 (`renumber`) |
| **Total** | **217** | **226** | 130 keep, 41 renumber, 46 move, 9 insert (per edition) |

## Where precise offsets are preserved

**Everywhere except three modern-en paragraphs.** In `original-en`, all 217 baseline paragraphs appear in the candidate byte for byte. In `modern-en`, 214 do. The `old_sha256_*` and `new_sha256_*` columns in `paragraph-map.tsv` are equal on every row where `text_changed` is `none`. For those paragraphs:

- every character, word and UTF-16 offset is valid unchanged at the new coordinate, so `offset_shift_*` is 0 on every row;
- every highlight, note or selection range maps exactly by changing only `chapterNumber` and `paragraphIndex`;
- every character-card mention re-resolves to its exact text after the move. This was verified for 510 mentions in `original-en` and 506 in `modern-en`, as recorded in `impact/character-card-impact.json`.

## Changed passages needing offset-aware migration (C-06)

Three existing `modern-en` sentences were corrected for confirmed defects (`CHANGES.md` C-06). Their coordinates do not change, but their text does. `changed-paragraph-ops.json` gives the old and new text, both hashes, and UTF-16 character and whitespace-word opcodes. They are computed the same way as in `app/scripts/prepare-structural-migration.py`, and every equal span was verified to round-trip byte for byte.

| Paragraph | UTF-16 length | Changed spans | Equal spans |
|---|---|---|---|
| modern-en 3.3 | 1103 → 1079 | delete old [986,1003) → new [986,986); insert old [1015,1015) → new [998,1005); delete old [1019,1045) → new [1009,1009); insert old [1055,1055) → new [1019,1031) | 5 |
| modern-en 3.7 | 856 → 876 | insert old [559,559) → new [559,579) | 2 |
| modern-en 3.8 | 1440 → 1457 | insert old [1332,1332) → new [1332,1349); delete old [1336,1337) → new [1353,1353); delete old [1342,1359) → new [1358,1358); replace old [1394,1395) → new [1393,1407); replace old [1400,1407) → new [1412,1414); delete old [1409,1410) → new [1416,1416); insert old [1411,1411) → new [1417,1419); insert old [1412,1412) → new [1420,1429) | 9 |

Offsets are handled as follows:

- **Inside an equal span:** exact.
- **In a replaced or deleted span:** approximate. Keep the recovery tuple; do not snap the annotation to the paragraph start or shorten it.
- **Offsets strictly before the first change** (modern 3.3 < 986, 3.7 < 559, 3.8 < 1332): unchanged.
- **A point exactly at an insertion boundary:** follows the caller's bias, as in `projectEditionCoordinate`. A selection start moves to after the inserted text; a selection end stays before it.

Both character-card mentions in modern 3.3 (Aristogeiton, Harmodius) coincide with equal spans and project exactly. Their eight anchor offsets (old 1015 and 1055) sit at the ends of those spans, exactly where "'s love" and "'s constancy" are inserted. With end-of-span (left) bias they map to 998 and 1019. Apply the values listed under `offsetChanges` in `impact/character-card-impact.json` as given; do not re-project them. Modern 3.7 and 3.8 contain no card coordinates.

## What still needs care

1. **Inserted paragraphs 1.0–1.8.** No old coordinate points into them, and no old data should be moved into them.
2. **Ordering against validation.** Old 7.69–7.114 are out of range for the new 69-paragraph chapter 7. Old 8.0 is in range but means a different paragraph, and old chapter-1 indices point nine paragraphs early. The remap must happen before the Invariant 6 bounds check, and be keyed to the content revision (candidate sha256), so no position is reset or deleted and none is applied twice.
3. **Derived layout.** Pages, scroll fractions and chapter lengths for chapters 1, 7 and 8 must be recomputed from the migrated paragraph coordinates.
4. **Chapter-only records.** Records carrying just a chapter number keep it. A chapter-7 record may now concern chapter-8 text; keep it.

## Format compatibility

The TSV keeps the column names that `app/scripts/prepare-structural-migration.py` reads: `old_chapter`, `old_index`, `new_chapter`, `new_index`, `op`, `offset_shift_original_en` and `offset_shift_modern_en`. That script exists on the unmerged branch `codex/edition-structure-migration-20260924` and produces `CoordinateMigration` data for `app/src/data/editionCoordinateMigration.ts`. It handles `renumber` and `move` rows through its generic path, and it derives character and word opcodes wherever old and new text differ (here modern 3.3, 3.7 and 3.8), so its output should reproduce `changed-paragraph-ops.json`. The extra columns (`text_changed` and the four hash columns) are ignored by `csv.DictReader`. Inserted paragraphs affect only `paragraphCountsAfter`.

That script is configured for the Pride and Prejudice and Jane Eyre packages. Adapting it, or writing an equivalent, is coding-agent work. This package does not change it.

## Modern Danish

The Danish edition is not remapped here. If Anders chooses to restructure `modern-da` (see `impact/modern-da-report.md`), the chapter-7/8 rows of this map apply to Danish unchanged: old 7.69–7.114 → 8.0–8.45 and old 8.0 → 8.46. The chapter-1 `renumber` rows do not apply, because no Danish opening exists.
