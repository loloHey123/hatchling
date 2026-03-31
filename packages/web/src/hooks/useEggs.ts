import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface Egg {
  id: string;
  creature_id: number;
  rarity: number;
  source_product_name: string;
  source_product_price: number;
  incubation_start: string;
  incubation_end: string;
  status: string;
}

export function useEggs() {
  const { user } = useAuth();
  const [eggs, setEggs] = useState<Egg[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEggs = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('eggs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'incubating')
      .order('incubation_end', { ascending: true });
    setEggs(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchEggs();
  }, [fetchEggs]);

  return { eggs, loading, refetch: fetchEggs };
}
