#!/usr/bin/env bash
# Resume the English Kokoro backlog from the 2026-05-26 R2 audit.
#
# On RunPod, place this beside run-kokoro-cloud.py or paste its python command:
#   export CLOUDFLARE_API_TOKEN="cfut_..."
#   export CLOUDFLARE_ACCOUNT_ID="58f26c4a077e8c66e0b017d2399ae1b3"
#   cd /workspace/tinct/scripts
#   bash runpod-resume-english-kokoro-current.sh
#
# The underlying generator checks R2 chapter-by-chapter before generating, so
# rerunning this script is safe after a pod restart or interruption.

set -euo pipefail

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "ERROR: CLOUDFLARE_API_TOKEN is not set." >&2
  exit 1
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "WARN: CLOUDFLARE_ACCOUNT_ID is not set; wrangler may still ask for it." >&2
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [[ ! -f run-kokoro-cloud.py ]]; then
  echo "ERROR: run-kokoro-cloud.py not found in $SCRIPT_DIR" >&2
  echo "Place this script beside run-kokoro-cloud.py on RunPod, or paste the python command from it." >&2
  exit 1
fi

echo "Starting remaining English Kokoro jobs at $(date -u '+%Y-%m-%d %H:%M:%SZ')"
echo "Local in-progress/failed artifacts, newest first:"
find /workspace/audio -type f \( -name '*.wav' -o -name '*.mp3' -o -name 'manifest.json' \) \
  -printf '%TY-%Tm-%Td %TH:%M %s %p\n' 2>/dev/null | sort -r | head -40 || true
echo

python3 run-kokoro-cloud.py \
  essays-montaigne original-en \
  essays-montaigne modern-en \
  hume-enquiry original-en \
  hume-enquiry modern-en \
  kant-groundwork original-en \
  kant-groundwork modern-en \
  wealth-of-nations original-en \
  wealth-of-nations modern-en \
  anna-karenina original-en \
  anna-karenina modern-en \
  frederick-douglass original-en \
  treasure-island original-en \
  treasure-island modern-en \
  werther original-en
