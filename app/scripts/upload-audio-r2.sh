#!/bin/bash
# Upload audio files to R2 bucket tinct-audio
# Uses wrangler r2 object put with parallel execution

BUCKET="tinct-audio"
AUDIO_DIR="audio"
PARALLEL=20
COUNT=0
TOTAL=$(find "$AUDIO_DIR" -type f \( -name "*.mp3" -o -name "*.wav" -o -name "manifest.json" -o -name "words.json" \) | wc -l | tr -d ' ')

echo "Uploading $TOTAL files to R2 bucket '$BUCKET' with $PARALLEL parallel jobs..."

upload_file() {
  local filepath="$1"
  # Strip the leading "audio/" to get the R2 key
  local key="${filepath#audio/}"

  local content_type="application/octet-stream"
  case "$filepath" in
    *.mp3) content_type="audio/mpeg" ;;
    *.wav) content_type="audio/wav" ;;
    *.json) content_type="application/json" ;;
  esac

  npx wrangler r2 object put "$BUCKET/$key" --file="$filepath" --content-type="$content_type" 2>/dev/null
}

export -f upload_file
export BUCKET

find "$AUDIO_DIR" -type f \( -name "*.mp3" -o -name "*.wav" -o -name "manifest.json" -o -name "words.json" \) | \
  xargs -P "$PARALLEL" -I {} bash -c 'upload_file "$@"' _ {}

echo "Done!"
