#!/usr/bin/env bash
# Read-only Supabase query helper.
# Reads .env for credentials, runs a GET against the REST API.
#
# Usage:
#   ./sb-read.sh <user_id> [key_prefix]
#   ./sb-read.sh 16232fe3-...                  # all rows
#   ./sb-read.sh 16232fe3-... position:        # only position rows
#   ./sb-read.sh 16232fe3-... position:awakening   # one specific key
#
# This script is read-only by design — only does GETs, no writes/deletes.
# Output is JSON to stdout, suitable for piping to jq.
set -euo pipefail

USER_ID="${1:?user_id required}"
KEY_PREFIX="${2:-}"

ENV_FILE="$(dirname "$0")/../.env"
SB_URL=$(grep '^VITE_SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2)
SB_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d= -f2)

if [ -z "$SB_URL" ] || [ -z "$SB_KEY" ]; then
  echo "ERR: missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in $ENV_FILE" >&2
  exit 1
fi

QUERY="user_id=eq.${USER_ID}&select=key,value,updated_at&order=updated_at.desc"
if [ -n "$KEY_PREFIX" ]; then
  if [[ "$KEY_PREFIX" == *":" ]]; then
    QUERY="${QUERY}&key=like.${KEY_PREFIX}*"
  else
    QUERY="${QUERY}&key=eq.${KEY_PREFIX}"
  fi
fi

curl -s "${SB_URL}/rest/v1/user_data?${QUERY}" \
  -H "apikey: ${SB_KEY}" \
  -H "Authorization: Bearer ${SB_KEY}"
