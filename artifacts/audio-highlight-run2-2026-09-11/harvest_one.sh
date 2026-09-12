#!/usr/bin/env bash
# harvest_one.sh <pod-name>  — harvest, publish, commit+push. One pod at a time.
set -euo pipefail
cd /home/user/tinct
A=artifacts/audio-highlight-run2-2026-09-11
name=$1
pod=$A/pods/$name
[ -d "$pod/out" ] || { echo "$name: no out/ — nothing harvested"; exit 1; }
python3 tools/audio-highlight/gpu/harvest.py "$pod" "$A/publication-journal.json" --apply 2>&1 | tail -40
git add -A "$A" || true
git commit -q -m "audio run 2: harvest and publish $name

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K5bL9oWzAagjTMExsyUADi" || echo "nothing to commit"
git push -q origin claude/audio-run2-20260912
echo "pushed after $name"
