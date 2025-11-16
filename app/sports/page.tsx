'use client';

import VideoFeed from '@/components/VideoFeed';

export default function SportsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-dark-bg border-b border-purple-500/30 py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139,92,246,0.5) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-purple flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-black text-lg">DS</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white bg-gradient-to-r from-white via-purple-400 to-accent-turquoise bg-clip-text text-transparent">
              Dank Sports
            </h1>
          </div>
          <p className="text-gray-300 text-xl max-w-2xl">Lions energy, game-day food, and Michigan sports culture.</p>
        </div>
      </div>

      {/* Video Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <VideoFeed filter={{ brand: 'sports' }} />
      </div>
    </div>
  );
}

