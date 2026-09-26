# Independent Review — Jerusalem heading-fragment fix

**Reviewed:** 2026-09-26
**Files reviewed:**
- `books/wip/jerusalem-completeness-repair/editions/jerusalem-original-en.json`
- `books/wip/jerusalem-completeness-repair/editions/jerusalem-modern-en.json`
- `books/wip/jerusalem-modern-da-repair/editions/jerusalem-modern-da.json`
- `books/wip/jerusalem-heading-fragment-fix/PARAGRAPH-MAP.json`

## Verdict: **ACCEPT**

## 1. Source verification

Re-fetched `https://www.gutenberg.org/cache/epub/15837/pg15837.txt` fresh.

- sha256: `cc5df0ba5e17cba5dbfebc6ce71eeb0571d8910a9e981df97cd84dcd1ebcff98` — **matches** the previously-accepted hash exactly.
- Confirmed at the cited line numbers, each of the 5 items appears as an isolated, blank-line-delimited heading, not embedded in sentence text:
  - Line ~681: `II` — followed by a new scene ("A fortnight later Ingmar Ingmarsson stood polishing some harness...").
  - Line ~817: `III` — followed by a new scene ("Ingmar had been busy all the morning...").
  - Line ~1046: `IV` — followed by a new scene ("Ingmar Ingmarsson had arrived in the city...").
  - Line ~1679: `BOOK TWO` — a genuine in-body part-transition heading (immediately followed by the chapter's title line `AT THE SCHOOLMASTER'S` and then body text), distinct from the table-of-contents occurrence at line ~66.
  - Line ~6021: `BOOK THREE` — same pattern (followed by `LOSS OF "L'UNIVERS"` then body text), distinct from the TOC occurrence at line ~74.
- All five read unambiguously as structural headings: standalone lines, capitalized, surrounded by blank lines, functioning as book/scene dividers, carrying zero narrative content of their own.

## 2. Diff scope — exactly the 5 paragraphs, nothing else

Compared each file's working-tree version against `git show HEAD:<path>` (pre-fix committed version):

- Chapter counts: 17 in all three files, before and after.
- Chapter-by-chapter structural diff: **only chapters 1 and 8 changed** in all three files; chapters 2–7 and 9–17 are byte-for-byte identical to `HEAD`.
- `sections` array is unchanged in all three files (still groups Book One → ch.1, Book Two → ch.2–8, Book Three → ch.9–17).
- Programmatically verified that `new_chapter_paragraphs == [old_paragraph for i, old_paragraph in enumerate(old_chapter_paragraphs) if i not in {removed indices}]` holds exactly for chapter 1 (indices 55, 87, 132, 307 removed) and chapter 8 (index 235 removed), in **all three files**. This proves no paragraph besides the 5 named ones was added, removed, reordered, or altered anywhere in the book.
- Confirmed the removed paragraph contents directly:
  - EN files: `"II"`, `"III"`, `"IV"`, `"BOOK TWO"` (ch.1); `"BOOK THREE"` (ch.8).
  - DA file: `"II"`, `"III"`, `"IV"`, `"ANDEN BOG"` (ch.1); `"BOG TRE"` (ch.8) — correct Danish equivalents.

## 3. Seam continuity

Read the paragraphs immediately before/after each of the 5 removed headings in the final (post-fix) files, across all three editions:

- Seam at old idx 55 ("II"): "...it is father's wish" → "A fortnight later Ingmar Ingmarsson stood polishing..." — clean scene transition, no gap or duplication.
- Seam at old idx 87 ("III"): "...clinked cups with him." → "Ingmar had been busy all the morning..." — clean.
- Seam at old idx 132 ("IV"): "...sent old Kaisa here..." → "Ingmar Ingmarsson had arrived in the city..." — clean.
- Seam at old idx 307 ("BOOK TWO"): chapter 1 now ends on "Kaisa kept up a steady stream of talk..." (EN) / equivalent Danish, and chapter 2 opens directly with "In the early eighties there was no one in the parish..." — no duplicated heading text, no gap; this is exactly the transition the `sections` array already encodes structurally.
- Seam at old idx 235 ("BOOK THREE"): chapter 8 now ends on "...Sabbath peace..." and chapter 9 opens directly with "One misty night in the summer of 1880..." — clean, matches `sections`' Book Two→Three boundary at ch.8→9.

All 5 seams read as one continuous, non-duplicated narrative in all three editions (original-en, modern-en, modern-da — each in its own register/language, as expected).

## 4. Cross-edition structural alignment

Per-chapter paragraph counts, all three editions, all 17 chapters:

```
[304, 63, 42, 202, 65, 149, 122, 235, 86, 95, 18, 20, 43, 112, 110, 21, 95]
```

Identical across `original-en`, `modern-en`, and `modern-da` — total 1782 paragraphs each (was 1787). Chapter 1: 304 (was 308, −4). Chapter 8: 235 (was 236, −1). Matches the described fix exactly.

## 5. JSON validity

All three files parse successfully with `json.load` — valid JSON, no errors.

## 6. PARAGRAPH-MAP.json spot-check

Read the full map (304 + 235 = 539... actually 306+235=541 keyed entries covering ch.1 old-index 0–306 minus removed, and ch.8 old-index 0–234). Spot-checked 12 entries (exceeds the requested 10) against actual paragraph text pulled from the pre-fix (`git show HEAD:...`) and post-fix files:

| old coord | mapped new coord | content match |
|---|---|---|
| 1.0 | 1.0 | ✓ |
| 1.20 | 1.20 | ✓ |
| 1.54 | 1.54 | ✓ (last paragraph before first removed heading) |
| 1.56 | 1.55 | ✓ (first paragraph after "II") |
| 1.86 | 1.85 | ✓ (before "III") |
| 1.88 | 1.86 | ✓ (after "III") |
| 1.131 | 1.129 | ✓ (before "IV") |
| 1.133 | 1.130 | ✓ (after "IV") |
| 1.306 | 1.303 | ✓ (last paragraph of ch.1, before "BOOK TWO") |
| 8.0 | 8.0 | ✓ |
| 8.100 | 8.100 | ✓ |
| 8.234 | 8.234 | ✓ (last surviving paragraph of ch.8, before "BOOK THREE") |

All 12 matched exactly. Also confirmed the map correctly has **no entries** for the 5 removed old coordinates (1.55, 1.87, 1.132, 1.307, 8.235) — consistent with those paragraphs having no destination.

## Summary

The fix does exactly what it claims: it removes 5 bare structural-heading fragments (verified genuine in the primary source, verified genuinely redundant with the existing `sections`/chapter structure), from exactly the 5 stated coordinates, in all three edition files, with zero collateral changes anywhere else in any file. Seams read cleanly with no gaps or duplication. All three editions remain paragraph-count-aligned chapter-by-chapter. All files are valid JSON. The PARAGRAPH-MAP.json accurately records the old→new coordinate shift for the two affected chapters.

**Recommendation: ACCEPT.**
