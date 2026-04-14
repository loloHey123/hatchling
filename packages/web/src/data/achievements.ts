/**
 * Achievement / Badge System
 *
 * 20 achievements across categories:
 * - Collection milestones
 * - Savings milestones
 * - Streak milestones
 * - Safari milestones
 * - Special achievements
 */

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'collection' | 'savings' | 'streak' | 'safari' | 'special';
  xpReward: number;
  currencyReward: number;  // virtual currency in cents
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Collection (5)
  {
    id: 'first-hatch',
    name: 'First Hatch',
    description: 'Hatch your very first egg',
    icon: '🐣',
    category: 'collection',
    xpReward: 50,
    currencyReward: 500,
  },
  {
    id: 'collector-10',
    name: 'Budding Collector',
    description: 'Collect 10 unique creatures',
    icon: '📚',
    category: 'collection',
    xpReward: 100,
    currencyReward: 1000,
  },
  {
    id: 'collector-50',
    name: 'Master Collector',
    description: 'Collect 50 unique creatures',
    icon: '🏛️',
    category: 'collection',
    xpReward: 250,
    currencyReward: 5000,
  },
  {
    id: 'rare-find',
    name: 'Rare Find',
    description: 'Hatch or catch a Rare creature',
    icon: '💎',
    category: 'collection',
    xpReward: 75,
    currencyReward: 1000,
  },
  {
    id: 'mythic-hunter',
    name: 'Mythic Hunter',
    description: 'Hatch or catch a Mythic creature',
    icon: '🌟',
    category: 'collection',
    xpReward: 200,
    currencyReward: 5000,
  },

  // Savings (5)
  {
    id: 'first-save',
    name: 'First Save',
    description: 'Resist your first impulse purchase',
    icon: '🛡️',
    category: 'savings',
    xpReward: 50,
    currencyReward: 500,
  },
  {
    id: 'saved-100',
    name: 'Penny Pincher',
    description: 'Save $100 total',
    icon: '💰',
    category: 'savings',
    xpReward: 100,
    currencyReward: 2000,
  },
  {
    id: 'saved-500',
    name: 'Savings Star',
    description: 'Save $500 total',
    icon: '⭐',
    category: 'savings',
    xpReward: 200,
    currencyReward: 5000,
  },
  {
    id: 'saved-1000',
    name: 'Thousand Club',
    description: 'Save $1,000 total',
    icon: '👑',
    category: 'savings',
    xpReward: 500,
    currencyReward: 10000,
  },
  {
    id: 'saved-5000',
    name: 'Money Mountain',
    description: 'Save $5,000 total',
    icon: '🏔️',
    category: 'savings',
    xpReward: 1000,
    currencyReward: 25000,
  },

  // Streak (4)
  {
    id: 'streak-3',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    category: 'streak',
    xpReward: 50,
    currencyReward: 500,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: '💪',
    category: 'streak',
    xpReward: 100,
    currencyReward: 1500,
  },
  {
    id: 'streak-30',
    name: 'Iron Will',
    description: 'Maintain a 30-day streak',
    icon: '🏆',
    category: 'streak',
    xpReward: 300,
    currencyReward: 5000,
  },
  {
    id: 'streak-100',
    name: 'Unbreakable',
    description: 'Maintain a 100-day streak',
    icon: '🔱',
    category: 'streak',
    xpReward: 1000,
    currencyReward: 15000,
  },

  // Safari (3)
  {
    id: 'first-catch',
    name: 'Safari Novice',
    description: 'Catch your first safari creature',
    icon: '🌿',
    category: 'safari',
    xpReward: 50,
    currencyReward: 500,
  },
  {
    id: 'safari-10',
    name: 'Safari Expert',
    description: 'Catch 10 safari creatures',
    icon: '🗺️',
    category: 'safari',
    xpReward: 150,
    currencyReward: 3000,
  },
  {
    id: 'safari-all',
    name: 'Safari Master',
    description: 'Catch all safari-exclusive creatures',
    icon: '🦁',
    category: 'safari',
    xpReward: 500,
    currencyReward: 10000,
  },

  // Special (3)
  {
    id: 'gacha-10',
    name: 'Lucky Puller',
    description: 'Pull the gacha machine 10 times',
    icon: '🎰',
    category: 'special',
    xpReward: 100,
    currencyReward: 1500,
  },
  {
    id: 'care-master',
    name: 'Best Friend',
    description: 'Feed or play with creatures 50 times',
    icon: '❤️',
    category: 'special',
    xpReward: 150,
    currencyReward: 3000,
  },
  {
    id: 'quest-complete-10',
    name: 'Adventurer',
    description: 'Complete 10 creature quests',
    icon: '⚔️',
    category: 'special',
    xpReward: 200,
    currencyReward: 5000,
  },
];

export const ACHIEVEMENT_MAP = new Map(ACHIEVEMENTS.map(a => [a.id, a]));

export const CATEGORY_LABELS: Record<string, string> = {
  collection: 'Collection',
  savings: 'Savings',
  streak: 'Streaks',
  safari: 'Safari',
  special: 'Special',
};

export const CATEGORY_COLORS: Record<string, string> = {
  collection: 'var(--color-rarity-rare)',
  savings: 'var(--color-success)',
  streak: 'var(--color-warning)',
  safari: 'var(--color-rarity-uncommon)',
  special: 'var(--color-rarity-mythic)',
};
