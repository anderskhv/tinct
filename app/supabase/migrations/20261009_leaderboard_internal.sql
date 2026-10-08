-- Leaderboard threshold and internal accounts (Anders, 8 October 2026).
--
-- ANDERS RUNS THIS BY HAND, after 20261008_profiles.sql and
-- 20261008_social.sql. Idempotent: safe to run more than once.
--
-- Until it has run, the Worker keeps working: Friends boards are served as
-- before (internal accounts cannot be told apart yet), the Everyone board stays
-- closed (its count of real readers cannot be told), and flagging an account
-- fails quietly. Once it has run, everything below applies within minutes, with
-- no release.
--
--   * reader_profiles.internal: Tinct's own internal and test accounts. They
--     never appear on any leaderboard (Friends or Everyone) and never count
--     toward the 10 real readers the Everyone board needs
--     (app/src/social/socialRules.ts EVERYONE_BOARD_MIN_READERS).
--     The Worker sets it (never clears it) when a profile is read or saved by
--     a device with the internal-traffic flag (?internal=1, which sends
--     x-tinct-check: 1) or by an account with a reserved test address
--     (example.com/.net/.org and the .test/.example/.invalid/.localhost
--     domains, e.g. QA's qa-…@example.com). Clearing it is a manual
--     update here.
--   * public_profile_cards gains the column (last, so the view is replaced in
--     place and keeps its grants). Profiles still show as before; only the
--     leaderboard reads the flag.

-- 1. The flag ---------------------------------------------------------------
alter table public.reader_profiles add column if not exists internal boolean not null default false;

-- Existing test accounts (the same rule as isReservedTestEmail in socialRules.ts).
update public.reader_profiles rp
   set internal = true
  from auth.users u
 where u.id = rp.id
   and not rp.internal
   and (lower(split_part(u.email, '@', 2)) ~ '(^|\.)example\.(com|net|org)$'
     or lower(split_part(u.email, '@', 2)) ~ '\.(test|example|invalid|localhost)$');

-- 2. The view (same definition as 20261008_profiles.sql, plus `internal`) ------
create or replace view public.public_profile_cards
with (security_invoker = true) as
select
  rp.id,
  rp.handle,
  rp.display_name,
  case when rp.picture_kind in ('upload', 'google') and rp.picture_review <> 'approved' then 'initial' else rp.picture_kind end as picture_kind,
  case when rp.picture_kind in ('upload', 'google') and rp.picture_review <> 'approved' then null else rp.picture_value end as picture_value,
  case when rp.background_kind = 'upload' and rp.background_review <> 'approved' then 'library' else rp.background_kind end as background_kind,
  case when rp.background_kind = 'upload' and rp.background_review <> 'approved' then null else rp.background_value end as background_value,
  case when rp.visibility = 'everyone' and p.email_confirmed_at is null then 'friends' else rp.visibility end as visibility,
  rp.show_reading,
  rp.show_time,
  rp.on_leaderboard,
  rp.internal
from public.reader_profiles rp
join public.profiles p on p.id = rp.id
where rp.visibility <> 'only_me'
  and rp.hidden_at is null;

revoke all on public.public_profile_cards from anon, authenticated;
grant select on public.public_profile_cards to service_role;
