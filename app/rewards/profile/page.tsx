'use client';

import { motion } from 'framer-motion';
import { User, Mail, Calendar, Award, TrendingUp, Gift, Crown, LogOut, Edit } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';

export default function ProfilePage() {
  const { user, isAuthenticated, signOut, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  
  const loading = authLoading || premiumLoading;

  // TODO: Load real stats from Supabase when rewards tables exist
  const stats = {
    points: 1250,
    tier: 'Gold',
    receiptsUploaded: 12,
    perksRedeemed: 3,
    totalSaved: 89.50,
    pointsEarned: 2340
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.error) {
      window.location.href = '/';
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <User className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-ink mb-2">
            Sign In Required
          </h2>
          <p className="text-brand-subtle mb-6">
            Please sign in to view your profile
          </p>
          <Link href="/deals" className="btn-primary inline-block">
            Sign In / Sign Up
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="px-6 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-ink mb-2">Profile</h1>
            <p className="muted">Manage your account and view your stats</p>
          </div>

          {/* Profile Card */}
          <div className="card mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-8 h-8 text-brand-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-brand-ink">
                  {user.user_metadata?.full_name || 'User'}
                </h2>
                <p className="text-brand-subtle flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
                <p className="text-brand-subtle flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
                {isPremium && (
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-brand-primary/20 rounded-full">
                    <Crown className="w-3 h-3 text-brand-primary" />
                    <span className="text-xs font-medium text-brand-primary">Premium Member</span>
                  </div>
                )}
              </div>
              <button className="btn-ghost p-2">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            {!isPremium && (
              <Link href="/rewards/premium">
                <div className="mt-4 p-3 bg-brand-primary/10 rounded-xl border border-brand-primary/20 hover:bg-brand-primary/20 transition-all cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-brand-primary" />
                      <span className="font-medium text-brand-ink">Upgrade to Premium</span>
                    </div>
                    <span className="text-sm text-brand-primary">→</span>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-ink">{stats.points}</div>
                  <div className="muted text-sm">Points</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-success/10 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-brand-success" />
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-ink">{stats.tier}</div>
                  <div className="muted text-sm">Tier</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                  <Gift className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-ink">{stats.perksRedeemed}</div>
                  <div className="muted text-sm">Perks Used</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-success/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-brand-success" />
                </div>
                <div>
                  <div className="text-xl font-bold text-brand-ink">${stats.totalSaved}</div>
                  <div className="muted text-sm">Saved</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Summary */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-brand-subtle">Receipts Uploaded</span>
                <span className="font-semibold text-brand-ink">{stats.receiptsUploaded}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-subtle">Total Points Earned</span>
                <span className="font-semibold text-brand-ink">{stats.pointsEarned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-subtle">Perks Redeemed</span>
                <span className="font-semibold text-brand-ink">{stats.perksRedeemed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-subtle">Total Savings</span>
                <span className="font-semibold text-brand-success">${stats.totalSaved}</span>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">Settings</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 bg-brand-bg rounded-xl hover:bg-brand-bg/80 transition-all">
                <span className="text-brand-ink">Notification Preferences</span>
                <span className="text-brand-subtle">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-brand-bg rounded-xl hover:bg-brand-bg/80 transition-all">
                <span className="text-brand-ink">Payment Methods</span>
                <span className="text-brand-subtle">→</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 bg-brand-bg rounded-xl hover:bg-brand-bg/80 transition-all">
                <span className="text-brand-ink">Privacy & Security</span>
                <span className="text-brand-subtle">→</span>
              </button>
            </div>
          </div>

          {/* Sign Out Button */}
          <button 
            onClick={handleSignOut}
            className="w-full btn-secondary flex items-center justify-center gap-2 text-brand-error border-brand-error/20"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>

          {/* App Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-subtle">DankPass Rewards v1.0.0</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <Link href="#" className="text-sm text-brand-subtle hover:text-brand-primary">Terms</Link>
              <Link href="#" className="text-sm text-brand-subtle hover:text-brand-primary">Privacy</Link>
              <Link href="#" className="text-sm text-brand-subtle hover:text-brand-primary">Help</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

