/**
 * XP & Level System
 *
 * XP sources:
 * - Resist an impulse purchase: 25 XP
 * - Hatch an egg: 50 XP (+ rarity bonus)
 * - Catch a safari creature: 40 XP
 * - Complete a quest: 30-100 XP
 * - Hit a savings milestone: 100 XP
 * - Maintain streak (per day): 10 XP
 * - Feed/play with creature: 5 XP
 *
 * Level curve: each level requires progressively more XP.
 * Formula: XP needed = 100 * level^1.5 (rounded)
 */

export interface LevelDef {
  level: number;
  xpRequired: number;   // cumulative XP to reach this level
  title: string;
  unlock?: string;       // what gets unlocked at this level
}

export const XP_ACTIONS = {
  RESIST_PURCHASE: 25,
  HATCH_EGG: 50,
  HATCH_BONUS_UNCOMMON: 10,
  HATCH_BONUS_RARE: 25,
  HATCH_BONUS_LEGENDARY: 50,
  HATCH_BONUS_MYTHIC: 100,
  SAFARI_CATCH: 40,
  COMPLETE_QUEST: 30,
  SAVINGS_MILESTONE: 100,
  DAILY_STREAK: 10,
  FEED_CREATURE: 5,
  PLAY_CREATURE: 5,
  ACHIEVEMENT_UNLOCK: 50,
} as const;

export const LEVELS: LevelDef[] = [
  { level: 1,  xpRequired: 0,     title: 'Egg Finder',          unlock: 'Basic gacha access' },
  { level: 2,  xpRequired: 100,   title: 'Nest Builder' },
  { level: 3,  xpRequired: 260,   title: 'Hatchling Keeper' },
  { level: 4,  xpRequired: 500,   title: 'Creature Friend',     unlock: 'Safari Zone: Meadow' },
  { level: 5,  xpRequired: 800,   title: 'Thrift Apprentice',   unlock: 'Creature Care unlocked' },
  { level: 6,  xpRequired: 1170,  title: 'Savings Scout' },
  { level: 7,  xpRequired: 1600,  title: 'Budget Guardian',     unlock: 'Safari Zone: Forest' },
  { level: 8,  xpRequired: 2100,  title: 'Coin Collector' },
  { level: 9,  xpRequired: 2700,  title: 'Piggy Protector' },
  { level: 10, xpRequired: 3350,  title: 'Frugal Knight',       unlock: 'Quest system unlocked' },
  { level: 11, xpRequired: 4100,  title: 'Vault Keeper' },
  { level: 12, xpRequired: 4950,  title: 'Treasure Hunter',     unlock: 'Safari Zone: Cave' },
  { level: 13, xpRequired: 5900,  title: 'Wealth Wizard' },
  { level: 14, xpRequired: 6950,  title: 'Dragon Tamer' },
  { level: 15, xpRequired: 8100,  title: 'Mythic Seeker',       unlock: 'Safari Zone: Volcano' },
  { level: 16, xpRequired: 9400,  title: 'Fortune Master' },
  { level: 17, xpRequired: 10800, title: 'Legendary Trainer' },
  { level: 18, xpRequired: 12350, title: 'Elder Sage' },
  { level: 19, xpRequired: 14050, title: 'Champion of Savings' },
  { level: 20, xpRequired: 16000, title: 'Hatchling Legend',     unlock: 'Safari Zone: Sky Realm' },
];

export const MAX_LEVEL = LEVELS[LEVELS.length - 1].level;

export function getLevelForXP(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number; title: string } {
  let currentLevel = LEVELS[0];
  for (const lvl of LEVELS) {
    if (totalXP >= lvl.xpRequired) {
      currentLevel = lvl;
    } else {
      break;
    }
  }

  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1);
  const xpIntoLevel = totalXP - currentLevel.xpRequired;
  const xpNeeded = nextLevel ? nextLevel.xpRequired - currentLevel.xpRequired : 0;
  const progress = nextLevel ? Math.min(xpIntoLevel / xpNeeded, 1) : 1;

  return {
    level: currentLevel.level,
    currentLevelXP: xpIntoLevel,
    nextLevelXP: xpNeeded,
    progress,
    title: currentLevel.title,
  };
}
