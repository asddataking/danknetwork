'use client';

import { motion } from 'framer-motion';
import { Crown, Check, Zap, Star, Upload, Gift, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { usePremium } from '@/hooks/usePremium';
import { PLANS } from '@/lib/subscription/premium';

export default function PremiumPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  
  const loading = authLoading || premiumLoading;

  const benefits = [
    {
      icon: Zap,
      title: '1.5x Points Multiplier',
      description: 'Earn 50% more points on every DankPass purchase'
    },
    {
      icon: Upload,
      title: 'Unlimited Receipt Uploads',
      description: 'No monthly limit on DankPass receipt uploads'
    },
    {
      icon: Gift,
      title: 'Exclusive DankPass Perks',
      description: 'Access to premium-only rewards and offers'
    },
    {
      icon: TrendingUp,
      title: 'Daily Dispo Deals - Full List',
      description: '10+ deals daily (vs 3-5 for free tier)'
    },
    {
      icon: Star,
      title: 'Early Daily Deals Access',
      description: 'Get deals at 7am instead of 9am'
    },
    {
      icon: Sparkles,
      title: 'Custom Brand Filtering',
      description: 'Filter deals by your preferred brands'
    }
  ];

  const handleSubscribe = () => {
    // Redirect to deals page which has Stripe checkout configured
    // In the future, we could unify this into a single checkout flow
    if (!isAuthenticated) {
      alert('Please sign up first to continue. For now, head to the Deals page to subscribe!');
      window.location.href = '/deals';
      return;
    }
    // For authenticated users, redirect to deals premium subscription
    window.location.href = '/deals';
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="px-6 pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Crown className="w-10 h-10 text-brand-primary" />
            </motion.div>
            <h1 className="text-3xl font-bold text-brand-ink mb-2">Go Premium</h1>
            <p className="text-brand-subtle">Unlock exclusive benefits and earn more rewards</p>
          </div>

          {/* Pricing Card */}
          <motion.div
            className="card mb-8 bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 border-brand-primary/30"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                <p className="text-brand-subtle mt-2">Loading...</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-brand-ink mb-2">
                    $4.20<span className="text-xl text-brand-subtle">/month</span>
                  </div>
                  <p className="text-brand-subtle">Billed monthly • Cancel anytime</p>
                  <p className="text-xs text-brand-primary mt-1">One subscription, all premium features!</p>
                </div>

                {isPremium ? (
                  <div className="text-center p-4 bg-brand-success/10 rounded-xl border border-brand-success/20">
                    <Check className="w-8 h-8 text-brand-success mx-auto mb-2" />
                    <p className="font-semibold text-brand-ink">You're already a Premium member!</p>
                    <p className="text-sm text-brand-subtle mt-2">
                      Enjoy access to DankPass Premium and Daily Dispo Deals Premium
                    </p>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={handleSubscribe}
                      className="btn-primary w-full mb-4"
                    >
                      Subscribe Now
                    </button>
                    <p className="text-xs text-center text-brand-subtle">
                      By subscribing, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </>
                )}
              </>
            )}
          </motion.div>

          {/* Benefits Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-brand-ink mb-4 text-center">What's Included</h2>
            <div className="grid grid-cols-1 gap-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    className="card"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-brand-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-brand-ink mb-1">{benefit.title}</h3>
                        <p className="text-sm text-brand-subtle">{benefit.description}</p>
                      </div>
                      <Check className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Comparison */}
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-brand-ink mb-4 text-center">Free vs Premium</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-primary/10">
                    <th className="text-left py-3 text-brand-subtle font-medium">Feature</th>
                    <th className="text-center py-3 text-brand-subtle font-medium">Free</th>
                    <th className="text-center py-3 text-brand-primary font-medium">Premium</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-brand-primary/10">
                    <td className="py-3 text-brand-ink">Points Multiplier</td>
                    <td className="text-center py-3 text-brand-subtle">1x</td>
                    <td className="text-center py-3 text-brand-primary font-semibold">1.5x</td>
                  </tr>
                  <tr className="border-b border-brand-primary/10">
                    <td className="py-3 text-brand-ink">Monthly Uploads</td>
                    <td className="text-center py-3 text-brand-subtle">15</td>
                    <td className="text-center py-3 text-brand-primary font-semibold">Unlimited</td>
                  </tr>
                  <tr className="border-b border-brand-primary/10">
                    <td className="py-3 text-brand-ink">Exclusive Perks</td>
                    <td className="text-center py-3 text-brand-subtle">—</td>
                    <td className="text-center py-3 text-brand-primary">
                      <Check className="w-5 h-5 inline" />
                    </td>
                  </tr>
                  <tr className="border-b border-brand-primary/10">
                    <td className="py-3 text-brand-ink">Priority Support</td>
                    <td className="text-center py-3 text-brand-subtle">—</td>
                    <td className="text-center py-3 text-brand-primary">
                      <Check className="w-5 h-5 inline" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-brand-ink">Early Access</td>
                    <td className="text-center py-3 text-brand-subtle">—</td>
                    <td className="text-center py-3 text-brand-primary">
                      <Check className="w-5 h-5 inline" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ */}
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-brand-ink mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-brand-ink mb-1">Can I cancel anytime?</h4>
                <p className="text-sm text-brand-subtle">Yes! You can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
              </div>
              <div>
                <h4 className="font-medium text-brand-ink mb-1">What happens to my points if I cancel?</h4>
                <p className="text-sm text-brand-subtle">Your points remain in your account. However, you'll lose access to premium-only perks and the 1.5x multiplier.</p>
              </div>
              <div>
                <h4 className="font-medium text-brand-ink mb-1">Do I get charged immediately?</h4>
                <p className="text-sm text-brand-subtle">Yes, you'll be charged $7 immediately and then monthly on the same date.</p>
              </div>
              <div>
                <h4 className="font-medium text-brand-ink mb-1">Can I upgrade from the app?</h4>
                <p className="text-sm text-brand-subtle">Yes! You can upgrade directly from the app using any major credit card.</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          {!isPremium && (
            <div className="text-center">
              <button 
                onClick={handleSubscribe}
                className="btn-primary mb-4"
              >
                <Crown className="w-5 h-5 mr-2 inline" />
                Start Premium Today
              </button>
              <Link href="/rewards" className="block text-brand-subtle hover:text-brand-primary">
                Maybe later
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

