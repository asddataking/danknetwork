'use client';

import { useState, useMemo } from 'react';
import { Video, videos } from '@/data/videos';
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

  const filteredVideos = useMemo(() => {
    let filtered = initialVideos || videos;

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

