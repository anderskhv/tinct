-- Recognising the text of a scanned own PDF (xAI vision) is metered as its own
-- feature, 'ocr' (app/src/worker/ownOcrCoordinator.ts), and is never charged
-- against an AI allowance: it has its own page and dollar ceilings
-- (app/src/worker/lib/ownOcr.ts).
--
-- RUN BEFORE TURNING OWN_PDF_OCR ON (app/wrangler.jsonc). Until then the
-- Worker's best-effort ledger write for 'ocr' fails and is logged, nothing else.
--
-- The excluded list equals NEVER_CHARGED_AI_FEATURES in
-- app/src/worker/lib/aiAllowance.ts (a test keeps the two identical).
-- Same ai_spend_micros signature and grants as 20261007_ai_allowance_never_charged.sql.
-- Idempotent: safe to run twice.
alter table public.ai_usage_events drop constraint if exists ai_usage_events_feature_check;
alter table public.ai_usage_events add constraint ai_usage_events_feature_check check (feature in (
  'chat', 'explain', 'librarian', 'recap', 'chapter_notes', 'catch_up', 'lab_chat', 'talk',
  'narration_generate', 'narration_listen', 'source_search', 'dictation', 'ocr'
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
    and e.feature not in ('narration_listen', 'narration_generate', 'dictation', 'ocr')
$$;

revoke all on function public.ai_spend_micros(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.ai_spend_micros(uuid, timestamptz, timestamptz) to service_role;
