export type Rarity = 1 | 2 | 3 | 4 | 5;

export const RARITY_NAMES: Record<Rarity, string> = {
  1: 'Common',
  2: 'Uncommon',
  3: 'Rare',
  4: 'Legendary',
  5: 'Mythic',
};

export interface CreatureDef {
  id: number;
  name: string;
  rarity: Rarity;
  spritePath: string;
  description: string;
  safariOnly: boolean;
}

export interface Egg {
  id: string;
  userId: string;
  creatureId: number;
  rarity: Rarity;
  sourceProductName: string;
  sourceProductPrice: number;
  sourceProductKeywords: string[];
  trackedUrls: string[];
  incubationStart: string;
  incubationEnd: string;
  status: 'incubating' | 'hatched' | 'destroyed';
}

export interface Token {
  id: string;
  userId: string;
  sourceProductName: string;
  sourceProductPrice: number;
  used: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  spendingThreshold: number;
  incubationDays: number;
  cooldownPurchaseCount: number;
  cooldownWindowHours: number;
  whitelistedDomains: string[];
  currencyBalance: number;
}

export interface TrackedProduct {
  id: string;
  userId: string;
  eggId: string;
  productName: string;
  productKeywords: string[];
  trackedUrls: string[];
  productPrice: number;
  trackingUntil: string;
  status: 'active' | 'completed' | 'violated';
}

export interface UserCreature {
  id: string;
  userId: string;
  creatureId: number;
  nickname: string | null;
  hatchedFromEgg: string | null;
  foundVia: 'egg' | 'safari';
  equippedCosmetics: number[];
  createdAt: string;
}

export interface Streak {
  currentStreak: number;
  bestStreak: number;
  lastSuccessAt: string | null;
}

export interface SavingsStats {
  totalSaved: number;
  weekSaved: number;
  monthSaved: number;
  yearSaved: number;
  totalEggsHatched: number;
  totalEggsDestroyed: number;
  creaturesCollected: number;
  totalCreatures: number;
}

export interface SiteConfig {
  name: string;
  matchPatterns: string[];
  hostPermissions: string[];
  detectProduct: (doc: Document) => { name: string; price: number; keywords: string[]; url: string } | null;
  detectAddToCart: (doc: Document) => HTMLElement | null;
  detectCheckout: (url: string) => boolean;
}
