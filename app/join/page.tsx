'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Building2, UtensilsCrossed, ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';

export default function JoinPage() {
  const [hoveredType, setHoveredType] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="px-6 pt-16 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-brand-ink mb-4">Join Dank Network</h1>
            <p className="text-xl text-brand-subtle">
              Connect with cannabis enthusiasts and food lovers
            </p>
          </div>

          {/* Business Type Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Dispensary */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredType('dispensary')}
              onHoverEnd={() => setHoveredType(null)}
              className="card cursor-pointer group"
            >
              <Link href="/join/dispensary">
                <div className="flex flex-col items-center text-center p-8">
                  <div className={`w-20 h-20 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 transition-colors ${
                    hoveredType === 'dispensary' ? 'bg-green-500/20' : ''
                  }`}>
                    <Building2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-ink mb-3">Dispensaries</h2>
                  <p className="text-brand-subtle mb-6">
                    Join as a cannabis dispensary and reach thousands of customers
                  </p>
                  <div className="flex items-center gap-2 text-brand-primary font-semibold group-hover:gap-3 transition-all">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Restaurant */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              onHoverStart={() => setHoveredType('restaurant')}
              onHoverEnd={() => setHoveredType(null)}
              className="card cursor-pointer group"
            >
              <Link href="/join/restaurant">
                <div className="flex flex-col items-center text-center p-8">
                  <div className={`w-20 h-20 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 transition-colors ${
                    hoveredType === 'restaurant' ? 'bg-orange-500/20' : ''
                  }`}>
                    <UtensilsCrossed className="w-10 h-10 text-orange-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-brand-ink mb-3">Restaurants</h2>
                  <p className="text-brand-subtle mb-6">
                    Join as a restaurant and connect with the cannabis community
                  </p>
                  <div className="flex items-center gap-2 text-brand-primary font-semibold group-hover:gap-3 transition-all">
                    Get Started
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Benefits Section */}
          <div className="card mb-12">
            <h2 className="text-2xl font-bold text-brand-ink mb-6 text-center">Why Join Dank Network?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-ink mb-2">Reach More Customers</h3>
                <p className="text-sm text-brand-subtle">
                  Connect with thousands of active users in the cannabis community
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-ink mb-2">Easy Rewards System</h3>
                <p className="text-sm text-brand-subtle">
                  Set up points, perks, and multipliers with our simple dashboard
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-brand-primary" />
                </div>
                <h3 className="font-semibold text-brand-ink mb-2">Analytics & Insights</h3>
                <p className="text-sm text-brand-subtle">
                  Track customer engagement and optimize your rewards program
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <p className="text-brand-subtle mb-4">Questions? Contact us at partners@danknetwork.com</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}



