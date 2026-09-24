# Evaluation plan: first-pass accuracy on genuinely paraphrased prose

Status: **on hold (Anders, 2026-09-24).** Macbeth repair first. When resumed:
a smaller pilot only, usage measured immediately before and after batch A, then
a separate decision on batch B. No acceptance threshold is agreed (see below).

## Question

How often is the free first pass wrong on genuinely paraphrased prose, including
matches it did *not* flag? Frederick Douglass (word overlap 0.55) produced two
one-sentence errors among unflagged samples; *Walden* and *On Liberty* (0.91–0.94)
are near-identical editions and are not evidence either way.

## Sample (drawn in advance, seed 20260925)

Five books whose modern edition overlaps the original by less than 0.6 of words
(genuinely rewritten, not a light edit). Exact editions and categories:

| Book | Served "original" edition | Category | Overlap |
|---|---|---|---|
| werther | R. D. Boylan's English translation (registry label says 1779; Boylan's translation is from 1854, label to check) | translated prose fiction | 0.30 |
| frankenstein | Mary Shelley, 1831 revised text (PG #84) | English prose fiction | 0.43 |
| crime-and-punishment | Constance Garnett translation, 1914 (PG #2554) | translated prose fiction | 0.47 |
| leviathan | Hobbes, 1651 | English prose, philosophy | 0.54 |
| the-aeneid | John Dryden's 1697 translation in rhymed heroic couplets (PG #228), with prose "Argument" summaries | **verse translation → modern prose**; not prose, evaluated as its own category | 0.56 |

Six long paragraphs per book drawn **uniformly at random
from all long paragraphs** (flagged or not): 30 paragraphs, 27 of them
unflagged first-pass matches.

- Batch A: 5 paragraphs (the first drawn per book), `eval/batch-a-input.json`.
  The other 5 originally drawn for A are kept in `eval/batch-a-reserve.json`.
- Batch B: 20 paragraphs (4 per book), `eval/batch-b-input.json`; only by a
  separate decision after batch A's measured usage.

Two batch sizes also show whether larger batches are cheaper per passage; that
is measured, not assumed.

## Method

One helper at a time grades every first-pass segment (`HELPER_EVAL_PROMPT.md`):
`ok`, `refine` (right but could be finer; not an error), `shift` (off by up to
one sentence), `wrong` (more than one sentence off, or not counterparts); for
`u` blocks, `u-needed` or `u-resolvable`. `eval_score.py` validates and reports
the error rate: (`shift` + `wrong`) / first-pass `m` segments. Nothing is
written to `data/` or `overrides/`.

These labels are model review. To calibrate the grader, 10 of its labels (at
least 3 `shift`/`wrong` if any exist) go into a human sample for Anders.

## Acceptance threshold: NOT agreed

Anders, 2026-09-24: the proposal below is not approved. Thirty paragraphs over
five books is weak evidence for any single category, errors inside one
paragraph are not independent, a low observed rate does not establish a low
underlying rate, and an off-by-one-sentence match is material for a
sentence-comparison feature. Kept for the record only.

### Superseded proposal

Per book category (genuinely paraphrased prose):

- **First pass may ship without model review** if the error rate is **≤ 3%**
  and there are **no `wrong`** labels in the sample.
- Otherwise every long paragraph in that category needs the model pass, then a
  random human sample before approval.

Reader impact, for calibration: a `shift` makes the compare passage start or
end one sentence early or late, in the right place. A `wrong` shows the wrong
passage. Today's behaviour is a proportional guess inside the paragraph.

## Spending limit (when resumed)

A token figure is a reporting threshold, not a cap: a running helper cannot be
stopped at an exact token count from here. What actually bounds spend:

- **Input size:** batch A cut to 5 paragraphs (one per book), fixed in advance.
- One helper, one pass, no retries (a rejected item is dropped and reported).
- Meter reading by Anders immediately before and after batch A; batch B only by
  a separate decision based on that measured cost.

## Approval semantics (format change)

`approved` stays `null` until a person signs off. When set, it records the
evidence, not a claim that every passage was verified:

```json
"approved": {
  "by": "Anders", "date": "2026-10-01",
  "basis": "human sample: 24 segments checked, 1 off by a sentence, 0 wrong; model review of all flagged paragraphs",
  "sampleFile": "books/align/review/human-sample-2026-09-24.md"
}
```
