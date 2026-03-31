import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useStore() {
  const { user } = useAuth();
  const [ownedCosmeticIds, setOwnedCosmeticIds] = useState<Set<number>>(new Set());
  const [currencyBalance, setCurrencyBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    const [cosmeticsRes, profileRes] = await Promise.all([
      supabase.from('user_cosmetics').select('cosmetic_id').eq('user_id', user.id),
      supabase.from('profiles').select('currency_balance').eq('id', user.id).single(),
    ]);
    setOwnedCosmeticIds(new Set((cosmeticsRes.data ?? []).map(c => c.cosmetic_id)));
    setCurrencyBalance(profileRes.data?.currency_balance ?? 0);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const purchase = async (cosmeticId: number, price: number) => {
    if (!user) return false;
    if (currencyBalance < price) return false;

    // Insert cosmetic ownership
    const { error: insertError } = await supabase.from('user_cosmetics').insert({
      user_id: user.id,
      cosmetic_id: cosmeticId,
    });
    if (insertError) return false;

    // Deduct currency
    const { error: rpcError } = await supabase.rpc('decrement_currency', {
      user_id_input: user.id,
      amount: price,
    });
    if (rpcError) return false;

    await fetchData();
    return true;
  };

  return { ownedCosmeticIds, currencyBalance, loading, purchase, refetch: fetchData };
}
