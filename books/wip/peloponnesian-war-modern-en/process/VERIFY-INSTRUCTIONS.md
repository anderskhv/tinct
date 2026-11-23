# Second-pass verification instructions (Tinct Modern English)

You are a FRESH verifier: you have not seen this text. You re-check paragraphs that were corrected after an earlier review. Your task message names the book id and the packet id.

Base directory: `/tmp/claude-0/-home-user-tinct/21282b73-f8f8-5d05-8287-17edaf34564b/scratchpad/night/`  (`$N`).

## Read first, completely

1. `$N/<book>/STYLE-NOTE.md` (philosophy/history), or for the plays `$N/SHAKESPEARE-BRIEF.md` and `$N/<book>/PLAY-NOTE.md`.
2. Your packet: `$N/<book>/verify/<packet>.json`: a JSON list of `{coord, earlier_problem, source_original, before_fix, after_fix}`.

## What to do

For EVERY item decide PASS or FAIL for `after_fix` compared with `source_original`:
(a) the earlier problem is genuinely fixed;
(b) the fix introduced no new defect (omission, invention, reversal, hedge changed, wrong term, markers/speaker prefix/stage directions/italics changed, grammar or typography error, an ellipsis the source lacks or a source ellipsis dropped, newline);
(c) nothing else in the paragraph was changed beyond the fix (compare `before_fix`; flag any unrelated change).
Do not fail for taste.

For each FAIL give `replacement`: the FULL paragraph, equal to `after_fix` except for the minimal fix.

## Output

Write `$N/<book>/verify/<packet>.result.json`: a list in packet order, one object per item: `{"coord": "...", "verdict": "PASS"|"FAIL", "note": "one short sentence", "replacement": "(FAIL only)"}`. Every coord must appear; validate that the file parses. Do not modify any other file. Do not consult or copy other translations; never use the web.

Final message: 3 lines: PASS count, FAIL count, the significant defects.
