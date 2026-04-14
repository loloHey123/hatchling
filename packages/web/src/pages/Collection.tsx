import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Rarity } from '@hatchling/shared';
import { RARITY_NAMES, RARITY_COLORS } from '@hatchling/shared';
import { PixelFrame } from '../components/PixelFrame';
import { CreatureCard } from '../components/CreatureCard';
import { AnimatedPage } from '../components/AnimatedPage';
import { CREATURES, TOTAL_CREATURES } from '../data/creatures';
import { useCreatures } from '../hooks/useCreatures';

type OwnershipFilter = 'all' | 'owned' | 'missing';
type RarityFilter = 'all' | Rarity;

export function Collection() {
  const navigate = useNavigate();
  const { ownedCreatures, loading } = useCreatures();
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all');
  const [ownershipFilter, setOwnershipFilter] = useState<OwnershipFilter>('all');
  const [safariOnly, setSafariOnly] = useState(false);

  const ownedSet = useMemo(() => {
    const set = new Set<number>();
    for (const uc of ownedCreatures) set.add(uc.creature_id);
    return set;
  }, [ownedCreatures]);

  const countMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const uc of ownedCreatures) map.set(uc.creature_id, (map.get(uc.creature_id) ?? 0) + 1);
    return map;
  }, [ownedCreatures]);

  const ownedCount = ownedSet.size;
  const progressPct = Math.round((ownedCount / TOTAL_CREATURES) * 100);

  const filteredCreatures = useMemo(() => {
    return CREATURES.filter((c) => {
      if (rarityFilter !== 'all' && c.rarity !== rarityFilter) return false;
      if (ownershipFilter === 'owned' && !ownedSet.has(c.id)) return false;
      if (ownershipFilter === 'missing' && ownedSet.has(c.id)) return false;
      if (safariOnly && !c.safariOnly) return false;
      return true;
    });
  }, [rarityFilter, ownershipFilter, safariOnly, ownedSet]);

  const rarityOptions: { label: string; value: RarityFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Common', value: 1 },
    { label: 'Uncommon', value: 2 },
    { label: 'Rare', value: 3 },
    { label: 'Legendary', value: 4 },
    { label: 'Mythic', value: 5 },
  ];

  const ownershipOptions: { label: string; value: OwnershipFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Owned', value: 'owned' },
    { label: 'Missing', value: 'missing' },
  ];

  const filterButtonClass = (active: boolean, color?: string) =>
    `text-xs px-2.5 py-1 border-2 rounded-button font-body font-semibold cursor-pointer transition-all duration-150 ${
      active
        ? 'text-white border-transparent shadow-soft-sm'
        : 'bg-theme-surface text-theme-text-muted border-theme-border hover:border-theme-text-muted'
    }`;

  return (
    <AnimatedPage className="max-w-4xl mx-auto space-y-4">
      {/* Progress header */}
      <PixelFrame>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-pixel-lg font-pixel">Collection</h2>
          <span className="text-sm font-bold font-body text-theme-text-muted">
            {ownedCount} / {TOTAL_CREATURES}
          </span>
        </div>
        <div className="w-full h-4 bg-theme-bg rounded-full border border-theme-border overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-success), var(--color-accent-secondary))' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-theme-text-muted mt-1.5 font-body">{progressPct}% complete</p>
      </PixelFrame>

      {/* Filters */}
      <PixelFrame>
        <div className="mb-3">
          <p className="text-xs font-semibold font-body text-theme-text-muted mb-1.5">Rarity</p>
          <div className="flex flex-wrap gap-1.5">
            {rarityOptions.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setRarityFilter(opt.value)}
                className={filterButtonClass(rarityFilter === opt.value)}
                style={
                  rarityFilter === opt.value && opt.value !== 'all'
                    ? { backgroundColor: RARITY_COLORS[opt.value as Rarity] }
                    : rarityFilter === opt.value
                      ? { backgroundColor: 'var(--color-accent)' }
                      : undefined
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <p className="text-xs font-semibold font-body text-theme-text-muted mb-1.5">Status</p>
          <div className="flex flex-wrap gap-1.5">
            {ownershipOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOwnershipFilter(opt.value)}
                className={filterButtonClass(ownershipFilter === opt.value)}
                style={ownershipFilter === opt.value ? { backgroundColor: 'var(--color-accent)' } : undefined}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={safariOnly}
            onChange={(e) => setSafariOnly(e.target.checked)}
            className="w-3.5 h-3.5 rounded accent-[var(--color-success)]"
          />
          <span className="text-xs font-body font-semibold text-theme-text-muted">Safari-only creatures</span>
        </label>
      </PixelFrame>

      {/* Creature grid */}
      {loading ? (
        <PixelFrame>
          <p className="text-sm text-theme-text-muted font-body text-center py-4">Loading collection...</p>
        </PixelFrame>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {filteredCreatures.map((creature, i) => {
              const owned = ownedSet.has(creature.id);
              return (
                <motion.div
                  key={creature.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i * 0.01, 0.3) }}
                >
                  <CreatureCard
                    creature={creature}
                    owned={owned}
                    count={countMap.get(creature.id) ?? 0}
                    onClick={owned ? () => navigate(`/collection/${creature.id}`) : undefined}
                  />
                </motion.div>
              );
            })}
          </div>
          {filteredCreatures.length === 0 && (
            <PixelFrame className="mt-4">
              <p className="text-sm text-theme-text-muted font-body text-center py-2">
                No creatures match your filters.
              </p>
            </PixelFrame>
          )}
        </>
      )}
    </AnimatedPage>
  );
}
