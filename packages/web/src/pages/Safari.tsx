import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useStreak } from '../hooks/useStreak';
import { PixelFrame } from '../components/PixelFrame';
import { PixelButton } from '../components/PixelButton';
import { RarityBadge } from '../components/RarityBadge';
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

const TIER_INFO: Record<number, { label: string; color: string; bgColor: string; description: string }> = {
  1: { label: 'Basic', color: '#a8a878', bgColor: '#f5f5e8', description: 'Common & Uncommon safari creatures' },
  2: { label: 'Premium', color: '#6890f0', bgColor: '#e8f0ff', description: 'Uncommon & Rare safari creatures' },
  3: { label: 'Legendary', color: '#f8d030', bgColor: '#fff8e0', description: 'Rare, Legendary & Mythic safari creatures' },
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

function getCreaturePreference(creatureId: number): number {
  return creatureId % 3;
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

  // Encounter state
  const [creature, setCreature] = useState<CreatureDef | null>(null);
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
    setAttemptsLeft(MAX_ATTEMPTS);
    setLastGuess(null);
    setCreatureOffset(0);
    setPhase('encounter');
  };

  const handleFoodChoice = async (foodId: number) => {
    if (!creature || !selectedTicket || isRevealing) return;

    const preference = getCreaturePreference(creature.id);
    const correct = foodId === preference;

    setIsRevealing(true);
    setLastGuess({ foodId, correct });

    if (correct) {
      // Creature caught — animate approach
      setCreatureOffset(3);
      setTimeout(async () => {
        // Mark ticket as used
        await supabase
          .from('safari_tickets')
          .update({ used: true })
          .eq('id', selectedTicket.id);

        // Add creature to collection
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
      // Creature backs away
      setCreatureOffset(-2);
      const newAttempts = attemptsLeft - 1;
      setTimeout(async () => {
        setCreatureOffset(0);
        setAttemptsLeft(newAttempts);
        if (newAttempts <= 0) {
          // All attempts used — creature escapes
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

  // --- Render ---

  if (phase === 'tickets') {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <h2 className="text-pixel-xl text-center">🌿 Safari Zone</h2>

        {/* Streak info */}
        <PixelFrame className="text-center">
          <p className="text-pixel-sm mb-1">
            Current Streak: <span className="text-theme-warning font-bold">{streakLoading ? '...' : currentStreak}</span>
            {' '} | Best: <span className="text-theme-success font-bold">{streakLoading ? '...' : bestStreak}</span>
          </p>
          <p className="text-pixel-xs text-theme-text-muted">
            Earn safari tickets by maintaining streaks: 3-streak = Basic, 6-streak = Premium, 10-streak = Legendary
          </p>
        </PixelFrame>

        {/* Tickets */}
        {loadingTickets ? (
          <PixelFrame className="text-center">
            <p className="text-pixel-sm text-theme-text-muted">Loading tickets...</p>
          </PixelFrame>
        ) : tickets.length === 0 ? (
          <PixelFrame className="text-center">
            <div className="text-[24px] mb-3">🎫</div>
            <p className="text-pixel-base mb-2">No safari tickets!</p>
            <p className="text-pixel-sm text-theme-text-muted">
              Keep your streak going to earn tickets. A 3-day streak earns a Basic ticket,
              6-day earns Premium, and 10-day earns Legendary.
            </p>
          </PixelFrame>
        ) : (
          <div className="space-y-3">
            <p className="text-pixel-sm text-center text-theme-text-muted">Select a ticket tier to begin:</p>
            {([1, 2, 3] as const).map(tier => {
              const tierTickets = ticketsByTier[tier] || [];
              const info = TIER_INFO[tier];
              const isSelected = selectedTier === tier;
              const hasTickets = tierTickets.length > 0;

              return (
                <PixelFrame key={tier}>
                  <button
                    className={`w-full text-left p-2 border-2 transition-colors ${
                      isSelected
                        ? 'border-theme-warning bg-[#fff8d0]'
                        : hasTickets
                          ? 'border-transparent hover:border-[#ccc] cursor-pointer'
                          : 'border-transparent opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => hasTickets && setSelectedTier(tier)}
                    disabled={!hasTickets}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span
                          className="text-pixel-base font-bold font-pixel"
                          style={{ color: info.color }}
                        >
                          {SAFARI_STREAK_TIERS[tier as keyof typeof SAFARI_STREAK_TIERS].label}
                        </span>
                        <span className="text-pixel-sm text-theme-text-muted ml-2">Tier {tier}</span>
                      </div>
                      <span className="text-pixel-base font-bold font-pixel" style={{ color: info.color }}>
                        x{tierTickets.length}
                      </span>
                    </div>
                    <p className="text-pixel-xs text-theme-text-muted mt-1">{info.description}</p>
                  </button>
                </PixelFrame>
              );
            })}

            <div className="text-center pt-2">
              <PixelButton
                size="lg"
                disabled={!selectedTier}
                onClick={handleStartSafari}
              >
                🌿 Start Safari
              </PixelButton>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'encounter' && creature) {
    const rarityColor = RARITY_COLORS[creature.rarity];

    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <h2 className="text-pixel-xl text-center">🌿 Safari Encounter</h2>

        {/* Attempts indicator */}
        <div className="text-center text-pixel-lg tracking-widest">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
            <span key={i}>{i < attemptsLeft ? '❤️' : '🖤'}</span>
          ))}
        </div>

        {/* Creature display */}
        <PixelFrame className="text-center">
          <p className="text-pixel-sm text-theme-text-muted mb-3">A wild creature appeared!</p>
          <div className="flex justify-center mb-3">
            <div
              className="transition-transform duration-500 ease-out"
              style={{ transform: `translateY(${creatureOffset * -4}px)` }}
            >
              {/* Creature silhouette / colored placeholder — rarity color is game logic */}
              <div
                className="w-20 h-20 mx-auto border-[3px] border-theme-border shadow-pixel-md flex items-center justify-center"
                style={{ backgroundColor: rarityColor, opacity: 0.7 }}
              >
                <span className="text-[24px]">?</span>
              </div>
            </div>
          </div>
          <RarityBadge rarity={creature.rarity} />
          <p className="text-pixel-sm text-theme-text-muted mt-2">
            Choose a food to lure the creature...
          </p>
        </PixelFrame>

        {/* Feedback */}
        {lastGuess && (
          <div className={`text-center text-pixel-sm font-pixel transition-opacity ${isRevealing ? 'opacity-100' : 'opacity-0'}`}>
            {lastGuess.correct ? (
              <span className="text-theme-success">The creature loves it! It approaches happily!</span>
            ) : (
              <span className="text-theme-danger">
                Wrong food! The creature backs away cautiously...
                {attemptsLeft > 0 && ` (${attemptsLeft} ${attemptsLeft === 1 ? 'try' : 'tries'} left)`}
              </span>
            )}
          </div>
        )}

        {/* Food choices */}
        <div className="flex justify-center gap-4">
          {FOODS.map(food => (
            <button
              key={food.id}
              onClick={() => handleFoodChoice(food.id)}
              disabled={isRevealing}
              className={`
                bg-theme-surface border-[3px] border-theme-border shadow-pixel-md p-3 w-24
                cursor-pointer hover:bg-[#fff8d0] active:shadow-pixel-pressed
                active:translate-x-[2px] active:translate-y-[2px] transition-all duration-100
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <div className="text-[24px] mb-1">{food.emoji}</div>
              <div className="text-pixel-sm font-pixel">{food.name}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === 'success' && creature) {
    const rarityColor = RARITY_COLORS[creature.rarity];

    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <h2 className="text-pixel-xl text-center">🎉 Caught!</h2>

        <PixelFrame className="text-center">
          <div
            className="w-24 h-24 mx-auto border-[3px] border-theme-border shadow-pixel-lg flex items-center justify-center mb-3"
            style={{ backgroundColor: rarityColor }}
          >
            <img
              src={creature.spritePath}
              alt={creature.name}
              className="w-20 h-20 image-rendering-pixelated"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          <h3 className="text-pixel-lg font-bold mb-1">{creature.name}</h3>
          <RarityBadge rarity={creature.rarity} />
          <p className="text-pixel-sm text-theme-text-muted mt-2 max-w-xs mx-auto">{creature.description}</p>
          <p className="text-pixel-base text-theme-success font-bold mt-3">Added to your collection!</p>
        </PixelFrame>

        <div className="text-center">
          <PixelButton size="lg" onClick={handleReturnToTickets}>
            Back to Safari
          </PixelButton>
        </div>
      </div>
    );
  }

  if (phase === 'failure' && creature) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <h2 className="text-pixel-xl text-center">💨 Escaped!</h2>

        <PixelFrame className="text-center">
          <div className="text-[40px] mb-3 opacity-40">💨</div>
          <p className="text-pixel-base mb-2">The creature escaped!</p>
          <p className="text-pixel-sm text-theme-text-muted">
            The wild {creature.name} disappeared into the brush.
            Better luck next time!
          </p>
          <p className="text-pixel-xs text-[#aaa] mt-2">
            Tip: Each creature has a favorite food. Try to remember which ones work!
          </p>
        </PixelFrame>

        <div className="text-center">
          <PixelButton size="lg" onClick={handleReturnToTickets}>
            Back to Safari
          </PixelButton>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className="text-center">
      <p className="text-pixel-sm text-theme-text-muted">Loading safari...</p>
    </div>
  );
}
