-- Migration 005: Social and Stats

CREATE TABLE public.share_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  share_slug TEXT UNIQUE NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.share_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can manage share profile" ON public.share_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public can read public profiles" ON public.share_profiles FOR SELECT USING (is_public = true);

-- Update handle_new_user to also create share_profiles row
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'Trainer'));

  INSERT INTO public.streaks (user_id)
  VALUES (NEW.id);

  INSERT INTO public.share_profiles (user_id, share_slug)
  VALUES (NEW.id, encode(gen_random_bytes(8), 'hex'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
