'use client';

import { motion } from 'framer-motion';
import { Trophy, Crown, Medal, TrendingUp, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { getSupabaseClient } from '@/lib/auth/supabase';
import { PremiumBadge } from '@/components/subscription/PremiumBadge';
import Link from 'next/link';

interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  points: number;
  tier: string;
  weekly_points: number;
  rank: number;
}

export default function LeaderboardPage() {
  const { user, isAuthenticated } = useAuth();
  const { isPremium } = usePremium();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [user]);

  async function fetchLeaderboard() {
    try {
      const supabase = getSupabaseClient();
      
      // Fetch top 10 from leaderboard view
      const { data, error } = await supabase
        .from('leaderboard_weekly')
        .select('*')
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard:', error);
      } else {
        setLeaderboard(data || []);
        
        // Find current user's rank
        if (user) {
          const userEntry = data?.find(entry => entry.id === user.id);
          if (userEntry) {
            setUserRank(userEntry);
          } else {
            // User not in top 10, fetch their specific rank
            // For now, just show they're not ranked
            setUserRank(null);
          }
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <div className="w-6 h-6 flex items-center justify-center text-brand-subtle font-bold">#{rank}</div>;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/40';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/40';
      case 3:
        return 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/40';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen px-6 pt-16 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-brand-ink flex items-center gap-2">
              <Trophy className="w-6 h-6 text-brand-primary" />
              Leaderboard
            </h1>
            <Link href="/rewards" className="text-sm text-brand-primary hover:underline">
              Back to Dashboard
            </Link>
          </div>
          <p className="text-brand-subtle">Top earners this week</p>
        </div>

        {/* Your Rank Card */}
        {isAuthenticated && userRank && (
          <div className="card mb-6 bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border-brand-primary/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="font-semibold text-brand-ink">Your Rank</p>
                  <p className="text-sm text-brand-subtle">#{userRank.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-brand-primary">{userRank.weekly_points}</p>
                <p className="text-xs text-brand-subtle">points this week</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-12 bg-brand-bg rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = user?.id === entry.id;
              
              return (
                <motion.div
                  key={entry.id}
                  className={`card ${getRankColor(entry.rank)} ${isCurrentUser ? 'ring-2 ring-brand-primary' : ''}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-brand-ink truncate">
                          {entry.display_name || `User ${entry.id.substring(0, 8)}`}
                          {isCurrentUser && <span className="text-brand-primary ml-2">(You)</span>}
                        </p>
                        {/* Check if user is premium - you'd need to query this */}
                        {entry.rank <= 3 && <Crown className="w-4 h-4 text-brand-primary" />}
                      </div>
                      <p className="text-sm text-brand-subtle">{entry.tier} Tier</p>
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-brand-primary" />
                        <p className="text-xl font-bold text-brand-ink">{entry.weekly_points}</p>
                      </div>
                      <p className="text-xs text-brand-subtle">{entry.points} total</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Premium Upsell for Non-Top-10 Users */}
        {isAuthenticated && !userRank && !isPremium && (
          <div className="card mt-6 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-brand-primary/30">
            <div className="text-center py-6">
              <Crown className="w-12 h-12 text-brand-primary mx-auto mb-3" />
              <h3 className="font-semibold text-brand-ink mb-2">Want to climb the ranks?</h3>
              <p className="text-sm text-brand-subtle mb-4">
                Premium users earn 1.5x points on every upload!
              </p>
              <Link href="/rewards/premium" className="btn-primary btn-sm">
                Upgrade to Premium
              </Link>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-brand-card rounded-xl border border-brand-subtle/10">
          <h4 className="font-medium text-brand-ink mb-2">How Rankings Work</h4>
          <ul className="text-sm text-brand-subtle space-y-1">
            <li>• Rankings reset every Monday at midnight</li>
            <li>• Based on points earned this week (EARN transactions)</li>
            <li>• Upload receipts to earn points and climb the ranks</li>
            <li>• Premium users earn 1.5x points per receipt</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

