import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface Token {
  id: string;
  source_product_name: string;
  source_product_price: number;
  used: boolean;
  created_at: string;
}

export function useTokens() {
  const { user } = useAuth();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTokens = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tokens')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setTokens(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

  const unusedCount = tokens.filter(t => !t.used).length;

  return { tokens, unusedCount, loading, refetch: fetchTokens };
}
