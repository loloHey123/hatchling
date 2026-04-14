/**
 * Creature Care System (Tamagotchi-style, purely positive)
 *
 * Key design principles:
 * - NO punishment. Creatures are always baseline happy.
 * - Feeding/playing gives TEMPORARY happiness boosts with cute animations.
 * - Items are fun, not survival necessities.
 * - Think "petting a dog in a game" — you do it because it's cute.
 * - Currency comes from milestones, achievements, hatching — not shopping pressure.
 */

export type CareCategory = 'food' | 'toy' | 'clothing' | 'shelter';

export interface CareItemDef {
  id: number;
  name: string;
  category: CareCategory;
  icon: string;
  price: number;           // virtual currency
  happinessBoost: number;  // 1-5 hearts
  description: string;
  animation: 'bounce' | 'spin' | 'hearts' | 'sparkle' | 'confetti';
}

export const CARE_ITEMS: CareItemDef[] = [
  // Food (6) — gives instant happiness animation
  { id: 101, name: 'Berry Snack',    category: 'food', icon: '🍓', price: 100,  happinessBoost: 1, description: 'A sweet little berry treat.',      animation: 'hearts' },
  { id: 102, name: 'Honey Cake',     category: 'food', icon: '🍰', price: 250,  happinessBoost: 2, description: 'Fluffy cake drizzled with honey.',  animation: 'hearts' },
  { id: 103, name: 'Golden Apple',   category: 'food', icon: '🍎', price: 500,  happinessBoost: 3, description: 'A rare golden apple. Delicious!',   animation: 'sparkle' },
  { id: 104, name: 'Star Cookie',    category: 'food', icon: '🍪', price: 150,  happinessBoost: 1, description: 'Star-shaped cookie with sprinkles.', animation: 'hearts' },
  { id: 105, name: 'Rainbow Juice',  category: 'food', icon: '🧃', price: 300,  happinessBoost: 2, description: 'Juice that shimmers in all colors.', animation: 'sparkle' },
  { id: 106, name: 'Royal Feast',    category: 'food', icon: '🍱', price: 1000, happinessBoost: 5, description: 'A feast fit for a Mythic creature!', animation: 'confetti' },

  // Toys (5) — triggers play animation
  { id: 201, name: 'Bouncy Ball',    category: 'toy', icon: '⚽', price: 200,  happinessBoost: 2, description: 'A colorful ball that never stops bouncing.', animation: 'bounce' },
  { id: 202, name: 'Pixel Puzzle',   category: 'toy', icon: '🧩', price: 350,  happinessBoost: 2, description: 'A brain-teasing pixel puzzle.',            animation: 'spin' },
  { id: 203, name: 'Music Box',      category: 'toy', icon: '🎵', price: 500,  happinessBoost: 3, description: 'Plays a soothing 8-bit melody.',            animation: 'sparkle' },
  { id: 204, name: 'Kite',           category: 'toy', icon: '🪁', price: 400,  happinessBoost: 3, description: 'Soar through the pixel skies!',             animation: 'bounce' },
  { id: 205, name: 'Treasure Map',   category: 'toy', icon: '🗺️', price: 750,  happinessBoost: 4, description: 'Adventure awaits! X marks the spot.',      animation: 'confetti' },

  // Clothing (5) — equippable cosmetic + happiness boost
  { id: 301, name: 'Cozy Scarf',     category: 'clothing', icon: '🧣', price: 300,  happinessBoost: 2, description: 'A warm and cozy pixel scarf.',       animation: 'hearts' },
  { id: 302, name: 'Tiny Crown',     category: 'clothing', icon: '👑', price: 800,  happinessBoost: 3, description: 'Every creature deserves a crown.',    animation: 'sparkle' },
  { id: 303, name: 'Flower Bow',     category: 'clothing', icon: '🎀', price: 250,  happinessBoost: 1, description: 'An adorable flower-patterned bow.',   animation: 'hearts' },
  { id: 304, name: 'Hero Cape',      category: 'clothing', icon: '🦸', price: 600,  happinessBoost: 3, description: 'For the bravest of creatures!',       animation: 'sparkle' },
  { id: 305, name: 'Star Glasses',   category: 'clothing', icon: '🕶️', price: 400,  happinessBoost: 2, description: 'Too cool for impulse purchases.',    animation: 'spin' },

  // Shelter items (4) — decorative, gives warm fuzzies
  { id: 401, name: 'Cozy Bed',       category: 'shelter', icon: '🛏️', price: 500,  happinessBoost: 3, description: 'The softest bed for sweet dreams.',    animation: 'hearts' },
  { id: 402, name: 'Night Light',    category: 'shelter', icon: '🌙', price: 350,  happinessBoost: 2, description: 'A warm glow for peaceful nights.',     animation: 'sparkle' },
  { id: 403, name: 'Mini Garden',    category: 'shelter', icon: '🌻', price: 600,  happinessBoost: 3, description: 'A tiny garden with pixel flowers.',    animation: 'sparkle' },
  { id: 404, name: 'Pixel Poster',   category: 'shelter', icon: '🖼️', price: 200,  happinessBoost: 1, description: 'A cute poster for the den wall.',     animation: 'hearts' },
];

export const CARE_ITEM_MAP = new Map(CARE_ITEMS.map(i => [i.id, i]));

export const CARE_CATEGORY_LABELS: Record<CareCategory, string> = {
  food: 'Food',
  toy: 'Toys',
  clothing: 'Clothing',
  shelter: 'Shelter',
};

export const CARE_CATEGORY_ICONS: Record<CareCategory, string> = {
  food: '🍽️',
  toy: '🎮',
  clothing: '👕',
  shelter: '🏠',
};
