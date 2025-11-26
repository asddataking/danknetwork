/**
 * ErrorPage Component
 * 
 * Full page error state
 */

'use client';

import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface ErrorPageProps {
  title?: string;
  message?: string;
  retry?: () => void;
  showHomeButton?: boolean;
}

export function ErrorPage({ 
  title = 'Something went wrong',
  message = 'We encountered an unexpected error. Please try again.',
  retry,
  showHomeButton = true,
}: ErrorPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md text-center"
      >
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-brand-ink mb-3">{title}</h1>
        <p className="text-brand-subtle mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {retry && (
            <button onClick={retry} className="btn-primary flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          {showHomeButton && (
            <Link href="/" className="btn-secondary flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      title="404 - Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      showHomeButton={true}
    />
  );
}

