#!/usr/bin/env bash
# Enforce the RunPod spend limits every five minutes from the orchestrating
# session, independently of the GitHub Actions guard. Usage:
#   guard-loop.sh <artifacts-dir> [spent-file]
# The spent file holds the $ already spent in this run by pods that have
# finished, so the envelope check covers the whole run, not just live pods.
set -u
artifacts=$1
spent_file=${2:-$artifacts/spent.txt}
mkdir -p "$artifacts/guard"
here=$(cd "$(dirname "$0")" && pwd)
while true; do
  spent=0
  [ -f "$spent_file" ] && spent=$(cat "$spent_file")
  stamp=$(date -u +%Y%m%dT%H%M%SZ)
  python3 "$here/../runpod_guard.py" enforce --apply --spent "$spent" \
    --json-out "$artifacts/guard/$stamp.json" >> "$artifacts/guard/guard.log" 2>&1
  echo "[$stamp] enforce exit $? spent=$spent" >> "$artifacts/guard/guard.log"
  sleep 300
done
