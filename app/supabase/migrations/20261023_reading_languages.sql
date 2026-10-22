-- The languages a reader reads in (Anders approved the schema change with the
-- profile-flow brief, 22 Oct 2026: docs/social/PROFILE-FLOW-BRIEF.md on
-- claude/dreamy-faraday-30zl0v).
--
-- ANDERS RUNS THIS BY HAND, before or after the code is deployed. Until it has
-- run, the Worker reads and saves profiles without the column (every reader
-- reads in English) and keeps working; the reader's choice stays on the device.
--
-- Idempotent: safe to run more than once.
--
--   reader_profiles.reading_languages: English ('en') and/or Danish ('da'), at
--   least one, default {en}. Chosen at the sign-up reading step and in
--   Settings, "I read in". What it does now: a reader who chose Dansk sees the
--   offered Danish editions first. Owner-only like the rest of the row (the
--   table's existing row-level security); in the account export and deleted
--   with the account (the row already is).

alter table public.reader_profiles add column if not exists reading_languages text[] not null default '{en}';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'reader_profiles_reading_languages') then
    alter table public.reader_profiles add constraint reader_profiles_reading_languages
      check (cardinality(reading_languages) between 1 and 2 and reading_languages <@ array['en', 'da']::text[]);
  end if;
end $$;
