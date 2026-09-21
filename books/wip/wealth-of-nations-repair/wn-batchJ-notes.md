# Wealth of Nations — Batch J (Chapter 30) — Content Fidelity Review

## Verdict

**PASS with 2 minor factual/numerical defects found and fixed.**

Chapter 30 ("Of the Expenses of the Sovereign or Commonwealth," Book V, Ch. I —
252 paragraphs) was checked paragraph-by-paragraph against the source English text.
The modern-English rendering is, on the whole, an unusually faithful and careful
translation: no dropped clauses, no meaning inversions, no compressed or summarized
passages, and the very large number of historical dates, sums of money (£ amounts),
percentages, statute citations, and proper names throughout this chapter (Roman
history, the East India Company, the South Sea Company, the Royal African Company,
the Reformation, etc.) were checked individually and came through correctly in
nearly every case.

Two isolated numerical/factual distortions were found, both apparently simple
transcription slips (digit transposition and adjacent-decade date), not systemic
issues. Both are corrected in `wn-batchJ-corrected.json`; no other paragraphs were
touched.

## Defects found and fixed

### 1. Paragraph 107 — statute chapter number corrupted

- **Source (ground truth):** "The act which establishes this company (the 23rd of
  George II. c.51 ), seems to have had two distinct objects in view..."
- **Defective modern-en text:** "The act establishing this company (the 23rd of
  George II, c. 31) seems to have had two distinct aims..."
- **Issue:** Numerical/factual distortion — the statute's chapter number was
  transcribed as "c. 31" instead of "c. 51".
- **Fix applied:** Changed "c. 31" to "c. 51" in paragraph 107, restoring the
  correct citation while keeping the modern-English phrasing otherwise unchanged.

### 2. Paragraph 121 — date corrupted

- **Source (ground truth):** "Upon a subsequent occasion, in 1750, when a proposal
  was made to parliament for putting the trade under the management of a
  regulated company, and thereby laying it in some measure open, the East India
  company, in opposition to this proposal, represented, in very strong terms,
  what had been, at this time, the miserable effects..."
- **Defective modern-en text:** "On a later occasion, in 1730, when a proposal was
  made to parliament to put the trade under the management of a regulated
  company, and thereby in some measure open it up, the East India Company,
  opposing this proposal, described in very strong terms what they thought had
  been the miserable effects of this competition at that time."
- **Issue:** Numerical/factual distortion — the year of the East India Company's
  petition to parliament was given as 1730 instead of the correct 1750. (This
  matters because paragraph 121 is a chronological narrative — 1722, 1698, 1701,
  1702, 1708, 1712, 1730/1750, 1733, 1741, 1743, 1748, 1755, 1767, 1769, 1773,
  1774 — and the 1730 date, sitting between the 1712 Hudson's Bay/Royal African
  material discussed earlier and the 1733 petition mentioned two sentences later
  in the same paragraph, would otherwise imply an impossible/confusing sequence.)
- **Fix applied:** Changed "in 1730," to "in 1750," in paragraph 121, restoring the
  correct year while keeping the modern-English phrasing otherwise unchanged.

## Verification

- `wn-batchJ-source.json`: 1 chapter object, chapter 30, 252 paragraphs.
- `wn-batchJ-current-modern-en.json`: 1 chapter object, chapter 30, 252 paragraphs.
- `wn-batchJ-corrected.json`: 1 chapter object, chapter 30, 252 paragraphs — verified
  programmatically to match the source paragraph count exactly (252 == 252) and to
  carry the same chapter number (30) before finishing.
- Only paragraphs 107 and 121 differ between the original modern-en file and the
  corrected file; all other 250 paragraphs are byte-identical to the original
  (i.e., were already faithful and needed no change).
