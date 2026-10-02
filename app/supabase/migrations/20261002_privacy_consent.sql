-- 2026-10-02 privacy fixes (privacy notice review). Safe to run more than once.
--
-- 1. Email consent. Sign-up carries an unticked "email me" choice in the auth
--    user's metadata (`email_opt_in`); the profile records it with the time it
--    was given. The lifecycle emails go only to profiles with consent.
-- 2. Analytics rows may name only their own author: a browser can no longer
--    insert an event under another reader's user id.
-- 3. Two balance functions from the original schema are no longer used by
--    the app and are removed.

-- 1. Email consent ---------------------------------------------------------
alter table public.profiles add column if not exists email_opt_in boolean not null default false;
alter table public.profiles add column if not exists email_opt_in_at timestamptz;

-- Recorded by its own trigger after the profile row exists, so the existing
-- profile-creation trigger (on_auth_user_created) is left exactly as it is.
-- Trigger order is alphabetical; this name sorts after on_auth_user_created.
create or replace function public.record_email_consent()
returns trigger as $$
begin
  if coalesce((new.raw_user_meta_data ->> 'email_opt_in')::boolean, false) then
    update public.profiles set email_opt_in = true, email_opt_in_at = now() where id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function public.record_email_consent() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_consent on auth.users;
create trigger on_auth_user_created_consent
  after insert on auth.users
  for each row execute function public.record_email_consent();

-- Choices made before this migration ran (the app ships first) are already in
-- the sign-up metadata; carry them onto the profile.
update public.profiles p
   set email_opt_in = true, email_opt_in_at = coalesce(p.email_opt_in_at, u.created_at)
  from auth.users u
 where u.id = p.id
   and coalesce((u.raw_user_meta_data ->> 'email_opt_in')::boolean, false)
   and not p.email_opt_in;

-- 2. Analytics inserts carry no one else's user id -------------------------
drop policy if exists analytics_insert_any on public.analytics_events;
drop policy if exists analytics_insert_own on public.analytics_events;
create policy analytics_insert_own
  on public.analytics_events
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- 3. Unused balance functions ----------------------------------------------
drop function if exists public.deduct_balance(uuid, numeric, integer, integer, text, text, integer);
drop function if exists public.credit_balance(uuid, numeric);
