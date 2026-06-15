#!/usr/bin/env bash
# Regenerate stale English Kokoro audio for Wealth of Nations modern-en.
#
# Scope:
#   wealth-of-nations/modern-en chapters 1-32
#
# RunPod usage:
#   export CLOUDFLARE_API_TOKEN="cfut_..."
#   export CLOUDFLARE_ACCOUNT_ID="58f26c4a077e8c66e0b017d2399ae1b3"
#   cd /workspace/tinct
#   nohup bash books/runpod-regen-wealth-of-nations-kokoro.sh > /workspace/won-kokoro.log 2>&1 &
#   tail -80 /workspace/won-kokoro.log
#
# This intentionally uses --force because these chapters already have manifests
# on R2; the modern-en text was repaired after the current audio was generated.

set -euo pipefail

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN is not set." >&2
  exit 1
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "WARN: CLOUDFLARE_ACCOUNT_ID is not set; wrangler may still ask for it." >&2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/../app/tts/run-kokoro-cloud.py" ]]; then
  PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
  TTS_DIR="$PROJECT_ROOT/app/tts"
elif [[ -f "$SCRIPT_DIR/run-kokoro-cloud.py" ]]; then
  TTS_DIR="$SCRIPT_DIR"
  PROJECT_ROOT="$(cd "$TTS_DIR/../.." && pwd)"
else
  echo "ERROR: run-kokoro-cloud.py not found." >&2
  echo "Run this from a Tinct checkout, or place it beside run-kokoro-cloud.py." >&2
  exit 1
fi

cd "$TTS_DIR"

if ! command -v ffmpeg >/dev/null 2>&1 || ! command -v ffprobe >/dev/null 2>&1; then
  echo "ERROR: ffmpeg and ffprobe must be installed on the pod." >&2
  exit 1
fi

mkdir -p /workspace/editions

echo "Preparing Wealth of Nations modern-en edition JSON in /workspace/editions"
python3 - <<'PY'
import json
from pathlib import Path

project = Path.cwd().parents[1]
src = project / "app" / "public" / "data" / "editions" / "wealth-of-nations-modern-en.json"
out = Path("/workspace/editions/wealth-of-nations-modern-en.json")

if not src.exists():
    raise SystemExit(f"missing edition JSON: {src}")

data = json.loads(src.read_text())
chapters = data.get("chapters", [])
if len(chapters) != 32:
    raise SystemExit(f"expected 32 chapters, found {len(chapters)}")
if [ch.get("number") for ch in chapters] != list(range(1, 33)):
    raise SystemExit("chapter numbers are not 1-32")

out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
paras = sum(len(ch.get("paragraphs", [])) for ch in chapters)
words = sum(len(p.split()) for ch in chapters for p in ch.get("paragraphs", []))
print(f"wealth-of-nations/modern-en: chapters={len(chapters)} paragraphs={paras} words={words}")
PY

echo
echo "Starting forced Wealth of Nations modern-en Kokoro regeneration at $(date -u '+%Y-%m-%d %H:%M:%SZ')"
echo "This regenerates all 32 modern-en chapters and uploads them to R2."
echo

python3 run-kokoro-cloud.py --force wealth-of-nations modern-en

echo
echo "Verifying remote manifests"
node - <<'NODE'
async function check(path) {
  const url = `https://tinct.app/api/audio-manifest?path=${path}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) return { ok: false, status: res.status, entries: 0 };
  const json = await res.json();
  return { ok: true, status: res.status, entries: json.paragraphs?.length ?? 0 };
}

(async () => {
  let failed = 0;
  for (let ch = 1; ch <= 32; ch++) {
    const path = `wealth-of-nations/modern-en/ch${ch}/manifest.json`;
    const result = await check(path);
    if (result.ok) {
      console.log(`OK wealth-of-nations/modern-en/ch${ch} entries=${result.entries}`);
    } else {
      failed++;
      console.log(`FAIL wealth-of-nations/modern-en/ch${ch} HTTP ${result.status}`);
    }
  }
  if (failed) process.exit(1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
NODE

echo "Wealth of Nations Kokoro regeneration complete."
