/**
 * ErrorMessage Components
 * 
 * Reusable error display components
 */

'use client';

import { AlertCircle, XCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
}

export function ErrorMessage({ 
  title = 'Error',
  message, 
  retry,
  className = '' 
}: ErrorMessageProps) {
  return (
    <div className={`p-4 bg-red-500/10 border border-red-500/20 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-500 mb-1">{title}</h3>
          <p className="text-sm text-red-500/80">{message}</p>
          {retry && (
            <button
              onClick={retry}
              className="mt-2 text-sm text-red-500 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorInline({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 text-red-500 text-sm ${className}`}>
      <XCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

export function ErrorCard({ 
  title = 'Error',
  message, 
  retry,
  className = '' 
}: ErrorMessageProps) {
  return (
    <div className={`card text-center py-8 ${className}`}>
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-brand-ink mb-2">{title}</h3>
      <p className="text-brand-subtle mb-4">{message}</p>
      {retry && (
        <button onClick={retry} className="btn-secondary">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      )}
    </div>
  );
}

