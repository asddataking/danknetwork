'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/recipes',
      label: 'RECIPES',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      external: false,
    },
    {
      href: 'https://www.dankpass.com',
      label: 'DANKPASS',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      external: true,
    },
    {
      href: '/danknddevour',
      label: 'DEVOUR',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      external: false,
    },
    {
      href: '/saved',
      label: 'PROFILE',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      external: false,
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
              const isActive = !item.external && (pathname === item.href || (item.href === '/danknddevour' && pathname?.startsWith('/danknddevour')));
              const linkClassName = `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-neon-green text-black font-bold'
                  : 'text-white hover:bg-white/5 hover:text-neon-green'
              }`;
              
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
    </aside>
  );
}

