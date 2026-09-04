# Tinct word-timing recovery execution plan

Date: 2026-09-04  
Status: read-only planning; no production objects uploaded or changed

## Executive conclusion

The repository documents the R2 upload workflow, but it does not contain a usable R2 upload secret. The current local `CLOUDFLARE_API_TOKEN` is a valid Workers/deploy credential, yet a read-only R2 bucket-list call returns Cloudflare authentication error 10000. It must not be used for this job. A RunPod API key is present in macOS Keychain, but no dedicated R2 upload token was found in the process environment or the checked Keychain services. Whether an existing RunPod pod has a suitable secret is not established.

Production upload should therefore wait until a dedicated, least-privilege R2 object read/write token is provisioned and stored outside Markdown and outside `app/.env`—preferably in a dedicated macOS Keychain entry and a RunPod secret.

## Canonical safe path

The existing supported pipeline is:

1. Audit the reader-facing production surface and generate the resumable target command:

   ```bash
   cd /workspace/tinct/repo
   python3 books/r2_words_sidecar_coverage.py --scope public --runpod-command
   ```

2. Run the emitted `generate-words-sidecar.py` commands with the English `small.en` model and multilingual `small` model as appropriate. The generator uploads only after strict local validation:

   ```bash
   python3 app/tts/generate-words-sidecar.py \
     --target BOOK/EDITION \
     --chapter N \
     --model small.en \
     --upload
   ```

3. The generator uses the approved Wrangler object-write path internally:

   ```text
   wrangler r2 object put tinct-audio/{book}/{edition}/chN/words.json --file ... --content-type application/json --remote
   ```

The required environment variable is still named `CLOUDFLARE_API_TOKEN`, but on RunPod its value must be the dedicated R2 upload token, never the Workers deploy token from `app/.env`.

There is one documentation inconsistency to fix before operating this routinely: `app/tts/RUNPOD_SETUP.md` says an expired R2 token may be updated in `app/.env`, while `docs/workflow-boundaries.md` correctly reserves `app/.env` for the Workers deploy token. The latter rule should prevail.

## Current scope and volume

| Metric | Current inventory |
|---|---:|
| Published books | 100 |
| Audio-enabled edition targets | 231 |
| Expected chapters | 14,068 |
| Audio manifests present | 13,743 |
| Audio manifests missing | 325 |
| Word sidecars present | 1,176 |
| Word sidecars missing where audio exists | 12,567 |
| Published audio duration | 1,828.8 hours |
| Missing-sidecar edition tokens | 18,649,897 |
| Missing-sidecar paragraphs | 308,473 |

The 325 missing audio chapters are all War and Peace `modern-da`; timing cannot be generated until the audio itself exists.

## Compute and monetary estimate

### Local CPU

Observed pilot throughput is approximately 3–5.5 times real time, including many small paragraph-level transcriptions. The missing-sidecar catalogue is therefore roughly **400–600 local CPU-hours**, with failures and reruns potentially taking it higher. This is technically possible but not the sensible default.

### RunPod RTX 4090

Because the current tool transcribes one short paragraph file at a time, its end-to-end throughput will be lower than ideal large-batch faster-whisper benchmarks. A conservative planning range is **15–35 times real time**:

- Total GPU time: **52–122 GPU-hours** for the full 1,828.8-hour audio corpus; the missing-only workload is slightly smaller.
- Four balanced 4090 pods: approximately **13–31 wall-clock hours**, plus audit, setup, failure triage, and final verification.
- Community Cloud at $0.34/GPU-hour: **$18–$42** raw compute.
- Secure Cloud at $0.74/GPU-hour: **$39–$90** raw compute.
- With a 20–30% operational/retry allowance: budget **$20–$55 Community** or **$45–$120 Secure**.

These are planning estimates, not a quote. A 10–20 chapter GPU calibration batch should be used to replace them with measured throughput before the catalogue run.

### Storage and transfer

- Pilot JSON size averages about 98.2 bytes per displayed token. The 18.65 million missing tokens imply about **1.83 GB** of new `words.json` objects (about 1.71 GiB).
- At current R2 Standard pricing, that is about **$0.03/month** if the account's free allowance is already consumed; otherwise the incremental storage charge is zero.
- 12,567 object writes are far below the monthly 1 million Class A free allowance. Raw list-price cost is about six cents if no allowance applied.
- Generating timings requires downloading about **106 GB** of published MP3 data at the observed ~128 kbps. R2 egress is free. The generator deletes paragraph MP3s after transcription, so this does not require a 106 GB persistent volume.

### Codex usage

Alignment itself consumes **zero Codex/LLM tokens**; it is faster-whisper plus deterministic validation. The scripted audit is also effectively token-free. Model usage is only for orchestration and exception analysis:

- Pilot, credential setup, and first canary: **20k–50k Codex tokens**.
- Full run with a high success rate: approximately **50k–100k tokens**.
- If legacy audio/text mismatches are widespread: **150k–300k+ tokens** for diagnosis and remediation.

One machine-readable ledger and artifact-driven control-room task should supervise the run; the model should never inspect 12,567 sidecars individually.

## Batching and checkpoints

1. Land the hardened generator/validator/audit changes in one isolated audio-tooling commit before any upload.
2. Provision the dedicated R2 token and confirm it with a non-destructive capability check.
3. Separate English (`small.en`) and Danish (`small`) jobs.
4. Create disjoint book/edition shards of roughly 2–4 audio hours each. Four pods may process separate shards, but two pods must never write the same object key.
5. Write one JSONL ledger record per chapter: target, chapter, expected token count, observed alignment, validation status, object size/hash, and error class.
6. Checkpoint per chapter. Upload only after monotonic timestamps, complete paragraph/file matching, exact normalized display-token coverage, duration bounds, and minimum observed ASR alignment pass.
7. Keep only failed chapter artifacts for diagnosis. Successful temporary MP3 and JSON files should be removed.
8. After each book/edition batch, rerun the production coverage audit and spot-listen to the start, middle, end, and weakest-scoring paragraphs.
9. Quarantine normalization or true audio/text mismatches. Do not lower the quality gate merely to complete the inventory.

Sequential uploads are already safely below Cloudflare's R2 API rate limit. If uploads are parallelized later, cap concurrency at 4–8 and use bounded exponential retries.

## Required hardening before catalogue upload

1. **Land the safer generator.** The committed baseline can count interpolated tokens as if Whisper observed them. The audited working-copy improvements distinguish observed matches, enforce an 85% per-paragraph gate, validate exact output, support language-aware models and record provenance; they need a clean reviewable commit.
2. **Add deterministic ASR equivalence for printed digits and spoken number words.** This should affect matching only; emitted sidecar tokens must remain the exact displayed book tokens.
3. **Resolve speaker-label mismatches.** Some legacy audio spells names letter-by-letter. Prefer repairing the audio where the spoken form is materially wrong rather than teaching the aligner a misleading equivalence.
4. **Bind a sidecar to exact inputs.** Record the audio manifest hash/ETag and edition content hash so changed audio or text invalidates stale timing.
5. **Harden uploads.** Default to no overwrite, require an explicit force flag, and perform a post-upload GET/hash check for canaries and sampled batches.
6. **Add bounded retries and a durable failure ledger.** Reruns should skip verified objects and retry only classified failures.
7. **Generate balanced shard commands.** The current CLI can target editions and chapter ranges, but catalogue-scale scheduling needs a generated shard manifest.
8. **Refresh KJV once.** Existing KJV sidecars are reader-compatible, but they predate the stricter observed-ASR provenance and have 13 missing gaps.
9. **Treat Danish separately.** Existing Danish audio can be timed technically, but the repo currently pauses Danish generation. Run English first unless Danish timing is explicitly approved.

## Smallest safe production batch

The smallest responsible production canary is **two objects**:

1. Human-listen to the already generated local Genesis 1 WEB and Modern English pilots.
2. Upload only `bible/web-en/ch1/words.json` first (about 72 KB).
3. Verify production at 1× and 2×: moving word highlight, exact paragraph transition, pause/resume, page turn, and no effect on editions still using paragraph fallback.
4. If it passes, upload `bible/modern-en/ch1/words.json` (about 72 KB) and repeat.

The next batch should be Genesis 1–10 in WEB and Modern English (20 objects) to calibrate 4090 throughput and detect recurring Bible normalization issues. Then complete Genesis, followed by a small representative flagship set. Art of War and Phaedo should remain quarantined until their known number-word and spelled-speaker-label issues are resolved.

## Existing local pilot artifacts

- `pilots/bible-web-en-ch1.words.json`
- `pilots/bible-modern-en-ch1.words.json`
- `pilot-validation.json`
- `chapter-coverage-matrix.csv`
- `coverage-summary.json`
- `production-audio-hours.json`

All are under `/Users/andershvelplund/.codex/artifacts/tinct-word-timing-recovery-2026-09-04/`. No pilot has been uploaded.

