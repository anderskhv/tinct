-- Run once with the profile-flow release, after its pre-deploy checks.
-- Every timestamp below comes from the same transaction start. Existing paid
-- access (including canceled but still paid-through plans), internal accounts,
-- and synthetic test accounts are untouched. Re-running during the grant is
-- a no-op because the resulting paid-through period is already in the future.
BEGIN;
WITH eligible AS (
  SELECT p.id FROM public.profiles p
  LEFT JOIN public.reader_profiles r ON r.id = p.id
  WHERE NOT COALESCE(p.is_test, false)
    AND NOT COALESCE(r.internal, false)
    AND COALESCE(p.subscription_status, '') NOT IN ('active', 'trialing', 'past_due', 'unpaid', 'incomplete')
    AND NOT EXISTS (SELECT 1 FROM public.user_data d WHERE d.user_id = p.id AND d.key = 'premium-first-month-2026-10')
    AND (p.subscription_period_end IS NULL OR p.subscription_period_end <= transaction_timestamp())
  FOR UPDATE OF p
), granted AS (
  UPDATE public.profiles p SET
    subscription_status = 'canceled',
    subscription_period_end = transaction_timestamp() + interval '30 days',
    period_start = transaction_timestamp(),
    messages_used_this_period = 0,
    ai_period_start = transaction_timestamp(),
    ai_period_allowance_micros = 3000000,
    ai_period_drawn_micros = 0
  FROM eligible e WHERE p.id = e.id
  RETURNING p.id
), receipts AS (
  INSERT INTO public.user_data (user_id, key, value)
  SELECT id, 'premium-first-month-2026-10', jsonb_build_object('startsAt', transaction_timestamp(), 'expiresAt', transaction_timestamp() + interval '30 days') FROM granted
  RETURNING user_id
)
SELECT count(*) AS accounts_changed, transaction_timestamp() AS starts_at,
  transaction_timestamp() + interval '30 days' AS expires_at FROM receipts;
COMMIT;
