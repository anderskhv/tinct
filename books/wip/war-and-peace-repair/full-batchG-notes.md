# War and Peace — Batch G Fidelity Check (Chapters 147–167, excl. 165)

Source: Maude translation (`full-batchG-source.json`)
Candidate: current modern-en (`full-batchG-current-modern-en.json`)
Output: `full-batchG-corrected.json`

Method: every paragraph of every chapter was read against the Maude source in full, sentence by sentence, checking for omitted content, invented content, meaning inversions, factual/plot distortions, placeholder text, and character-name inconsistencies (Andrew/Kutuzov/Helene/Nicholas/Mary normalization).

## Result summary

- **19 of 20 chapters: SOUND.** No fidelity defects found. Differences from the source are ordinary modern-English rephrasing (word choice, contraction, light syntax smoothing) that preserve all claims, sequence, dialogue, and detail. Nothing was changed in these chapters.
- **1 of 20 chapters: DEFECTIVE.** Chapter 167 (Book Nine, Chapter 22) contains one factual/numeric distortion, fixed below.

## Chapter-by-chapter verdicts

| # | Title | Verdict |
|---|-------|---------|
| 147 | Book Eight — Ch. 2 | Sound |
| 148 | Book Eight — Ch. 3 | Sound |
| 149 | Book Eight — Ch. 4 | Sound |
| 150 | Book Eight — Ch. 5 | Sound |
| 151 | Book Eight — Ch. 6 | Sound |
| 152 | Book Eight — Ch. 7 | Sound |
| 153 | Book Eight — Ch. 8 | Sound |
| 154 | Book Eight — Ch. 9 | Sound |
| 155 | Book Eight — Ch. 10 | Sound |
| 156 | Book Eight — Ch. 11 | Sound |
| 157 | Book Eight — Ch. 12 | Sound |
| 158 | Book Eight — Ch. 13 | Sound |
| 159 | Book Eight — Ch. 14 | Sound |
| 160 | Book Eight — Ch. 15 | Sound |
| 161 | Book Eight — Ch. 16 | Sound |
| 162 | Book Eight — Ch. 17 | Sound |
| 163 | Book Eight — Ch. 18 | Sound |
| 164 | Book Eight — Ch. 19 | Sound |
| 166 | Book Eight — Ch. 21 | Sound |
| **167** | **Book Nine — Ch. 22** | **Defective — 1 fix applied** |

## Defect detail: Chapter 167, paragraph 35 (last paragraph)

**Source (Maude):**
> "Home!" said Pierre, and despite twenty-two degrees of frost **Fahrenheit** he threw open the bearskin cloak from his broad chest and inhaled the air with joy.

**Candidate (before fix):**
> "Home!" said Pierre, and despite twenty-two degrees of frost **below zero** he threw open the bearskin cloak from his broad chest and breathed in the air with joy.

**Problem:** "Degrees of frost" is a period idiom meaning degrees *below the freezing point* (32°F), so "twenty-two degrees of frost, Fahrenheit" means roughly 10°F — cold but survivable, matching the scene (Pierre throws his coat open in exhilaration rather than shivering). The candidate's "below zero" instead states the temperature is 22 degrees below zero Fahrenheit (about ‑22°F / ‑30°C), a much more extreme and physically different claim than the source makes — a factual/numeric distortion, not merely a stylistic modernization. It also silently drops "Fahrenheit," the word that anchors which scale is meant.

**Fix applied:** restored the Fahrenheit reference and removed the invented "below zero" claim:
> "Home!" said Pierre, and despite twenty-two degrees of frost, Fahrenheit, he threw open the bearskin cloak from his broad chest and breathed in the air with joy.

This is a minimal, localized fix — only this clause changed; the rest of the paragraph and chapter are untouched.

## Paragraph-count verification (script-checked)

All 20 chapters retain their exact source paragraph counts in the corrected file (verified via `json.load` + `len(paragraphs)` comparison, script re-run at completion):

| Ch # | Title | Source paras | Corrected paras | Match |
|---|---|---|---|---|
| 147 | Book Eight — Ch. 2 | 8 | 8 | OK |
| 148 | Book Eight — Ch. 3 | 51 | 51 | OK |
| 149 | Book Eight — Ch. 4 | 39 | 39 | OK |
| 150 | Book Eight — Ch. 5 | 27 | 27 | OK |
| 151 | Book Eight — Ch. 6 | 14 | 14 | OK |
| 152 | Book Eight — Ch. 7 | 26 | 26 | OK |
| 153 | Book Eight — Ch. 8 | 29 | 29 | OK |
| 154 | Book Eight — Ch. 9 | 23 | 23 | OK |
| 155 | Book Eight — Ch. 10 | 17 | 17 | OK |
| 156 | Book Eight — Ch. 11 | 16 | 16 | OK |
| 157 | Book Eight — Ch. 12 | 17 | 17 | OK |
| 158 | Book Eight — Ch. 13 | 27 | 27 | OK |
| 159 | Book Eight — Ch. 14 | 28 | 28 | OK |
| 160 | Book Eight — Ch. 15 | 74 | 74 | OK |
| 161 | Book Eight — Ch. 16 | 57 | 57 | OK |
| 162 | Book Eight — Ch. 17 | 36 | 36 | OK |
| 163 | Book Eight — Ch. 18 | 26 | 26 | OK |
| 164 | Book Eight — Ch. 19 | 36 | 36 | OK |
| 166 | Book Eight — Ch. 21 | 43 | 43 | OK |
| 167 | Book Nine — Ch. 22 | 36 | 36 | OK |

Total: 20/20 chapters, all paragraph counts exact matches.

## Notes on borderline items considered and rejected as non-defects

- Chapter 167, para 1: Sónya's line "Natásha insists on seeing Count Peter Kirílovich" is rendered as "Count Bezukhov" in the candidate, while a later line in the same chapter keeps "Peter Kirilovich" verbatim. This is an inconsistent naming choice but not a fidelity defect — "Bezukhov" is Pierre's correct surname and no meaning, fact, or identity is altered. Left unchanged per the instruction not to re-polish sound prose.
- All character-name spellings checked against project convention (Andrew, Kutuzov, Helene, Nicholas, Mary) — consistent throughout the batch; no violations found.
