/**
 * Subscription Plans Configuration
 * 
 * Single source of truth for all premium plans in Dank Network
 */

export const PLANS = {
  NETWORK_PREMIUM: {
    id: 'network_premium',
    name: 'Network Premium',
    price: 4.20,
    interval: 'month',
    features: [
      'DankPass Rewards: 1.5x points multiplier',
      'DankPass Rewards: Unlimited receipt uploads',
      'DankPass Rewards: Exclusive premium perks',
      'Daily Dispo Deals: Full deals list access',
      'Daily Dispo Deals: Early access to new deals',
      'Priority customer support',
      'Access to future premium features',
    ],
    description: 'One subscription unlocks all premium features across Dank Network',
  },
} as const;

export type PlanId = keyof typeof PLANS;

