-- Test accounts are marked, so they never count as readers (Anders approved,
-- 10 October 2026).
--
-- ANDERS RUNS THIS BY HAND. Idempotent: safe to run more than once. Nothing
-- in the Worker needs it to have run: until then admin metrics leave test
-- accounts out by their address alone (qa-*@test.tinct.app and the reserved
-- example/test domains), and the test tools' profile flag write fails quietly.
--
-- On 8–9 October QA sessions signed up 21 accounts on production
-- (qa-…@example.com) that made profiles, followed each other and used recap
-- and narration, counted as readers. Since 10 October the test tools create
-- accounts only as qa-*@test.tinct.app (app/scripts/lib/testAccounts.cjs).
--
--   1. profiles.is_test: Tinct's own test account. Set for a new account whose
--      address is a test address or whose app_metadata carries is_test (only
--      the service role can set that), and backfilled below. The test tools
--      also set it directly. Clearing it is a manual update here.
--   2. public.is_test_email(text): the address rule, the same as
--      isReservedTestEmail in app/src/social/socialRules.ts.
--   3. Existing test accounts are flagged, including the 21 from 8–9 October.
--   4. reader_profiles.internal follows is_test (leaderboards; see
--      20261009_leaderboard_internal.sql), when that table exists.
--   5. ai_cost_by_user_month gains `is_test` (last column, so the view is
--      replaced in place and keeps its grants): true for a test account or a
--      row from Tinct's own checks (guest_key 'check', which the Worker now
--      also writes beside a signed-in account's id).
--
-- No reader-visible change and no new personal data: the flag is about
-- Tinct's own accounts only.

-- 1. The flag ---------------------------------------------------------------
alter table public.profiles add column if not exists is_test boolean not null default false;

-- 2. The address rule ------------------------------------------------------
create or replace function public.is_test_email(email text)
returns boolean
language sql
immutable
as $$
  select coalesce(
    lower(split_part(email, '@', 2)) = 'test.tinct.app'
    or lower(split_part(email, '@', 2)) ~ '(^|\.)example\.(com|net|org)$'
    or lower(split_part(email, '@', 2)) ~ '\.(test|example|invalid|localhost)$',
    false)
$$;

-- New accounts: after the profile row exists. Trigger order is alphabetical;
-- this name sorts after on_auth_user_created (the profile) and
-- on_auth_user_created_consent, which are left exactly as they are.
create or replace function public.mark_test_account()
returns trigger as $$
begin
  if public.is_test_email(new.email) or coalesce((new.raw_app_meta_data ->> 'is_test')::boolean, false) then
    update public.profiles set is_test = true where id = new.id and not is_test;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.mark_test_account() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_test_flag on auth.users;
create trigger on_auth_user_created_test_flag
  after insert on auth.users
  for each row execute function public.mark_test_account();

-- 3. Existing test accounts -------------------------------------------------
update public.profiles p
   set is_test = true
  from auth.users u
 where u.id = p.id
   and not p.is_test
   and (public.is_test_email(u.email) or coalesce((u.raw_app_meta_data ->> 'is_test')::boolean, false));

-- 4. Leaderboards -----------------------------------------------------------
do $$
begin
  if exists (select 1 from information_schema.columns
              where table_schema = 'public' and table_name = 'reader_profiles' and column_name = 'internal') then
    update public.reader_profiles rp
       set internal = true
      from public.profiles p
     where p.id = rp.id and p.is_test and not rp.internal;
  end if;
end $$;

-- 5. The cost view ---------------------------------------------------------
-- Whether an account is a test account, for site admins and the service role
-- only (anyone else gets false), so the invoker-rights view can read it
-- without widening profiles' row-level security.
create or replace function public.is_test_user(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((
    select p.is_test from public.profiles p
     where p.id = uid
       and (auth.role() = 'service_role' or exists (select 1 from public.site_admins sa where sa.user_id = auth.uid()))
  ), false)
$$;

revoke execute on function public.is_test_user(uuid) from public, anon;
grant execute on function public.is_test_user(uuid) to authenticated, service_role;

create or replace view public.ai_cost_by_user_month
with (security_invoker = true) as
select
  coalesce(e.user_id::text, e.guest_key) as reader_key,
  e.user_id,
  e.guest_key,
  date_trunc('month', e.created_at)::date as month,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'chat'), 0) as chat_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'explain'), 0) as explain_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'librarian'), 0) as librarian_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'recap'), 0) as recap_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'lab_chat'), 0) as lab_chat_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'talk'), 0) as talk_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'narration_generate'), 0) as narration_generate_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'source_search'), 0) as source_search_usd,
  coalesce(sum(e.cost_usd), 0) as total_usd,
  coalesce(sum(e.seconds) filter (where e.feature = 'talk'), 0) / 60.0 as talk_minutes,
  coalesce(sum(e.seconds) filter (where e.feature = 'narration_listen'), 0) / 60.0 as listening_minutes,
  coalesce(sum(e.chars) filter (where e.feature = 'narration_generate' and e.cache_hit is not true), 0) as chars_generated,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'chapter_notes'), 0) as chapter_notes_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'catch_up'), 0) as catch_up_usd,
  (e.guest_key is not distinct from 'check') or (e.user_id is not null and public.is_test_user(e.user_id)) as is_test
from public.ai_usage_events e
group by coalesce(e.user_id::text, e.guest_key), e.user_id, e.guest_key, date_trunc('month', e.created_at)::date;
