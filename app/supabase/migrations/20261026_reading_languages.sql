-- Approved in PROFILE-FLOW-BRIEF.md, 22 October. Owner-only preference;
-- deliberately excluded from public_profile_cards. Existing export/delete
-- cover reader_profiles as a whole.
ALTER TABLE public.reader_profiles
  ADD COLUMN IF NOT EXISTS reading_languages text[] NOT NULL DEFAULT ARRAY['en']::text[];
ALTER TABLE public.reader_profiles DROP CONSTRAINT IF EXISTS reader_profiles_reading_languages_check;
ALTER TABLE public.reader_profiles ADD CONSTRAINT reader_profiles_reading_languages_check
  CHECK (reading_languages IN (ARRAY['en']::text[], ARRAY['da']::text[], ARRAY['en','da']::text[], ARRAY['da','en']::text[]));
