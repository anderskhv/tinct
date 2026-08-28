# English Audio Backlog Pipeline

Current local audit source: `python3 english_audio_backlog.py --summary`

As of 2026-05-22, local English audio under `app/tts/audio` is incomplete for:

- 135 public English edition targets total.
- 113 edition targets already marked `hasAudio: true` in `bookRegistry.ts`.
- About 10,748 missing chapter directories or chapter-level MP3 coverage gaps.
- About 189,868 paragraph MP3s still to generate locally.

For only editions already marked `hasAudio: true`:

- 113 incomplete edition targets.
- About 10,325 missing chapter directories or chapter-level MP3 coverage gaps.
- About 176,973 paragraph MP3s still to generate locally.

## Offline Generation

The offline-safe generator is:

```bash
python3 english_audio_backlog.py
```

Default mode is audit-only. To generate the local backlog:

```bash
python3 english_audio_backlog.py --run
```

On macOS, generation mode automatically relaunches itself through:

```bash
caffeinate -dimsu
```

The script does not upload to R2 and does not call network APIs. It writes local audio under:

```text
app/tts/audio/{book-id}/{edition-key}/ch{N}/
```

Each target runs this local sequence:

1. Generate missing paragraph WAVs with Kokoro using `app/tts/generate-audio-kokoro.py`.
2. Convert WAVs to MP3 with `ffmpeg`.
3. Write `manifest.json` with `ffprobe` durations.
4. Generate local chapter `title.mp3` and update manifests with `app/tts/generate-title-audio.py` without `--upload`.

Kokoro chapter generation is wrapped with a timeout, defaulting to 3600 seconds per chapter. Timed-out chapters are skipped so the overnight run can continue; rerun the same command later to retry remaining gaps.

Useful narrowed runs:

```bash
python3 english_audio_backlog.py --summary
python3 english_audio_backlog.py --summary --has-audio-only
python3 english_audio_backlog.py --run --has-audio-only
python3 english_audio_backlog.py --run --book vindication-rights-of-woman --edition modern-en
python3 english_audio_backlog.py --run --limit 1
python3 english_audio_backlog.py --run --dry-run --limit 1
python3 english_audio_backlog.py --run --chapter-timeout 1800
```

## Preconditions

Offline generation assumes the machine already has:

- Kokoro and its model files cached locally.
- `numpy`, `soundfile`, and `kokoro` importable from `python3`.
- `ffmpeg` and `ffprobe` on `PATH`.

The script checks these before generation starts. If Kokoro has not already cached its model files, run a small online test before relying on offline overnight generation.

## Production R2 Missing-Audio Generation

Use this when deciding what RunPod should generate for the actual reader:

```bash
python3 r2_missing_english_audio.py
```

This checks `https://tinct.app/api/audio-manifest` for every chapter and prints the missing production audio. To print a pasteable RunPod command:

```bash
python3 r2_missing_english_audio.py --scope all --runpod-command
```

Useful scopes:

```bash
python3 r2_missing_english_audio.py --scope public
python3 r2_missing_english_audio.py --scope unpublished
python3 r2_missing_english_audio.py --scope staged
```

The generated command calls `run-kokoro-cloud.py`, which uploads to R2 and skips chapters already present. Use this script for the real backlog; use `english_audio_backlog.py` only for local Mac file audits.

### RunPod Disk Hygiene

`app/tts/run-kokoro-cloud.py` deletes each local chapter directory after that chapter uploads to R2 with zero failures. This is intentional: RunPod network volumes can still hit quota or practical working-space limits when long books leave all generated MP3s and manifests under `/workspace/audio`.

If a chapter has any R2 upload failure, the script keeps that chapter directory so a rerun can retry the existing local files. Reruns remain idempotent because completed chapters are skipped through the production audio manifest endpoint.

To keep local artifacts for debugging, pass:

```bash
python3 run-kokoro-cloud.py --keep-local BOOK EDITION
```

If an older pod fills up before this cleanup behavior is available, free completed local artifacts manually and keep only the current failed book:

```bash
find /workspace/audio -name '*.wav' -delete
find /workspace/audio -mindepth 1 -maxdepth 1 ! -name 'CURRENT-BOOK-ID' -exec rm -rf {} +
```

## RunPod GPU Choice

Do not default to high-end datacenter GPUs for Kokoro batch audio. The end-to-end pipeline is not pure GPU compute:

- many small paragraph-level Kokoro calls
- Python orchestration overhead
- `ffmpeg` conversion
- `ffprobe` duration reads
- R2 upload latency
- per-chapter manifest checks

As a result, top-end GPUs often show low CPU load, low VRAM utilization, and uneven GPU utilization. This is normal for the current pipeline and means the bottleneck is often orchestration or network I/O, not raw GPU power.

Preferred future RunPod choices:

- Best value when available: RTX 3090 or RTX 4090.
- Good cheaper fallbacks: RTX 4000 Ada, RTX PRO 4000/4500, A5000.
- Acceptable but usually overpowered: RTX 5090.
- Avoid unless urgent: H100, H200, B200, B300, and other expensive datacenter GPUs.

Rule of thumb: use the cheapest available NVIDIA GPU with enough VRAM for Kokoro, generally 16-24 GB or more. Spend engineering effort on reducing per-file overhead before paying for larger GPUs.

## Word timings (`words.json` sidecars)

Play/Hearing word highlights need **authoritative** per-word `start`/`end` times. The app resolves them in order:

1. Manifest paragraph `words` (inline)
2. R2 sidecar `bible/{edition}/ch{N}/words.json` (or `{book}/…`)
3. Client MP3 measurement (last resort — avoid for production)

Do **not** invent linear `duration ÷ word_count` timings in the app. Generate sidecars once and upload to R2.

### Schema

Matches `app/src/lab/labFollow.ts` `WordSidecar`:

```json
{
  "chapter": 768,
  "bookId": "bible",
  "editionKey": "kjv-en",
  "method": "faster-whisper-word-timestamps",
  "paragraphs": [
    {
      "paragraph": 0,
      "file": "p0.mp3",
      "words": [{ "text": "Woe", "start": 0.12, "end": 0.48 }]
    }
  ]
}
```

R2 key: `{book}/{edition}/ch{chapter}/words.json`. Fetched via `/api/audio-file?path=…`.

Prototype: `app/public/odyssey-ch1-words.json` (Odyssey ch1, same method).

### Generation (RunPod or GPU box)

```bash
pip install -r app/tts/requirements-words.txt
cd app/tts
python3 generate-words-sidecar.py bible kjv-en --chapter 768 --upload
python3 generate-words-sidecar.py bible kjv-en --start-ch 1 --end-ch 100 --upload
```

- Downloads existing paragraph MP3s from `tinct.app` (or reads `--local-dir`).
- Runs **faster-whisper** with `word_timestamps=True`.
- Aligns tokens to edition text (`clean_text` + whitespace split — same as Kokoro TTS).
- Validates word count per paragraph before write.
- Skips chapters that already have `words.json` on R2 (use `--force` to regenerate).
- `--upload` uses `wrangler r2 object put` (RunPod `CLOUDFLARE_API_TOKEN` = R2 upload token).

Validate locally:

```bash
node app/scripts/validate-words-sidecar.cjs app/tts/audio/bible/kjv-en/ch768/words.json \
  --edition bible-kjv-en --chapter 768
python3 app/tts/words_sidecar_lib_test.py
```

### Batch scale (Bible)

Three English audio editions × ~1189 chapters ≈ 3.5k sidecar files. Run parallel RunPod jobs with `--start-ch` / `--end-ch` splits (same pattern as `run-kokoro-cloud.py`). **Do not re-TTS** — only align existing MP3s.

`run-kokoro-cloud.py` and `app/scripts/upload-audio-r2.sh` now include `words.json` when present beside chapter manifests.

