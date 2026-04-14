/**
 * Savings Milestones
 *
 * Players earn bonus rewards when their total savings hits certain thresholds.
 * This solves the "success kills engagement" problem — even if you stop
 * impulse buying, your accumulated savings continue unlocking rewards.
 */

export interface MilestoneDef {
  id: string;
  amountCents: number;  // total savings threshold
  label: string;
  icon: string;
  xpReward: number;
  currencyReward: number;
  bonusTokens: number;
  description: string;
}

export const MILESTONES: MilestoneDef[] = [
  {
    id: 'save-25',
    amountCents: 2500,
    label: '$25 Saved',
    icon: '🌱',
    xpReward: 25,
    currencyReward: 250,
    bonusTokens: 0,
    description: 'Your savings journey begins!',
  },
  {
    id: 'save-50',
    amountCents: 5000,
    label: '$50 Saved',
    icon: '🌿',
    xpReward: 50,
    currencyReward: 500,
    bonusTokens: 1,
    description: 'Half a hundred! Keep it up.',
  },
  {
    id: 'save-100',
    amountCents: 10000,
    label: '$100 Saved',
    icon: '🌳',
    xpReward: 100,
    currencyReward: 1000,
    bonusTokens: 1,
    description: 'Triple digits! You\'re a natural.',
  },
  {
    id: 'save-250',
    amountCents: 25000,
    label: '$250 Saved',
    icon: '💎',
    xpReward: 150,
    currencyReward: 2500,
    bonusTokens: 2,
    description: 'A quarter grand! Impressive.',
  },
  {
    id: 'save-500',
    amountCents: 50000,
    label: '$500 Saved',
    icon: '🏆',
    xpReward: 250,
    currencyReward: 5000,
    bonusTokens: 3,
    description: 'Half a thousand saved!',
  },
  {
    id: 'save-1000',
    amountCents: 100000,
    label: '$1,000 Saved',
    icon: '👑',
    xpReward: 500,
    currencyReward: 10000,
    bonusTokens: 5,
    description: 'You did it! A thousand dollars saved.',
  },
  {
    id: 'save-2500',
    amountCents: 250000,
    label: '$2,500 Saved',
    icon: '🌟',
    xpReward: 750,
    currencyReward: 15000,
    bonusTokens: 5,
    description: 'You\'re a savings superstar!',
  },
  {
    id: 'save-5000',
    amountCents: 500000,
    label: '$5,000 Saved',
    icon: '🏔️',
    xpReward: 1000,
    currencyReward: 25000,
    bonusTokens: 10,
    description: 'Money mountain conquered!',
  },
];
