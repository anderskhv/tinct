# Audio normalisation canary — evidence

Produced 2026-09-11 on a CPU cloud host for `docs/audio-normalisation-2026-09-11.md`.
No GPU, no upload, no credentials used; audio was fetched from tinct.app's public
routes and is not included (hashes are in `cohort/cohort.json`).

| path | what |
| --- | --- |
| `cohort/` | `cloud_cohort.py` inputs: targets, cohort with per-recording SHA-256 and decoded duration |
| `runs/<chapter>-<pin>/` | one `trial.py` run per chapter and helper pin: `run.json` (records `helper_pin` / `helper_sha256` / model pin), `chapter.json` and `words.candidate.json` per arm, full paragraph diagnostics for frankenstein and macbeth, p19 only for the manifesto |
| `run-canary.log` | invocation order and wall-clock per run |
| `verify-macbeth-published.json` | `verify_timings.py` over the published sidecar |
| `verify-macbeth-candidate-{off,auto}.json` | the same checks over the v2 candidate (`tools/verify_candidate.py`) |
| `replay-run1.json` | every run-1 recorded attempt replayed through both helpers: summary, chapter/arm re-decisions, and the attempts that carry a class or changed |
| `replay-run1-chapters.json` | the 39 run-1 rejections re-decided under v2 |
| `replay-local.json` | the same replay over this host's six runs |
| `tools/` | the scratch scripts that produced the above |
| `SHA256SUMS.txt` | checksums of everything here |
