-- Security hardening for public launch.
-- Run in Supabase SQL editor after the message-billing migration.

-- Billing RPCs are only called by the Cloudflare Worker with the service role.
-- They should not be callable by browser clients using anon/authenticated JWTs.
REVOKE ALL ON FUNCTION public.use_message(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.credit_messages(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.reset_monthly_messages(uuid) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.use_message(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.credit_messages(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.reset_monthly_messages(uuid) TO service_role;

-- SECURITY DEFINER functions should resolve unqualified names inside public,
-- not through a caller-controlled search_path.
ALTER FUNCTION public.use_message(uuid) SET search_path = public;
ALTER FUNCTION public.credit_messages(uuid, integer) SET search_path = public;
ALTER FUNCTION public.reset_monthly_messages(uuid) SET search_path = public;

-- The issue anomaly function is internal/admin-facing. Keep it off public
-- roles unless a dedicated admin client path explicitly needs it later.
REVOKE ALL ON FUNCTION public.issue_anomalies(timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.issue_anomalies(timestamptz) TO service_role;
ALTER FUNCTION public.issue_anomalies(timestamptz) SET search_path = public;
