'use client';

import { useState } from 'react';
import { Video } from '@/data/videos';
import { useAppStore } from '@/lib/store';

interface VideoCardProps {
  video: Video;
  onOpen: (video: Video) => void;
}

const brandColors: Record<string, string> = {
  danknddevour: 'bg-neon-green',
  recipes: 'bg-neon-green',
  sports: 'bg-neon-green',
};

const brandLabels: Record<string, string> = {
  danknddevour: "Dank'N'Devour",
  recipes: 'Dank Recipes',
  sports: 'Dank Sports',
};

export default function VideoCard({ video, onOpen }: VideoCardProps) {
  const { isLiked, isSaved, toggleLike, toggleSave } = useAppStore();
  const [showToast, setShowToast] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(`https://thedanknetwork.com/video/${video.id}`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="bg-dark-surface rounded-xl overflow-hidden border border-gray-800/50 hover:border-neon-green/60 transition-all duration-300 hover:shadow-xl hover:shadow-neon-green/10 hover:-translate-y-1 group/card animate-fade-in">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-gray-900 cursor-pointer group overflow-hidden"
        onClick={() => onOpen(video)}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 group-hover:from-black/60 group-hover:via-black/30 group-hover:to-transparent transition-all duration-300"></div>
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 glow-neon-green">
            <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        
        {/* Brand Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg backdrop-blur-sm ${brandColors[video.brand]} border border-white/20`}>
            {brandLabels[video.brand]}
          </span>
        </div>
        
        {/* Runtime Badge */}
        <div className="absolute bottom-3 right-3 z-10">
          <span className="px-2.5 py-1 rounded-md text-xs font-bold text-white bg-black/70 backdrop-blur-sm border border-white/10">
            {video.runtime}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-white font-bold text-sm sm:text-base mb-2 sm:mb-3 line-clamp-2 group-hover/card:text-neon-green transition-colors leading-tight">
          {video.title}
        </h3>
        
        {/* Metadata */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs text-gray-400 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{video.location}</span>
          </div>
        </div>

        {/* Vibes */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {video.vibes.slice(0, 2).map((vibe) => (
            <span
              key={vibe}
              className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 border border-gray-700/50"
            >
              {vibe}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-800/50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(video.id);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isLiked(video.id)
                ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked(video.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs font-semibold">{video.likes + (isLiked(video.id) ? 1 : 0)}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(video.id);
            }}
            className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
              isSaved(video.id)
                ? 'text-neon-green bg-neon-green/10 hover:bg-neon-green/20'
                : 'text-gray-400 hover:text-neon-green hover:bg-neon-green/10'
            }`}
          >
            <svg className="w-5 h-5" fill={isSaved(video.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="text-gray-400 hover:text-neon-green px-3 py-1.5 rounded-lg hover:bg-neon-green/10 transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-neon-green text-black px-4 py-2 rounded-lg text-sm font-bold shadow-xl glow-neon-green z-50 animate-fade-in">
          ✨ Link copied!
        </div>
      )}
    </div>
  );
}

