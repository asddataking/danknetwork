/**
 * PremiumBadge Component
 * 
 * Shows premium status indicator
 * Reusable across the app
 */

'use client';

import { Crown } from 'lucide-react';
import { usePremium } from '@/hooks/usePremium';

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function PremiumBadge({ 
  size = 'md', 
  showIcon = true,
  className = '' 
}: PremiumBadgeProps) {
  const { isPremium, loading } = usePremium();

  if (loading || !isPremium) {
    return null;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 bg-brand-primary/20 border border-brand-primary/40 rounded-full font-medium text-brand-primary ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Crown className={iconSizes[size]} />}
      <span>Premium</span>
    </div>
  );
}

