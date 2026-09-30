#!/bin/bash
# fetch_full.sh <request_id> <out.mp4>: full (non-resumed) download with long timeout; retries until the file decodes
RID=$1; OUT=$2; FF=/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2
for i in 1 2 3 4 5 6; do
  URL=$(curl -sS -m 60 https://api.x.ai/v1/videos/$RID -H "Authorization: Bearer $XAI_API_KEY" | python3 -c "import json,sys;print(json.load(sys.stdin)['video']['url'])")
  curl -sS -m 1500 -o "$OUT.tmp" "$URL" && [ -z "$($FF -v error -i "$OUT.tmp" -f null - 2>&1 | head -1)" ] && mv "$OUT.tmp" "$OUT" && echo "$OUT ok $(stat -c %s "$OUT")" && exit 0
  echo "$OUT attempt $i failed"; sleep 10
done
exit 1
