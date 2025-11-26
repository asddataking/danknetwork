'use client';

import { motion } from 'framer-motion';
import { Gift, Crown, Lock, Star, Coffee, Car, Plane, Package, User } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';

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

export default function PerksPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  
  const loading = authLoading || premiumLoading;
  
  // TODO: Load real user points from Supabase when rewards tables exist
  const userPoints = 1250;

  const mockPerks: Perk[] = [
    {
      id: 1,
      title: '20% Off Edibles',
      description: 'Get 20% off any edible product',
      partner: 'Green Valley Dispensary',
      pointsCost: 500,
      isPremiumOnly: false,
      category: 'Dispensary',
      icon: Star,
      color: 'dp-mint'
    },
    {
      id: 2,
      title: 'Free Coffee',
      description: 'Complimentary coffee with any purchase',
      partner: 'Local Coffee Co.',
      pointsCost: 300,
      isPremiumOnly: false,
      category: 'Restaurant',
      icon: Coffee,
      color: 'dp-lime'
    },
    {
      id: 3,
      title: 'Free Delivery',
      description: 'Free delivery on orders over $50',
      partner: 'Pizza Palace',
      pointsCost: 200,
      isPremiumOnly: false,
      category: 'Restaurant',
      icon: Car,
      color: 'dp-blue'
    },
    {
      id: 4,
      title: 'VIP Lounge Access',
      description: 'Exclusive access to premium lounge area',
      partner: 'Elite Dispensary',
      pointsCost: 1000,
      isPremiumOnly: true,
      category: 'Premium',
      icon: Crown,
      color: 'dp-blue'
    },
    {
      id: 5,
      title: 'Free Appetizer',
      description: 'Complimentary appetizer with main course',
      partner: 'Fine Dining Restaurant',
      pointsCost: 400,
      isPremiumOnly: false,
      category: 'Restaurant',
      icon: Star,
      color: 'dp-mint'
    },
    {
      id: 6,
      title: 'Travel Voucher',
      description: '$50 travel voucher for any destination',
      partner: 'Travel Partner',
      pointsCost: 2000,
      isPremiumOnly: true,
      category: 'Premium',
      icon: Plane,
      color: 'dp-blue'
    },
    {
      id: 7,
      title: 'Mystery Box',
      description: 'Random reward worth up to 1000 points',
      partner: 'DankPass',
      pointsCost: 750,
      isPremiumOnly: false,
      category: 'Special',
      icon: Package,
      color: 'dp-mint'
    }
  ];

  const categories = ['All', 'Dispensary', 'Restaurant', 'Premium', 'Special'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPerks = selectedCategory === 'All' 
    ? mockPerks 
    : mockPerks.filter(perk => perk.category === selectedCategory || (selectedCategory === 'Premium' && perk.isPremiumOnly));

  const canAfford = (pointsCost: number) => userPoints >= pointsCost;

  const handleRedeem = (perk: Perk) => {
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
    
    // TODO: Implement Supabase redeem logic when rewards tables exist
    alert(`Redeeming: ${perk.title} for ${perk.pointsCost} points`);
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

