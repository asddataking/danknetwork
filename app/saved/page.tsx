'use client';

import { useMemo } from 'react';
import { videos } from '@/data/videos';
import { useAppStore } from '@/lib/store';
import VideoFeed from '@/components/VideoFeed';
import Link from 'next/link';

export default function SavedPage() {
  const { savedVideos } = useAppStore();
  
  const savedVideoList = useMemo(() => {
    return videos.filter((video) => savedVideos.includes(video.id));
  }, [savedVideos]);

  if (savedVideoList.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center px-4 max-w-md">
          <svg
            className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
            />
          </svg>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Nothing in your stash yet</h2>
          <p className="text-gray-400 mb-4 sm:mb-6 text-sm sm:text-base">Start scrolling on Home and save videos you want to watch later.</p>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 sm:px-6 sm:py-3 bg-accent-turquoise text-dark-bg font-semibold rounded-lg hover:bg-accent-turquoise/90 transition-colors text-sm sm:text-base"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-6 sm:mb-8">Saved Videos</h1>
        <VideoFeed initialVideos={savedVideoList} />
      </div>
    </div>
  );
}

