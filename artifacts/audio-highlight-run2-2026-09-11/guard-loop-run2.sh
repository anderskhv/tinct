#!/usr/bin/env bash
set -u
artifacts=/home/user/tinct/artifacts/audio-highlight-run2-2026-09-11
spent_file=$artifacts/spent.txt
mkdir -p "$artifacts/guard"
while true; do
  spent=0
  [ -f "$spent_file" ] && spent=$(cat "$spent_file")
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  python3 /home/user/tinct/tools/audio-highlight/runpod_guard.py enforce --apply --budget 20 --spent "$spent" \
    --json-out "$artifacts/guard/$stamp.json" >> "$artifacts/guard/guard.log" 2>&1
  echo "[$stamp] enforce exit $? spent=$spent" >> "$artifacts/guard/guard.log"
  sleep 300
done
