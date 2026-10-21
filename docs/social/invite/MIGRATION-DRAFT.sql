-- ============================================================================
-- DRAFT, NOT APPLIED, NOT APPROVED. 21 October 2026.
-- Proposed for docs/social/INVITE-BY-EMAIL.md ("Invite a friend by email").
-- A schema change: it needs Anders's approval before it is copied to
-- app/supabase/migrations/ (suggested name: 2026MMDD_invites.sql) and run.
-- ============================================================================
--
-- Invites by email (social; brief of 16 October 2026). Behind a new Worker var
-- (suggested INVITE_EMAILS = "1", which needs SOCIAL_FRIENDS and
-- SOCIAL_PROFILES). With the var off nothing reads or writes these objects.
-- With the var on and this file not yet run, the invite routes answer
-- "unavailable" and nothing else changes.
--
-- ANDERS RUNS THIS BY HAND, after 20261008_profiles.sql (follows, blocks,
-- reader_profiles) and 20261008_social.sql. Idempotent: safe to run more than
-- once.
--
-- Shape
--   * invites: one row per invite a reader sends. Who sent it, the invited
--     address (raw, only while the invite is open), a keyed hash of the address
--     (kept, for the 14-day rule and the inviter's list), the suggested book,
--     the note, a hash of the link's token (the token itself is never stored),
--     when it was sent and expires, and who accepted it and when.
--   * invite_suppressions: addresses that asked never to be invited ("Never
--     send me invites"), by keyed hash only. Every send checks it.
--   * reserve_invite(): the send-time checks and the insert, under one lock per
--     inviter, so two quick sends can never both pass the limits.
--   * accept_invite(): the join-time checks and BOTH follows in one
--     transaction, so the pair are friends at once and no follow request is
--     ever visible in between (follow requests, 19 Oct 2026, are simply
--     one-way rows in public.follows; there is no separate request table).
--   * purge_invite_personal_data(): the retention step the Worker's retention
--     cron calls daily (app/src/worker/routes/retention.ts).
--
-- Hashes
--   * email_hash: lower-case hex HMAC-SHA256 of the normalised address
--     (trimmed, lower-cased) with a new Worker secret INVITE_HASH_SECRET. Keyed,
--     so the table cannot be reversed with a list of known addresses. The
--     secret must never be rotated: suppressions are only found through it.
--     (links.ts emailHash() is an unkeyed 16-hex prefix and is NOT reused here.)
--   * token_hash: lower-case hex SHA-256 of the link token (32 random bytes,
--     base64url in the link). Unkeyed is fine: the token is random.
--
-- Retention (privacy notice, see PRIVACY-DRAFT.md)
--   * the raw address is cleared the moment the invite is accepted (in
--     accept_invite, and enforced by a check constraint) or when it expires
--     (purge_invite_personal_data, daily);
--   * the note is cleared 7 days after acceptance (the arrival card has shown
--     it by then) or at expiry;
--   * the whole row is deleted 12 months after sent_at by the existing
--     retention job (add { table: 'invites', column: 'sent_at', months: 12 } to
--     RETENTION_TABLES);
--   * suppressions are kept until the person asks for removal: keeping the
--     hash is what honours the request;
--   * rows go with the inviter's account (ON DELETE CASCADE); a deleted
--     accepter leaves the row with accepted_by NULL.
--
-- Row-level security: both tables have RLS on and no policies, so only the
-- service role (the Worker) reads or writes them, as for email_log and
-- profile_reports. Readers see their own invites only through the Worker.

-- 1. Invites ----------------------------------------------------------------
create table if not exists public.invites (
  id bigint generated always as identity primary key,
  inviter uuid not null references auth.users(id) on delete cascade,
  -- The invited address, normalised. NULL once accepted or expired.
  email text check (email is null or (char_length(email) between 3 and 254 and email = lower(btrim(email)))),
  email_hash text not null check (email_hash ~ '^[0-9a-f]{64}$'),
  -- A catalogue book id (never an uploaded book). NULL: no book suggested.
  book_id text check (book_id is null or book_id ~ '^[a-z0-9-]{1,80}$'),
  -- Plain text, links stripped and word-filtered by the Worker. NULL: no note.
  note text check (note is null or char_length(note) between 1 and 280),
  token_hash text not null check (token_hash ~ '^[0-9a-f]{64}$'),
  -- pending: reserved, Brevo not yet answered (the row is deleted if Brevo
  -- refuses); sent: Brevo accepted it; withheld: deliberately not emailed
  -- (only if Anders chooses silent handling of a blocked pair, see
  -- OPEN-QUESTIONS.md); the inviter's list shows withheld as Sent.
  delivery text not null default 'pending' check (delivery in ('pending', 'sent', 'withheld')),
  sent_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days'),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  -- The "X joined from your invite" email to the inviter, once.
  joined_notified_at timestamptz,
  constraint invites_expiry_after_send check (expires_at > sent_at),
  constraint invites_accept_pair check (accepted_by is null or accepted_at is not null),
  -- The raw address never outlives acceptance.
  constraint invites_no_email_after_accept check (accepted_at is null or email is null),
  constraint invites_not_self check (accepted_by is null or accepted_by <> inviter)
);

create unique index if not exists invites_token_hash_key on public.invites (token_hash);
-- Your invites, and the 10-a-day / 50-a-month counts.
create index if not exists invites_inviter_sent_idx on public.invites (inviter, sent_at desc);
-- One invite per address per inviter every 14 days.
create index if not exists invites_inviter_email_idx on public.invites (inviter, email_hash, sent_at desc);
-- "Joined from your invite" for 7 days, and the accepter's own arrival card.
create index if not exists invites_accepted_by_idx on public.invites (accepted_by, accepted_at desc) where accepted_by is not null;
-- The daily purge of open rows past expiry.
create index if not exists invites_open_expiry_idx on public.invites (expires_at) where email is not null or note is not null;
-- The retention job reads by sent_at.
create index if not exists invites_sent_at_idx on public.invites (sent_at);

alter table public.invites enable row level security;
revoke all on public.invites from anon, authenticated;
grant all on public.invites to service_role;

-- 2. Suppressions -----------------------------------------------------------
create table if not exists public.invite_suppressions (
  email_hash text primary key check (email_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  -- link: the email's "Never send me invites"; request: written to contact@;
  -- bounce: a hard bounce or spam complaint reported by Brevo (optional).
  source text not null default 'link' check (source in ('link', 'request', 'bounce'))
);

alter table public.invite_suppressions enable row level security;
revoke all on public.invite_suppressions from anon, authenticated;
grant all on public.invite_suppressions to service_role;

-- 3. Sending: checks and insert under one lock per inviter -------------------
-- Results: ok | suppressed | already_invited | daily_limit | monthly_limit.
-- "Profile set up", "own address", note filtering, the catalogue check on
-- book_id and the internal/test exemption (p_exempt) are decided by the Worker
-- before it calls this. The Worker sends the email after 'ok', then sets
-- delivery = 'sent', or deletes the row if Brevo refuses (as email_log does).
create or replace function public.reserve_invite(
  p_inviter uuid,
  p_email text,
  p_email_hash text,
  p_token_hash text,
  p_book_id text,
  p_note text,
  p_exempt boolean default false,
  p_daily_max integer default 10,
  p_monthly_max integer default 50,
  p_repeat_days integer default 14,
  p_valid_days integer default 30
)
returns table (result text, invite_id bigint, earlier_sent_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_earlier timestamptz;
  v_id bigint;
begin
  perform pg_advisory_xact_lock(hashtextextended('invite:' || p_inviter::text, 0));

  if exists (select 1 from public.invite_suppressions s where s.email_hash = p_email_hash) then
    return query select 'suppressed'::text, null::bigint, null::timestamptz;
    return;
  end if;

  select max(i.sent_at) into v_earlier
    from public.invites i
   where i.inviter = p_inviter
     and i.email_hash = p_email_hash
     and i.sent_at > v_now - make_interval(days => p_repeat_days);
  if v_earlier is not null then
    return query select 'already_invited'::text, null::bigint, v_earlier;
    return;
  end if;

  if not p_exempt then
    if (select count(*) from public.invites i where i.inviter = p_inviter and i.sent_at > v_now - interval '24 hours') >= p_daily_max then
      return query select 'daily_limit'::text, null::bigint, null::timestamptz;
      return;
    end if;
    if (select count(*) from public.invites i where i.inviter = p_inviter and i.sent_at > v_now - interval '30 days') >= p_monthly_max then
      return query select 'monthly_limit'::text, null::bigint, null::timestamptz;
      return;
    end if;
  end if;

  insert into public.invites (inviter, email, email_hash, book_id, note, token_hash, sent_at, expires_at)
  values (p_inviter, lower(btrim(p_email)), p_email_hash, p_book_id, nullif(btrim(p_note), ''), p_token_hash, v_now, v_now + make_interval(days => p_valid_days))
  returning id into v_id;

  return query select 'ok'::text, v_id, null::timestamptz;
end;
$$;

revoke all on function public.reserve_invite(uuid, text, text, text, text, text, boolean, integer, integer, integer, integer) from public, anon, authenticated;
grant execute on function public.reserve_invite(uuid, text, text, text, text, text, boolean, integer, integer, integer, integer) to service_role;

-- 4. Accepting: both follows in one transaction --------------------------------
-- Returns jsonb { result, inviter, book_id, note }.
-- result: ok | invalid | used | expired | self | blocked.
-- The Worker answers invalid, used and expired alike ("This invite has
-- expired"), and blocked like a plain sign-in (no card, no follow, no reason).
-- A self or blocked accept leaves the invite open (it simply expires), so the
-- inviter's list never shows "Joined" for it.
-- Called only from POST /api/invites/accept by a signed-in reader, never on a
-- GET of the join page (link scanners must not consume a token).
create or replace function public.accept_invite(p_token_hash text, p_user uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_invite public.invites%rowtype;
begin
  select * into v_invite from public.invites where token_hash = p_token_hash for update;
  if not found then
    return jsonb_build_object('result', 'invalid');
  end if;
  if v_invite.accepted_at is not null then
    return jsonb_build_object('result', 'used');
  end if;
  if v_invite.expires_at <= v_now then
    return jsonb_build_object('result', 'expired');
  end if;
  if v_invite.inviter = p_user then
    return jsonb_build_object('result', 'self');
  end if;
  if exists (
    select 1 from public.blocks b
     where (b.blocker = v_invite.inviter and b.blocked = p_user)
        or (b.blocker = p_user and b.blocked = v_invite.inviter)
  ) then
    return jsonb_build_object('result', 'blocked');
  end if;

  -- Both directions at once: no one-way row (a "request") is ever visible.
  -- An existing one-way follow either way is simply completed.
  insert into public.follows (follower, followed, created_at)
  values (v_invite.inviter, p_user, v_now), (p_user, v_invite.inviter, v_now)
  on conflict (follower, followed) do nothing;

  update public.invites
     set accepted_by = p_user,
         accepted_at = v_now,
         email = null
   where id = v_invite.id;

  return jsonb_build_object(
    'result', 'ok',
    'inviter', v_invite.inviter,
    'book_id', v_invite.book_id,
    'note', v_invite.note
  );
end;
$$;

revoke all on function public.accept_invite(text, uuid) from public, anon, authenticated;
grant execute on function public.accept_invite(text, uuid) to service_role;

-- 5. Retention ------------------------------------------------------------------
-- Daily, from the retention cron: clears the raw address of every expired
-- invite and the note of every invite accepted more than 7 days ago or
-- expired. Whole rows go after 12 months through RETENTION_TABLES.
create or replace function public.purge_invite_personal_data()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.invites
     set email = case when expires_at <= now() then null else email end,
         note = case when expires_at <= now() or accepted_at < now() - interval '7 days' then null else note end
   where (email is not null and expires_at <= now())
      or (note is not null and (expires_at <= now() or accepted_at < now() - interval '7 days'));
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.purge_invite_personal_data() from public, anon, authenticated;
grant execute on function public.purge_invite_personal_data() to service_role;

-- Not in this file, by design:
--   * no change to follows or blocks (follow requests have no table of their own);
--   * no change to reader_profiles defaults. The brief's new defaults (Friends
--     preselected, leaderboard on) are a sign-up page change, not a column
--     default, and existing accounts are not backfilled (OPEN-QUESTIONS.md).
