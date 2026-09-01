-- Durable, per-user reading memory. This is additive: the existing
-- reading-log:{bookId} user_data blobs remain the Feed/compatibility store.

CREATE TABLE IF NOT EXISTS public.reading_activity_sessions (
  session_id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL CHECK (char_length(book_id) BETWEEN 1 AND 160),
  chapter_number INTEGER NOT NULL CHECK (chapter_number > 0),
  edition_key TEXT NOT NULL CHECK (char_length(edition_key) BETWEEN 1 AND 160),
  mode TEXT NOT NULL CHECK (mode IN ('read', 'listened')),
  started_at TIMESTAMPTZ NOT NULL,
  last_active_at TIMESTAMPTZ NOT NULL,
  start_paragraph_index INTEGER CHECK (start_paragraph_index IS NULL OR start_paragraph_index >= 0),
  last_paragraph_index INTEGER CHECK (last_paragraph_index IS NULL OR last_paragraph_index >= 0),
  client_revision BIGINT NOT NULL DEFAULT 1 CHECK (client_revision > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (last_active_at >= started_at)
);

CREATE INDEX IF NOT EXISTS idx_reading_activity_user_time
  ON public.reading_activity_sessions(user_id, last_active_at DESC);

CREATE INDEX IF NOT EXISTS idx_reading_activity_user_book_time
  ON public.reading_activity_sessions(user_id, book_id, last_active_at DESC);

ALTER TABLE public.reading_activity_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY reading_activity_select_own ON public.reading_activity_sessions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY reading_activity_insert_own ON public.reading_activity_sessions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY reading_activity_update_own ON public.reading_activity_sessions
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.reading_activity_sessions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.reading_activity_sessions TO authenticated;

-- Upsert a client-owned session monotonically. Stable UUID + client_revision
-- makes retries idempotent; immutable tuple checks prevent a stale/colliding
-- request from turning one session into activity for another book or mode.
CREATE OR REPLACE FUNCTION public.record_reading_activity_session(
  p_session_id UUID,
  p_book_id TEXT,
  p_chapter_number INTEGER,
  p_edition_key TEXT,
  p_mode TEXT,
  p_started_at TIMESTAMPTZ,
  p_last_active_at TIMESTAMPTZ,
  p_start_paragraph_index INTEGER DEFAULT NULL,
  p_last_paragraph_index INTEGER DEFAULT NULL,
  p_client_revision BIGINT DEFAULT 1
)
RETURNS TABLE(
  session_id UUID,
  client_revision BIGINT,
  last_active_at TIMESTAMPTZ,
  applied BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  current_row public.reading_activity_sessions%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;
  IF p_chapter_number <= 0
     OR p_mode NOT IN ('read', 'listened')
     OR p_last_active_at < p_started_at
     OR p_client_revision <= 0
     OR (p_start_paragraph_index IS NOT NULL AND p_start_paragraph_index < 0)
     OR (p_last_paragraph_index IS NOT NULL AND p_last_paragraph_index < 0) THEN
    RAISE EXCEPTION 'invalid reading activity' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.reading_activity_sessions (
    session_id, user_id, book_id, chapter_number, edition_key, mode,
    started_at, last_active_at, start_paragraph_index,
    last_paragraph_index, client_revision
  ) VALUES (
    p_session_id, v_user_id, p_book_id, p_chapter_number, p_edition_key, p_mode,
    p_started_at, p_last_active_at, p_start_paragraph_index,
    p_last_paragraph_index, p_client_revision
  )
  ON CONFLICT (session_id) DO NOTHING;

  IF FOUND THEN
    RETURN QUERY SELECT p_session_id, p_client_revision, p_last_active_at, TRUE;
    RETURN;
  END IF;

  -- The conflict path waits for a concurrent insert of the same UUID, then
  -- locks that row before comparing its immutable identity and revision.
  SELECT ras.* INTO current_row
  FROM public.reading_activity_sessions ras
  WHERE ras.session_id = p_session_id
  FOR UPDATE;

  IF current_row.user_id <> v_user_id
     OR current_row.book_id <> p_book_id
     OR current_row.chapter_number <> p_chapter_number
     OR current_row.edition_key <> p_edition_key
     OR current_row.mode <> p_mode
     OR current_row.started_at <> p_started_at THEN
    RAISE EXCEPTION 'reading session identity mismatch' USING ERRCODE = '22023';
  END IF;

  IF p_client_revision < current_row.client_revision THEN
    RETURN QUERY SELECT current_row.session_id, current_row.client_revision,
      current_row.last_active_at, FALSE;
    RETURN;
  END IF;

  UPDATE public.reading_activity_sessions ras
  SET last_active_at = GREATEST(ras.last_active_at, p_last_active_at),
      last_paragraph_index = CASE
        WHEN p_client_revision >= ras.client_revision THEN p_last_paragraph_index
        ELSE ras.last_paragraph_index
      END,
      client_revision = GREATEST(ras.client_revision, p_client_revision),
      updated_at = NOW()
  WHERE ras.session_id = p_session_id;

  RETURN QUERY SELECT p_session_id,
    GREATEST(current_row.client_revision, p_client_revision),
    GREATEST(current_row.last_active_at, p_last_active_at), TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.record_reading_activity_session(
  UUID, TEXT, INTEGER, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER, BIGINT
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_reading_activity_session(
  UUID, TEXT, INTEGER, TEXT, TEXT, TIMESTAMPTZ, TIMESTAMPTZ, INTEGER, INTEGER, BIGINT
) TO authenticated;

-- Conservative one-time backfill: copy only detailed session arrays that
-- were actually recorded by V1. Do not infer sessions from firstReadAt,
-- lastReadAt, completion, progress, or position blobs.
INSERT INTO public.reading_activity_sessions (
  session_id, user_id, book_id, chapter_number, edition_key, mode,
  started_at, last_active_at, start_paragraph_index,
  last_paragraph_index, client_revision
)
SELECT
  md5(
    ud.user_id::TEXT || ':' || ud.key || ':' || chapter.key || ':' ||
    session_entry.value->>'startedAt' || ':' ||
    session_entry.value->>'editionKey' || ':' || session_entry.value->>'mode'
  )::UUID,
  ud.user_id,
  ud.value->>'bookId',
  parsed.chapter_number,
  session_entry.value->>'editionKey',
  session_entry.value->>'mode',
  TO_TIMESTAMP(parsed.started_ms / 1000.0),
  TO_TIMESTAMP(parsed.last_active_ms / 1000.0),
  parsed.start_paragraph_index,
  parsed.last_paragraph_index,
  1
FROM public.user_data ud
CROSS JOIN LATERAL jsonb_each(
  CASE WHEN jsonb_typeof(ud.value->'chapters') = 'object'
    THEN ud.value->'chapters' ELSE '{}'::JSONB END
) AS chapter(key, value)
CROSS JOIN LATERAL jsonb_array_elements(
  CASE WHEN jsonb_typeof(chapter.value->'sessions') = 'array'
    THEN chapter.value->'sessions' ELSE '[]'::JSONB END
) AS session_entry(value)
CROSS JOIN LATERAL (
  SELECT
    CASE WHEN chapter.key ~ '^[1-9][0-9]{0,8}$'
      THEN chapter.key::INTEGER END AS chapter_number,
    CASE WHEN (session_entry.value->>'startedAt') ~ '^[0-9]{1,15}([.][0-9]+)?$'
      THEN (session_entry.value->>'startedAt')::DOUBLE PRECISION END AS started_ms,
    CASE WHEN (session_entry.value->>'lastActiveAt') ~ '^[0-9]{1,15}([.][0-9]+)?$'
      THEN (session_entry.value->>'lastActiveAt')::DOUBLE PRECISION END AS last_active_ms,
    CASE WHEN (session_entry.value->>'startParagraphIndex') ~ '^[0-9]{1,9}$'
      THEN (session_entry.value->>'startParagraphIndex')::INTEGER END AS start_paragraph_index,
    CASE WHEN (session_entry.value->>'lastParagraphIndex') ~ '^[0-9]{1,9}$'
      THEN (session_entry.value->>'lastParagraphIndex')::INTEGER END AS last_paragraph_index
) AS parsed
WHERE ud.key LIKE 'reading-log:%'
  AND ud.value IS NOT NULL
  AND jsonb_typeof(ud.value) = 'object'
  AND jsonb_typeof(ud.value->'chapters') = 'object'
  AND jsonb_typeof(chapter.value->'sessions') = 'array'
  AND char_length(ud.value->>'bookId') BETWEEN 1 AND 160
  AND parsed.chapter_number IS NOT NULL
  AND char_length(session_entry.value->>'editionKey') BETWEEN 1 AND 160
  AND (session_entry.value->>'mode') IN ('read', 'listened')
  AND parsed.started_ms > 0
  AND parsed.last_active_ms >= parsed.started_ms
ON CONFLICT (session_id) DO NOTHING;
