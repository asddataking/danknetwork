'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import MapFilters from '@/components/map/MapFilters';

// Dynamically import the map component to avoid SSR issues
const MunchieMap = dynamic(() => import('@/components/map/MunchieMap'), {
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
  const [filters, setFilters] = useState<any>({});

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // Trigger map refresh with new filters
    // This will be handled by the map component listening to filter changes
  };

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

      {/* Filters and Map Container */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-200px)]">
        {/* Filters Sidebar */}
        <div className="lg:w-80 bg-dark-surface border-r border-neon-green/20 p-4 overflow-y-auto">
          <MapFilters onFilterChange={handleFilterChange} />
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MunchieMap filters={filters} />
        </div>
      </div>
    </div>
  );
}

