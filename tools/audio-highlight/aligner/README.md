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

## Helper revisions (2026-09-11)

`trial.py` compares through a **pinned helper revision**, selected with
`--helper v1|v2` (default `v2`); hashes and what each pin is are in `PINS.md`.

- `v1` — `pinned_words_sidecar_lib.py`, the verbatim `f5b23de7` helper above.
  Unchanged; `--helper v1` reproduces run 1's comparison exactly.
- `v2` — `pinned_words_sidecar_lib_v2.py`, the tokenizer normalisation approved
  in `DECISIONS.md` (2026-09-11): the expected-token side drops never-spoken
  markup (underscore emphasis, `[28]` / `[Greek: …]` footnote markers, spaced
  ellipses, double hyphens) and recogniser-split hyphen compounds are joined
  for comparison, with the compound's timing spanning its pieces. The 0.85
  gate, the timestamps and the interpolation rule are untouched. A paragraph
  with none of that markup aligns byte-for-byte as under `v1`.
  Evidence: `docs/audio-normalisation-2026-09-11.md`.

Tests for the aligner live next to it and are run from this directory:

```bash
python3 -m unittest discover -s tools/audio-highlight/aligner -p 'test_*.py'
```

(`test_normalisation.py` covers each class positively and negatively, checks the
pin hashes against `PINS.md`, and asserts the two pins agree on an unmarked
paragraph.)

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
