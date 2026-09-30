#!/bin/bash
# Patient retry: one full download attempt per missing clip, then wait 4 minutes; up to ~2 hours.
cd "$(dirname "$0")"; FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
for round in $(seq 1 24); do
  missing=0
  for n in g01_bed0100 g05_night3 g09_hands g11_library g03_lobby; do
    [ -f $n.mp4 ] && continue; missing=1
    URL=$(curl -sS -m 60 https://api.x.ai/v1/videos/$(cat $n.rid) -H "Authorization: Bearer $XAI_API_KEY" | python3 -c "import json,sys;print(json.load(sys.stdin)['video']['url'])" 2>/dev/null)
    curl --http1.1 -sS -m 900 --speed-limit 1 --speed-time 120 -o $n.mp4.tmp "$URL" 2>/dev/null
    if [ -z "$($FF -v error -i $n.mp4.tmp -f null - 2>&1 | head -1)" ] && [ $(stat -c %s $n.mp4.tmp) -gt 300000 ]; then mv $n.mp4.tmp $n.mp4; echo "$(date +%T) $n ok"; else echo "$(date +%T) $n stalled at $(stat -c %s $n.mp4.tmp 2>/dev/null)"; rm -f $n.mp4.tmp; fi
  done
  [ $missing = 0 ] && echo ALLDONE && exit 0
  sleep 240
done
