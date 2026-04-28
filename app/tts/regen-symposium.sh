#!/bin/bash
# Symposium audio regen: English (Kokoro, with ALL-CAPS fix) + Danish (Chirp).
# Loads CLOUDFLARE_API_TOKEN from .env, GOOGLE_TTS_API_KEY from macOS Keychain.
set -u
cd "$(dirname "$0")"

# Cloudflare token from .env
ENV_FILE="../.env"
if [ -f "$ENV_FILE" ]; then
  TOKEN=$(grep '^[[:space:]]*CLOUDFLARE_API_TOKEN' "$ENV_FILE" | sed 's/^[^=]*=//' | tr -d ' ')
  if [ -n "$TOKEN" ]; then
    export CLOUDFLARE_API_TOKEN="$TOKEN"
    echo "Loaded CLOUDFLARE_API_TOKEN from $ENV_FILE"
  fi
fi

# Google TTS key from Keychain
GTTS=$(security find-generic-password -a "$USER" -s GOOGLE_TTS_API_KEY -w 2>/dev/null || true)
if [ -n "$GTTS" ]; then
  export GOOGLE_TTS_API_KEY="$GTTS"
  echo "Loaded GOOGLE_TTS_API_KEY from Keychain (length ${#GTTS})"
else
  echo "WARN: GOOGLE_TTS_API_KEY not in Keychain; Danish phase will fail."
fi

LOG="symposium-regen-$(date +%Y%m%d-%H%M).txt"
echo "Logging to: $LOG"
echo "Starting at: $(date)"
echo

echo "═══ Phase 1/2: English (Kokoro) ═══" | tee -a "$LOG"
caffeinate -dimsu python3 regen-symposium-en.py 2>&1 | tee -a "$LOG"

echo
echo "═══ Phase 2/2: Danish (Chirp) ═══" | tee -a "$LOG"
python3 regen-symposium-da.py 2>&1 | tee -a "$LOG"

echo "═══ ALL PHASES DONE at $(date) ═══" | tee -a "$LOG"
