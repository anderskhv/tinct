#!/usr/bin/env bash
# Regenerate stale English Kokoro audio after the Montaigne/Oresteia text repair.
#
# Scope:
#   essays-montaigne/modern-en chapters 24,27,29,57,69,78,99,103,104,106,107
#   oresteia/modern-en chapter 23
#
# RunPod usage:
#   export CLOUDFLARE_API_TOKEN="cfut_..."
#   export CLOUDFLARE_ACCOUNT_ID="58f26c4a077e8c66e0b017d2399ae1b3"
#   cd /workspace/tinct/app/tts
#   bash /workspace/tinct/books/runpod-regen-montaigne-oresteia-kokoro.sh
#
# This intentionally uses --force because these chapters already have manifests
# on R2; they are stale, not missing. The script pre-filters edition JSON files
# to the exact target chapters so --force cannot regenerate unrelated chapters.

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

echo "Preparing filtered edition JSONs in /workspace/editions"
python3 - <<'PY'
import json
from pathlib import Path

project = Path.cwd().parents[1]
source_dir = project / "app" / "public" / "data" / "editions"
out_dir = Path("/workspace/editions")

targets = {
    ("essays-montaigne", "modern-en"): [24, 27, 29, 57, 69, 78, 99, 103, 104, 106, 107],
    ("oresteia", "modern-en"): [23],
}

for (book, edition), chapters in targets.items():
    src = source_dir / f"{book}-{edition}.json"
    if not src.exists():
        raise SystemExit(f"missing edition JSON: {src}")
    data = json.loads(src.read_text())
    wanted = set(chapters)
    filtered = {
        **data,
        "chapters": [ch for ch in data["chapters"] if ch.get("number") in wanted],
    }
    found = [ch["number"] for ch in filtered["chapters"]]
    if found != chapters:
        raise SystemExit(f"{book}/{edition}: expected chapters {chapters}, found {found}")
    out = out_dir / f"{book}-{edition}.json"
    out.write_text(json.dumps(filtered, ensure_ascii=False, indent=2) + "\n")
    paras = sum(len(ch.get("paragraphs", [])) for ch in filtered["chapters"])
    words = sum(len(p.split()) for ch in filtered["chapters"] for p in ch.get("paragraphs", []))
    print(f"{book}/{edition}: chapters={found} paragraphs={paras} words={words}")
PY

echo
echo "Starting forced Kokoro regeneration at $(date -u '+%Y-%m-%d %H:%M:%SZ')"
echo "This should upload only the filtered chapters listed above."
echo

python3 run-kokoro-cloud.py --force \
  essays-montaigne modern-en \
  oresteia modern-en

echo
echo "Verifying remote manifests"
node - <<'NODE'
const targets = {
  "essays-montaigne/modern-en": [24, 27, 29, 57, 69, 78, 99, 103, 104, 106, 107],
  "oresteia/modern-en": [23],
};

async function check(path) {
  const url = `https://tinct.app/api/audio-manifest?path=${path}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) return { ok: false, status: res.status, entries: 0 };
  const json = await res.json();
  return { ok: true, status: res.status, entries: json.paragraphs?.length ?? 0 };
}

(async () => {
  let failed = 0;
  for (const [key, chapters] of Object.entries(targets)) {
    const [book, edition] = key.split("/");
    for (const ch of chapters) {
      const path = `${book}/${edition}/ch${ch}/manifest.json`;
      const result = await check(path);
      const label = `${book}/${edition}/ch${ch}`;
      if (result.ok) {
        console.log(`OK ${label} entries=${result.entries}`);
      } else {
        failed++;
        console.log(`FAIL ${label} HTTP ${result.status}`);
      }
    }
  }
  if (failed) process.exit(1);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
NODE

echo "RunPod Kokoro regeneration complete."
