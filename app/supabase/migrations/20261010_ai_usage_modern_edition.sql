-- Writing a paid Modern English edition (xAI, app/src/worker/lib/modernEdition.ts)
-- is metered as its own feature, 'modern_edition': one row per chunk, settled on
-- xAI's reported cost. It is Tinct's own cost (the edition is bought once through
-- Stripe), so the row has no user_id and no guest_key, and it is never charged
-- against an AI allowance.
--
-- Until this runs, the Worker's best-effort ledger write for 'modern_edition'
-- fails the check constraint and is logged, nothing else: the edition job's own
-- costUsd and the monthly ceiling (MODERN_EDITION_MONTHLY_USD) do not depend on it.
--
-- The excluded list equals NEVER_CHARGED_AI_FEATURES in
-- app/src/worker/lib/aiAllowance.ts (a test keeps the two identical).
-- Same ai_spend_micros signature and grants as 20261009_ai_usage_ocr.sql.
-- Idempotent: safe to run twice.
alter table public.ai_usage_events drop constraint if exists ai_usage_events_feature_check;
alter table public.ai_usage_events add constraint ai_usage_events_feature_check check (feature in (
  'chat', 'explain', 'librarian', 'recap', 'chapter_notes', 'catch_up', 'lab_chat', 'talk',
  'narration_generate', 'narration_listen', 'source_search', 'dictation', 'ocr', 'modern_edition'
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
    and e.feature not in ('narration_listen', 'narration_generate', 'dictation', 'ocr', 'modern_edition')
$$;

revoke all on function public.ai_spend_micros(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.ai_spend_micros(uuid, timestamptz, timestamptz) to service_role;
