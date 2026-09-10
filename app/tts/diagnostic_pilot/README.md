# Isolated word-timing diagnostic pilot

No upload code. No changes to existing generator, acceptance gate, app, or audio.
`pinned_words_sidecar_lib.py` is the exact f5b23de7 helper, preserved verbatim.
Other audio files in the main checkout are dirty and intentionally untouched.

- `prepare.py`: fresh production edition bytes and authenticated manifests,
  source/manifest map comparison, sampled GET/decode/hash/transport evidence.
- `cohort.py`: complete decoded inputs for alignment/control chapters with exact
  paragraph maps. Montaigne 1/2 are excluded explicitly, not remapped silently.
- `local_asr_probe.py`: four bounded probes using already-cached OpenAI Whisper
  base on local CPU. This is machine evidence, not independent acoustic review
  and not the proposed small.en paired trial. It downloads no model.
- `trial.py`: off versus existing auto-bias cascade, same model/audio/helper;
  retains every returned transcript/timestamp, match opcode, observed/interpolated
  origin, unresolved gap, score, candidate and rejection reason. Acceptance still
  requires >=85% observed matches per paragraph plus sidecar validation/duration.
  Even passing output is only a candidate requiring acoustic review.
- `run-approved-trial.sh`: exact later GPU command wrapper, pinned model revision
  and inference packages, no production credentials needed. It has explicit
  approval/deadline prerequisites and does not provision a GPU.

Tests: `python3 -m unittest discover -s app/tts/diagnostic_pilot -p 'test_*.py'`.
Run from repository root. The preparation scripts use the existing local recovery
client's read access; do not copy credentials into a trial bundle.

To run later, on the authorized CUDA 12/cuDNN 9 environment with ffmpeg/Python:

```bash
export TINCT_PAID_TRIAL_APPROVED=1
export TINCT_PROVIDER_DEADLINE_CONFIRMED=1
bash app/tts/diagnostic_pilot/run-approved-trial.sh \
  output/word-timing-diagnostic-pilot-2026-09-10 \
  output/word-timing-trial-run-01
```

Transfer `cohort.json` and its `audio/` paths plus tools; input paths are relative
and hashed. Use a fresh output path. Setup/model download and paid lifecycle must
fit the external 60-minute limit; the worker process has a 45-minute hard kill
cap, leaving 15 minutes for startup/results. The process cap does NOT terminate
a provider pod or stop its billing. Verify external termination before launch;
environment flags alone do not establish that protection. No automatic resume.
Full dependency versions, hardware, model tree and code/input hashes are recorded.
Warm and cold setup are distinguishable by process/run timestamps; no throughput
claim is made before an actual GPU run. Max 14 chapters may not fit the cap.
