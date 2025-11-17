'use client';

import { useState, useMemo, useEffect } from 'react';
import { Video, videos as staticVideos } from '@/data/videos';
import FeaturedEpisodeHero from '@/components/FeaturedEpisodeHero';
// import ChannelCarousel from '@/components/ChannelCarousel'; // Hidden for now (only 1 active channel)
import FreshDrops from '@/components/FreshDrops';
import ShopShowcase from '@/components/ShopShowcase';
import DealsSection from '@/components/DealsSection';
import TrendingSection from '@/components/TrendingSection';
import FeedTheCrew from '@/components/FeedTheCrew';
import FilterChips from '@/components/FilterChips';
import VideoFeed from '@/components/VideoFeed';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Episode Hero */}
        <div className="mb-12">
          <FeaturedEpisodeHero episode={featuredEpisode} />
        </div>

        {/* Channel Carousel - Hidden for now (only 1 active channel) */}
        {/* <div className="mb-12">
          <ChannelCarousel />
        </div> */}

        {/* Fresh Drops from the Shop */}
        <div className="mb-12">
          <FreshDrops />
        </div>

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

