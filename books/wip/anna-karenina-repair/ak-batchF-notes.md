# Anna Karenina — Batch F Fidelity Check Notes

Scope: chapters 114–134 (Constance Garnett source `ak-batchF-source.json` vs.
`ak-batchF-current-modern-en.json`). Every paragraph in every chapter was
read against its source counterpart, sentence by sentence, checking for
dropped/invented content, meaning inversions, compression, and
factual/plot distortions (names, places, relationships).

Paragraph counts verified programmatically to match the source in every
chapter before and after correction (21 chapters, per-chapter counts
identical: 39, 34, 26, 36, 58, 16, 52, 17, 37, 43, 36, 41, 54, 19, 40, 32,
11, 39, 8, 17, 13).

## Per-chapter verdict

| Ch. # | Title | Verdict |
|---|---|---|
| 114 | Chapter 13 | Clean |
| 115 | Chapter 14 | Clean |
| 116 | Chapter 15 | **1 defect found and fixed** (see below) |
| 117 | Chapter 16 | Clean |
| 118 | Chapter 17 | Clean |
| 119 | Chapter 18 | Clean |
| 120 | Chapter 19 | Clean |
| 121 | Chapter 20 | Clean |
| 122 | Chapter 21 | Clean |
| 123 | Chapter 22 | Clean |
| 124 | Chapter 23 | Clean |
| 125 | Chapter 1 | Clean |
| 126 | Chapter 2 | Clean |
| 127 | Chapter 3 | Clean |
| 128 | Chapter 4 | Clean |
| 129 | Chapter 5 | Clean |
| 130 | Chapter 6 | Clean |
| 131 | Chapter 7 | Clean |
| 132 | Chapter 8 | Clean |
| 133 | Chapter 9 | Clean |
| 134 | Chapter 10 | Clean |

Overall this batch was in excellent shape going in — the modern-English
rendering is a faithful, complete, sentence-for-sentence modernization of
Garnett's text throughout. Only one genuine content-fidelity defect was
found across all 21 chapters (~660 paragraphs).

## Defect found and fixed

**Chapter 116 ("Chapter 15"), paragraph index 7 — meaning distortion in dialogue.**

- Exact source text:
  > "To whom shall I announce your honor?" asked the footman.
- Exact defective text (in `ak-batchF-current-modern-en.json`):
  > "Whom shall I announce to her honor?" asked the footman.
- Problem: In the source, the footman addresses Levin respectfully as
  "your honor" and asks Levin which family member he should announce him
  to (Levin then answers "The princess ... the prince ... the young
  princess...."). The defective rendering instead has the footman asking
  whom he should announce *to* "her honor" — introducing a third-party
  "her" that doesn't exist in the source and reversing who is being
  addressed as "honor." This breaks the sense of the exchange: it no
  longer reads as the footman asking Levin who he's here to see.
- Exact fix applied:
  > "Whom shall I announce you to, your honor?" asked the footman.
  This restores the original sense (footman addressing Levin as "your
  honor," asking whom to announce him to) in modern-English phrasing,
  and still leads naturally into Levin's next line naming the family
  members.

## Notes on borderline items considered and NOT changed

A few passages were checked closely because they compress or lightly
paraphrase the source, but were judged to preserve full meaning and are
within normal modernization latitude (no content dropped, no facts or
relationships altered):

- Ch. 117 ("Chapter 16"), para 23: "Now we shall have sweetmeats to eat"
  → "Now we'll need sweets" — slight shift in phrasing (statement of
  fact vs. framing as a need) but the scene's meaning (Levin then drives
  off to buy sweets) is preserved.
- Ch. 125 ("Chapter 1"), para 3: "No. But what of it?" → "No. Why?" —
  compressed but semantically equivalent in context (Levin asking why it
  matters that he hasn't been to confession).

No dropped clauses/sentences, no invented content, no factual/plot
distortions (names, places, relationships all correct throughout,
including minor characters: Yegor, Kapitonitch, Korney, Marya
Nikolaevna, Golenishtchev, Mihailov, Katavasov, Tchirikov, Betsy,
Varya, Seryozha, etc.), and no meaning inversions other than the one
listed above were found in this batch.

## Files

- `ak-batchF-corrected.json` — full corrected chapter array (same shape
  as source/current files), with the single paragraph above fixed and
  all other paragraphs unchanged from
  `ak-batchF-current-modern-en.json`.
