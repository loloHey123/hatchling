import type { CreatureDef, Rarity } from '@hatchling/shared';
import { getCreatureSprite, RARITY_COLORS } from '@hatchling/shared';
import { RarityBadge } from './RarityBadge';
import { PixelSprite } from './PixelSprite';

interface CreatureCardProps {
  creature: CreatureDef;
  owned: boolean;
  count?: number;
  onClick?: () => void;
}

export function CreatureCard({ creature, owned, count = 0, onClick }: CreatureCardProps) {
  const sprite = getCreatureSprite(creature.id);

  return (
    <div
      onClick={onClick}
      className={`border-2 border-theme-border rounded-card p-2 cursor-pointer transition-all duration-200 hover:-translate-y-0.5
        ${owned ? 'bg-theme-surface shadow-soft-md hover:shadow-soft-lg' : 'bg-theme-bg opacity-40 grayscale'}`}
    >
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center">
          {sprite ? (
            <PixelSprite sprite={sprite} scale={1} />
          ) : (
            <div
              className="w-10 h-10 rounded-lg border border-theme-border flex items-center justify-center text-sm font-bold font-body"
              style={{
                backgroundColor: owned ? RARITY_COLORS[creature.rarity] + '30' : undefined,
                color: owned ? RARITY_COLORS[creature.rarity] : 'var(--color-text-muted)',
                imageRendering: 'pixelated',
              }}
            >
              {owned ? creature.name[0] : '?'}
            </div>
          )}
        </div>
        {count > 1 && (
          <span className="absolute top-0 right-0 text-[10px] bg-theme-accent text-white px-1.5 py-0.5 rounded-badge font-bold font-body">
            x{count}
          </span>
        )}
        {creature.safariOnly && owned && (
          <span className="absolute top-0 left-0 text-xs">🌿</span>
        )}
      </div>
      <div className="text-center mt-1.5">
        <div className="text-[10px] font-body font-semibold truncate">{owned ? creature.name : '???'}</div>
        <div className="mt-1">
          <RarityBadge rarity={creature.rarity as Rarity} />
        </div>
      </div>
    </div>
  );
}
