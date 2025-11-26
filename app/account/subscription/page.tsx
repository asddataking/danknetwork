/**
 * Subscription Management Page
 * 
 * Allows users to view and manage their subscription
 */

'use client';

import { motion } from 'framer-motion';
import { Crown, Calendar, CreditCard, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { SpinnerPage } from '@/components/ui/Spinner';
import { PLANS } from '@/lib/subscription/plans';

function SubscriptionPageContent() {
  const { user } = useAuth();
  const { isPremium, subscription, loading } = usePremium();
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll lose access to premium features at the end of your billing period.')) {
      return;
    }

    setCanceling(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement cancel subscription API endpoint
      // For now, just show a message
      alert('Subscription cancellation will be available soon. Please contact support for now.');
      
      /*
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel subscription');
      }

      setSuccess('Subscription canceled. You\'ll retain access until the end of your billing period.');
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setCanceling(false);
    }
  };

  if (loading) {
    return <SpinnerPage message="Loading subscription..." />;
  }

  if (!isPremium || !subscription) {
    return (
      <div className="min-h-screen px-6 pt-16 pb-6">
        <Link href="/rewards/profile" className="inline-flex items-center gap-2 text-brand-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card text-center py-12">
            <Crown className="w-16 h-16 text-brand-subtle mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-brand-ink mb-2">
              No Active Subscription
            </h2>
            <p className="text-brand-subtle mb-6">
              Upgrade to Premium to unlock exclusive benefits across Dank Network
            </p>
            <Link href="/rewards/premium" className="btn-primary inline-block">
              View Premium Plans
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const renewalDate = subscription.current_period_end 
    ? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'N/A';

  const isCanceled = subscription.cancel_at_period_end;

  return (
    <div className="min-h-screen px-6 pt-16 pb-6">
      <Link href="/rewards/profile" className="inline-flex items-center gap-2 text-brand-primary hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-brand-ink mb-2">Manage Subscription</h1>
          <p className="text-brand-subtle">View and manage your Premium membership</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            {success}
          </div>
        )}

        {/* Current Plan */}
        <div className="card bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-brand-primary/30">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Crown className="w-8 h-8 text-brand-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-brand-ink mb-1">
                {PLANS.NETWORK_PREMIUM.name}
              </h2>
              <p className="text-brand-subtle text-sm">
                All premium features unlocked
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-brand-ink">$4.20</div>
              <div className="text-sm text-brand-subtle">per month</div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3 pt-4 border-t border-brand-subtle/10">
            <div className="flex items-center justify-between">
              <span className="text-brand-subtle">Status</span>
              <div className="flex items-center gap-2">
                {isCanceled ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-brand-warn" />
                    <span className="font-medium text-brand-warn">Canceling</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-brand-success" />
                    <span className="font-medium text-brand-success">Active</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-brand-subtle">
                {isCanceled ? 'Access until' : 'Next billing date'}
              </span>
              <div className="flex items-center gap-2 text-brand-ink font-medium">
                <Calendar className="w-4 h-4 text-brand-subtle" />
                <span>{renewalDate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-brand-subtle">Email</span>
              <span className="text-brand-ink font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Features Included */}
        <div className="card">
          <h3 className="font-semibold text-brand-ink mb-4">Features Included</h3>
          <div className="space-y-2">
            {PLANS.NETWORK_PREMIUM.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-brand-subtle">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="card space-y-3">
          <h3 className="font-semibold text-brand-ink mb-4">Manage Subscription</h3>
          
          {/* Update Payment Method */}
          <button
            disabled
            className="w-full flex items-center justify-between p-3 bg-brand-bg rounded-lg hover:bg-brand-bg/80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-brand-subtle" />
              <span className="text-brand-ink">Update Payment Method</span>
            </div>
            <span className="text-brand-subtle text-sm">Coming soon</span>
          </button>

          {/* Cancel Subscription */}
          {!isCanceled && (
            <button
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="w-full flex items-center justify-center gap-2 p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {canceling ? (
                <>
                  <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
                  <span>Canceling...</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span>Cancel Subscription</span>
                </>
              )}
            </button>
          )}

          {isCanceled && (
            <div className="p-3 bg-brand-warn/10 border border-brand-warn/20 rounded-lg">
              <p className="text-sm text-brand-warn text-center">
                Your subscription is set to cancel on {renewalDate}. You'll retain access until then.
              </p>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="text-center">
          <p className="text-sm text-brand-subtle">
            Need help? <a href="mailto:support@danknetwork.com" className="text-brand-primary hover:underline">Contact Support</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <AuthGuard>
      <SubscriptionPageContent />
    </AuthGuard>
  );
}

