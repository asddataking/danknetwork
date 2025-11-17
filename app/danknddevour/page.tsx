'use client';

import VideoFeed from '@/components/VideoFeed';
import DankNDevourHero from '@/components/DankNDevourHero';
import FeatureHighlights from '@/components/FeatureHighlights';
import MunchieMapSection from '@/components/MunchieMapSection';
import FeaturedDispensary from '@/components/FeaturedDispensary';
import FreshDrops from '@/components/FreshDrops';

export default function DankNDevourPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <DankNDevourHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Feature Highlights */}
        <FeatureHighlights />

        {/* Interactive Munchie Map Section */}
        <MunchieMapSection />

        {/* Featured Dispensary */}
        <FeaturedDispensary />

        {/* Fresh Drops from Shop */}
        <FreshDrops />

        {/* Latest Episodes */}
        <div id="episodes" className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-neon-green font-bold text-2xl uppercase">Latest Episodes</h2>
          </div>
          <VideoFeed filter={{ brand: 'danknddevour' }} />
        </div>
      </div>
    </div>
  );
}
