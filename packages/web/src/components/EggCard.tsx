import { useEffect, useState } from 'react';
import { RARITY_NAMES, RARITY_COLORS, getEggSprite } from '@hatchling/shared';
import type { Rarity } from '@hatchling/shared';
import { PixelFrame } from './PixelFrame';
import { PixelSprite } from './PixelSprite';
import { RarityBadge } from './RarityBadge';

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
      if (days === 0 && hours === 0 && mins === 0) {
        setTimeLeft(`${secs}s`);
      } else if (days === 0 && hours === 0) {
        setTimeLeft(`${mins}m ${secs}s`);
      } else {
        setTimeLeft(`${days}d ${hours}h ${mins}m`);
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [egg.incubation_end]);

  const rarity = egg.rarity as Rarity;
  const eggSprite = getEggSprite(rarity);

  return (
    <PixelFrame className={`flex flex-col items-center gap-3 hover:-translate-y-1 transition-all duration-200 ${ready ? 'glow-success animate-pulse-glow' : ''}`}>
      <div className="w-16 h-20 flex items-center justify-center">
        {ready ? (
          <span className="text-3xl animate-float">🐣</span>
        ) : (
          <PixelSprite sprite={eggSprite} />
        )}
      </div>
      <div className="text-center space-y-1.5">
        <RarityBadge rarity={rarity} />
        <div className="text-xs text-theme-text-muted truncate max-w-[140px] font-body">
          {egg.source_product_name}
        </div>
        <div className="text-xs text-theme-text-muted font-body">
          ${(egg.source_product_price / 100).toFixed(2)}
        </div>
        <div className={`text-sm font-bold font-body ${ready ? 'text-theme-success' : 'text-theme-text-muted'}`}>
          {timeLeft}
        </div>
      </div>
      {ready && onHatch && (
        <button
          onClick={() => onHatch(egg.id)}
          className="text-sm font-bold font-body bg-theme-warning text-theme-bg border-2 border-theme-border rounded-button shadow-soft-md px-4 py-2 cursor-pointer
            active:scale-95 transition-all duration-150 hover:brightness-110"
        >
          Hatch! 🐣
        </button>
      )}
    </PixelFrame>
  );
}
