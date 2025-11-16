'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <header className="sticky top-0 z-50 bg-dark-bg border-b border-accent-turquoise/20 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-accent-turquoise flex items-center justify-center">
              <span className="text-dark-bg font-bold text-sm">DN</span>
            </div>
            <span className="text-white font-bold text-lg hidden sm:block">Dank Network</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-accent-turquoise' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link
              href="/danknddevour"
              className={`text-sm font-medium transition-colors ${
                pathname === '/danknddevour' ? 'text-accent-turquoise' : 'text-gray-300 hover:text-white'
              }`}
            >
              Dank&apos;N&apos;Devour
            </Link>
            <Link
              href="/recipes"
              className={`text-sm font-medium transition-colors ${
                pathname === '/recipes' ? 'text-accent-turquoise' : 'text-gray-300 hover:text-white'
              }`}
            >
              Dank Recipes
            </Link>
            <Link
              href="/sports"
              className={`text-sm font-medium transition-colors ${
                pathname === '/sports' ? 'text-accent-turquoise' : 'text-gray-300 hover:text-white'
              }`}
            >
              Dank Sports
            </Link>
            <Link
              href="/saved"
              className={`text-sm font-medium transition-colors ${
                pathname === '/saved' ? 'text-accent-turquoise' : 'text-gray-300 hover:text-white'
              }`}
            >
              Saved
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-300 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-300 hover:text-white transition-colors">
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

