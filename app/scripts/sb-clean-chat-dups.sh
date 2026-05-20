#!/usr/bin/env bash
# Clean duplicate conversations in chat-history caused by the
# "loadMessages-re-records-last-historical-message" bug (fixed 2026-05-07).
#
# Heuristic: drop conversations that have NO user-role message. Legit
# conversations always have at least one user message; the duplicate-conversation
# bug creates conversations with only the assistant's response.
#
# Usage:
#   ./sb-clean-chat-dups.sh <user_id> <bookId>
#   ./sb-clean-chat-dups.sh 16232fe3-... the-awakening
#
# Dry-run by default — prints what WOULD be deleted. Pass --apply to write.
set -euo pipefail

USER_ID="${1:?user_id required}"
BOOK_ID="${2:?bookId required}"
APPLY="${3:-}"

ENV_FILE="$(dirname "$0")/../.env"
SB_URL=$(grep '^VITE_SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2)
SB_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d= -f2)
KEY="chat-history:${BOOK_ID}"

CURRENT=$(curl -s "${SB_URL}/rest/v1/user_data?user_id=eq.${USER_ID}&key=eq.${KEY}&select=value" \
  -H "apikey: ${SB_KEY}" -H "Authorization: Bearer ${SB_KEY}")

CLEANED=$(echo "$CURRENT" | python3 -c "
import json, sys
rows = json.load(sys.stdin)
if not rows:
    print(json.dumps([]))
    sys.exit(0)
convs = rows[0]['value']
before = len(convs)
cleaned = [c for c in convs if any(m.get('role') == 'user' for m in c.get('messages', []))]
after = len(cleaned)
print(f'BEFORE: {before} conversations', file=sys.stderr)
print(f'AFTER:  {after} conversations', file=sys.stderr)
print(f'DROPPED: {before - after} (assistant-only / duplicate)', file=sys.stderr)
print(json.dumps(cleaned))
")

if [ "$APPLY" != "--apply" ]; then
  echo ""
  echo "DRY RUN — to apply, re-run with --apply as third argument:"
  echo "  ./sb-clean-chat-dups.sh ${USER_ID} ${BOOK_ID} --apply"
  exit 0
fi

# Write cleaned value back via PATCH
curl -s -X PATCH \
  "${SB_URL}/rest/v1/user_data?user_id=eq.${USER_ID}&key=eq.${KEY}" \
  -H "apikey: ${SB_KEY}" \
  -H "Authorization: Bearer ${SB_KEY}" \
  -H "Content-Type: application/json" \
  -d "$(python3 -c "import sys,json; print(json.dumps({'value': json.loads(sys.argv[1])}))" "$CLEANED")"

echo ""
echo "Done. Verify:"
echo "  ./sb-read.sh ${USER_ID} ${KEY} | jq '.[0].value | length'"
