import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Rarity } from '@hatchling/shared';
import { RARITY_NAMES, RARITY_COLORS } from '@hatchling/shared';
import { PixelFrame } from '../components/PixelFrame';
import { CreatureCard } from '../components/CreatureCard';
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
    for (const uc of ownedCreatures) {
      set.add(uc.creature_id);
    }
    return set;
  }, [ownedCreatures]);

  const countMap = useMemo(() => {
    const map = new Map<number, number>();
    for (const uc of ownedCreatures) {
      map.set(uc.creature_id, (map.get(uc.creature_id) ?? 0) + 1);
    }
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

  return (
    <div className="max-w-4xl mx-auto">
      <PixelFrame className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[14px] font-pixel">Collection</h2>
          <span className="text-[10px] font-pixel text-[#666]">
            {ownedCount} / {TOTAL_CREATURES}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-4 bg-[#e8e8e8] border-2 border-[#333]">
          <div
            className="h-full bg-[#78c850] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="text-[8px] text-[#888] mt-1 font-pixel">{progressPct}% complete</p>
      </PixelFrame>

      {/* Filters */}
      <PixelFrame className="mb-4">
        {/* Rarity filter */}
        <div className="mb-3">
          <p className="text-[8px] font-pixel text-[#666] mb-1">Rarity</p>
          <div className="flex flex-wrap gap-1">
            {rarityOptions.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setRarityFilter(opt.value)}
                className={`text-[7px] px-2 py-1 border-2 border-[#333] font-pixel cursor-pointer transition-colors
                  ${rarityFilter === opt.value
                    ? 'bg-[#333] text-white'
                    : 'bg-white text-[#333] hover:bg-[#f0f0f0]'
                  }`}
                style={
                  rarityFilter === opt.value && opt.value !== 'all'
                    ? { backgroundColor: RARITY_COLORS[opt.value as Rarity] }
                    : undefined
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ownership filter */}
        <div className="mb-3">
          <p className="text-[8px] font-pixel text-[#666] mb-1">Status</p>
          <div className="flex flex-wrap gap-1">
            {ownershipOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOwnershipFilter(opt.value)}
                className={`text-[7px] px-2 py-1 border-2 border-[#333] font-pixel cursor-pointer transition-colors
                  ${ownershipFilter === opt.value
                    ? 'bg-[#333] text-white'
                    : 'bg-white text-[#333] hover:bg-[#f0f0f0]'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Safari-only toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={safariOnly}
            onChange={(e) => setSafariOnly(e.target.checked)}
            className="w-3 h-3"
          />
          <span className="text-[8px] font-pixel text-[#666]">Safari-only creatures</span>
        </label>
      </PixelFrame>

      {/* Creature grid */}
      {loading ? (
        <PixelFrame>
          <p className="text-[9px] text-[#888] font-pixel text-center">Loading collection...</p>
        </PixelFrame>
      ) : (
        <>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {filteredCreatures.map((creature) => {
              const owned = ownedSet.has(creature.id);
              return (
                <CreatureCard
                  key={creature.id}
                  creature={creature}
                  owned={owned}
                  count={countMap.get(creature.id) ?? 0}
                  onClick={owned ? () => navigate(`/collection/${creature.id}`) : undefined}
                />
              );
            })}
          </div>
          {filteredCreatures.length === 0 && (
            <PixelFrame className="mt-4">
              <p className="text-[9px] text-[#888] font-pixel text-center">
                No creatures match your filters.
              </p>
            </PixelFrame>
          )}
        </>
      )}
    </div>
  );
}
