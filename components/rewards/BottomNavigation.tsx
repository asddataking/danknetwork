'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Gift, Camera, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RewardsBottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dankpass', icon: Home, label: 'Home' },
    { href: '/dankpass/perks', icon: Gift, label: 'Burn' },
    { href: '/dankpass/upload', icon: Camera, label: 'Earn' },
    { href: '/rewards/profile', icon: User, label: 'Profile' },
  ];

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-brand-card/90 backdrop-blur-lg border-t border-brand-primary/10 rounded-t-2xl"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href === '/dankpass' && (pathname === '/dankpass' || pathname === '/rewards')) ||
              (item.href === '/dankpass/perks' && pathname === '/rewards/perks') ||
              (item.href === '/dankpass/upload' && pathname === '/rewards/upload');
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center py-2 px-3 rounded-xl transition-all duration-200 relative"
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-brand-primary/10 rounded-xl"
                    layoutId="activeRewardsTab"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <Icon 
                    className={`w-5 h-5 mb-1 transition-colors ${
                      isActive ? 'text-brand-primary' : 'text-brand-subtle'
                    }`} 
                  />
                  <span 
                    className={`text-xs font-medium transition-colors ${
                      isActive ? 'text-brand-primary' : 'text-brand-subtle'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}

