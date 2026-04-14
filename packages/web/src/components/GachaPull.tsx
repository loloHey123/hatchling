import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RARITY_NAMES, RARITY_COLORS } from '@hatchling/shared';
import type { Rarity } from '@hatchling/shared';

type Phase = 'idle' | 'inserting' | 'shaking' | 'dropping' | 'revealing' | 'done';

interface PullResult {
  eggId: string;
  rarity: Rarity;
  incubationEnd: string;
}

interface GachaPullProps {
  onPull: () => void;
  result: PullResult | null;
  canPull: boolean;
  onReset: () => void;
}

export function GachaPull({ onPull, result, canPull, onReset }: GachaPullProps) {
  const [phase, setPhase] = useState<Phase>('idle');

  const startPull = () => {
    if (!canPull || phase !== 'idle') return;
    setPhase('inserting');
    setTimeout(() => setPhase('shaking'), 600);
    setTimeout(() => {
      onPull();
      setPhase('dropping');
    }, 1500);
  };

  useEffect(() => {
    if (result && phase === 'dropping') {
      const t1 = setTimeout(() => setPhase('revealing'), 800);
      const t2 = setTimeout(() => setPhase('done'), 2200);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [result, phase]);

  const handleReset = () => {
    setPhase('idle');
    onReset();
  };

  const capsuleColors = [1,2,3,4,5,1,2,3,1,1,2,1].map(r => RARITY_COLORS[r as Rarity]);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* GACHA MACHINE */}
      <motion.div
        className="relative"
        animate={phase === 'shaking' ? {
          x: [0, -5, 5, -5, 5, -3, 3, 0],
          transition: { duration: 0.8, repeat: 1 },
        } : {}}
      >
        <div className="relative w-56 sm:w-64 h-72 sm:h-80 bg-theme-accent rounded-panel border-2 border-theme-border shadow-soft-lg overflow-hidden">
          {/* Top dome */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 sm:w-48 h-12 bg-theme-accent border-2 border-theme-border border-b-0 rounded-t-[24px]">
            <div className="text-center text-pixel-xs text-white font-pixel mt-2.5 tracking-wider drop-shadow-md">HATCHLING</div>
          </div>

          {/* Glass window */}
          <div className="absolute top-10 left-4 right-4 h-28 sm:h-32 bg-theme-bg/80 border-2 border-theme-border rounded-xl overflow-hidden backdrop-blur-sm">
            <div className="flex flex-wrap gap-1.5 p-2.5 justify-center items-center h-full">
              {capsuleColors.map((color, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full shadow-soft-sm"
                  style={{ backgroundColor: color }}
                  animate={phase === 'shaking' ? {
                    y: [0, -3, 3, -2, 2, 0],
                    transition: { duration: 0.4, repeat: 2, delay: i * 0.05 },
                  } : {}}
                />
              ))}
            </div>
          </div>

          {/* Coin slot */}
          <div className="absolute top-44 sm:top-48 left-1/2 -translate-x-1/2">
            <div className="w-10 h-2 bg-theme-bg rounded-full border border-theme-border" />
            <AnimatePresence>
              {phase === 'inserting' && (
                <motion.div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-theme-warning rounded-full border-2 border-theme-border flex items-center justify-center text-sm"
                  initial={{ y: -20, opacity: 1 }}
                  animate={{ y: 4, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  🪙
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Crank handle */}
          <div className="absolute top-44 sm:top-48 -right-6">
            <motion.div
              className="w-4 h-12 bg-theme-text-muted border-2 border-theme-border rounded-lg"
              animate={phase === 'shaking' ? { rotate: [0, 30, -10, 20, 0] } : {}}
              transition={{ duration: 0.8 }}
            />
            <div className="w-6 h-6 bg-theme-warning border-2 border-theme-border rounded-full -mt-1 ml-[-4px]" />
          </div>

          {/* Dispensing slot */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-10 bg-theme-bg border-2 border-theme-border rounded-b-xl" />
        </div>
      </motion.div>

      {/* DROPPED CAPSULE / RESULT */}
      <AnimatePresence mode="wait">
        {(phase === 'dropping' || phase === 'revealing' || phase === 'done') && (
          <motion.div
            key="capsule"
            className="flex flex-col items-center gap-4"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
          >
            <motion.div
              className="w-20 h-24 border-2 border-theme-border rounded-xl flex items-center justify-center text-3xl shadow-soft-lg"
              style={{
                backgroundColor: result ? RARITY_COLORS[result.rarity] : 'var(--color-text-muted)',
              }}
              animate={phase === 'revealing' ? {
                scale: [1, 1.2, 0.9, 1.3, 1],
                rotate: [0, -10, 10, -5, 0],
              } : {}}
              transition={{ duration: 1.2 }}
            >
              {phase === 'done' ? '🥚' : '❓'}
            </motion.div>

            {phase === 'revealing' && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute text-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      x: Math.cos((i / 6) * Math.PI * 2) * 60,
                      y: Math.sin((i / 6) * Math.PI * 2) * 60,
                    }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                  >
                    ✨
                  </motion.div>
                ))}
              </>
            )}

            {phase === 'done' && result && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div
                  className="text-pixel-xl font-bold font-pixel"
                  style={{ color: RARITY_COLORS[result.rarity], textShadow: '2px 2px 0 var(--color-border)' }}
                >
                  {RARITY_NAMES[result.rarity]} Egg!
                </div>
                <div className="text-sm text-theme-text-muted mt-3 font-body">
                  A mystery creature is incubating...
                </div>
                <div className="text-sm text-theme-text-muted mt-1 font-body">
                  Hatches on {new Date(result.incubationEnd).toLocaleDateString()}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* BUTTONS */}
      {phase === 'idle' && (
        <motion.button
          onClick={startPull}
          disabled={!canPull}
          className="text-lg font-bold font-body bg-theme-warning text-theme-bg border-2 border-theme-border
            shadow-soft-lg rounded-button px-8 py-4 cursor-pointer
            active:scale-95 hover:brightness-110 transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed"
          whileHover={canPull ? { scale: 1.03 } : {}}
          whileTap={canPull ? { scale: 0.97 } : {}}
        >
          Insert Token 🪙
        </motion.button>
      )}

      {phase === 'done' && (
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="text-sm font-bold font-body bg-theme-success text-white border-2 border-theme-border
              rounded-button shadow-soft-md px-6 py-3 cursor-pointer
              active:scale-95 transition-all duration-150 hover:brightness-110"
          >
            Pull Again
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="text-sm font-bold font-body bg-theme-accent text-white border-2 border-theme-border
              rounded-button shadow-soft-md px-6 py-3 cursor-pointer
              active:scale-95 transition-all duration-150 hover:brightness-110"
          >
            View Eggs
          </button>
        </div>
      )}

      {(phase === 'dropping') && !result && (
        <div className="text-sm text-theme-text-muted animate-pulse font-body">Pulling...</div>
      )}
    </div>
  );
}
