import { useEffect, useState } from 'react';
import { RARITY_NAMES } from '@hatchling/shared';
import { PixelFrame } from './PixelFrame';

const RARITY_BG: Record<number, string> = {
  1: 'bg-[#a8a878]', 2: 'bg-[#78c850]', 3: 'bg-[#6890f0]', 4: 'bg-[#f8d030]', 5: 'bg-[#f85888]',
};

interface EggData {
  id: string;
  rarity: number;
  source_product_name: string;
  source_product_price: number;
  incubation_end: string;
}

export function EggCard({ egg, onHatch }: { egg: EggData; onHatch?: (eggId: string) => void }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(egg.incubation_end).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ready to hatch!');
        setReady(true);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      // Show seconds when under 1 minute (debug mode)
      if (days === 0 && hours === 0 && mins === 0) {
        setTimeLeft(`${secs}s`);
      } else if (days === 0 && hours === 0) {
        setTimeLeft(`${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      }
    };
    update();
    // Tick every second when close to hatching, otherwise every minute
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [egg.incubation_end]);

  const rarity = egg.rarity as 1 | 2 | 3 | 4 | 5;
  const rarityName = RARITY_NAMES[rarity] || 'Unknown';

  return (
    <PixelFrame className="flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform">
      <div className={`w-16 h-20 ${RARITY_BG[rarity] || ''} border-2 border-[#333] flex items-center justify-center text-2xl`}>
        {ready ? '🐣' : '🥚'}
      </div>
      <div className="text-center">
        <div className="text-[8px] font-bold">{rarityName}</div>
        <div className="text-[7px] text-[#888] mt-1 truncate max-w-[140px]">
          {egg.source_product_name}
        </div>
        <div className="text-[7px] text-[#666] mt-1">
          ${(egg.source_product_price / 100).toFixed(2)}
        </div>
        <div className={`text-[8px] mt-2 font-bold ${ready ? 'text-[#78c850]' : 'text-[#666]'}`}>
          {timeLeft}
        </div>
      </div>
      {ready && onHatch && (
        <button
          onClick={() => onHatch(egg.id)}
          className="text-[8px] font-pixel bg-[#f8d030] border-2 border-[#333] shadow-[3px_3px_0_#333] px-3 py-2 cursor-pointer
            active:shadow-[1px_1px_0_#333] active:translate-x-[2px] active:translate-y-[2px] transition-all"
        >
          Hatch! 🐣
        </button>
      )}
    </PixelFrame>
  );
}
