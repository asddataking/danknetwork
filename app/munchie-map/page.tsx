'use client';

import dynamic from 'next/dynamic';

// Dynamically import to avoid SSR issues
const MapContainerDynamic = dynamic(() => import('@/components/map/MapContainer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-dark-surface flex items-center justify-center">
      <div className="text-center">
        <div className="text-neon-green text-2xl mb-4">Loading Map...</div>
        <div className="w-16 h-16 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  ),
});

export default function MunchieMapPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header Section */}
      <div className="bg-dark-surface border-b border-neon-green/20 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-neon-green font-black text-3xl md:text-4xl uppercase mb-2">
            Interactive Munchie Map
          </h1>
          <p className="text-gray-300 text-lg">
            Discover Michigan&apos;s most authentic food experiences, verified dispensaries, and hidden gems
          </p>
        </div>
      </div>

      {/* Map Container with Split View */}
      <MapContainerDynamic />
    </div>
  );
}

