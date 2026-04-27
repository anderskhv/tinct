#!/usr/bin/env bash
#
# Audio batch #2 — covers 12 books added after the first run + Bible KJV/WEB.
# ~24,680 paragraphs total. Estimated runtime ~18 hours at 2.6s/paragraph.
#
# Usage:
#   cd /Users/andershvelplund/Documents/Projects/Tinct/app/tts
#   ./run-audio-batch2.sh
#
# Idempotent: re-run anytime to resume from where it stopped.
#
# Bible is the long pole: KJV (6704p) + WEB (6704p) = 54% of the work,
# scheduled last so the smaller books finish early and you see results.
#
# NOT included:
# - Fear and Trembling original-da / modern-da (Danish — needs Chirp, separate run)
# - War and Peace original-en (already on R2)

set -u
cd "$(dirname "$0")"

# Auto-load CLOUDFLARE_API_TOKEN (same as run-all-original-en.sh)
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

LOG="batch2-log-$(date +%Y%m%d-%H%M).txt"
echo "Logging to: $LOG"
echo "Starting at: $(date)"
echo ""

caffeinate -dimsu python3 run-audio-batch2.py 2>&1 | tee "$LOG"

echo ""
echo "Finished at: $(date)"
echo "Log saved to: $LOG"
