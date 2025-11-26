/**
 * PremiumGuard Component
 * 
 * Wraps premium features/pages
 * Shows upgrade prompt if not premium, displays content if premium
 */

'use client';

import { usePremium } from '@/hooks/usePremium';
import { motion } from 'framer-motion';
import { Crown } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface PremiumGuardProps {
  children: ReactNode;
  upgradeUrl?: string;
  loadingComponent?: ReactNode;
  fallbackComponent?: ReactNode;
  feature?: string; // Feature name for messaging
}

export function PremiumGuard({
  children,
  upgradeUrl = '/rewards/premium',
  loadingComponent,
  fallbackComponent,
  feature = 'this feature',
}: PremiumGuardProps) {
  const { isPremium, loading: premiumLoading } = usePremium();

  // Show loading state
  if (premiumLoading) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Show upgrade prompt if not premium
  if (!isPremium) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-10 h-10 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold text-brand-ink mb-2">
            Premium Feature
          </h2>
          <p className="text-brand-subtle mb-6">
            Upgrade to Premium to access {feature} and unlock exclusive benefits across the entire Dank Network!
          </p>
          <Link href={upgradeUrl} className="btn-primary inline-block">
            <Crown className="w-5 h-5 mr-2 inline" />
            Upgrade to Premium - $4.20/mo
          </Link>
          <p className="text-xs text-brand-subtle mt-4">
            One subscription unlocks DankPass Rewards + Daily Dispo Deals Premium
          </p>
        </motion.div>
      </div>
    );
  }

  // User is premium, show children
  return <>{children}</>;
}

