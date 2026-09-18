# War and Peace — Batch D3 Drift Repair Notes

Chapters covered: 194, 204, 215, 236, 326.

## Method

Rather than assume the drift described in the task brief and start re-splitting
blind, I first verified where (if anywhere) `drift-batchD3-current-modern-en.json`
paragraph *i* stops corresponding to source paragraph *i*, using two independent
checks over every paragraph in all 5 chapters:

1. Character-level similarity (`difflib.SequenceMatcher`) between source[i] and
   modern-en[i]. This flags many false positives on heavily paraphrased
   sentences (expected for a "modern English rendering" vs. the Maude
   translation), so it's not conclusive on its own.
2. Content-word Jaccard overlap (stopwords removed) between source[i] and
   modern-en[i], **plus** a search over every offset from -20 to +20 to see
   whether modern-en[i+offset] matches source[i] meaningfully better than
   modern-en[i] does. This is the actual drift detector: if paragraph
   boundaries had shifted (merge-then-resplit), some window of indices would
   show their best content match at a nonzero offset.

Result: **for all 5 chapters, every single paragraph's best-matching index is
offset 0 — its own index.** No paragraph anywhere in this batch showed a
better content match at any other index within a ±20 window (i.e., across the
entire chapter for the two 54-paragraph chapters and well beyond the length of
the shorter ones). The paragraphs the word-overlap check flagged as "low
similarity" were manually inspected and are all short, low-content-word lines
(single-sentence dialogue, or German/French snippets and their footnote
translations) that correctly correspond to their source counterparts once
read — not merges or splits.

I also manually re-read chapter 204 (the shortest, most convenient to
proofread by eye) start to finish against the source and confirmed the
narrative sequence — Ilyín's remark, Rostóv's confrontation with the crowd,
the Karp/Dron binding, the Bogucharovo packing scene, Rostóv's escort of the
princess, her reflections, the Sónya coda — tracks source paragraph order
exactly, paragraph for paragraph.

## Per-chapter findings

- **Chapter 194** (103 paragraphs, source and modern-en both): no drift found.
  Paragraph-for-paragraph correspondence holds for the entire chapter.
- **Chapter 204** (54 paragraphs): no drift found. Manually re-verified in
  full (see above).
- **Chapter 215** (54 paragraphs): no drift found.
- **Chapter 236** (38 paragraphs): no drift found.
- **Chapter 326** (30 paragraphs): no drift found.

**Re-splits/re-merges performed: 0.** The paragraph-boundary drift described
in the task brief is not present in this particular batch's
`drift-batchD3-current-modern-en.json` — it is already correctly aligned to
`drift-batchD3-source.json` 1:1, chapter by chapter and paragraph by
paragraph. The wording differs from the source (as expected for a modern
rendering — updated diction, de-accented transliterations like "Bolkonsky"
vs. "Bolkónski", "Yakov" vs. "Yákov"), but the paragraph boundaries and content
mapping are already correct throughout.

## Missing content

**None found requiring fresh translation.** Because no merge/resplit drift
was detected, there was no dropped-paragraph situation to fill in.

## Output

`drift-batchD3-corrected.json` is therefore an exact copy of
`drift-batchD3-current-modern-en.json` (same 5 chapters, same content) — no
edits were needed to restore alignment because alignment was never broken in
this batch.

## Script-verified paragraph counts (final)

```
194  source=103  corrected=103  MATCH
204  source=54   corrected=54   MATCH
215  source=54   corrected=54   MATCH
236  source=38   corrected=38   MATCH
326  source=30   corrected=30   MATCH
```

Verified with a Python script that loads both JSON files, asserts chapter
numbers align 1:1 in list order, and asserts `len(paragraphs)` matches per
chapter. All 5 chapters pass.
