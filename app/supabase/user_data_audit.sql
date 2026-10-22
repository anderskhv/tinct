-- Audit trail for critical user_data writes.
-- Run in Supabase SQL editor before relying on client-side audit inserts.
-- Since 22 Oct 2026 (migrations/20261022_disk_io_audit.sql) the rows are
-- written by a trigger on user_data, hold only what a write changed, and
-- clients can no longer insert them; they are kept for one month.

CREATE TABLE IF NOT EXISTS public.user_data_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_data_audit_user_created
  ON public.user_data_audit(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_data_audit_key_created
  ON public.user_data_audit(key, created_at DESC);

ALTER TABLE public.user_data_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_data_audit_insert ON public.user_data_audit
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_data_audit_select ON public.user_data_audit
  FOR SELECT USING (auth.uid() = user_id);
