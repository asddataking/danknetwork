'use client';

import VideoFeed from '@/components/VideoFeed';
import DankNDevourHero from '@/components/DankNDevourHero';
import FeatureHighlights from '@/components/FeatureHighlights';
import FeaturedDispensary from '@/components/FeaturedDispensary';
import FreshDrops from '@/components/FreshDrops';

export default function DankNDevourPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <DankNDevourHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Feature Highlights */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <FeatureHighlights />
        </div>

        {/* Featured Dispensary */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <FeaturedDispensary />
        </div>

        {/* Fresh Drops from Shop */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <FreshDrops />
        </div>

        {/* Latest Episodes */}
        <div id="episodes" className="mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-neon-green font-bold text-xl sm:text-2xl uppercase">Latest Episodes</h2>
          </div>
          <VideoFeed filter={{ brand: 'danknddevour' }} />
        </div>
      </div>
    </div>
  );
}
