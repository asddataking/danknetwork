'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Place } from '@/types/place';

export default function MunchieMapCarousel() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlaces() {
      try {
        const response = await fetch('/api/places');
        const data = await response.json();
        // Show more places in a grid layout (6-9 places)
        const limitedPlaces = (data.places || []).slice(0, 9);
        setPlaces(limitedPlaces);
      } catch (error) {
        console.error('[MunchieMapCarousel] Failed to fetch places:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaces();
  }, []);

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

      {/* Places Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map((place) => {
          const isFeatured = place.is_featured;
          return (
            <div
              key={place.id}
              className={`bg-dark-surface rounded-lg border-2 overflow-hidden transition-all duration-200 hover:border-neon-green/60 ${
                isFeatured
                  ? 'border-orange-500/50 shadow-lg shadow-orange-500/20'
                  : 'border-neon-green/30'
              }`}
            >
              <div className="p-4">
                <div className="flex gap-3 mb-3">
                  {/* Image */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-900 border border-gray-800">
                    {place.hero_image_url ? (
                      <img
                        src={place.hero_image_url}
                        alt={place.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-600 text-lg">📍</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-bold text-base line-clamp-1 mb-0.5 ${isFeatured ? 'text-orange-400' : 'text-white'}`}>
                          {place.name}
                        </h3>
                        {/* Show type */}
                        {(place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis')) ? (
                          <span className={`text-xs uppercase font-semibold ${isFeatured ? 'text-orange-300' : 'text-neon-green'}`}>
                            Dispensary
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 uppercase font-semibold">Restaurant</span>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {place.is_verified && (
                          <span className="bg-neon-green text-black px-1.5 py-0.5 rounded text-xs font-bold">
                            ✓
                          </span>
                        )}
                        {place.is_featured && (
                          <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                            ★
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 mb-3">
                  {place.address && (
                    <p className="text-gray-400 text-xs line-clamp-1">{place.address}</p>
                  )}
                  <p className="text-gray-400 text-xs">
                    {place.city}
                    {place.state && `, ${place.state}`}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  {place.rating && (
                    <div className="flex items-center gap-0.5">
                      <span className="text-neon-green text-xs">⭐</span>
                      <span className="text-white text-xs font-semibold">{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {place.cuisines && place.cuisines.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {place.cuisines.slice(0, 1).map((cuisine, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-1.5 py-0.5 rounded uppercase font-semibold ${
                            isFeatured 
                              ? 'bg-orange-500/20 text-orange-300' 
                              : 'bg-neon-green/20 text-neon-green'
                          }`}
                        >
                          {cuisine}
                        </span>
                      ))}
                      {place.cuisines.length > 1 && (
                        <span className="text-gray-500 text-xs">+{place.cuisines.length - 1}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {place.slug && (
                    <Link
                      href={`/place/${place.slug}`}
                      className={`text-xs px-3 py-1.5 rounded font-bold hover:opacity-90 transition-opacity uppercase flex-1 text-center ${
                        isFeatured
                          ? 'bg-orange-500 text-white'
                          : 'bg-neon-green text-black'
                      }`}
                    >
                      View
                    </Link>
                  )}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${place.name} ${place.address || ''} ${place.city || ''}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-xs border px-3 py-1.5 rounded font-bold hover:bg-opacity-10 transition-colors uppercase ${
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
          );
        })}
      </div>
    </div>
  );
}

