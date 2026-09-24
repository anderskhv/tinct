# Evaluation plan: first-pass accuracy on genuinely paraphrased prose

Status: **sample drawn, not run.** Waiting on (1) a usage meter reading before
batch A and (2) agreement on the acceptance threshold below.

## Question

How often is the free first pass wrong on genuinely paraphrased prose, including
matches it did *not* flag? Frederick Douglass (word overlap 0.55) produced two
one-sentence errors among unflagged samples; *Walden* and *On Liberty* (0.91–0.94)
are near-identical editions and are not evidence either way.

## Sample (drawn in advance, seed 20260925)

Five prose books with modern-vs-original word overlap below 0.6, spanning
translated fiction, English fiction, philosophy and verse epic: *werther* (0.30),
*frankenstein* (0.43), *crime-and-punishment* (0.47), *leviathan* (0.54),
*the-aeneid* (0.56). Six long paragraphs per book drawn **uniformly at random
from all long paragraphs** (flagged or not): 30 paragraphs, 27 of them
unflagged first-pass matches.

- Batch A: 10 paragraphs (2 per book), `eval/batch-a-input.json`, ~83 first-pass segments.
- Batch B: 20 paragraphs (4 per book), `eval/batch-b-input.json`.

Two batch sizes so helper usage can be compared at 10 vs 20 paragraphs. This is
the measurement behind "larger batches are cheaper per passage"; it is not
assumed.

## Method

One helper at a time grades every first-pass segment (`HELPER_EVAL_PROMPT.md`):
`ok`, `refine` (right but could be finer; not an error), `shift` (off by up to
one sentence), `wrong` (more than one sentence off, or not counterparts); for
`u` blocks, `u-needed` or `u-resolvable`. `eval_score.py` validates and reports
the error rate: (`shift` + `wrong`) / first-pass `m` segments. Nothing is
written to `data/` or `overrides/`.

These labels are model review. To calibrate the grader, 10 of its labels (at
least 3 `shift`/`wrong` if any exist) go into a human sample for Anders.

## Proposed acceptance threshold (for agreement before any expansion)

Per book category (genuinely paraphrased prose):

- **First pass may ship without model review** if the error rate is **≤ 3%**
  and there are **no `wrong`** labels in the sample.
- Otherwise every long paragraph in that category needs the model pass, then a
  random human sample before approval.

Reader impact, for calibration: a `shift` makes the compare passage start or
end one sentence early or late, in the right place. A `wrong` shows the wrong
passage. Today's behaviour is a proportional guess inside the paragraph.

## Caps

- Batch A first. Stop and report if batch A's helper uses more than 150k tokens.
- Total helper cap for the evaluation: 300k tokens. At most one retry per
  paragraph.
- Main-session usage is not measurable from inside the session; a meter reading
  before batch A and after batch B gives the real total.

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
