'use client';

import { useState, useMemo } from 'react';
import NetworkStrip from '@/components/NetworkStrip';
import FilterChips from '@/components/FilterChips';
import VideoFeed from '@/components/VideoFeed';
import Link from 'next/link';

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filter = useMemo(() => {
    if (selectedFilter === 'all') {
      return {};
    }
    
    // Check if it's a brand filter
    if (['danknddevour', 'recipes', 'sports'].includes(selectedFilter)) {
      return { brand: selectedFilter };
    }
    
    // Otherwise it's a vibe filter
    return { vibe: selectedFilter };
  }, [selectedFilter]);

  return (
    <div className="min-h-screen">
      {/* Network Strip */}
      <NetworkStrip />

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FilterChips selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
      </div>

      {/* Video Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <VideoFeed filter={filter} />
      </div>

      {/* CTAs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-8">
        {/* Dank'N'Devour CTA */}
        <div className="relative bg-gradient-to-br from-dark-surface via-dark-bg to-dark-surface border-2 border-accent-turquoise/40 rounded-2xl p-8 md:p-10 overflow-hidden group hover:border-accent-turquoise hover:shadow-2xl hover:shadow-accent-turquoise/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent-turquoise/5 rounded-full blur-3xl group-hover:bg-accent-turquoise/10 transition-colors"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 bg-gradient-to-r from-white to-accent-turquoise bg-clip-text text-transparent">
              Go deeper with Dank&apos;N&apos;Devour
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl">
              Full restaurant episodes, behind-the-scenes, and Michigan food adventures.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/danknddevour"
                className="px-8 py-4 bg-gradient-turquoise text-dark-bg font-black rounded-xl hover:shadow-xl hover:shadow-accent-turquoise/30 transition-all duration-200 text-center hover:scale-105"
              >
                Watch on Dank Network
              </Link>
              <a
                href="https://danknddevour.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border-2 border-accent-turquoise text-accent-turquoise font-bold rounded-xl hover:bg-accent-turquoise/10 transition-all duration-200 text-center hover:scale-105"
              >
                Visit danknddevour.com
              </a>
            </div>
          </div>
        </div>

        {/* DankPass CTA */}
        <div className="relative bg-gradient-to-br from-dark-surface via-dark-bg to-dark-surface border-2 border-purple-500/40 rounded-2xl p-8 md:p-10 overflow-hidden group hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3 bg-gradient-to-r from-white to-purple-400 bg-clip-text text-transparent">
              Turn receipts into rewards with DankPass
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl">
              Upload your dispensary receipts, earn points, and unlock food & merch deals.
            </p>
            <a
              href="https://www.dankpass.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-purple text-white font-black rounded-xl hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105"
            >
              Open DankPass
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

