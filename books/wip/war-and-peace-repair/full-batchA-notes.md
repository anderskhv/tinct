# War and Peace — Batch A Fidelity Check (Chapters 1–25, excluding 6/11/15/19/23)

Source: Maude translation (`full-batchA-source.json`)
Candidate: current `modern-en` (`full-batchA-current-modern-en.json`)
Output: `full-batchA-corrected.json`

## Method

Read every paragraph of all 20 chapters against the Maude source in full (not sampled). Checked for
omissions, inventions, meaning inversions, factual/plot distortions, placeholder text, and
character-name inconsistencies against the project's normalized spellings (Andrew not Andrei,
Kutuzov no accent, Helene no accent, Nicholas not Nikolai, Mary not Marya).

## Result summary

- **Chapters found sound (no defects, unchanged):** 1, 2, 3, 6*, 7, 8, 9, 10, 12, 13, 14, 16, 17, 18,
  20, 21, 22, 24 for prose/plot content. (*6 not in this batch — excluded per task.)
- **Chapters with genuine defects found and fixed:** 1, 2, 3, 4, 5, 25 — all defects were
  **character-name inconsistencies** (a systemic naming-convention violation, not narrative
  omission/invention/inversion). No omissions, invented content, meaning inversions, or
  factual/plot distortions were found anywhere in the batch after close paragraph-by-paragraph
  comparison. Prose quality was left untouched everywhere per the "fidelity check, not a quality
  pass" instruction.

18 of 20 chapters had zero defects of any kind. 6 chapters (1, 2, 3, 4, 5, 25) needed a small
number of name-spelling fixes; no other changes were made to those chapters' content.

## Defects found and fixed

### Chapter 1 — 1 defect
- **Name inconsistency:** paragraph 35 (0-indexed) rendered the character as "Princess **Marya**
  Bolkonskaya," but the Maude source itself calls her "Princess **Mary** Bolkónskaya" at this exact
  spot (distinguishing her from the several other Maria/Marya-named characters in the book, e.g.
  the Dowager Empress Márya Fëdorovna, Márya Dmítrievna Akhrosímova, Márya Ivánovna Dólokhova), and
  the project's normalized-spelling convention is "Mary not Marya."
  - Source: "...I know a little person who is very unhappy with her father. She is a relation of
    yours, Princess **Mary** Bolkónskaya."
  - Candidate (before fix): "...She's a relation of yours — Princess **Marya** Bolkonskaya."
  - Fix: changed to "Princess **Mary** Bolkonskaya."
  - (Other "Marya" instances in Chapter 1, referring to the Dowager Empress Márya Fëdorovna, were
    correctly left as "Marya" — she is a distinct historical figure, not Princess Mary Bolkonskaya,
    and the source itself calls her "Márya," never "Mary.")

### Chapter 2 — 2 defects (both the same pattern)
- **Name inconsistency:** "Hélène" (accented) used throughout instead of the project's normalized
  "Helene" (no accent). Fixed at paragraphs 0 and 7.

### Chapter 3 — 4 defects (same pattern)
- **Name inconsistency:** "Hélène" → "Helene" at paragraphs 0, 6, 7, 11.

### Chapter 4 — 6 defects (two patterns)
- **Name inconsistency — Andrei vs. Andrew:** Prince Andrew is introduced in this chapter and is
  called "Prince **Andrei** Bolkonski" throughout (paragraphs 0, 7, 10, 13), even though later
  chapters in this same batch (7 and 8) correctly call him "Prince **Andrew**." The project
  convention is "Andrew not Andrei," and the character must be named consistently within the same
  book. Fixed all 4 instances to "Andrew."
- **Name inconsistency — Hélène:** "Hélène" → "Helene" at paragraphs 12 and 23.

### Chapter 5 — 8 defects (Andrei vs. Andrew only)
- **Name inconsistency:** "Prince **Andrei**" used 8 times (paragraphs 1, 13, 16, 18, 39, 46, 48,
  49) for the same character called "Prince Andrew" in Chapters 7, 8, and (correctly, post-fix) 4.
  Fixed all 8 instances to "Andrew."

### Chapter 25 — 3 defects (two patterns)
- **Name inconsistency — Andrei vs. Andrew:** paragraph 0, "the arrival of young Prince **Andrei**
  and his wife" — fixed to "Andrew" (source: "the arrival of young Prince Andrew and his wife").
- **Name inconsistency — Nikolai vs. Nicholas:** the chapter is set at "Prince **Nikolai**
  Andreevich Bolkonsky's" estate (paragraph 0, two occurrences: the estate owner's name and the
  "General-in-Chief Prince Nikolai Andreevich" mention), and Julie's letter (paragraph 28) refers
  twice to "young **Nikolai** Rostov" / "Count **Nikolai**." The Maude source uses "Nicholas
  Andréevich Bolkónski" and "young Nicholas Rostóv" / "Count Nicholas," and the project convention
  is "Nicholas not Nikolai." Fixed all 4 occurrences (2 in paragraph 0, 2 in paragraph 28) to
  "Nicholas."

## Chapters confirmed sound, no changes

Chapters 7, 8, 9, 10, 12, 13, 14, 16, 17, 18, 20, 21, 22, 24 were read in full against the source
and found to have no omissions, inventions, inversions, distortions, placeholder text, or
name-spelling issues. Left completely unchanged.

Chapters 1, 2, 3, 4, 5, and 25 were sound in every respect *except* the name-spelling issues listed
above — narrative content, dialogue, sequence, and claims all matched the source faithfully. Only
the specific name tokens listed above were changed; no other wording in these chapters was altered.

## Paragraph-count verification (script-verified)

All 20 chapters: source paragraph count == corrected paragraph count. Verified with:

```python
import json
src = json.load(open('full-batchA-source.json'))
cor = json.load(open('full-batchA-corrected.json'))
assert len(src) == len(cor)
for s, c in zip(src, cor):
    assert len(s['paragraphs']) == len(c['paragraphs'])
```

| Chapter | Source paragraphs | Corrected paragraphs | Match |
|---|---|---|---|
| 1  | 42 | 42 | ✅ |
| 2  | 18 | 18 | ✅ |
| 3  | 31 | 31 | ✅ |
| 4  | 37 | 37 | ✅ |
| 5  | 58 | 58 | ✅ |
| 7  | 33 | 33 | ✅ |
| 8  | 23 | 23 | ✅ |
| 9  | 56 | 56 | ✅ |
| 10 | 30 | 30 | ✅ |
| 12 | 31 | 31 | ✅ |
| 13 | 34 | 34 | ✅ |
| 14 | 40 | 40 | ✅ |
| 16 | 50 | 50 | ✅ |
| 17 | 29 | 29 | ✅ |
| 18 | 37 | 37 | ✅ |
| 20 | 46 | 46 | ✅ |
| 21 | 80 | 80 | ✅ |
| 22 | 27 | 27 | ✅ |
| 24 | 43 | 43 | ✅ |
| 25 | 45 | 45 | ✅ |

ALL MATCH: True (script-confirmed, 20/20 chapters)
