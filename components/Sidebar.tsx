'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ChannelsModal from './ChannelsModal';

export default function Sidebar() {
  const pathname = usePathname();
  const [isChannelsModalOpen, setIsChannelsModalOpen] = useState(false);

  const navItems = [
    {
      href: '/',
      label: 'HOME',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      external: false,
      isButton: false,
    },
    {
      href: '/shop',
      label: 'SHOP',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      external: false,
      isButton: false,
    },
    {
      href: '/munchie-map',
      label: 'MUNCHIE MAP',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      external: false,
      isButton: false,
    },
    {
      href: '/deals',
      label: 'DAILY DISPO DEALS',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      external: false,
      isButton: false,
    },
    {
      href: '#',
      label: 'CHANNELS',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      ),
      external: false,
      isButton: true,
    },
    {
      href: 'https://www.dankpass.com',
      label: 'DANK PASS',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      external: true,
      isButton: false,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-80 bg-dark-surface border-l border-neon-green/20 h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 space-y-8">
        {/* Navigation Section */}
        <div>
          <h2 className="text-white font-bold text-sm uppercase mb-4">NAVIGATION</h2>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = !item.external && !item.isButton && pathname === item.href;
              const linkClassName = `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-neon-green text-black font-bold'
                  : 'text-white hover:bg-white/5 hover:text-neon-green'
              }`;
              
              if (item.isButton) {
                return (
                  <button
                    key={item.label}
                    onClick={() => setIsChannelsModalOpen(true)}
                    className={linkClassName}
                  >
                    {item.icon}
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                );
              }
              
              if (item.external) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClassName}
                  >
                    {item.icon}
                    <span className="text-sm font-semibold">{item.label}</span>
                  </a>
                );
              }
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClassName}
                >
                  {item.icon}
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Exclusive Join The Network Section */}
        <div className="border-2 border-neon-green rounded-lg p-6 bg-black/50 relative">
          <div className="absolute top-0 left-0 bg-orange-500 px-3 py-1 rounded-br-lg">
            <span className="text-white text-xs font-bold uppercase">EXCLUSIVE</span>
          </div>
          <div className="pt-6">
            <h3 className="text-neon-green font-bold text-xl mb-3 uppercase">JOIN THE NETWORK</h3>
            <p className="text-white text-sm mb-6 leading-relaxed">
              Unlock exclusive content, early access to drops, and join our community of legends.
            </p>
            <button className="w-full bg-neon-green text-black font-bold py-3 px-6 rounded-lg hover:bg-neon-green-dark transition-colors duration-200 uppercase">
              GET MEMBERSHIP
            </button>
          </div>
        </div>

        {/* Advertisement Section */}
        <div className="space-y-2">
          <h3 className="text-white text-xs font-semibold uppercase">ADVERTISEMENT</h3>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 flex items-center justify-center min-h-[300px] bg-dark-bg/50">
            <p className="text-gray-500 text-sm text-center">Advertisement Space</p>
          </div>
        </div>
      </div>

      {/* Channels Modal */}
      {isChannelsModalOpen && (
        <ChannelsModal onClose={() => setIsChannelsModalOpen(false)} />
      )}
    </aside>
  );
}

