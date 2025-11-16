'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-dark-surface/95 backdrop-blur-md border-t border-accent-turquoise/30 shadow-lg shadow-black/20 md:hidden">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            pathname === '/' 
              ? 'text-accent-turquoise scale-110' 
              : 'text-gray-400 hover:text-white hover:scale-105'
          }`}
        >
          <div className={`p-2 rounded-lg ${pathname === '/' ? 'bg-accent-turquoise/10' : ''}`}>
            <svg className="w-6 h-6" fill={pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <span className={`text-xs mt-1 font-semibold ${pathname === '/' ? 'font-bold' : ''}`}>Home</span>
        </Link>
        <Link
          href="/#channels"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            pathname.includes('danknddevour') || pathname.includes('recipes') || pathname.includes('sports')
              ? 'text-accent-turquoise scale-110'
              : 'text-gray-400 hover:text-white hover:scale-105'
          }`}
        >
          <div className={`p-2 rounded-lg ${(pathname.includes('danknddevour') || pathname.includes('recipes') || pathname.includes('sports')) ? 'bg-accent-turquoise/10' : ''}`}>
            <svg className="w-6 h-6" fill={(pathname.includes('danknddevour') || pathname.includes('recipes') || pathname.includes('sports')) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <span className={`text-xs mt-1 font-semibold ${(pathname.includes('danknddevour') || pathname.includes('recipes') || pathname.includes('sports')) ? 'font-bold' : ''}`}>Channels</span>
        </Link>
        <Link
          href="/saved"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
            pathname === '/saved' ? 'text-accent-turquoise scale-110' : 'text-gray-400 hover:text-white hover:scale-105'
          }`}
        >
          <div className={`p-2 rounded-lg ${pathname === '/saved' ? 'bg-accent-turquoise/10' : ''}`}>
            <svg className="w-6 h-6" fill={pathname === '/saved' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
          <span className={`text-xs mt-1 font-semibold ${pathname === '/saved' ? 'font-bold' : ''}`}>Saved</span>
        </Link>
        <button className="flex flex-col items-center justify-center flex-1 h-full text-gray-400 hover:text-white transition-all duration-200 hover:scale-105">
          <div className="p-2 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span className="text-xs mt-1 font-semibold">Profile</span>
        </button>
      </div>
    </nav>
  );
}

