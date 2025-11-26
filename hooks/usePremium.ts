/**
 * Unified Premium Hook
 * 
 * Client-side hook for checking premium status across the app
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { isUserPremium, getUserSubscription, Subscription } from '@/lib/subscription/premium';

export function usePremium() {
  const { user, loading: authLoading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPremiumStatus() {
      if (!user) {
        setIsPremium(false);
        setSubscription(null);
        setLoading(false);
        return;
      }

      try {
        const [premiumStatus, subscriptionData] = await Promise.all([
          isUserPremium(user.id),
          getUserSubscription(user.id),
        ]);

        setIsPremium(premiumStatus);
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('[usePremium] Error checking premium status:', error);
        setIsPremium(false);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkPremiumStatus();
    }
  }, [user, authLoading]);

  return {
    isPremium,
    subscription,
    loading: authLoading || loading,
  };
}

