-- Premium for life by grant (Anders, 25-26 Nov 2026; schema change approved).
--
-- The launch promise: "The first 30 readers who sign up and finish a chapter
-- get the AI features free for life." A grant on the profile gives an account
-- Premium's AI allowance, renewing monthly from the grant date, for as long as
-- the account exists. It is not a subscription: subscription_status, Stripe,
-- payments and the conversion events never change, so it never counts as
-- paying anywhere.
--
-- ANDERS RUNS THIS BY HAND in the Supabase SQL editor. The Worker reads the
-- columns when they exist and behaves exactly as before while they do not
-- (lib/aiAllowance.ts fetchEntitlementProfile), so it may run before or after
-- the code is released. Granting is a separate UPDATE Anders runs himself;
-- there is no admin UI and no route that writes these columns.
--
-- Idempotent: safe to run more than once.
--
-- Columns
--   premium_grant       the grant's name, e.g. 'launch-2026-11'; null = none
--   premium_granted_at  when it was given; the monthly allowance resets from it
-- Both are set or both are null.
--
-- Who can write them
--   Only the service role (the Worker, which never writes them) and the SQL
--   editor (postgres). profiles has row-level security with a select-own
--   policy and no insert or update policy, so a signed-in reader cannot write
--   any column of their row today, ai_credit_micros and the Stripe columns
--   included. The trigger below makes that true for the grant whatever
--   policies or grants are added later: a statement run as anon or
--   authenticated that sets or changes either column is refused.

-- 1. Columns ----------------------------------------------------------------
alter table public.profiles add column if not exists premium_grant text;
alter table public.profiles add column if not exists premium_granted_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_premium_grant_pair') then
    alter table public.profiles add constraint profiles_premium_grant_pair
      check ((premium_grant is null) = (premium_granted_at is null));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_premium_grant_name') then
    alter table public.profiles add constraint profiles_premium_grant_name
      check (premium_grant is null or premium_grant ~ '^[a-z0-9][a-z0-9-]{0,63}$');
  end if;
end $$;

-- 2. Readers can never grant themselves -------------------------------------
-- Not security definer: current_user is the role running the statement
-- (PostgREST sets anon or authenticated for browser requests).
create or replace function public.protect_premium_grant()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user in ('anon', 'authenticated') then
    if tg_op = 'INSERT' then
      if new.premium_grant is not null or new.premium_granted_at is not null then
        raise exception 'premium_grant is set by Tinct only' using errcode = '42501';
      end if;
    elsif new.premium_grant is distinct from old.premium_grant
       or new.premium_granted_at is distinct from old.premium_granted_at then
      raise exception 'premium_grant is set by Tinct only' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.protect_premium_grant() from public, anon, authenticated;

drop trigger if exists profiles_protect_premium_grant on public.profiles;
create trigger profiles_protect_premium_grant
  before insert or update of premium_grant, premium_granted_at on public.profiles
  for each row execute function public.protect_premium_grant();

-- 3. Check (read-only): the trigger exists and no policy lets a reader write profiles.
select
  exists (select 1 from pg_trigger where tgname = 'profiles_protect_premium_grant' and not tgisinternal) as grant_protected,
  coalesce((select string_agg(policyname || ':' || cmd, ', ') from pg_policies
            where schemaname = 'public' and tablename = 'profiles' and cmd <> 'SELECT'), 'none') as profile_write_policies;
