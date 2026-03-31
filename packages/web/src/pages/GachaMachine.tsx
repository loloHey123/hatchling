import { useState, useEffect } from 'react';
import { GachaPull } from '../components/GachaPull';
import { useTokens } from '../hooks/useTokens';
import { PixelFrame } from '../components/PixelFrame';
import { supabase } from '../lib/supabase';
import type { Rarity } from '@hatchling/shared';

interface PullResult {
  eggId: string;
  rarity: Rarity;
  incubationEnd: string;
}

export function GachaMachine() {
  const { tokens, unusedCount, refetch } = useTokens();
  const [result, setResult] = useState<PullResult | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const unusedTokens = tokens.filter(t => !t.used);

  // Auto-select first token if none selected
  useEffect(() => {
    if (!selectedToken && unusedTokens.length > 0) {
      setSelectedToken(unusedTokens[0].id);
    }
  }, [unusedTokens, selectedToken]);

  const handlePull = async () => {
    if (!selectedToken) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'}/functions/v1/gacha-pull`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ tokenId: selectedToken }),
        }
      );
      const data = await res.json();
      if (data.egg) {
        setResult({
          eggId: data.egg.id,
          rarity: data.egg.rarity,
          incubationEnd: data.egg.incubationEnd,
        });
      }
    } catch (err) {
      console.error('Gacha pull failed:', err);
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedToken(null);
    refetch();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[16px] text-center">🎰 Gacha Machine</h2>

      {unusedCount === 0 ? (
        <PixelFrame className="text-center max-w-md mx-auto">
          <div className="text-[24px] mb-3">🪙</div>
          <p className="text-[10px] mb-2">No tokens available!</p>
          <p className="text-[8px] text-[#888]">
            Resist an impulse purchase using the browser extension to earn a gacha token.
          </p>
        </PixelFrame>
      ) : (
        <>
          {/* Token selector */}
          <PixelFrame className="max-w-md mx-auto">
            <h3 className="text-[9px] mb-3">Select a token:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {unusedTokens.map(token => (
                <label
                  key={token.id}
                  className={`flex items-center gap-3 p-2 cursor-pointer border-2 transition-colors ${
                    selectedToken === token.id
                      ? 'border-[#f8d030] bg-[#fff8d0]'
                      : 'border-[#eee] hover:border-[#ccc]'
                  }`}
                >
                  <input
                    type="radio"
                    name="token"
                    checked={selectedToken === token.id}
                    onChange={() => setSelectedToken(token.id)}
                    className="accent-[#f8d030]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[8px] truncate">{token.source_product_name}</div>
                    <div className="text-[7px] text-[#78c850] font-bold">
                      ${(token.source_product_price / 100).toFixed(2)}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </PixelFrame>

          {/* Gacha machine */}
          <GachaPull
            onPull={handlePull}
            result={result}
            canPull={!!selectedToken}
            onReset={handleReset}
          />
        </>
      )}
    </div>
  );
}
