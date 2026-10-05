-- ai_cost_by_user_month gains columns for the features split out of 'recap'
-- on 2026-10-05 (chapter_notes, catch_up). New columns go at the end so
-- CREATE OR REPLACE VIEW can keep the existing ones.
create or replace view public.ai_cost_by_user_month
with (security_invoker = true) as
select
  coalesce(e.user_id::text, e.guest_key) as reader_key,
  e.user_id,
  e.guest_key,
  date_trunc('month', e.created_at)::date as month,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'chat'), 0) as chat_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'explain'), 0) as explain_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'librarian'), 0) as librarian_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'recap'), 0) as recap_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'lab_chat'), 0) as lab_chat_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'talk'), 0) as talk_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'narration_generate'), 0) as narration_generate_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'source_search'), 0) as source_search_usd,
  coalesce(sum(e.cost_usd), 0) as total_usd,
  coalesce(sum(e.seconds) filter (where e.feature = 'talk'), 0) / 60.0 as talk_minutes,
  coalesce(sum(e.seconds) filter (where e.feature = 'narration_listen'), 0) / 60.0 as listening_minutes,
  coalesce(sum(e.chars) filter (where e.feature = 'narration_generate' and e.cache_hit is not true), 0) as chars_generated,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'chapter_notes'), 0) as chapter_notes_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'catch_up'), 0) as catch_up_usd
from public.ai_usage_events e
group by coalesce(e.user_id::text, e.guest_key), e.user_id, e.guest_key, date_trunc('month', e.created_at)::date;
