# Audio word highlighting — GPU run 1

September 11, 2026. Execution owner: a Claude cloud session on branch
`claude/audio-exec-run1-20260911`, spawned by the Tinct coordinator. This file
is the running report; it is rewritten at every push. Evidence lives in
`artifacts/audio-highlight-run1-2026-09-11/`. The tables at the bottom are
generated from that directory by `tools/audio-highlight/gpu/run_summary.py`.

## Status at this push — 2: first batch published, three pods running

- Pod 1 (`tinct-words-run1-1`, RTX A4500, $0.19/hr) aligned batch 1 —
  13 chapters, 3.55 audio hours, both arms — in 12.4 minutes of GPU time.
  Uptime 14.1 min, **$0.04**, stopped and terminated.
- **12 chapters published and verified** (11 from pod 1 plus one from the
  local CPU smoke test); **3 editions complete**: Crito, U.S. Founding
  Documents, Meditations.
- 2 chapters failed the 0.85 gate on both arms and are not published.
- Pods 2, 3 and 4 launched at 12:35 UTC with batches 2–4 (~8.9 audio hours
  each), running in parallel. Guard loop enforcing every 5 minutes.

### Credentials

Present by name in the environment: `RUNPOD_API_KEY`, `R2_ACCESS_KEY_ID`,
`R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`. No value has been printed, logged, or
committed. The pod receives none of them.

### One thing for Anders, not for this run

The 8 pre-existing exited `tinct-*` pods and the foreign pod each still hold
a 20–50 GB volume; `/billing/pods` shows each billing $0.15–0.33 per day for
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
`run-queue.json`. The 29 skipped entries and their reasons are in
`skipped.json`.

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
  environment at creation; aligner fetched from one pinned commit
  (`a3780bee`); model fetched from Hugging Face at revision `d1d751a5…` and
  its tree hash must equal the canary's pin `f1fe271c…` or the job stops;
  recordings and text from tinct.app. The pod holds **no credentials**. Its
  only network surface is a GET-only status/results server behind a per-pod
  random token. It accepts no uploads and no commands.
- `orchestrate.py` — creates the pod (on-demand, cheapest available GPU
  under $1/hr, no volume), waits, polls, pulls results, then stops and
  terminates it at a 44-minute launcher deadline — below the guard's 50.
- `guard-loop.sh` — `runpod_guard.py enforce --apply` every 5 minutes from
  this session, with finished-pod spend carried in `spent.txt`.
- `run_summary.py` — renders the tables below from the artifacts.

Model pin resolved: the canary's `f1fe271c…` is the tree hash of the **full
snapshot** (six files, no allow-patterns) at revision `d1d751a5…`, and
`model.bin` is the same blob (`62b2a45b…`) at that revision and at `main`.
Reproduced locally, then on every pod (recorded in each `pod.json`).

Settings: `--device cuda --compute-type float16 --arms off auto`, gate 0.85,
`trial.py` unmodified. float16 is `trial.py`'s own GPU default; the CPU canary
used int8 only because it ran on CPU. The one chapter from the local smoke
test (`phaedo/original-en` ch6) was aligned on CPU at int8 with the same
model, code and gate; both arms passed and the candidate validated against
production before it was published.

### Measured throughput

Pod 1: 12,786 s of audio through both arms in 743 s — **17× realtime for the
pair**, on an RTX A4500. Cohort download from tinct.app: 62 s for 3.55 hours.
Setup (pip, model, CUDA probe): 12 s. At that rate one pod within the
44-minute launcher deadline clears about 9 audio hours, which is how batches
2–12 were cut (`batch-N.json`). Cost per pod ≈ $0.15; the whole 93-hour queue
projects to well under $3.

### Why the two failures failed

Both are short paragraphs where one token decides the ratio, with correct
recognition of the speech:

- `communist-manifesto/original-en` ch3 p19: text "Let us now take
  wage-labour."; heard "wage -labour" as two tokens. Ratio 0.80.
- `notes-from-underground/original-en` ch17 p19: text "A fortnight."; heard
  "A Fortnite." Ratio 0.50. p24: "There ... in Riga." — the ellipsis is an
  expected token nothing can match. Ratio 0.75.

Neither is an audio defect. They are gate rejections at the unmodified 0.85
threshold and stay unpublished; full diagnostics are kept under
`pods/tinct-words-run1-1/rejected/`.

### What is committed and what is not

Per pod: `pod.json` (timestamps, GPU, rate, outcome), `orchestrator.log`,
`batch.json`, the job's `status.json` and logs, both arms' `chapter.json`,
`collect-report.json`, `candidates.json`. Per-paragraph recognition
diagnostics and per-arm candidate sidecars are git-ignored for passing
chapters (the published bytes are on R2 and hashed in the journal) and kept
in full for rejected chapters.

### Next

1. Collect, validate and publish batches 2–4 as each pod finishes; push.
2. Launch batches 5–7, then 8–12, three pods at a time.
3. Final push with the guard's closing `status`.

## Pods

| pod | id | gpu | $/hr | created | terminated | uptime min | outcome | est. $ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| tinct-words-run1-1 | `5smmp2998eevju` | NVIDIA RTX A4500 | 0.19 | 12:19:55 | 12:34:03 | 14.1 | done | 0.04 |
| tinct-words-run1-2 | `5ji31k7j0db2vq` | ? | 0.19 | 12:35:37 |  |  |  | 0.00 |
| tinct-words-run1-3 | `lli7qxhiig3qrw` | ? | 0.19 | 12:35:39 |  |  |  | 0.00 |
| tinct-words-run1-4 | `dsrtidan8r3ju1` | ? | 0.19 | 12:35:41 |  |  |  | 0.00 |

Estimated spend across pods (costPerHr × uptime): **$0.04**.

## Published and verified — 12 chapters

| edition | ch | SHA-256 | bytes | at (UTC) |
| --- | --- | --- | --- | --- |
| `phaedo/original-en` | 6 | `fbd76339172ca66b55c717c007bec9f704851948cc87ae3d085c85eed7969aaa` | 39931 | 12:19:38 |
| `crito/original-en` | 1 | `3be771fe96b1df17a1c450c88928a29404e07bb031351069e27ab7b8cd5852ef` | 51084 | 12:34:22 |
| `crito/original-en` | 2 | `4195f5befacbe04935bc91d96efe64ab555e7919362405c234461b2cd80f0698` | 267336 | 12:34:25 |
| `crito/original-en` | 3 | `22070f80c629208afbc4e139c43e98bba0662f23eeefad3e981ece4914ed53fe` | 220815 | 12:34:28 |
| `frederick-douglass/original-en` | 2 | `a9ce338c8b6ae69757492696e6ee81069519f4c8a647bc5166bf3d662b9d90d0` | 196563 | 12:34:31 |
| `meditations/original-en` | 11 | `08045759f72772d0d793b18ef423ba2ad01007ab11cdc903c896046bb79dd561` | 439041 | 12:34:34 |
| `meditations/original-en` | 6 | `cf22eb2588024f033aa68b455e0e480ca602c4c7650683e6c24467826423cdd5` | 545984 | 12:34:36 |
| `notes-from-underground/original-en` | 14 | `8d9331bdeb1e0c63df1b2de46cc792cd39186c34a3fa8a6ac14f0fec3b56bc1c` | 348623 | 12:34:40 |
| `us-founding-documents/original-en` | 1 | `291178b52cb9d14c00a59f1267ea5365cb81051be11c5f85128a1aa3267a84bf` | 136646 | 12:34:43 |
| `us-founding-documents/original-en` | 2 | `c957eda569766652382c29a0ee32e462db9ee9ab32dc19da2bf47f924e9c64b4` | 446459 | 12:34:45 |
| `us-founding-documents/original-en` | 3 | `7ead3f045f73b56847bfaad7994f8967d1c4e6e67c72a1076e7813ba8a353362` | 48930 | 12:34:48 |
| `us-founding-documents/original-en` | 4 | `670a2815be143933f7b7ebdb47adf4fe8288c51c10bdca92fdbdf8c06e464f4e` | 258092 | 12:34:50 |

## Chapters that failed the gate

- `communist-manifesto/original-en/ch3` (tinct-words-run1-1) — paragraphs [19]: below 0.85 on every arm; not published
- `notes-from-underground/original-en/ch17` (tinct-words-run1-1) — paragraphs [19, 22, 24, 28, 41, 42]: below 0.85 on every arm; not published

## Editions completed this run — 3

- `crito/original-en` — 3/3 chapters timed (3 added this run)
- `meditations/original-en` — 12/12 chapters timed (2 added this run)
- `us-founding-documents/original-en` — 4/4 chapters timed (4 added this run)

## Editions advanced but not complete — 3

- `frederick-douglass/original-en` — 10/12 timed (1 added; 0 queued chapters still open)
- `notes-from-underground/original-en` — 19/21 timed (1 added; 1 queued chapters still open)
- `phaedo/original-en` — 1/9 timed (1 added; 8 queued chapters still open)
