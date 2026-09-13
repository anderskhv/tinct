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
