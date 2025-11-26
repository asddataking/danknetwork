'use client';

import { motion } from 'framer-motion';
import { Upload, Crown, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface UploadLimitCardProps {
  currentCount: number;
  limit: number;
  isPremium: boolean;
}

export function UploadLimitCard({ currentCount, limit, isPremium }: UploadLimitCardProps) {
  const percentage = Math.min((currentCount / limit) * 100, 100);
  const remaining = Math.max(limit - currentCount, 0);
  
  const getColor = () => {
    if (isPremium) return 'text-brand-primary';
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 70) return 'text-yellow-500';
    return 'text-brand-primary';
  };

  const getBarColor = () => {
    if (isPremium) return 'bg-brand-primary';
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-brand-primary';
  };

  if (isPremium) {
    return (
      <div className="card bg-gradient-to-r from-brand-primary/10 to-brand-primary/5 border-brand-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary/20 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <p className="font-semibold text-brand-ink">Unlimited Uploads</p>
              <p className="text-sm text-brand-subtle">{currentCount} receipts this month</p>
            </div>
          </div>
          <TrendingUp className="w-5 h-5 text-brand-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-brand-subtle" />
          <h3 className="font-semibold text-brand-ink">Monthly Uploads</h3>
        </div>
        <span className={`text-sm font-medium ${getColor()}`}>
          {currentCount}/{limit}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-brand-bg rounded-full h-2 overflow-hidden">
          <motion.div
            className={getBarColor()}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {remaining > 0 ? (
        <p className="text-sm text-brand-subtle mb-3">
          <span className="font-medium text-brand-ink">{remaining} uploads</span> remaining this month
        </p>
      ) : (
        <p className="text-sm text-red-500 font-medium mb-3">
          ⚠️ Monthly limit reached
        </p>
      )}

      {/* Upsell */}
      {percentage >= 70 && (
        <div className="pt-3 border-t border-brand-subtle/10">
          <div className="flex items-center justify-between">
            <p className="text-xs text-brand-subtle">
              Upgrade for unlimited uploads
            </p>
            <Link href="/rewards/premium" className="text-xs text-brand-primary hover:underline font-medium">
              Go Premium →
            </Link>
          </div>
        </div>
      )}

      {remaining === 0 && (
        <div className="pt-3 border-t border-brand-subtle/10">
          <Link href="/rewards/premium" className="btn-primary w-full btn-sm flex items-center justify-center gap-2">
            <Crown className="w-4 h-4" />
            Upgrade for Unlimited
          </Link>
        </div>
      )}
    </div>
  );
}

