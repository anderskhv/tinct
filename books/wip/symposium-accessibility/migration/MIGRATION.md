# Reader-data migration for the accessibility successor

Readers' saved data must survive this change. That covers positions, highlights, notes, bookmarks, `reading-log:*`, `progress:*`, listening positions and paragraph-anchored chat.

The coding owner performs the migration. This file supplies the content data it needs and records the constraints. Nothing here changes app code or live data.

## Structure

This pass changes **text only**. It keeps the completeness candidate's structure exactly:

- 226 paragraphs, laid out 49, 8, 12, 10, 18, 13, 69, 47;
- the same chapter numbers, titles and boundaries.

Every coordinate means the same passage before and after this pass. Only the words inside 163 modern-en paragraphs differ. **original-en is not touched.**

## Release shape: one combined release (recommended)

The live site still serves the pre-repair editions:

- modern-en `7816d1eb…fcce8`;
- original-en `e2943777…97c0`.

The completeness repair has not shipped (checked against `origin/main` `447a7a65`). `app/src/data/editionContentRevisions.ts` supports one `before → after` hop per book (`CONTENT_RELEASES[bookId]`). So:

1. **Ship the completeness repair and this pass as one release** from the live baseline to the final editions:
   - modern-en → `a848700fabaa280b3f174534df048cb3db14be5054a11c6e2a7095fb5536b76d`;
   - original-en → `3521a12d…95a6`.
2. **Use the composed data in this folder.** It already combines the completeness paragraph map with this pass's text changes. **Do not apply the completeness structural migration and then another migration on top.** Both are expressed from the live baseline here, so each user record is migrated exactly once.
3. **Separate releases need chained migrations**, which the current app does not support. If the completeness repair ships first on its own, this pass becomes a text-only release, completeness candidate → final. `changed-paragraph-ops-completeness-to-final.json` is provided for that case. The app would then need to know which records were already migrated by the first release, keyed by content revision, so that nothing is migrated twice or skipped.

## Files

| File | Use |
|---|---|
| `paragraph-map-live-to-final.tsv` | All 217 live paragraphs → final coordinates, for both English editions. Same columns and `op` values as the completeness `mapping/paragraph-map.tsv` (read by `prepare-structural-migration.py`), plus `text_changed_*` columns: `none`, `accessibility` or `c06+accessibility`. Old and new sha256 on every row. The nine inserted paragraphs 1.0–1.8 have no predecessor |
| `changed-paragraph-ops-live-to-final.json` | For each of the 163 live modern-en paragraphs whose text differs at its mapped coordinate: UTF-16 code-unit opcodes and whitespace-word opcodes, live text → final text, computed like `prepare-structural-migration.py` |
| `changed-paragraph-ops-completeness-to-final.json` | The same opcodes from the completeness candidate to the final text, for the separate-release case. Each record carries the reason and categories |

Every opcode file was checked: each `equal` span round-trips byte for byte.

## How offsets behave

- **54 live modern-en paragraphs** are byte-identical at their new coordinate. All 217 original-en paragraphs are too. Every offset there carries over exactly, as in the completeness package.
- **In the 163 changed modern-en paragraphs:**
  - a point inside an `equal` span maps exactly;
  - a point inside a `replace`, `delete` or `insert` span is approximate.

  Most of these paragraphs are genuine re-renderings. Inside them, the median share of UTF-16 units in equal spans is 73%. So many precise ranges will fall in changed text.
- **Highlights and notes.** The shipped mechanism (#192) moves a highlight only on an exact quote match and otherwise leaves it unresolved. Keep it that way:
  - keep every unresolved highlight and note, with its original quote (`oldText`), coordinates and recovery tuple;
  - **do not discard it, and do not snap it to the paragraph start or shorten it**;
  - where the quoted words were modernized, the old quote will not be found in the new text. The paragraph coordinate is still correct, because no paragraph moved in this pass. A reader-facing "from an earlier wording" treatment would be a coding decision.
- **Positions and progress.** Paragraph coordinates stay valid across this pass, so no position needs resetting. Word offsets inside changed paragraphs are approximate; the proportional mapping already in `build-text-change-migration.py` is adequate. Pages and scroll fractions are derived; recompute them from the migrated paragraph index and offset. All modern-en chapters change length slightly.
- **Validation order (Invariant 6).** For the combined release, the completeness constraint still applies. The remap must run before bounds validation and be keyed to the content revision, because old 7.69–7.114 and old 8.0 change meaning. See the completeness package, `mapping/MAPPING.md` and `impact/IMPACT.md` §1.

## Danish

This pass does not touch `modern-da`. Test #193 (`alignedEditions.test.ts`) needs every aligned pair to split each chapter alike. Danish (217 paragraphs) cannot stay `aligned: true` with the 226-paragraph English editions, so **Danish must be marked `aligned: false` in the same release**, as the completeness package already recommends. No Danish text is written here.
