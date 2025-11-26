'use client';

import { motion } from 'framer-motion';
import RewardsBottomNavigation from '@/components/rewards/BottomNavigation';

export default function RewardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      {/* Main Content */}
      <motion.main 
        className="flex-1 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      
      {/* Bottom Navigation */}
      <RewardsBottomNavigation />
    </div>
  );
}

