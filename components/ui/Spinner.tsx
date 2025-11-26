/**
 * Spinner Component
 * 
 * Unified loading spinner
 */

'use client';

import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Loader2 className={`animate-spin text-brand-primary ${sizeClasses[size]} ${className}`} />
  );
}

export function SpinnerPage({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      {message && <p className="text-brand-subtle">{message}</p>}
    </div>
  );
}

