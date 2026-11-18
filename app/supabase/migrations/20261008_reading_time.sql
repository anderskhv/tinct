-- Reading time ledger (social brief, ship 1 "Reading time you can trust";
-- schema approved by Anders 2026-10-07).
--
-- One row per reader, per reader-local day, per book: seconds read and
-- seconds listened. The Worker writes it from the reader's heartbeat
-- (/api/reading-time/beat) with the service role and enforces the limits
-- (one beat per ~50 s, at most 60 s credited per beat, at most 16 h a day);
-- add_reading_time() below enforces the daily cap again atomically.
--
-- book_id '_earlier' holds time counted before the ledger existed (the
-- account's reading-year-* totals, merged in once, and a signed-out tally
-- flushed at sign-in). It has no real day, is excluded from the daily cap
-- and from day-based figures, and counts only in totals.
--
-- Readers can read only their own rows; nobody but the service role writes.
-- Rows go with the account (ON DELETE CASCADE) and are covered by account
-- export and deletion (app/src/worker/routes/adminAccounts.ts).
--
-- Self-contained and idempotent: safe to run twice. The Worker treats a
-- missing table as "ledger unavailable" and keeps the device tally, so the
-- code may be deployed before this runs.

create table if not exists public.reading_time (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  book_id text not null check (book_id = '_earlier' or book_id ~ '^[a-z0-9-]{1,80}$'),
  read_seconds integer not null default 0 check (read_seconds >= 0),
  listen_seconds integer not null default 0 check (listen_seconds >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, day, book_id)
);

-- The primary key already serves (user_id, day) lookups; this index makes the
-- reader's own history read (newest first) and the 7-day window cheap.
create index if not exists reading_time_user_day_idx
  on public.reading_time (user_id, day desc);

alter table public.reading_time enable row level security;

drop policy if exists reading_time_select_own on public.reading_time;
create policy reading_time_select_own on public.reading_time
  for select to authenticated using ((select auth.uid()) = user_id);

-- No insert/update/delete policies: only the service role (which bypasses RLS) writes.
revoke all on public.reading_time from anon, authenticated;
grant select on public.reading_time to authenticated;
grant all on public.reading_time to service_role;

-- Credit reading time to one (reader, day, book), never letting the day's
-- total (all books, '_earlier' excluded) pass p_daily_cap seconds. Listening
-- is credited first (it was measured while narration played), then reading.
-- Serialised per reader and day by an advisory lock, so two writers cannot
-- both pass the cap. Returns what was actually credited.
create or replace function public.add_reading_time(
  p_user_id uuid,
  p_day date,
  p_book_id text,
  p_read integer,
  p_listen integer,
  p_daily_cap integer
)
returns table (read_credited integer, listen_credited integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer := 0;
  v_room integer;
  v_listen integer := greatest(coalesce(p_listen, 0), 0);
  v_read integer := greatest(coalesce(p_read, 0), 0);
begin
  perform pg_advisory_xact_lock(hashtextextended('reading_time:' || p_user_id::text || ':' || p_day::text, 0));
  if p_book_id <> '_earlier' then
    select coalesce(sum(rt.read_seconds + rt.listen_seconds), 0)::integer into v_used
      from public.reading_time rt
     where rt.user_id = p_user_id and rt.day = p_day and rt.book_id <> '_earlier';
    v_room := greatest(coalesce(p_daily_cap, 0) - v_used, 0);
    v_listen := least(v_listen, v_room);
    v_read := least(v_read, v_room - v_listen);
  end if;
  if v_read + v_listen > 0 then
    insert into public.reading_time as rt (user_id, day, book_id, read_seconds, listen_seconds, updated_at)
    values (p_user_id, p_day, p_book_id, v_read, v_listen, now())
    on conflict (user_id, day, book_id) do update
      set read_seconds = rt.read_seconds + excluded.read_seconds,
          listen_seconds = rt.listen_seconds + excluded.listen_seconds,
          updated_at = now();
  end if;
  return query select v_read, v_listen;
end;
$$;

revoke all on function public.add_reading_time(uuid, date, text, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.add_reading_time(uuid, date, text, integer, integer, integer) to service_role;
