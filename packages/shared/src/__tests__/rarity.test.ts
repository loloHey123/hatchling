import { describe, it, expect } from 'vitest';
import { calculateRarityWeights, pickRarity } from '../rarity';

describe('calculateRarityWeights', () => {
  it('returns base weights when price equals threshold', () => {
    const weights = calculateRarityWeights(5000, 5000);
    expect(weights[1]).toBe(50);
    expect(weights[2]).toBe(25);
    expect(weights[3]).toBe(15);
    expect(weights[4]).toBe(8);
    expect(weights[5]).toBe(2);
  });

  it('increases rare+ weights for prices above threshold', () => {
    const weights = calculateRarityWeights(15000, 5000); // $100 above threshold
    expect(weights[3]).toBeGreaterThan(15); // Rare boosted
    expect(weights[4]).toBeGreaterThan(8); // Legendary boosted
    expect(weights[5]).toBeGreaterThan(2); // Mythic boosted
    expect(weights[1]).toBe(50); // Common unchanged
    expect(weights[2]).toBe(25); // Uncommon unchanged
  });
});

describe('pickRarity', () => {
  it('returns a valid rarity value', () => {
    const weights = calculateRarityWeights(5000, 5000);
    const rarity = pickRarity(weights);
    expect([1, 2, 3, 4, 5]).toContain(rarity);
  });
});
