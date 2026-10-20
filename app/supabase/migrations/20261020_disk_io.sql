-- Disk IO trim (20 Oct 2026, after Supabase's Disk IO budget warning).
--
-- 1. The reading-memory projection projects only the sessions whose seq went up
--    in this write. Before, every 'reading-memory' write upserted all (up to 50)
--    sessions, and ON CONFLICT ... WHERE locks each existing row even when it
--    skips the update. Behaviour is otherwise unchanged: same checks, same
--    upsert, same tombstone delete, errors still swallowed.
-- 2. created_at indexes for the append-only logs that the retention job and
--    the admin metrics read by date (they had no index leading with it), and
--    a day index for the hourly leaderboard rebuild.
--
-- Safe to run twice (CREATE OR REPLACE, IF NOT EXISTS).

CREATE OR REPLACE FUNCTION public.project_reading_memory_sessions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sid TEXT;
  entry JSONB;
  old_seq TEXT;
  old_sessions JSONB;
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

    IF TG_OP = 'UPDATE' AND OLD.value IS NOT NULL
       AND jsonb_typeof(OLD.value) = 'object'
       AND jsonb_typeof(OLD.value->'sessions') = 'object' THEN
      old_sessions := OLD.value->'sessions';
    END IF;

    FOR sid, entry IN SELECT key, value FROM jsonb_each(NEW.value->'sessions') LOOP
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

      -- Unchanged since the previous write of this row: nothing to project.
      old_seq := old_sessions->sid->>'seq';
      IF old_seq ~ '^[0-9]{1,15}$' AND (entry->>'seq')::BIGINT <= old_seq::BIGINT THEN
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

CREATE INDEX IF NOT EXISTS analytics_events_created_at_brin
  ON public.analytics_events USING brin (created_at);
CREATE INDEX IF NOT EXISTS token_usage_created_at_idx
  ON public.token_usage (created_at);
CREATE INDEX IF NOT EXISTS ai_usage_events_created_at_idx
  ON public.ai_usage_events (created_at);
CREATE INDEX IF NOT EXISTS user_data_audit_created_at_idx
  ON public.user_data_audit (created_at);
CREATE INDEX IF NOT EXISTS reading_time_day_idx
  ON public.reading_time (day);
