#!/usr/bin/env bash
set -u
A=/home/user/tinct/artifacts/audio-highlight-run2-2026-09-11
mkdir -p "$A/guard"
while true; do
  spent=$(cat "$A/spent.txt" 2>/dev/null || echo 0)
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  python3 /home/user/tinct/tools/audio-highlight/runpod_guard.py enforce --apply \
    --owner-prefix tinct-words-run2- --max-rate 1.00 --max-minutes 50 \
    --budget 20 --spent "$spent" --json-out "$A/guard/$stamp.json" >> "$A/guard/guard.log" 2>&1
  echo "[$stamp] enforce exit $? spent=$spent" >> "$A/guard/guard.log"
  sleep 300
done
