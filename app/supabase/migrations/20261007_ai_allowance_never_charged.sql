-- AI allowance: features that are never charged (Anders, 2026-10-06).
--
-- RUN BEFORE TURNING THE ALLOWANCE ON (AI_ALLOWANCE_ENFORCED in
-- app/src/aiAllowanceSwitch.ts). Nothing reads this while the switch is off.
--
-- 20261005_ai_allowance.sql (already run) leaves narration out of the spend
-- that counts against the allowance. Chat dictation (xAI speech-to-text,
-- ledger feature 'dictation', added by 20261007_ai_usage_dictation.sql on the
-- dictation branch) is never charged either, so it is left out here too.
-- The list equals NEVER_CHARGED_AI_FEATURES in
-- app/src/worker/lib/aiAllowance.ts (a test keeps the two identical).
--
-- Only the body of ai_spend_micros changes: same signature, same grants.
-- Idempotent: safe to run twice, and safe before or after the dictation
-- migration (a feature name that never occurs excludes nothing).

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
    and e.feature not in ('narration_listen', 'narration_generate', 'dictation')
$$;

revoke all on function public.ai_spend_micros(uuid, timestamptz, timestamptz) from public, anon, authenticated;
grant execute on function public.ai_spend_micros(uuid, timestamptz, timestamptz) to service_role;
