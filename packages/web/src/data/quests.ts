/**
 * Creature Quests / Expeditions
 *
 * Send creatures on timed real-hour missions.
 * Higher-rarity creatures have better odds of bonus rewards.
 * Creatures return with currency, items, or XP.
 */

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  durationHours: number;
  minLevel: number;         // trainer level required
  xpReward: number;
  currencyReward: number;
  bonusChance: number;      // 0-1, chance of extra reward
  bonusDescription: string;
  requiredRarity?: number;  // minimum creature rarity
}

export const QUESTS: QuestDef[] = [
  {
    id: 'meadow-forage',
    name: 'Meadow Foraging',
    description: 'Your creature explores the meadow looking for berries and coins.',
    icon: '🌸',
    durationHours: 1,
    minLevel: 1,
    xpReward: 30,
    currencyReward: 200,
    bonusChance: 0.2,
    bonusDescription: 'Found a rare berry!',
  },
  {
    id: 'forest-patrol',
    name: 'Forest Patrol',
    description: 'Patrol the forest paths and discover hidden treasures.',
    icon: '🌲',
    durationHours: 2,
    minLevel: 3,
    xpReward: 50,
    currencyReward: 400,
    bonusChance: 0.25,
    bonusDescription: 'Discovered a hidden cache!',
  },
  {
    id: 'cave-expedition',
    name: 'Cave Expedition',
    description: 'Venture into the crystal caves for precious gems.',
    icon: '🏔️',
    durationHours: 4,
    minLevel: 5,
    xpReward: 80,
    currencyReward: 750,
    bonusChance: 0.3,
    bonusDescription: 'Found sparkling crystals!',
  },
  {
    id: 'ocean-dive',
    name: 'Ocean Dive',
    description: 'Dive into the pixel ocean to explore sunken treasures.',
    icon: '🌊',
    durationHours: 3,
    minLevel: 7,
    xpReward: 70,
    currencyReward: 600,
    bonusChance: 0.25,
    bonusDescription: 'Recovered a sunken artifact!',
  },
  {
    id: 'sky-voyage',
    name: 'Sky Voyage',
    description: 'Soar above the clouds on a magical sky expedition.',
    icon: '☁️',
    durationHours: 6,
    minLevel: 10,
    xpReward: 100,
    currencyReward: 1000,
    bonusChance: 0.35,
    bonusDescription: 'Caught a shooting star!',
  },
  {
    id: 'volcano-challenge',
    name: 'Volcano Challenge',
    description: 'Only the bravest creatures attempt the volcanic depths.',
    icon: '🌋',
    durationHours: 8,
    minLevel: 12,
    xpReward: 150,
    currencyReward: 1500,
    bonusChance: 0.4,
    bonusDescription: 'Found ancient dragon scales!',
    requiredRarity: 3,
  },
  {
    id: 'starlight-quest',
    name: 'Starlight Quest',
    description: 'A legendary journey through the cosmos itself.',
    icon: '✨',
    durationHours: 12,
    minLevel: 15,
    xpReward: 250,
    currencyReward: 2500,
    bonusChance: 0.5,
    bonusDescription: 'Harvested stardust!',
    requiredRarity: 4,
  },
];

export const QUEST_MAP = new Map(QUESTS.map(q => [q.id, q]));
