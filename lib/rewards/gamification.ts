/**
 * Gamification Helpers
 * 
 * Functions for gamification features:
 * - Welcome bonus
 * - Upload limits
 * - Leaderboard
 * - Tier progression
 */

import { getSupabaseClient } from '@/lib/auth/supabase';

export interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  points: number;
  tier: string;
  weekly_points: number;
  rank: number;
}

export interface TierInfo {
  name: string;
  min: number;
  max: number;
  multiplier: number;
  color: string;
  benefits: string[];
}

export const TIERS: TierInfo[] = [
  {
    name: 'Bronze',
    min: 0,
    max: 999,
    multiplier: 1.0,
    color: 'orange',
    benefits: ['1x points on uploads', 'Access to basic perks'],
  },
  {
    name: 'Silver',
    min: 1000,
    max: 2499,
    multiplier: 1.1,
    color: 'gray',
    benefits: ['1.1x points on uploads', '5% off perks'],
  },
  {
    name: 'Gold',
    min: 2500,
    max: 4999,
    multiplier: 1.25,
    color: 'yellow',
    benefits: ['1.25x points on uploads', '10% off perks', 'Priority support'],
  },
  {
    name: 'Platinum',
    min: 5000,
    max: Infinity,
    multiplier: 1.5,
    color: 'purple',
    benefits: ['1.5x points on uploads', '15% off perks', 'Exclusive perks access', 'VIP badge'],
  },
];

export const RECEIPT_LIMIT_FREE = 15; // Free tier monthly limit

/**
 * Get monthly receipt count for a user
 */
export async function getMonthlyReceiptCount(userId: string): Promise<number> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.rpc('get_monthly_receipt_count', {
      p_user_id: userId,
    });

    if (error) {
      console.error('Error fetching monthly receipt count:', error);
      return 0;
    }

    return data || 0;
  } catch (error) {
    console.error('Unexpected error fetching receipt count:', error);
    return 0;
  }
}

/**
 * Get weekly leaderboard (top 50)
 */
export async function getWeeklyLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leaderboard_weekly')
      .select('*')
      .limit(limit);

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching leaderboard:', error);
    return [];
  }
}

/**
 * Get user's rank on leaderboard
 */
export async function getUserRank(userId: string): Promise<LeaderboardEntry | null> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leaderboard_weekly')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error fetching user rank:', error);
    return null;
  }
}

/**
 * Calculate tier based on total points earned
 */
export function calculateTier(totalPointsEarned: number): TierInfo {
  return TIERS.find(
    t => totalPointsEarned >= t.min && totalPointsEarned <= t.max
  ) || TIERS[0];
}

/**
 * Get next tier info
 */
export function getNextTier(currentTierName: string): TierInfo | null {
  const currentIndex = TIERS.findIndex(t => t.name === currentTierName);
  if (currentIndex === -1 || currentIndex === TIERS.length - 1) {
    return null;
  }
  return TIERS[currentIndex + 1];
}

/**
 * Calculate progress to next tier
 */
export function calculateTierProgress(totalPointsEarned: number): {
  currentTier: TierInfo;
  nextTier: TierInfo | null;
  pointsToNext: number;
  percentage: number;
} {
  const currentTier = calculateTier(totalPointsEarned);
  const nextTier = getNextTier(currentTier.name);

  if (!nextTier) {
    return {
      currentTier,
      nextTier: null,
      pointsToNext: 0,
      percentage: 100,
    };
  }

  const pointsInCurrentTier = totalPointsEarned - currentTier.min;
  const pointsNeededForNextTier = nextTier.min - currentTier.min;
  const percentage = Math.min(
    (pointsInCurrentTier / pointsNeededForNextTier) * 100,
    100
  );
  const pointsToNext = nextTier.min - totalPointsEarned;

  return {
    currentTier,
    nextTier,
    pointsToNext,
    percentage,
  };
}

/**
 * Check if user can upload more receipts this month
 */
export async function canUploadReceipt(
  userId: string,
  isPremium: boolean
): Promise<{ allowed: boolean; count: number; limit: number; remaining: number }> {
  // Premium users have unlimited uploads
  if (isPremium) {
    const count = await getMonthlyReceiptCount(userId);
    return {
      allowed: true,
      count,
      limit: Infinity,
      remaining: Infinity,
    };
  }

  // Free users have a monthly limit
  const count = await getMonthlyReceiptCount(userId);
  const allowed = count < RECEIPT_LIMIT_FREE;
  const remaining = Math.max(RECEIPT_LIMIT_FREE - count, 0);

  return {
    allowed,
    count,
    limit: RECEIPT_LIMIT_FREE,
    remaining,
  };
}

/**
 * Get tier multiplier for points calculation
 */
export function getTierMultiplier(tierName: string): number {
  const tier = TIERS.find(t => t.name === tierName);
  return tier?.multiplier || 1.0;
}

/**
 * Calculate points with tier multiplier
 */
export function calculatePointsWithTier(
  basePoints: number,
  tierName: string,
  isPremium: boolean
): number {
  const tierMultiplier = getTierMultiplier(tierName);
  const premiumMultiplier = isPremium ? 1.5 : 1.0;
  
  // Tier multiplier and premium multiplier stack
  // Example: Gold tier (1.25x) + Premium (1.5x) = 1.875x total
  const totalMultiplier = tierMultiplier * premiumMultiplier;
  
  return Math.floor(basePoints * totalMultiplier);
}

/**
 * Check if user is new (just got welcome bonus)
 */
export function isNewUser(points: number, totalPointsEarned: number): boolean {
  // New user if they have exactly 100 points and 100 total earned (welcome bonus only)
  return points === 100 && totalPointsEarned === 100;
}

