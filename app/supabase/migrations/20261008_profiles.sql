-- Profiles (social ship 2, approved by Anders 7 October 2026).
--
-- ANDERS RUNS THIS BY HAND AFTER THE CODE IS DEPLOYED, and before setting the
-- Worker var SOCIAL_PROFILES to "1". With the var off nothing reads or writes
-- these objects. With the var on and this file not yet run, the Worker answers
-- "profiles unavailable" and every page behaves as it does today.
--
-- Idempotent: safe to run more than once.
--
-- Shape
--   * reader_profiles: one row per account. Name, handle, picture and banner,
--     who can see the reader, the three switches and the reading default.
--     Kept apart from public.profiles (billing, AI allowance) so nothing that
--     serves public data ever touches billing columns.
--   * profiles gains email_confirmed_at (soft email confirmation) and
--     email_consent_version (the wording the reader agreed to).
--   * follows and blocks (used from ship 3; created now, as approved).
--   * public_profile_cards: the one view the Worker reads to serve other
--     readers. It applies each reader's own choices (Only me never appears;
--     Everyone counts only once the email is confirmed; unreviewed uploads
--     never appear). The Worker then applies the viewer's relationship.
--
-- Row-level security: every table is readable only by its owner. Readers write
-- nothing directly; the Worker (service role) writes each reader's own rows
-- after checking handle rules, the word filter and the email gate. Highlights,
-- notes, chats, Talk and email addresses are never in any of these objects.

-- 1. Account-level columns -------------------------------------------------
alter table public.profiles add column if not exists email_confirmed_at timestamptz;
alter table public.profiles add column if not exists email_consent_version text;

-- Consent given before this ran was given to the 2 October wording.
update public.profiles
   set email_consent_version = '2026-10-02'
 where email_opt_in and email_consent_version is null;

-- The sign-up consent trigger also records the wording version the sign-up
-- page sent (raw_user_meta_data.email_consent_version).
-- A Google sign-up counts as confirmed from the start (Google verified the
-- address), so the welcome email (ship 4) is welcome-google and reading emails
-- need no click, even while SOCIAL_PROFILES is off.
create or replace function public.record_email_consent()
returns trigger as $$
begin
  if coalesce((new.raw_user_meta_data ->> 'email_opt_in')::boolean, false) then
    update public.profiles
       set email_opt_in = true,
           email_opt_in_at = now(),
           email_consent_version = coalesce(nullif(left(new.raw_user_meta_data ->> 'email_consent_version', 40), ''), '2026-10-02')
     where id = new.id;
  end if;
  if new.raw_app_meta_data ->> 'provider' = 'google' then
    update public.profiles set email_confirmed_at = coalesce(email_confirmed_at, now()) where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.record_email_consent() from public, anon, authenticated;

-- Google accounts from before this ran.
update public.profiles p
   set email_confirmed_at = coalesce(u.created_at, now())
  from auth.users u
 where u.id = p.id
   and p.email_confirmed_at is null
   and u.raw_app_meta_data ->> 'provider' = 'google';

-- 2. Reader profiles -------------------------------------------------------
create table if not exists public.reader_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  handle text not null,
  picture_kind text not null default 'initial',
  picture_value text,
  picture_review text not null default 'none',
  background_kind text not null default 'library',
  background_value text,
  background_review text not null default 'none',
  visibility text not null default 'only_me',
  show_reading boolean not null default true,
  show_time boolean not null default true,
  on_leaderboard boolean not null default false,
  new_books_open_in text not null default 'modern',
  auto_created boolean not null default false,
  set_up_at timestamptz,
  prompted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reader_profiles_handle_format') then
    alter table public.reader_profiles add constraint reader_profiles_handle_format
      check (handle ~ '^[a-z0-9_.]{3,20}$' and handle ~ '[a-z0-9]');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reader_profiles_name_length') then
    alter table public.reader_profiles add constraint reader_profiles_name_length
      check (char_length(btrim(display_name)) between 1 and 40);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reader_profiles_picture_kind') then
    alter table public.reader_profiles add constraint reader_profiles_picture_kind
      check (picture_kind in ('set', 'cover', 'initial', 'google', 'upload'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reader_profiles_background_kind') then
    alter table public.reader_profiles add constraint reader_profiles_background_kind
      check (background_kind in ('library', 'set', 'upload'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reader_profiles_reviews') then
    alter table public.reader_profiles add constraint reader_profiles_reviews
      check (picture_review in ('none', 'pending', 'approved', 'rejected')
         and background_review in ('none', 'pending', 'approved', 'rejected'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reader_profiles_visibility') then
    alter table public.reader_profiles add constraint reader_profiles_visibility
      check (visibility in ('only_me', 'friends', 'everyone'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'reader_profiles_new_books') then
    alter table public.reader_profiles add constraint reader_profiles_new_books
      check (new_books_open_in in ('modern', 'human'));
  end if;
end $$;

-- Handles are stored lower-case; one reader per handle.
create unique index if not exists reader_profiles_handle_key on public.reader_profiles (handle);
-- The admin upload queue (ship 3) reads pending reviews.
create index if not exists reader_profiles_pending_review on public.reader_profiles (updated_at)
  where picture_review = 'pending' or background_review = 'pending';

alter table public.reader_profiles enable row level security;
drop policy if exists reader_profiles_select_own on public.reader_profiles;
create policy reader_profiles_select_own on public.reader_profiles
  for select to authenticated using (auth.uid() = id);
revoke all on public.reader_profiles from anon, authenticated;
grant select on public.reader_profiles to authenticated;
grant all on public.reader_profiles to service_role;

-- 3. Follows and blocks ----------------------------------------------------
create table if not exists public.follows (
  follower uuid not null references auth.users(id) on delete cascade,
  followed uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, followed),
  constraint follows_not_self check (follower <> followed)
);
create index if not exists follows_followed on public.follows (followed);

create table if not exists public.blocks (
  blocker uuid not null references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  constraint blocks_not_self check (blocker <> blocked)
);
create index if not exists blocks_blocked on public.blocks (blocked);

alter table public.follows enable row level security;
alter table public.blocks enable row level security;
drop policy if exists follows_select_own on public.follows;
create policy follows_select_own on public.follows
  for select to authenticated using (auth.uid() = follower or auth.uid() = followed);
-- A reader sees whom they blocked, never who blocked them.
drop policy if exists blocks_select_own on public.blocks;
create policy blocks_select_own on public.blocks
  for select to authenticated using (auth.uid() = blocker);
revoke all on public.follows from anon, authenticated;
revoke all on public.blocks from anon, authenticated;
grant select on public.follows to authenticated;
grant select on public.blocks to authenticated;
grant all on public.follows to service_role;
grant all on public.blocks to service_role;

-- 4. The public card view (service role only) ------------------------------
-- Each reader's own choices, applied once, here:
--   * Only me never appears;
--   * Everyone counts as Friends until the email is confirmed;
--   * an uploaded picture or background appears only once approved.
-- The viewer's relationship (friend, follower, stranger, blocked) is applied
-- by the Worker (app/src/social/profileRules.ts publicProfileView).
drop view if exists public.public_profile_cards;
create view public.public_profile_cards
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
  rp.on_leaderboard
from public.reader_profiles rp
join public.profiles p on p.id = rp.id
where rp.visibility <> 'only_me';

revoke all on public.public_profile_cards from anon, authenticated;
grant select on public.public_profile_cards to service_role;
