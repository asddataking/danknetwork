'use client';

import { Place } from '@/types/place';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

interface PlaceDetailProps {
  place: Place;
}

export default function PlaceDetail({ place }: PlaceDetailProps) {
  const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
  const [loadingNearby, setLoadingNearby] = useState(true);

  useEffect(() => {
    // Fetch nearby places
    const fetchNearbyPlaces = async () => {
      if (!place.latitude || !place.longitude) {
        setLoadingNearby(false);
        return;
      }

      try {
        // Create a bounding box around the current place (roughly 10km radius)
        const radius = 0.1; // ~10km in degrees
        const minLng = place.longitude - radius;
        const maxLng = place.longitude + radius;
        const minLat = place.latitude - radius;
        const maxLat = place.latitude + radius;

        const response = await fetch(
          `/api/places?bbox=${minLng},${minLat},${maxLng},${maxLat}`
        );

        if (response.ok) {
          const data = await response.json();
          // Filter out the current place and limit to 6 nearby places
          const nearby = (data.places || [])
            .filter((p: Place) => p.id !== place.id && p.slug)
            .slice(0, 6);
          setNearbyPlaces(nearby);
        }
      } catch (error) {
        console.error('Error fetching nearby places:', error);
      } finally {
        setLoadingNearby(false);
      }
    };

    fetchNearbyPlaces();
  }, [place]);

  if (!place) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-neon-green text-2xl mb-4">Place not found</h1>
          <Link
            href="/munchie-map"
            className="bg-neon-green text-black px-6 py-3 rounded-lg font-bold uppercase hover:bg-neon-green-dark transition-colors"
          >
            Back to Map
          </Link>
        </div>
      </div>
    );
  }

  const isDispensary = place.tags?.includes('Dispensary') || place.cuisines?.includes('Cannabis');
  const placeType = isDispensary ? 'Dispensary' : 'Restaurant';

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section with Header Actions */}
      <div className="relative h-64 md:h-96 bg-dark-surface">
        {place.hero_image_url ? (
          <img
            src={place.hero_image_url}
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <span className="text-gray-600 text-6xl">📍</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Header Actions */}
        <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 flex items-center justify-between gap-3">
          <Link
            href="/munchie-map"
            className="bg-black/50 hover:bg-black/70 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold uppercase transition-colors flex items-center gap-2 text-xs sm:text-sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Back to Map</span>
            <span className="sm:hidden">Back</span>
          </Link>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${place.name || ''} ${place.address || ''} ${place.city || ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black/50 hover:bg-black/70 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-bold uppercase transition-colors flex items-center gap-2 text-xs sm:text-sm"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="hidden sm:inline">Directions</span>
            <span className="sm:hidden">Dir</span>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Place Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Place Header Card */}
            <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Place Image */}
                {place.hero_image_url ? (
                  <img
                    src={place.hero_image_url}
                    alt={place.name}
                    className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-full sm:w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-600 text-4xl">📍</span>
                  </div>
                )}

                {/* Place Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-neon-green font-black text-2xl sm:text-3xl uppercase">
                      {place.name || 'Unnamed Place'}
                    </h1>
                  </div>

                  {/* Rating & Price */}
                  <div className="flex items-center gap-4 mb-3 flex-wrap">
                    {place.rating && (
                      <div className="flex items-center gap-2">
                        <span className="text-neon-green text-lg">⭐</span>
                        <span className="text-white text-lg font-bold">{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                    {place.price_level && (
                      <div className="flex items-center gap-1">
                        <span className="text-neon-green font-bold text-lg">
                          {'$'.repeat(place.price_level)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {place.is_featured && (
                      <span className="bg-orange-500 text-white px-3 py-1 rounded text-xs font-bold uppercase">
                        Featured
                      </span>
                    )}
                    {place.is_verified && (
                      <span className="bg-neon-green text-black px-3 py-1 rounded text-xs font-bold uppercase">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-gray-400 text-sm">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      {place.address && (
                        <p className="text-white">{place.address}</p>
                      )}
                      <p>
                        {place.city || ''}
                        {place.city && place.state && ', '}
                        {place.state || ''}
                        {place.county && `, ${place.county} County`}
                        {place.zip && ` ${place.zip}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Cuisines */}
              {place.cuisines && place.cuisines.length > 0 && (
                <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4">
                  <h3 className="text-neon-green font-bold text-lg uppercase mb-3">Cuisines</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.cuisines.map((cuisine, idx) => (
                      <span
                        key={idx}
                        className="bg-neon-green/20 text-neon-green px-3 py-1 rounded uppercase text-sm font-semibold"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {place.tags && place.tags.length > 0 && (
                <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4">
                  <h3 className="text-neon-green font-bold text-lg uppercase mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {place.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-semibold"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hours */}
            {place.hours && Object.keys(place.hours).length > 0 && (
              <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-neon-green font-bold text-lg uppercase">Hours</h3>
                </div>
                <div className="space-y-1">
                  {Object.entries(place.hours).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex justify-between text-white">
                      <span className="font-semibold capitalize">{day}</span>
                      <span>{hours || 'Closed'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Actions */}
            <div className="flex gap-3 flex-wrap">
              {place.phone && (
                <a
                  href={`tel:${place.phone}`}
                  className="bg-dark-surface border-2 border-neon-green text-neon-green px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold hover:bg-neon-green/10 transition-colors uppercase text-sm sm:text-base flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {place.phone}
                </a>
              )}
              {place.website && (
                <a
                  href={place.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-dark-surface border-2 border-neon-green text-neon-green px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-bold hover:bg-neon-green/10 transition-colors uppercase text-sm sm:text-base flex items-center gap-2"
                >
                  <span>Website</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Right Column - Map, DankPass, Nearby Places */}
          <div className="lg:col-span-1 space-y-8">
            {/* Location Map */}
            {place.latitude && place.longitude && (
              <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-5 h-5 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h3 className="text-neon-green font-bold text-lg uppercase">Location</h3>
                </div>
                <div className="h-64 rounded-lg overflow-hidden bg-gray-900">
                  <MapView
                    places={[place]}
                    selectedPlace={place}
                    onPlaceSelect={() => {}}
                  />
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${place.name || ''} ${place.address || ''} ${place.city || ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full bg-neon-green text-black px-4 py-2 rounded-lg font-bold hover:bg-neon-green-dark transition-colors uppercase text-center text-sm"
                >
                  Get Directions
                </a>
              </div>
            )}

            {/* DankPass Section */}
            <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎟️</span>
                </div>
                <h3 className="text-neon-green font-bold text-lg uppercase mb-2">
                  Earn points. Unlock perks.
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Join DankPass and start earning rewards for every visit and interaction.
                </p>
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2 bg-neon-green text-black px-6 py-3 rounded-lg font-bold hover:bg-neon-green-dark transition-colors uppercase text-sm"
                >
                  Join DankPass
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Nearby Places */}
            {nearbyPlaces.length > 0 && (
              <div className="bg-dark-surface rounded-lg border border-neon-green/20 p-4">
                <h3 className="text-neon-green font-bold text-lg uppercase mb-4">Nearby Places</h3>
                <div className="space-y-4">
                  {nearbyPlaces.map((nearbyPlace) => (
                    <Link
                      key={nearbyPlace.id}
                      href={`/place/${nearbyPlace.slug}`}
                      className="block bg-black/50 rounded-lg p-3 hover:bg-black/70 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        {nearbyPlace.hero_image_url ? (
                          <img
                            src={nearbyPlace.hero_image_url}
                            alt={nearbyPlace.name}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 text-xl">📍</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-white font-bold text-sm uppercase truncate">
                              {nearbyPlace.name}
                            </h4>
                            {nearbyPlace.is_verified && (
                              <span className="bg-neon-green text-black px-2 py-0.5 rounded text-xs font-bold uppercase flex-shrink-0">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs truncate">
                            {nearbyPlace.city || ''}
                            {nearbyPlace.city && nearbyPlace.state && ', '}
                            {nearbyPlace.state || ''}
                            {nearbyPlace.county && `, ${nearbyPlace.county}`}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            {nearbyPlace.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-neon-green text-xs">⭐</span>
                                <span className="text-white text-xs font-bold">{nearbyPlace.rating.toFixed(1)}</span>
                              </div>
                            )}
                            {nearbyPlace.price_level && (
                              <span className="text-neon-green text-xs font-bold">
                                {'$'.repeat(nearbyPlace.price_level)}
                              </span>
                            )}
                            {nearbyPlace.cuisines && nearbyPlace.cuisines.length > 0 && (
                              <span className="text-gray-500 text-xs truncate">
                                {nearbyPlace.cuisines[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
