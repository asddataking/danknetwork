'use client';

import VideoFeed from '@/components/VideoFeed';
import Link from 'next/link';

export default function DankNDevourPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-accent-turquoise/20 via-accent-turquoise/10 to-dark-bg border-b border-accent-turquoise/30 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(15,185,201,0.5) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-turquoise flex items-center justify-center shadow-lg shadow-accent-turquoise/30">
              <span className="text-dark-bg font-black text-lg">DN</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white bg-gradient-to-r from-white via-accent-turquoise to-accent-sky bg-clip-text text-transparent">
              Dank&apos;N&apos;Devour
            </h1>
          </div>
          <p className="text-gray-300 text-xl mb-6 max-w-2xl">Michigan food & weed review episodes.</p>
          <a
            href="https://danknddevour.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-gradient-turquoise text-dark-bg font-bold rounded-xl hover:shadow-xl hover:shadow-accent-turquoise/30 transition-all duration-200 hover:scale-105"
          >
            Full archives at danknddevour.com →
          </a>
        </div>
      </div>

      {/* Video Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <VideoFeed filter={{ brand: 'danknddevour' }} />
      </div>
    </div>
  );
}

