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

  // Advance phases when result arrives
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

  // Capsule colors in the machine window (game logic — keep RARITY_COLORS)
  const capsuleColors = [1,2,3,4,5,1,2,3,1,1,2,1].map(r => RARITY_COLORS[r as Rarity]);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* === GACHA MACHINE === */}
      <motion.div
        className="relative"
        animate={phase === 'shaking' ? {
          x: [0, -5, 5, -5, 5, -3, 3, 0],
          transition: { duration: 0.8, repeat: 1 },
        } : {}}
      >
        {/* Machine body */}
        <div className="relative w-56 sm:w-64 h-72 sm:h-80 bg-[#e44] border-4 border-theme-border shadow-[6px_6px_0_var(--color-border)]">
          {/* Top dome */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-40 sm:w-48 h-12 bg-[#e44] border-4 border-theme-border border-b-0 rounded-t-full">
            <div className="text-center text-pixel-xs text-white font-pixel mt-2 tracking-wider">HATCHLING</div>
          </div>

          {/* Glass window */}
          <div className="absolute top-10 left-4 right-4 h-28 sm:h-32 bg-[#222] border-2 border-[#555] rounded overflow-hidden">
            <div className="flex flex-wrap gap-1 p-2 justify-center items-center h-full">
              {capsuleColors.map((color, i) => (
                <motion.div
                  key={i}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-[#444]"
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
            <div className="w-10 h-2 bg-[#222] border border-[#555] rounded" />
            <AnimatePresence>
              {phase === 'inserting' && (
                <motion.div
                  className="absolute -top-6 left-1/2 -translate-x-1/2 w-6 h-6 bg-theme-warning rounded-full border-2 border-theme-border flex items-center justify-center text-pixel-base"
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
              className="w-4 h-12 bg-theme-text-muted border-2 border-theme-border rounded"
              animate={phase === 'shaking' ? { rotate: [0, 30, -10, 20, 0] } : {}}
              transition={{ duration: 0.8 }}
            />
            <div className="w-6 h-6 bg-theme-warning border-2 border-theme-border rounded-full -mt-1 ml-[-4px]" />
          </div>

          {/* Dispensing slot */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-20 h-10 bg-[#111] border-2 border-[#555] rounded-b-lg" />
        </div>
      </motion.div>

      {/* === DROPPED CAPSULE / RESULT === */}
      <AnimatePresence mode="wait">
        {(phase === 'dropping' || phase === 'revealing' || phase === 'done') && (
          <motion.div
            key="capsule"
            className="flex flex-col items-center gap-4"
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
          >
            {/* Capsule / Egg — rarity color is game logic, keep inline style */}
            <motion.div
              className="w-20 h-24 border-[3px] border-theme-border flex items-center justify-center text-3xl shadow-pixel-lg"
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

            {/* Sparkles during reveal */}
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

            {/* Result text */}
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
                <div className="text-pixel-sm text-theme-text-muted mt-3">
                  A mystery creature is incubating...
                </div>
                <div className="text-pixel-sm text-theme-text-muted mt-1">
                  Hatches on {new Date(result.incubationEnd).toLocaleDateString()}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === BUTTONS === */}
      {phase === 'idle' && (
        <motion.button
          onClick={startPull}
          disabled={!canPull}
          className="text-pixel-lg font-pixel bg-theme-warning text-theme-text border-4 border-theme-border
            shadow-[6px_6px_0_var(--color-border)] px-8 py-4 cursor-pointer
            active:shadow-pixel-sm active:translate-x-[4px] active:translate-y-[4px]
            hover:bg-[#ffe040] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
            className="text-pixel-base font-pixel bg-theme-success text-white border-[3px] border-theme-border
              shadow-pixel-lg px-6 py-3 cursor-pointer
              active:shadow-pixel-pressed active:translate-x-[3px] active:translate-y-[3px]"
          >
            Pull Again
          </button>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="text-pixel-base font-pixel bg-theme-accent text-white border-[3px] border-theme-border
              shadow-pixel-lg px-6 py-3 cursor-pointer
              active:shadow-pixel-pressed active:translate-x-[3px] active:translate-y-[3px]"
          >
            View Eggs
          </button>
        </div>
      )}

      {/* Loading indicator during pull */}
      {(phase === 'dropping') && !result && (
        <div className="text-pixel-sm text-theme-text-muted animate-pulse">Pulling...</div>
      )}
    </div>
  );
}
