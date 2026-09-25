# Old → new paragraph mapping

`paragraph-map.tsv` lists all 217 baseline paragraphs and applies identically to `original-en` and `modern-en`. `inserted-paragraphs.tsv` lists the nine paragraphs that have no predecessor.

Coordinates are `chapter.index`: the chapter is 1-based and the paragraph index is 0-based. They match the reader's `chapterNumber` and `paragraphIndex`. Offsets are UTF-16 code units, the character cards' `offsetUnit`.

## Operations

| Chapter | Before | After | Operation |
|---|---|---|---|
| 1 | 40 | 49 | New 1.0–1.8 inserted (restored opening). Old 1.0–1.39 → new 1.9–1.48 (`renumber`, +9) |
| 2–6 | 8, 12, 10, 18, 13 | same | `keep`. Chapter 5's original-en title changes (C-04), with no coordinate effect |
| 7 | 115 | 69 | Old 7.0–7.68 `keep`. Old 7.69–7.114 → new 8.0–8.45 (`move`, index − 69) |
| 8 | 1 | 47 | Old 8.0 → new 8.46 (`renumber`) |
| **Total** | **217** | **226** | 130 keep, 41 renumber, 46 move, 9 insert (per edition) |

## Where precise offsets are preserved

**Everywhere.** In both editions, all 217 baseline paragraphs appear in the candidate byte for byte. The `sha256_original_en` and `sha256_modern_en` columns in `paragraph-map.tsv` hold each paragraph's hash, which is the same before and after. Because no old paragraph's text changed:

- every character, word and UTF-16 offset inside an old paragraph is valid unchanged at its new coordinate, so `offset_shift_*` is 0 on every row;
- every highlight, note or selection range, including ranges across the whole paragraph, maps exactly by changing only `chapterNumber` and `paragraphIndex`;
- every character-card mention re-resolves to its exact text after the move. This was verified for 510 mentions in `original-en` and 506 in `modern-en`, as recorded in `impact/character-card-impact.json`.

**No passage needs text-level (fuzzy or approximate) migration.** No paragraph was merged, split, deleted or rewritten, so nothing should be snapped to a paragraph start or truncated.

## What still needs care

1. **Inserted paragraphs 1.0–1.8.** No old coordinate points into them, and no old data should be moved into them.
2. **Ordering against validation.** Old 7.69–7.114 are out of range for the new 69-paragraph chapter 7. Old 8.0 is in range but means a different paragraph, and old chapter-1 indices point nine paragraphs early. The remap must happen before the Invariant 6 bounds check, and be keyed to the content revision (candidate sha256), so no position is reset or deleted and none is applied twice.
3. **Derived layout.** Pages, scroll fractions and chapter lengths for chapters 1, 7 and 8 must be recomputed from the migrated paragraph coordinates.
4. **Chapter-only records.** Records carrying just a chapter number keep it. A chapter-7 record may now concern chapter-8 text; keep it.

## Format compatibility

The TSV keeps the column names that `app/scripts/prepare-structural-migration.py` reads: `old_chapter`, `old_index`, `new_chapter`, `new_index`, `op`, `offset_shift_original_en` and `offset_shift_modern_en`. That script exists on the unmerged branch `codex/edition-structure-migration-20260924` and produces `CoordinateMigration` data for `app/src/data/editionCoordinateMigration.ts`. It handles `renumber` and `move` rows through its generic path. The two extra hash columns are ignored by `csv.DictReader`. Inserted paragraphs affect only `paragraphCountsAfter`.

That script is configured for the Pride and Prejudice and Jane Eyre packages. Adapting it, or writing an equivalent, is coding-agent work. This package does not change it.

## Modern Danish

The Danish edition is not remapped here. If Anders chooses to restructure `modern-da` (see `impact/modern-da-report.md`), the chapter-7/8 rows of this map apply to Danish unchanged: old 7.69–7.114 → 8.0–8.45 and old 8.0 → 8.46. The chapter-1 `renumber` rows do not apply, because no Danish opening exists.
