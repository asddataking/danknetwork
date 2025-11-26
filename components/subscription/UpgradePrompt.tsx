/**
 * UpgradePrompt Component
 * 
 * Encourages users to upgrade to premium
 * Can be inline or as a card
 */

'use client';

import { Crown, Zap } from 'lucide-react';
import Link from 'next/link';
import { usePremium } from '@/hooks/usePremium';

interface UpgradePromptProps {
  variant?: 'inline' | 'card' | 'banner';
  message?: string;
  features?: string[];
  className?: string;
}

export function UpgradePrompt({ 
  variant = 'card',
  message = 'Upgrade to Premium',
  features = [
    '1.5x points multiplier',
    'Unlimited receipt uploads',
    'Full Daily Dispo Deals list',
    'Early access to deals',
  ],
  className = '' 
}: UpgradePromptProps) {
  const { isPremium, loading } = usePremium();

  // Don't show if premium or loading
  if (loading || isPremium) {
    return null;
  }

  if (variant === 'inline') {
    return (
      <Link 
        href="/rewards/premium"
        className={`inline-flex items-center gap-2 text-brand-primary hover:underline ${className}`}
      >
        <Crown className="w-4 h-4" />
        <span>{message}</span>
      </Link>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border-l-4 border-brand-primary rounded-lg p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-brand-primary flex-shrink-0" />
            <div>
              <p className="font-semibold text-brand-ink">{message}</p>
              <p className="text-sm text-brand-subtle">$4.20/month • Cancel anytime</p>
            </div>
          </div>
          <Link href="/rewards/premium" className="btn-primary btn-sm flex-shrink-0">
            Upgrade
          </Link>
        </div>
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`card bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-brand-primary/30 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Crown className="w-6 h-6 text-brand-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-brand-ink mb-2">{message}</h3>
          <ul className="space-y-1 text-sm text-brand-subtle mb-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-brand-primary flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Link href="/rewards/premium" className="btn-primary w-full">
            Upgrade for $4.20/mo
          </Link>
        </div>
      </div>
    </div>
  );
}

