'use client';

import VideoFeed from '@/components/VideoFeed';
import Link from 'next/link';

export default function DankNDevourPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-accent-turquoise/20 to-accent-sky/20 border-b border-accent-turquoise/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Dank&apos;N&apos;Devour</h1>
          <p className="text-gray-300 text-lg mb-4">Michigan food & weed review episodes.</p>
          <a
            href="https://danknddevour.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-accent-turquoise text-dark-bg font-semibold rounded-lg hover:bg-accent-turquoise/90 transition-colors"
          >
            Full archives at danknddevour.com
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

