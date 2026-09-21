# Anna Karenina — Batch J (Chapters 198–218) — Content Fidelity Repair Notes

**Method:** Every paragraph of `ak-batchJ-current-modern-en.json` was read against the
corresponding paragraph of `ak-batchJ-source.json` (Constance Garnett, locked ground
truth), chapter by chapter, sentence by sentence, checking for dropped/invented
content, meaning inversions, compression, factual/plot distortions, and softening of
emotionally difficult material. Paragraph counts were verified programmatically
before and after (649 = 649 for both files, across all 21 chapters, no merges/splits/
drops/additions).

**Overall verdict:** This batch is exceptionally faithful. It is a genuine
sentence-level modernization, not a summary or mechanical cleanup — proper nouns,
numbers (ages, sums of money, times, frost degrees, train times), French/Latin
phrases, dialogue structure, and plot facts are all preserved intact across all 21
chapters. This range covers Levin's visit to Anna, Kitty's labor and Dmitri's birth,
Stiva's Petersburg trip (the appointment negotiation, the Karenin divorce
conversation, the Landau/Lidia Ivanovna séance scene), and the Vronsky–Anna
disintegration in Moscow (jealousy, the "unnatural" quarrel, opium and the
death-ideation passage, the aborted departure, Anna's visit to Dolly and Kitty, and
Anna setting off in the carriage at the end of Chapter 29/218). None of the
emotionally difficult material (Anna's jealousy, self-pity, suicidal ideation, the
recurring nightmare, the birth agony, Levin's initial revulsion toward the newborn)
was softened or sanitized — all of it is rendered with full weight, matching the
source's bluntness (e.g., "she began to dwell with pleasure on how he would suffer,"
"By now he hated this child," "An immoral woman! A stone around your neck.").

Note: this batch (chapters 198–218) ends before Anna's death, which occurs later in
Part 7 of the novel and is not part of this file.

## Per-chapter verdicts

| Ch. (source #) | Title | Verdict |
|---|---|---|
| 198 | Chapter 9 | Clean — no defects found |
| 199 | Chapter 10 | Clean — no defects found |
| 200 | Chapter 11 | Clean — no defects found |
| 201 | Chapter 12 | Clean — no defects found |
| 202 | Chapter 13 | Clean — no defects found |
| 203 | Chapter 14 | Clean — no defects found |
| 204 | Chapter 15 | Clean — no defects found |
| 205 | Chapter 16 | Clean — no defects found |
| 206 | Chapter 17 | Clean — no defects found |
| 207 | Chapter 18 | Clean — no defects found |
| 208 | Chapter 19 | Clean — no defects found |
| 209 | Chapter 20 | Clean — no defects found |
| 210 | Chapter 21 | Clean — no defects found |
| 211 | Chapter 22 | Clean — no defects found |
| 212 | Chapter 23 | Clean — no defects found |
| 213 | Chapter 24 | **1 defect found and fixed** (see below) |
| 214 | Chapter 25 | Clean — no defects found |
| 215 | Chapter 26 | Clean — no defects found |
| 216 | Chapter 27 | Clean — no defects found |
| 217 | Chapter 28 | Clean — no defects found |
| 218 | Chapter 29 | Clean — no defects found |

## Defect found and fixed

### Chapter 24 (source #213), paragraph index 30 (0-based)

**Type:** Subtle meaning shift (a generalization turned into a specific past-tense
claim — borderline inversion of the philosophical point Anna is making).

**Exact source text:**
> "Respect was invented to cover the empty place where love should be. And if you don't love me any more, it would be better and more honest to say so."

**Exact defective modern-en text (before fix):**
> "Respect was invented to fill the empty space where love used to be. And if you don't love me anymore, it would be better and more honest to say so."

**Problem:** Anna's line is a bitter general aphorism about the *concept* of respect —
it exists to paper over a gap where love *ought to be* (a structural/abstract claim
about relationships in general). The defective rendering shifted this into "where
love *used to be*," which asserts specifically that love *existed and is now gone* —
a narrower, more personal claim that isn't what she's saying at this exact moment (she
makes that personal accusation explicitly in the very next sentence: "if you don't
love me any more..."). Left uncorrected, the aphorism's generality collapses into a
redundant restatement of the next sentence, and the philosophical bite of the line —
respect as a structural stand-in for absent love, not proof of lost love — is lost.

**Exact fix applied:**
> "Respect was invented to paper over the empty place where love ought to be. And if you don't love me anymore, it would be better and more honest to say so."

(Restored "ought to be" in place of "used to be," and used "paper over" for "cover" to
keep the modern register while precisely restoring the source's structural/general
claim rather than a specific claim about lost love.)

## Verification

```
python3 -m json.tool ak-batchJ-corrected.json   # valid JSON
```

Programmatic check confirms:
- 21 chapters in both source and corrected files, same chapter numbers in the same order.
- Paragraph count matches source exactly per chapter (no merges, splits, drops, or additions).
- Total paragraphs: 649 in source, 649 in corrected.

## Files touched

- Read only: `ak-batchJ-source.json` (locked, untouched)
- Read only: `ak-batchJ-current-modern-en.json` (untouched, per task instructions)
- Written: `ak-batchJ-corrected.json` (full corrected chapter array, same shape as source)
- Written: `ak-batchJ-notes.md` (this file)

No other files in the repository were touched. No commits were made.
