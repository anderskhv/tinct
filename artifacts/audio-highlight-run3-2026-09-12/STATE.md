# Run-3 STATE — CLOSED 2026-09-12 17:15 UTC

**Nothing is running.** No pod, no dispatcher, no harvest daemon, no guard loop.
`guard/closing-status.txt` is the proof: `owned pods: 0` for the prefix
`tinct-words-run3-`.

## Final numbers

- **990 chapters published and verified** (`publication-journal.json`: 990
  published, 2 skipped, 0 served-hash mismatches). Independent close-out
  re-fetch from tinct.app: **990 verified, 0 mismatched** (`verify-close.log`).
- **15 editions completed** — the number run 2 got wrong (it completed zero).
  Measured by re-probing production for all 8,690 English chapters that have a
  recording: `edition-completion.json`. 38 English editions are now complete.
- **Spend $16.21 of the $20 envelope** (`spent.txt`), 73 pods, 1,985
  pod-minutes, every pod at $0.49/hr against the $1.00/hr ceiling, longest 40.0
  min against the 50-minute limit.
- Helper v3 shipped and validated before any pod: 1,887 paragraphs cross the
  0.85 gate upward on replay, **0** downward.

Full account: `docs/audio-highlight-run3-2026-09-12.md`.

## What a fresh session should do first

Nothing urgent — no resources are live. Run 4's work, in order:

1. **Helper v4 against what is actually left.** The residue is no longer a
   normalisation class: Latin/French/Greek passages, a looped sentence,
   initials (`R.W.`), an unspaced `...`, plain recognition misses. The corpus to
   measure a v4 against is `pods/*/rejected-extract.json` — for every below-gate
   paragraph, its expected tokens and the recogniser's own heard words and
   timings. Count editions finished per candidate class **before** building.
2. **The rest of the census.** 2,492 English chapters still have a recording and
   no sidecar; 102 batches are already cut
   (`batch-manifest-refill.json`, batches 401-502). Mostly the long books, where
   an edition only completes when every one of its batches lands.
3. **Re-recording work**: the 4 missing recordings, the repair queue, Phaedo
   ch1/ch7.

## Operating notes worth keeping

- **Rank by completability, not by gap.** Ordering editions by "fewest chapters
  missing" published 3 of 17 in batch 1. `build_batches2.py`'s tier-0 rule — every
  chapter the edition still needs is either unattempted or replay-predicted to
  pass — is what actually finished editions.
- **Concurrency is the throughput lever**, not batch size or GPU class: setup is
  ~1.6 min of a 16-40 min pod, RunPod refused nothing at 30 pods, and every pod
  landed on the same $0.49/hr tier whatever GPU list was requested.
- **Harvest prunes as it publishes.** At 22 concurrent pods the diagnostics hit
  8.5 GB and the disk hit 96%. `harvest_one.sh` now distils each pod's
  `rejected/` into `rejected-extract.json` and deletes `rejected/`, `out/`,
  `cohort/` and the tarballs in the same step. Check free disk before raising
  concurrency.
- **The guard never acts on EXITED pods** by design, so a stale exited pod must
  be terminated deliberately by id — never with a bare `stop-all`, which matches
  live run pods. Two were cleaned up this way: `tinct-words-run2-6` and
  `tinct-words-run3-45`.
- Never `pkill -f <script-name>` here: the pattern matches the invoking shell and
  kills the tool call instead of the daemon. Kill by PID from `ps -eo pid,args`.

## Tooling built this run (all in this directory)

`build_batches.py` / `build_batches2.py` / `build_batches3.py` / `refill.py`
(queue cuts, completability first), `dispatch.py` (capacity-retrying launcher,
live-tunable concurrency via `max_pods.txt`, budget stop), `harvest_daemon.py` +
`harvest_one.sh` (publish, distil, prune, commit, push — one pod at a time),
`distil_rejections.py`, `gloop.sh` (guard every 5 min at the mandate's limits),
`quick_survey.py`, `edition_completion.py`, `verify_published.py`,
`recompute_spent.py`, `tools/replay.py`.
