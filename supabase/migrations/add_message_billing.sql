-- Add message-based billing columns to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS messages_used_this_period integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS message_balance integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS period_start timestamptz DEFAULT now();

-- Add type column to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS type text DEFAULT 'unknown';

-- RPC: Use one message (deducts from monthly quota first, then message_balance)
CREATE OR REPLACE FUNCTION use_message(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_monthly_used integer;
  v_balance integer;
  v_monthly_remaining integer;
BEGIN
  SELECT messages_used_this_period, message_balance
  INTO v_monthly_used, v_balance
  FROM profiles WHERE id = p_user_id FOR UPDATE;

  v_monthly_remaining := GREATEST(0, 100 - COALESCE(v_monthly_used, 0));

  IF v_monthly_remaining > 0 THEN
    -- Deduct from monthly quota
    UPDATE profiles
    SET messages_used_this_period = COALESCE(messages_used_this_period, 0) + 1
    WHERE id = p_user_id;
  ELSIF COALESCE(v_balance, 0) > 0 THEN
    -- Deduct from purchased message balance
    UPDATE profiles
    SET message_balance = message_balance - 1
    WHERE id = p_user_id;
  ELSE
    RETURN json_build_object('error', 'no_messages_remaining');
  END IF;

  RETURN json_build_object(
    'monthly_remaining', GREATEST(0, 100 - COALESCE(v_monthly_used, 0) - 1),
    'message_balance', COALESCE(v_balance, 0)
  );
END;
$$;

-- RPC: Credit messages (from chat pack purchase)
CREATE OR REPLACE FUNCTION credit_messages(p_user_id uuid, p_count integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET message_balance = COALESCE(message_balance, 0) + p_count
  WHERE id = p_user_id;
END;
$$;

-- RPC: Reset monthly messages (called on subscription renewal)
CREATE OR REPLACE FUNCTION reset_monthly_messages(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET messages_used_this_period = 0,
      period_start = now()
  WHERE id = p_user_id;
END;
$$;
