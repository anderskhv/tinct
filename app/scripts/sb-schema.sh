#!/usr/bin/env bash
# Read-only Supabase schema introspection.
# Asks PostgREST for the OpenAPI definition of a table — shows column defaults,
# constraints, and the table description (which Supabase auto-generates from
# Postgres comments). No data is read.
#
# Usage:
#   ./sb-schema.sh user_data
set -euo pipefail

TABLE="${1:?table name required}"

ENV_FILE="$(dirname "$0")/../.env"
SB_URL=$(grep '^VITE_SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2)
SB_KEY=$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d= -f2)

# OpenAPI document includes all tables. Extract just the one we want.
curl -s "${SB_URL}/rest/v1/" \
  -H "apikey: ${SB_KEY}" \
  -H "Authorization: Bearer ${SB_KEY}" \
  | python3 -c "
import json, sys
d = json.load(sys.stdin)
defs = d.get('definitions', {})
if '$TABLE' not in defs:
    print('Table not found. Available:', ', '.join(sorted(defs.keys())))
    sys.exit(1)
t = defs['$TABLE']
print('=== $TABLE ===')
print()
print('description:', t.get('description', '(none)'))
print()
print('columns:')
for name, props in t.get('properties', {}).items():
    desc = props.get('description', '')
    fmt = props.get('format', '?')
    typ = props.get('type', '?')
    default = props.get('default', '')
    flags = []
    if name in t.get('required', []): flags.append('required')
    if default: flags.append(f'default={default}')
    line = f'  {name:<20} {typ:<10} format={fmt:<20} {\" \".join(flags)}'
    print(line)
    if desc:
        print(f'    desc: {desc[:200]}')
"
