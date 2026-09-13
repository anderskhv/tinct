# Slice A results — 2026-09-13

One record per chapter in `slice-a.json`. Each chapter is aligned on CPU with
the pinned `Systran/faster-whisper-small.en` revision
`d1d751a5f8271d482d14ca55d9e2deeebbae577f` (tree hash
`8774f4f6e08889f60267f2a042e930a22ba145ed9eb3fce0d2b3be4e535d74f5`), both arms
(`off`, `auto`), then gated, published and re-read from production.

Acceptance is unchanged and per **paragraph**, not per chapter: every paragraph
must reach 0.85 observed token matching. A chapter whose whole-chapter ratio is
high still fails if one paragraph falls below the threshold, and it is recorded
as failed with its ratios rather than promoted.

- `{book}-ch{n}.report.json` — `collect_candidates.py` output: per-arm status,
  whole-chapter matchRatio, and every paragraph that failed, with its reason.
- `publication-journal.json` — `publish_timings.py` journal: key, SHA-256, size,
  validation summary, and the hash of the bytes production served back.
- `verification.json` — `verify_timings.py` run against the published objects.

## What slice A actually produced

Ten of the eleven chapters were rejected by the per-paragraph gate, and the
rejections are not noise: this run reproduces the committed CPU canary of
2026-09-11 (`../../audio-highlight-priority1-queue-2026-09-11/cpu-canary/`)
chapter for chapter — same chapter, same failing paragraph indices, same
ratios — so the pipeline is the one the acceptance results were measured
against.

Nine of the ten rejected chapters score 0.95-0.997 across the whole chapter and
fail on **one to four paragraphs**. Those paragraphs fall into three kinds:

- **Short structural fragments.** A heading (`_A. Feudal Socialism_`, 3 tokens),
  a letter's address or signature (`_To Mrs. Saville, England._`; `R.W.`, 2
  tokens), a date line (`“10_th December_, 18—.`), a citation
  (`_Cicero de Finibus_. Lib. v.`), a one-line reply (`“To-morrow fortnight.”`,
  2 tokens). On a paragraph this short a single token of recogniser variance is
  a fifth to a half of the paragraph, so the ratio collapses below 0.85 no
  matter how good the timing is. Paragraph 1 of communist-manifesto ch4 is the
  clean example: the recogniser hears "A. Feudal Socialism" as one word,
  "Afeudal", and scores 0 of 3.
- **Text that is not the English being spoken.** A Latin footnote inside an
  English recording (hume-enquiry ch7 p8), or Greek rendered as spelled-out
  letter names (`{Theta omicron iota nu alpha tau alpha iota}`, poetics ch22 p1).
- **A corrupt edition.** faust-part-1 ch2 fails on all 12 paragraphs at a
  whole-chapter ratio of 0.21. The published edition text is OCR-damaged
  throughout — `motley multitu«`, `let thete be incident enough`, `when 1
  myself` — so there is nothing for the audio to match. This is a text defect,
  not a timing defect, and no alignment run will fix it.

None of this was worked around. The threshold is per paragraph, it stays at
0.85, and a chapter that fails is recorded here with its ratios.

What this says about the queue: slice A was built from readiness and coverage,
which measure whether a chapter *can* be aligned, not whether every paragraph in
it *will* clear an exact-token gate. Chapters whose paragraph list includes
headings, signatures, dates or non-English fragments will keep failing this gate
while the gate is a uniform per-paragraph exact-token ratio. That is a decision
for Anders — either those paragraph kinds are classified as unspoken/structural
before alignment, or the gate stays as it is and these editions stay incomplete.
Nothing here changes the gate on its own.
