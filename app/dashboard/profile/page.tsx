'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  User, Save, ArrowLeft, Mail, Calendar, 
  TrendingUp, Gift, Crown, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { getUserProfileWithPremium } from '@/lib/rewards/supabase';
import { getSupabaseClient } from '@/lib/auth/supabase';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProfileEditPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium } = usePremium();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: ''
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      loadProfile();
    }
  }, [authLoading, isAuthenticated, user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const profileData = await getUserProfileWithPremium(user.id);
      
      if (profileData) {
        setProfile(profileData);
        setFormData({
          displayName: profileData.display_name || user.email?.split('@')[0] || '',
          email: user.email || ''
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);
      setSaved(false);
      const supabase = getSupabaseClient();

      // Update user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: formData.displayName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Check if this is first profile completion (for gamification)
      if (profile && !profile.display_name && formData.displayName) {
        // Award points for completing profile
        try {
          const response = await fetch('/api/gamification/complete-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });
          if (response.ok) {
            // Refresh profile to show new points
            await loadProfile();
          }
        } catch (err) {
          console.error('Error awarding profile completion points:', err);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Reload profile
      await loadProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
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
                href="/dashboard"
                className="w-10 h-10 rounded-full bg-brand-card border border-brand-subtle/20 flex items-center justify-center hover:bg-brand-card/80 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-brand-subtle" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-brand-ink">Edit Profile</h1>
                <p className="text-brand-subtle">Update your account information</p>
              </div>
            </div>

            {/* Profile Info Card */}
            <div className="card mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-brand-primary" />
                </div>
                <div>
                  <div className="font-semibold text-brand-ink text-lg">
                    {formData.displayName || user?.email?.split('@')[0] || 'User'}
                  </div>
                  <div className="text-sm text-brand-subtle">{user?.email}</div>
                  {isPremium && (
                    <div className="flex items-center gap-1 mt-1">
                      <Crown className="w-4 h-4 text-brand-primary" />
                      <span className="text-xs text-brand-primary">Premium Member</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter your display name"
                    className="w-full px-4 py-3 bg-brand-bg border border-brand-subtle/20 rounded-xl text-brand-ink placeholder-brand-subtle focus:outline-none focus:border-brand-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-ink mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 bg-brand-bg/50 border border-brand-subtle/20 rounded-xl text-brand-subtle cursor-not-allowed"
                  />
                  <p className="text-xs text-brand-subtle mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Card */}
            {profile && (
              <div className="card mb-6">
                <h3 className="text-lg font-semibold text-brand-ink mb-4">Account Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-brand-subtle">Points</div>
                      <div className="text-lg font-bold text-brand-ink">{profile.points || 0}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center">
                      <Gift className="w-5 h-5 text-brand-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-brand-subtle">Tier</div>
                      <div className="text-lg font-bold text-brand-ink">{profile.tier || 'Bronze'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-brand-ink mb-4">Account Information</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-brand-subtle">Member Since</span>
                  <span className="text-brand-ink font-medium">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-subtle">Total Points Earned</span>
                  <span className="text-brand-ink font-medium">
                    {profile?.total_points_earned || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-subtle">Receipts Uploaded</span>
                  <span className="text-brand-ink font-medium">
                    {profile?.receipts_uploaded || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-subtle">Perks Redeemed</span>
                  <span className="text-brand-ink font-medium">
                    {profile?.perks_redeemed || 0}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AuthGuard>
  );
}

