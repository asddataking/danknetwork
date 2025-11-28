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
import PremiumGamificationCTA from '@/components/PremiumGamificationCTA';

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
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching YouTube videos:', error);
        }
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

  // Get featured episode (most recent) - memoized to avoid re-sorting
  const featuredEpisode = useMemo(() => {
    const source = videos.length > 0 ? videos : staticVideos;
    return [...source].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  }, [videos]);

  // Get trending videos (most liked) - memoized to avoid re-sorting
  const trendingVideos = useMemo(() => {
    const source = videos.length > 0 ? videos : staticVideos;
    return [...source].sort((a, b) => b.likes - a.likes).slice(0, 4);
  }, [videos]);

  // Structured data for SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Dank Network',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thedanknetwork.com',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.thedanknetwork.com'}/icons/DankNetwork.png.png`,
    description: 'Michigan\'s home for dank content, food reviews, cannabis culture, and the Earn & Burn rewards system.',
    sameAs: [
      'https://www.youtube.com/@DankNetwork',
      'https://twitter.com/DankNetwork',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@thedanknetwork.com',
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
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

        {/* Premium Gamification CTA */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <PremiumGamificationCTA />
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
    </>
  );
}

