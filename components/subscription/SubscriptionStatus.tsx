/**
 * SubscriptionStatus Component
 * 
 * Displays subscription details with manage/cancel options
 */

'use client';

import { usePremium } from '@/hooks/usePremium';
import { Crown, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionStatusProps {
  showManageButton?: boolean;
  className?: string;
}

export function SubscriptionStatus({ 
  showManageButton = true,
  className = '' 
}: SubscriptionStatusProps) {
  const { isPremium, subscription, loading } = usePremium();

  if (loading) {
    return (
      <div className={`card ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-brand-bg rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-brand-bg rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!isPremium || !subscription) {
    return (
      <div className={`card bg-brand-bg/50 border-2 border-dashed border-brand-subtle/30 ${className}`}>
        <div className="text-center py-4">
          <Crown className="w-8 h-8 text-brand-subtle mx-auto mb-2" />
          <p className="text-brand-subtle text-sm mb-3">No active subscription</p>
          <Link href="/rewards/premium" className="btn-primary btn-sm">
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  const renewalDate = subscription.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const isCanceled = subscription.cancel_at_period_end;

  return (
    <div className={`card ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Crown className="w-6 h-6 text-brand-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-brand-ink mb-1">Premium Membership</h3>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-brand-subtle">
              <CreditCard className="w-4 h-4" />
              <span>$4.20/month</span>
            </div>
            <div className="flex items-center gap-2 text-brand-subtle">
              <Calendar className="w-4 h-4" />
              <span>
                {isCanceled ? 'Expires' : 'Renews'} {renewalDate}
              </span>
            </div>
            {isCanceled && (
              <div className="flex items-center gap-2 text-brand-warn">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Subscription will be canceled</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showManageButton && (
        <div className="mt-4 pt-4 border-t border-brand-subtle/10">
          <Link 
            href="/account/subscription" 
            className="text-sm text-brand-primary hover:underline"
          >
            Manage Subscription →
          </Link>
        </div>
      )}
    </div>
  );
}

