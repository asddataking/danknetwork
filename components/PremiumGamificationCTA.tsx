'use client';

import Link from 'next/link';
import { Crown, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';

export default function PremiumGamificationCTA() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();

  // Don't show if premium or still loading
  if (authLoading || premiumLoading || isPremium) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-neon-green/10 via-neon-orange/10 to-neon-green/10 border-2 border-neon-green/30 rounded-lg p-6 md:p-8 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 to-neon-orange/5 opacity-50"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-orange/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-neon-green/20 rounded-full blur-2xl"></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-6 h-6 text-neon-orange" />
              <h3 className="text-neon-green font-black text-2xl md:text-3xl uppercase">
                Level Up Your Experience
              </h3>
            </div>
            <p className="text-white text-base md:text-lg mb-4">
              Unlock <span className="text-neon-orange font-bold">Premium</span> for just <span className="text-neon-green font-bold">$4.20/mo</span> and maximize your <span className="text-neon-green font-bold">Earn & Burn</span> rewards!
            </p>
          </div>
          <div className="text-4xl">🚀</div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-black/40 border border-neon-green/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-neon-green" />
              <span className="text-white font-bold">1.5x Points</span>
            </div>
            <p className="text-gray-300 text-sm">Earn 50% more points on every DankPass purchase</p>
          </div>
          <div className="bg-black/40 border border-neon-green/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-neon-orange" />
              <span className="text-white font-bold">10+ Daily Deals</span>
            </div>
            <p className="text-gray-300 text-sm">Get the full list vs 3-5 for free users</p>
          </div>
          <div className="bg-black/40 border border-neon-green/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-neon-green" />
              <span className="text-white font-bold">Unlimited Uploads</span>
            </div>
            <p className="text-gray-300 text-sm">No monthly limits on receipt uploads</p>
          </div>
          <div className="bg-black/40 border border-neon-green/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-neon-orange" />
              <span className="text-white font-bold">Early Access</span>
            </div>
            <p className="text-gray-300 text-sm">Deals at 7am instead of 9am</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-gray-300 text-sm mb-1">
              <span className="text-neon-green font-bold">One subscription</span> unlocks both:
            </p>
            <p className="text-white text-xs">
              DankPass Premium + Daily Dispo Deals Premium
            </p>
          </div>
          <Link
            href="/rewards/premium"
            className="bg-gradient-to-r from-neon-green to-neon-orange text-black font-black px-8 py-3 rounded-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105 uppercase whitespace-nowrap"
          >
            Get Premium - $4.20/mo
          </Link>
        </div>
      </div>
    </div>
  );
}

