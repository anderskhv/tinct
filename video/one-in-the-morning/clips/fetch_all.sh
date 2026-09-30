#!/bin/bash
cd "$(dirname "$0")"
for n in g01_bed0100 g05_night3 g09_hands g11_library g03_lobby; do [ -f $n.mp4 ] || ./fetch_full.sh $(cat $n.rid) $n.mp4; done
echo ALLDONE
