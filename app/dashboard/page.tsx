'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Upload, Camera, TrendingUp, Gift, User, 
  Star, Clock, CheckCircle, MapPin, Edit,
  Crown, Zap, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { getUserProfileWithPremium, getUserReceipts } from '@/lib/rewards/supabase';
import { ensureUserProfile } from '@/lib/auth/ensure-profile';
import CountUp from '@/components/rewards/CountUp';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface DashboardStats {
  points: number;
  tier: string;
  lastReceipt: {
    id: string;
    merchantName: string;
    amount: number;
    points: number;
    date: string;
    status: string;
  } | null;
  favoriteRetailer: {
    name: string;
    receipts: number;
    totalSpent: number;
  } | null;
  receiptsThisMonth: number;
  receiptsLimit: number;
}

export default function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCreated, setProfileCreated] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadDashboardData();
    }
  }, [authLoading, isAuthenticated, user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Ensure user profile exists (create if first time)
      await ensureUserProfile(user.id, user.email || undefined);
      let profile = await getUserProfileWithPremium(user.id);
      
      if (!profile) {
        // If still no profile, it's a first-time user
        setProfileCreated(true);
        // Set default stats for display
        profile = {
          points: 0,
          tier: 'Bronze',
          isPremium: false
        } as any;
      }

      // Load receipts
      const receipts = await getUserReceipts(user.id, 50);

      // Find last receipt
      const lastReceipt = receipts.length > 0 ? {
        id: receipts[0].id,
        merchantName: receipts[0].merchant_name || receipts[0].partner?.business_name || 'Unknown',
        amount: receipts[0].total || 0,
        points: receipts[0].points_awarded || 0,
        date: receipts[0].created_at,
        status: receipts[0].status
      } : null;

      // Find favorite retailer (most receipts from)
      const retailerCounts = new Map<string, { count: number; total: number }>();
      receipts.forEach((r: any) => {
        const merchant = r.merchant_name || r.partner?.business_name;
        if (merchant) {
          const current = retailerCounts.get(merchant) || { count: 0, total: 0 };
          retailerCounts.set(merchant, {
            count: current.count + 1,
            total: current.total + (r.total || 0)
          });
        }
      });

      let favoriteRetailer: { name: string; receipts: number; totalSpent: number } | null = null;
      if (retailerCounts.size > 0) {
        const entries = Array.from(retailerCounts.entries());
        const top = entries.reduce((max, [name, data]) => 
          data.count > max[1].count ? [name, data] : max
        );
        favoriteRetailer = {
          name: top[0],
          receipts: top[1].count,
          totalSpent: top[1].total
        };
      }

      // Calculate receipts this month
      const now = new Date();
      const thisMonthReceipts = receipts.filter((r: any) => {
        const receiptDate = new Date(r.created_at);
        return receiptDate.getMonth() === now.getMonth() && 
               receiptDate.getFullYear() === now.getFullYear();
      });

      const receiptsLimit = isPremium ? 999999 : 15;

      setStats({
        points: profile?.points || 0,
        tier: profile?.tier || 'Bronze',
        lastReceipt,
        favoriteRetailer,
        receiptsThisMonth: thisMonthReceipts.length,
        receiptsLimit
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || premiumLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-primary">
        <div className="px-6 pt-16 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-brand-ink">Dashboard</h1>
                <p className="text-brand-subtle">Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</p>
              </div>
              <Link 
                href="/dashboard/profile"
                className="w-10 h-10 rounded-full bg-brand-card border border-brand-subtle/20 flex items-center justify-center hover:bg-brand-card/80 transition-colors"
              >
                <User className="w-5 h-5 text-brand-subtle" />
              </Link>
            </div>

            {/* Points Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card mb-6 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-brand-primary/30"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-sm text-brand-subtle mb-1">Your Points</div>
                  <div className="text-4xl font-bold text-brand-ink">
                    {stats ? <CountUp value={stats.points} /> : '0'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-brand-subtle mb-1">Tier</div>
                  <div className="text-lg font-semibold text-brand-primary">{stats?.tier || 'Bronze'}</div>
                </div>
              </div>
              {isPremium && (
                <div className="flex items-center gap-2 text-sm text-brand-primary">
                  <Crown className="w-4 h-4" />
                  <span>Premium: 1.5x points on all purchases</span>
                </div>
              )}
            </motion.div>

            {/* First-time User Gamification Banner */}
            {profileCreated && stats && stats.points === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-6 bg-gradient-to-r from-brand-primary/20 to-brand-primary/10 border border-brand-primary/30 rounded-2xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-brand-ink mb-2">Earn Your First 100 Points!</h3>
                    <p className="text-sm text-brand-subtle mb-4">
                      Complete these actions to unlock your first 100 points and start redeeming perks:
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                          <span className="text-xs text-brand-primary">1</span>
                        </div>
                        <span className="text-brand-subtle">Upload your first receipt (+50 points)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                          <span className="text-xs text-brand-primary">2</span>
                        </div>
                        <span className="text-brand-subtle">Complete your profile (+25 points)</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                          <span className="text-xs text-brand-primary">3</span>
                        </div>
                        <span className="text-brand-subtle">Browse perks (+25 points)</span>
                      </div>
                    </div>
                    <Link href="/rewards/upload" className="btn-primary inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Receipt to Get Started
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Link href="/rewards/upload">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="card bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-brand-primary/30 hover:border-brand-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-3">
                      <Camera className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div className="font-semibold text-brand-ink mb-1">Upload Receipt</div>
                    <div className="text-xs text-brand-subtle">Earn points instantly</div>
                  </div>
                </motion.div>
              </Link>

              <Link href="/rewards/perks">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="card bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-brand-primary/30 hover:border-brand-primary/50 transition-all cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center py-4">
                    <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center mb-3">
                      <Gift className="w-6 h-6 text-brand-primary" />
                    </div>
                    <div className="font-semibold text-brand-ink mb-1">Browse Perks</div>
                    <div className="text-xs text-brand-subtle">Redeem your points</div>
                  </div>
                </motion.div>
              </Link>
            </div>

            {/* Last Receipt */}
            {stats?.lastReceipt && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-brand-ink">Last Receipt</h3>
                  <Link href="/rewards" className="text-sm text-brand-primary hover:underline">
                    View All
                  </Link>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                    {stats.lastReceipt.status === 'approved' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-brand-ink">{stats.lastReceipt.merchantName}</div>
                    <div className="text-sm text-brand-subtle">
                      ${stats.lastReceipt.amount.toFixed(2)} • {new Date(stats.lastReceipt.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-brand-primary">
                      +{stats.lastReceipt.points} pts
                    </div>
                    <div className="text-xs text-brand-subtle capitalize">{stats.lastReceipt.status}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Favorite Retailer */}
            {stats?.favoriteRetailer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-brand-ink flex items-center gap-2">
                    <Star className="w-5 h-5 text-brand-primary" />
                    Favorite Retailer
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-brand-ink">{stats.favoriteRetailer.name}</div>
                    <div className="text-sm text-brand-subtle">
                      {stats.favoriteRetailer.receipts} receipt{stats.favoriteRetailer.receipts !== 1 ? 's' : ''} • ${stats.favoriteRetailer.totalSpent.toFixed(2)} total
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Profile Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-brand-ink">Profile</h3>
                <Link 
                  href="/dashboard/profile"
                  className="text-sm text-brand-primary hover:underline flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Link>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-brand-subtle">Email</span>
                  <span className="text-brand-ink font-medium">{user?.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-subtle">Tier</span>
                  <span className="text-brand-ink font-medium">{stats?.tier || 'Bronze'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-subtle">Receipts This Month</span>
                  <span className="text-brand-ink font-medium">
                    {stats?.receiptsThisMonth || 0} / {stats?.receiptsLimit || 15}
                  </span>
                </div>
                {isPremium && (
                  <div className="flex items-center justify-between pt-2 border-t border-brand-subtle/20">
                    <span className="text-brand-subtle flex items-center gap-2">
                      <Crown className="w-4 h-4 text-brand-primary" />
                      Premium Status
                    </span>
                    <span className="text-brand-primary font-medium">Active</span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Premium CTA for non-premium users */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="card bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border-brand-primary/30"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-brand-ink mb-1">Unlock Premium</h4>
                    <p className="text-sm text-brand-subtle mb-3">
                      Get 1.5x points, unlimited uploads, and exclusive perks
                    </p>
                    <Link href="/rewards/premium" className="btn-primary btn-sm">
                      Upgrade Now - $4.20/mo
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}

