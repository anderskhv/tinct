-- Reading-email opt-out flag and email send log (approved by Anders for
-- social ship 4, created now so ship 4 needs no further SQL).
--
-- ANDERS RUNS THIS BY HAND, any time after 20261008_profiles.sql. Nothing in
-- ship 2 reads or writes these objects; ship 4 sends the welcome and reading
-- emails and records every send here (docs/lifecycle-emails/README.md:
-- "log every send (user, template, book, sent_at) and never send the same
-- template/book pair twice").
--
-- Idempotent: safe to run more than once.

-- One-click "Stop reading emails": the time the reader opted out. Opting out
-- also sets email_opt_in = false; this column keeps when it happened.
alter table public.profiles add column if not exists email_unsubscribed_at timestamptz;

create table if not exists public.email_sends (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  template text not null,
  book_id text,
  sent_at timestamptz not null default now(),
  provider_message_id text
);

-- Never the same template/book pair twice for one reader.
create unique index if not exists email_sends_once
  on public.email_sends (user_id, template, coalesce(book_id, ''));
create index if not exists email_sends_recent on public.email_sends (user_id, sent_at desc);

alter table public.email_sends enable row level security;
drop policy if exists email_sends_select_own on public.email_sends;
create policy email_sends_select_own on public.email_sends
  for select to authenticated using (auth.uid() = user_id);
revoke all on public.email_sends from anon, authenticated;
grant select on public.email_sends to authenticated;
grant all on public.email_sends to service_role;
grant usage, select on sequence public.email_sends_id_seq to service_role;
