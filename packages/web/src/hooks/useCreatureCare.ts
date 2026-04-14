import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { CARE_ITEM_MAP, type CareItemDef } from '../data/creatureCare';

export interface CareInteraction {
  itemId: number;
  creatureInstanceId: string;
  timestamp: number;
  animation: CareItemDef['animation'];
  happinessBoost: number;
}

export function useCreatureCare() {
  const { user } = useAuth();
  const [recentInteraction, setRecentInteraction] = useState<CareInteraction | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);

  const feedOrPlay = useCallback(async (
    itemId: number,
    creatureInstanceId: string,
    currencyBalance: number,
  ): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'Not logged in' };

    const item = CARE_ITEM_MAP.get(itemId);
    if (!item) return { success: false, message: 'Item not found' };
    if (currencyBalance < item.price) return { success: false, message: 'Not enough coins!' };

    // Deduct currency
    const { error: rpcError } = await supabase.rpc('decrement_currency', {
      user_id_input: user.id,
      amount: item.price,
    });
    if (rpcError) return { success: false, message: 'Payment failed' };

    // Log the interaction
    await supabase.from('creature_care_log').insert({
      user_id: user.id,
      creature_instance_id: creatureInstanceId,
      item_id: itemId,
      happiness_boost: item.happinessBoost,
    });

    // Trigger animation state
    setRecentInteraction({
      itemId,
      creatureInstanceId,
      timestamp: Date.now(),
      animation: item.animation,
      happinessBoost: item.happinessBoost,
    });
    setInteractionCount(c => c + 1);

    // Clear animation after 2 seconds
    setTimeout(() => setRecentInteraction(null), 2500);

    return { success: true, message: `${item.name} used! Your creature loved it!` };
  }, [user]);

  return {
    feedOrPlay,
    recentInteraction,
    interactionCount,
  };
}
