import type { CreatureDef, Rarity } from '@hatchling/shared';
import { RARITY_COLORS } from '@hatchling/shared';
import { RarityBadge } from './RarityBadge';

interface CreatureCardProps {
  creature: CreatureDef;
  owned: boolean;
  count?: number;
  onClick?: () => void;
}

export function CreatureCard({ creature, owned, count = 0, onClick }: CreatureCardProps) {
  return (
    <div
      onClick={onClick}
      className={`border-2 border-[#333] p-2 cursor-pointer transition-all hover:-translate-y-1
        ${owned ? 'bg-white shadow-[3px_3px_0_#333]' : 'bg-[#ddd] opacity-50 grayscale'}`}
    >
      <div className="relative">
        {/* Placeholder: colored square with creature initial */}
        <div
          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto border border-[#333] flex items-center justify-center text-white font-pixel text-[10px]"
          style={{
            backgroundColor: owned ? RARITY_COLORS[creature.rarity as Rarity] : '#999',
            imageRendering: 'pixelated',
          }}
        >
          {owned ? creature.name[0] : '?'}
        </div>
        {count > 1 && (
          <span className="absolute top-0 right-0 text-[6px] bg-[#333] text-white px-1 font-pixel">
            x{count}
          </span>
        )}
        {creature.safariOnly && owned && (
          <span className="absolute top-0 left-0 text-[8px]">🌿</span>
        )}
      </div>
      <div className="text-center mt-1">
        <div className="text-[6px] sm:text-[7px] truncate">{owned ? creature.name : '???'}</div>
        <div className="mt-1">
          <RarityBadge rarity={creature.rarity as Rarity} />
        </div>
      </div>
    </div>
  );
}
