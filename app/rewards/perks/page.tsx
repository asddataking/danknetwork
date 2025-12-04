'use client';

import { motion } from 'framer-motion';
import { Gift, Crown, Lock, Star, Coffee, Car, Plane, Package, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { getUserProfile, getActivePerks, redeemPerk } from '@/lib/rewards/supabase';

interface Perk {
  id: number;
  title: string;
  description: string;
  partner: string;
  pointsCost: number;
  isPremiumOnly: boolean;
  category: string;
  icon: any;
  color: string;
}

// Icon mapping for categories
const categoryIcons: Record<string, any> = {
  'Dispensary': Star,
  'Restaurant': Coffee,
  'Premium': Crown,
  'Special': Package,
  'default': Gift
};

export default function PerksPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  
  const loading = authLoading || premiumLoading;
  const [userPoints, setUserPoints] = useState(0);
  const [perks, setPerks] = useState<Perk[]>([]);
  const [loadingPerks, setLoadingPerks] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load user points and perks
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !user) return;
      
      setLoadingPerks(true);
      try {
        // Load user profile for points
        const profile = await getUserProfile(user.id);
        if (profile) {
          setUserPoints(profile.points || 0);
        }

        // Award browse perks bonus (first time only)
        try {
          const bonusResponse = await fetch('/api/gamification/browse-perks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id })
          });
          if (bonusResponse.ok) {
            const bonusData = await bonusResponse.json();
            if (bonusData.success && profile) {
              // Update points display
              setUserPoints((prev) => prev + bonusData.pointsAwarded);
            }
          }
        } catch (err) {
          // Silently fail - bonus is optional
          console.log('Browse perks bonus check:', err);
        }

        // Load active perks
        const activePerks = await getActivePerks(true);
        
        // Map to Perk interface with icons
        const mappedPerks: Perk[] = activePerks.map((p: any) => {
          const category = p.category || 'Special';
          const Icon = categoryIcons[category] || categoryIcons.default;
          
          return {
            id: p.id,
            title: p.title,
            description: p.description || '',
            partner: p.partner?.business_name || 'DankPass',
            pointsCost: p.points_cost || 0,
            isPremiumOnly: p.is_premium_only || false,
            category: category,
            icon: Icon,
            color: 'dp-mint' // Default color
          };
        });
        
        setPerks(mappedPerks);
      } catch (error) {
        console.error('Error loading perks:', error);
      } finally {
        setLoadingPerks(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]);

  // Get unique categories from perks
  const categories = ['All', ...Array.from(new Set(perks.map(p => p.category)))];

  const filteredPerks = selectedCategory === 'All' 
    ? perks 
    : perks.filter(perk => perk.category === selectedCategory || (selectedCategory === 'Premium' && perk.isPremiumOnly));

  const canAfford = (pointsCost: number) => userPoints >= pointsCost;

  const handleRedeem = async (perk: Perk) => {
    if (!user) {
      alert('Please sign in to redeem perks');
      return;
    }
    
    if (perk.isPremiumOnly && !isPremium) {
      alert('This is a premium-only perk. Upgrade to access!');
      return;
    }
    
    if (!canAfford(perk.pointsCost)) {
      alert(`You need ${perk.pointsCost - userPoints} more points to redeem this perk`);
      return;
    }
    
    try {
      const redemption = await redeemPerk(user.id, perk.id, perk.pointsCost);
      if (redemption) {
        alert(`Successfully redeemed: ${perk.title}!\n\nRedemption Code: ${redemption.redemption_code}\n\nThis code expires in 30 days.`);
        // Refresh user points
        const profile = await getUserProfile(user.id);
        if (profile) {
          setUserPoints(profile.points || 0);
        }
      } else {
        alert('Failed to redeem perk. Please try again.');
      }
    } catch (error) {
      console.error('Error redeeming perk:', error);
      alert('An error occurred while redeeming the perk. Please try again.');
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
          <Gift className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-ink mb-2">
            Sign In Required
          </h2>
          <p className="text-brand-subtle mb-6">
            Please sign in to view and redeem exclusive perks
          </p>
          <Link href="/deals" className="btn-primary inline-block">
            Sign In / Sign Up
          </Link>
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
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-brand-ink mb-2">🔥 Burn Rewards</h1>
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold text-brand-primary">
                {userPoints.toLocaleString()}
              </div>
              <div className="text-brand-subtle">points available</div>
              {isPremium && (
                <div className="ml-2 px-2 py-0.5 bg-brand-primary/20 rounded-full">
                  <span className="text-xs font-medium text-brand-primary">Premium</span>
                </div>
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category
                      ? 'bg-brand-primary text-black'
                      : 'bg-brand-card text-brand-subtle hover:bg-brand-card/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Perks Grid */}
          {loadingPerks ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
              <p className="text-brand-subtle">Loading perks...</p>
            </div>
          ) : filteredPerks.length === 0 ? (
            <div className="text-center py-12">
              <Gift className="w-16 h-16 text-brand-subtle mx-auto mb-4 opacity-50" />
              <p className="text-brand-subtle">No perks available at this time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredPerks.map((perk, index) => {
              const Icon = perk.icon || Gift;
              const canRedeem = canAfford(perk.pointsCost) && (!perk.isPremiumOnly || isPremium);
              
              return (
                <motion.div
                  key={perk.id}
                  className={`card relative overflow-hidden ${
                    !canRedeem ? 'opacity-60' : 'hover:bg-brand-card/80 cursor-pointer'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={canRedeem ? { scale: 1.02 } : {}}
                  whileTap={canRedeem ? { scale: 0.98 } : {}}
                >
                  {/* Premium Lock Overlay */}
                  {perk.isPremiumOnly && !isPremium && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-8 h-8 bg-brand-primary/20 rounded-full flex items-center justify-center">
                        <Lock className="w-4 h-4 text-brand-primary" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 ${
                      perk.color === 'dp-mint' ? 'bg-brand-primary/20' : 
                      perk.color === 'dp-lime' ? 'bg-brand-primary/20' : 
                      perk.color === 'dp-blue' ? 'bg-brand-primary/20' : 
                      'bg-brand-card/20'
                    } rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${
                        perk.color === 'dp-mint' ? 'text-brand-primary' : 
                        perk.color === 'dp-lime' ? 'text-brand-primary' : 
                        perk.color === 'dp-blue' ? 'text-brand-primary' : 
                        'text-brand-subtle'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-brand-ink">{perk.title}</h3>
                        <div className="text-right flex-shrink-0 ml-2">
                          <div className="text-sm font-medium text-brand-primary">
                            {perk.pointsCost} pts
                          </div>
                          {!canAfford(perk.pointsCost) && (
                            <div className="text-xs text-brand-error">Need {perk.pointsCost - userPoints} more</div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-brand-subtle mb-2">{perk.description}</p>
                      <p className="text-xs text-brand-subtle/80">{perk.partner}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4">
                    {canRedeem ? (
                      <button 
                        onClick={() => handleRedeem(perk)}
                        className="btn-primary w-full"
                      >
                        Redeem Now
                      </button>
                    ) : perk.isPremiumOnly && !isPremium ? (
                      <Link href="/rewards/premium">
                        <button className="btn-secondary w-full flex items-center justify-center gap-2">
                          <Crown className="w-4 h-4" />
                          Premium Required
                        </button>
                      </Link>
                    ) : (
                      <button className="btn-secondary w-full opacity-50 cursor-not-allowed">
                        Not Enough Points
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}

          {/* Premium CTA */}
          {!isPremium && (
            <motion.div
              className="mt-8 card bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border-brand-primary/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="text-center">
                <Crown className="w-8 h-8 text-brand-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-brand-ink mb-2">
                  Unlock Premium Perks
                </h3>
                <p className="text-sm text-brand-subtle mb-4">
                  Get access to exclusive rewards and earn 1.5x points on all purchases
                </p>
                <Link href="/rewards/premium">
                  <button className="btn-primary">
                    Upgrade to Premium - $7/month
                  </button>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

