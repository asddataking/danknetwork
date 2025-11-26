/**
 * LoadingSkeleton Components
 * 
 * Reusable skeleton loaders for better perceived performance
 */

'use client';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-brand-bg rounded ${className}`} />
  );
}

export function CardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`card ${className}`}>
      <div className="animate-pulse space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function StatCardSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function ListItemSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-16 h-8 rounded" />
      </div>
    </div>
  );
}

export function ProfileSkeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`card ${className}`}>
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, className = '' }: SkeletonProps & { rows?: number }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      ))}
    </div>
  );
}

