'use client';

import { useState, useMemo } from 'react';
import { videos } from '@/data/videos';
import FeaturedEpisodeHero from '@/components/FeaturedEpisodeHero';
// import ChannelCarousel from '@/components/ChannelCarousel'; // Hidden for now (only 1 active channel)
import ShopShowcase from '@/components/ShopShowcase';
import DealsSection from '@/components/DealsSection';
import TrendingSection from '@/components/TrendingSection';
import FeedTheCrew from '@/components/FeedTheCrew';
import FilterChips from '@/components/FilterChips';
import VideoFeed from '@/components/VideoFeed';

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

  // Get featured episode (most recent)
  const featuredEpisode = videos.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )[0];

  // Get trending videos (most liked)
  const trendingVideos = [...videos]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Episode Hero */}
        <div className="mb-12">
          <FeaturedEpisodeHero episode={featuredEpisode} />
        </div>

        {/* Channel Carousel - Hidden for now (only 1 active channel) */}
        {/* <div className="mb-12">
          <ChannelCarousel />
        </div> */}

        {/* Shop Showcase */}
        <div className="mb-12">
          <ShopShowcase />
        </div>

        {/* Deals & Gear Section */}
        <div className="mb-12">
          <DealsSection />
        </div>

        {/* Trending Section */}
        <div className="mb-12">
          <TrendingSection title="Trending Now" videos={trendingVideos} />
        </div>

        {/* Feed the Crew */}
        <div className="mb-12">
          <FeedTheCrew />
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FilterChips selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
        </div>

        {/* Video Feed */}
        <div className="pb-12">
          <VideoFeed filter={filter} />
        </div>
      </div>
    </div>
  );
}

