'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Place } from '@/types/place';

export default function MunchieMapCarousel() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const response = await fetch('/api/places');
        const data = await response.json();
        // Limit to 10 places for the carousel
        const limitedPlaces = (data.places || []).slice(0, 10);
        setPlaces(limitedPlaces);
      } catch (error) {
        console.error('[MunchieMapCarousel] Failed to fetch places:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, []);

  // Auto-rotate carousel every 4 seconds
  useEffect(() => {
    if (places.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % places.length);
    }, 4000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [places.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Reset auto-rotate timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % places.length);
    }, 4000);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-neon-green font-bold text-2xl uppercase">Munchie Map</h2>
        </div>
        <div className="bg-dark-surface rounded-lg border border-gray-800 p-12 text-center">
          <div className="text-neon-green text-lg mb-4 font-bold uppercase">Loading Places...</div>
          <div className="w-12 h-12 border-4 border-neon-green border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-neon-green font-bold text-2xl uppercase">Munchie Map</h2>
          <Link
            href="/munchie-map"
            className="text-white hover:text-neon-green text-sm font-semibold flex items-center gap-2 transition-colors"
          >
            Explore Map
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="bg-dark-surface rounded-lg border border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-lg">No places available at the moment.</p>
        </div>
      </div>
    );
  }

  const currentPlace = places[currentIndex];
  const isFeatured = currentPlace.is_featured;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-neon-green font-bold text-2xl uppercase">Munchie Map</h2>
        <Link
          href="/munchie-map"
          className="text-white hover:text-neon-green text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          Explore Map
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map Screenshot */}
        <div className="relative aspect-video bg-dark-surface rounded-lg border border-gray-800 overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            {/* Placeholder for map screenshot - you can replace this with an actual image */}
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🗺️</div>
              <p className="text-gray-400 text-sm">Interactive Munchie Map</p>
              <p className="text-gray-500 text-xs mt-2">Discover Michigan&apos;s best food spots</p>
            </div>
            {/* Uncomment below when you have a map screenshot */}
            {/* <Image
              src="/images/munchie-map-screenshot.png"
              alt="Munchie Map"
              fill
              className="object-cover"
            /> */}
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="bg-dark-surface rounded-lg border-2 overflow-hidden transition-all duration-300"
            style={{
              borderColor: isFeatured ? '#ff6b35' : 'rgba(34, 197, 94, 0.3)',
              boxShadow: isFeatured ? '0 0 20px rgba(255, 107, 53, 0.3)' : 'none'
            }}
          >
            {currentPlace && (
              <div className="p-6">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                    {currentPlace.hero_image_url ? (
                      <img
                        src={currentPlace.hero_image_url}
                        alt={currentPlace.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-600 text-2xl">📍</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-lg line-clamp-1 mb-1 ${isFeatured ? 'text-orange-400' : 'text-white'}`}>
                          {currentPlace.name}
                        </h3>
                        {/* Show type */}
                        {(currentPlace.tags?.includes('Dispensary') || currentPlace.cuisines?.includes('Cannabis')) ? (
                          <span className={`text-xs uppercase font-semibold ${isFeatured ? 'text-orange-300' : 'text-neon-green'}`}>
                            Dispensary
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 uppercase font-semibold">Restaurant</span>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {currentPlace.is_verified && (
                          <span className="bg-neon-green text-black px-2 py-1 rounded text-xs font-bold">
                            ✓
                          </span>
                        )}
                        {currentPlace.is_featured && (
                          <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-bold">
                            ★
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 mb-3">
                      {currentPlace.address && (
                        <p className="text-gray-400 text-sm line-clamp-1">{currentPlace.address}</p>
                      )}
                      <p className="text-gray-400 text-sm">
                        {currentPlace.city}
                        {currentPlace.state && `, ${currentPlace.state}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap mb-4">
                      {currentPlace.rating && (
                        <div className="flex items-center gap-1">
                          <span className="text-neon-green text-sm">⭐</span>
                          <span className="text-white text-sm font-semibold">{currentPlace.rating.toFixed(1)}</span>
                        </div>
                      )}
                      {currentPlace.cuisines && currentPlace.cuisines.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap">
                          {currentPlace.cuisines.slice(0, 2).map((cuisine, idx) => (
                            <span
                              key={idx}
                              className={`text-xs px-2 py-1 rounded uppercase font-semibold ${
                                isFeatured 
                                  ? 'bg-orange-500/20 text-orange-300' 
                                  : 'bg-neon-green/20 text-neon-green'
                              }`}
                            >
                              {cuisine}
                            </span>
                          ))}
                          {currentPlace.cuisines.length > 2 && (
                            <span className="text-gray-500 text-xs">+{currentPlace.cuisines.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {currentPlace.slug && (
                        <Link
                          href={`/place/${currentPlace.slug}`}
                          className={`text-sm px-4 py-2 rounded font-bold hover:opacity-90 transition-opacity uppercase ${
                            isFeatured
                              ? 'bg-orange-500 text-white'
                              : 'bg-neon-green text-black'
                          }`}
                        >
                          View Details
                        </Link>
                      )}
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${currentPlace.name} ${currentPlace.address || ''} ${currentPlace.city || ''}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`text-sm border px-4 py-2 rounded font-bold hover:bg-opacity-10 transition-colors uppercase ${
                          isFeatured
                            ? 'border-orange-500/50 text-orange-400 hover:bg-orange-500/10'
                            : 'border-neon-green/50 text-neon-green hover:bg-neon-green/10'
                        }`}
                      >
                        Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Carousel Indicators */}
          {places.length > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {places.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? isFeatured
                        ? 'bg-orange-500 w-8'
                        : 'bg-neon-green w-8'
                      : 'bg-gray-700 w-2 hover:bg-gray-600'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

