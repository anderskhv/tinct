# Run-3 STATE

_Last written: 2026-09-12 14:15 UTC._

## Right now — Part B is running

- **Guard loop running** (`gloop.sh`): `runpod_guard.py enforce --apply` every 5
  minutes at `--owner-prefix tinct-words-run3- --max-rate 1.00 --max-minutes 50
  --budget 20`. Log: `guard/guard.log`.
- **Dispatcher running** (`dispatch.py`), holding 10 pods, budget stop at $16.
- **Harvest daemon running** (`harvest_daemon.py`): harvests, publishes and
  **pushes after every single pod**. Log: `harvest.log`.
- Pods are named `tinct-words-run3-<n>`; `orchestrate.py` terminates each one
  itself after harvest, and the guard is the backstop.

**A fresh session must run `python3 tools/audio-highlight/runpod_guard.py status
--owner-prefix tinct-words-run3-` first.** Any pod still RUNNING with no
`orchestrate.py` process alive must be adopted (`gpu/adopt.py` — the pods carry
`TINCT_TOKEN`) or terminated. Never `pkill -f <script>`: the pattern matches the
invoking shell and kills the tool call instead of the daemon. Kill by PID from
`ps -eo pid,args`.

## Part A — done and pushed

Helper v3, 28 new unit tests, `PINS.md`, `trial.py --helper v3` (the default now),
`pod_job.py`/`orchestrate.py` carrying v3 to the pods. Replay of all 210,214
recorded run-2 attempts: 1,887 paragraphs cross the gate upward, **0** downward;
67 more chapters pass. Macbeth CPU canary byte-identical to the v2 canary on both
arms. Report: `docs/audio-highlight-run3-2026-09-12.md`.

## Part B — how the queue was chosen, and why it was re-cut twice

1. `build_batches.py` ordered editions by fewest chapters missing. Batch 1 went
   out on that basis and **published 3 of 17** — the replay had already said
   twelve of those single chapters fail under v3 for reasons outside any
   normalisation class (Latin passages, a looped sentence, plain recognition
   misses). Ordering by gap alone buys almost nothing.
2. `build_batches2.py` ranks editions by *completability*: tier 0 is an edition
   where every chapter it still needs either was never attempted or the replay
   says v3 passes it.
3. `build_batches3.py` re-cut the remainder from the full production census
   (`missing-timings.json`), which brought the untouched `modern-en` editions in
   — several are one or two chapters from complete. Batch 201 alone completes
   eight editions.

`pending.json` is the batches not yet launched; `dispatch.py` resumes from it.
It has been trimmed to the batches that actually finish editions.

Skips, unchanged: already-published chapters (publication creates, never
replaces), the repair queue, Phaedo ch1/ch7 (spelled-out speakers, re-recording),
every `bible/*`, `magna-carta`, `faust-part-1`, `as-you-like-it`,
`henry-iv-part-2`, `taming-of-the-shrew`. English only. Gate 0.85. Nothing
synthesised.

## Measuring the thing that matters

`edition_completion.py` re-probes production for every chapter of every edition
and reports **editions completed**, not chapters published. Run it at close.

## Spend

`spent.txt`, recomputed by `recompute_spent.py` from every pod.json's
`estimatedCost`. Envelope $20; dispatcher stops launching at $16.

## Cleaned up

`tinct-words-run2-6` (`zcpat4n88pbixj`), the stale EXITED run-2 pod, was
terminated deliberately by id (the guard never acts on EXITED pods by design).
