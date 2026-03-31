-- Migration 003: Tokens and Products

CREATE TABLE public.tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_product_name TEXT NOT NULL,
  source_product_price INTEGER NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tokens" ON public.tokens FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.tracked_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  egg_id UUID NOT NULL REFERENCES public.eggs(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_keywords TEXT[] NOT NULL DEFAULT '{}',
  tracked_urls TEXT[] NOT NULL DEFAULT '{}',
  product_price INTEGER NOT NULL,
  tracking_until TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'violated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tracked_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tracked products" ON public.tracked_products FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.savings_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  amount_saved INTEGER NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.savings_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own savings" ON public.savings_log FOR ALL USING (auth.uid() = user_id);

-- RPC functions
CREATE OR REPLACE FUNCTION increment_currency(user_id_input UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() != user_id_input THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.profiles
  SET currency_balance = currency_balance + amount, updated_at = NOW()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_currency(user_id_input UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() != user_id_input THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.profiles
  SET currency_balance = currency_balance - amount, updated_at = NOW()
  WHERE id = user_id_input AND currency_balance >= amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
