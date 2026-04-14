import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export interface ActiveQuest {
  id: string;
  user_id: string;
  quest_id: string;
  creature_id: number;
  creature_instance_id: string;
  started_at: string;
  ends_at: string;
  completed: boolean;
  rewards_claimed: boolean;
  bonus_triggered: boolean;
}

export function useQuests() {
  const { user } = useAuth();
  const [activeQuests, setActiveQuests] = useState<ActiveQuest[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchQuests = useCallback(async () => {
    if (!user) return;
    const [activeRes, completedRes] = await Promise.all([
      supabase
        .from('creature_quests')
        .select('*')
        .eq('user_id', user.id)
        .eq('rewards_claimed', false)
        .order('started_at', { ascending: false }),
      supabase
        .from('creature_quests')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('rewards_claimed', true),
    ]);
    setActiveQuests(activeRes.data ?? []);
    setCompletedCount(completedRes.count ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const startQuest = useCallback(async (questId: string, creatureInstanceId: string, creatureId: number, durationHours: number) => {
    if (!user) return null;
    const now = new Date();
    const endsAt = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    const bonusTriggered = Math.random() < 0.3; // base chance, refined by quest def

    const { data, error } = await supabase
      .from('creature_quests')
      .insert({
        user_id: user.id,
        quest_id: questId,
        creature_id: creatureId,
        creature_instance_id: creatureInstanceId,
        started_at: now.toISOString(),
        ends_at: endsAt.toISOString(),
        completed: false,
        rewards_claimed: false,
        bonus_triggered: bonusTriggered,
      })
      .select()
      .single();

    if (error) return null;
    await fetchQuests();
    return data;
  }, [user, fetchQuests]);

  const claimRewards = useCallback(async (questDbId: string) => {
    if (!user) return false;
    const { error } = await supabase
      .from('creature_quests')
      .update({ completed: true, rewards_claimed: true })
      .eq('id', questDbId)
      .eq('user_id', user.id);
    if (error) return false;
    await fetchQuests();
    return true;
  }, [user, fetchQuests]);

  return {
    activeQuests,
    completedCount,
    loading,
    startQuest,
    claimRewards,
    refetch: fetchQuests,
  };
}
