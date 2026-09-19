# Don Quixote Batch I — Fidelity Repair Notes

Chapters 89–99 (Part 2, Chs. 37–47), 11 chapters, checked paragraph-by-paragraph
against `dq-batchI-source.json` (Ormsby translation, locked ground truth).

## Method

Every paragraph of `dq-batchI-current-modern-en.json` was compared against the
corresponding source paragraph for: dropped/invented clauses or sentences,
meaning inversions, compression/summarization, factual/plot distortions
(names, places, objects), and other fidelity breaks. Comic violence, crude
humor, and satire (e.g. the cat-and-bells attack, the bearded-duenna material,
Sancho's earthy asides) were left intact — not sanitized.

Paragraph counts were verified programmatically to match source exactly
before and after correction (all 11 chapters: 14, 16, 8, 28, 50, 34, 33, 43,
34, 18, 50 — unchanged).

## Per-chapter verdicts

- **Ch. 89** (Part 2, Ch. 37) — Clean. No defects found.
- **Ch. 90** (Part 2, Ch. 38) — One defect found and fixed (see below).
- **Ch. 91** (Part 2, Ch. 39) — Clean. No defects found.
- **Ch. 92** (Part 2, Ch. 40) — Two defects found and fixed (see below).
- **Ch. 93** (Part 2, Ch. 41) — Clean. No defects found.
- **Ch. 94** (Part 2, Ch. 42) — Clean. No defects found.
- **Ch. 95** (Part 2, Ch. 43) — Clean. No defects found.
- **Ch. 96** (Part 2, Ch. 44) — Clean. No defects found.
- **Ch. 97** (Part 2, Ch. 45) — Clean. No defects found.
- **Ch. 98** (Part 2, Ch. 46) — Clean. No defects found.
- **Ch. 99** (Part 2, Ch. 47) — Clean. No defects found.

Overall: the batch was in very good shape. Only 3 defects found across 348
paragraphs, all in chapters 90 and 92, all confined to single clauses within
otherwise faithful paragraphs. No dropped sentences, no compressed passages,
no plot/name/place distortions were found anywhere in the batch.

## Defects found and fixed

### Chapter 90 (Part 2, Ch. 38) — paragraph index 13

**Exact source text** (relevant clause, within the Trifaldi's long narration):
> "...the dread of which made us all there take counsel together, and it was
> agreed that before the mischief came to light..."

**Exact defective text** (before fix):
> "Dreading this, the three of us took counsel together, and it was agreed
> that before the mischief came to light..."

**Issue:** The source is deliberately vague about the size of the group that
"there" (at the scene) took counsel — "us all there." The modern-en text
invented a specific headcount ("the three of us") not present in the source.
This is a small invented-specificity/factual-distortion defect: it asserts a
number the source does not give.

**Exact fix applied:**
> "Dreading this, we all took counsel together there, and it was agreed that
> before the mischief came to light..."

---

### Chapter 92 (Part 2, Ch. 40) — paragraph index 3

**Exact source text:**
> "...most of them have a flavour of agents that have ceased to be
> principals..."

**Exact defective text** (before fix):
> "...most of them have the air of go-betweens that have moved up in the
> trade."

**Issue:** Meaning inversion. The source's euphemism describes women who were
once "principals" (i.e., in the trade themselves) and have since stepped down
to acting as agents/go-betweens for others — a decline in standing. The
modern-en text says the opposite: that these go-betweens "moved up in the
trade," reversing the direction of the euphemism (up vs. down).

**Exact fix applied:**
> "...most of them have the air of go-betweens who were once principals
> themselves."

---

### Chapter 92 (Part 2, Ch. 40) — paragraph index 15

**Exact source text:**
> "...still it fits him very well, for he is called Clavileño the Swift,
> which name is in accordance with his being made of wood, with the peg he
> has in his forehead, and with the swift pace at which he travels..."

**Exact defective text** (before fix):
> "...but it suits him very well, for he is called Clavileño the Swift — a
> name that fits his being made of wood (_clavo_ for the peg in his forehead,
> _leño_ for the wood), and the swift pace at which he travels..."

**Issue:** Invented content — an etymological gloss explaining the Spanish
roots of "Clavileño" (_clavo_ = peg, _leño_ = wood/log) that does not appear
in the source at all. This is an unearned addition of information not in the
ground truth, however plausible or helpful it may seem.

**Exact fix applied:**
> "...but it suits him very well, for he is called Clavileño the Swift — a
> name that fits his being made of wood, and the swift pace at which he
> travels..."

## Files

- `dq-batchI-corrected.json` — full corrected 11-chapter array, paragraph
  counts verified to match `dq-batchI-source.json` exactly.
- `dq-batchI-notes.md` — this file.

No other files were modified.
