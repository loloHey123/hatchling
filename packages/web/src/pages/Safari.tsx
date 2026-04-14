import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useStreak } from '../hooks/useStreak';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { RarityBadge } from '../components/RarityBadge';
import { AnimatedPage } from '../components/AnimatedPage';
import { CREATURES } from '../data/creatures';
import { RARITY_COLORS, SAFARI_STREAK_TIERS } from '@hatchling/shared';
import type { CreatureDef } from '@hatchling/shared';

type Phase = 'tickets' | 'encounter' | 'success' | 'failure';

interface SafariTicket {
  id: string;
  user_id: string;
  tier: number;
  used: boolean;
  created_at: string;
}

const FOODS = [
  { id: 0, name: 'Berry', emoji: '🍓' },
  { id: 1, name: 'Fish', emoji: '🐟' },
  { id: 2, name: 'Honey', emoji: '🍯' },
] as const;

const TIER_INFO: Record<number, { label: string; color: string; description: string }> = {
  1: { label: 'Basic', color: 'var(--color-rarity-common)', description: 'Common & Uncommon safari creatures' },
  2: { label: 'Premium', color: 'var(--color-rarity-rare)', description: 'Uncommon & Rare safari creatures' },
  3: { label: 'Legendary', color: 'var(--color-rarity-legendary)', description: 'Rare, Legendary & Mythic safari creatures' },
};

const MAX_ATTEMPTS = 3;

function getCreaturesForTier(tier: number): CreatureDef[] {
  const safariCreatures = CREATURES.filter(c => c.safariOnly);
  switch (tier) {
    case 1: return safariCreatures.filter(c => c.rarity <= 2);
    case 2: return safariCreatures.filter(c => c.rarity >= 2 && c.rarity <= 3);
    case 3: return safariCreatures.filter(c => c.rarity >= 3);
    default: return safariCreatures;
  }
}

// FIX: Random food preference per encounter (not deterministic based on ID)
function getRandomFoodPreference(): number {
  return Math.floor(Math.random() * 3);
}

function pickRandomCreature(tier: number): CreatureDef {
  const pool = getCreaturesForTier(tier);
  return pool[Math.floor(Math.random() * pool.length)];
}

export function Safari() {
  const { user } = useAuth();
  const { currentStreak, bestStreak, loading: streakLoading } = useStreak();

  const [phase, setPhase] = useState<Phase>('tickets');
  const [tickets, setTickets] = useState<SafariTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SafariTicket | null>(null);

  const [creature, setCreature] = useState<CreatureDef | null>(null);
  const [foodPreference, setFoodPreference] = useState<number>(0);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [lastGuess, setLastGuess] = useState<{ foodId: number; correct: boolean } | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [creatureOffset, setCreatureOffset] = useState(0);

  const fetchTickets = useCallback(async () => {
    if (!user) return;
    setLoadingTickets(true);
    const { data } = await supabase
      .from('safari_tickets')
      .select('*')
      .eq('user_id', user.id)
      .eq('used', false)
      .order('tier', { ascending: true });
    setTickets(data ?? []);
    setLoadingTickets(false);
  }, [user]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const ticketsByTier = tickets.reduce<Record<number, SafariTicket[]>>((acc, t) => {
    acc[t.tier] = acc[t.tier] || [];
    acc[t.tier].push(t);
    return acc;
  }, {});

  const handleStartSafari = () => {
    if (!selectedTier) return;
    const tierTickets = ticketsByTier[selectedTier];
    if (!tierTickets || tierTickets.length === 0) return;

    const ticket = tierTickets[0];
    const chosenCreature = pickRandomCreature(selectedTier);

    setSelectedTicket(ticket);
    setCreature(chosenCreature);
    setFoodPreference(getRandomFoodPreference());
    setAttemptsLeft(MAX_ATTEMPTS);
    setLastGuess(null);
    setCreatureOffset(0);
    setPhase('encounter');
  };

  const handleFoodChoice = async (foodId: number) => {
    if (!creature || !selectedTicket || isRevealing) return;

    const correct = foodId === foodPreference;

    setIsRevealing(true);
    setLastGuess({ foodId, correct });

    if (correct) {
      setCreatureOffset(3);
      setTimeout(async () => {
        await supabase
          .from('safari_tickets')
          .update({ used: true })
          .eq('id', selectedTicket.id);

        await supabase
          .from('user_creatures')
          .insert({
            user_id: user!.id,
            creature_id: creature.id,
            found_via: 'safari',
            nickname: null,
            equipped_cosmetics: [],
          });

        setPhase('success');
        setIsRevealing(false);
      }, 800);
    } else {
      setCreatureOffset(-2);
      const newAttempts = attemptsLeft - 1;
      setTimeout(async () => {
        setCreatureOffset(0);
        setAttemptsLeft(newAttempts);
        if (newAttempts <= 0) {
          await supabase
            .from('safari_tickets')
            .update({ used: true })
            .eq('id', selectedTicket.id);
          setPhase('failure');
        }
        setIsRevealing(false);
      }, 800);
    }
  };

  const handleReturnToTickets = () => {
    setPhase('tickets');
    setSelectedTier(null);
    setSelectedTicket(null);
    setCreature(null);
    setLastGuess(null);
    fetchTickets();
  };

  if (phase === 'tickets') {
    return (
      <AnimatedPage className="space-y-5 max-w-lg mx-auto">
        <h2 className="text-pixel-xl text-center font-pixel">Safari Zone</h2>

        <PixelFrame className="text-center">
          <div className="flex justify-center gap-6 mb-2">
            <div>
              <span className="text-lg">🔥</span>
              <span className="text-sm font-bold font-body ml-1">{streakLoading ? '...' : currentStreak}</span>
              <span className="text-xs text-theme-text-muted font-body ml-1">streak</span>
            </div>
            <div>
              <span className="text-lg">⭐</span>
              <span className="text-sm font-bold font-body ml-1">{streakLoading ? '...' : bestStreak}</span>
              <span className="text-xs text-theme-text-muted font-body ml-1">best</span>
            </div>
          </div>
          <p className="text-xs text-theme-text-muted font-body">
            Earn safari tickets by maintaining streaks: 3 days = Basic, 6 days = Premium, 10 days = Legendary
          </p>
        </PixelFrame>

        {loadingTickets ? (
          <PixelFrame className="text-center">
            <p className="text-sm text-theme-text-muted font-body">Loading tickets...</p>
          </PixelFrame>
        ) : tickets.length === 0 ? (
          <PixelFrame className="text-center py-6">
            <div className="text-[32px] mb-3">🎫</div>
            <p className="text-base font-bold font-body mb-2">No safari tickets!</p>
            <p className="text-sm text-theme-text-muted font-body">
              Keep your streak going to earn tickets.
            </p>
          </PixelFrame>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-center text-theme-text-muted font-body">Select a ticket tier to begin:</p>
            {([1, 2, 3] as const).map(tier => {
              const tierTickets = ticketsByTier[tier] || [];
              const info = TIER_INFO[tier];
              const isSelected = selectedTier === tier;
              const hasTickets = tierTickets.length > 0;

              return (
                <motion.div
                  key={tier}
                  whileHover={hasTickets ? { scale: 1.02 } : {}}
                  whileTap={hasTickets ? { scale: 0.98 } : {}}
                >
                  <PixelFrame>
                    <button
                      className={`w-full text-left p-2 rounded-button border-2 transition-all ${
                        isSelected
                          ? 'border-theme-warning bg-theme-warning/10'
                          : hasTickets
                            ? 'border-transparent hover:border-theme-border cursor-pointer'
                            : 'border-transparent opacity-40 cursor-not-allowed'
                      }`}
                      onClick={() => hasTickets && setSelectedTier(tier)}
                      disabled={!hasTickets}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold font-body" style={{ color: info.color }}>
                            {SAFARI_STREAK_TIERS[tier as keyof typeof SAFARI_STREAK_TIERS].label}
                          </span>
                          <span className="text-xs text-theme-text-muted font-body ml-2">Tier {tier}</span>
                        </div>
                        <span className="text-sm font-bold font-body" style={{ color: info.color }}>
                          x{tierTickets.length}
                        </span>
                      </div>
                      <p className="text-xs text-theme-text-muted font-body mt-1">{info.description}</p>
                    </button>
                  </PixelFrame>
                </motion.div>
              );
            })}

            <div className="text-center pt-2">
              <PixelButton size="lg" disabled={!selectedTier} onClick={handleStartSafari}>
                🌿 Start Safari
              </PixelButton>
            </div>
          </div>
        )}
      </AnimatedPage>
    );
  }

  if (phase === 'encounter' && creature) {
    const rarityColor = RARITY_COLORS[creature.rarity];

    return (
      <AnimatedPage className="space-y-5 max-w-lg mx-auto">
        <h2 className="text-pixel-xl text-center font-pixel">Safari Encounter</h2>

        {/* Attempts */}
        <div className="text-center text-xl tracking-widest">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <motion.span
              key={i}
              animate={i >= attemptsLeft ? { scale: 0.8, opacity: 0.3 } : { scale: 1, opacity: 1 }}
            >
              {i < attemptsLeft ? '❤️' : '🖤'}
            </motion.span>
          ))}
        </div>

        {/* Creature display */}
        <PixelFrame className="text-center">
          <p className="text-sm text-theme-text-muted font-body mb-3">A wild creature appeared!</p>
          <div className="flex justify-center mb-3">
            <motion.div
              animate={{ y: creatureOffset * -4 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <div
                className="w-20 h-20 mx-auto rounded-xl border-2 border-theme-border shadow-soft-md flex items-center justify-center"
                style={{ backgroundColor: rarityColor + '40' }}
              >
                <span className="text-[28px]">?</span>
              </div>
            </motion.div>
          </div>
          <RarityBadge rarity={creature.rarity} />
          <p className="text-xs text-theme-text-muted font-body mt-2">
            Choose a food to lure the creature...
          </p>
        </PixelFrame>

        {/* Feedback */}
        <AnimatePresence>
          {lastGuess && (
            <motion.div
              className="text-center text-sm font-body"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {lastGuess.correct ? (
                <span className="text-theme-success font-bold">The creature loves it! It approaches happily!</span>
              ) : (
                <span className="text-theme-danger font-bold">
                  Wrong food! The creature backs away...
                  {attemptsLeft > 0 && ` (${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left)`}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Food choices */}
        <div className="flex justify-center gap-4">
          {FOODS.map(food => (
            <motion.button
              key={food.id}
              onClick={() => handleFoodChoice(food.id)}
              disabled={isRevealing}
              className="bg-theme-surface border-2 border-theme-border rounded-card shadow-soft-md p-3 w-24
                cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-[28px] mb-1">{food.emoji}</div>
              <div className="text-xs font-bold font-body">{food.name}</div>
            </motion.button>
          ))}
        </div>
      </AnimatedPage>
    );
  }

  if (phase === 'success' && creature) {
    const rarityColor = RARITY_COLORS[creature.rarity];

    return (
      <AnimatedPage className="space-y-5 max-w-lg mx-auto">
        <motion.h2
          className="text-pixel-xl text-center font-pixel"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
        >
          🎉 Caught!
        </motion.h2>

        <PixelFrame className="text-center">
          <motion.div
            className="w-24 h-24 mx-auto rounded-xl border-2 border-theme-border shadow-soft-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: rarityColor + '60' }}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
          >
            <img
              src={creature.spritePath}
              alt={creature.name}
              className="w-20 h-20"
              style={{ imageRendering: 'pixelated' }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </motion.div>
          <h3 className="text-lg font-bold font-body mb-1">{creature.name}</h3>
          <RarityBadge rarity={creature.rarity} />
          <p className="text-sm text-theme-text-muted font-body mt-2 max-w-xs mx-auto">{creature.description}</p>
          <motion.p
            className="text-sm text-theme-success font-bold font-body mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Added to your collection!
          </motion.p>
        </PixelFrame>

        <div className="text-center">
          <PixelButton size="lg" onClick={handleReturnToTickets}>
            Back to Safari
          </PixelButton>
        </div>
      </AnimatedPage>
    );
  }

  if (phase === 'failure' && creature) {
    return (
      <AnimatedPage className="space-y-5 max-w-lg mx-auto">
        <h2 className="text-pixel-xl text-center font-pixel">Escaped!</h2>

        <PixelFrame className="text-center py-6">
          <motion.div
            className="text-[48px] mb-3"
            animate={{ x: [0, 20, 40, 60], opacity: [1, 0.7, 0.3, 0] }}
            transition={{ duration: 1.5 }}
          >
            💨
          </motion.div>
          <p className="text-base font-bold font-body mb-2">The creature escaped!</p>
          <p className="text-sm text-theme-text-muted font-body">
            The wild {creature.name} disappeared into the brush. Better luck next time!
          </p>
          <p className="text-xs text-theme-text-muted font-body mt-2">
            Tip: Each encounter is random — try different foods!
          </p>
        </PixelFrame>

        <div className="text-center">
          <PixelButton size="lg" onClick={handleReturnToTickets}>
            Back to Safari
          </PixelButton>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <div className="text-center">
      <p className="text-sm text-theme-text-muted font-body">Loading safari...</p>
    </div>
  );
}
