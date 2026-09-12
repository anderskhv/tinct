# Run-3 STATE

_Last written: 2026-09-12 13:28 UTC._

## Right now — Part B has started

- **Guard loop running** (`gloop.sh`, PID in `ps`): `runpod_guard.py enforce --apply`
  every 5 minutes at `--owner-prefix tinct-words-run3- --max-rate 1.00
  --max-minutes 50 --budget 20`. Log: `guard/guard.log`.
- **Pod `tinct-words-run3-1` is LIVE** (`0ovz79hr09d8wp`, $0.49/hr, SECURE),
  launched 13:25 UTC with `batch-1.json`: 17 chapters, 542 paragraphs, 6.26 h of
  audio, one chapter each from 17 editions that are **one chapter from complete**.
  `orchestrate.py` harvests and terminates it itself; `launch-1.log` is its log.
- Nothing else is running. The dispatcher has **not** been started yet — pod 1 is
  the end-to-end check that helper v3 behaves on GPU.

**If you are a fresh session: run `python3 tools/audio-highlight/runpod_guard.py
status` first.** Any `tinct-words-run3-*` pod still RUNNING with no orchestrator
process alive (`ps -eo pid,args | grep orchestrate`) must be adopted
(`gpu/adopt.py`, it carries `TINCT_TOKEN`) or terminated before anything else.
Never `pkill -f <script>` here — the pattern matches the invoking shell.

## Part A — done and pushed

Helper v3 (`pinned_words_sidecar_lib_v3.py`, SHA-256
`302cbd02aad3e57bc91f277069855173b782162a35522eba85e664d14daa49ff`), 28 new unit
tests, `PINS.md`, `trial.py --helper v3` (now the default), and pod_job/orchestrate
carrying v3 to the pods. Replay of all 210,214 recorded run-2 attempts: 1,887
paragraphs cross the gate upward, **0** downward; 67 more chapters pass. Macbeth
CPU canary byte-identical to the v2 canary on both arms. Report:
`docs/audio-highlight-run3-2026-09-12.md`.

## Part B — the queue

`build_batches.py` cut **60 batches / 986 chapters / 71 editions** from
`quick-survey.json` (a live probe of production for every chapter run 2
measured), editions closest to complete first. `batch-manifest.json` says what
each batch completes if it all passes:

| batch | chapters | paragraphs | editions completed if all pass |
| --- | --- | --- | --- |
| 1 | 17 | 542 | **17** |
| 2 | 14 | 896 | **10** |
| 3 | 10 | 867 | 4 |
| 4 | 10 | 567 | 3 |

24 editions are one chapter short, 9 are two short, 4 are three short.
`pending.json` holds the batches not yet launched; `dispatch.py` resumes from it
(`MAX_PODS=10`, budget stop at $16).

The full census (`audit_production.py` → `missing-timings.json`) is still running
in the background; merge it when it lands to catch editions outside run 2's
candidate set.

Skips, unchanged: already-published chapters, the repair queue, Phaedo ch1/ch7
(spelled-out speakers, re-recording), every `bible/*`, `magna-carta`,
`faust-part-1`, `as-you-like-it`, `henry-iv-part-2`, `taming-of-the-shrew`.
English only. Gate 0.85. Nothing synthesised.

## Spend

`spent.txt`, recomputed by `recompute_spent.py` from every pod.json's
`estimatedCost`. One pod at $0.49/hr is live; envelope $20.

## Cleaned up

`tinct-words-run2-6` (`zcpat4n88pbixj`), the stale EXITED run-2 pod the run-2
close-out left behind, was terminated deliberately by id (the guard never acts on
EXITED pods by design).
