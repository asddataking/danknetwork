'use client';

import { Video } from '@/data/videos';
import { useState } from 'react';
import VideoModal from './VideoModal';

interface FeaturedEpisodeHeroProps {
  episode: Video;
}

const brandLabels: Record<string, string> = {
  danknddevour: "DANK'N'DEVOUR",
  recipes: 'DANK RECIPES',
  sports: 'DANK SPORTS',
};

const brandColors: Record<string, string> = {
  danknddevour: 'bg-neon-green',
  recipes: 'bg-neon-green',
  sports: 'bg-neon-green',
};

// Check if episode is new (within last 7 days)
function isNewEpisode(createdAt: string): boolean {
  const episodeDate = new Date(createdAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return episodeDate > sevenDaysAgo;
}

export default function FeaturedEpisodeHero({ episode }: FeaturedEpisodeHeroProps) {
  const isNew = isNewEpisode(episode.createdAt);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div 
        className="relative w-full aspect-video md:aspect-[21/9] rounded-lg overflow-hidden border border-neon-green/30 group cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={episode.thumbnailUrl}
          alt={episode.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">
        <div className="flex items-center gap-3 mb-4">
          {/* Brand Badge */}
          <span className={`${brandColors[episode.brand]} text-black px-4 py-2 rounded-lg text-xs font-bold uppercase`}>
            {brandLabels[episode.brand]}
          </span>
          
          {/* NEW Badge */}
          {isNew && (
            <span className="bg-orange-500 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase animate-pulse">
              NEW
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-white font-black text-3xl md:text-5xl mb-4 uppercase leading-tight">
          {episode.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{episode.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{episode.runtime}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{episode.likes}</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsModalOpen(true);
          }}
          className="bg-neon-green text-black px-8 py-4 rounded-lg font-bold text-lg uppercase hover:bg-neon-green-dark transition-colors duration-200 w-fit"
        >
          Watch Now
        </button>
      </div>

      {/* Play Button Overlay (Centered) */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 glow-neon-green">
          <svg className="w-10 h-10 md:w-12 md:h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      {isModalOpen && (
        <VideoModal video={episode} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}

