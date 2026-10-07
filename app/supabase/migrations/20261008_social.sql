-- Social (social brief, ship 3: follows, the leaderboard, reports; approved by
-- Anders 7 October 2026). Behind the Worker var SOCIAL_FRIENDS, which needs
-- SOCIAL_PROFILES.
--
-- ANDERS RUNS THIS BY HAND, after 20261008_reading_time.sql and
-- 20261008_profiles.sql (follows, blocks and reader_profiles.hidden_at come
-- from there), and before setting SOCIAL_FRIENDS to "1". With the var off
-- nothing reads or writes these objects. With the var on and this file not yet
-- run, the leaderboard and reports answer "unavailable" and nothing else
-- changes.
--
-- Idempotent: safe to run more than once.
--
-- Shape
--   * leaderboard_7d: each reader's reading + listening over the last 7 days,
--     one row per reader with any time, rebuilt at least hourly by
--     refresh_leaderboard_7d() (the Worker's 10-minute cron calls it once an
--     hour, and the leaderboard calls it when the rows are older than an
--     hour). It holds numbers only; who appears on which board is decided
--     when a board is read, from public_profile_cards (Only me, hidden and
--     Friends-only-to-strangers never appear), the reader's own "appear on
--     the leaderboard" and "show my reading time" switches, and blocks in
--     either direction. Switching "appear on the leaderboard" off therefore
--     removes a reader at once, and at the latest within the hour.
--   * profile_reports: the Report link on a public profile. Read only in the
--     admin view.
--
-- Row-level security: both tables have RLS on and no policies, so only the
-- service role (the Worker) reads or writes them. Readers never see another
-- reader's numbers except through the Worker, which applies every choice.

-- 1. The 7-day leaderboard cache --------------------------------------------
create table if not exists public.leaderboard_7d (
  user_id uuid primary key references auth.users(id) on delete cascade,
  seconds integer not null check (seconds >= 0),
  window_start date not null,
  window_end date not null,
  refreshed_at timestamptz not null default now()
);

create index if not exists leaderboard_7d_seconds_idx on public.leaderboard_7d (seconds desc);

alter table public.leaderboard_7d enable row level security;
revoke all on public.leaderboard_7d from anon, authenticated;
grant all on public.leaderboard_7d to service_role;

-- The window: reader-local days from (today − 6) to (today + 1), today being
-- the UTC date. The ledger keys time by each reader's own date, so a reader
-- east of UTC who is already in tomorrow still counts their new day.
-- Mirrors leaderboardWindow() in app/src/social/socialRules.ts.
create or replace function public.refresh_leaderboard_7d(p_today date default null)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := coalesce(p_today, (now() at time zone 'utc')::date);
  v_start date := v_today - 6;
  v_end date := v_today + 1;
  v_count integer;
begin
  -- One rebuild at a time; a second caller waits and then rebuilds again.
  perform pg_advisory_xact_lock(hashtextextended('leaderboard_7d', 0));
  delete from public.leaderboard_7d where true;
  insert into public.leaderboard_7d (user_id, seconds, window_start, window_end, refreshed_at)
  select rt.user_id, sum(rt.read_seconds + rt.listen_seconds)::integer, v_start, v_end, now()
    from public.reading_time rt
   where rt.day between v_start and v_end
     and rt.book_id <> '_earlier'
   group by rt.user_id
  having sum(rt.read_seconds + rt.listen_seconds) > 0;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.refresh_leaderboard_7d(date) from public, anon, authenticated;
grant execute on function public.refresh_leaderboard_7d(date) to service_role;

-- 2. Reports ----------------------------------------------------------------
create table if not exists public.profile_reports (
  id bigint generated always as identity primary key,
  -- Who reported (kept if the reporter's account goes, as no one).
  reporter uuid references auth.users(id) on delete set null,
  -- Whose profile (the report goes with that account).
  reported uuid not null references auth.users(id) on delete cascade,
  -- The handle at the time, so the admin view can show it after a rename.
  handle text not null check (char_length(handle) <= 20),
  reason text not null check (reason in ('name', 'picture', 'background', 'spam', 'other')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text check (resolution is null or resolution in ('dismissed', 'renamed', 'hidden', 'picture-removed'))
);

create index if not exists profile_reports_open_idx on public.profile_reports (created_at desc) where resolved_at is null;
create index if not exists profile_reports_reporter_idx on public.profile_reports (reporter, created_at desc);
-- One open report per reporter and profile.
create unique index if not exists profile_reports_once on public.profile_reports (reporter, reported) where resolved_at is null;

alter table public.profile_reports enable row level security;
revoke all on public.profile_reports from anon, authenticated;
grant all on public.profile_reports to service_role;

-- First fill, so the board is not empty before the first cron run.
select public.refresh_leaderboard_7d();
