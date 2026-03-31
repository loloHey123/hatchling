import { RARITY_NAMES, RARITY_COLORS } from '@hatchling/shared';
import type { Rarity } from '@hatchling/shared';

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span
      className="text-[7px] px-2 py-1 border border-[#333] text-white font-bold font-pixel inline-block"
      style={{ backgroundColor: RARITY_COLORS[rarity] }}
    >
      {RARITY_NAMES[rarity]}
    </span>
  );
}
