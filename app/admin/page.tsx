'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Users, Receipt, Gift, TrendingUp, DollarSign, 
  Crown, Clock, CheckCircle, XCircle, BarChart3,
  Calendar, Zap, Star, Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/auth/supabase';

interface Analytics {
  users: {
    total: number;
    premium: number;
    newToday: number;
    activeThisWeek: number;
  };
  receipts: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    today: number;
    thisWeek: number;
  };
  points: {
    totalAwarded: number;
    totalRedeemed: number;
    averagePerUser: number;
    todayAwarded: number;
  };
  perks: {
    total: number;
    active: number;
    totalRedemptions: number;
    popularPerks: Array<{ id: string; title: string; redemptions: number }>;
  };
  deals: {
    totalSubscribers: number;
    premiumSubscribers: number;
    newslettersSent: number;
    dealsFetched: number;
  };
}

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadAnalytics();
    }
  }, [authLoading, isAuthenticated]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Load all analytics in parallel
      const [
        usersData,
        receiptsData,
        pointsData,
        perksData,
        dealsData
      ] = await Promise.all([
        loadUsersAnalytics(supabase),
        loadReceiptsAnalytics(supabase),
        loadPointsAnalytics(supabase),
        loadPerksAnalytics(supabase),
        loadDealsAnalytics(supabase)
      ]);

      setAnalytics({
        users: usersData,
        receipts: receiptsData,
        points: pointsData,
        perks: perksData,
        deals: dealsData
      });
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email?.endsWith('@danknetwork.com') || user?.email === 'admin@danknetwork.com';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <XCircle className="w-16 h-16 text-brand-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-ink mb-2">
            Access Denied
          </h2>
          <p className="text-brand-subtle">
            You need admin privileges to access this dashboard.
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <XCircle className="w-16 h-16 text-brand-error mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-ink mb-2">
            Error Loading Analytics
          </h2>
          <p className="text-brand-subtle mb-4">{error || 'Failed to load data'}</p>
          <button onClick={loadAnalytics} className="btn-primary">
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="px-6 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-brand-ink mb-2">Admin Dashboard</h1>
            <p className="text-brand-subtle">Analytics and insights for Dank Network</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              title="Total Users"
              value={analytics.users.total}
              subtitle={`${analytics.users.premium} premium`}
              color="blue"
            />
            <StatCard
              icon={Receipt}
              title="Total Receipts"
              value={analytics.receipts.total}
              subtitle={`${analytics.receipts.approved} approved`}
              color="green"
            />
            <StatCard
              icon={DollarSign}
              title="Points Awarded"
              value={analytics.points.totalAwarded.toLocaleString()}
              subtitle={`${analytics.points.totalRedeemed.toLocaleString()} redeemed`}
              color="orange"
            />
            <StatCard
              icon={Gift}
              title="Perk Redemptions"
              value={analytics.perks.totalRedemptions}
              subtitle={`${analytics.perks.active} active perks`}
              color="purple"
            />
          </div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Users Analytics */}
            <AnalyticsCard title="Users" icon={Users}>
              <div className="space-y-4">
                <StatRow label="Total Users" value={analytics.users.total} />
                <StatRow label="Premium Users" value={analytics.users.premium} />
                <StatRow label="New Today" value={analytics.users.newToday} />
                <StatRow label="Active This Week" value={analytics.users.activeThisWeek} />
                <div className="pt-4 border-t border-brand-subtle/20">
                  <div className="text-sm text-brand-subtle">
                    Premium Rate: {analytics.users.total > 0 
                      ? ((analytics.users.premium / analytics.users.total) * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
              </div>
            </AnalyticsCard>

            {/* Receipts Analytics */}
            <AnalyticsCard title="Receipts" icon={Receipt}>
              <div className="space-y-4">
                <StatRow label="Total Receipts" value={analytics.receipts.total} />
                <StatRow 
                  label="Approved" 
                  value={analytics.receipts.approved}
                  icon={CheckCircle}
                  iconColor="green"
                />
                <StatRow 
                  label="Pending" 
                  value={analytics.receipts.pending}
                  icon={Clock}
                  iconColor="yellow"
                />
                <StatRow 
                  label="Rejected" 
                  value={analytics.receipts.rejected}
                  icon={XCircle}
                  iconColor="red"
                />
                <StatRow label="Today" value={analytics.receipts.today} />
                <StatRow label="This Week" value={analytics.receipts.thisWeek} />
                <div className="pt-4 border-t border-brand-subtle/20">
                  <div className="text-sm text-brand-subtle">
                    Approval Rate: {analytics.receipts.total > 0
                      ? ((analytics.receipts.approved / analytics.receipts.total) * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
              </div>
            </AnalyticsCard>

            {/* Points Analytics */}
            <AnalyticsCard title="Points Economy" icon={TrendingUp}>
              <div className="space-y-4">
                <StatRow 
                  label="Total Awarded" 
                  value={analytics.points.totalAwarded.toLocaleString()} 
                />
                <StatRow 
                  label="Total Redeemed" 
                  value={analytics.points.totalRedeemed.toLocaleString()} 
                />
                <StatRow 
                  label="Net Points" 
                  value={(analytics.points.totalAwarded - analytics.points.totalRedeemed).toLocaleString()} 
                />
                <StatRow 
                  label="Average Per User" 
                  value={Math.round(analytics.points.averagePerUser).toLocaleString()} 
                />
                <StatRow 
                  label="Awarded Today" 
                  value={analytics.points.todayAwarded.toLocaleString()} 
                />
              </div>
            </AnalyticsCard>

            {/* Perks Analytics */}
            <AnalyticsCard title="Perks" icon={Gift}>
              <div className="space-y-4">
                <StatRow label="Total Perks" value={analytics.perks.total} />
                <StatRow label="Active Perks" value={analytics.perks.active} />
                <StatRow label="Total Redemptions" value={analytics.perks.totalRedemptions} />
                {analytics.perks.popularPerks.length > 0 && (
                  <div className="pt-4 border-t border-brand-subtle/20">
                    <div className="text-sm font-semibold text-brand-ink mb-2">Popular Perks</div>
                    <div className="space-y-2">
                      {analytics.perks.popularPerks.slice(0, 3).map((perk) => (
                        <div key={perk.id} className="flex justify-between text-sm">
                          <span className="text-brand-subtle">{perk.title}</span>
                          <span className="text-brand-ink font-medium">{perk.redemptions}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AnalyticsCard>
          </div>

          {/* Daily Dispo Deals Analytics */}
          <AnalyticsCard title="Daily Dispo Deals" icon={BarChart3} className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-2xl font-bold text-brand-ink">
                  {analytics.deals.totalSubscribers}
                </div>
                <div className="text-sm text-brand-subtle">Total Subscribers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-ink">
                  {analytics.deals.premiumSubscribers}
                </div>
                <div className="text-sm text-brand-subtle">Premium Subscribers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-ink">
                  {analytics.deals.newslettersSent}
                </div>
                <div className="text-sm text-brand-subtle">Newsletters Sent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-ink">
                  {analytics.deals.dealsFetched}
                </div>
                <div className="text-sm text-brand-subtle">Deals Fetched</div>
              </div>
            </div>
          </AnalyticsCard>
        </motion.div>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  color 
}: { 
  icon: any; 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  color: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    orange: 'bg-orange-500/10 text-orange-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="text-sm text-brand-subtle mb-1">{title}</div>
          <div className="text-2xl font-bold text-brand-ink">{value}</div>
          {subtitle && <div className="text-xs text-brand-subtle mt-1">{subtitle}</div>}
        </div>
      </div>
    </motion.div>
  );
}

function AnalyticsCard({ 
  title, 
  icon: Icon, 
  children, 
  className = '' 
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-brand-primary" />
        <h3 className="text-lg font-semibold text-brand-ink">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

function StatRow({ 
  label, 
  value, 
  icon: Icon, 
  iconColor 
}: { 
  label: string; 
  value: string | number; 
  icon?: any; 
  iconColor?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon className={`w-4 h-4 ${iconColor === 'green' ? 'text-green-500' : iconColor === 'yellow' ? 'text-yellow-500' : iconColor === 'red' ? 'text-red-500' : 'text-brand-subtle'}`} />
        )}
        <span className="text-brand-subtle">{label}</span>
      </div>
      <span className="font-semibold text-brand-ink">{value}</span>
    </div>
  );
}

// Analytics Loading Functions
async function loadUsersAnalytics(supabase: any) {
  const { count: total } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });

  const { count: premium } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .eq('is_premium', true);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: newToday } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { data: activeUsers } = await supabase
    .from('receipts')
    .select('user_id', { count: 'exact' })
    .gte('created_at', weekAgo.toISOString());

  const uniqueActiveUsers = new Set(activeUsers?.map((r: any) => r.user_id) || []).size;

  return {
    total: total || 0,
    premium: premium || 0,
    newToday: newToday || 0,
    activeThisWeek: uniqueActiveUsers
  };
}

async function loadReceiptsAnalytics(supabase: any) {
  const { count: total } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true });

  const { count: approved } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved');

  const { count: pending } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: rejected } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: todayCount } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const { count: thisWeek } = await supabase
    .from('receipts')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString());

  return {
    total: total || 0,
    approved: approved || 0,
    pending: pending || 0,
    rejected: rejected || 0,
    today: todayCount || 0,
    thisWeek: thisWeek || 0
  };
}

async function loadPointsAnalytics(supabase: any) {
  const { data: transactions } = await supabase
    .from('points_transactions')
    .select('amount, transaction_type');

  const totalAwarded = transactions
    ?.filter((t: any) => t.transaction_type === 'earn' || t.transaction_type === 'bonus')
    .reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

  const totalRedeemed = transactions
    ?.filter((t: any) => t.transaction_type === 'burn')
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0) || 0;

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('points');

  const totalUsers = profiles?.length || 1;
  const averagePerUser = totalAwarded / totalUsers;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayTransactions } = await supabase
    .from('points_transactions')
    .select('amount')
    .gte('created_at', today.toISOString())
    .in('transaction_type', ['earn', 'bonus']);

  const todayAwarded = todayTransactions
    ?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0;

  return {
    totalAwarded,
    totalRedeemed,
    averagePerUser,
    todayAwarded
  };
}

async function loadPerksAnalytics(supabase: any) {
  const { count: total } = await supabase
    .from('perks')
    .select('*', { count: 'exact', head: true });

  const { count: active } = await supabase
    .from('perks')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalRedemptions } = await supabase
    .from('perk_redemptions')
    .select('*', { count: 'exact', head: true });

  const { data: redemptions } = await supabase
    .from('perk_redemptions')
    .select('perk_id, perks(title)')
    .limit(100);

  const perkCounts = new Map<string, { title: string; count: number }>();
  redemptions?.forEach((r: any) => {
    const perkId = r.perk_id;
    const title = r.perks?.title || 'Unknown';
    const current = perkCounts.get(perkId) || { title, count: 0 };
    perkCounts.set(perkId, { title, count: current.count + 1 });
  });

  const popularPerks = Array.from(perkCounts.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    total: total || 0,
    active: active || 0,
    totalRedemptions: totalRedemptions || 0,
    popularPerks
  };
}

async function loadDealsAnalytics(supabase: any) {
  const { count: totalSubscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true });

  const { count: premiumSubscribers } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact', head: true })
    .eq('tier', 'premium');

  // These would come from your newsletter/deals system
  // For now, return placeholder values
  return {
    totalSubscribers: totalSubscribers || 0,
    premiumSubscribers: premiumSubscribers || 0,
    newslettersSent: 0, // Track this in your system
    dealsFetched: 0 // Track this in your system
  };
}

