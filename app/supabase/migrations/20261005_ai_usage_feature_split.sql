-- Recap, chapter notes and Catch me up were all metered as 'recap'.
-- They get their own feature values so their use can be told apart.
-- Run before deploying the Worker that writes them.
alter table public.ai_usage_events drop constraint if exists ai_usage_events_feature_check;
alter table public.ai_usage_events add constraint ai_usage_events_feature_check check (feature in (
  'chat', 'explain', 'librarian', 'recap', 'chapter_notes', 'catch_up', 'lab_chat', 'talk',
  'narration_generate', 'narration_listen', 'source_search'
));
