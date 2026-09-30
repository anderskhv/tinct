#!/bin/bash
# fetch.sh <request_id> <out.mp4>: resume-download a finished Grok Imagine video
RID=$1; OUT=$2
URL=$(curl -sS -m 60 https://api.x.ai/v1/videos/$RID -H "Authorization: Bearer $XAI_API_KEY" | python3 -c "import json,sys;print(json.load(sys.stdin)['video']['url'])")
SIZE=$(curl -sSI -m 60 "$URL" | awk 'tolower($1)=="content-length:"{print $2+0}' | tail -1)
for i in $(seq 1 40); do
  s=$(stat -c %s "$OUT.part" 2>/dev/null || echo 0)
  [ -n "$SIZE" ] && [ "$s" -ge "$SIZE" ] && break
  curl -sS -m 60 --speed-limit 20000 --speed-time 15 -C - -o "$OUT.part" "$URL" 2>/dev/null
done
mv "$OUT.part" "$OUT"; echo "$OUT $(stat -c %s "$OUT") / $SIZE"
