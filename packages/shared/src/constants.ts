import type { Rarity } from './types';

export const DEFAULT_THRESHOLD_CENTS = 5000;
export const DEFAULT_INCUBATION_DAYS = 14;
export const DEFAULT_COOLDOWN_COUNT = 3;
export const DEFAULT_COOLDOWN_HOURS = 24;

export const RARITY_COLORS: Record<Rarity, string> = {
  1: '#a8a878',
  2: '#78c850',
  3: '#6890f0',
  4: '#f8d030',
  5: '#f85888',
};

export const SAFARI_STREAK_TIERS = {
  1: { requiredStreak: 3, label: 'Basic Safari Ticket' },
  2: { requiredStreak: 6, label: 'Premium Safari Ticket' },
  3: { requiredStreak: 10, label: 'Legendary Safari Expedition' },
} as const;

export const BASE_RARITY_WEIGHTS: Record<Rarity, number> = {
  1: 50,
  2: 25,
  3: 15,
  4: 8,
  5: 2,
};

export const WHITELISTED_DOMAINS_DEFAULTS = [
  'instacart.com',
  'doordash.com',
  'ubereats.com',
  'grubhub.com',
  'walgreens.com',
  'cvs.com',
  'costco.com',
  'kroger.com',
  'safeway.com',
  'wholefoodsmarket.com',
  'chewy.com',
];
