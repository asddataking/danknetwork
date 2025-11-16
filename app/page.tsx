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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-6">
        {/* Dank'N'Devour CTA */}
        <div className="bg-dark-surface border border-accent-turquoise/30 rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Go deeper with Dank&apos;N&apos;Devour</h2>
          <p className="text-gray-400 mb-6">
            Full restaurant episodes, behind-the-scenes, and Michigan food adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/danknddevour"
              className="px-6 py-3 bg-accent-turquoise text-dark-bg font-semibold rounded-lg hover:bg-accent-turquoise/90 transition-colors text-center"
            >
              Watch on Dank Network
            </Link>
            <a
              href="https://danknddevour.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-accent-turquoise text-accent-turquoise font-semibold rounded-lg hover:bg-accent-turquoise/10 transition-colors text-center"
            >
              Visit danknddevour.com
            </a>
          </div>
        </div>

        {/* DankPass CTA */}
        <div className="bg-dark-surface border border-purple-500/30 rounded-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold text-white mb-2">Turn receipts into rewards with DankPass</h2>
          <p className="text-gray-400 mb-6">
            Upload your dispensary receipts, earn points, and unlock food & merch deals.
          </p>
          <a
            href="https://www.dankpass.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-500/90 transition-colors"
          >
            Open DankPass
          </a>
        </div>
      </div>
    </div>
  );
}

