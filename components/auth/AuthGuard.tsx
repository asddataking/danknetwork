/**
 * AuthGuard Component
 * 
 * Wraps pages/components that require authentication
 * Shows loading state while checking auth, redirects if not authenticated
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import Link from 'next/link';
import { ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
  redirectTo?: string;
  loadingComponent?: ReactNode;
  fallbackComponent?: ReactNode;
}

export function AuthGuard({
  children,
  redirectTo = '/deals',
  loadingComponent,
  fallbackComponent,
}: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return loadingComponent || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!isAuthenticated) {
    return fallbackComponent || (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <User className="w-16 h-16 text-brand-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-brand-ink mb-2">
            Sign In Required
          </h2>
          <p className="text-brand-subtle mb-6">
            Please sign in to access this page
          </p>
          <Link href={redirectTo} className="btn-primary inline-block">
            Sign In / Sign Up
          </Link>
        </motion.div>
      </div>
    );
  }

  // User is authenticated, show children
  return <>{children}</>;
}

