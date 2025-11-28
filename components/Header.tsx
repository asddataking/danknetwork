'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-black border-b border-neon-green/20">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo with Image */}
          <Link href="/" className="flex items-center space-x-1 sm:space-x-2 group">
            <Image
              src="/icons/DankNetwork.png.png"
              alt="Dank Network Logo"
              width={24}
              height={24}
              className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
              priority
            />
            <span className="text-neon-green font-black text-sm sm:text-lg md:text-xl">
              DANK NETWORK
            </span>
          </Link>

          {/* Right side icons */}
          <nav className="flex items-center space-x-2 sm:space-x-3 md:space-x-4" aria-label="Header actions">
            <button 
              className="text-white hover:text-neon-green p-1.5 sm:p-2 transition-colors duration-200"
              aria-label="Search"
              title="Search"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button 
              className="text-white hover:text-neon-green p-1.5 sm:p-2 transition-colors duration-200"
              aria-label="Favorites"
              title="Favorites"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

