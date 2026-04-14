import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { ACHIEVEMENTS, type AchievementDef } from '../data/achievements';

export interface UnlockedAchievement {
  achievement_id: string;
  unlocked_at: string;
}

export function useAchievements() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [unlockedList, setUnlockedList] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', user.id);
    const list = data ?? [];
    setUnlockedList(list);
    setUnlocked(new Set(list.map(a => a.achievement_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const unlock = useCallback(async (achievementId: string) => {
    if (!user || unlocked.has(achievementId)) return false;
    const { error } = await supabase
      .from('user_achievements')
      .insert({ user_id: user.id, achievement_id: achievementId });
    if (error) return false;
    await fetchAchievements();
    return true;
  }, [user, unlocked, fetchAchievements]);

  const isUnlocked = useCallback((id: string) => unlocked.has(id), [unlocked]);

  const stats = {
    total: ACHIEVEMENTS.length,
    unlocked: unlocked.size,
    progress: unlocked.size / ACHIEVEMENTS.length,
  };

  return { unlocked, unlockedList, loading, unlock, isUnlocked, stats, refetch: fetchAchievements };
}
