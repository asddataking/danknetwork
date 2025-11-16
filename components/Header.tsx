'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <header className="sticky top-0 z-50 bg-dark-bg/95 backdrop-blur-md border-b border-accent-turquoise/30 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-turquoise flex items-center justify-center shadow-lg shadow-accent-turquoise/30 group-hover:scale-110 transition-transform duration-200">
              <span className="text-dark-bg font-black text-sm">DN</span>
            </div>
            <span className="text-white font-black text-xl hidden sm:block bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Dank Network
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname === '/'
                  ? 'text-accent-turquoise bg-accent-turquoise/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link
              href="/danknddevour"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname === '/danknddevour'
                  ? 'text-accent-turquoise bg-accent-turquoise/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Dank&apos;N&apos;Devour
            </Link>
            <Link
              href="/recipes"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname === '/recipes'
                  ? 'text-accent-sky bg-accent-sky/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Dank Recipes
            </Link>
            <Link
              href="/sports"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname === '/sports'
                  ? 'text-purple-400 bg-purple-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Dank Sports
            </Link>
            <Link
              href="/saved"
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                pathname === '/saved'
                  ? 'text-accent-turquoise bg-accent-turquoise/10'
                  : 'text-gray-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Saved
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-3">
            <button className="text-gray-300 hover:text-accent-turquoise p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-300 hover:text-accent-turquoise p-2 rounded-lg hover:bg-white/5 transition-all duration-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

