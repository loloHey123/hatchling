import type { CreatureDef, Rarity } from '@hatchling/shared';
import { getCreatureSprite } from '@hatchling/shared';
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
      className={`border-2 border-theme-border p-2 cursor-pointer transition-all hover:-translate-y-1
        ${owned ? 'bg-theme-surface shadow-pixel-md' : 'bg-theme-bg opacity-50 grayscale'}`}
    >
      <div className="relative">
        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto flex items-center justify-center">
          {sprite ? (
            <PixelSprite sprite={sprite} scale={1} />
          ) : (
            <div
              className="w-8 h-8 border border-theme-border flex items-center justify-center text-pixel-sm text-theme-text"
              style={{ imageRendering: 'pixelated' }}
            >
              {owned ? creature.name[0] : '?'}
            </div>
          )}
        </div>
        {count > 1 && (
          <span className="absolute top-0 right-0 text-pixel-xs bg-theme-border text-theme-text px-1 font-pixel">
            x{count}
          </span>
        )}
        {creature.safariOnly && owned && (
          <span className="absolute top-0 left-0 text-pixel-sm">🌿</span>
        )}
      </div>
      <div className="text-center mt-1">
        <div className="text-pixel-xs truncate">{owned ? creature.name : '???'}</div>
        <div className="mt-1">
          <RarityBadge rarity={creature.rarity as Rarity} />
        </div>
      </div>
    </div>
  );
}
