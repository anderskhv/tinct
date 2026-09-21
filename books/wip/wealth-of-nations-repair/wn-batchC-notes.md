# Wealth of Nations — Batch C (Chapter 11, "Of the Rent of Land") — Content-Fidelity Review

## Verdict

**One defect found and fixed out of 298 paragraphs.** The modern-English rendering
is otherwise a faithful, complete, paragraph-for-paragraph translation of the
source. All historical prices, dates, quantities, proportions, place names, and
the extensive appended price tables (paragraphs 275–289) were checked and match
the source exactly — no numbers were altered, dropped, or invented anywhere else
in the chapter. No meaning inversions were found elsewhere.

Method: every one of the 298 paragraphs was read side-by-side against the source
in sequential batches (full manual read, no skipping), with special attention to
all numerical/historical content (grain and wheat prices, silver/gold tax rates,
population figures, dates, mine yields, currency conversions). In addition, an
automated scan was run for (a) paragraphs whose current-text/source-text length
ratio was anomalous, and (b) paragraphs not ending in terminal punctuation — the
second check is what caught the defect below (the truncation left the paragraph
ending mid-word instead of at a sentence boundary).

## Defect found

**Paragraph index: 207** (0-based; the paragraph beginning "Thus on every farm
the offals of the barn and stable will keep a certain number of poultry...").

**Type:** Dropped clause/sentences — the modern-English paragraph was cut off
mid-sentence, silently truncating the last ~470 characters (roughly two full
sentences) of the source paragraph, including a specific historical claim about
the London butcher's-meat market.

**Exact source text (tail of the paragraph, for reference):**
> "...After it has become general, new methods of feeding are commonly fallen
> upon, which enable the farmer to raise upon the same quantity of ground a much
> greater quantity of that particular sort of animal food. The plenty not only
> obliges him to sell cheaper, but, in consequence of these improvements, he can
> afford to sell cheaper; for if he could not afford it, the plenty would not be
> of long continuance. It has been probably in this manner that the introduction
> of clover, turnips, carrots, cabbages, etc. has contributed to sink the common
> price of butcher's meat in the London market, somewhat below what it was about
> the beginning of the last century."

**Exact defective text (as found in `wn-batchC-current-modern-en.json`, full
paragraph ending):**
> "...After it has become general, new methods of feeding are commonly hit upon
> that let the farmer raise on the same quantity of ground a much greater
> quantity of that particular kind of animal food. The plenty not only forces
> him to sell cheaper but, as a result of these im"

(The paragraph simply stops mid-word ("...these im") — everything from
"provements..." through the end of the source paragraph, including the London
butcher's-meat/clover-turnips-carrots-cabbages sentence, was missing.)

**Exact fix applied** (in `wn-batchC-corrected.json`, paragraph index 207): the
truncated paragraph was completed by appending the missing content, translated
into the same modern-English register as the rest of the paragraph, matching
the existing sentence that was cut in half:

> "...The plenty not only forces him to sell cheaper but, as a result of these
> **improvements, he can afford to sell cheaper; if he could not afford it, the
> plenty would not last long. It was probably in this way that the introduction
> of clover, turnips, carrots, cabbages, and the like helped bring the common
> price of butcher's meat in the London market somewhat below what it had been
> around the start of the last century.**"

No other change was made to this paragraph; only the missing tail was restored.

## Verification

- Paragraph count in `wn-batchC-corrected.json` equals 298, matching
  `wn-batchC-source.json` exactly (checked programmatically).
- Diffing `wn-batchC-corrected.json` against
  `wn-batchC-current-modern-en.json` paragraph-by-paragraph confirms only
  paragraph index 207 was changed; all other 297 paragraphs are byte-identical
  to the original current file.
- The chapter object's `number` (11) and `title` fields are unchanged and match
  source/current.
