#!/usr/bin/env bash
# Proves, on a throwaway local PostgreSQL, that a signed-in reader cannot give
# themselves Premium for life (supabase/migrations/20261126_premium_grant.sql).
#
# It builds a Supabase-shaped database (the anon, authenticated and
# service_role roles with Supabase's default table grants, auth.uid() from the
# request's JWT claims, profiles with its row-level security from
# supabase/migration.sql), runs the migration twice, then, as `authenticated`:
#   * updates and inserts the grant under today's policies (refused or no row);
#   * does the same with a permissive policy added, as if one were added later
#     (the trigger refuses);
# and confirms the service role and the SQL editor (postgres) can still grant
# and revoke. Nothing outside the temporary directory is touched; no network.
#
#   bash scripts/check-premium-grant-sql.sh      (needs PostgreSQL 14+ binaries)
set -euo pipefail

APP="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATION="${MIGRATION:-$APP/supabase/migrations/20261126_premium_grant.sql}"
PGBIN="${PGBIN:-$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -1)}"
[ -x "$PGBIN/initdb" ] || { echo "PostgreSQL binaries not found (set PGBIN)"; exit 2; }

WORK="$(mktemp -d)"
RUN=()
if [ "$(id -u)" = 0 ]; then chown postgres "$WORK"; RUN=(runuser -u postgres --); fi
cp "$MIGRATION" "$WORK/migration.sql"; chmod a+r "$WORK/migration.sql"
cleanup() { "${RUN[@]}" "$PGBIN/pg_ctl" -D "$WORK/data" -m immediate stop >/dev/null 2>&1 || true; rm -rf "$WORK"; }
trap cleanup EXIT

"${RUN[@]}" "$PGBIN/initdb" -D "$WORK/data" -U postgres -A trust >/dev/null
"${RUN[@]}" "$PGBIN/pg_ctl" -D "$WORK/data" -o "-k $WORK -c listen_addresses=''" -l "$WORK/log" -w start >/dev/null
PSQL=("${RUN[@]}" "$PGBIN/psql" -h "$WORK" -U postgres -d postgres -v ON_ERROR_STOP=1 -q -X)

"${PSQL[@]}" <<'SQL'
-- Supabase's shape, as far as this check needs it.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key, email text, created_at timestamptz default now());
create function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- profiles as supabase/migration.sql and the later migrations left it.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  subscription_status text,
  subscription_period_end timestamptz,
  ai_credit_micros bigint not null default 0,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy profiles_select on public.profiles for select using (auth.uid() = id);
-- Supabase grants every table in public to these roles by default.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;

insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'reader@example.invalid'),
  ('22222222-2222-4222-8222-222222222222', 'other@example.invalid');
insert into public.profiles (id, email) values ('11111111-1111-4111-8111-111111111111', 'reader@example.invalid');
SQL

echo "migration: first run"
"${PSQL[@]}" -f "$WORK/migration.sql" >/dev/null
echo "migration: second run (idempotent)"
"${PSQL[@]}" -f "$WORK/migration.sql" >/dev/null

fail() { echo "FAIL: $1"; exit 1; }
as_reader() {
  # One statement as the signed-in reader 1111..., the way PostgREST runs it.
  "${PSQL[@]}" -t -A 2>&1 <<SQL || true
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
$1
commit;
SQL
}
granted() { "${PSQL[@]}" -t -A -c "select coalesce(premium_grant, 'none') from public.profiles where id = '$1'"; }

# Today's policies: no update policy, so the update reaches no row; the insert is refused
# (the trigger fires before the row-level security check, which refuses it too).
out="$(as_reader "update public.profiles set premium_grant = 'launch-2026-11', premium_granted_at = now() where id = auth.uid();")"
[ "$(granted 11111111-1111-4111-8111-111111111111)" = none ] || fail "reader updated their own grant: $out"
echo "ok: reader update without a policy changes nothing"
out="$(as_reader "insert into public.profiles (id, premium_grant, premium_granted_at) values ('22222222-2222-4222-8222-222222222222', 'launch-2026-11', now());")"
echo "$out" | grep -q 'row-level security\|premium_grant is set by Tinct only' || fail "reader insert was not refused: $out"
[ -z "$("${PSQL[@]}" -t -A -c "select 1 from public.profiles where id = '22222222-2222-4222-8222-222222222222'")" ] || fail "reader inserted a granted row"
echo "ok: reader insert refused"

# A permissive policy added later must still not let a reader grant themselves.
"${PSQL[@]}" -c "create policy test_update_own on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
                 create policy test_insert_own on public.profiles for insert to authenticated with check (auth.uid() = id);"
out="$(as_reader "update public.profiles set premium_grant = 'launch-2026-11', premium_granted_at = now() where id = auth.uid();")"
echo "$out" | grep -q 'premium_grant is set by Tinct only' || fail "trigger did not refuse the update: $out"
[ "$(granted 11111111-1111-4111-8111-111111111111)" = none ] || fail "grant written despite the trigger"
echo "ok: reader update refused by the trigger even with an update policy"
out="$(as_reader "update public.profiles set premium_granted_at = now() where id = auth.uid();")"
echo "$out" | grep -q 'premium_grant is set by Tinct only\|profiles_premium_grant_pair' || fail "half a grant was accepted: $out"
echo "ok: reader cannot set the grant time alone"
out="$(as_reader "insert into public.profiles (id, premium_grant, premium_granted_at) values ('11111111-1111-4111-8111-111111111111', 'launch-2026-11', now()) on conflict (id) do update set premium_grant = excluded.premium_grant, premium_granted_at = excluded.premium_granted_at;")"
echo "$out" | grep -q 'premium_grant is set by Tinct only' || fail "trigger did not refuse the upsert: $out"
echo "ok: reader upsert refused by the trigger"
out="$(as_reader "update public.profiles set email = 'reader@example.invalid' where id = auth.uid();")"
echo "$out" | grep -q 'ERROR' && fail "an unrelated column was blocked: $out"
echo "ok: other columns are not affected by the trigger"
"${PSQL[@]}" -c "drop policy test_update_own on public.profiles; drop policy test_insert_own on public.profiles;"

# The service role (the Worker) and the SQL editor can grant and revoke.
"${PSQL[@]}" -c "set role service_role; update public.profiles set premium_grant = 'launch-2026-11', premium_granted_at = now() where id = '11111111-1111-4111-8111-111111111111';"
[ "$(granted 11111111-1111-4111-8111-111111111111)" = launch-2026-11 ] || fail "service role could not grant"
echo "ok: service role can grant"
out="$(as_reader "update public.profiles set premium_grant = null, premium_granted_at = null where id = auth.uid();")"
[ "$(granted 11111111-1111-4111-8111-111111111111)" = launch-2026-11 ] || fail "reader removed their grant: $out"
echo "ok: reader cannot change or remove a grant"
"${PSQL[@]}" -c "update public.profiles set premium_grant = null, premium_granted_at = null where id = '11111111-1111-4111-8111-111111111111';"
[ "$(granted 11111111-1111-4111-8111-111111111111)" = none ] || fail "postgres could not revoke"
echo "ok: SQL editor can revoke"
out="$("${PSQL[@]}" -c "update public.profiles set premium_grant = 'Launch 2026', premium_granted_at = now() where id = '11111111-1111-4111-8111-111111111111';" 2>&1 || true)"
echo "$out" | grep -q 'profiles_premium_grant_name' || fail "a malformed grant name was accepted: $out"
echo "ok: grant names are checked"
"${PSQL[@]}" -c "delete from auth.users where id = '11111111-1111-4111-8111-111111111111';"
[ -z "$("${PSQL[@]}" -t -A -c "select 1 from public.profiles where id = '11111111-1111-4111-8111-111111111111'")" ] || fail "profile survived the account delete"
echo "ok: deleting the account removes the row, grant included"
echo "PASS: premium grant SQL"
