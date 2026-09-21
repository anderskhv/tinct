# Batch J Independent Adversarial Review

**Scope:** Chapters 100–107 (Of coaches / Of the inconvenience of greatness / Of the art of conference / Of vanity / Of managing the will / Of cripples / Of physiognomy / Of experience). 1,044 paragraphs total. Final batch of the book.

## Verdict: ACCEPT AS-IS

No content-fidelity defects found. The drafter's "0 defects" self-report holds up under independent adversarial review.

## What was verified

**1. File identity.** `mt-batchJ-corrected.json` is byte-for-byte identical to `mt-batchJ-current-modern-en.json` (confirmed via direct JSON equality check).

**2. Paragraph counts — exact match, all 8 chapters:**

| # | Title | Source paras | Modern-en paras |
|---|---|---|---|
| 100 | Of coaches | 70 | 70 |
| 101 | Of the inconvenience of greatness | 14 | 14 |
| 102 | Of the art of conference | 95 | 95 |
| 103 | Of vanity | 300 | 300 |
| 104 | Of managing the will | 123 | 123 |
| 105 | Of cripples | 60 | 60 |
| 106 | Of physiognomy | 142 | 142 |
| 107 | Of experience | 240 | 240 |

**3. Structural/statistical screen over all 1,044 paragraphs** (word-count ratio per paragraph, sentence-count delta per paragraph, numeral extraction/comparison) found no outliers consistent with dropped clauses, compressed passages, or inserted content. Word-count ratios cluster tightly around 0.9–1.0 (normal modernization compression); the lowest ratios (~0.5) are all short Latin-citation footnotes where the source gives two alternate English translations in brackets and the modern-en keeps one — not a fidelity loss, since the alternate is a translator's aside, not Montaigne's text. No paragraph showed a sentence-count drop of 3+ that would flag a dropped passage. All ~18 numeral mismatches found were OCR-garble corrections in citation apparatus (e.g., source's "111. 8, II" for a corrupted "iii. 8, 11", "1 Cor." misread from "I Cor.") — the modern-en's renderings are more correct, not less faithful, to authorial intent.

**4. The four passages the notes specifically claim were checked, independently re-verified in full against source:**

- **Socrates' Apology speech** (ch. 106 "Of physiognomy", paras 104–113): Read in full side by side. Complete, no dropped clauses, no negation inversions, no compression. The Prytaneum request, the "good men have no reason to fear the gods" closing, the Amphipolis/Potidaea/Delium references — all present and accurate.
- **Cortes/Pizarro conquest narrative** (ch. 100 "Of coaches", paras 59–69 — note: neither the source nor the modern-en names Cortés or Pizarro directly; the source refers to "he of Peru" and "the king of Mexico," which is period-accurate to the translation and correctly preserved): Read in full. The Atahualpa ransom/execution passage, the torture-and-execution of the Aztec king and his noble, the Cusco–Quito highway description, all numbers (1,325,500 lbs. of gold, 460 men burned, 300 leagues, 25-foot width, etc.) — all accurately carried over.
- **Plague of 1585–86** (ch. 106 "Of physiognomy", paras 65–72, not 107 as the chapter numbering might suggest): Read in full. Faithful.
- **Kidney-stone "nature's speech"** (ch. 107 "Of experience", para 127): Read in full — this is the long first-person address in which Nature speaks to Montaigne about the stone as a merciful death. Complete, no drops, meaning preserved throughout (including the "you more often kill it than it kills you" and "shake hands with death once a month" lines).

**5. Additional targeted spot-checks beyond the cited passages, read in full:**
- Ch. 101 "Of the inconvenience of greatness" — entire 14-paragraph chapter read source-vs-modern in full (chosen because it's short enough to fully verify and wasn't one of the cited passages). Faithful throughout, including the Hadrian/Favorinus exchange, the Carneades quote on princes' sons and horses, and the Tiberius eloquence-prize anecdote.
- Ch. 105 "Of cripples," the witch-trial passage (paras 34–43), including the famous "how much more natural... than that one of us should be carried by a strange spirit upon a broomstaff... up the shaft of a chimney" line and Montaigne's audience with the ten or twelve imprisoned "witches." Faithful.

## Minor observations (not defects, no action needed)
- Several very short paragraphs are pure Latin citation blocks (untranslated Latin line + bracketed English gloss). The modern-en preserves the Latin verbatim and lightly polishes the English gloss (e.g., "any more" → "any more," punctuation/quote-mark normalization). This is appropriate modernization, not content alteration.
- Where the 19th-century source translation offers two alternate English renderings of a Latin tag in one bracket (e.g., "Neither can a man dispute, but he must contradict." (Or:) "Nor can people dispute without reprehension."), the modern-en picks one rather than reproducing the "(Or:)" apparatus. This is an editorial/formatting choice about translator's-note scaffolding, not a loss of Montaigne's own text, and is consistent throughout the batch.

## Conclusion
This is a large, high-stakes closing batch, and it was reviewed with that in mind — full-text comparison of all four cited passages, full-text comparison of one complete short chapter, full-text comparison of a second signature passage (witch trial) not mentioned in the notes, plus a statistical screen across all 1,044 paragraphs for compression/expansion/numeral anomalies. Nothing surfaced. Recommend accepting batch J as-is.
