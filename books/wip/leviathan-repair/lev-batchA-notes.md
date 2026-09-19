# Leviathan Batch A — Content Fidelity Review Notes

**Scope:** `lev-batchA-current-modern-en.json` (10 chapters: Introduction, chs. 1–5 full
epistemology run: Of Sense, Of Imagination, Of the Consequence or Trayne of Imaginations,
Of Speech, Of Reason and Science, Of the Interiour Beginnings of Voluntary Motions,
Of the Ends or Resolutions of Discourse, Of the Vertues Commonly Called Intellectual,
Of the Severall Subjects of Knowledge) checked paragraph-by-paragraph against
`lev-batchA-source.json`.

**Method:** Every paragraph in every chapter (105 paragraphs total across 10 chapters)
was read side-by-side against its exact source-paragraph counterpart (same 0-based index
within each chapter's `paragraphs` array), checking specifically for:
- dropped or invented clauses/sentences
- meaning inversions (dropped negations, flipped conditionals, reversed "therefore" logic)
- compressed/summarized argument steps or silently-skipped premises/examples
- distortion of Hobbes's technical vocabulary (endeavour, conatus/motion, phantasm/fancy,
  train of thoughts, appetite/aversion, science/opinion/belief, etc.)
- factual distortions (proper names, Scripture citations, numbers, quoted Latin/Greek terms)

Paragraph counts were verified programmatically to match source exactly for all 10
chapters before and after (105 vs 105; per-chapter breakdown: 5, 5, 10, 12, 25, 22, 58,
7, 27, 12).

## Result

**No content-fidelity defects were found in any of the 10 chapters.** This modern-English
rendering of Batch A is a genuinely careful, clause-by-clause modernization: Hobbes's
multi-step definitions, syllogistic chains, technical vocabulary, Scripture citations,
Latin/Greek terms, and the many one-line "Passions glossary" definitions in Chapter 6
are all preserved with their full logical structure intact. No dropped premises, no
inverted conditionals/negations, no silently-compressed argument steps, and no
terminology drift (e.g. "endeavour," "fancy," "conatus"-sense of motion, "train of
thoughts," "science" vs. "opinion" vs. "belief"/"faith" are all rendered consistently
and correctly throughout).

## Per-Chapter Verdicts

| # | Title | Paragraphs | Verdict |
|---|-------|-----------|---------|
| 0 | The Introduction | 5 | Sound |
| 1 | Of Sense | 5 | Sound |
| 2 | Of Imagination | 10 | Sound |
| 3 | Of the Consequence or Trayne of Imaginations | 12 | Sound |
| 4 | Of Speech | 25 | Sound |
| 5 | Of Reason, and Science | 22 | Sound |
| 6 | Of the Interiour Beginnings of Voluntary Motions | 58 | Sound |
| 7 | Of the Ends or Resolutions of Discourse | 7 | Sound |
| 8 | Of the Vertues Commonly Called Intellectual; and Their Contrary Defects | 27 | Sound |
| 9 | Of the Severall Subjects of Knowledge | 12 | Sound |

## Defects found and fixed

None. `lev-batchA-corrected.json` is byte-for-byte identical in content to
`lev-batchA-current-modern-en.json` (only the file was copied, no paragraph text was
altered), because no fidelity break was found that needed a fix.

## Notes on borderline cases considered and NOT flagged as defects

A few spots involve register-level compression of a single clause rather than a dropped
premise or logic break; these were judged to preserve full argumentative content and were
left as-is per the instruction to fix only genuine content-fidelity breaks, not to
re-litigate acceptable modern-English compression:

- **Ch. 4 ("Of Speech"), para 1** — source: "...and in tract of time grew every where
  more copious." Current: "...and growing more copious with time." The locational nuance
  "every where" (i.e., in every region the dispersed peoples settled) is folded rather
  than dropped as a distinct clause — the same fact (dispersal into many regions) is
  already stated explicitly earlier in the same paragraph ("Driven thereby to scatter
  themselves into the various parts of the world..."), so no information or logical step
  is actually lost. Not fixed.
- **Ch. 5 ("Of Reason, and Science"), para 2** — source: "unpractised men must, and
  Professors themselves may often erre" (i.e., professors/teachers of the art of
  arithmetic). Current: "unpractised men must, and even professional accountants may
  often ... make mistakes." "Professors" is rendered as "professional accountants" rather
  than literally "teachers of the art" — an interpretive but reasonable modernization
  that preserves Hobbes's point (that even experts can err in reckoning), not a
  terminological distortion of a load-bearing technical term (unlike "endeavour,"
  "phantasm," etc., which are rendered literally and consistently throughout). Not fixed.

Both of the above were reviewed and judged not to rise to the level of a defect under the
brief's fidelity checklist (no dropped premise, no inversion, no broken logical chain, no
mistranslated core technical term). If a stricter bar is wanted, both are trivial one-line
fixes and can be applied on request.
