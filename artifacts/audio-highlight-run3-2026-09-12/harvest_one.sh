#!/usr/bin/env bash
# harvest_one.sh <pod-name>  — harvest, publish, distil, prune, commit+push.
# One pod at a time. The prune is part of the same step on purpose: at high
# concurrency the per-paragraph diagnostics accumulate faster than they drain
# and a full disk takes the whole run down. What a future tokenizer revision
# needs is distilled into rejected-extract.json first.
set -euo pipefail
cd /home/user/tinct
A=artifacts/audio-highlight-run3-2026-09-12
name=$1
pod=$A/pods/$name
[ -d "$pod/out" ] || { echo "$name: no out/ — nothing harvested"; exit 1; }
python3 tools/audio-highlight/gpu/harvest.py "$pod" "$A/publication-journal.json" --apply 2>&1 | tail -40
python3 "$A/distil_rejections.py" "$pod" || echo "distil failed, keeping rejected/"
if [ -f "$pod/rejected-extract.json" ]; then rm -rf "$pod/rejected"; fi
rm -rf "$pod/out" "$pod/cohort"
rm -f "$pod"/*.tar.gz
df -h /home/user | tail -1
git add -A "$A" || true
git commit -q -m "audio run 3: harvest and publish $name

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01K5bL9oWzAagjTMExsyUADi" || echo "nothing to commit"
git push -q origin claude/audio-run3-20260912
echo "pushed after $name"
