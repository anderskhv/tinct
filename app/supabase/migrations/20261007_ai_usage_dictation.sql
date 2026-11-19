-- Chat dictation (xAI speech-to-text) is metered as its own feature.
-- Cost ledger only: dictation never counts toward an AI allowance.
-- Run before deploying the Worker that writes it; until then the Worker's
-- best-effort ledger write for dictation fails and is logged, nothing else.
alter table public.ai_usage_events drop constraint if exists ai_usage_events_feature_check;
alter table public.ai_usage_events add constraint ai_usage_events_feature_check check (feature in (
  'chat', 'explain', 'librarian', 'recap', 'chapter_notes', 'catch_up', 'lab_chat', 'talk',
  'narration_generate', 'narration_listen', 'source_search', 'dictation'
));
