# Editorial QA — partial checkpoint

Status: NOT READY. Source verification and authored modern-en chapters 1–16 only; no complete-book acceptance.

- Original: 50 sequential flat chapters; 1,806 paragraphs; 118,639 words; sections empty. Full body equals the raw source ignoring whitespace after excluding headings and three end markers. All chapter openings/endings recorded in source-boundaries.json.
- Final source correction: removed non-reading END OF THE FIRST VOLUME / END OF THE SECOND VOLUME from chapters 22 and 36. No reading prose coordinates changed. Initial source commit f7a0bc38 is superseded by the corrected hash below. Source-cleanup.json records the mapping.
- Modern: 16 chapters, 424 exact paragraph pairs; 24,485 words / 26,921 source words in those chapters (90.95%). Minimum individual paragraph ratio 0.76087. No paragraph below 75%, including short dialogue.
- JSON and edition shape checks: PASS. No empty paragraphs, original-text filler chapters, list scaffolding, or Gutenberg apparatus.
- Gates 1–10 and expanded 1–12: PASS, similarity 0.454. Interim 13–16: PASS, similarity 0.495. All have zero LIGHT/MECHANICAL chapters, byte-identical long paragraphs, and flagged truncated quotations.
- The classifier labels ordinal ch 1–4 in the 13–16 slice; stored chapter numbers and titles remain 13–16. This is a four-chapter checkpoint, not a complete second batch. Finish 13–22, then gate that full batch.
- Whole-book gate: FAIL (structure), 50 vs 16 chapters. Expected and blocking.
- Existing audit-truncation.py with absolute staged prefix: zero flags in available pairs. That tool uses the shorter chapter count, so it cannot establish completeness; the separate structure check detects the missing 34 chapters.
- Short paragraphs reviewed as complete dialogue/transitions; see short-paragraph-review.json.

## Author review

Each drafted paragraph was compared with the source during sentence-by-sentence rendering. No replacement pass or generation API. Source parser and QA tools unchanged.

Checks covered the inheritance restrictions and legacies; the complete shrinking-gift argument; Edward’s dependence and Cowper; Elinor’s uncertainty; the entire Norland farewell; house dimensions and the savings joke; musical attention, ages, annuity and rheumatism; the rescue, pointers and “catching”; Cowper/Scott/Pope, East Indies, nabobs/gold mohrs/palanquins and Willoughby’s three reasons; Brandon’s interrupted recollection; Queen Mab and the lock of hair; the cancelled trip, paternity gossip and Allenham room details; the Combe conversation; the full debate over engagement evidence; and grief, Hamlet, Edward’s fortnight, dead leaves and muddy lane.

Chapter 16 paragraph 12 retains the source’s interrupted sentence; its ellipsis does not omit quotation content. Speculations remain attributed to the speakers. Mrs. Jennings’s paternity assertion is not adopted as narrative fact. Historical kinship terms are clarified as stepmother/stepson where appropriate. Names, period money, social conventions and judgments remain.

Independent accessibility, character/spoiler review, and complete-book semantic review have NOT occurred. Automated gate results are not semantic acceptance. Remaining work is recorded in HANDOFF.md.

Corrected original SHA-256: `26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0`.
Partial modern SHA-256: `facc3508dc13c2d3c96d4f7811feba4945b4dfc654176a96f7e85c492b37efe0`.
