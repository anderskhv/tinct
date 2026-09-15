# Batch 2026-09-13 — 33 chapters that finish 21 editions

Measured against production on 2026-09-13, not carried over from the
2026-09-11 queue, which is now stale: 15 of the 42 editions it listed as
near-complete have finished since.

## The `finish-now` batch is closed at 6 of 19

| outcome | chapters |
| --- | ---: |
| published and verified | 6 |
| rejected: a paragraph aligned below 0.85 | 9 |
| repair queue: 1-2 paragraph recordings unreachable | 4 |

The 9 rejections are not marginal chapters. Their whole-chapter match ratios
run 0.92-0.995; each fails because individual paragraphs fall under the gate.
The gate is per-paragraph and stays per-paragraph. Nothing here is publishable
without either regenerating recordings (unauthorised spend) or moving the
threshold (never).

## What this batch is

Of 233 chapters queued across editions with 10 or fewer outstanding, 41 are
still unpublished. 14 of those 41 are the excluded set above, listed in
`already-excluded.json` so no one re-attempts them by accident.

The remaining **27 are fresh and alignable**, and a full re-probe of the
editions with more than ten chapters queued found **6 more sitting one chapter
from done**. `finish-editions.json` holds all **33**, closing out **21
editions**:

- one chapter each: `aristotle-politics`, `communist-manifesto`, `faust-part-1`,
  `frankenstein`, `hume-enquiry`, `jekyll-and-hyde`, `medea`,
  `nicomachean-ethics`, `the-aeneid` (all `original-en`)
- two each: `bacchae`, `merry-wives-of-windsor`, `paradise-lost`
- three each: `the-republic`, `the-tempest`
- six: `bible/kjv-en`
- one chapter each, found by the re-probe: `antigone` ch1, `candide` ch26,
  `poetics` ch22, `pride-and-prejudice` ch2, `the-awakening` ch12,
  `the-prince` ch7

## Complete Priority-1 editions: 26 of 101, measured this tick

6 were complete when the queue was built, 15 finished among the near-complete
group, and 5 more among the larger editions. This supersedes the 22 carried in
earlier reports.

A note on how that was counted, because it nearly went wrong: of the 51
editions with more than ten chapters queued, 21 passed a three-chapter sample
and only **5** proved complete when every chapter was probed. Sampling would
have overstated the count by sixteen editions — the same failure that put four
chapters with missing recordings into the last batch. Sampling is only ever
used here to rule an edition out; nothing is called complete without a full
probe.

Highest edition-yield per GPU-minute of anything left in Priority 1.

## Guardrails unchanged

$25 total envelope, $0.00 of it spent. $1/hour per-GPU ceiling, 50-minute stop
deadline, one owned pod with measurable uptime. The 0.85 per-paragraph
threshold does not move. No recording is regenerated. `magna-carta/original-en`
ch1 stays unpublished.

## Batches E and F (2026-09-15, after the markup fix)

`batch-e-recovered-markup.json` — 13 chapters. Every one was rejected under the
old normalizer and passes when its stored diagnostics are replayed through the
corrected one. This batch is the end-to-end confirmation that the offline
replay was right; it is not new coverage in the sense of new alignment work.

`batch-f-verse-priority1.json` — 45 chapters across 16 plays, `original-en`
only (originals and human translations; the `modern-en` renderings are
AI-created and stay Priority 2). Never attempted. Chapters already present in
any earlier collect-report are excluded, so this measures the corrected
pipeline on fresh verse rather than re-running known outcomes.

There are 374 Priority-1 verse chapters untimed and audio-ready in total, and
808 counting `modern-en`. Before the fix that corpus passed at 5% and was not
worth the CPU. Batch F is the test of whether it is worth it now — run it
before queueing the rest.

Both files are the `[{bookId, edition, chapter}, ...]` shape `cloud_cohort.py
--targets` and `verify_timings.py --targets` expect. They live here rather than
only in the scratchpad because the session container has been reclaimed
mid-batch before, most recently for the 43 hours between 2026-09-14 02:41 and
2026-09-15 22:00.
