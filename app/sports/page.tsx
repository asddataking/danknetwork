'use client';

import VideoFeed from '@/components/VideoFeed';

export default function SportsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-500/20 to-accent-turquoise/20 border-b border-purple-500/30 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Dank Sports</h1>
          <p className="text-gray-300 text-lg">Lions energy, game-day food, and Michigan sports culture.</p>
        </div>
      </div>

      {/* Video Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <VideoFeed filter={{ brand: 'sports' }} />
      </div>
    </div>
  );
}

