# Anna Karenina — Batch I Content-Fidelity Repair Notes

Chapters covered: source chapters 177–197 (Part 6 chs. 20–32, Part 7 chs. 1–8), 21 chapters total.

Method: every paragraph of `ak-batchI-current-modern-en.json` was read side by side
with the corresponding paragraph of `ak-batchI-source.json` (Constance Garnett,
locked ground truth). Paragraph counts were verified to match 1:1 per chapter before
and after correction. An automated length-ratio scan (flagging any paragraph pair
where the modern-en paragraph was under 55% or over 170% of the source paragraph's
character length, for source paragraphs over 40 characters) was also run across all
21 chapters and returned zero outliers, corroborating the manual pass.

## Overall verdict

This batch is **exceptionally clean**. It is a faithful, complete, unabridged
modern-English rendering of the source across all 21 chapters — no dropped
sentences, no invented content, no meaning inversions, no compressed/summarized
passages, no factual or plot distortions (names, places, relationships, plot points
all intact), and none of the emotionally difficult content (Anna's contraception
discussion with Dolly, Vronsky's resentment, the drunk-nobleman vote-rigging, etc.)
was softened or sanitized. Register (modern English, contemporary idiom) is
consistently maintained without sacrificing fidelity.

## Per-chapter verdicts

| Source ch. | Title | Verdict | Defects found |
|---|---|---|---|
| 177 | Chapter 20 | Clean | 0 |
| 178 | Chapter 21 | Clean | 0 |
| 179 | Chapter 22 | Clean | 0 |
| 180 | Chapter 23 | Clean | 0 |
| 181 | Chapter 24 | Clean | 0 |
| 182 | Chapter 25 | Clean | 0 |
| 183 | Chapter 26 | Clean | 0 |
| 184 | Chapter 27 | Clean | 0 |
| 185 | Chapter 28 | Clean | 0 |
| 186 | Chapter 29 | Clean | 0 |
| 187 | Chapter 30 | Clean | 0 |
| 188 | Chapter 31 | Clean | 0 |
| 189 | Chapter 32 | Clean | 0 |
| 190 | Chapter 1 | Clean | 0 |
| 191 | Chapter 2 | Clean | 0 |
| 192 | Chapter 3 | Clean | 0 |
| 193 | Chapter 4 | Clean | 0 |
| 194 | Chapter 5 | Clean | 0 |
| 195 | Chapter 6 | Clean | 0 |
| **196** | **Chapter 7** | **1 defect fixed** | 1 |
| 197 | Chapter 8 | Clean | 0 |

## Defect detail

### Chapter 196 (Chapter 7), paragraph index 26

Levin and Vronsky are making small talk about race horses at the club dinner.
Vronsky asks Levin if he keeps race horses too.

- **Source (exact):** `"No, my father had; but I remember and know something about it."`
- **Defective text (exact):** `"No, my father did; but I remember the world and know a bit about it."`
- **Problem:** Invented clause. The source has Levin saying he "remember[s] and
  know[s] something about" race horses (i.e., recalls his father's racing days and
  has some knowledge of the subject). The modern-en version inserted "the world" —
  a phrase with no basis in the source, producing a non-sequitur ("I remember the
  world") that reads as a stray, meaningless insertion rather than a reference to
  horses/racing.
- **Fix (exact):** `"No, my father did; but I remember it, and know a bit about it."`
  — restores the sense that "it" (racing/horses) is what Levin remembers and knows
  a bit about, while keeping the modern-English phrasing of the surrounding text
  unchanged.

## Verification

`ak-batchI-corrected.json` was diffed against the source paragraph counts
programmatically — all 21 chapters match paragraph-for-paragraph (no additions,
no drops). Only the single paragraph above was altered from
`ak-batchI-current-modern-en.json`; every other paragraph in the corrected file is
identical to the current modern-en file, since no other fidelity defects were found.
