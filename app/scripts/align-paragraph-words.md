# Word-level audio alignment

Paragraph MP3s stay one-file-per-paragraph. This script writes
`words: [{ text, start, end }]` windows in **seconds relative to that
file**. It does not recut audio.

Missing `words` (or a missing sidecar) keeps today's paragraph-level follow.

## Live Odyssey paths

Investigated 2026-08-21:

| Item | Value |
| --- | --- |
| Book id | `odyssey` |
| Live Butler edition key | `original-en` (label: Butler (Prose, 1900)) |
| Other audio editions | `modern-en`, `modern-da` |
| Chapter 1 manifest | `odyssey/original-en/ch1/manifest.json` |
| Files | `title.mp3` (`paragraph: -1`), `p0.mp3`…`p31.mp3` |
| Public fetch | `https://tinct.app/api/audio-manifest?path=odyssey/original-en/ch1/manifest.json` |
| Local Kokoro tree | `app/tts/audio/odyssey/original-en/ch1/` |

The cloud agent cannot be assumed to reach the R2 bucket. Run alignment
on Anders's Mac against the local tree (or `--fetch-audio` via the worker).

## Production backend

Whisper **word timestamps** (`faster-whisper`, then `openai-whisper`).
Linear word-count interpolation is rejected.

```bash
python3 -m pip install faster-whisper
```

## Odyssey Book 1 on Anders's Mac

From the repo root, with Book 1 MP3s already on disk:

```bash
cd /Users/andershvelplund/Documents/Projects/Tinct/app

python3 -m pip install faster-whisper   # once

node scripts/align-paragraph-words.mjs \
  --book odyssey \
  --edition original-en \
  --chapter 1 \
  --audio-dir tts/audio/odyssey/original-en/ch1
```

That writes `tts/audio/odyssey/original-en/ch1/words.json` and leaves
every `pN.mp3` untouched.

If the local chapter dir is missing but the Mac can reach production:

```bash
node scripts/align-paragraph-words.mjs \
  --book odyssey \
  --edition original-en \
  --chapter 1 \
  --audio-dir tts/audio/odyssey/original-en/ch1 \
  --fetch-audio
```

`--fetch-audio` uses `https://tinct.app/api/audio-file` / `audio-manifest`,
not a raw R2 URL.

To also embed `words` on each paragraph in `manifest.json`:

```bash
node scripts/align-paragraph-words.mjs \
  --book odyssey --edition original-en --chapter 1 \
  --audio-dir tts/audio/odyssey/original-en/ch1 \
  --in-manifest
```

Prefer the sidecar by default so a later Kokoro/ffprobe manifest regen
does not wipe timings. The player merges sidecar `words.json` when the
manifest paragraph has no `words`.

Upload the sidecar (and manifest if patched) the same way as other
chapter audio:

```bash
# from app/, after copying words.json into the upload tree
npx wrangler r2 object put tinct-audio/odyssey/original-en/ch1/words.json \
  --file tts/audio/odyssey/original-en/ch1/words.json \
  --content-type application/json \
  --remote
```

Do not run raw `wrangler deploy`. Do not recut the paragraph MP3s.

## Tests / fixture backend

CI does not call Whisper. The fixture backend reads checked-in word
windows next to a tiny clip:

```bash
cd app
node scripts/align-paragraph-words.mjs \
  --book odyssey --edition original-en --chapter 1 \
  --edition-json scripts/fixtures/word-align/odyssey-original-en.json \
  --audio-dir scripts/fixtures/word-align \
  --backend fixture \
  --out-sidecar /tmp/tinct-words.json
```

`--backend interpolate` (or `linear` / `word-count`) exits with an error.
