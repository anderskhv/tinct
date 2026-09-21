# Independent Adversarial Review — Wealth of Nations, Batch I
## Chapters 28-29 ("Conclusion of the Mercantile System" / "Of the Agricultural Systems")

**Reviewer:** independent re-check, not the original drafter. Full re-read from scratch, not sampled.

## 1. Corrected vs current-modern-en

`diff wn-batchI-current-modern-en.json wn-batchI-corrected.json` → **no output, files are byte-identical.** Confirms the drafter made zero edits, consistent with their 0-defects self-report — but this alone proves nothing about whether the close-read was actually done correctly, only that if defects existed they weren't fixed.

## 2. Paragraph counts

- Chapter 28 ("Chapter 8" / number 28, "Conclusion of the Mercantile System"): source 55 paragraphs, modern-en 55 paragraphs. **Match.**
- Chapter 29 ("Chapter 9" / number 29, "Of the Agricultural Systems" + Book IV Appendix + Book V heading): source 72 paragraphs, modern-en 72 paragraphs. **Match.**
- Total 127 paragraphs confirmed both sides, 1:1 aligned by index.

## 3. Method

Read all 127 paragraphs source-vs-modern side by side in full (not sampled), including:
- The full run of statute citations and bounty schedules in ch.28 (wool cards, linen yarn duties, naval-stores/hemp/flax/silk/timber/wood-stave bounties, gum senega duties, beaver skin/wool duties, coal export duties, tool/artificer export-ban penalties).
- Quesnay's productive/unproductive-class exposition in ch.29 (paras 5-38), including the marriage/children productivity analogy, the shoemaker/artisan value-added example, and the Marquis de Mirabeau quotation.
- China / ancient Egypt / Indostan / Greece-Rome agricultural-policy comparison (paras 39-49), including the Hungarian/Turkish mines passage, Pliny's cloth-price citations, and the triclinaria prices.
- The "system of natural liberty" passage and the sovereign's three duties (para 51).
- Book IV Appendix: herring-bounty table 1771-1781 (busses, empty barrels, barrels caught, bounty paid) and the derived per-barrel bounty calculations; salt-import table 1771-1782 (foreign vs Scotch salt bushels, five-year — actually eleven-year — medium).

Also ran an automated cross-check extracting every numeral token from each source/modern paragraph pair across all 127 paragraphs and diffing the number sequences, to catch any numeric distortion a manual read might miss. Only 3 "mismatches" surfaced, all trivial: trailing periods on footnote markers (e.g., "1." from "chap. 1." vs "chap. 1") and a dropped trailing period after "293." in a page-citation list — no actual digit changed anywhere. Also checked for anomalous compression (modern paragraph <55% of source word count for any paragraph >20 words) — zero hits.

## 4. Findings by defect category

- **Dropped/invented clauses:** none found. Every clause in every paragraph has a corresponding clause in the other version; no sentence-level content dropped, no invented material added.
- **Negation/conditional inversions:** none found. Checked in particular the conditional-heavy passages (para 36's "if merchants... are more inclined to parsimony" restructuring, the Colbert rod-bending proverb in para 4, the "if it is not, they will soon cease to feed them" chain in the wool/mutton passage carried in ch.28 para 25) — all conditionals and their logical direction preserved.
- **Compressed/summarized passages:** none found by manual read or by the automated word-count-ratio check. Some paragraphs (e.g., ch.29 para 36) are restructured into shorter, punchier sentences, but no propositional content is lost — every fact/clause in source appears in modern.
- **Dropped numerical/historical data:** none. All statute citations (regnal year + chapter, e.g. "24th Geo. II. chap. 46," "5th Geo. III. chap. 45," "13th and 14th of Charles II. chap. 18") are reproduced with matching numbers. All bounty rates, durations, and date ranges match. The herring-bounty table (1771-1781, 11 rows) and salt-import table (1771-1782) are reproduced with every digit identical, confirmed by direct string diff — see below.
- **Factual/numerical distortions:** none found. Cross-checked the arithmetic-heavy passages specifically:
  - Herring table totals row: "2,186 / 550,943 / 378,347 / £165,463 14 0" — identical in both.
  - Sea-sticks/fully-packed barrel conversion: 378,347 → ⅓ deducted 126,115 → 252,231, bounty £0 8 2¼ → £0 12 3¾ — identical.
  - Salt bushel weights (para 70): source "bushel of foreign salt weighs 48lbs., that of British weighs 56lbs." — modern preserves 48 lbs / 56 lbs exactly (the modern phrasing "while the bushel of British salt weighs only 56 lbs" reads more smoothly than the source's dangling "only," but the numbers and the foreign<British relationship are unchanged — not a distortion).
  - Beaver skin duty history (ch.28 para 40): 6s 8d rate, one-fifth/sixteen pence, 1722 reduction to 2s 6d/sixpence, 1764 reduction to one penny import / sevenpence export duty, 18d/lb on beaver wool — all match.
  - Pliny cloth-price citations (ch.29 para 47): 100 denarii/£3:6:8, 1000 denarii/£33:6:8, triclinaria £30,000/£300,000 — all match.
- **Silent "correction" of source citations/names/spelling:** none found. Checked specifically for standardization of proper names/spellings that Smith's original text renders non-standard, since the task calls this out as a defect class to preserve even if "wrong":
  - "Mr Colbert," "Lewis XIV" → modern renders as "Louis XIV" (para 3) — this is a modernized spelling of the monarch's name. Worth flagging as a borderline case (see below), though it is a widely-accepted anglicization, not a substantive correction of fact.
  - "Mr Quesnai" (source spelling, used consistently in source across paras 27-38 and 47) → modern renders as "Quesnay" throughout — also a spelling normalization.
  - Statute citations, e.g. "8th Geo. I. chap.15" → "8th George I, chapter 15" — this is pure abbreviation-expansion (Geo.→George, chap.→chapter), not a factual correction, and the numbers are untouched. Same pattern used consistently through the whole batch and consistent with the book's established modern-en house style (expanding abbreviations is not the same as "correcting" a fact or a name).

  Of these, "Lewis XIV" → "Louis XIV" and "Quesnai" → "Quesnay" are the only two that touch proper-name spelling rather than abbreviation expansion. Per the project's stated defect category ("silently 'corrected' citations/names that should instead match the source exactly even if the source seems wrong"), these are technically silent spelling normalizations of a proper name. Note also that the modern text is *internally inconsistent* on the second name: source spells the name "Quesnai" at chapter-29 paragraph-index 27 and 28, and (due to an evident OCR typo in the source itself) "Qttesnai" at paragraph-index 38; the modern text normalizes indices 27 and 28 to "Quesnay" but leaves index 38 as "Quesnai" (fixing the OCR typo but not applying the same "Quesnay" normalization used two paragraphs earlier). So this isn't just a source-vs-modern mismatch, it's a spelling that varies within the modern text itself.

## 5. Verdict

**ACCEPT WITH FIXES REQUIRED** — two minor, mechanical proper-name spelling fixes. No content-fidelity defects (dropped/invented clauses, inversions, compression, numerical distortions) were found anywhere in the 127 paragraphs.

### Exact fixes required
(All indices below are 0-indexed paragraph positions within Chapter 29's `paragraphs` array, i.e. book chapter number 29 — "Of the Agricultural Systems.")

1. **Chapter 29, paragraph index 3** — restore source spelling "Lewis XIV" instead of "Louis XIV."
   - Source: "Mr Colbert, the famous minister of Lewis XIV. was a man of probity..."
   - Current modern-en: "Mr Colbert, the famous minister of Louis XIV, was a man of integrity..."
   - Fix: change "Louis XIV" back to "Lewis XIV."

2. **Chapter 29, paragraph index 27** — restore source spelling "Quesnai" instead of "Quesnay."
   - Source: "...is represented by Mr Quesnai, the very ingenious and profound author of this system..."
   - Current modern-en: "...is set out by Mr Quesnay, the very ingenious and profound author of this system..."
   - Fix: change "Quesnay" back to "Quesnai."

3. **Chapter 29, paragraph index 28** — restore source spelling "Quesnai" instead of "Quesnay."
   - Source: "Mr Quesnai, who was himself a physician, and a very speculative physician, seems to have entertained a notion..."
   - Current modern-en: "Mr Quesnay, who was himself a physician, and a very speculative one, seems to have held a notion..."
   - Fix: change "Quesnay" back to "Quesnai."

   (Paragraph index 38 is already correct as-is: source has an OCR typo "Qttesnai," and modern-en already renders it "Quesnai" rather than "Quesnay" or the OCR typo — no change needed there. This is the one place where modern-en already matches the intended pattern; indices 27 and 28 should be brought in line with it, or all three could be reviewed together with Anders/the project owner if a project-wide "always modernize to Quesnay" house style is preferred instead of matching-source. Per the stated task instructions — source names/citations should match source exactly even if apparently "wrong" — the fix above (revert 27 and 28 to "Quesnai") is what's required.)

Both fixes are name-spelling normalizations only; no sentence content, clause structure, or numeric data needs to change. Once corrected (and re-verified with `grep -c "Louis XIV\|Quesnay"` returning 0 against this batch's modern-en file), this batch should be considered content-fidelity clean.
