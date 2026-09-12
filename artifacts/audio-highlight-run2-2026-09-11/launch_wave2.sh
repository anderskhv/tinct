#!/usr/bin/env bash
# launch_wave2.sh <first-pod-number> <batch> [<batch> ...]
# One background orchestrate.py per wave-2 batch; pod n gets batch args[i].
set -u
cd /home/user/tinct
A=artifacts/audio-highlight-run2-2026-09-11
COMMIT=f53d744782e3c369fffd2980a013a7f199c0476e
n=$1; shift
for b in "$@"; do
  nohup python3 tools/audio-highlight/gpu/orchestrate.py run \
    --name tinct-words-run2-$n --batch $A/wave2-batch-$b.json \
    --commit $COMMIT --artifacts $A > $A/launch-$n.log 2>&1 &
  echo "pod $n <- wave2-batch-$b (pid $!)"
  n=$((n+1))
done
