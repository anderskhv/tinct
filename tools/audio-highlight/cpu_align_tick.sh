#!/usr/bin/env bash
# One tick of CPU alignment: resume the run, collect whatever finished, publish
# what passes. Safe to invoke repeatedly; that is the point.
#
# Why this exists. Four executor sessions in a row aligned chapters and then
# lost them: a cloud session goes idle at the end of a turn, its container is
# reclaimed, and anything committed locally but never pushed — or verified but
# never published — goes with it. The supervising session persists across ticks,
# so the durable place to run this is there, one bounded slice at a time.
#
# Bounded on purpose. trial.py gets a budget shorter than the gap between ticks
# so it stops cleanly rather than being killed mid-paragraph, and --resume means
# the next tick continues from the diagnostics already on disk instead of
# restarting. Nothing is published that has not passed the 0.85 per-paragraph
# gate inside publish_timings.py, which re-validates against production and
# refuses to overwrite.
set -uo pipefail

WORK="${1:?usage: cpu_align_tick.sh <work-dir> [max-seconds]}"
BUDGET="${2:-2700}"
TOOLS="$(cd "$(dirname "$0")" && pwd)"
export TINCT_TRIAL_MODEL="$WORK/model"

[ -d "$WORK/cohort/cohort.json" ] 2>/dev/null || [ -f "$WORK/cohort/cohort.json" ] || {
  echo "no cohort at $WORK/cohort/cohort.json"; exit 2; }

HASH=$(PYTHONPATH="$TOOLS/aligner" python3 -c \
  'import os,trial;print(trial.tree_hash(os.environ["TINCT_TRIAL_MODEL"]))') || exit 3

# --resume is what makes a tick cheap: paragraphs already aligned are skipped.
python3 "$TOOLS/aligner/trial.py" --input "$WORK/cohort/cohort.json" --output "$WORK/out" \
  --model-path "$TINCT_TRIAL_MODEL" --model-sha256 "$HASH" \
  --max-seconds "$BUDGET" --device cpu --compute-type int8 --run --resume 2>&1 | tail -5

python3 "$TOOLS/aligner/collect_candidates.py" --run "$WORK/out" \
  --out "$WORK/candidates.json" --report "$WORK/collect-report.json" 2>&1 | tail -3

# publish_timings.py validates every candidate against production before it
# uploads and will not replace an existing object, so re-running is harmless.
if [ -s "$WORK/candidates.json" ]; then
  python3 "$TOOLS/publish_timings.py" --candidates "$WORK/candidates.json" \
    --journal "$WORK/journal.json" --apply 2>&1 | tail -20
fi
