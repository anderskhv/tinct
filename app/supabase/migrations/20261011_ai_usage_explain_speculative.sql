-- Explain fetched on speculation (the reader selected a passage; the answer is
-- readied before any tap, app/src/lab/LabApp.tsx speculateExplanation) is
-- metered as its own feature, 'explain_speculative', and never charged against
-- an AI allowance: it is Tinct's cost, not something the reader asked for. On
-- 10–11 October 2026 one reader's bar lost 18% to 124 such rows recorded as
-- 'explain'. A tapped Explain stays 'explain' and still counts.
--
-- Until this runs, the Worker's ledger write for 'explain_speculative' fails the
-- check constraint and is logged, nothing else; the reader's bar then simply does
-- not include speculation (the row is missing), which is the intended figure.
--
-- The excluded list equals NEVER_CHARGED_AI_FEATURES in
-- app/src/worker/lib/aiAllowance.ts (a test keeps the two identical).
-- Same ai_spend_micros signature and grants as 20261010_ai_usage_modern_edition.sql.
-- ai_cost_by_user_month gains explain_speculative_usd at the end (CREATE OR
-- REPLACE VIEW keeps the existing columns). Idempotent: safe to run twice.
alter table public.ai_usage_events drop constraint if exists ai_usage_events_feature_check;
alter table public.ai_usage_events add constraint ai_usage_events_feature_check check (feature in (
  'chat', 'explain', 'librarian', 'recap', 'chapter_notes', 'catch_up', 'lab_chat', 'talk',
  'narration_generate', 'narration_listen', 'source_search', 'dictation', 'ocr', 'modern_edition', 'explain_speculative'
));

create or replace function public.ai_spend_micros(p_user uuid, p_since timestamptz, p_until timestamptz default null)
returns bigint
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(round(sum(e.cost_usd) * 1000000), 0)::bigint
  from public.ai_usage_events e
  where e.user_id = p_user
    and e.created_at >= p_since
    and (p_until is null or e.created_at < p_until)
    and e.feature not in ('narration_listen', 'narration_generate', 'dictation', 'ocr', 'modern_edition', 'explain_speculative')
$$;

revoke all on function public.ai_spend_micros(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.ai_spend_micros(uuid, timestamptz, timestamptz) to service_role;

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
  coalesce(sum(e.cost_usd) filter (where e.feature = 'catch_up'), 0) as catch_up_usd,
  coalesce(sum(e.cost_usd) filter (where e.feature = 'explain_speculative'), 0) as explain_speculative_usd
from public.ai_usage_events e
group by coalesce(e.user_id::text, e.guest_key), e.user_id, e.guest_key, date_trunc('month', e.created_at)::date;
