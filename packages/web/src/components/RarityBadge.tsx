import { RARITY_NAMES, RARITY_COLORS } from '@hatchling/shared';
import type { Rarity } from '@hatchling/shared';

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span
      className="text-[10px] px-2.5 py-0.5 rounded-badge text-white font-bold font-body inline-block tracking-wide"
      style={{ backgroundColor: RARITY_COLORS[rarity] }}
    >
      {RARITY_NAMES[rarity]}
    </span>
  );
}
