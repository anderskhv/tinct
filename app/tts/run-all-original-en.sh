#!/usr/bin/env bash
#
# Fire-and-forget generator for all 27 missing original-en audiobooks.
#
# Runs under caffeinate so the Mac stays awake. Pipes all output to a
# timestamped log file alongside the terminal.
#
# Usage:
#   cd /Users/andershvelplund/Documents/Projects/Tinct/app/tts
#   ./run-all-original-en.sh
#
# To resume after interruption: just re-run. The Python script skips
# any chapter that already has MP3s + manifest locally.
#
# What it does per book (smallest → largest):
#   1. Generate paragraph WAVs via Kokoro (loaded once across all books)
#   2. Convert WAVs → MP3s
#   3. Generate title.mp3 per chapter
#   4. Write manifest.json
#   5. Upload to R2
#
# The Bible is NOT in this list — it uses kjv-en (not original-en) and
# has 1189 chapters. Handle separately when ready.

set -u
cd "$(dirname "$0")"

# Load CLOUDFLARE_API_TOKEN (and any other env vars) from app/.env so wrangler
# can authenticate non-interactively. Without this, wrangler tries OAuth refresh
# which can fail with 400/503 mid-run and stall every R2 upload.
ENV_FILE="../.env"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
  if [ -n "${CLOUDFLARE_API_TOKEN:-}" ]; then
    echo "Loaded CLOUDFLARE_API_TOKEN from $ENV_FILE"
  else
    echo "WARN: $ENV_FILE loaded but CLOUDFLARE_API_TOKEN not set"
  fi
else
  echo "WARN: no $ENV_FILE — wrangler will try OAuth refresh and may fail"
fi

LOG="run-log-$(date +%Y%m%d-%H%M).txt"
echo "Logging to: $LOG"
echo "Starting at: $(date)"
echo ""

caffeinate -dimsu python3 run-all-original-en.py 2>&1 | tee "$LOG"

echo ""
echo "Finished at: $(date)"
echo "Log saved to: $LOG"
