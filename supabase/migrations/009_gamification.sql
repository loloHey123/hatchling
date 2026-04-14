-- Migration 009: Gamification System
-- Adds XP/levels, achievements, creature quests, and creature care logging

-- 1. Add XP column to profiles
ALTER TABLE public.profiles ADD COLUMN xp INTEGER NOT NULL DEFAULT 0;

-- 2. Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_user_achievements_user ON public.user_achievements (user_id);

-- 3. Create creature_quests table
CREATE TABLE public.creature_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL,
  creature_id INTEGER NOT NULL REFERENCES public.creature_defs(id),
  creature_instance_id UUID NOT NULL REFERENCES public.user_creatures(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  rewards_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  bonus_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.creature_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own quests" ON public.creature_quests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quests" ON public.creature_quests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quests" ON public.creature_quests FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_creature_quests_user_active ON public.creature_quests (user_id, rewards_claimed);
CREATE INDEX idx_creature_quests_user_started ON public.creature_quests (user_id, started_at DESC);

-- 4. Create creature_care_log table
CREATE TABLE public.creature_care_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creature_instance_id UUID NOT NULL REFERENCES public.user_creatures(id) ON DELETE CASCADE,
  item_id INTEGER NOT NULL,
  happiness_boost INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.creature_care_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own care log" ON public.creature_care_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own care log" ON public.creature_care_log FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_creature_care_log_user ON public.creature_care_log (user_id);
CREATE INDEX idx_creature_care_log_creature ON public.creature_care_log (creature_instance_id);
