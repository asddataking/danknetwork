'use client';

import { useState, useMemo } from 'react';
import NetworkStrip from '@/components/NetworkStrip';
import FilterChips from '@/components/FilterChips';
import VideoFeed from '@/components/VideoFeed';
import Link from 'next/link';

export default function HomePage() {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filter = useMemo(() => {
    if (selectedFilter === 'all') {
      return {};
    }
    
    // Check if it's a brand filter
    if (['danknddevour', 'recipes', 'sports'].includes(selectedFilter)) {
      return { brand: selectedFilter };
    }
    
    // Otherwise it's a vibe filter
    return { vibe: selectedFilter };
  }, [selectedFilter]);

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Hero Section */}
          <div className="lg:col-span-2 relative bg-dark-surface rounded-lg overflow-hidden border border-neon-green/30 p-8 md:p-10">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2300ff00' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              {/* LIVE Badge */}
              <div className="inline-block mb-4">
                <span className="bg-neon-green text-black px-3 py-1 text-xs font-bold uppercase">
                  LIVE
                </span>
              </div>
              
              {/* Main Heading */}
              <h1 className="text-neon-green font-black text-4xl md:text-5xl mb-4 uppercase">
                LIVE ODDS ARE HOT
              </h1>
              
              {/* Subheading */}
              <p className="text-white text-xl mb-8">
                Make Your Play Today.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link
                  href="/sports"
                  className="bg-neon-green text-black px-6 py-3 font-bold rounded-lg hover:bg-neon-green-dark transition-colors duration-200 text-center"
                >
                  VIEW NOW
                </Link>
                <Link
                  href="/sports"
                  className="border-2 border-white text-white px-6 py-3 font-bold rounded-lg hover:bg-white/10 transition-colors duration-200 text-center"
                >
                  LEARN MORE
                </Link>
              </div>
              
              {/* Carousel Indicators */}
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:col-span-1">
            <h2 className="text-white font-bold text-2xl mb-4 uppercase">ENVETIER</h2>
            <div className="text-white text-sm leading-relaxed space-y-4">
              <p>
                Characteristic aroma and flavor profile. Formal traditions - See great on the exterior areas. 
                Exquisite interiors create a perfect balance. Born into the art of design, expert vision brings 
                the beautiful extended design that the and is key we validated stunning. The statistics. 
                Blend assignments into: exquisite through an exquisite or to escape.
              </p>
              <p>
                By belonging, those are the obvious features. Great design also on the strong foundation: 
                What makes the- extract the- beautiful extended design that the and is key we validated stunning.
              </p>
            </div>
          </div>
        </div>

        {/* TOP PICKS Section */}
        <div className="mb-12">
          <div className="border-t-2 border-neon-green mb-6"></div>
          <h2 className="text-neon-green font-bold text-2xl mb-6 uppercase">TOP PICKS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="relative bg-dark-surface rounded-lg overflow-hidden border border-gray-800 hover:border-neon-green/50 transition-all duration-200 min-h-[200px]">
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-neon-green text-xs font-bold uppercase">TOP PICK</span>
                  </div>
                  <p className="text-white font-semibold">Card {num}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Network Strip */}
        <NetworkStrip />

        {/* Filters */}
        <div className="py-6">
          <FilterChips selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
        </div>

        {/* Video Feed */}
        <div className="pb-12">
          <VideoFeed filter={filter} />
        </div>
      </div>
    </div>
  );
}

