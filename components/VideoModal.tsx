'use client';

import { useEffect } from 'react';
import { Video } from '@/data/videos';
import { useAppStore } from '@/lib/store';

interface VideoModalProps {
  video: Video;
  onClose: () => void;
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

export default function VideoModal({ video, onClose }: VideoModalProps) {
  const { isLiked, isSaved, toggleLike, toggleSave } = useAppStore();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(`https://thedanknetwork.com/video/${video.id}`);
    // Could show a toast here
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-dark-surface via-dark-bg to-dark-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-accent-turquoise/50 shadow-2xl shadow-accent-turquoise/20 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white hover:text-accent-turquoise hover:bg-accent-turquoise/20 transition-all duration-200 flex items-center justify-center shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Area */}
        <div className="relative aspect-video bg-gray-900 overflow-hidden rounded-t-2xl">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform duration-300 glow-turquoise cursor-pointer">
              <svg className="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute top-4 left-4 z-10">
            <span className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-xl backdrop-blur-sm border border-white/20 ${brandColors[video.brand]}`}>
              {brandLabels[video.brand]}
            </span>
          </div>
          <div className="absolute bottom-4 right-4 z-10">
            <span className="px-3 py-1.5 rounded-lg text-sm font-bold text-white bg-black/70 backdrop-blur-sm border border-white/10">
              {video.runtime}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 bg-gradient-to-r from-white to-accent-turquoise bg-clip-text text-transparent leading-tight">
            {video.title}
          </h2>

          <div className="flex items-center gap-3 text-base text-gray-300 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-accent-turquoise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="font-semibold">{video.location}</span>
            </div>
            <span>•</span>
            <span className="font-semibold">{video.runtime}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {video.vibes.map((vibe) => (
              <span
                key={vibe}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-gray-800 to-gray-700 text-gray-200 border border-gray-700/50"
              >
                {vibe}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 pt-6 border-t border-gray-800/50">
            <button
              onClick={() => toggleLike(video.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 font-bold ${
                isLiked(video.id)
                  ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'
              }`}
            >
              <svg className="w-6 h-6" fill={isLiked(video.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-lg">{video.likes + (isLiked(video.id) ? 1 : 0)}</span>
            </button>

            <button
              onClick={() => toggleSave(video.id)}
              className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 font-bold ${
                isSaved(video.id)
                  ? 'text-accent-turquoise bg-accent-turquoise/10 hover:bg-accent-turquoise/20'
                  : 'text-gray-400 hover:text-accent-turquoise hover:bg-accent-turquoise/10'
              }`}
            >
              <svg className="w-6 h-6" fill={isSaved(video.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span className="text-lg">Save</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-3 px-5 py-3 rounded-xl text-gray-400 hover:text-accent-turquoise hover:bg-accent-turquoise/10 transition-all duration-200 font-bold"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="text-lg">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

