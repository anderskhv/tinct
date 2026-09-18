# Modern-EN repair — correction and verification prompts

## Correction (drafter or corrector)

You are given the candidate chapter, the source chapter, the accessibility review and the fidelity review. Apply every MAJOR and MODERATE fidelity finding and every `unclear` accessibility finding. Apply MINOR findings and `hard` findings where the fix is local and does not risk new meaning drift. Touch nothing else.

Rules:
- Every change is source-anchored: re-read the source paragraph before editing.
- A fix for accessibility must not drop, add or sharpen meaning. A fix for fidelity must not make the paragraph harder to read than it needs to be.
- Do not change paragraph count or order.
- Write the corrected chapter JSON, and a corrections log with one entry per changed paragraph: index, exact before text, exact after text, which finding it answers. The log will be diffed against the file; do not claim edits you did not make and do not make edits you did not log.

## Verification (independent, not the corrector)

You are given the pre-correction candidate, the corrected candidate, the corrections log and the source.

1. Diff the two candidates yourself. List every paragraph that changed. Compare that list with the log: every logged change must appear, and every changed paragraph must be logged. Report any mismatch as a blocking finding.
2. For each changed paragraph, re-derive the correct reading from the source (not from the log) and confirm the correction is right, complete, and introduced no new drift.
3. Re-read each changed paragraph as a new reader: is it now clear?
4. Confirm structure: paragraph count, order, no empty paragraphs, per-paragraph question-mark and exclamation-mark parity with source unless a sentence was genuinely restructured.
5. Output: a verification file with the diff list, per-change verdicts, any new findings, and the final line `Verification: ACCEPT | ANOTHER ROUND`. Record the sha256 of the exact corrected file you verified; acceptance applies to that hash only.
