# Audio word-highlighting: cloud operations

Tooling that runs the audio word-highlighting work **without depending on any
one computer being awake**. Everything here is either read-only against public
production endpoints, or takes its credentials from the environment. Nothing
here reads a path under `/Users/`, and nothing here needs a local checkout of
results.

The plan this serves is `docs/audio-highlight-completion-plan-2026-09-10.md`.
The current state of the handoff is `docs/audio-highlight-cloud-handoff-2026-09-11.md`.

## What each tool does

| Tool | Needs | What it does |
| --- | --- | --- |
| `prodapi.py` | nothing | Read-only production access: chapter manifests, word sidecars, edition text, object sizes. |
| `audit_production.py` | nothing | Walks every English edition on production and records which chapters have a recording and which have a timing sidecar. A **census**, not a quality judgement. |
| `verify_timings.py` | nothing | Checks published sidecars for identity, paragraph mapping, coverage, timestamp bounds, and agreement with the published edition text at the existing 0.85 threshold. This is the check that turns "a file is present" into "the highlighting is right". |
| `publish_timings.py` | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT` | Validates a candidate, refuses to overwrite, uploads conditionally, re-reads the bytes production serves, and appends to a publication journal. |
| `runpod_guard.py` | `RUNPOD_API_KEY` | Stops GPU pods that exceed the rate ceiling, the wall-clock deadline, or the spend envelope. Only touches pods matching the owner prefix. |

## Running the audit

```bash
python3 tools/audio-highlight/audit_production.py \
  --out coverage.json --targets-out missing-timings.json --covered-out published-timings.json

python3 tools/audio-highlight/verify_timings.py \
  --targets published-timings.json --out verification.json
```

Both are safe to run at any time from anywhere. The census makes roughly two
HTTPS requests per chapter, so a full pass is a few thousand requests; keep the
worker count modest so it stays gentle on production.

## Running it on a schedule, with no laptop involved

- `.github/workflows/audio-highlight-audit.yml` — census plus a rotating
  verification sample every six hours, committing the result to the
  `audio-highlight-ledger` branch. Fails the run if any published sidecar is
  invalid. Dispatch it with `verify_all` to check every published chapter.
- `.github/workflows/audio-gpu-guard.yml` — enforces the spend limits every
  five minutes. **Not armed until `RUNPOD_API_KEY` is a repository secret**;
  until then it logs a warning and does nothing, and termination still depends
  on `app/tts/pod-watchdog.py` running on the Mac.

## Tests

```bash
python3 -m unittest discover -s tools/audio-highlight -p 'test_*.py'
```

`test_runpod_guard.py` exercises the guard against a stubbed provider API, so
the decisions it makes are verified without a RunPod key and without spending
anything: each of the three limits stops a pod, a pod inside every limit is
left running, an already-exited pod is not stopped twice, a dry run acts on
nothing, the credential-missing path fails closed, and — the one that matters
most — a pod outside the owner prefix is never touched, not even by `stop-all`.

## About the scheduled workflows

GitHub runs `schedule` triggers only from the default branch, so neither
workflow fires until it is on `main`. Both reached `main` on September 11, 2026,
in the same change that fast-forwarded `main` to the commit production was
already running. See `docs/audio-highlight-cloud-handoff-2026-09-11.md` for why
that reconciliation had to come first.

## Rules this tooling will not bend

- The paragraph acceptance threshold stays at **0.85**. No tool here lowers it,
  and none of them fabricates a timestamp or a confidence value.
- Publication **creates**; it never replaces. A key that already exists is
  skipped and journalled, so two owners publishing at once cannot clobber
  each other.
- A published object counts as verified only after production has served the
  bytes back and the SHA-256 matches.
- The GPU guard acts only on pods whose name carries the owner prefix. Other
  RunPod resources are reported and left alone.
