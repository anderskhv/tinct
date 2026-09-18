# War and Peace — Batch D1 Drift Repair Notes

## Method used

For each of the 6 chapters (5, 19, 22, 31, 51, 55), I compared
`drift-batchD1-source.json` against `drift-batchD1-current-modern-en.json`
paragraph-by-paragraph using three independent checks, since a single
truncated-text comparison could miss a subtle mid-chapter shift:

1. **Full paragraph-by-paragraph read** of every chapter, index by index,
   comparing opening/closing clauses and topic content between source and
   current modern-en at the same index.
2. **Word-count ratio per paragraph** (`len(cur.split()) / len(src.split())`),
   flagging any paragraph whose modern-en length was wildly out of proportion
   to its source counterpart (ratio < 0.55 or > 1.8 for non-trivial
   paragraphs). This is the signature a merge-then-resplit drift would leave:
   one paragraph ballooning (absorbing a neighbor's content) and the next
   collapsing (losing its own content to the previous one).
3. **Named-entity / proper-noun set comparison per paragraph** (character
   names, place names, foreign-phrase markers), after normalizing accented
   spellings (e.g. Pávlovna → Pavlovna, Andrew → Andrei, Kutúzov → Kutuzov)
   so that genuinely mismatched paragraphs (source paragraph about one
   character showing up next to a modern-en paragraph about a different
   scene) would surface as near-zero name overlap.

## Findings, per chapter

- **Chapter 5** (58 paragraphs) — Checked index by index in full. Every
  modern-en paragraph maps to the correct source paragraph for the entire
  chapter. No drift found. Ratio outliers (idx 4, 8, 9) are ordinary
  translation-length variance (e.g. idx 8 is a short heraldic French phrase
  that grows when a `[Speaking in French]` tag and English gloss are added),
  not boundary drift.
- **Chapter 19** (46 paragraphs) — Checked index by index in full. Fully
  aligned throughout — including the tricky footnote-marker paragraphs
  (idx 8–11, the `*`, `*(2)`, `*(3)`, `*(4)` footnote lines) and all of the
  dinner-table dialogue. No drift found.
- **Chapter 22** (27 paragraphs) — Checked index by index in full, including
  the long opening paragraph (idx 0, 314→299 words) and the several other
  long descriptive paragraphs. Fully aligned. No drift found.
- **Chapter 31** (61 paragraphs) — Checked index by index in full, including
  the footnote/translation paragraphs at the end (idx 58–59, the "Forty
  thousand men massacred..." and "It is all very well for that
  good-for-nothing fellow..." footnotes) which duplicate content already
  embedded inline in idx 57 — this duplication exists in the source too, so
  it is not a defect. Fully aligned. No drift found.
- **Chapter 51** (52 paragraphs) — Checked index by index in full, including
  the two very long paragraphs (idx 2, 394→335 words; idx 5, 380→339 words)
  where a merge/resplit would be most likely to hide. Both map correctly to
  their single source paragraph and no content bleeds into a neighboring
  index. Fully aligned. No drift found.
- **Chapter 55** (63 paragraphs) — Checked index by index in full, including
  the three long paragraphs (idx 7, 57, 60, 62) most likely to hide a
  merge/resplit. Fully aligned. No drift found.

**Net result for this batch: no paragraph-boundary drift was detected in
any of the 6 chapters.** `drift-batchD1-current-modern-en.json` already
maps 1:1 to `drift-batchD1-source.json` for every paragraph in every
chapter — paragraph counts matched going in, and content-level review
confirms the alignment holds throughout each chapter, not just at the
start and end. No re-splitting or re-merging was needed, and no missing
content was found that required fresh translation.

## Output

`drift-batchD1-corrected.json` was produced by pairing each source
chapter's `number`/`title` with the current modern-en chapter's
(already-correctly-aligned) `paragraphs` array, unchanged.

## Script-verified paragraph counts (source vs. corrected)

```
Chapter 5:  source=58 corrected=58 match=True
Chapter 19: source=46 corrected=46 match=True
Chapter 22: source=27 corrected=27 match=True
Chapter 31: source=61 corrected=61 match=True
Chapter 51: source=52 corrected=52 match=True
Chapter 55: source=63 corrected=63 match=True
ALL MATCH: True
```

`drift-batchD1-corrected.json` also validates as well-formed JSON via
`python3 -m json.tool`.
