# Recovered word-timing aligner

These files are **byte-identical copies** of the validated diagnostic-pilot
tooling, recovered so the work can run in the cloud instead of on one Mac.

- Source: `app/tts/diagnostic_pilot/` at commit `abaf02dc`
  (branch `codex/audio-diagnostic-pilot-20260910`, "tools: record first live
  timing repair and measured CPU canary").
- Verified byte-identical on recovery, all 9 files.
- `pinned_words_sidecar_lib.py` is itself the exact `f5b23de7` helper, preserved
  verbatim by the pilot. Do not reformat it — its whole point is that it is the
  revision the acceptance results were measured against.
- The pilot's own tests (`test_trial.py`, 11 cases) pass unchanged here.

They were moved rather than left in place because `.gitignore` excludes
`app/tts/**` below the top level, so a copy there is untracked by default.

## Why these run unmodified in the cloud

Nothing in them hardcodes a local path. `trial.py` takes `--input/--output/
--model-path/--model-sha256/--device cpu|cuda/--compute-type/--max-seconds/
--arms/--resume`; `cohort.py` pulls paragraph audio straight from the
`tinct-audio` bucket over S3. Given R2 credentials in the environment, the whole
chain runs on any worker.

The one pilot file **not** recovered is `publish_canary.py`: it was a one-off
for the Macbeth canary and does hardcode a Mac path. Its job is done better by
`../publish_timings.py`, which validates, refuses to overwrite, and verifies the
bytes production serves back.

## What still matters about how it is run

- `trial.py --max-seconds` is a **worker** cap. It does not stop a provider pod
  or its billing — that is `../runpod_guard.py`'s job, and the two are
  independent on purpose.
- `--resume` makes a run restartable from its per-paragraph checkpoints, but a
  checkpoint is only reusable while its input hashes and processing config
  match. Do not hand-edit them.
- Acceptance is unchanged: at least 85% observed token matching per paragraph,
  plus sidecar validation. Passing output is a *candidate* pending acoustic
  review, not a finished chapter.
