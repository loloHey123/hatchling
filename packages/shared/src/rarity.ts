import type { Rarity } from './types';
import { BASE_RARITY_WEIGHTS } from './constants';

export function calculateRarityWeights(
  priceInCents: number,
  thresholdInCents: number
): Record<Rarity, number> {
  const priceAboveThreshold = Math.max(0, priceInCents - thresholdInCents);
  const hundreds = priceAboveThreshold / 10000;

  const weights = { ...BASE_RARITY_WEIGHTS };
  weights[3] += hundreds * 1;
  weights[4] += hundreds * 0.5;
  weights[5] += hundreds * 0.2;

  return weights;
}

export function pickRarity(weights: Record<Rarity, number>): Rarity {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(weights)) {
    roll -= weight;
    if (roll <= 0) return Number(rarity) as Rarity;
  }
  return 1;
}
