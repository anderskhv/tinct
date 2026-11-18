-- Disk IO, part 2 (22 Oct 2026, after Supabase's Disk IO budget warning).
-- Builds on 20261020_disk_io.sql (its user_data_audit created_at index is
-- used by the purge below).
--
-- 1. commit_user_data() no longer rewrites a row whose value would not change.
--    The unchanged value is answered as applied at the current rev, so every
--    client keeps working (same rev, same value). Nothing is written, so no
--    new row version, no WAL, no TOAST rewrite of a large chat or memory blob,
--    and no trigger fires. A rev mismatch is still a conflict.
-- 2. user_data_audit records only what a write changed, only for the rows a
--    lost write would hurt (highlights and notes, saved books, preferences),
--    and only when the value changed. Highlights: the marks the write removed
--    or replaced (the new ones are in user_data). Saved books and preferences:
--    the changed top-level fields, before and after. Nothing for chat,
--    reading memory or reading year (merge-only, and chat would copy message
--    text). Any earlier audit trigger on user_data is replaced, and clients
--    can no longer insert audit rows (the retired classic reader inserted a
--    full old and new copy of every position, reading-log and library write;
--    an old installed app or cached page may still try).
-- 3. The history is kept for one month (privacy notice; the Worker's daily
--    retention cron keeps it so). Rows older than that are deleted now.
-- 4. analytics_events: a btree on created_at for /admin/metrics (newest
--    10,000 rows of a window: the BRIN index could filter but not order, so
--    every load read and sorted the whole window), replacing the BRIN, and a
--    user_id index for account export and deletion. One unused audit index is
--    dropped.
--
-- Safe to run twice (CREATE OR REPLACE, IF [NOT] EXISTS, the trigger lookup
-- skips the trigger this file creates). Plain CREATE INDEX, so it runs in one
-- go in the SQL editor; on these table sizes the index builds take seconds.

-- 1 -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.commit_user_data(
  p_user_id UUID,
  p_key TEXT,
  p_value JSONB,
  p_expected_rev BIGINT DEFAULT NULL
)
RETURNS TABLE(
  key TEXT,
  value JSONB,
  rev BIGINT,
  updated_at TIMESTAMPTZ,
  applied BOOLEAN,
  conflict BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_value JSONB;
  current_rev BIGINT;
  current_updated_at TIMESTAMPTZ;
  next_rev BIGINT;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'not authorized' USING ERRCODE = '42501';
  END IF;

  -- Unchanged value at the expected rev: answer without locking or writing.
  SELECT ud.value, ud.rev, ud.updated_at
  INTO current_value, current_rev, current_updated_at
  FROM public.user_data ud
  WHERE ud.user_id = p_user_id AND ud.key = p_key;

  IF FOUND
     AND (p_expected_rev IS NULL OR current_rev = p_expected_rev)
     AND current_value IS NOT DISTINCT FROM p_value THEN
    RETURN QUERY SELECT p_key, current_value, current_rev, current_updated_at, TRUE, FALSE;
    RETURN;
  END IF;

  SELECT ud.value, ud.rev, ud.updated_at
  INTO current_value, current_rev, current_updated_at
  FROM public.user_data ud
  WHERE ud.user_id = p_user_id AND ud.key = p_key
  FOR UPDATE;

  IF FOUND THEN
    IF p_expected_rev IS NOT NULL AND current_rev <> p_expected_rev THEN
      RETURN QUERY SELECT p_key, current_value, current_rev, current_updated_at, FALSE, TRUE;
      RETURN;
    END IF;

    IF current_value IS NOT DISTINCT FROM p_value THEN
      RETURN QUERY SELECT p_key, current_value, current_rev, current_updated_at, TRUE, FALSE;
      RETURN;
    END IF;

    next_rev := current_rev + 1;
    UPDATE public.user_data ud
    SET value = p_value,
        updated_at = NOW(),
        rev = next_rev
    WHERE ud.user_id = p_user_id AND ud.key = p_key
    RETURNING ud.value, ud.rev, ud.updated_at
    INTO current_value, current_rev, current_updated_at;

    RETURN QUERY SELECT p_key, current_value, current_rev, current_updated_at, TRUE, FALSE;
    RETURN;
  END IF;

  IF p_expected_rev IS NOT NULL AND p_expected_rev <> 0 THEN
    RETURN QUERY SELECT p_key, NULL::JSONB, NULL::BIGINT, NULL::TIMESTAMPTZ, FALSE, TRUE;
    RETURN;
  END IF;

  INSERT INTO public.user_data (user_id, key, value, updated_at, rev)
  VALUES (p_user_id, p_key, p_value, NOW(), 1)
  RETURNING user_data.value, user_data.rev, user_data.updated_at
  INTO current_value, current_rev, current_updated_at;

  RETURN QUERY SELECT p_key, current_value, current_rev, current_updated_at, TRUE, FALSE;
END;
$$;

GRANT EXECUTE ON FUNCTION public.commit_user_data(UUID, TEXT, JSONB, BIGINT) TO authenticated;

-- 2 -------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.audit_user_data_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  before_part JSONB;
  after_part JSONB;
BEGIN
  BEGIN
    IF NEW.value IS NOT DISTINCT FROM OLD.value THEN
      RETURN NULL;
    END IF;

    IF OLD.key LIKE 'lab-highlights:%' THEN
      -- Marks and notes this write removed or replaced, by exact copy.
      SELECT jsonb_agg(o.mark) INTO before_part
      FROM jsonb_array_elements(
        CASE WHEN jsonb_typeof(OLD.value->'highlights') = 'array' THEN OLD.value->'highlights' ELSE '[]'::JSONB END
      ) AS o(mark)
      WHERE NOT (
        CASE WHEN jsonb_typeof(NEW.value->'highlights') = 'array' THEN NEW.value->'highlights' ELSE '[]'::JSONB END
        @> jsonb_build_array(o.mark)
      );
      -- Only additions (or tombstones for marks already gone): nothing to recover.
      IF before_part IS NULL THEN
        RETURN NULL;
      END IF;
      before_part := jsonb_build_object('highlights', before_part);
      after_part := NULL;
    ELSIF jsonb_typeof(OLD.value) = 'object' AND jsonb_typeof(NEW.value) = 'object' THEN
      SELECT jsonb_object_agg(o.key, o.value) INTO before_part
      FROM jsonb_each(OLD.value) AS o
      WHERE NEW.value->o.key IS DISTINCT FROM o.value;
      SELECT jsonb_object_agg(n.key, n.value) INTO after_part
      FROM jsonb_each(NEW.value) AS n
      WHERE OLD.value->n.key IS DISTINCT FROM n.value;
    ELSE
      before_part := OLD.value;
      after_part := NEW.value;
    END IF;

    INSERT INTO public.user_data_audit (user_id, key, old_value, new_value)
    VALUES (NEW.user_id, NEW.key, before_part, after_part);
  EXCEPTION WHEN OTHERS THEN
    -- The history is best-effort; never fail the reader's write.
    RAISE WARNING 'user_data audit skipped for user %: %', NEW.user_id, SQLERRM;
  END;
  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.audit_user_data_change() FROM PUBLIC, anon, authenticated;

-- Replace any earlier audit trigger on user_data (none is in the repo; one may
-- have been added by hand).
DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT tg.tgname
    FROM pg_trigger tg
    JOIN pg_proc p ON p.oid = tg.tgfoid
    WHERE tg.tgrelid = 'public.user_data'::regclass
      AND NOT tg.tgisinternal
      AND tg.tgname <> 'audit_user_data_change'
      AND p.prosrc ILIKE '%user_data_audit%'
  LOOP
    EXECUTE format('DROP TRIGGER %I ON public.user_data', t.tgname);
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS audit_user_data_change ON public.user_data;
CREATE TRIGGER audit_user_data_change
  AFTER UPDATE OF value ON public.user_data
  FOR EACH ROW
  WHEN (
    (OLD.key LIKE 'lab-highlights:%' OR OLD.key LIKE 'saved-book:%' OR OLD.key = 'preferences')
    AND OLD.value IS DISTINCT FROM NEW.value
  )
  EXECUTE FUNCTION public.audit_user_data_change();

-- Clients no longer write the history themselves.
DROP POLICY IF EXISTS user_data_audit_insert ON public.user_data_audit;
REVOKE INSERT, UPDATE, DELETE ON public.user_data_audit FROM anon, authenticated;

-- 3 -------------------------------------------------------------------------

DELETE FROM public.user_data_audit WHERE created_at < NOW() - INTERVAL '1 month';

-- 4 -------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx
  ON public.analytics_events (created_at);
DROP INDEX IF EXISTS public.analytics_events_created_at_brin;
CREATE INDEX IF NOT EXISTS analytics_events_user_created_idx
  ON public.analytics_events (user_id, created_at)
  WHERE user_id IS NOT NULL;
DROP INDEX IF EXISTS public.idx_user_data_audit_key_created;
