-- Migration 002: Creatures and Eggs

CREATE TABLE public.creature_defs (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  rarity INTEGER NOT NULL CHECK (rarity BETWEEN 1 AND 5),
  sprite_path TEXT NOT NULL,
  description TEXT NOT NULL,
  safari_only BOOLEAN NOT NULL DEFAULT FALSE
);

ALTER TABLE public.creature_defs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read creatures" ON public.creature_defs FOR SELECT USING (true);

CREATE TABLE public.eggs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creature_id INTEGER NOT NULL REFERENCES public.creature_defs(id),
  rarity INTEGER NOT NULL CHECK (rarity BETWEEN 1 AND 5),
  source_product_name TEXT NOT NULL,
  source_product_price INTEGER NOT NULL,
  source_product_keywords TEXT[] NOT NULL DEFAULT '{}',
  tracked_urls TEXT[] NOT NULL DEFAULT '{}',
  incubation_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  incubation_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'incubating' CHECK (status IN ('incubating', 'hatched', 'destroyed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.eggs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own eggs" ON public.eggs FOR ALL USING (auth.uid() = user_id);

CREATE TABLE public.user_creatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creature_id INTEGER NOT NULL REFERENCES public.creature_defs(id),
  nickname TEXT,
  hatched_from_egg UUID REFERENCES public.eggs(id),
  found_via TEXT NOT NULL DEFAULT 'egg' CHECK (found_via IN ('egg', 'safari')),
  equipped_cosmetics JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_creatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own creatures" ON public.user_creatures FOR ALL USING (auth.uid() = user_id);
