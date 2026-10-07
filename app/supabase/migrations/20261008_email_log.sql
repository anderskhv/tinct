-- Lifecycle emails (social brief, ship 4; schema approved by Anders 2026-10-07):
-- an email send log and an opt-out flag on the profile.
--
-- 1. public.email_log: one row per email the Worker sends from the lifecycle
--    engine (docs/lifecycle-emails/README.md): who, which template, which book,
--    when. It is the idempotency record ("never send the same template/book
--    pair twice"), the frequency record ("at most one lifecycle email every
--    3 days") and the "ignored keep-reading" record. The Worker reserves a
--    row BEFORE it sends (unique per reader + dedupe_key, so two cron runs can
--    never both send) and removes the reservation if Brevo refuses the email.
--    No email body, address or reading content is stored.
-- 2. public.profiles.email_opt_out_at: set by the one-click unsubscribe link
--    and the List-Unsubscribe-Post header. Unsubscribing also clears
--    email_opt_in (20261002_privacy_consent.sql); an opt-in given later than
--    the opt-out (from account settings) switches reading emails back on.
--
-- Rows go with the account (ON DELETE CASCADE). Only the service role reads or
-- writes the log (RLS on, no policies); readers never see it.
-- Self-contained and idempotent: safe to run twice. The Worker treats a missing
-- table as "lifecycle emails unavailable" and sends nothing from the engine,
-- so the code may be deployed before this runs.

create table if not exists public.email_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  -- welcome, welcome-google, keep-reading, keep-reading-with-question,
  -- next-book, next-book-classic-lead, trial-ending, trial-ended, announce.
  template text not null check (template ~ '^[a-z][a-z0-9-]{1,40}$'),
  -- The book the email is about (keep-reading: the book; next-book: the book
  -- the reader finished or stalled in). NULL for emails about no book.
  book_id text check (book_id is null or book_id ~ '^[a-z0-9-]{1,80}$'),
  -- Idempotency key, unique per reader: "<template family>:<book or ->[:<episode>]".
  dedupe_key text not null check (char_length(dedupe_key) <= 200),
  sent_at timestamptz not null default now(),
  -- Small non-personal facts about the send (e.g. the next-book target id,
  -- the finished/stalled opening, the announcement campaign).
  meta jsonb not null default '{}'::jsonb,
  unique (user_id, dedupe_key)
);

create index if not exists email_log_user_sent_idx
  on public.email_log (user_id, sent_at desc);

alter table public.email_log enable row level security;
-- No policies: only the service role (which bypasses RLS) reads or writes.
revoke all on public.email_log from anon, authenticated;

alter table public.profiles add column if not exists email_opt_out_at timestamptz;
