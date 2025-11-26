'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WelcomeBonusBannerProps {
  isNewUser: boolean;
  points: number;
}

export function WelcomeBonusBanner({ isNewUser, points }: WelcomeBonusBannerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Show banner if user just signed up (has exactly 100 points = welcome bonus)
    if (isNewUser && points === 100) {
      setShow(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [isNewUser, points]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-6"
        >
          <div className="card bg-gradient-to-r from-brand-primary/20 to-brand-primary/10 border-brand-primary/40 relative overflow-hidden">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent animate-pulse" />
            
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center flex-shrink-0 animate-bounce">
                <Gift className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-brand-ink text-lg mb-1">
                  Welcome to Dank Network! 🎉
                </h3>
                <p className="text-brand-subtle mb-2">
                  You've been awarded <span className="font-bold text-brand-primary">{points} bonus points</span> to get started!
                </p>
                <p className="text-sm text-brand-subtle">
                  Upload your first receipt to start earning more points →
                </p>
              </div>
              <button
                onClick={() => setShow(false)}
                className="text-brand-subtle hover:text-brand-ink transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

