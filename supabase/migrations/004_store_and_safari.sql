-- Migration 004: Store and Safari

CREATE TABLE public.cosmetic_defs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hat', 'accessory', 'background', 'effect')),
  sprite_path TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT NOT NULL
);

ALTER TABLE public.cosmetic_defs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read cosmetics" ON public.cosmetic_defs FOR SELECT USING (true);

CREATE TABLE public.user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cosmetic_id INTEGER NOT NULL REFERENCES public.cosmetic_defs(id),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_cosmetics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own cosmetics" ON public.user_cosmetics FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_success_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own streaks" ON public.streaks FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.safari_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 3),
  used BOOLEAN NOT NULL DEFAULT FALSE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.safari_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own safari tickets" ON public.safari_tickets FOR ALL USING (auth.uid() = user_id);

-- Streak RPC functions
CREATE OR REPLACE FUNCTION increment_streak(user_id_input UUID)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() != user_id_input THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.streaks
  SET
    current_streak = current_streak + 1,
    best_streak = GREATEST(best_streak, current_streak + 1),
    last_success_at = NOW(),
    updated_at = NOW()
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION break_streak(user_id_input UUID)
RETURNS VOID AS $$
BEGIN
  IF auth.uid() != user_id_input THEN RAISE EXCEPTION 'unauthorized'; END IF;
  UPDATE public.streaks
  SET current_streak = 0, updated_at = NOW()
  WHERE user_id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_new_user to also create streaks row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Trainer'));

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
