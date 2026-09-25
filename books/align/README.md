# Edition alignment (compare-flip precision) — PILOT

Status: **pilot, format is a draft for review.** Nothing in the app reads these
files yet. Outputs stay under `books/align/` until the format is agreed and the
app integration (Codex) is scheduled.

## Why

The mobile compare flip maps only the *start* of the main page, and inside a
long paragraph it guesses by proportional position. In drama and loose
paraphrases that lands lines away (Hamlet 1.3: "goes withal" → "He can't just
choose for himself", ~5 verse lines early). This data gives the reader
sentence-group correspondences inside long paragraphs so the compare page can
show the passage equivalent to the whole main page (start and end).

## Pipeline

1. `build_alignment.py <bookId>` — deterministic, zero spend. Sentence split +
   monotonic DP scored on shared content words and length ratio. Only paragraphs
   with ≥100 words in either edition (shorter ones fit a phone page; the
   paragraph anchor already suffices). Weak segments are written to a review
   file with `--review-out`.
2. Model pass (Claude Code helper agent, subscription, one at a time) resolves
   only the review file into `overrides/{bookId}.json`.
3. Re-run step 1: overrides are merged and structurally validated.
4. Review report (`review_report.py`) samples auto-accepted (random and
   hardest), model-corrected, and unresolved segments. Checks so far are
   model review, not human verification. The validator checks structure
   only, not meaning.

## Data contract (format version 1)

Defined in [`HANDOFF-codex.md`](HANDOFF-codex.md#data-contract-format-version-1):
edition IDs, sha256 fingerprints of both complete edition files, stable
locations (chapter number + 0-based paragraph index), whitespace-word offsets,
segment kinds `m`/`u`/`s`/`t`, per-paragraph review status, and
`approved: null` until a person signs a book off (then an object recording
the evidence; see `EVAL-PLAN.md`). Consumers ignore files that
are unapproved or whose fingerprints don't match the served editions.

First-pass data is always marked: paragraphs are `auto` / `auto-flagged`, the
file is `reviewState: "first-pass"` while any unreviewed paragraph remains.
Weak first-pass spots become `u`; nothing is forced into a match.

Files: `build_alignment.py` (first pass, merge, validate),
`test_build_alignment.py`, `review_report.py` (review samples),
`HELPER_PROMPT.md` (model pass), `HELPER_EVAL_PROMPT.md` + `eval_score.py` + `eval/` (evaluation), `human_sample.py`, `overrides/` (model/human
reviews), `data/` (outputs), `review/` (reports).

## Pilot results (2026-09-24, checkpoint 2)

All checks below are **model review** (Claude), not human verification.
Report: [`review/pilot-report-2026-09-24.md`](review/pilot-report-2026-09-24.md).

| Book | Long paras | Model-reviewed | Unresolved / one-sided | Helper tokens | Word overlap* |
|---|---|---|---|---|---|
| hamlet | 65 | 20 (flagged only) | 1 unreviewed first-pass `u` (10/13) | 111,149 | 0.30 |
| macbeth | 23 | 23 (all, incl. 20 auto-accepted) | 3 (see below) | 146,104 | 0.34 |
| frederick-douglass | 118 | 7 (flagged) | 1 `u` (11/5, 217-word sentence) | 130,233 | 0.55 |
| walden / on-liberty | 347 / 113 | 0 | 0 | 0 | 0.94 / 0.91 |

*Jaccard word overlap, modern vs original, long paragraphs. Above ~0.6 the
"modern" edition is close to a light edit, which makes alignment trivially
easy; those books say little about genuinely modernised prose.

Helper-only total: 387,486 tokens (3 helpers, one at a time, 0 retries needed:
no override was rejected by the validator). Main-session usage is not
measurable from inside the session.

Findings:
- Macbeth: the model changed all 23 paragraphs; it reports 8 with real
  one-sentence misalignments in first-pass output that had been auto-accepted
  or flagged, the rest granularity refinements. 7/1 and 17/1 checked (model
  review): correct.
- Frederick Douglass, auto-accepted first pass (not model-reviewed): two
  one-sentence boundary shifts found in samples (10/0 "How I escaped death" and
  10/2 "faculty of making us feel"). First pass is not reliable at sentence
  level on genuinely paraphrased prose.
- Macbeth: served editions were missing 34 speeches (~1,300 words, incl. "Is
  this a dagger"). Repair prepared on this branch, not published:
  `books/MACBETH-DROPPED-SPEECHES-2026-09-24.md`. Alignment regenerated on the
  repaired text (22 model reviews remapped and still valid; 4 new long
  paragraphs unreviewed). Stays unapproved.

Human samples: `review/human-sample-hamlet-douglass-2026-09-24.md` (17 random
segments) and `review/human-sample-macbeth-repaired-2026-09-24.md` (9, repaired
text). Evaluation (`EVAL-PLAN.md`): on hold. All alignment files stay
unapproved until their evidence meets an agreed release standard.
- Sentence-split bugs found by the report and fixed: abbreviations ("Mr.",
  initials) and emphasis-prefixed abbreviations ("_Mr.").

## Human sample result (Anders, 2026-09-24): Hamlet + Douglass, 17 items

- Human: item 10 off by a sentence; the other 16 aligned at the displayed level.
  Item 7 has a separate translation-fidelity note ("best safety lies in fear"
  → "safety lies in being careful"); not an alignment issue, edition text not
  changed. Item 17 is correct but too long for comfortable mobile comparison.
- Neighbour check (model review; `sample_context.py`, frozen items in
  `review/human-sample-hamlet-douglass-2026-09-24.items.json`, context in
  `.context.md`): three more first-pass shifts found beside sampled items —
  Douglass 10/0 (three shifts in one paragraph, incl. item 10), Douglass 10/36
  ("Friday night"), Hamlet 10/13 ("That would be scann'd"). All fixed as
  reviewed overrides; no edition text changed.
- Items 8 and 17 "unresolved": item 8 was a first-pass flag nobody had reviewed
  (now two clean matches); item 17 is a correct block whose finer clause
  boundaries fall inside em-dash-joined tokens, which word offsets cannot
  express (format v2 deferred; see HANDOFF-codex.md).
- Takeaway: unreviewed first-pass data for paraphrased prose is not good enough
  (of 5 sampled Douglass first-pass items, 1 was itself off by a sentence and
  1 more had a shift right beside it).
