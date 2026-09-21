# Wealth of Nations — Batch E (Chapters 15–20) — Independent Adversarial Review

**Reviewer:** independent second-pass agent (not the original drafter)
**Scope:** `wn-batchE-source.json`, `wn-batchE-current-modern-en.json`, `wn-batchE-corrected.json`, `wn-batchE-notes.md`
**Method:** full paragraph-by-paragraph read of all 6 chapters (161 paragraph pairs) against source, plus targeted checks of every numerical claim cited in the drafter's notes.

## Verdict: **ACCEPT AS-IS** (paragraph content), with one metadata flag for the merge owner

The drafter's "0 defects found" claim holds up under independent re-read. I did not find any dropped clauses, negation/conditional inversions, compressed passages, dropped numerical examples, or factual/numerical distortions anywhere in the 161 paragraphs across the six chapters. The one issue in the batch — chapter-title metadata inconsistency — is real, confirmed, and correctly identified by the drafter as out of scope for paragraph-content work, but is flagged here for whoever does the final merge, since it affects the shipped JSON.

---

## 1. corrected.json vs current-modern-en.json

Confirmed byte-identical: `diff wn-batchE-corrected.json wn-batchE-current-modern-en.json` returns no output. Files match exactly.

## 2. Paragraph counts (source vs modern-en), all 6 chapters

| Ch # | Source title field | Modern-en title field | Source paras | Modern paras | Match |
|------|---------------------|------------------------|---------------|---------------|-------|
| 15 | "Chapter 4" | "Chapter 4" | 18 | 18 | ✅ |
| 16 | "Chapter 5" | "Chapter 5" | 39 | 39 | ✅ |
| 17 | "Chapter 1" | "Chapter 1" | 10 | 10 | ✅ |
| 18 | "Chapter 2" | "Chapter 2" | 22 | 22 | ✅ |
| 19 | "Chapter 3" | "OF THE RISE AND PROGRESS OF CITIES AND TOWNS, AFTER THE FALL OF THE ROMAN EMPIRE." (real title, English) | 21 | 21 | ✅ |
| 20 | "Chapter 4" | "HOW THE COMMERCE OF TOWNS CONTRIBUTED TO THE IMPROVEMENT OF THE COUNTRY." (real title, English) | 28 | 28 | ✅ |

All 6 chapters have exact paragraph-count parity with source. No paragraphs added, dropped, split, or merged.

## 3. Numerical examples cited in notes — independently verified against source

All seven cited examples check out exactly against source text, no rounding drift, no altered figures:

1. **£1000 three-loan chain** (ch15 para 5): A→W£1000→B→X£1000→C→Y£1000, "three times greater than that of the money" / "thirty times their value" — matches source verbatim in structure and figures. Modern-en preserves the A/B/C/W/X/Y letter scheme exactly.
2. **Interest/land-price progression** (ch15 para 17): source "ten per cent... sunk to six, five, four, and three per cent" / land price "ten or twelve years purchase" rising to "twenty, five-and-twenty, and thirty years purchase" — modern-en matches exactly ("twenty, twenty-five, and thirty years' purchase"). England sells at 30, France at 20 — both preserved correctly (not swapped).
3. **24x home-vs-foreign-trade turnover ratio** (ch16 para 27): source "twelve operations... before a capital employed in the foreign trade of consumption has made one... four-and-twenty times more" — modern-en: "twelve operations... twenty-four times more." Correct; 12 vs 1 → 24x logic preserved intact.
4. **Virginia tobacco hogshead figures** (ch16 para 34): 96,000 hogsheads purchased, ~14,000 domestic demand, 82,000 re-exported — all three figures preserved exactly in modern-en, including the arithmetic (96,000 − 14,000 = 82,000).
5. **Earl of Warwick's daily diners** (ch20 para 5): source "30,000 people" — modern-en "30,000 people." Matches, including the aside about the figure possibly being exaggerated.
6. **Cameron of Lochiel figures** (ch20 para 8): rent "never exceeded £500 a-year," "800 of his own people," "in 1745" — all three figures preserved exactly in modern-en.
7. **1310 Lucca→Venice silk migration** (ch19 para 19): "In 1310, nine hundred families were driven out of Lucca, of whom thirty-one retired to Venice... began the manufacture with three hundred workmen" — modern-en preserves 1310 / 900 families / 31 / 300 workmen exactly, including the Sandi citation and the Castruccio Castracani reference.

No numerical distortions found anywhere else in the batch either (I read every paragraph, not just the cited ones — e.g. ch18's entail statistics "more than one fifth, perhaps more than one third" of Scottish land, ch20's "£10,000 a-year" / "1000 families" example, and the taille/tithe "one half" vs "one tenth" comparison in ch18 para 13 are all preserved correctly).

## 4. Chapter-title metadata mismatch — confirmed real, scoped correctly, flagged for merge owner

The notes file describes this as: generic "Chapter 3"/"Chapter 4" vs real historical titles for the last 2 chapters, left untouched as out of scope. On inspection, the actual situation is slightly different from — but consistent with the spirit of — that description, and worth stating precisely:

- **Source file** (`wn-batchE-source.json`) never has real chapter titles in the `title` metadata field for any of the 6 chapters — all six are generic placeholders ("Chapter 4", "Chapter 5", "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4"), corresponding to Book III chapters 1–4 of Wealth of Nations (Natural Progress of Opulence / Discouragement of Agriculture / Rise of Cities / Commerce of Towns).
- The **real chapter title is present as paragraph 0** in every chapter, in both source and modern-en, and is translated correctly in all 6 cases (e.g. ch15 para 0: "OF STOCK LENT AT INTEREST." → "On Stock Lent at Interest"). This is fine and not part of the flagged issue.
- The flagged issue is specifically the chapter-object **`title` metadata field**: for chapters 15–18, modern-en keeps the same generic placeholder as source ("Chapter 4", "Chapter 5", "Chapter 1", "Chapter 2"). For chapters 19–20, modern-en's `title` field has been **upgraded to the real historical title** ("OF THE RISE AND PROGRESS OF CITIES AND TOWNS..." / "HOW THE COMMERCE OF TOWNS CONTRIBUTED...") — in the original 18th-century capitalization, not modernized — while source's `title` field for those same two chapters remains the generic placeholder.

**Why this matters beyond paragraph content, for the merge owner:**
- This creates an inconsistency *within the modern-en file itself*: 4 of 6 chapters carry a generic numeric placeholder in metadata, 2 carry real titles. Any UI or index that reads `chapter.title` for a table of contents, chapter picker, or SEO/share text will show "Chapter 4" for ch15 and ch20 (note: both are literally titled "Chapter 4" in the placeholder scheme, which is itself confusing) but a full historical title only for ch19/ch20's real-title case — actually ch20 has the real title, so within this batch the pattern is: chs 15–18 generic, chs 19–20 real. That asymmetry is the actual defect from a data-consistency standpoint, not a translation-fidelity one.
- The ch19/ch20 real titles are in unmodernized, all-caps 18th-century form ("OF THE RISE AND PROGRESS OF CITIES AND TOWNS, AFTER THE FALL OF THE ROMAN EMPIRE.") copied from the source's paragraph-0 convention, not matching the modern-en style used for the paragraph-0 chapter headings in this same file (Title Case, no trailing period, e.g. "The Rise and Progress of Cities and Towns after the Fall of the Roman Empire"). So even where the metadata was "fixed," it wasn't fixed to modern-en style — it's a straight copy-paste of the archaic title text into the metadata slot.
- This is **not** a paragraph-content defect — paragraph arrays, counts, and text are unaffected — so it correctly falls outside a "paragraph-content-only" task's scope, and I am not flagging it as a reason to reject the batch. But whoever runs the final merge across all batches should know: (a) this metadata field is unreliable/inconsistent across chapters in this batch, (b) it likely has the same issue in other batches if the same drafting process was used elsewhere, and (c) fixing it properly means giving all 6 chapters real, modern-en-style titles in the metadata field — not just 2 of them, and not in archaic caps.

## 5. General fidelity notes

- Register/voice: consistently rendered as accessible contemporary English (contractions like "let's," na — actually none used; register stays formal-but-plain) without altering meaning, argument structure, or Smith's qualifications ("perhaps," "it is said," "I believe," "so far as I know") — all hedges preserved.
- Rhetorical structure preserved: Smith's numbered enumerations (e.g. "first... secondly... thirdly," ch16 para 2; "first... second... third," ch20 para 1) are kept as enumerations, not collapsed or reordered.
- Names, dates, and citations preserved: Locke/Law/Montesquieu/Hume (ch15 para 9), Pliny/Columella/Aristotle/Plato (ch18 para 9), Madox/Pfeffel citations with page numbers (ch19 paras 3, 6, 9), Guicciardini (ch20 para 23), King John/Philip I/Louis the Fat (ch19 para 9) — all names, the Latin terms (Coloni Partiarii, fideicommissa, taille), and bracketed source citations carried through unchanged.
- No instances found of negated statements being flipped positive or vice versa, no conditionals dropped, no "not" or "never" silently removed or inserted.
- Long, syntactically complex 18th-century sentences (e.g. ch16 para 7 on capital in agriculture, ch20 para 19 on primogeniture and small proprietors, both 400+ words in source) are broken into more sentences in modern-en, as expected for this kind of modernization, but every clause and every piece of factual content in them is retained — verified line by line.

## Recommendation

Accept batch E as-is for paragraph content. Separately, raise the chapter-title metadata inconsistency (item 4 above) as a small follow-up cleanup — ideally applied consistently across the whole book, not just this batch — before final publish, since it's a real (if minor) data-quality defect that a "0 defects" summary could otherwise let slip through unaddressed.
