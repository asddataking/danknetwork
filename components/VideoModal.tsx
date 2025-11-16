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
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-dark-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-accent-turquoise/50 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-accent-turquoise transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Area */}
        <div className="relative aspect-video bg-gray-900">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold text-white ${brandColors[video.brand]}`}>
              {brandLabels[video.brand]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">{video.title}</h2>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
            <span>{video.location}</span>
            <span>•</span>
            <span>{video.runtime}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {video.vibes.map((vibe) => (
              <span
                key={vibe}
                className="px-3 py-1 rounded-full text-sm bg-gray-800 text-gray-300"
              >
                {vibe}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
            <button
              onClick={() => toggleLike(video.id)}
              className={`flex items-center gap-2 transition-colors ${
                isLiked(video.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <svg className="w-6 h-6" fill={isLiked(video.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{video.likes + (isLiked(video.id) ? 1 : 0)}</span>
            </button>

            <button
              onClick={() => toggleSave(video.id)}
              className={`flex items-center gap-2 transition-colors ${
                isSaved(video.id) ? 'text-accent-turquoise' : 'text-gray-400 hover:text-accent-turquoise'
              }`}
            >
              <svg className="w-6 h-6" fill={isSaved(video.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              <span>Save</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-400 hover:text-accent-turquoise transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

