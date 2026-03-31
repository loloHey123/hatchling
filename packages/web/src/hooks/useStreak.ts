import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useStreak() {
  const { user } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('streaks')
      .select('current_streak, best_streak')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setCurrentStreak(data.current_streak);
      setBestStreak(data.best_streak);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return { currentStreak, bestStreak, loading, refetch: fetchStreak };
}
