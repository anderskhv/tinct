#!/bin/bash
set -u
S=/tmp/claude-0/-home-user-tinct/b170f9cf-e13e-598b-88f2-32cbed11be37/scratchpad
T=/tmp/claude-0/audio-norm/tools/audio-highlight/aligner/trial.py
M=$S/models/small.en
H=f1fe271c349229677131d389a96d0a28062a6a2c2fee54a8ce119c43538315c5
for job in "frankenstein v1" "frankenstein v2" "macbeth v1" "macbeth v2" "communist-manifesto v2" "communist-manifesto v1"; do
  set -- $job; book=$1; pin=$2
  echo "=== $(date -u +%H:%M:%S) start $book $pin"
  python3 $T --input $S/cohort/$book.json --output $S/out/$book-$pin --model-path $M --model-sha256 $H --device cpu --compute-type int8 --arms off auto --max-seconds 3300 --helper $pin --run
  echo "=== $(date -u +%H:%M:%S) exit $? $book $pin"
done
