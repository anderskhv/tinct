#!/usr/bin/env bash
# Reset a user's position row in cloud. Use only if a position is stuck/corrupted
# and you want to start fresh. Anders's user_id is in
# .claude/projects/.../memory/anders_supabase_user_id.md
#
# Usage:
#   ./sb-reset-position.sh <user_id> <bookId>
#   ./sb-reset-position.sh 16232fe3-... the-awakening
#
# After running, the next time the user opens the book it will start at chapter 1
# and any subsequent navigation will write a fresh, correct position to cloud.
set -euo pipefail

USER_ID="${1:?user_id required}"
BOOK_ID="${2:?bookId required}"

ENV_FILE="$(dirname "$0")/../.env"
SB_URL=$(grep '^VITE_SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2)
SB_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d= -f2)

KEY="position:${BOOK_ID}"

echo "Deleting ${KEY} for user ${USER_ID}..."
curl -s -X DELETE \
  "${SB_URL}/rest/v1/user_data?user_id=eq.${USER_ID}&key=eq.${KEY}" \
  -H "apikey: ${SB_KEY}" \
  -H "Authorization: Bearer ${SB_KEY}" \
  -H "Prefer: return=representation"

echo ""
echo "Done. Verify with: ./sb-read.sh ${USER_ID} ${KEY}"
