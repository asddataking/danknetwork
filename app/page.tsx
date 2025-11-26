'use client';

import { useState, useMemo, useEffect } from 'react';
import { Video, videos as staticVideos } from '@/data/videos';
import FeaturedEpisodeHero from '@/components/FeaturedEpisodeHero';
// import ChannelCarousel from '@/components/ChannelCarousel'; // Hidden for now (only 1 active channel)
import ShopShowcase from '@/components/ShopShowcase';
import MunchieMapCarousel from '@/components/MunchieMapCarousel';
import DailyDispoDeals from '@/components/DailyDispoDeals';
import DealsSection from '@/components/DealsSection';
import TrendingSection from '@/components/TrendingSection';
import FeedTheCrew from '@/components/FeedTheCrew';
import FilterChips from '@/components/FilterChips';
import VideoFeed from '@/components/VideoFeed';
import NewsletterCTA from '@/components/NewsletterCTA';

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch videos from YouTube API
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/youtube/videos?brand=danknddevour&maxResults=50');
        if (response.ok) {
          const data = await response.json();
          if (data.videos && data.videos.length > 0) {
            setVideos(data.videos);
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
      }
      // Fallback to static data
      setVideos(staticVideos);
      setLoading(false);
    };

    fetchVideos();
  }, []);

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
  const featuredEpisode = videos.length > 0
    ? videos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : staticVideos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

  // Get trending videos (most liked)
  const trendingVideos = videos.length > 0
    ? [...videos].sort((a, b) => b.likes - a.likes).slice(0, 4)
    : [...staticVideos].sort((a, b) => b.likes - a.likes).slice(0, 4);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Featured Episode Hero */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <FeaturedEpisodeHero episode={featuredEpisode} />
        </div>

        {/* Channel Carousel - Hidden for now (only 1 active channel) */}
        {/* <div className="mb-12">
          <ChannelCarousel />
        </div> */}

        {/* Shop Showcase */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <ShopShowcase />
        </div>

        {/* Munchie Map Carousel */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <MunchieMapCarousel />
        </div>

        {/* Daily Dispo Deals Feature */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <DailyDispoDeals />
        </div>

        {/* Deals & Gear Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <DealsSection />
        </div>

        {/* Trending Section */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <TrendingSection title="Trending Now" videos={trendingVideos} />
        </div>

        {/* Feed the Crew */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <FeedTheCrew />
        </div>

        {/* Newsletter CTA */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <NewsletterCTA />
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

