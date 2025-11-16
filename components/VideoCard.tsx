'use client';

import { useState } from 'react';
import { Video } from '@/data/videos';
import { useAppStore } from '@/lib/store';

interface VideoCardProps {
  video: Video;
  onOpen: (video: Video) => void;
}

const brandColors: Record<string, string> = {
  danknddevour: 'bg-accent-turquoise',
  recipes: 'bg-accent-sky',
  sports: 'bg-purple-500',
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
    <div className="bg-dark-surface rounded-lg overflow-hidden border border-gray-800 hover:border-accent-turquoise/50 transition-all">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-gray-900 cursor-pointer group"
        onClick={() => onOpen(video)}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
        {/* Brand Pill */}
        <div className="absolute top-3 left-3">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${brandColors[video.brand]}`}>
            {brandLabels[video.brand]}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{video.title}</h3>
        
        {/* Metadata */}
        <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
          <span>{video.location}</span>
          <span>•</span>
          <span>{video.runtime}</span>
        </div>

        {/* Vibes */}
        <div className="flex flex-wrap gap-1 mb-3">
          {video.vibes.slice(0, 2).map((vibe) => (
            <span
              key={vibe}
              className="px-2 py-0.5 rounded-full text-xs bg-gray-800 text-gray-300"
            >
              {vibe}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(video.id);
            }}
            className={`flex items-center gap-2 transition-colors ${
              isLiked(video.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <svg className="w-5 h-5" fill={isLiked(video.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs">{video.likes + (isLiked(video.id) ? 1 : 0)}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSave(video.id);
            }}
            className={`transition-colors ${
              isSaved(video.id) ? 'text-accent-turquoise' : 'text-gray-400 hover:text-accent-turquoise'
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
            className="text-gray-400 hover:text-accent-turquoise transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-accent-turquoise text-dark-bg px-4 py-2 rounded-lg text-sm font-semibold">
          Link copied!
        </div>
      )}
    </div>
  );
}

