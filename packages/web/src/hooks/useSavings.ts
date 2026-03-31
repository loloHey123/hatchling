import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface SavingsEntry {
  id: string;
  product_name: string;
  amount_saved: number;
  saved_at: string;
}

export function useSavings() {
  const { user } = useAuth();
  const [savingsLog, setSavingsLog] = useState<SavingsEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavings = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('savings_log')
      .select('*')
      .eq('user_id', user.id)
      .order('saved_at', { ascending: false });
    setSavingsLog(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSavings();
  }, [fetchSavings]);

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const yearStart = new Date(now.getFullYear(), 0, 1);

  const totalSaved = savingsLog.reduce((sum, s) => sum + s.amount_saved, 0);
  const weekSaved = savingsLog.filter(s => new Date(s.saved_at) >= weekAgo).reduce((sum, s) => sum + s.amount_saved, 0);
  const monthSaved = savingsLog.filter(s => new Date(s.saved_at) >= monthAgo).reduce((sum, s) => sum + s.amount_saved, 0);
  const yearSaved = savingsLog.filter(s => new Date(s.saved_at) >= yearStart).reduce((sum, s) => sum + s.amount_saved, 0);

  return { savingsLog, totalSaved, weekSaved, monthSaved, yearSaved, loading, refetch: fetchSavings };
}
