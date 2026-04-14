import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GachaPull } from '../components/GachaPull';
import { useTokens } from '../hooks/useTokens';
import { PixelFrame } from '../components/PixelFrame';
import { AnimatedPage } from '../components/AnimatedPage';
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
  const [error, setError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  const unusedTokens = tokens.filter(t => !t.used);

  useEffect(() => {
    if (!selectedToken && unusedTokens.length > 0) {
      setSelectedToken(unusedTokens[0].id);
    }
  }, [unusedTokens, selectedToken]);

  const handlePull = async () => {
    if (!selectedToken) return;
    setError(null);

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
      } else {
        setError(data.error || 'Pull failed');
      }
    } catch (err) {
      setError(String(err));
    }
  };

  const handleReset = () => {
    setResult(null);
    setSelectedToken(null);
    refetch();
  };

  return (
    <AnimatedPage className="space-y-5">
      <h2 className="text-pixel-xl text-center font-pixel">Gacha Machine</h2>

      {unusedCount === 0 ? (
        <PixelFrame className="text-center max-w-md mx-auto py-8">
          <motion.div
            className="text-[32px] mb-3"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🪙
          </motion.div>
          <p className="text-base font-bold font-body mb-2">No tokens available!</p>
          <p className="text-sm text-theme-text-muted font-body">
            Resist an impulse purchase using the browser extension to earn a gacha token.
          </p>
        </PixelFrame>
      ) : (
        <>
          <PixelFrame className="max-w-md mx-auto">
            <h3 className="text-sm font-bold font-body mb-3">Select a token:</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {unusedTokens.map(token => (
                <motion.label
                  key={token.id}
                  className={`flex items-center gap-3 p-2.5 cursor-pointer border-2 rounded-button transition-all ${
                    selectedToken === token.id
                      ? 'border-theme-warning bg-theme-warning/10'
                      : 'border-theme-border hover:border-theme-text-muted'
                  }`}
                  whileHover={{ x: 2 }}
                >
                  <input
                    type="radio"
                    name="token"
                    checked={selectedToken === token.id}
                    onChange={() => setSelectedToken(token.id)}
                    className="accent-[var(--color-warning)]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate font-body font-semibold">{token.source_product_name}</div>
                    <div className="text-xs text-theme-success font-bold font-body">
                      ${(token.source_product_price / 100).toFixed(2)}
                    </div>
                  </div>
                </motion.label>
              ))}
            </div>
          </PixelFrame>

          {error && (
            <PixelFrame className="text-center border-theme-danger">
              <p className="text-sm text-theme-danger font-body">{error}</p>
            </PixelFrame>
          )}

          <GachaPull
            onPull={handlePull}
            result={result}
            canPull={!!selectedToken}
            onReset={handleReset}
          />
        </>
      )}
    </AnimatedPage>
  );
}
