'use client';

import { useState, useMemo, useEffect } from 'react';
import { Video, videos as staticVideos } from '@/data/videos';
import VideoCard from './VideoCard';
import VideoModal from './VideoModal';

interface VideoFeedProps {
  initialVideos?: Video[];
  filter?: {
    brand?: string;
    vibe?: string;
  };
}

export default function VideoFeed({ initialVideos, filter }: VideoFeedProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [displayCount, setDisplayCount] = useState(12);
  const [videos, setVideos] = useState<Video[]>(initialVideos || []);

  // Fetch videos from YouTube API
  useEffect(() => {
    // Skip if we have initialVideos provided
    if (initialVideos && initialVideos.length > 0) {
      setVideos(initialVideos);
      return;
    }

    const fetchVideos = async () => {
      try {
        const brand = filter?.brand || 'danknddevour';
        const response = await fetch(`/api/youtube/videos?brand=${brand}&maxResults=50`);
        if (response.ok) {
          const data = await response.json();
          if (data.videos && data.videos.length > 0) {
            setVideos(data.videos);
            return;
          }
        }
      } catch (error) {
        console.error('Error fetching YouTube videos:', error);
      }
      // Fallback to static data if API fails
      setVideos(staticVideos);
    };

    fetchVideos();
  }, [filter?.brand, initialVideos]);

  const filteredVideos = useMemo(() => {
    let filtered = videos.length > 0 ? videos : (initialVideos || staticVideos);

    if (filter?.brand && filter.brand !== 'all') {
      filtered = filtered.filter((v) => v.brand === filter.brand);
    }

    if (filter?.vibe && filter.vibe !== 'all') {
      filtered = filtered.filter((v) => v.vibes.includes(filter.vibe!));
    }

    return filtered;
  }, [initialVideos, filter]);

  const displayedVideos = filteredVideos.slice(0, displayCount);
  const hasMore = displayCount < filteredVideos.length;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedVideos.map((video) => (
          <VideoCard key={video.id} video={video} onOpen={setSelectedVideo} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 12)}
            className="px-6 py-3 bg-neon-green text-black font-semibold rounded-lg hover:bg-neon-green-dark transition-colors"
          >
            Load More
          </button>
        </div>
      )}

      {displayedVideos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">No videos found matching your filters.</p>
        </div>
      )}

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </>
  );
}

