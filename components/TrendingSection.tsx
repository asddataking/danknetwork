'use client';

import { Video, videos } from '@/data/videos';
import VideoCard from './VideoCard';
import { useState } from 'react';
import VideoModal from './VideoModal';

interface TrendingSectionProps {
  title: string;
  videos: Video[];
  limit?: number;
}

export default function TrendingSection({ title, videos: sectionVideos, limit = 4 }: TrendingSectionProps) {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const displayedVideos = sectionVideos.slice(0, limit);

  return (
    <>
      <div className="w-full mb-12">
        <h2 className="text-neon-green font-bold text-2xl mb-6 uppercase">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayedVideos.map((video) => (
            <VideoCard key={video.id} video={video} onOpen={setSelectedVideo} />
          ))}
        </div>
      </div>

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </>
  );
}

