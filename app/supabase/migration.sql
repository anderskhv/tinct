-- Tinct Monetization: Supabase Schema
-- Run this in the Supabase SQL editor

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  stripe_customer_id TEXT UNIQUE,
  token_balance_cents NUMERIC(10,2) NOT NULL DEFAULT 200, -- $2 free tier
  total_tokens_used BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Token usage audit log
CREATE TABLE IF NOT EXISTS public.token_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  cost_cents NUMERIC(10,4) NOT NULL DEFAULT 0,
  feature TEXT NOT NULL DEFAULT 'chat',
  book_id TEXT,
  chapter INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_token_usage_user ON public.token_usage(user_id, created_at DESC);

-- Payment records
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_session_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_user ON public.payments(user_id, created_at DESC);

-- User data (generic key-value store for syncing localStorage data)
CREATE TABLE IF NOT EXISTS public.user_data (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

-- Atomic balance deduction function
CREATE OR REPLACE FUNCTION public.deduct_balance(
  p_user_id UUID,
  p_amount_cents NUMERIC,
  p_input_tokens INTEGER,
  p_output_tokens INTEGER,
  p_feature TEXT DEFAULT 'chat',
  p_book_id TEXT DEFAULT NULL,
  p_chapter INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Deduct from balance (allow going negative to avoid race conditions — we checked beforehand)
  UPDATE public.profiles
  SET
    token_balance_cents = token_balance_cents - p_amount_cents,
    total_tokens_used = total_tokens_used + p_input_tokens + p_output_tokens
  WHERE id = p_user_id;

  -- Log usage
  INSERT INTO public.token_usage (user_id, input_tokens, output_tokens, cost_cents, feature, book_id, chapter)
  VALUES (p_user_id, p_input_tokens, p_output_tokens, p_amount_cents, p_feature, p_book_id, p_chapter);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atomic balance credit function (for Stripe webhook)
CREATE OR REPLACE FUNCTION public.credit_balance(
  p_user_id UUID,
  p_amount_cents NUMERIC
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET token_balance_cents = token_balance_cents + p_amount_cents
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read their own profile
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Token usage: users can read their own usage
CREATE POLICY token_usage_select ON public.token_usage
  FOR SELECT USING (auth.uid() = user_id);

-- Payments: users can read their own payments
CREATE POLICY payments_select ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- User data: users can CRUD their own data
CREATE POLICY user_data_select ON public.user_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_data_insert ON public.user_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_data_update ON public.user_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY user_data_delete ON public.user_data
  FOR DELETE USING (auth.uid() = user_id);
