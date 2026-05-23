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
