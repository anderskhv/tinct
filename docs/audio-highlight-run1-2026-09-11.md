# Audio word highlighting — GPU run 1

September 11, 2026. Execution owner: a Claude cloud session on branch
`claude/audio-exec-run1-20260911`, spawned by the Tinct coordinator. This file
is the running report; it is rewritten at every push. Evidence lives in
`artifacts/audio-highlight-run1-2026-09-11/`.

## Status at this push — 1: credentials checked, queue selected

**Nothing has been launched yet. $0.00 spent in this run.**

### Credentials

Present by name in the environment: `RUNPOD_API_KEY`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`. No value has been printed, logged, or
committed.

`runpod_guard.py status` at 12:07 UTC: 8 owned `tinct-*` pods, **all
EXITED**, 1 foreign pod left alone, estimated running spend $0.00.

### One thing for Anders, not for this run

Every one of those 8 exited `tinct-*` pods, and the foreign pod, still holds
a 20–50 GB volume. `/billing/pods` shows each billing $0.15–0.33 per day for
disk with zero compute time — about **$1.60/day across the nine**. The
mandate says stop, never delete, and those volumes may hold the Mac's raw
recognition results, so this run does not touch them. Pods created by this
run carry **no volume** and are terminated, not merely stopped, once their
results are fetched.

### Queue selected

Source: `artifacts/audio-highlight-priority1-queue-2026-09-11/p1-finish-queue.json`
(36 editions, 206 chapters), cheapest edition first, filtered twice:

| filter | editions affected | chapters removed |
| --- | --- | --- |
| Mandate exclusions (`magna-carta`, `faust-part-1`, `as-you-like-it`, `henry-iv-part-2`, `taming-of-the-shrew`, `bible/*`) | 1 present in the queue: `magna-carta/original-en` | 1 |
| Normalisation class 1 (underscore tokens cap a paragraph under 0.85, so the unmodified aligner rejects the whole chapter) | 12 | 28 |

That leaves **177 chapters across 35 editions, 93.2 audio hours** in
`artifacts/audio-highlight-run1-2026-09-11/run-queue.json`. The 29 skipped
entries and their reasons are in `skipped.json`.

Why skip the class-1 chapters rather than run them: the scan in the
priority-1 artifacts measured a per-paragraph ceiling below the gate for each
of them. Running them would spend GPU time on a certain rejection. The fix
belongs in the pinned helper and is a decision recorded for Anders in that
artifact's README; nothing here touches the threshold or the helper. Editions
that contain such a chapter (for example `bacchae`, `frankenstein`,
`medea`) cannot reach *complete* in this run, but their alignable chapters
are still processed and published individually.

### How the GPU work runs

`tools/audio-highlight/gpu/` (new on this branch):

- `pod_job.py` — the fixed job a pod runs. Batch arrives in the pod's
  environment at creation; aligner fetched from one pinned commit; model
  fetched from Hugging Face at revision `d1d751a5…` and its tree hash must
  equal the canary's pin `f1fe271c…` or the job stops; recordings and text
  from tinct.app. The pod holds **no credentials**. Its only network surface
  is a GET-only status/results server behind a per-pod random token. It
  accepts no uploads and no commands.
- `orchestrate.py` — creates the pod (on-demand, cheapest available GPU
  under $1/hr, no volume), waits, polls, pulls results, then stops and
  terminates it at a 44-minute launcher deadline — below the guard's 50.
- `guard-loop.sh` — `runpod_guard.py enforce --apply` every 5 minutes from
  this session, with finished-pod spend carried in `spent.txt`.

Model pin resolved: the canary's `f1fe271c…` is the tree hash of the **full
snapshot** (six files, no allow-patterns) at revision `d1d751a5…`, and
`model.bin` is the same blob (`62b2a45b…`) at that revision and at `main`.
Reproduced locally before any launch.

Settings: `--device cuda --compute-type float16 --arms off auto`, gate 0.85,
`trial.py` unmodified. float16 is `trial.py`'s own GPU default; the CPU canary
used int8 only because it ran on CPU.

### Next

1. Local CPU smoke test of `pod_job.py` end to end on one small chapter.
2. Commit and push (the pod fetches its job script from the pushed commit).
3. Launch `tinct-words-run1-1` with the cheapest editions as a measured
   canary batch, guard loop running, and size later batches from its
   throughput.
4. Publish each passing chapter with `publish_timings.py`, journal in
   `artifacts/audio-highlight-run1-2026-09-11/publication-journal.json`.

## Pods

| pod | id | gpu | $/hr | created | stopped | terminated | uptime | est. $ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| — | | | | | | | | |

Spent so far in this run: **$0.00**.

## Chapters aligned / published / failed

None yet.

## Editions completed

None yet.
