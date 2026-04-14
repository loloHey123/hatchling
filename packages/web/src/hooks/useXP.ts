import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { getLevelForXP } from '../data/xpLevels';

export function useXP() {
  const { user } = useAuth();
  const [totalXP, setTotalXP] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchXP = useCallback(async () => {
    if (!user) return;
    // Try to read from profiles table (xp column)
    const { data } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', user.id)
      .single();
    setTotalXP(data?.xp ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchXP();
  }, [fetchXP]);

  const addXP = useCallback(async (amount: number) => {
    if (!user) return;
    const newXP = totalXP + amount;
    setTotalXP(newXP);
    await supabase
      .from('profiles')
      .update({ xp: newXP })
      .eq('id', user.id);
  }, [user, totalXP]);

  const levelInfo = getLevelForXP(totalXP);

  return {
    totalXP,
    ...levelInfo,
    loading,
    addXP,
    refetch: fetchXP,
  };
}
