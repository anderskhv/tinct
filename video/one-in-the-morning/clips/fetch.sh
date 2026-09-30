#!/bin/bash
# fetch.sh <request_id> <out.mp4>: resume-download a finished Grok Imagine video until it decodes cleanly
RID=$1; OUT=$2
FF=${FFMPEG:-/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2}
URL=$(curl -sS -m 60 https://api.x.ai/v1/videos/$RID -H "Authorization: Bearer $XAI_API_KEY" | python3 -c "import json,sys;print(json.load(sys.stdin)['video']['url'])")
SIZE=$(curl -sS -m 60 -o /dev/null -w '%{size_download}' -r 0-0 "$URL" >/dev/null; curl -sSI -m 60 "$URL" | awk 'tolower($1)=="content-length:"{print $2+0}' | tail -1)
for i in $(seq 1 200); do
  s=$(stat -c %s "$OUT.part" 2>/dev/null || echo 0)
  if [ -n "$SIZE" ] && [ "$SIZE" -gt 0 ] && [ "$s" -ge "$SIZE" ]; then break; fi
  if [ -z "$SIZE" ] || [ "$SIZE" -eq 0 ]; then
    cp "$OUT.part" /tmp/_probe.mp4 2>/dev/null && [ -z "$($FF -v error -i /tmp/_probe.mp4 -f null - 2>&1 | head -1)" ] && [ "$s" -gt 100000 ] && break
  fi
  curl -sS -m 60 --speed-limit 20000 --speed-time 15 -C - -o "$OUT.part" "$URL" 2>/dev/null
done
mv "$OUT.part" "$OUT"; echo "$OUT $(stat -c %s "$OUT") / ${SIZE:-unknown}"
