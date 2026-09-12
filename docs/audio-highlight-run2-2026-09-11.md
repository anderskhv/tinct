# Audio word highlighting — GPU run 2

September 12, 2026. Execution owner: a Claude cloud session on branch
`claude/audio-run2-20260912`. Evidence lives in
`artifacts/audio-highlight-run2-2026-09-11/`; the live operational state is
`artifacts/audio-highlight-run2-2026-09-11/STATE.md`, rewritten as the run
moves. Brief: `docs/audio-highlight-run2-brief-2026-09-11.md`.

## Status at this push — in progress

This session is the **third** to own run 2. The first never pushed; the second
pushed its survey and queue (`dc2278edc`) and was then killed by a container
restart at 05:25 UTC with eight pods still billing.

### Adopt, not terminate

`runpod_guard.py status` found **eight** owned pods RUNNING, not the five named
in the handover: `tinct-words-run2-11` through `-18`. Every one carried
`TINCT_TOKEN` and `TINCT_TARGETS` in its RunPod environment, so
`gpu/adopt.py` could recover the read-only status server of each and finish the
job the dead orchestrator started. All eight were adopted within four minutes of
session start; the first status poll reached every pod, and together they held
**all 65 wave-1 chapters**. Terminating would have thrown away 65 chapters of
GPU work that was already 3-6 minutes in, and would have had to buy it again.

Adoption is the right default whenever the pods still answer: the decision cost
about ninety seconds of reading `adopt.py` and one API call per pod to confirm
the token was there.

### Capacity

COMMUNITY cloud had no instances of any of the seven allowed GPU types.
SECURE had some at the same $0.49/hr, so wave-2 pods run with `--cloud SECURE`.
Concurrency saturates around 12 pods; `dispatch.py` retries refused launches
(they cost nothing) and keeps the queue moving.

## Numbers

Filled in at close from `run_summary.py` and the publication journal.
