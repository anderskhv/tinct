#!/usr/bin/env bash
# Run-2 guard loop: the $20 envelope, $1.00/hr rate ceiling and 50-minute
# wall-clock deadline enforced from this session every five minutes, because
# GitHub's scheduled guard is load-shed and did not fire reliably in run 1.
set -u
artifacts=/home/user/tinct/artifacts/audio-highlight-run2-2026-09-11
spent_file=$artifacts/spent.txt
mkdir -p "$artifacts/guard"
while true; do
  spent=0
  [ -f "$spent_file" ] && spent=$(cat "$spent_file")
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  python3 /home/user/tinct/tools/audio-highlight/runpod_guard.py enforce --apply \
    --budget 20.00 --max-rate 1.00 --max-minutes 50 --spent "$spent" \
    --json-out "$artifacts/guard/$stamp.json" >> "$artifacts/guard/guard.log" 2>&1
  echo "[$stamp] enforce exit $? spent=$spent" >> "$artifacts/guard/guard.log"
  sleep 300
done
