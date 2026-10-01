# on-liberty — R10 content handoff

## Result and scope

All five chapters repaired. Whole-book gate PASS. Content staged for review/integration; no publication or deployment performed.

Repository: `anderskhv/tinct`. Delivery branch: `content/modern-en-repair-r10`.
Owned path: `books/wip/modern-en-repair-r10/on-liberty/` only.
Pinned instruction/source revision: `c268646674fed34ef73cf8ecf32d7c54ebabce40` (origin/main fetched 2026-10-01). Current book workflow, adding-book guide, strategy, content rules and boundaries were read. The user's explicit content-authoring assignment supersedes the older Codex/Claude role restriction.

Both live editions were copied byte-for-byte from `app/public/data/editions/` and verified against that pinned revision. The staged original remains unchanged. `on-liberty-modern-en.before.json` preserves the live starting modern edition. Rewriting was manually authored sentence by sentence in this conversation; no regex/dictionary modernization pass or external generation API was used.

## Changed chapter/paragraph coordinates

All coordinates are one-based and relative to the live modern baseline:

- Chapter 1: paragraphs 1–18; paragraph 2 restores the original Humboldt epigraph verbatim.
- Chapter 2: paragraphs 1–45.
- Chapter 3: paragraphs 1–19.
- Chapter 4: paragraphs 1–21.
- Chapter 5: paragraphs 1–23.

Total: 126 changed paragraphs. Exact coordinates: `changed-paragraphs.json`. Chapter titles, numbers, order and paragraph boundaries remain unchanged. Counts: 18 / 45 / 19 / 21 / 23. No initially REAL chapters existed to preserve.

## Before/after gates

| Measure | Live before | Final staged |
|---|---:|---:|
| Weighted similarity | 0.958 | 0.401 |
| LIGHT + MECHANICAL chapters | 5/5 (100.0%) | 0/5 (0.0%) |
| Identical long paragraphs (>=80 characters) | 4/126 (3.2%) | 1/126 (0.8%) |
| Wrapped scaffolding | 0 | 0 |
| Truncated quotations | 0 | 0 |
| Whole-book gate | FAIL | PASS |

Final chapter similarities: 1 = 0.452; 2 = 0.387; 3 = 0.440; 4 = 0.435; 5 = 0.334. The classifier labels all REAL-HEAVY. That label measures token similarity; it is not evidence of abridgement.

Command executed successfully:

`python3 books/classify-modern-en.py /Users/andershvelplund/.codex/.chatgpt-projects/g-p-6aaba3f019a08191b14bfbdbdbb6d692/work/the-trial/books/wip/modern-en-repair-r10/on-liberty/on-liberty --gate --per-chapter`

Raw before/after evidence: `gate-before.txt`, `gate-after.txt`. Individual outputs: `gate-chapter-1.txt` through `gate-chapter-5.txt`. Chapter 1's isolated gate fails only because the required verbatim epigraph constitutes 1/18 (5.6%) long paragraphs; the whole-book identical rate is 0.8% and PASS. The epigraph must remain unchanged.

## Full-book constraint checks

- JSON valid; all five chapters and every paragraph aligned with the original.
- Minimum per-paragraph word retention: 75.1131% (chapter 2, paragraph 45). Every paragraph meets 75%.
- All three exclamation marks retained in their original paragraph coordinates: chapter 2 paragraphs 31 and 33; chapter 5 paragraph 12.
- Every double-quoted source passage retained verbatim, including punctuation inside quotation marks. The unquoted biblical sequence in chapter 2 paragraph 28 is also verbatim.
- Straight apostrophes/quotation marks and British spelling retained. No newly introduced curly quotation style.
- No identical paragraph over 40 source words remains. This user threshold was checked separately from the classifier's >=80-character threshold.
- Humboldt epigraph exact; no verse quotation changed.
- No new brackets around source notes and no editorial notes in reading text. The existing `[Greek: pleonexia]` source token is retained. Chapter 2's final Tyrannicide note remains ordinary prose.
- All paragraph endings checked for complete sentences; none ends mid-sentence. No merged, split, dropped or summarised paragraphs.
- Source and candidate were compared during authoring to preserve Mill's argumentative sequence, qualifications, examples, names, historical claims and allusions.

Machine-readable final evidence: `qa-checkpoint.json` (updated from the earlier checkpoint to full-book completion).

## Three spot-reads

1. **Chapter 1, paragraph 11:** source 262 words, candidate 228. Checked self-protection; harm to others; physical/moral welfare not sufficient; persuasion versus coercion; responsibility only for other-regarding conduct; sovereignty over body and mind. The sequence and qualifications remain intact.
2. **Chapter 3, paragraph 17:** source 855 words, candidate 746. Checked custom versus progress, improvement versus liberty, the East, ancestors/forests versus palaces/temples, clothing fashions, mechanical invention, China's sages and administrative education, and the warning to Europe. Historical assertions remain Mill's without editorial correction.
3. **Chapter 5, paragraph 11:** source 1,010 words, candidate 759. Checked mutual commitments, void self-enslavement, liberty's limit, necessities of life, release from agreements, money exception, Baron Wilhelm von Humboldt and marriage, reliance-created obligations, third-party interests including children, legal versus moral freedom, and the final distinction between children's and adults' interests. Every stage of the argument and example remains.

These are author spot-reads; no independent literary reviewer was used or represented as having approved the text. The automated quotation-truncation detector is heuristic and was supplemented by source comparison.

## SHA-256

- `on-liberty-original-en.json`: `ce17fe17570e069d551921dbbf21ff84ac6d268fe6e624ebb8d64ba3a6d1c979`
- `on-liberty-modern-en.before.json`: `12be1b0b5132554b0e19863654e4c0fa077e0cc267962106ed5e6e80eb6f1ff7`
- `on-liberty-modern-en.json`: `cb1b3de53726abe48a58157067c78c72a7f8c99bc9708ad9a804f485a2d00ebb`

Also recorded in `SHA256SUMS`.

## Known issues and integration notes

- No unresolved automated constraint failures in the whole book.
- Source chapter 2 paragraph 37 reads “has ever been possible without eking it out” where the surrounding argument requires supplementation from the Old Testament. The candidate renders that sense as “Extracting a complete ethical system from it requires additions from the Old Testament”. The source file was not changed and no editorial note was inserted into reading text.
- The mandatory verbatim epigraph alone prevents an isolated Chapter 1 gate pass; it does not prevent the required whole-book PASS.
- `books/characters/on-liberty/` does **not** exist in the inspected checkout. No character assets were changed or created.
- No app, registry, live-data, shared-script, configuration, audio or deployment writes. Zero Anthropic API calls.
- Integration must use the accepted candidate hash and changed coordinates. Changed reading text must not select stale speech caches; no runtime or cache action is part of this package.
- The-awakening follows only after this book's passing content commit is pushed.
