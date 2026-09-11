-- Durable reading memory (lab "What you read last").
--
-- Additive only. The client writes its reading memory as ONE versioned
-- user_data row (key = 'reading-memory') through the existing
-- commit_user_data() RPC with an expected rev; deletes are `value: null`
-- tombstones. This migration adds a queryable, per-session projection of
-- that row so voice/recap lookups can use indexes instead of parsing the
-- blob, plus RLS so a user only ever sees their own sessions.
--
-- It does not change user_data, commit_user_data(), or any existing table's
-- semantics. The projection trigger swallows its own errors so a projection
-- bug can never fail a user's versioned write.
--
-- Ships for review; do not apply without reading it.

CREATE TABLE IF NOT EXISTS public.reading_memory_sessions (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL CHECK (char_length(session_id) BETWEEN 1 AND 120),
  seq BIGINT NOT NULL CHECK (seq > 0),
  device_id TEXT NOT NULL CHECK (char_length(device_id) BETWEEN 1 AND 120),
  state TEXT NOT NULL CHECK (state IN ('started', 'resumed', 'progressed', 'completed')),
  book_id TEXT NOT NULL CHECK (char_length(book_id) BETWEEN 1 AND 120),
  edition_key TEXT NOT NULL CHECK (char_length(edition_key) BETWEEN 1 AND 120),
  chapter_number INTEGER NOT NULL CHECK (chapter_number > 0),
  chapter_label TEXT NOT NULL CHECK (char_length(chapter_label) BETWEEN 1 AND 300),
  page INTEGER NOT NULL CHECK (page > 0),
  total_pages INTEGER CHECK (total_pages IS NULL OR total_pages >= page),
  paragraph_index INTEGER NOT NULL CHECK (paragraph_index >= 0),
  word_index INTEGER NOT NULL CHECK (word_index >= 0),
  -- Exact text range read: start/end paragraph + word + char offsets and
  -- the exact first/last words, stored as one JSON object.
  text_range JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  last_active_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  -- Only ever set from an explicit completion signal on the client.
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, session_id),
  CHECK (last_active_at >= started_at),
  CHECK ((state = 'completed') = (completed_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_reading_memory_sessions_user_time
  ON public.reading_memory_sessions(user_id, last_active_at DESC);

CREATE INDEX IF NOT EXISTS idx_reading_memory_sessions_user_book_time
  ON public.reading_memory_sessions(user_id, book_id, last_active_at DESC);

ALTER TABLE public.reading_memory_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reading_memory_sessions_select_own ON public.reading_memory_sessions;
CREATE POLICY reading_memory_sessions_select_own ON public.reading_memory_sessions
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS reading_memory_sessions_insert_own ON public.reading_memory_sessions;
CREATE POLICY reading_memory_sessions_insert_own ON public.reading_memory_sessions
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS reading_memory_sessions_update_own ON public.reading_memory_sessions;
CREATE POLICY reading_memory_sessions_update_own ON public.reading_memory_sessions
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS reading_memory_sessions_delete_own ON public.reading_memory_sessions;
CREATE POLICY reading_memory_sessions_delete_own ON public.reading_memory_sessions
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

REVOKE ALL ON TABLE public.reading_memory_sessions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.reading_memory_sessions TO authenticated;

-- Project the versioned blob into rows. Idempotent per (user_id, session_id):
-- a replayed or older snapshot (seq <= stored seq) changes nothing. A
-- tombstone (value IS NULL) removes the user's projected sessions.
CREATE OR REPLACE FUNCTION public.project_reading_memory_sessions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entry JSONB;
BEGIN
  IF NEW.key <> 'reading-memory' THEN
    RETURN NEW;
  END IF;

  BEGIN
    IF NEW.value IS NULL OR jsonb_typeof(NEW.value) <> 'object' THEN
      DELETE FROM public.reading_memory_sessions WHERE user_id = NEW.user_id;
      RETURN NEW;
    END IF;

    IF jsonb_typeof(NEW.value->'sessions') <> 'object' THEN
      RETURN NEW;
    END IF;

    FOR entry IN SELECT value FROM jsonb_each(NEW.value->'sessions') LOOP
      IF jsonb_typeof(entry) <> 'object'
         OR (entry->>'id') IS NULL
         OR (entry->>'seq') !~ '^[0-9]{1,15}$'
         OR (entry->>'startedAt') !~ '^[0-9]{1,15}$'
         OR (entry->>'lastActiveAt') !~ '^[0-9]{1,15}$'
         OR (entry->>'state') NOT IN ('started', 'resumed', 'progressed', 'completed')
         OR jsonb_typeof(entry->'anchor') <> 'object'
         OR jsonb_typeof(entry->'anchor'->'range') <> 'object'
         OR (entry->'anchor'->>'chapterNumber') !~ '^[0-9]{1,9}$'
         OR (entry->'anchor'->>'page') !~ '^[0-9]{1,9}$'
         OR (entry->'anchor'->>'paragraphIndex') !~ '^[0-9]{1,9}$'
         OR (entry->'anchor'->>'wordIndex') !~ '^[0-9]{1,9}$'
         OR ((entry->>'state') = 'completed') <> ((entry->>'completedAt') ~ '^[0-9]{1,15}$') THEN
        CONTINUE;
      END IF;

      INSERT INTO public.reading_memory_sessions (
        user_id, session_id, seq, device_id, state,
        book_id, edition_key, chapter_number, chapter_label,
        page, total_pages, paragraph_index, word_index, text_range,
        started_at, last_active_at, ended_at, completed_at, updated_at
      ) VALUES (
        NEW.user_id,
        entry->>'id',
        (entry->>'seq')::BIGINT,
        COALESCE(NULLIF(entry->>'deviceId', ''), 'unknown'),
        entry->>'state',
        entry->'anchor'->>'bookId',
        entry->'anchor'->>'editionKey',
        (entry->'anchor'->>'chapterNumber')::INTEGER,
        entry->'anchor'->>'chapterLabel',
        (entry->'anchor'->>'page')::INTEGER,
        CASE WHEN (entry->'anchor'->>'totalPages') ~ '^[0-9]{1,9}$'
          THEN (entry->'anchor'->>'totalPages')::INTEGER END,
        (entry->'anchor'->>'paragraphIndex')::INTEGER,
        (entry->'anchor'->>'wordIndex')::INTEGER,
        entry->'anchor'->'range',
        TO_TIMESTAMP((entry->>'startedAt')::DOUBLE PRECISION / 1000.0),
        TO_TIMESTAMP((entry->>'lastActiveAt')::DOUBLE PRECISION / 1000.0),
        CASE WHEN (entry->>'endedAt') ~ '^[0-9]{1,15}$'
          THEN TO_TIMESTAMP((entry->>'endedAt')::DOUBLE PRECISION / 1000.0) END,
        CASE WHEN (entry->>'completedAt') ~ '^[0-9]{1,15}$'
          THEN TO_TIMESTAMP((entry->>'completedAt')::DOUBLE PRECISION / 1000.0) END,
        NOW()
      )
      ON CONFLICT (user_id, session_id) DO UPDATE SET
        seq = EXCLUDED.seq,
        device_id = EXCLUDED.device_id,
        state = EXCLUDED.state,
        book_id = EXCLUDED.book_id,
        edition_key = EXCLUDED.edition_key,
        chapter_number = EXCLUDED.chapter_number,
        chapter_label = EXCLUDED.chapter_label,
        page = EXCLUDED.page,
        total_pages = EXCLUDED.total_pages,
        paragraph_index = EXCLUDED.paragraph_index,
        word_index = EXCLUDED.word_index,
        text_range = EXCLUDED.text_range,
        started_at = EXCLUDED.started_at,
        last_active_at = EXCLUDED.last_active_at,
        ended_at = EXCLUDED.ended_at,
        completed_at = EXCLUDED.completed_at,
        updated_at = NOW()
      WHERE EXCLUDED.seq > public.reading_memory_sessions.seq;
    END LOOP;
  EXCEPTION WHEN OTHERS THEN
    -- The projection is best-effort; never fail the versioned user_data write.
    RAISE WARNING 'reading memory projection skipped for user %: %', NEW.user_id, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS project_reading_memory_sessions ON public.user_data;
CREATE TRIGGER project_reading_memory_sessions
  AFTER INSERT OR UPDATE OF value ON public.user_data
  FOR EACH ROW
  WHEN (NEW.key = 'reading-memory')
  EXECUTE FUNCTION public.project_reading_memory_sessions();

REVOKE ALL ON FUNCTION public.project_reading_memory_sessions() FROM PUBLIC, anon, authenticated;
