/**
 * LoadingPage Component
 * 
 * Full page loading state with skeleton
 */

'use client';

import { CardSkeleton, StatCardSkeleton } from './LoadingSkeleton';

export function LoadingPage() {
  return (
    <div className="min-h-screen px-6 pt-16 pb-6">
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="space-y-2">
          <div className="h-8 bg-brand-bg rounded w-48"></div>
          <div className="h-4 bg-brand-bg rounded w-32"></div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>

        {/* Cards skeleton */}
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

