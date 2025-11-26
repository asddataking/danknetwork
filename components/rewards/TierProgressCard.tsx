'use client';

import { motion } from 'framer-motion';
import { Trophy, Crown } from 'lucide-react';
import Link from 'next/link';

interface TierProgressProps {
  currentTier: string;
  totalPointsEarned: number;
  isPremium: boolean;
}

const TIER_CONFIG = {
  Bronze: { min: 0, max: 999, color: 'text-orange-600', bgColor: 'bg-orange-600/10', borderColor: 'border-orange-600/30' },
  Silver: { min: 1000, max: 2499, color: 'text-gray-400', bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400/30' },
  Gold: { min: 2500, max: 4999, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/30' },
  Platinum: { min: 5000, max: Infinity, color: 'text-purple-500', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-500/30' },
};

export function TierProgressCard({ currentTier, totalPointsEarned, isPremium }: TierProgressProps) {
  const tiers = [
    { name: 'Bronze', min: 0, max: 999 },
    { name: 'Silver', min: 1000, max: 2499 },
    { name: 'Gold', min: 2500, max: 4999 },
    { name: 'Platinum', min: 5000, max: Infinity },
  ];

  const currentTierIndex = tiers.findIndex(t => t.name === currentTier);
  const nextTier = tiers[currentTierIndex + 1];
  
  let progress = 0;
  let pointsToNext = 0;
  
  if (nextTier) {
    const currentTierMin = tiers[currentTierIndex].min;
    const needed = nextTier.min - currentTierMin;
    const earned = totalPointsEarned - currentTierMin;
    progress = Math.min((earned / needed) * 100, 100);
    pointsToNext = nextTier.min - totalPointsEarned;
  } else {
    progress = 100; // Max tier reached
  }

  const currentConfig = TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG];

  return (
    <div className={`card ${currentConfig.borderColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className={`w-5 h-5 ${currentConfig.color}`} />
            <h3 className="font-semibold text-brand-ink">{currentTier} Tier</h3>
            {isPremium && <Crown className="w-4 h-4 text-brand-primary" />}
          </div>
          <p className="text-sm text-brand-subtle">
            {totalPointsEarned.toLocaleString()} total points earned
          </p>
        </div>
        <Link href="/rewards/leaderboard" className="text-xs text-brand-primary hover:underline">
          View Ranks →
        </Link>
      </div>

      {nextTier ? (
        <>
          {/* Progress Bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-brand-subtle mb-1">
              <span>{currentTier}</span>
              <span>{nextTier.name}</span>
            </div>
            <div className="w-full bg-brand-bg rounded-full h-2 overflow-hidden">
              <motion.div
                className={`h-full ${currentConfig.bgColor.replace('/10', '')}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          <p className="text-xs text-brand-subtle">
            <span className="font-medium text-brand-ink">{pointsToNext.toLocaleString()} points</span> to {nextTier.name}
          </p>
        </>
      ) : (
        <div className="text-center py-2">
          <p className="text-sm font-medium text-brand-ink">🏆 Max Tier Reached!</p>
          <p className="text-xs text-brand-subtle">You're at the top!</p>
        </div>
      )}

      {/* Tier Benefits Hint */}
      <div className="mt-3 pt-3 border-t border-brand-subtle/10">
        <p className="text-xs text-brand-subtle">
          {currentTier} benefits: {getTierMultiplier(currentTier)}x points
        </p>
      </div>
    </div>
  );
}

function getTierMultiplier(tier: string): number {
  switch (tier) {
    case 'Bronze': return 1.0;
    case 'Silver': return 1.1;
    case 'Gold': return 1.25;
    case 'Platinum': return 1.5;
    default: return 1.0;
  }
}

