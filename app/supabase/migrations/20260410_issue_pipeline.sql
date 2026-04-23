-- Issue Pipeline Tables
-- Run in Supabase SQL Editor to set up the auto-fix pipeline.

-- ============================================================
-- issue_reports — user-submitted text error reports
-- ============================================================
CREATE TABLE IF NOT EXISTS public.issue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  book_id TEXT NOT NULL,
  edition_key TEXT NOT NULL DEFAULT '',
  chapter_number INTEGER NOT NULL DEFAULT 0,
  paragraph_index INTEGER NOT NULL DEFAULT 0,
  selected_text TEXT NOT NULL DEFAULT '',
  tag TEXT NOT NULL DEFAULT '',
  comment TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  rewarded BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_issue_reports_status ON public.issue_reports(status);
CREATE INDEX IF NOT EXISTS idx_issue_reports_book_chapter ON public.issue_reports(book_id, chapter_number);

ALTER TABLE public.issue_reports ENABLE ROW LEVEL SECURITY;

-- Drop the broken policy
DROP POLICY IF EXISTS "Service role only" ON public.issue_reports;

-- Users can read their own reports (future "my reports" UI)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'issue_reports' AND policyname = 'Users read own reports'
  ) THEN
    CREATE POLICY "Users read own reports"
      ON public.issue_reports
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Service role bypasses RLS automatically — no explicit policy needed.

-- ============================================================
-- edition_patches — auto-applied text corrections (public read)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.edition_patches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL,
  edition_key TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  paragraph_index INTEGER NOT NULL,
  original_text TEXT,
  patched_text TEXT NOT NULL,
  issue_report_id UUID REFERENCES public.issue_reports(id) ON DELETE SET NULL,
  applied_by TEXT DEFAULT 'claude-auto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (book_id, edition_key, chapter_number, paragraph_index)
);

ALTER TABLE public.edition_patches ENABLE ROW LEVEL SECURITY;

-- Public read (client fetches patches at edition load, no auth required)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public'
      AND tablename = 'edition_patches' AND policyname = 'Public read patches'
  ) THEN
    CREATE POLICY "Public read patches"
      ON public.edition_patches
      FOR SELECT
      USING (true);
  END IF;
END $$;

-- ============================================================
-- pending_audio_regen — queue for audio regeneration (internal)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pending_audio_regen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id TEXT NOT NULL,
  edition_key TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  paragraph_index INTEGER NOT NULL,
  patched_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (book_id, edition_key, chapter_number, paragraph_index)
);

ALTER TABLE public.pending_audio_regen ENABLE ROW LEVEL SECURITY;

-- No public policies — only service role (worker + local script) accesses this.

-- ============================================================
-- Anomaly detection RPC function
-- ============================================================
CREATE OR REPLACE FUNCTION public.issue_anomalies(since_ts TIMESTAMPTZ)
RETURNS TABLE(book_id TEXT, chapter_number INT, n BIGINT) AS $$
  SELECT book_id, chapter_number, COUNT(*) as n
  FROM public.issue_reports
  WHERE created_at > since_ts
  GROUP BY book_id, chapter_number
  HAVING COUNT(*) >= 3;
$$ LANGUAGE sql SECURITY DEFINER;
