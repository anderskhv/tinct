-- Versioned user_data writes for stale-write rejection.
-- Backward compatible: existing direct upserts continue to work during rollout,
-- while new clients use commit_user_data() with an expected rev.

ALTER TABLE public.user_data
  ADD COLUMN IF NOT EXISTS rev BIGINT NOT NULL DEFAULT 0;

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
