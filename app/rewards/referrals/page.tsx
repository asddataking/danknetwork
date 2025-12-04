'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Copy, Check, UserPlus, Building2, Crown, Share2, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getSupabaseClient } from '@/lib/auth/supabase';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface ReferralCode {
  id: string;
  code: string;
  is_active: boolean;
  total_uses: number;
  created_at: string;
}

interface Referral {
  id: string;
  referral_type: string;
  status: string;
  referrer_points_awarded: number;
  referee_points_awarded: number;
  completed_at: string | null;
  created_at: string;
}

export default function ReferralsPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [referralCode, setReferralCode] = useState<ReferralCode | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalPointsEarned: 0,
    userSignups: 0,
    businessSignups: 0,
    premiumUpgrades: 0,
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadReferralData();
    }
  }, [authLoading, isAuthenticated, user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      // Get or create referral code
      let { data: codes, error: codesError } = await supabase
        .from('user_referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (codesError) throw codesError;

      if (!codes || codes.length === 0) {
        // Generate new referral code
        const newCode = `DANK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        const { data: newCodeData, error: createError } = await supabase
          .from('user_referral_codes')
          .insert({
            user_id: user.id,
            code: newCode,
            is_active: true,
          })
          .select()
          .single();

        if (createError) throw createError;
        setReferralCode(newCodeData);
      } else {
        setReferralCode(codes[0]);
      }

      // Get referrals
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;
      setReferrals(referralsData || []);

      // Calculate stats
      const totalReferrals = referralsData?.length || 0;
      const totalPointsEarned = referralsData?.reduce((sum, r) => sum + (r.referrer_points_awarded || 0), 0) || 0;
      const userSignups = referralsData?.filter(r => r.referral_type === 'user_signup').length || 0;
      const businessSignups = referralsData?.filter(r => r.referral_type === 'business_signup').length || 0;
      const premiumUpgrades = referralsData?.filter(r => r.referral_type === 'premium_upgrade').length || 0;

      setStats({
        totalReferrals,
        totalPointsEarned,
        userSignups,
        businessSignups,
        premiumUpgrades,
      });
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!referralCode) return;

    const shareText = `Join Dank Network and get bonus points! Use my referral code: ${referralCode.code}\n\nSign up at: ${window.location.origin}/signup?ref=${referralCode.code}`;
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying:', error);
    }
  };

  const handleShare = async () => {
    if (!referralCode) return;

    const shareText = `Join Dank Network and get bonus points! Use my referral code: ${referralCode.code}`;
    const shareUrl = `${window.location.origin}/signup?ref=${referralCode.code}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Dank Network',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getReferralTypeIcon = (type: string) => {
    switch (type) {
      case 'user_signup':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'business_signup':
        return <Building2 className="w-5 h-5 text-green-500" />;
      case 'premium_upgrade':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      default:
        return <UserPlus className="w-5 h-5 text-brand-primary" />;
    }
  };

  const getReferralTypeLabel = (type: string) => {
    switch (type) {
      case 'user_signup':
        return 'User Signup';
      case 'business_signup':
        return 'Business Signup';
      case 'premium_upgrade':
        return 'Premium Upgrade';
      default:
        return type;
    }
  };

  if (authLoading || loading) {
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
            <div className="flex items-center gap-4 mb-6">
              <Link 
                href="/rewards"
                className="w-10 h-10 rounded-full bg-brand-card border border-brand-subtle/20 flex items-center justify-center hover:bg-brand-card/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-brand-subtle" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-brand-ink">Referral Program</h1>
                <p className="text-brand-subtle">Earn points by referring friends and businesses</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="card">
                <div className="text-sm text-brand-subtle mb-1">Total Referrals</div>
                <div className="text-2xl font-bold text-brand-ink">{stats.totalReferrals}</div>
              </div>
              <div className="card">
                <div className="text-sm text-brand-subtle mb-1">Points Earned</div>
                <div className="text-2xl font-bold text-green-500">{stats.totalPointsEarned.toLocaleString()}</div>
              </div>
            </div>

            {/* Referral Code Card */}
            {referralCode && (
              <div className="card mb-6">
                <h3 className="font-semibold text-brand-ink mb-4">Your Referral Code</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 px-4 py-3 bg-brand-bg border border-brand-subtle/20 rounded-xl font-mono text-lg text-brand-ink">
                    {referralCode.code}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="w-12 h-12 rounded-xl bg-brand-primary text-black flex items-center justify-center hover:bg-brand-primary/90 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-brand-subtle/20">
                  <div className="text-sm text-brand-subtle">
                    <strong className="text-brand-ink">How it works:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Share your code with friends</li>
                      <li>They sign up and you both get points</li>
                      <li>Refer businesses for bonus rewards</li>
                      <li>Premium upgrades earn you extra points</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Referral Breakdown */}
            <div className="card mb-6">
              <h3 className="font-semibold text-brand-ink mb-4">Referral Breakdown</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{stats.userSignups}</div>
                  <div className="text-sm text-brand-subtle">User Signups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{stats.businessSignups}</div>
                  <div className="text-sm text-brand-subtle">Businesses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{stats.premiumUpgrades}</div>
                  <div className="text-sm text-brand-subtle">Premium</div>
                </div>
              </div>
            </div>

            {/* Recent Referrals */}
            <div className="card">
              <h3 className="font-semibold text-brand-ink mb-4">Recent Referrals</h3>
              {referrals.length === 0 ? (
                <div className="text-center py-8 text-brand-subtle">
                  <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No referrals yet</p>
                  <p className="text-sm mt-2">Start sharing your code to earn points!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center justify-between p-3 bg-brand-bg rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        {getReferralTypeIcon(referral.referral_type)}
                        <div>
                          <div className="font-medium text-brand-ink">
                            {getReferralTypeLabel(referral.referral_type)}
                          </div>
                          <div className="text-sm text-brand-subtle">
                            {new Date(referral.created_at).toLocaleDateString()}
                            {referral.status === 'completed' && referral.completed_at && (
                              <span className="ml-2 text-green-500">• Completed</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {referral.referrer_points_awarded > 0 && (
                        <div className="text-right">
                          <div className="font-bold text-green-500">
                            +{referral.referrer_points_awarded}
                          </div>
                          <div className="text-xs text-brand-subtle">points</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}



