import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface UserCreature {
  id: string;
  creature_id: number;
  nickname: string | null;
  found_via: string;
  equipped_cosmetics: number[];
  created_at: string;
}

export function useCreatures() {
  const { user } = useAuth();
  const [ownedCreatures, setOwnedCreatures] = useState<UserCreature[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreatures = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_creatures')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setOwnedCreatures(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCreatures();
  }, [fetchCreatures]);

  return { ownedCreatures, loading, refetch: fetchCreatures };
}
